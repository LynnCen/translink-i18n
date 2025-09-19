# CLI API 文档

> TransLink I18n CLI 工具的完整 API 参考文档

## 📋 概述

TransLink I18n CLI 提供了一套完整的命令行工具，用于管理国际化项目的文本提取、语言文件生成、云端同步等功能。

## 🚀 安装

```bash
# 全局安装
npm install -g @translink/i18n-cli

# 项目安装
npm install --save-dev @translink/i18n-cli
```

## 📖 命令参考

### `translink init`

初始化 i18n 项目配置。

#### 语法
```bash
translink init [options]
```

#### 选项
| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--config` | `string` | `i18n.config.ts` | 配置文件路径 |
| `--template` | `string` | `default` | 配置模板类型 |
| `--force` | `boolean` | `false` | 强制覆盖已存在的配置 |

#### 示例
```bash
# 使用默认配置初始化
translink init

# 指定配置文件路径
translink init --config ./config/i18n.config.ts

# 使用 Vue 模板
translink init --template vue

# 强制覆盖现有配置
translink init --force
```

#### 配置模板

**default** - 通用配置
```typescript
export default {
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  loadPath: './locales/{{lng}}.json'
};
```

**vue** - Vue 项目配置
```typescript
export default {
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  loadPath: './src/locales/{{lng}}.json',
  extractRules: {
    vue: {
      patterns: [
        /\$tsl\(['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]\)/g,
        /t\(['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]\)/g
      ]
    }
  }
};
```

---

### `translink extract`

从源代码中提取需要翻译的文本。

#### 语法
```bash
translink extract [source] [options]
```

#### 参数
| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `source` | `string` | `src` | 源代码目录 |

#### 选项
| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--output, -o` | `string` | `locales` | 输出目录 |
| `--config, -c` | `string` | `i18n.config.ts` | 配置文件路径 |
| `--include` | `string[]` | `['**/*.{vue,ts,js,tsx,jsx}']` | 包含的文件模式 |
| `--exclude` | `string[]` | `['node_modules/**']` | 排除的文件模式 |
| `--merge` | `boolean` | `true` | 是否合并已存在的翻译 |
| `--report` | `boolean` | `false` | 生成提取报告 |
| `--dry-run` | `boolean` | `false` | 预览模式，不写入文件 |

#### 示例
```bash
# 基础提取
translink extract

# 指定源目录和输出目录
translink extract src --output dist/locales

# 只处理 Vue 文件
translink extract --include "**/*.vue"

# 排除测试文件
translink extract --exclude "**/*.test.*" "**/*.spec.*"

# 生成详细报告
translink extract --report

# 预览提取结果
translink extract --dry-run
```

#### 提取规则配置

```typescript
// i18n.config.ts
export default {
  extractRules: {
    vue: {
      patterns: [
        // $tsl 函数调用
        /\$tsl\(['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]\)/g,
        // t 函数调用
        /t\(['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]\)/g
      ],
      // 自定义提取器
      customExtractor: (content: string, filePath: string) => {
        // 返回提取的文本数组
        return [];
      }
    },
    typescript: {
      patterns: [
        /i18n\.t\(['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]\)/g
      ]
    }
  }
};
```

---

### `translink build`

构建最终的语言文件。

#### 语法
```bash
translink build [options]
```

#### 选项
| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--input, -i` | `string` | `locales` | 输入目录 |
| `--output, -o` | `string` | `dist/locales` | 输出目录 |
| `--format` | `string` | `json` | 输出格式 |
| `--minify` | `boolean` | `false` | 压缩输出 |
| `--split` | `boolean` | `false` | 按命名空间分割 |
| `--hash` | `boolean` | `false` | 生成文件哈希 |

#### 示例
```bash
# 基础构建
translink build

# 压缩输出
translink build --minify

# 按命名空间分割
translink build --split

# 生成多种格式
translink build --format json,js,ts
```

#### 输出格式

**json** - 标准 JSON 格式
```json
{
  "welcome": "欢迎使用",
  "user": {
    "profile": "用户资料"
  }
}
```

**js** - JavaScript 模块
```javascript
export default {
  "welcome": "欢迎使用",
  "user": {
    "profile": "用户资料"
  }
};
```

**ts** - TypeScript 模块
```typescript
const translations: Record<string, any> = {
  "welcome": "欢迎使用",
  "user": {
    "profile": "用户资料"
  }
};

export default translations;
```

---

### `translink push`

推送本地翻译到云端。

#### 语法
```bash
translink push [options]
```

#### 选项
| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--source, -s` | `string` | `locales` | 本地翻译目录 |
| `--language, -l` | `string[]` | `all` | 推送的语言 |
| `--force` | `boolean` | `false` | 强制覆盖云端翻译 |
| `--dry-run` | `boolean` | `false` | 预览推送内容 |

#### 示例
```bash
# 推送所有语言
translink push

# 推送特定语言
translink push --language zh-CN en-US

# 强制覆盖
translink push --force

# 预览推送内容
translink push --dry-run
```

---

### `translink pull`

从云端拉取翻译到本地。

#### 语法
```bash
translink pull [options]
```

#### 选项
| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--output, -o` | `string` | `locales` | 输出目录 |
| `--language, -l` | `string[]` | `all` | 拉取的语言 |
| `--merge` | `boolean` | `true` | 合并本地翻译 |
| `--backup` | `boolean` | `true` | 备份本地文件 |

#### 示例
```bash
# 拉取所有语言
translink pull

# 拉取特定语言
translink pull --language zh-CN en-US

# 不合并本地翻译
translink pull --no-merge

# 不备份本地文件
translink pull --no-backup
```

---

### `translink analyze`

分析翻译完整性和质量。

#### 语法
```bash
translink analyze [options]
```

#### 选项
| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--source, -s` | `string` | `locales` | 翻译文件目录 |
| `--report, -r` | `string` | `console` | 报告输出格式 |
| `--threshold` | `number` | `80` | 完整性阈值 |

#### 示例
```bash
# 基础分析
translink analyze

# 生成 HTML 报告
translink analyze --report html

# 设置完整性阈值
translink analyze --threshold 90
```

#### 分析报告

```bash
📊 翻译分析报告
├── 总体统计
│   ├── 支持语言: 3 (zh-CN, en-US, ja-JP)
│   ├── 翻译键数: 156
│   └── 平均完整性: 87.3%
├── 语言详情
│   ├── zh-CN: 100% (156/156) ✅
│   ├── en-US: 89.1% (139/156) ⚠️
│   └── ja-JP: 72.4% (113/156) ❌
├── 缺失翻译
│   ├── en-US: 17 个缺失
│   └── ja-JP: 43 个缺失
└── 建议
    ├── 优先翻译高频使用的键
    └── 考虑使用机器翻译作为初始版本
```

## 🔧 配置文件

### 完整配置示例

```typescript
// i18n.config.ts
import type { I18nConfig } from '@translink/i18n-cli';

const config: I18nConfig = {
  // 基础配置
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US', 'ja-JP'],
  
  // 文件路径
  loadPath: './src/locales/{{lng}}.json',
  
  // 提取规则
  extractRules: {
    vue: {
      patterns: [
        /\$tsl\(['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]\)/g,
        /t\(['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]\)/g
      ],
      customExtractor: (content, filePath) => {
        // 自定义提取逻辑
        return [];
      }
    }
  },
  
  // 云端配置
  cloud: {
    provider: 'vika',
    apiKey: process.env.VIKA_API_KEY,
    spaceId: process.env.VIKA_SPACE_ID,
    datasheetId: process.env.VIKA_DATASHEET_ID
  },
  
  // 构建配置
  build: {
    outputFormats: ['json', 'js'],
    minify: true,
    splitByNamespace: false,
    generateTypes: true
  },
  
  // 哈希配置
  hash: {
    algorithm: 'md5',
    length: 8,
    includeContext: true
  }
};

export default config;
```

### 配置类型定义

```typescript
interface I18nConfig {
  // 基础配置
  defaultLanguage: string;
  fallbackLanguage?: string;
  supportedLanguages: string[];
  loadPath: string;
  
  // 提取配置
  extractRules?: {
    [fileType: string]: {
      patterns: RegExp[];
      customExtractor?: (content: string, filePath: string) => string[];
    };
  };
  
  // 云端配置
  cloud?: {
    provider: 'vika' | 'custom';
    apiKey: string;
    spaceId?: string;
    datasheetId?: string;
    customEndpoint?: string;
  };
  
  // 构建配置
  build?: {
    outputFormats: ('json' | 'js' | 'ts')[];
    minify: boolean;
    splitByNamespace: boolean;
    generateTypes: boolean;
  };
  
  // 哈希配置
  hash?: {
    algorithm: 'md5' | 'sha1' | 'sha256';
    length: number;
    includeContext: boolean;
  };
}
```

## 🔌 插件系统

### 自定义提取器

```typescript
// plugins/custom-extractor.ts
import type { ExtractorPlugin } from '@translink/i18n-cli';

export const customExtractor: ExtractorPlugin = {
  name: 'custom-extractor',
  fileTypes: ['vue', 'ts'],
  
  extract(content: string, filePath: string) {
    const results: string[] = [];
    
    // 自定义提取逻辑
    const pattern = /customT\(['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]\)/g;
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      results.push(match[1]);
    }
    
    return results;
  }
};
```

### 自定义云端提供商

```typescript
// plugins/custom-cloud.ts
import type { CloudProvider } from '@translink/i18n-cli';

export const customCloudProvider: CloudProvider = {
  name: 'custom-cloud',
  
  async push(translations: Record<string, any>, options: any) {
    // 实现推送逻辑
  },
  
  async pull(languages: string[], options: any) {
    // 实现拉取逻辑
    return {};
  }
};
```

## 🚨 错误处理

### 常见错误码

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| `E001` | 配置文件不存在 | 运行 `translink init` 创建配置 |
| `E002` | 源目录不存在 | 检查 source 参数路径 |
| `E003` | 云端 API 认证失败 | 检查 API 密钥配置 |
| `E004` | 翻译文件格式错误 | 检查 JSON 文件语法 |
| `E005` | 网络连接失败 | 检查网络连接和代理设置 |

### 调试模式

```bash
# 启用详细日志
DEBUG=translink:* translink extract

# 启用特定模块日志
DEBUG=translink:extractor translink extract

# 保存日志到文件
translink extract --verbose > extract.log 2>&1
```

## 📈 性能优化

### 提取性能优化

```typescript
// i18n.config.ts
export default {
  // 使用更精确的包含模式
  include: ['src/**/*.{vue,ts}'], // 而不是 '**/*'
  
  // 排除不必要的目录
  exclude: [
    'node_modules/**',
    'dist/**',
    '**/*.test.*',
    '**/*.spec.*'
  ],
  
  // 启用缓存
  cache: {
    enabled: true,
    directory: '.translink-cache'
  }
};
```

### 构建性能优化

```bash
# 并行处理多个语言
translink build --parallel

# 增量构建
translink build --incremental

# 使用缓存
translink build --cache
```

---

*本文档涵盖了 TransLink I18n CLI 的所有核心功能和 API。如需更多信息，请参考 [使用指南](../guides/cli-usage.md) 或 [示例项目](../../examples/)。*
