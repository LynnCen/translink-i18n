# Runtime API 文档

> TransLink I18n 运行时库的完整 API 参考文档

## 📋 概述

TransLink I18n Runtime 提供了强大的运行时国际化支持，包括多级缓存、智能插值、框架集成等功能。

## 🚀 安装

```bash
# 核心运行时库
npm install @translink/i18n-runtime

# Vue 3 支持
npm install @translink/i18n-runtime vue

# React 支持
npm install @translink/i18n-runtime react react-dom
```

## 🏗️ 核心 API

### I18nEngine

核心翻译引擎，提供所有基础国际化功能。

#### 构造函数

```typescript
new I18nEngine(options: I18nOptions)
```

#### I18nOptions

```typescript
interface I18nOptions {
  // 语言配置
  defaultLanguage: string;
  fallbackLanguage: string;
  supportedLanguages: string[];

  // 资源配置
  resources?: Record<string, TranslationResource>;
  loadPath?: string;
  loadFunction?: (lng: string, ns: string) => Promise<TranslationResource>;

  // 缓存配置
  cache?: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
    storage: 'memory' | 'localStorage' | 'sessionStorage';
  };

  // 插值配置
  interpolation?: {
    prefix: string;
    suffix: string;
    escapeValue: boolean;
    format?: (value: any, format: string, lng: string) => string;
  };

  // 调试配置
  debug?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}
```

#### 方法

##### `init(): Promise<void>`

初始化 i18n 引擎。

```typescript
const i18n = new I18nEngine({
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
});

await i18n.init();
```

##### `t(key: string, params?: TranslationParams, options?: TranslationOptions): string`

翻译文本的核心方法。

```typescript
// 基础翻译
i18n.t('welcome'); // "欢迎使用"

// 带参数翻译
i18n.t('greeting', { name: '张三' }); // "你好，张三！"

// 嵌套键翻译
i18n.t('user.profile'); // "用户资料"

// 带选项翻译
i18n.t(
  'message',
  { count: 5 },
  {
    lng: 'en-US',
    defaultValue: 'Default message',
  }
);
```

**参数类型：**

```typescript
interface TranslationParams {
  [key: string]: string | number | boolean | Date | null | undefined;
}

interface TranslationOptions {
  lng?: string; // 指定语言
  ns?: string; // 指定命名空间
  defaultValue?: string; // 默认值
  count?: number; // 复数形式
}
```

##### `changeLanguage(language: string): Promise<void>`

切换当前语言。

```typescript
// 切换到英文
await i18n.changeLanguage('en-US');

// 监听语言切换事件
i18n.on('languageChanged', language => {
  console.log('Language changed to:', language);
});
```

##### `getCurrentLanguage(): string`

获取当前语言。

```typescript
const currentLang = i18n.getCurrentLanguage(); // "zh-CN"
```

##### `getSupportedLanguages(): string[]`

获取支持的语言列表。

```typescript
const languages = i18n.getSupportedLanguages(); // ["zh-CN", "en-US"]
```

##### `addResourceBundle(lng: string, ns: string, resources: TranslationResource): void`

动态添加翻译资源。

```typescript
i18n.addResourceBundle('zh-CN', 'common', {
  button: {
    save: '保存',
    cancel: '取消',
  },
});
```

##### `removeResourceBundle(lng: string, ns?: string): void`

移除翻译资源。

```typescript
// 移除特定命名空间
i18n.removeResourceBundle('zh-CN', 'common');

// 移除整个语言
i18n.removeResourceBundle('zh-CN');
```

#### 事件系统

I18nEngine 继承自 EventEmitter，支持以下事件：

```typescript
// 初始化完成
i18n.on('ready', () => {
  console.log('I18n is ready');
});

// 语言切换
i18n.on('languageChanged', (language: string) => {
  console.log('Language changed:', language);
});

// 翻译缺失
i18n.on('translationMissing', (key: string, language: string) => {
  console.log('Missing translation:', key, 'for', language);
});

// 资源加载
i18n.on('resourceLoaded', (language: string, namespace: string) => {
  console.log('Resource loaded:', language, namespace);
});

// 错误事件
i18n.on('error', (error: Error) => {
  console.error('I18n error:', error);
});
```

#### 缓存管理

```typescript
// 获取缓存统计
const stats = i18n.getCacheStats();
console.log('Cache size:', stats.size);
console.log('Hit rate:', stats.hitRate);

// 清除缓存
i18n.clearCache();

// 预热缓存
await i18n.preloadLanguage('en-US');
```

---

## 🎯 Vue 3 集成

### createI18n

