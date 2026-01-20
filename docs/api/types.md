# TypeScript API 文档

TransLink I18n 提供完整的 TypeScript 类型定义，确保类型安全和优秀的开发体验。

## 📦 类型导入

```typescript
// CLI 类型
import type {
  I18nConfig,
  ExtractConfig,
  HashConfig,
  LanguageConfig,
  OutputConfig,
  VikaConfig,
  ExtractionResult,
  ExtractionContext,
} from '@translink/i18n-cli';

// Runtime 类型
import type {
  I18nEngine,
  I18nOptions,
  TranslationResource,
  TranslationOptions,
  CacheOptions,
  LoaderOptions,
  InterpolationOptions,
} from '@translink/i18n-runtime';

// Vite Plugin 类型
import type {
  I18nPluginOptions,
  ResolvedI18nPluginOptions,
  TransformContext,
  LanguageModule,
} from '@translink/vite-plugin-i18n';
```

## 🏗️ Core Types

### CLI Types

#### I18nConfig

主配置接口，定义了 CLI 工具的完整配置。

```typescript
interface I18nConfig {
  /** 文本提取配置 */
  extract: ExtractConfig;
  /** 哈希生成配置 */
  hash: HashConfig;
  /** 语言配置 */
  languages: LanguageConfig;
  /** 输出配置 */
  output: OutputConfig;
  /** Vika 云端配置（可选） */
  vika?: VikaConfig;
  /** 插件配置（可选） */
  plugins?: PluginConfig[];
}
```

#### ExtractConfig

文本提取相关配置。

```typescript
interface ExtractConfig {
  /** 文件匹配模式 */
  patterns: string[];
  /** 排除模式 */
  exclude: string[];
  /** 翻译函数名称列表 */
  functions: string[];
  /** 支持的文件扩展名 */
  extensions: string[];
}
```

#### HashConfig

哈希生成配置。

```typescript
interface HashConfig {
  /** 哈希算法 */
  algorithm: HashAlgorithm;
  /** 哈希长度 */
  length: number;
  /** 是否包含上下文信息 */
  includeContext: boolean;
  /** 上下文字段列表 */
  contextFields: ContextField[];
}

type HashAlgorithm = 'md5' | 'sha1' | 'sha256';

type ContextField = 'filePath' | 'componentName' | 'functionName';
```

#### LanguageConfig

语言相关配置。

```typescript
interface LanguageConfig {
  /** 默认语言 */
  default: string;
  /** 支持的语言列表 */
  supported: string[];
  /** 回退语言 */
  fallback: string;
}
```

#### OutputConfig

输出相关配置。

```typescript
interface OutputConfig {
  /** 输出目录 */
  directory: string;
  /** 输出格式 */
  format: OutputFormat;
  /** 是否按命名空间分割文件 */
  splitByNamespace: boolean;
  /** 是否扁平化键名 */
  flattenKeys: boolean;
}

type OutputFormat = 'json' | 'js' | 'ts' | 'yaml';
```

#### VikaConfig

Vika 云端同步配置。

```typescript
interface VikaConfig {
  /** API 密钥 */
  apiKey: string;
  /** 数据表 ID */
  datasheetId: string;
  /** 是否自动同步 */
  autoSync: boolean;
  /** 同步间隔（毫秒） */
  syncInterval: number;
}
```

#### ExtractionResult

文本提取结果。

```typescript
interface ExtractionResult {
  /** 提取的原始文本 */
  text: string;
  /** 生成的哈希键 */
  key: string;
  /** 文件路径 */
  filePath: string;
  /** 行号 */
  line: number;
  /** 列号 */
  column: number;
  /** 提取上下文 */
  context?: ExtractionContext;
}
```

#### ExtractionContext

提取上下文信息。

```typescript
interface ExtractionContext {
  /** 文件路径 */
  filePath?: string;
  /** 组件名称 */
  componentName?: string;
  /** 函数名称 */
  functionName?: string;
  /** 其他自定义上下文 */
  [key: string]: any;
}
```

### Runtime Types

#### I18nOptions

i18n 引擎配置选项。

