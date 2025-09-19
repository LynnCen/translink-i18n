# Vite Plugin API 文档

`@translink/vite-plugin-i18n` 提供了完整的 Vite 构建时 i18n 支持，包括代码转换、热更新、懒加载和构建优化。

## 📦 安装

```bash
npm install --save-dev @translink/vite-plugin-i18n
```

## 🚀 基本使用

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import createI18nPlugin from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    createI18nPlugin({
      localesDir: 'src/locales',
      defaultLanguage: 'zh-CN',
      hotReload: true,
      lazyLoad: true
    })
  ]
});
```

## 🔧 Plugin Configuration

### createI18nPlugin

创建 i18n Vite 插件的主函数。

```typescript
function createI18nPlugin(options?: I18nPluginOptions): Plugin;
```

### I18nPluginOptions

插件配置选项接口。

```typescript
interface I18nPluginOptions {
  /** 配置文件路径 */
  configFile?: string;
  /** 包含的文件模式 */
  include?: string[];
  /** 排除的文件模式 */
  exclude?: string[];
  /** 默认语言 */
  defaultLanguage?: string;
  /** 语言文件目录 */
  localesDir?: string;
  /** 热重载 */
  hotReload?: boolean;
  /** 懒加载 */
  lazyLoad?: boolean;
  /** 虚拟模块前缀 */
  virtualModulePrefix?: string;
  /** 键生成器 */
  keyGenerator?: KeyGeneratorFunction;
  /** 语言文件解析器 */
  resolveLanguageFile?: ResolveLanguageFileFunction;
}
```

#### KeyGeneratorFunction

键生成器函数类型。

```typescript
type KeyGeneratorFunction = (content: string, context?: TransformContext) => string;
```

#### ResolveLanguageFileFunction

语言文件解析器函数类型。

```typescript
type ResolveLanguageFileFunction = (language: string, localesDir: string) => string;
```

#### TransformContext

转换上下文接口。

```typescript
interface TransformContext {
  /** 文件路径 */
  filePath: string;
  /** 文件类型 */
  fileType: 'vue' | 'ts' | 'js' | 'tsx' | 'jsx';
  /** 组件名称 */
  componentName?: string;
  /** 函数名称 */
  functionName?: string;
}
```

### 配置示例

#### 基础配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import createI18nPlugin from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    createI18nPlugin({
      localesDir: 'src/locales',
      defaultLanguage: 'zh-CN'
    })
  ]
});
```

#### 高级配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import createI18nPlugin from '@translink/vite-plugin-i18n';
import crypto from 'crypto';

export default defineConfig({
  plugins: [
    createI18nPlugin({
      configFile: './i18n.config.ts',
      include: ['src/**/*.{vue,ts,js,tsx,jsx}'],
      exclude: ['node_modules', 'dist', '**/*.test.*'],
      defaultLanguage: 'zh-CN',
      localesDir: 'src/locales',
      hotReload: true,
      lazyLoad: true,
      virtualModulePrefix: 'virtual:i18n-language-',
      keyGenerator: (content, context) => {
        // 自定义键生成逻辑
        const hash = crypto.createHash('md5').update(content).digest('hex');
        return context?.componentName 
          ? `${context.componentName}_${hash.slice(0, 8)}`
          : hash.slice(0, 8);
      },
      resolveLanguageFile: (language, localesDir) => {
        // 自定义语言文件路径解析
        return `${localesDir}/${language}/index.json`;
      }
    })
  ]
});
```

## 🏗️ Core Classes

### I18nTransformer

代码转换器，负责将 `$tsl()` 和 `t()` 调用转换为哈希键。

```typescript
class I18nTransformer {
  constructor(
    options: ResolvedI18nPluginOptions,
    config: ResolvedConfig
  );

  /** 转换代码 */
  transform(code: string, id: string): Promise<TransformResult | null>;

  /** 检查是否需要转换 */
  shouldTransform(id: string): boolean;
}
```

#### TransformResult

```typescript
interface TransformResult {
  /** 转换后的代码 */
  code: string;
  /** Source Map */
  map?: SourceMap | null;
}
```

#### 转换示例

```typescript
// 转换前
const message = $tsl('欢迎使用 TransLink I18n');
const greeting = t('你好，{{name}}！', { name: 'World' });

// 转换后 (开发模式)
const message = t('hash_12345678', undefined, { defaultValue: '欢迎使用 TransLink I18n' });
const greeting = t('hash_87654321', { name: 'World' }, { defaultValue: '你好，{{name}}！' });