创建 Vue 3 i18n 实例。

```typescript
import { createI18n } from '@translink/i18n-runtime/vue';

const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  globalInjection: true,
  globalProperties: true,
});

app.use(i18n);
```

#### VueI18nOptions

```typescript
interface VueI18nOptions extends I18nOptions {
  globalInjection?: boolean; // 是否全局注入
  globalProperties?: boolean; // 是否添加全局属性
}
```

### useI18n

Vue 3 Composition API Hook。

```typescript
import { useI18n } from '@translink/i18n-runtime/vue';

export default {
  setup() {
    const { t, locale, setLocale, availableLocales, isReady, isLoading } =
      useI18n();

    return {
      t,
      locale,
      setLocale,
      availableLocales,
      isReady,
      isLoading,
    };
  },
};
```

#### UseI18nReturn

```typescript
interface UseI18nReturn {
  t: (key: string, params?: TranslationParams) => string;
  locale: ComputedRef<string>;
  setLocale: (locale: string) => Promise<void>;
  availableLocales: ComputedRef<string[]>;
  isReady: Ref<boolean>;
  isLoading: Ref<boolean>;
}
```

### 全局属性

当启用 `globalProperties` 时，可以在模板中直接使用：

```vue
<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
    <p>{{ $t('greeting', { name: 'Vue' }) }}</p>

    <!-- 当前语言 -->
    <span>{{ $i18n.locale }}</span>
  </div>
</template>
```

### v-t 指令

自定义翻译指令。

```vue
<template>
  <!-- 基础使用 -->
  <p v-t="'welcome'"></p>

  <!-- 带参数 -->
  <p v-t="{ key: 'greeting', params: { name: 'Vue' } }"></p>

  <!-- HTML 内容 -->
  <div v-t.html="'richContent'"></div>
</template>

<script setup>
import { vT } from '@translink/i18n-runtime/vue';

// 注册指令
app.directive('t', vT);
</script>
```

### Translation 组件

声明式翻译组件。

```vue
<template>
  <!-- 基础翻译 -->
  <Translation i18nKey="welcome" />

  <!-- 带参数翻译 -->
  <Translation i18nKey="greeting" :params="{ name: 'Vue' }" />

  <!-- 自定义标签 -->
  <Translation i18nKey="title" tag="h1" class="page-title" />

  <!-- 插槽内容 -->
  <Translation i18nKey="richContent">
    <template #link="{ text }">
      <router-link to="/about">{{ text }}</router-link>
    </template>
  </Translation>
</template>
```

#### Translation Props

```typescript
interface TranslationProps {
  i18nKey: string;
  params?: TranslationParams;
  tag?: string;
  defaultValue?: string;
  ns?: string;
}
```

---

## ⚛️ React 集成

### I18nProvider

React Context Provider。

```tsx
import { I18nProvider } from '@translink/i18n-runtime/react';
import { I18nEngine } from '@translink/i18n-runtime';

const i18nEngine = new I18nEngine({
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
});

function App() {
  return (
    <I18nProvider
      i18n={i18nEngine}
      fallback={<div>Loading...</div>}
      errorFallback={({ error, retry }) => (
        <div>
          <p>Error: {error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
    >
      <MyComponent />
    </I18nProvider>
  );
}
```

#### I18nProviderProps

```typescript
interface I18nProviderProps {
  i18n: I18nEngine;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{
    error: Error;
    retry: () => void;
  }>;
}
```

### createI18n

创建 i18n 实例，返回全局 `t` 函数、`engine` 实例和 `Provider` 组件。

**✅ 推荐：这是 React 项目的最佳实践**

```tsx
import { createI18n } from '@translink/i18n-runtime/react';

// 创建 i18n 实例
export const { engine, t, Provider } = createI18n({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  loadFunction: async (lng) => {
    return await import(`./locales/${lng}.json`);
  },
});

// 在 main.tsx 中使用 Provider
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
);

// 在纯函数中使用全局 t
export function formatPrice(price: number) {
  return `${price} ${t('currency')}`;
}
```

#### CreateI18nReturn

```typescript
interface CreateI18nReturn {
  engine: I18nEngine;
  t: (key: string, params?: TranslationParams, options?: TranslationOptions) => string;
  Provider: React.ComponentType<{ children: React.ReactNode }>;
}
```

### useI18n

**✅ 推荐：主要 React Hook，一次性获取所有 i18n 功能**

