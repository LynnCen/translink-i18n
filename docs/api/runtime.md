# Runtime API 文档

`@translink/i18n-runtime` 提供了完整的运行时国际化解决方案，包括核心引擎、缓存管理、资源加载和框架适配器。

## 📦 安装

```bash
npm install @translink/i18n-runtime
```

## 🚀 基本使用

```typescript
import { I18nEngine } from '@translink/i18n-runtime';

// 创建 i18n 引擎
const i18n = new I18nEngine({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en-US',
  resources: {
    'zh-CN': { greeting: '你好，{{name}}！' },
    'en-US': { greeting: 'Hello, {{name}}!' }
  }
});

// 使用翻译
console.log(i18n.t('greeting', { name: '世界' })); // 输出: 你好，世界！
```

## 🏗️ Core Classes

### I18nEngine

国际化引擎核心类，提供翻译、语言管理和事件系统。

```typescript
class I18nEngine extends EventEmitter {
  constructor(options: I18nOptions);

  // 翻译方法
  t(key: string, params?: Record<string, any>, options?: TranslationOptions): string;
  
  // 语言管理
  getCurrentLanguage(): string;
  changeLanguage(language: string): Promise<void>;
  loadLanguage(language: string, namespace?: string): Promise<void>;
  
  // 资源管理
  addResources(language: string, resources: TranslationResource): void;
  getResources(language: string): TranslationResource | undefined;
  
  // 缓存管理
  clearCache(): void;
  getCacheStats(): CacheStats;
  
  // 事件方法
  on(event: string, listener: Function): this;
  emit(event: string, ...args: any[]): boolean;
}
```

#### I18nOptions

```typescript
interface I18nOptions {
  /** 默认语言 */
  defaultLanguage: string;
  /** 回退语言 */
  fallbackLanguage?: string;
  /** 初始资源 */
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

```typescript
type TranslationResource = Record<string, any>;
```

#### TranslationOptions

```typescript
interface TranslationOptions {
  /** 默认值 */
  defaultValue?: string;
  /** 计数 */
  count?: number;
  /** 上下文 */
  context?: string;
  /** 命名空间 */
  ns?: string;
}
```

#### 示例

```typescript
const i18n = new I18nEngine({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en-US',
  resources: {
    'zh-CN': {
      common: {
        greeting: '你好，{{name}}！',
        welcome: '欢迎使用我们的应用'
      },
      errors: {
        notFound: '页面未找到',
        serverError: '服务器错误'
      }
    },
    'en-US': {
      common: {
        greeting: 'Hello, {{name}}!',
        welcome: 'Welcome to our app'
      },
      errors: {
        notFound: 'Page not found',
        serverError: 'Server error'
      }
    }
  },
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000 // 5分钟
  }
});

// 基本翻译
i18n.t('common.greeting', { name: 'Alice' });

// 带默认值的翻译
i18n.t('unknown.key', {}, { defaultValue: '默认文本' });

// 计数翻译
i18n.t('items', { count: 5 }, { count: 5 });
```

### CacheManager

缓存管理器，提供多级缓存支持。

```typescript
class CacheManager {
  constructor(options: CacheManagerOptions);

  /** 获取缓存值 */
  get(key: string): any;
  
  /** 设置缓存值 */
  set(key: string, value: any, ttl?: number): void;
  
  /** 删除缓存 */
  remove(key: string): void;
  
  /** 清空缓存 */
  clear(): void;
  
  /** 获取缓存统计 */
  getStats(): CacheStats;
}
```

#### CacheManagerOptions

```typescript
interface CacheManagerOptions {
  /** 内存缓存配置 */
  memory?: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
  };
  /** localStorage 缓存配置 */
  localStorage?: {
    enabled: boolean;
    prefix: string;
    ttl: number;
  };
}
```

#### CacheStats

```typescript
interface CacheStats {
  /** 缓存大小 */
  size: number;
  /** 命中次数 */
  hits: number;
  /** 未命中次数 */
  misses: number;
  /** 命中率 */
  hitRate: number;
}
```

#### 示例

```typescript
const cacheManager = new CacheManager({
  memory: {
    enabled: true,
    maxSize: 500,
    ttl: 10 * 60 * 1000 // 10分钟
  },
  localStorage: {
    enabled: true,
    prefix: 'i18n_cache_',
    ttl: 24 * 60 * 60 * 1000 // 24小时
  }
});