// 转换后 (生产模式)
const message = t('hash_12345678');
const greeting = t('hash_87654321', { name: 'World' });
```

### LanguageLoader

语言资源加载器，处理虚拟模块和动态导入。

```typescript
class LanguageLoader {
  constructor(
    options: ResolvedI18nPluginOptions,
    config: ResolvedConfig
  );

  /** 检查是否为虚拟模块 */
  isVirtualModule(id: string): boolean;

  /** 从虚拟模块 ID 获取语言 */
  getLanguageFromVirtualModuleId(id: string): string | null;

  /** 加载语言模块 */
  loadLanguageModule(language: string): Promise<LanguageModule | null>;

  /** 获取所有可用语言 */
  getAvailableLanguages(): Promise<string[]>;
}
```

#### LanguageModule

```typescript
interface LanguageModule {
  /** 语言代码 */
  lang: string;
  /** 翻译数据 */
  data: Record<string, any>;
  /** 文件路径 */
  filePath: string;
}
```

#### 虚拟模块示例

```typescript
// 在代码中导入虚拟模块
import zhCN from 'virtual:i18n-language-zh-CN';
import enUS from 'virtual:i18n-language-en-US';

// 虚拟模块内容 (由插件生成)
// virtual:i18n-language-zh-CN
export default {
  "hash_12345678": "欢迎使用 TransLink I18n",
  "hash_87654321": "你好，{{name}}！"
};
```

### HMRHandler

热模块替换处理器，提供开发时的实时更新。

```typescript
class HMRHandler {
  constructor(
    options: ResolvedI18nPluginOptions,
    config: ResolvedConfig,
    languageLoader: LanguageLoader
  );

  /** 配置开发服务器 */
  configureServer(server: ViteDevServer): void;

  /** 处理热更新 */
  handleHotUpdate(ctx: HmrContext): Promise<void>;

  /** 发送更新通知 */
  sendUpdate(server: ViteDevServer, updates: HMRUpdate[]): void;
}
```

#### HMRUpdate

```typescript
interface HMRUpdate {
  /** 更新类型 */
  type: 'js-update' | 'css-update' | 'full-reload';
  /** 模块路径 */
  path: string;
  /** 接受路径 */
  acceptedPath: string;
  /** 时间戳 */
  timestamp?: number;
}
```

#### HMR 工作流程

1. **文件监听**: 监听语言文件变化
2. **变更检测**: 检测具体的变更内容
3. **模块失效**: 使相关虚拟模块失效
4. **通知客户端**: 发送 HMR 更新消息
5. **模块重载**: 客户端重新加载相关模块

### ConfigManager

配置管理器，处理插件配置的解析和验证。

```typescript
class ConfigManager {
  constructor(
    root: string,
    options: I18nPluginOptions
  );

  /** 解析配置选项 */
  resolveOptions(): Promise<ResolvedI18nPluginOptions>;

  /** 检查是否应该转换文件 */
  shouldTransform(id: string): boolean;

  /** 获取语言文件路径 */
  getLanguageFilePath(language: string): string;
}
```

#### ResolvedI18nPluginOptions

```typescript
interface ResolvedI18nPluginOptions extends Required<I18nPluginOptions> {
  /** 解析后的包含模式 */
  resolvedInclude: RegExp[];
  /** 解析后的排除模式 */
  resolvedExclude: RegExp[];
  /** 绝对路径的语言文件目录 */
  absoluteLocalesDir: string;
}
```

## 🚀 Plugin Hooks

### configResolved

配置解析完成时调用。

```typescript
configResolved(config: ResolvedConfig): Promise<void>
```

### configureServer

配置开发服务器时调用。

```typescript
configureServer(server: ViteDevServer): void
```

### transform

转换代码时调用。

```typescript
transform(code: string, id: string): Promise<TransformResult | null>
```

### resolveId

解析模块 ID 时调用。

```typescript
resolveId(id: string): string | null
```

### load

加载模块时调用。

```typescript
load(id: string): Promise<string | null>
```

### handleHotUpdate

处理热更新时调用。

```typescript
handleHotUpdate(ctx: HmrContext): Promise<void>
```

### outputOptions

输出选项配置时调用。

```typescript
outputOptions(options: OutputOptions): OutputOptions
```

## 🔥 Hot Module Replacement

### 客户端集成

```typescript
// 在应用中启用 HMR
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 处理模块更新
    console.log('I18n module updated');
  });
}
```

### 自定义 HMR 处理

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import createI18nPlugin from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    createI18nPlugin({
      hotReload: true,
      // 自定义 HMR 处理
      onHotUpdate: (updates, server) => {
        console.log('I18n files updated:', updates);
        // 自定义更新逻辑
      }
    })
  ]
});
```

