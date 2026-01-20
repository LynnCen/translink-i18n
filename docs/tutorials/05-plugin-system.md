# 教程 5：插件系统设计

## 📚 本章目标

学习如何设计和实现可扩展的插件系统,支持第三方翻译管理平台集成。

**学完本章,你将掌握**:

- 插件接口设计原则
- 插件生命周期管理
- 插件加载和注册机制
- Vika 插件实现案例

**预计时间**: 2-3 小时

---

## 1. 插件系统架构

### 设计目标

1. **可扩展性** - 支持第三方插件
2. **松耦合** - 核心与插件解耦
3. **类型安全** - 完整的 TypeScript 支持
4. **生命周期** - 规范的初始化和清理

### 插件接口设计

**plugins/types.ts**:

```typescript
export interface I18nPlugin {
  // 元数据
  metadata: PluginMetadata;

  // 生命周期
  init?(context: PluginContext, config: PluginConfig): Promise<void> | void;
  cleanup?(): Promise<void> | void;

  // 核心功能
  push?(data: PushTranslationsData): Promise<PushResult>;
  pull?(data: PullTranslationsData): Promise<PullResult>;

  // 统计分析
  getStats?(): Promise<TranslationStats>;
  testConnection?(): Promise<boolean>;

  // CLI 命令扩展
  registerCommands?(program: Command): void;
}

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  homepage?: string;
}

export interface PluginContext {
  logger: Logger;
  config: I18nConfig;
  cwd: string;
}
```

---

## 2. 插件加载器

### PluginLoader 实现

**plugins/loader.ts**:

```typescript
export class PluginLoader {
  private plugins: Map<string, I18nPlugin> = new Map();
  private context: PluginContext | null = null;

  /**
   * 加载单个插件
   */
  async loadPlugin(
    pluginName: string,
    pluginConfig?: PluginConfig
  ): Promise<I18nPlugin> {
    // 1. 解析插件路径
    const pluginPath = this.resolvePluginPath(pluginName);

    // 2. 动态导入插件
    const pluginModule = await import(pluginPath);
    const plugin: I18nPlugin = pluginModule.default || pluginModule;

    // 3. 验证插件接口
    this.validatePlugin(plugin);

    // 4. 初始化插件
    if (plugin.init && this.context) {
      await plugin.init(this.context, pluginConfig || {});
    }

    // 5. 注册插件
    this.plugins.set(plugin.metadata.name, plugin);

    logger.success(`✓ 插件已加载: ${plugin.metadata.name}`);

    return plugin;
  }

  /**
   * 解析插件路径
   */
  private resolvePluginPath(pluginName: string): string {
    // 1. 本地文件路径
    if (pluginName.startsWith('.') || pluginName.startsWith('/')) {
      return resolve(process.cwd(), pluginName);
    }

    // 2. npm 包名
    if (pluginName.startsWith('@translink/')) {
      return pluginName;
    }

    // 3. 简写形式
    return `@translink/i18n-plugin-${pluginName}`;
  }

  /**
   * 验证插件接口
   */
  private validatePlugin(plugin: any): void {
    if (!plugin.metadata) {
      throw new Error('插件缺少 metadata');
    }

    if (!plugin.metadata.name) {
      throw new Error('插件缺少 name');
    }

    if (!plugin.metadata.version) {
      throw new Error('插件缺少 version');
    }
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): I18nPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 卸载插件
   */
  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);

    if (plugin && plugin.cleanup) {
      await plugin.cleanup();
    }

    this.plugins.delete(name);
  }
}
```

---

## 3. 插件管理器

### PluginManager 实现

**plugins/manager.ts**:

```typescript
export class PluginManager {
  private loader: PluginLoader;
  private context: PluginContext | null = null;

  constructor() {
    this.loader = new PluginLoader();
  }

  /**
   * 初始化插件系统
   */
  async initialize(
    context: PluginContext,
    pluginConfigs: Array<string | [string, PluginConfig]>
  ): Promise<void> {
    this.context = context;
    this.loader.setContext(context);

    // 加载所有插件
    for (const config of pluginConfigs) {
      const [name, options] = Array.isArray(config) ? config : [config, {}];

      try {
        await this.loader.loadPlugin(name, options);
      } catch (error) {
        logger.error(`插件加载失败: ${name}`);
        logger.error(error.message);
      }
    }
  }

  /**
   * 推送翻译
   */
  async push(
    pluginName: string,
    data: PushTranslationsData
  ): Promise<PushResult> {
    const plugin = this.loader.getPlugin(pluginName);

    if (!plugin) {
      throw new Error(`插件未找到: ${pluginName}`);
    }

    if (!plugin.push) {
      throw new Error(`插件 ${pluginName} 不支持 push 操作`);
    }

    return await plugin.push(data);
  }

  /**
   * 拉取翻译
   */
  async pull(
    pluginName: string,
    data: PullTranslationsData
  ): Promise<PullResult> {
    const plugin = this.loader.getPlugin(pluginName);

    if (!plugin) {
      throw new Error(`插件未找到: ${pluginName}`);
    }

    if (!plugin.pull) {
      throw new Error(`插件 ${pluginName} 不支持 pull 操作`);
    }

    return await plugin.pull(data);
  }

  /**
   * 注册插件命令
   */
  registerPluginCommands(program: Command): void {
    for (const plugin of this.loader.getAllPlugins().values()) {
      if (plugin.registerCommands) {
        plugin.registerCommands(program);
      }
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    await this.loader.unloadAll();
  }
}
```