// 设置缓存
cacheManager.set('user_preferences', { language: 'zh-CN' });

// 获取缓存
const preferences = cacheManager.get('user_preferences');

// 查看统计
const stats = cacheManager.getStats();
console.log(`缓存命中率: ${(stats.hitRate * 100).toFixed(2)}%`);
```

### ResourceLoader

资源加载器，支持动态加载和懒加载。

```typescript
class ResourceLoader {
  constructor(options: LoaderOptions);

  /** 加载资源 */
  load(language: string, namespace?: string): Promise<TranslationResource>;
  
  /** 预加载资源 */
  preload(languages: string[]): Promise<void>;
  
  /** 检查资源是否已加载 */
  isLoaded(language: string, namespace?: string): boolean;
}
```

#### LoaderOptions

```typescript
interface LoaderOptions {
  /** 加载路径模板 */
  loadPath?: string;
  /** 自定义加载函数 */
  loadFunction?: (language: string, namespace: string) => Promise<TranslationResource>;
  /** 预加载语言 */
  preload?: string[];
  /** 懒加载 */
  lazy?: boolean;
}
```

#### 示例

```typescript
const loader = new ResourceLoader({
  loadPath: '/locales/{{lng}}/{{ns}}.json',
  preload: ['zh-CN', 'en-US'],
  lazy: true
});

// 加载特定语言资源
const zhResources = await loader.load('zh-CN');

// 预加载多个语言
await loader.preload(['ja-JP', 'ko-KR']);
```

### Interpolator

插值处理器，处理翻译文本中的动态内容。

```typescript
class Interpolator {
  constructor(options?: InterpolationOptions);

  /** 插值处理 */
  interpolate(
    text: string, 
    params: Record<string, any>, 
    options?: InterpolationOptions
  ): string;
  
  /** 添加格式化器 */
  addFormatter(name: string, formatter: FormatterFunction): void;
  
  /** 移除格式化器 */
  removeFormatter(name: string): void;
}
```

#### InterpolationOptions

```typescript
interface InterpolationOptions {
  /** 插值前缀 */
  prefix?: string;
  /** 插值后缀 */
  suffix?: string;
  /** 转义函数 */
  escape?: (value: any) => string;
  /** 格式化器 */
  formatters?: Record<string, FormatterFunction>;
}
```

#### FormatterFunction

```typescript
type FormatterFunction = (value: any, options?: any) => string;
```

#### 示例

```typescript
const interpolator = new Interpolator({
  prefix: '{{',
  suffix: '}}',
  formatters: {
    currency: (value: number) => `¥${value.toFixed(2)}`,
    date: (value: Date) => value.toLocaleDateString('zh-CN'),
    upper: (value: string) => value.toUpperCase()
  }
});

// 基本插值
interpolator.interpolate('Hello, {{name}}!', { name: 'World' });
// 输出: Hello, World!

// 使用格式化器
interpolator.interpolate('价格: {{price, currency}}', { price: 99.99 });
// 输出: 价格: ¥99.99

interpolator.interpolate('今天是 {{today, date}}', { today: new Date() });
// 输出: 今天是 2023/12/25
```

### EventEmitter

事件发射器，提供事件系统支持。

```typescript
class EventEmitter {
  /** 添加事件监听器 */
  on(event: string, listener: Function): this;
  
  /** 添加一次性事件监听器 */
  once(event: string, listener: Function): this;
  
  /** 移除事件监听器 */
  off(event: string, listener?: Function): this;
  
  /** 发射事件 */
  emit(event: string, ...args: any[]): boolean;
  
  /** 获取监听器列表 */
  listeners(event: string): Function[];
}
```

#### 事件类型

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `languageChanged` | `(language: string)` | 语言切换时触发 |
| `languageLoaded` | `(language: string)` | 语言资源加载完成时触发 |
| `translationMissing` | `(key: string, language: string)` | 翻译缺失时触发 |
| `error` | `(error: Error)` | 发生错误时触发 |
| `resourcesAdded` | `(language: string, resources: any)` | 添加资源时触发 |

#### 示例

```typescript
// 监听语言切换
i18n.on('languageChanged', (language) => {
  console.log(`语言已切换到: ${language}`);
  // 更新 UI 或执行其他操作
});