```typescript
interface I18nOptions {
  /** 默认语言 */
  defaultLanguage: string;
  /** 回退语言 */
  fallbackLanguage?: string;
  /** 初始翻译资源 */
  resources?: Record<string, TranslationResource>;
  /** 缓存配置 */
  cache?: CacheOptions;
  /** 加载器配置 */
  loader?: LoaderOptions;
  /** 插值配置 */
  interpolation?: InterpolationOptions;
}
```

#### TranslationResource

翻译资源类型。

```typescript
type TranslationResource = Record<string, any>;

// 示例结构
interface ExampleTranslationResource {
  common: {
    greeting: string;
    farewell: string;
  };
  errors: {
    notFound: string;
    serverError: string;
  };
  [namespace: string]: Record<string, any>;
}
```

#### TranslationOptions

翻译选项。

```typescript
interface TranslationOptions {
  /** 默认值（当翻译不存在时使用） */
  defaultValue?: string;
  /** 计数（用于复数形式） */
  count?: number;
  /** 上下文（用于上下文相关翻译） */
  context?: string;
  /** 命名空间 */
  ns?: string;
  /** 是否返回对象（用于嵌套翻译） */
  returnObjects?: boolean;
}
```

#### CacheOptions

缓存配置选项。

```typescript
interface CacheOptions {
  /** 是否启用缓存 */
  enabled: boolean;
  /** 最大缓存条目数 */
  maxSize: number;
  /** 缓存生存时间（毫秒） */
  ttl: number;
  /** 存储类型 */
  storage?: CacheStorageType;
}

type CacheStorageType = 'memory' | 'localStorage' | 'sessionStorage';
```

#### LoaderOptions

资源加载器配置。

```typescript
interface LoaderOptions {
  /** 加载路径模板 */
  loadPath?: string;
  /** 自定义加载函数 */
  loadFunction?: LoadFunction;
  /** 预加载语言列表 */
  preload?: string[];
  /** 是否启用懒加载 */
  lazy?: boolean;
  /** 加载超时时间（毫秒） */
  timeout?: number;
}

type LoadFunction = (
  language: string,
  namespace: string
) => Promise<TranslationResource>;
```

#### InterpolationOptions

插值配置选项。

```typescript
interface InterpolationOptions {
  /** 插值前缀 */
  prefix?: string;
  /** 插值后缀 */
  suffix?: string;
  /** 转义函数 */
  escape?: EscapeFunction;
  /** 格式化器映射 */
  formatters?: Record<string, FormatterFunction>;
  /** 是否跳过插值处理 */
  skipOnVariables?: boolean;
}

type EscapeFunction = (value: any) => string;
type FormatterFunction = (value: any, options?: any) => string;
```

### Vite Plugin Types

#### I18nPluginOptions

Vite 插件配置选项。

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
  /** 是否启用热重载 */
  hotReload?: boolean;
  /** 是否启用懒加载 */
  lazyLoad?: boolean;
  /** 虚拟模块前缀 */
  virtualModulePrefix?: string;
  /** 键生成器函数 */
  keyGenerator?: KeyGeneratorFunction;
  /** 语言文件解析器函数 */
  resolveLanguageFile?: ResolveLanguageFileFunction;
}
```

#### TransformContext

代码转换上下文。

```typescript
interface TransformContext {
  /** 文件路径 */
  filePath: string;
  /** 文件类型 */
  fileType: FileType;
  /** 组件名称 */
  componentName?: string;
  /** 函数名称 */
  functionName?: string;
  /** 行号 */
  line?: number;
  /** 列号 */
  column?: number;
}

type FileType = 'vue' | 'ts' | 'js' | 'tsx' | 'jsx';
```

#### LanguageModule

语言模块接口。

```typescript
interface LanguageModule {
  /** 语言代码 */
  lang: string;
  /** 翻译数据 */
  data: TranslationResource;
  /** 文件路径 */
  filePath: string;
  /** 最后修改时间 */
  lastModified?: number;
}
```

## 🔧 Function Types

### KeyGeneratorFunction

键生成器函数类型。

```typescript
type KeyGeneratorFunction = (
  content: string,
  context?: TransformContext
) => string;