```tsx
import { useI18n } from '@translink/i18n-runtime/react';

function MyComponent() {
  // ✅ 推荐：一次性获取所有功能
  const { t, locale, setLocale, isReady, isLoading } = useI18n();

  if (!isReady) {
    return <div>Loading translations...</div>;
  }

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('greeting', { name: 'React' })}</p>
      <p>Current: {locale}</p>
      <button onClick={() => setLocale('en-US')} disabled={isLoading}>
        Switch to English
      </button>
    </div>
  );
}
```

#### UseI18nReturn

```typescript
interface I18nContextValue {
  t: (key: string, params?: TranslationParams, options?: TranslationOptions) => string;
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  availableLocales: string[];
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  engine: I18nEngine;
}
```

### useTranslation

支持命名空间的 Hook（内部使用 `useI18n`）。

**注意：推荐直接使用 `useI18n()`，除非需要命名空间功能。**

```tsx
import { useTranslation } from '@translink/i18n-runtime/react';

function MyComponent() {
  // 带命名空间
  const { t, i18n, ready } = useTranslation('common');

  return <div>{t('key')}</div>; // 实际翻译 "common:key"
}
```

#### UseTranslationReturn

```typescript
interface UseTranslationReturn {
  t: (key: string, params?: TranslationParams, options?: TranslationOptions) => string;
  i18n: I18nContextValue;
  ready: boolean;
}
```

### Translation 组件

React 翻译组件。

```tsx
import { Translation } from '@translink/i18n-runtime/react';

function MyComponent() {
  return (
    <div>
      {/* 基础翻译 */}
      <Translation i18nKey="welcome" />

      {/* 带参数翻译 */}
      <Translation i18nKey="greeting" values={{ name: 'React' }} />

      {/* 组件插值 */}
      <Translation
        i18nKey="richText"
        values={{ name: 'React' }}
        components={{
          Link: ({ children }) => <a href="/about">{children}</a>,
          Bold: ({ children }) => <strong>{children}</strong>,
        }}
      />

      {/* Render prop */}
      <Translation i18nKey="customRender">
        {translation => <div className="custom-style">{translation}</div>}
      </Translation>
    </div>
  );
}
```

#### Translation Props

```typescript
interface TranslationProps {
  i18nKey: string;
  values?: TranslationParams;
  components?: Record<string, React.ComponentType<any>>;
  children?: (translation: string) => React.ReactNode;
  defaultValue?: string;
  ns?: string;
}
```

### withTranslation HOC

高阶组件包装器。

```tsx
import { withTranslation } from '@translink/i18n-runtime/react';

interface MyComponentProps {
  title: string;
  t: (key: string, params?: any) => string;
  i18n: any;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, t, i18n }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>{t('welcome')}</p>
      <p>Current language: {i18n.locale}</p>
    </div>
  );
};

export default withTranslation(MyComponent);
```

---

## 🔧 高级功能

### 插值系统

#### 基础插值

```typescript
// 模板: "Hello, {{name}}!"
i18n.t('greeting', { name: 'World' }); // "Hello, World!"
```

#### 格式化函数

```typescript
const i18n = new I18nEngine({
  interpolation: {
    format: (value, format, lng) => {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'currency') {
        return new Intl.NumberFormat(lng, {
          style: 'currency',
          currency: lng === 'zh-CN' ? 'CNY' : 'USD',
        }).format(value);
      }
      return value;
    },
  },
});

// 模板: "Price: {{amount, currency}}"
i18n.t('price', { amount: 99.99 }); // "Price: ¥99.99"
```

#### 嵌套对象插值

```typescript
// 模板: "Welcome {{user.name}}, your level is {{user.level}}"
i18n.t('userWelcome', {
  user: { name: 'John', level: 'VIP' },
}); // "Welcome John, your level is VIP"
```

### 复数形式

```typescript
// 资源定义
{
  "itemCount": "{{count}} item",
  "itemCount_plural": "{{count}} items"
}

// 使用
i18n.t('itemCount', { count: 1 });  // "1 item"
i18n.t('itemCount', { count: 5 });  // "5 items"
```

### 命名空间

```typescript
// 加载命名空间资源
await i18n.loadNamespace('common');

// 使用命名空间
i18n.t('common:button.save'); // 明确指定命名空间
i18n.t('button.save', {}, { ns: 'common' }); // 通过选项指定
```

### 动态资源加载

```typescript
const i18n = new I18nEngine({
  loadFunction: async (lng, ns) => {
    const response = await fetch(`/api/translations/${lng}/${ns}`);
    return response.json();
  },
});

// 预加载资源
await i18n.preloadLanguage('en-US');
await i18n.preloadNamespace('common');
```

### 缓存策略

