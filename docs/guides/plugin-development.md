# TransLink I18n 插件开发指南

> 本指南将教你如何为 TransLink I18n 开发自定义插件，扩展翻译管理功能。

---

## 📖 目录

- [插件系统概述](#插件系统概述)
- [快速开始](#快速开始)
- [插件接口详解](#插件接口详解)
- [开发示例](#开发示例)
- [最佳实践](#最佳实践)
- [调试与测试](#调试与测试)
- [发布插件](#发布插件)

---

## 插件系统概述

### 什么是插件？

TransLink I18n 的插件系统允许你扩展 CLI 工具的功能，特别是翻译数据的导入导出。插件可以：

- 连接到不同的翻译管理平台（如 Vika、Crowdin、Lokalise 等）
- 实现自定义的翻译同步逻辑
- 添加新的 CLI 命令
- 扩展翻译数据的处理方式

### 为什么需要插件？

- **解耦设计**: CLI 核心保持简洁，复杂功能通过插件实现
- **按需安装**: 只安装需要的插件，减小包体积
- **易于扩展**: 开发者可以创建自己的插件满足特定需求
- **社区生态**: 促进社区贡献，丰富工具生态

---

## 快速开始

### 最小化插件示例

创建一个最简单的插件：

```typescript
// my-plugin.ts
import type { I18nPlugin } from '@translink/i18n-cli/plugins';

const MyPlugin: I18nPlugin = {
  metadata: {
    name: 'my-plugin',
    version: '1.0.0',
    description: '我的第一个 TransLink I18n 插件',
    author: 'your-name',
  },
};

export default MyPlugin;
```

### 使用插件

在 `i18n.config.ts` 中配置：

```typescript
export default {
  // ... 其他配置
  plugins: [
    './my-plugin.ts',  // 本地插件
    // 或
    '@my-org/translink-plugin-xxx',  // npm 包
  ],
};
```

---

## 插件接口详解

### I18nPlugin 接口

```typescript
interface I18nPlugin {
  // 必需：插件元数据
  metadata: PluginMetadata;

  // 可选：初始化方法
  init?(context: PluginContext, config: PluginConfig): Promise<void> | void;

  // 可选：推送翻译
  push?(data: PushTranslationsData): Promise<PushResult>;

  // 可选：拉取翻译
  pull?(data: PullTranslationsData): Promise<PullResult>;

  // 可选：获取统计信息
  getStats?(): Promise<TranslationStats>;

  // 可选：测试连接
  testConnection?(): Promise<boolean>;

  // 可选：注册 CLI 命令
  registerCommands?(program: Command): void;

  // 可选：清理资源
  cleanup?(): Promise<void> | void;
}
```

### PluginMetadata - 元数据

```typescript
interface PluginMetadata {
  name: string;           // 插件名称
  version: string;        // 版本号
  description: string;    // 描述
  author: string;         // 作者
  homepage?: string;      // 主页 URL
}
```

### PluginContext - 上下文

插件初始化时会接收到上下文对象：

```typescript
interface PluginContext {
  config: any;           // 全局配置
  logger: Logger;        // 日志工具
  cwd: string;           // 当前工作目录
}
```

### PushTranslationsData - 推送数据

```typescript
interface PushTranslationsData {
  translations: Record<string, string>;  // key-value 翻译映射
  language: string;                      // 语言代码
  context: Record<string, TranslationItem>;  // 上下文信息
}

interface TranslationItem {
  text: string;        // 原文本
  file: string;        // 文件路径
  line: number;        // 行号
  column?: number;     // 列号
  context?: string;    // 上下文
}
```

### PushResult - 推送结果

```typescript
interface PushResult {
  success: boolean;              // 是否成功
  message: string;               // 消息
  count?: number;                // 推送的翻译数量
  errors?: Array<{               // 错误列表
    key: string;
    message: string;
  }>;
}
```

### PullTranslationsData - 拉取数据

```typescript
interface PullTranslationsData {
  language: string;                      // 要拉取的语言
  context: Record<string, TranslationItem>;  // 上下文信息
}
```

### PullResult - 拉取结果

```typescript
interface PullResult {
  success: boolean;                      // 是否成功
  message: string;                       // 消息
  translations: Record<string, string>;  // 拉取到的翻译
  count: number;                         // 拉取的翻译数量
  errors?: Array<{                       // 错误列表
    key: string;
    message: string;
  }>;
}
```

### TranslationStats - 统计信息

```typescript
interface TranslationStats {
  total: number;          // 总数
  translated: number;     // 已翻译
  pending: number;        // 待翻译
  reviewed?: number;      // 已审核
  languages?: string[];   // 支持的语言
}
```

---

## 开发示例

### 示例 1：基础的推送/拉取插件

实现一个简单的文件存储插件：

```typescript
import type { I18nPlugin, PluginContext, PushTranslationsData, PullTranslationsData } from '@translink/i18n-cli/plugins';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface FileStorageConfig {
  storageDir: string;  // 存储目录
}

const FileStoragePlugin: I18nPlugin = {
  metadata: {
    name: 'file-storage',
    version: '1.0.0',
    description: '基于文件系统的翻译存储插件',
    author: 'your-name',
  },

  // 私有属性（不是接口的一部分）
  _config: null as FileStorageConfig | null,
  _context: null as PluginContext | null,

  // 初始化
  async init(context, config) {
    this._context = context;
    this._config = config as FileStorageConfig;
    
    context.logger.info(`文件存储插件初始化: ${this._config.storageDir}`);
  },

  // 推送翻译
  async push(data) {
    if (!this._config) {
      return {
        success: false,
        message: '插件未初始化',
        count: 0,
      };
    }

    try {
      const filePath = resolve(this._config.storageDir, `${data.language}.json`);
      
      // 读取现有翻译
      let existing = {};
      if (existsSync(filePath)) {
        existing = JSON.parse(readFileSync(filePath, 'utf-8'));
      }

      // 合并翻译
      const merged = { ...existing, ...data.translations };

      // 写入文件
      writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');

      return {
        success: true,
        message: `成功推送 ${Object.keys(data.translations).length} 条翻译`,
        count: Object.keys(data.translations).length,
      };
    } catch (error) {
      return {
        success: false,
        message: `推送失败: ${error.message}`,
        count: 0,
      };
    }
  },

  // 拉取翻译
  async pull(data) {
    if (!this._config) {
      return {
        success: false,
        message: '插件未初始化',
        translations: {},
        count: 0,
      };
    }

    try {
      const filePath = resolve(this._config.storageDir, `${data.language}.json`);

      if (!existsSync(filePath)) {
        return {
          success: false,
          message: `文件不存在: ${filePath}`,
          translations: {},
          count: 0,
        };
      }

      const translations = JSON.parse(readFileSync(filePath, 'utf-8'));

      return {
        success: true,
        message: `成功拉取 ${Object.keys(translations).length} 条翻译`,
        translations,
        count: Object.keys(translations).length,
      };
    } catch (error) {
      return {
        success: false,
        message: `拉取失败: ${error.message}`,
        translations: {},
        count: 0,
      };
    }
  },

  // 获取统计信息
  async getStats() {
    if (!this._config) {
      return {
        total: 0,
        translated: 0,
        pending: 0,
      };
    }

    const languages = ['zh-CN', 'en-US', 'ja-JP'];  // 示例
    let total = 0;
    let translated = 0;

    for (const lang of languages) {
      const filePath = resolve(this._config.storageDir, `${lang}.json`);
      if (existsSync(filePath)) {
        const data = JSON.parse(readFileSync(filePath, 'utf-8'));
        const count = Object.keys(data).length;
        total = Math.max(total, count);
        if (lang !== 'zh-CN') {
          translated += count;
        }
      }
    }

    return {
      total,
      translated,
      pending: total * (languages.length - 1) - translated,
    };
  },

  // 测试连接（对于文件系统，检查目录是否存在）
  async testConnection() {
    if (!this._config) return false;
    return existsSync(this._config.storageDir);
  },
};

export default FileStoragePlugin;
```

使用此插件：

```typescript
// i18n.config.ts
export default {
  plugins: [
    [
      './file-storage-plugin.ts',
      {
        storageDir: './translations',
      },
    ],
  ],
};
```

### 示例 2：添加自定义 CLI 命令

创建一个添加自定义命令的插件：

```typescript
import type { I18nPlugin } from '@translink/i18n-cli/plugins';
import type { Command } from 'commander';

const CustomCommandPlugin: I18nPlugin = {
  metadata: {
    name: 'custom-commands',
    version: '1.0.0',
    description: '添加自定义 CLI 命令的插件',
    author: 'your-name',
  },

  registerCommands(program: Command) {
    // 添加自定义命令
    program
      .command('validate')
      .description('验证翻译文件的完整性')
      .option('-l, --language <lang>', '指定语言')
      .action(async (options) => {
        console.log('执行验证...', options);
        // 实现验证逻辑
      });

    program
      .command('sync')
      .description('同步所有语言的翻译')
      .action(async () => {
        console.log('同步翻译...');
        // 实现同步逻辑
      });
  },
};

export default CustomCommandPlugin;
```

### 示例 3：与第三方 API 集成

创建一个与翻译 API 集成的插件：

```typescript
import type { I18nPlugin, PushTranslationsData } from '@translink/i18n-cli/plugins';
import axios from 'axios';

interface TranslationAPIConfig {
  apiKey: string;
  endpoint: string;
}

const TranslationAPIPlugin: I18nPlugin = {
  metadata: {
    name: 'translation-api',
    version: '1.0.0',
    description: '与翻译 API 集成的插件',
    author: 'your-name',
  },

  _config: null as TranslationAPIConfig | null,
  _client: null as any,

  async init(context, config) {
    this._config = config as TranslationAPIConfig;
    
    // 创建 HTTP 客户端
    this._client = axios.create({
      baseURL: this._config.endpoint,
      headers: {
        'Authorization': `Bearer ${this._config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    context.logger.info('翻译 API 插件初始化成功');
  },

  async push(data: PushTranslationsData) {
    if (!this._client) {
      return {
        success: false,
        message: '插件未初始化',
        count: 0,
      };
    }

    try {
      // 将翻译推送到 API
      const response = await this._client.post('/translations', {
        language: data.language,
        translations: data.translations,
        context: data.context,
      });

      return {
        success: true,
        message: '推送成功',
        count: Object.keys(data.translations).length,
      };
    } catch (error) {
      return {
        success: false,
        message: `API 错误: ${error.message}`,
        count: 0,
        errors: [{ key: 'api_error', message: error.message }],
      };
    }
  },

  async testConnection() {
    if (!this._client) return false;

    try {
      await this._client.get('/health');
      return true;
    } catch {
      return false;
    }
  },
};

export default TranslationAPIPlugin;
```

---

## 最佳实践

### 1. 错误处理

始终捕获和处理错误，返回有意义的错误信息：

```typescript
async push(data) {
  try {
    // 推送逻辑
    return {
      success: true,
      message: '推送成功',
      count: data.translations.length,
    };
  } catch (error) {
    // 记录详细错误
    this._context?.logger.error(`推送失败: ${error.message}`);
    
    return {
      success: false,
      message: `推送失败: ${error.message}`,
      count: 0,
      errors: [{
        key: 'push_error',
        message: error.message,
      }],
    };
  }
}
```

### 2. 日志记录

充分利用提供的 logger：

```typescript
async init(context, config) {
  context.logger.info('初始化插件...');
  context.logger.debug(`配置: ${JSON.stringify(config)}`);
  
  try {
    // 初始化逻辑
    context.logger.success('插件初始化成功');
  } catch (error) {
    context.logger.error(`初始化失败: ${error.message}`);
    throw error;
  }
}
```

### 3. 配置验证

在 init 方法中验证配置：

```typescript
async init(context, config) {
  const requiredFields = ['apiKey', 'endpoint'];
  
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`缺少必需的配置字段: ${field}`);
    }
  }
  
  this._config = config;
}
```

### 4. 类型安全

使用 TypeScript 确保类型安全：

```typescript
interface MyPluginConfig {
  apiKey: string;
  endpoint: string;
  timeout?: number;
}

const MyPlugin: I18nPlugin = {
  // ...
  
  async init(context, config) {
    const typedConfig = config as MyPluginConfig;
    // 现在 typedConfig 有完整的类型提示
  },
};
```

### 5. 资源清理

实现 cleanup 方法清理资源：

```typescript
async cleanup() {
  // 关闭连接
  if (this._client) {
    await this._client.close();
  }
  
  // 清理临时文件
  // 取消定时任务
  // 等等
}
```

---

## 调试与测试

### 本地开发

1. **使用相对路径引用本地插件**:

```typescript
// i18n.config.ts
export default {
  plugins: [
    './my-plugin.ts',  // 开发时使用本地路径
  ],
};
```

2. **添加调试日志**:

```typescript
async push(data) {
  console.log('[DEBUG] Push data:', JSON.stringify(data, null, 2));
  
  // 插件逻辑
  
  console.log('[DEBUG] Push result:', result);
  return result;
}
```

3. **使用 CLI 的 --verbose 选项**:

```bash
npx translink push --verbose
```

### 单元测试

为插件编写测试：

```typescript
// my-plugin.test.ts
import { describe, it, expect, vi } from 'vitest';
import MyPlugin from './my-plugin';

describe('MyPlugin', () => {
  it('should initialize correctly', async () => {
    const mockContext = {
      config: {},
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      },
      cwd: '/test',
    };

    const config = {
      apiKey: 'test-key',
      endpoint: 'https://api.test.com',
    };

    await expect(
      MyPlugin.init(mockContext, config)
    ).resolves.not.toThrow();
  });

  it('should push translations', async () => {
    // ... 测试推送逻辑
  });

  it('should handle errors gracefully', async () => {
    // ... 测试错误处理
  });
});
```

---

## 发布插件

### 1. 创建 npm 包

```json
// package.json
{
  "name": "@your-org/translink-plugin-xxx",
  "version": "1.0.0",
  "description": "Your plugin description",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "keywords": [
    "translink",
    "i18n",
    "plugin"
  ],
  "peerDependencies": {
    "@translink/i18n-cli": "^1.0.0"
  }
}
```

### 2. 添加 README

```markdown
# @your-org/translink-plugin-xxx

Your plugin description.

## Installation

\`\`\`bash
npm install -D @your-org/translink-plugin-xxx
\`\`\`

## Usage

\`\`\`typescript
// i18n.config.ts
export default {
  plugins: [
    [
      '@your-org/translink-plugin-xxx',
      {
        // 配置选项
      },
    ],
  ],
};
\`\`\`

## Configuration

...
```

### 3. 发布

```bash
# 构建
npm run build

# 发布
npm publish --access public
```

---

## 参考资源

- [Vika 插件源码](../../packages/plugins/vika) - 官方插件实现参考
- [插件类型定义](../../packages/cli/src/plugins/types.ts) - 完整的类型定义
- [CLI API 文档](./api/cli.md) - CLI 工具 API 参考

---

## 常见问题

### Q: 插件可以访问文件系统吗？

A: 可以。插件运行在 Node.js 环境中，可以使用所有 Node.js API。

### Q: 如何在插件中使用环境变量？

A: 直接使用 `process.env`:

```typescript
const apiKey = process.env.MY_PLUGIN_API_KEY || config.apiKey;
```

### Q: 插件可以依赖其他 npm 包吗？

A: 可以。在插件的 `package.json` 中声明依赖即可。

### Q: 如何调试插件？

A: 使用 `console.log` 或 `context.logger` 输出调试信息，配合 CLI 的 `--verbose` 选项。

---

**完成时间**: 2026-01-07  
**更新记录**: 初始版本

