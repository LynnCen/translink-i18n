# @translink/i18n-runtime

TransLink I18n Runtime Library - Lightweight, efficient internationalization runtime.

## 📦 Installation

```bash
npm install @translink/i18n-runtime
# or
pnpm add @translink/i18n-runtime
```

## 🚀 Quick Start

### Vue 3

```typescript
// main.ts
import { createApp } from 'vue';
import { createI18n } from '@translink/i18n-runtime/vue';
import App from './App.vue';

// Import language packages
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  resources: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});

const app = createApp(App);
app.use(i18n);
app.mount('#app');
```

Using in components:

```vue
<template>
  <div>
    <!-- Using $tsl function -->
    <h1>{{ $tsl('Welcome') }}</h1>

    <!-- Using Composition API -->
    <p>{{ t('Description text') }}</p>

    <!-- Language switching -->
    <button @click="changeLanguage('en-US')">English</button>
  </div>
</template>

<script setup>
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale, changeLanguage } = useI18n();
</script>
```

### React

```typescript
// App.tsx
import { I18nProvider, useI18n } from '@translink/i18n-runtime/react';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

function App() {
  return (
    <I18nProvider
      defaultLanguage="zh-CN"
      fallbackLanguage="zh-CN"
      supportedLanguages={['zh-CN', 'en-US']}
      resources={{
        'zh-CN': zhCN,
        'en-US': enUS,
      }}
    >
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t, locale, changeLanguage } = useI18n();

  return (
    <div>
      <h1>{t('Welcome')}</h1>
      <p>{t('Description text')}</p>
      <button onClick={() => changeLanguage('en-US')}>English</button>
    </div>
  );
}
```

### Vanilla JavaScript

```typescript
import { I18nEngine } from '@translink/i18n-runtime';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

const i18n = new I18nEngine({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  resources: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});

// Translate
const text = i18n.translate('Welcome');

// Change language
i18n.changeLanguage('en-US');

// Listen to language changes
i18n.on('languageChanged', newLang => {
  console.log('Language changed to:', newLang);
});
```

## 📖 API Reference

### Vue API

#### `createI18n(options)`

Create i18n instance.

```typescript
interface I18nOptions {
  defaultLanguage: string;
  fallbackLanguage?: string;
  supportedLanguages: string[];
  resources: Record<string, Record<string, string>>;
  cache?: boolean;
  debug?: boolean;
}
```

#### `useI18n()`

Composition API Hook.

```typescript
const {
  t, // Translation function
  locale, // Current language (ref)
  changeLanguage, // Change language
  isReady, // Is ready
} = useI18n();
```

#### `$tsl(key, params?)`

Global translation function (Options API).

### React API

#### `<I18nProvider>`

Provider component.

```typescript
<I18nProvider
  defaultLanguage="zh-CN"
  fallbackLanguage="zh-CN"
  supportedLanguages={['zh-CN', 'en-US']}
  resources={...}
>
  {children}
</I18nProvider>
```

#### `useI18n()`

React Hook.

```typescript
const {
  t, // Translation function
  locale, // Current language
  changeLanguage, // Change language
  isReady, // Is ready
} = useI18n();
```

### Core API

#### `I18nEngine`

```typescript
class I18nEngine {
  constructor(options: I18nOptions);

  // Translation
  translate(key: string, params?: Record<string, any>): string;
  t(key: string, params?: Record<string, any>): string; // Alias

  // Language management
  changeLanguage(lang: string): Promise<void>;
  getCurrentLanguage(): string;
  getSupportedLanguages(): string[];

  // Resource management
  addResources(lang: string, resources: Record<string, string>): void;
  getResource(lang: string, key: string): string | undefined;

  // Event system
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, ...args: any[]): void;
}
```

## ⚙️ Configuration Options

```typescript
interface I18nOptions {
  // Default language
  defaultLanguage: string;

  // Fallback language
  fallbackLanguage?: string;

  // Supported languages list
  supportedLanguages: string[];

  // Language resources
  resources: Record<string, Record<string, string>>;

  // Enable caching
  cache?: boolean;

  // Debug mode
  debug?: boolean;

  // Cache configuration
  cacheConfig?: {
    type: 'memory' | 'localStorage' | 'sessionStorage';
    maxSize?: number;
    ttl?: number;
  };
}
```

## 🎯 Features

### ✅ Lightweight

- Core code < 10KB (gzipped)
- Zero external dependencies
- Tree-shakable

### ⚡ High Performance

- Memory caching
- Lazy loading
- Batch updates

### 🔧 Flexible

- Multi-framework support
- Extensible plugin system
- Complete TypeScript support

### 🌍 Interpolation

Support for parameter interpolation:

```typescript
// Basic interpolation
t('Hello {{name}}', { name: 'John' });
// Output: Hello John

// Multiple parameters
t('{{user}} has {{count}} messages', { user: 'Alice', count: 5 });
// Output: Alice has 5 messages
```

### 🎨 Framework Adapters

Built-in adapters for popular frameworks:

- **Vue 3**: Full Composition API and Options API support
- **React**: Hook-based API with context provider
- **Vanilla JS**: Pure JavaScript engine for any framework

### 💾 Smart Caching

Automatic caching for improved performance:

- In-memory cache for translations
- LRU cache strategy
- Configurable cache size and TTL
- Cache invalidation on language change

## 📚 Complete Documentation

- [Runtime API Documentation](../../docs/api/runtime.md)
- [Quick Start Guide](../../docs/quick-start.md)
- [Best Practices](../../docs/best-practices.md)

## 🤝 Contributing

Contributions are welcome! Please see the [Contributing Guide](../../CONTRIBUTING.md).

## 📄 License

MIT © lynncen