```typescript
const i18n = new I18nEngine({
  cache: {
    enabled: true,
    maxSize: 1000, // 最大缓存条目数
    ttl: 5 * 60 * 1000, // 5分钟 TTL
    storage: 'localStorage', // 持久化存储
  },
});

// 缓存管理
const stats = i18n.getCacheStats();
console.log('Cache hit rate:', stats.hitRate);

// 手动缓存控制
i18n.clearCache();
i18n.preloadTranslations(['welcome', 'greeting']);
```

---

## 🎨 类型定义

### 核心类型

```typescript
// 翻译资源类型
interface TranslationResource {
  [key: string]: string | TranslationResource;
}

// 翻译参数类型
interface TranslationParams {
  [key: string]: string | number | boolean | Date | null | undefined;
}

// 缓存条目类型
interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

// 事件类型
interface I18nEvents {
  ready: () => void;
  languageChanged: (language: string) => void;
  translationMissing: (key: string, language: string) => void;
  resourceLoaded: (language: string, namespace: string) => void;
  error: (error: Error) => void;
}
```

### Vue 类型

```typescript
// Vue i18n 实例类型
interface VueI18nInstance {
  global: {
    t: (key: string, params?: TranslationParams) => string;
    locale: ComputedRef<string>;
    availableLocales: ComputedRef<string[]>;
    engine: I18nEngine;
  };
  install: (app: App) => void;
}

// Vue Hook 返回类型
interface UseI18nReturn {
  t: (key: string, params?: TranslationParams) => string;
  locale: ComputedRef<string>;
  setLocale: (locale: string) => Promise<void>;
  availableLocales: ComputedRef<string[]>;
  isReady: Ref<boolean>;
  isLoading: Ref<boolean>;
}
```

### React 类型

```typescript
// React Context 类型
interface I18nContextValue {
  engine: I18nEngine;
  t: (key: string, params?: TranslationParams) => string;
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  availableLocales: string[];
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
}

// React Hook 返回类型
interface UseTranslationReturn {
  t: (key: string, params?: TranslationParams) => string;
  i18n: I18nContextValue;
  ready: boolean;
}
```

---

## 🚨 错误处理

### 错误类型

```typescript
// 自定义错误类
class I18nError extends Error {
  code: string;
  details?: any;
}

// 常见错误
try {
  await i18n.changeLanguage('invalid-lang');
} catch (error) {
  if (error instanceof I18nError) {
    switch (error.code) {
      case 'UNSUPPORTED_LANGUAGE':
        console.error('Language not supported:', error.details);
        break;
      case 'RESOURCE_LOAD_FAILED':
        console.error('Failed to load resources:', error.details);
        break;
    }
  }
}
```

### 错误恢复

```typescript
// 设置错误处理器
i18n.on('error', error => {
  console.error('I18n error:', error);

  // 自动恢复到默认语言
  if (error.code === 'RESOURCE_LOAD_FAILED') {
    i18n.changeLanguage(i18n.options.defaultLanguage);
  }
});

// 设置翻译缺失处理
i18n.on('translationMissing', (key, language) => {
  // 记录缺失的翻译
  console.warn(`Missing translation: ${key} for ${language}`);

  // 可选：发送到监控系统
  analytics.track('translation_missing', { key, language });
});
```

---

## 📈 性能优化

### 预加载策略

```typescript
// 应用启动时预加载关键语言
await Promise.all([
  i18n.preloadLanguage('zh-CN'),
  i18n.preloadLanguage('en-US'),
]);

// 懒加载其他语言
const loadLanguageOnDemand = async (language: string) => {
  if (!i18n.hasLanguage(language)) {
    await i18n.loadLanguage(language);
  }
  await i18n.changeLanguage(language);
};
```

### 缓存优化

```typescript
// 配置多级缓存
const i18n = new I18nEngine({
  cache: {
    enabled: true,
    maxSize: 2000,
    ttl: 30 * 60 * 1000, // 30分钟
    storage: 'localStorage',
  },
});

// 批量预热缓存
const criticalKeys = ['welcome', 'navigation.home', 'button.save'];
await i18n.preloadTranslations(criticalKeys);
```

### 内存管理

```typescript
// 定期清理过期缓存
setInterval(
  () => {
    i18n.cleanupExpiredCache();
  },
  5 * 60 * 1000
); // 每5分钟清理一次

// 组件卸载时清理
onUnmounted(() => {
  i18n.clearCache();
});
```

---

_本文档涵盖了 TransLink I18n Runtime 的所有核心 API 和功能。如需更多信息，请参考 [使用指南](../guides/README.md) 或 [示例项目](../../playground/README.md)。_