// 监听翻译缺失
i18n.on('translationMissing', (key, language) => {
  console.warn(`缺失翻译: ${key} (${language})`);
  // 记录到错误追踪系统
});

// 监听错误
i18n.on('error', (error) => {
  console.error('I18n 错误:', error);
  // 错误处理逻辑
});
```

## 🔌 Framework Adapters

### Vue Adapter

Vue 3 适配器，提供 Vue 特定的 API 和响应式支持。

```typescript
// 安装插件
import { createApp } from 'vue';
import { createI18n } from '@translink/i18n-runtime/vue';

const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  resources: { /* ... */ }
});

const app = createApp(App);
app.use(i18n);
```

#### useI18n

组合式 API 钩子。

```typescript
function useI18n(): {
  /** 翻译函数 */
  t: (key: string, params?: any, options?: any) => string;
  /** 当前语言 */
  locale: Ref<string>;
  /** 切换语言 */
  setLocale: (language: string) => Promise<void>;
  /** 可用语言列表 */
  availableLocales: Ref<string[]>;
}
```

#### 全局属性

```typescript
// 在模板中使用
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (key: string, params?: any, options?: any) => string;
    $tsl: (text: string, params?: any) => string;
  }
}
```

#### 示例

```vue
<template>
  <div>
    <!-- 使用全局属性 -->
    <h1>{{ $t('common.title') }}</h1>
    <p>{{ $tsl('这是直接翻译的文本') }}</p>
    
    <!-- 使用组合式 API -->
    <button @click="switchLanguage">
      {{ t('common.switchLanguage') }}
    </button>
    
    <!-- 插值示例 -->
    <p>{{ $t('user.greeting', { name: userName }) }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';
import { ref } from 'vue';

const { t, locale, setLocale } = useI18n();
const userName = ref('Alice');

const switchLanguage = async () => {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
  await setLocale(newLocale);
};
</script>
```

### React Adapter

React 适配器，提供 React 特定的 Hook 和组件。

```typescript
// 设置 Provider
import { I18nProvider } from '@translink/i18n-runtime/react';

function App() {
  return (
    <I18nProvider
      defaultLanguage="zh-CN"
      resources={{ /* ... */ }}
    >
      <MyComponent />
    </I18nProvider>
  );
}
```

#### useTranslation

React Hook。

```typescript
function useTranslation(): {
  /** 翻译函数 */
  t: (key: string, params?: any, options?: any) => string;
  /** 当前语言 */
  language: string;
  /** 切换语言 */
  changeLanguage: (language: string) => Promise<void>;
  /** i18n 引擎实例 */
  i18n: I18nEngine;
}
```

#### Trans 组件

用于复杂翻译的组件。

```typescript
interface TransProps {
  /** 翻译键 */
  i18nKey: string;
  /** 插值参数 */
  values?: Record<string, any>;
  /** 组件映射 */
  components?: Record<string, React.ComponentType>;
  /** 默认值 */
  defaults?: string;
}

function Trans(props: TransProps): JSX.Element;
```

#### 示例

```tsx
import React from 'react';
import { useTranslation, Trans } from '@translink/i18n-runtime/react';

function MyComponent() {
  const { t, language, changeLanguage } = useTranslation();

  return (
    <div>
      {/* 基本翻译 */}
      <h1>{t('common.title')}</h1>
      
      {/* 插值翻译 */}
      <p>{t('user.greeting', { name: 'Bob' })}</p>
      
      {/* 复杂翻译 */}
      <Trans
        i18nKey="user.welcomeMessage"
        values={{ name: 'Bob', count: 5 }}
        components={{
          strong: <strong />,
          link: <a href="/profile" />
        }}
      />
      
      {/* 语言切换 */}
      <button onClick={() => changeLanguage('en-US')}>
        {t('common.switchToEnglish')}
      </button>
      
      <p>当前语言: {language}</p>
    </div>
  );
}
```

## 🔧 Configuration

### CacheOptions

缓存配置选项。

```typescript
interface CacheOptions {
  /** 是否启用缓存 */
  enabled: boolean;
  /** 最大缓存大小 */
  maxSize: number;
  /** 缓存 TTL（毫秒） */
  ttl: number;
  /** 存储类型 */
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}
```

### LoaderOptions

加载器配置选项。

```typescript
interface LoaderOptions {
  /** 加载路径模板 */
  loadPath?: string;
  /** 自定义加载函数 */
  loadFunction?: LoadFunction;
  /** 预加载语言 */
  preload?: string[];
  /** 懒加载模式 */
  lazy?: boolean;
  /** 加载超时时间 */
  timeout?: number;
}
```

### LoadFunction

自定义加载函数类型。

```typescript
type LoadFunction = (
  language: string, 
  namespace: string
) => Promise<TranslationResource>;
```

## 🚀 Advanced Features

### Lazy Loading

懒加载功能，按需加载语言资源。

```typescript
const i18n = new I18nEngine({
  defaultLanguage: 'zh-CN',
  loader: {
    lazy: true,
    loadFunction: async (language) => {
      // 动态导入语言文件
      const module = await import(`./locales/${language}.json`);
      return module.default;
    }
  }
});

// 语言会在首次使用时自动加载
await i18n.changeLanguage('ja-JP');
```

### Namespace Support

命名空间支持，组织大型项目的翻译。

```typescript
// 加载特定命名空间
await i18n.loadLanguage('zh-CN', 'common');
await i18n.loadLanguage('zh-CN', 'errors');

// 使用命名空间
i18n.t('common:greeting', { name: 'World' });
i18n.t('errors:notFound');
```

### Pluralization

复数形式支持。

```typescript
// 定义复数规则
const resources = {
  'en-US': {
    items: {
      zero: 'No items',
      one: 'One item',
      other: '{{count}} items'
    }
  },
  'zh-CN': {
    items: {
      other: '{{count}} 个项目'
    }
  }
};

// 使用复数翻译
i18n.t('items', { count: 0 }); // "No items"
i18n.t('items', { count: 1 }); // "One item"  
i18n.t('items', { count: 5 }); // "5 items"
```

### Context Support

上下文支持，根据上下文选择不同翻译。

```typescript
const resources = {
  'en-US': {
    friend: 'A friend',
    friend_male: 'A boyfriend', 
    friend_female: 'A girlfriend'
  }
};

// 使用上下文
i18n.t('friend', {}, { context: 'male' }); // "A boyfriend"
i18n.t('friend', {}, { context: 'female' }); // "A girlfriend"
```

## 🧪 Testing

### MockI18nEngine

用于测试的模拟引擎。

```typescript
import { MockI18nEngine } from '@translink/i18n-runtime/testing';

const mockI18n = new MockI18nEngine({
  'greeting': 'Hello, {{name}}!',
  'farewell': 'Goodbye!'
});

// 在测试中使用
expect(mockI18n.t('greeting', { name: 'Test' })).toBe('Hello, Test!');
```

### TestUtils

测试工具函数。

```typescript
import { TestUtils } from '@translink/i18n-runtime/testing';

// 创建测试资源
const testResources = TestUtils.createTestResources({
  'zh-CN': { greeting: '你好' },
  'en-US': { greeting: 'Hello' }
});

// 验证翻译结果
TestUtils.expectTranslation(i18n, 'greeting', '你好');
```

## 📊 Performance

### 性能监控

```typescript
// 启用性能监控
const i18n = new I18nEngine({
  // ... 其他配置
  performance: {
    enabled: true,
    logThreshold: 10 // 记录超过 10ms 的操作
  }
});

// 获取性能统计
const stats = i18n.getPerformanceStats();
console.log('平均翻译时间:', stats.averageTranslationTime);
console.log('缓存命中率:', stats.cacheHitRate);
```

### 优化建议

1. **启用缓存**: 减少重复翻译的计算开销
2. **使用懒加载**: 按需加载语言资源
3. **预加载关键语言**: 提前加载常用语言
4. **合理设置 TTL**: 平衡内存使用和性能

## 🔗 相关链接

- [CLI API](./cli.md)
- [Vite Plugin API](./vite-plugin.md)
- [TypeScript 类型定义](./typescript.md)
- [Vue 示例](../../examples/vue-demo/README.md)
- [React 示例](../../examples/react-demo/README.md)