// 示例实现
const customKeyGenerator: KeyGeneratorFunction = (content, context) => {
  const hash = crypto.createHash('md5').update(content).digest('hex');
  const prefix = context?.componentName || 'global';
  return `${prefix}_${hash.slice(0, 8)}`;
};
```

### ResolveLanguageFileFunction

语言文件解析器函数类型。

```typescript
type ResolveLanguageFileFunction = (
  language: string,
  localesDir: string
) => string;

// 示例实现
const customResolver: ResolveLanguageFileFunction = (language, localesDir) => {
  return path.join(localesDir, language, 'index.json');
};
```

### TranslationFunction

翻译函数类型。

```typescript
type TranslationFunction = (
  key: string,
  params?: Record<string, any>,
  options?: TranslationOptions
) => string;

// 在组件中的类型
interface ComponentI18n {
  t: TranslationFunction;
  locale: Ref<string>;
  setLocale: (language: string) => Promise<void>;
}
```

## 🎯 Generic Types

### ResourceMap

资源映射泛型类型。

```typescript
type ResourceMap<T = any> = Record<string, T>;

// 使用示例
interface TypedTranslations {
  common: {
    greeting: string;
    farewell: string;
  };
  errors: {
    notFound: string;
    serverError: string;
  };
}

type TypedResourceMap = ResourceMap<TypedTranslations>;
```

### EventMap

事件映射类型。

```typescript
interface I18nEventMap {
  languageChanged: [language: string];
  languageLoaded: [language: string];
  translationMissing: [key: string, language: string];
  error: [error: Error];
  resourcesAdded: [language: string, resources: TranslationResource];
}

// 类型安全的事件监听
i18n.on<'languageChanged'>('languageChanged', language => {
  // language 的类型是 string
  console.log(`Language changed to: ${language}`);
});
```

## 🔌 Framework Integration Types

### Vue Types

```typescript
// Vue 组合式 API 类型
interface UseI18nReturn {
  t: TranslationFunction;
  locale: Ref<string>;
  setLocale: (language: string) => Promise<void>;
  availableLocales: Ref<string[]>;
}

// Vue 全局属性类型
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: TranslationFunction;
    $tsl: (text: string, params?: Record<string, any>) => string;
  }
}

// Vue 插件选项类型
interface VueI18nPluginOptions extends I18nOptions {
  globalInjection?: boolean;
  legacy?: boolean;
}
```

### React Types

```typescript
// React Hook 返回类型
interface UseTranslationReturn {
  t: TranslationFunction;
  language: string;
  changeLanguage: (language: string) => Promise<void>;
  i18n: I18nEngine;
}

// React Provider Props 类型
interface I18nProviderProps extends I18nOptions {
  children: React.ReactNode;
}

// Trans 组件 Props 类型
interface TransProps {
  i18nKey: string;
  values?: Record<string, any>;
  components?: Record<string, React.ComponentType>;
  defaults?: string;
  ns?: string;
}
```

## 🛠️ Utility Types

### DeepPartial

深度可选类型。

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 使用示例
type PartialI18nConfig = DeepPartial<I18nConfig>;
```

### KeyPath

键路径类型。

```typescript
type KeyPath<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? `${K}` | `${K}.${KeyPath<T[K]>}`
    : `${K}`
  : never;

// 使用示例
type TranslationKeys = KeyPath<TypedTranslations>;
// 结果: "common" | "common.greeting" | "common.farewell" | "errors" | "errors.notFound" | "errors.serverError"
```

### ExtractParams

提取参数类型。

```typescript
type ExtractParams<T extends string> =
  T extends `${infer _Start}{{${infer Param}}}${infer Rest}`
    ? Param | ExtractParams<Rest>
    : never;

// 使用示例
type GreetingParams =
  ExtractParams<'Hello, {{name}}! You have {{count}} messages.'>;
// 结果: "name" | "count"
```

## 📝 Type Guards

### 类型守卫函数

```typescript
// 检查是否为有效的翻译键
function isValidTranslationKey(key: any): key is string {
  return typeof key === 'string' && key.length > 0;
}

// 检查是否为翻译资源
function isTranslationResource(obj: any): obj is TranslationResource {
  return typeof obj === 'object' && obj !== null;
}

// 检查是否为提取结果
function isExtractionResult(obj: any): obj is ExtractionResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.text === 'string' &&
    typeof obj.key === 'string' &&
    typeof obj.filePath === 'string'
  );
}
```