## 📦 Build Optimization

### 代码分割

插件自动将语言文件分割为独立的 chunk。

```typescript
// 构建输出
dist/
├── assets/
│   ├── main.js
│   ├── i18n-language-zh-CN.js
│   ├── i18n-language-en-US.js
│   └── i18n-language-ja-JP.js
└── index.html
```

### Tree Shaking

未使用的翻译键会被自动移除。

```typescript
// 只有实际使用的翻译会被包含在最终构建中
const usedTranslations = {
  "hash_12345678": "欢迎使用 TransLink I18n",
  // 未使用的翻译会被移除
};
```

### 压缩优化

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    createI18nPlugin({
      // 生产模式下的优化选项
      minify: true,
      removeUnusedKeys: true,
      compressTranslations: true
    })
  ],
  build: {
    rollupOptions: {
      output: {
        // 自定义 chunk 命名
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name?.startsWith('i18n-language-')) {
            return 'locales/[name].[hash].js';
          }
          return 'assets/[name].[hash].js';
        }
      }
    }
  }
});
```

## 🧪 Testing

### 测试配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import createI18nPlugin from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    createI18nPlugin({
      // 测试环境配置
      localesDir: 'src/locales',
      defaultLanguage: 'zh-CN',
      hotReload: false // 测试时禁用 HMR
    })
  ],
  test: {
    environment: 'jsdom'
  }
});
```

### 模拟虚拟模块

```typescript
// 在测试中模拟虚拟模块
vi.mock('virtual:i18n-language-zh-CN', () => ({
  default: {
    'hash_12345678': '测试翻译'
  }
}));
```

## 🔍 Debugging

### 调试选项

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    createI18nPlugin({
      debug: true, // 启用调试模式
      logLevel: 'verbose', // 详细日志
      // 调试回调
      onTransform: (code, id, result) => {
        console.log(`Transformed ${id}:`, result);
      }
    })
  ]
});
```

### 日志输出

```bash
# 插件调试信息
[@translink/vite-plugin-i18n] Resolved options: {...}
[@translink/vite-plugin-i18n] Transforming: src/App.vue
[@translink/vite-plugin-i18n] Generated key: hash_12345678 for "欢迎使用"
[@translink/vite-plugin-i18n] HMR update: virtual:i18n-language-zh-CN
```

## 📊 Performance

### 性能监控

```typescript
// 启用性能监控
createI18nPlugin({
  performance: {
    enabled: true,
    logSlowTransforms: true,
    threshold: 100 // 记录超过 100ms 的转换
  }
});
```

### 优化建议

1. **合理设置 include/exclude**: 避免处理不必要的文件
2. **启用缓存**: 加速重复构建
3. **使用懒加载**: 减少初始包大小
4. **优化语言文件**: 移除未使用的翻译

## 🔗 Integration Examples

### Vue 3 集成

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import createI18nPlugin from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    vue(),
    createI18nPlugin({
      localesDir: 'src/locales',
      defaultLanguage: 'zh-CN',
      include: ['src/**/*.vue', 'src/**/*.ts']
    })
  ]
});
```

### React 集成

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import createI18nPlugin from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    react(),
    createI18nPlugin({
      localesDir: 'src/locales',
      defaultLanguage: 'zh-CN',
      include: ['src/**/*.{tsx,jsx,ts,js}']
    })
  ]
});
```

### TypeScript 集成

```typescript
// 类型声明
declare module 'virtual:i18n-language-*' {
  const translations: Record<string, string>;
  export default translations;
}

// 使用
import type { I18nPluginOptions } from '@translink/vite-plugin-i18n';

const pluginOptions: I18nPluginOptions = {
  localesDir: 'src/locales',
  defaultLanguage: 'zh-CN'
};
```

## 🔗 相关链接

- [CLI API](./cli.md)
- [Runtime API](./runtime.md)
- [TypeScript 类型定义](./typescript.md)
- [Vite 官方文档](https://vitejs.dev/)
- [插件开发指南](https://vitejs.dev/guide/api-plugin.html)