---

## 4. Vika 插件实现

### 插件结构

```
@translink/i18n-plugin-vika/
├── src/
│   ├── index.ts          # 插件入口
│   ├── vika-client.ts    # Vika API 客户端
│   └── types.ts          # 类型定义
├── package.json
└── README.md
```

### 插件实现

**src/index.ts**:

```typescript
import type { I18nPlugin } from '@translink/i18n-cli/plugins/types';
import { VikaClient } from './vika-client.js';
import type { VikaConfig } from './types.js';

const VikaPlugin: I18nPlugin = {
  metadata: {
    name: 'vika',
    version: '1.0.0',
    description: 'Vika 云端翻译管理插件',
    author: 'lynncen',
  },

  // 私有变量
  privateClient: null as VikaClient | null,
  privateConfig: null as VikaConfig | null,

  /**
   * 初始化
   */
  async init(context, config) {
    this.privateConfig = config as VikaConfig;

    // 验证配置
    if (!this.privateConfig.apiKey) {
      throw new Error('缺少 Vika API Key');
    }

    if (!this.privateConfig.datasheetId) {
      throw new Error('缺少 Vika Datasheet ID');
    }

    // 创建客户端
    this.privateClient = new VikaClient(
      this.privateConfig.apiKey,
      this.privateConfig.datasheetId
    );

    // 测试连接
    const isConnected = await this.privateClient.testConnection();
    if (!isConnected) {
      context.logger.warn('Vika 连接失败');
    }
  },

  /**
   * 推送翻译
   */
  async push(data) {
    if (!this.privateClient) {
      throw new Error('Vika 客户端未初始化');
    }

    const result = await this.privateClient.pushTranslations({
      translations: data.translations,
      languages: data.languages,
      sourceLanguage: data.sourceLanguage,
    });

    return {
      success: result.success,
      pushed: result.created + result.updated,
      skipped: result.skipped,
      errors: result.errors,
    };
  },

  /**
   * 拉取翻译
   */
  async pull(data) {
    if (!this.privateClient) {
      throw new Error('Vika 客户端未初始化');
    }

    const result = await this.privateClient.pullTranslations({
      languages: data.languages,
      status: data.status,
    });

    return {
      success: true,
      translations: result.records,
      total: result.total,
    };
  },

  /**
   * 获取统计
   */
  async getStats() {
    if (!this.privateClient) {
      throw new Error('Vika 客户端未初始化');
    }

    return await this.privateClient.getTranslationStats();
  },

  /**
   * 测试连接
   */
  async testConnection() {
    if (!this.privateClient) {
      return false;
    }

    return await this.privateClient.testConnection();
  },

  /**
   * 注册命令
   */
  registerCommands(program) {
    // push 命令
    program
      .command('vika:push')
      .description('推送翻译到 Vika')
      .action(async () => {
        // 命令实现
      });

    // pull 命令
    program
      .command('vika:pull')
      .description('从 Vika 拉取翻译')
      .action(async () => {
        // 命令实现
      });
  },
};

export default VikaPlugin;
```

---

## 5. 插件配置

### 在 CLI 中使用插件

**translink.config.ts**:

```typescript
export default {
  // ... 其他配置

  plugins: [
    // 使用 npm 包
    '@translink/i18n-plugin-vika',
    {
      apiKey: process.env.VIKA_API_KEY,
      datasheetId: process.env.VIKA_DATASHEET_ID,
    }],

    // 使用本地插件
    [
      './my-plugin.ts',
      {
        // 插件配置
      },
    ],
  ],
};
```

---

## 6. 插件开发最佳实践

### 1. 类型安全

```typescript
// 导出完整的类型定义
export interface MyPluginConfig extends PluginConfig {
  apiKey: string;
  endpoint?: string;
}

export const MyPlugin: I18nPlugin = {
  // 实现
};
```

### 2. 错误处理

```typescript
async push(data) {
  try {
    // 推送逻辑
    return { success: true, pushed: data.length };
  } catch (error) {
    logger.error(`推送失败: ${error.message}`);
    return {
      success: false,
      pushed: 0,
      errors: [error.message],
    };
  }
}
```

### 3. 配置验证

```typescript
async init(context, config) {
  // 验证必需配置
  const required = ['apiKey', 'projectId'];
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`缺少配置: ${key}`);
    }
  }
}
```

---

## 7. 小结

本章学习了:

✅ **插件接口设计** - 生命周期、核心功能  
✅ **插件加载** - 路径解析、动态导入  
✅ **插件管理** - 注册、调用、清理  
✅ **Vika 插件** - 完整实现案例  
✅ **最佳实践** - 类型安全、错误处理

### 下一步

👉 [教程 6：构建与优化](./06-build-optimization.md)

---

## 📚 扩展阅读

- [插件开发指南](../guides/plugin-development.md)
- [Vika 插件文档](../../../packages/plugins/vika/README.md)