## 🎨 Branded Types

### 品牌类型

```typescript
// 语言代码品牌类型
type LanguageCode = string & { __brand: 'LanguageCode' };

// 翻译键品牌类型
type TranslationKey = string & { __brand: 'TranslationKey' };

// 哈希键品牌类型
type HashKey = string & { __brand: 'HashKey' };

// 类型构造函数
function createLanguageCode(code: string): LanguageCode {
  if (!/^[a-z]{2}-[A-Z]{2}$/.test(code)) {
    throw new Error(`Invalid language code: ${code}`);
  }
  return code as LanguageCode;
}

function createTranslationKey(key: string): TranslationKey {
  if (!key || key.trim().length === 0) {
    throw new Error('Translation key cannot be empty');
  }
  return key as TranslationKey;
}
```

## 🔍 Advanced Types

### 条件类型

```typescript
// 根据配置决定返回类型
type TranslationResult<T extends TranslationOptions> =
  T['returnObjects'] extends true ? Record<string, any> : string;

// 根据缓存配置决定存储类型
type CacheStorage<T extends CacheOptions> = T['storage'] extends 'localStorage'
  ? Storage
  : T['storage'] extends 'sessionStorage'
    ? Storage
    : Map<string, any>;
```

### 映射类型

```typescript
// 将所有属性变为可选并添加默认值
type WithDefaults<T> = {
  [K in keyof T]?: T[K];
} & {
  __defaults: Required<T>;
};

// 提取配置中的所有字符串类型属性
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];
```

## 📚 Type Examples

### 完整的类型化配置

```typescript
import type {
  I18nConfig,
  I18nOptions,
  I18nPluginOptions,
} from '@translink/i18n-cli';

// CLI 配置
const cliConfig: I18nConfig = {
  extract: {
    patterns: ['src/**/*.{vue,ts,js}'],
    exclude: ['node_modules', 'dist'],
    functions: ['t', '$tsl'],
    extensions: ['.vue', '.ts', '.js'],
  },
  hash: {
    algorithm: 'md5',
    length: 8,
    includeContext: false,
    contextFields: [],
  },
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP'],
    fallback: 'en-US',
  },
  output: {
    directory: 'src/locales',
    format: 'json',
    splitByNamespace: false,
    flattenKeys: false,
  },
};

// Runtime 配置
const runtimeConfig: I18nOptions = {
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en-US',
  resources: {
    'zh-CN': { greeting: '你好，{{name}}！' },
    'en-US': { greeting: 'Hello, {{name}}!' },
  },
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000,
  },
};

// Vite 插件配置
const pluginConfig: I18nPluginOptions = {
  localesDir: 'src/locales',
  defaultLanguage: 'zh-CN',
  hotReload: true,
  lazyLoad: true,
  keyGenerator: (content, context) => {
    return `${context?.componentName || 'global'}_${content.slice(0, 8)}`;
  },
};
```

### 类型安全的翻译使用

```typescript
// 定义翻译结构
interface AppTranslations {
  common: {
    greeting: string;
    farewell: string;
    welcome: string;
  };
  user: {
    profile: string;
    settings: string;
    logout: string;
  };
  errors: {
    notFound: string;
    serverError: string;
    networkError: string;
  };
}

// 类型安全的翻译函数
type TypedTranslationFunction = <K extends KeyPath<AppTranslations>>(
  key: K,
  params?: ExtractParams<AppTranslations[K]> extends never
    ? never
    : Record<ExtractParams<AppTranslations[K]>, any>,
  options?: TranslationOptions
) => string;

// 使用示例
const t: TypedTranslationFunction = useI18n().t;

// 类型安全的调用
t('common.greeting'); // ✅ 正确
t('user.profile'); // ✅ 正确
t('invalid.key'); // ❌ 类型错误

// 带参数的调用
t('user.greeting', { name: 'Alice' }); // ✅ 正确（如果 greeting 包含 {{name}}）
```

## 🔗 相关链接

- [CLI API](./cli.md)
- [Runtime API](./runtime.md)
- [Vite Plugin API](./vite-plugin.md)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [类型编程指南](https://github.com/type-challenges/type-challenges)
