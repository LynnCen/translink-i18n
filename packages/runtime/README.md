# @translink/i18n-runtime

TransLink I18n 运行时库 - 轻量、高效的国际化运行时。

## 📦 安装

```bash
pnpm add @translink/i18n-runtime
```

## 🚀 快速开始

### Vue 3

```typescript
// main.ts
import { createApp } from 'vue';
import { createI18n } from '@translink/i18n-runtime/vue';
import App from './App.vue';

// 导入语言包
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

在组件中使用：

```vue
<template>
  <div>
    <!-- 使用 $tsl 函数 -->
    <h1>{{ $tsl('欢迎') }}</h1>
    
    <!-- 使用 Composition API -->
    <p>{{ t('描述文本') }}</p>
    
    <!-- 语言切换 -->
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
      <h1>{t('欢迎')}</h1>
      <p>{t('描述文本')}</p>
      <button onClick={() => changeLanguage('en-US')}>English</button>
    </div>
  );
}
```

### 原生 JavaScript

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

// 翻译
const text = i18n.translate('欢迎');

// 切换语言
i18n.changeLanguage('en-US');

// 监听语言变化
i18n.on('languageChanged', (newLang) => {
  console.log('Language changed to:', newLang);
});
```

## 📖 API 参考

### Vue API

#### `createI18n(options)`

创建 i18n 实例。

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

Composition API Hook。

```typescript
const {
  t,              // 翻译函数
  locale,         // 当前语言（ref）
  changeLanguage, // 切换语言
  isReady,        // 是否就绪
} = useI18n();
```

#### `$tsl(key, params?)`

全局翻译函数（Options API）。

### React API

#### `<I18nProvider>`

Provider 组件。

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

React Hook。

```typescript
const {
  t,              // 翻译函数
  locale,         // 当前语言
  changeLanguage, // 切换语言
  isReady,        // 是否就绪
} = useI18n();
```

### 核心 API

#### `I18nEngine`

```typescript
class I18nEngine {
  constructor(options: I18nOptions);
  
  // 翻译
  translate(key: string, params?: Record<string, any>): string;
  t(key: string, params?: Record<string, any>): string; // 别名
  
  // 语言管理
  changeLanguage(lang: string): Promise<void>;
  getCurrentLanguage(): string;
  getSupportedLanguages(): string[];
  
  // 资源管理
  addResources(lang: string, resources: Record<string, string>): void;
  getResource(lang: string, key: string): string | undefined;
  
  // 事件系统
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, ...args: any[]): void;
}
```

## ⚙️ 配置选项

```typescript
interface I18nOptions {
  // 默认语言
  defaultLanguage: string;
  
  // 回退语言
  fallbackLanguage?: string;
  
  // 支持的语言列表
  supportedLanguages: string[];
  
  // 语言资源
  resources: Record<string, Record<string, string>>;
  
  // 启用缓存
  cache?: boolean;
  
  // 调试模式
  debug?: boolean;
  
  // 缓存配置
  cacheConfig?: {
    type: 'memory' | 'localStorage' | 'sessionStorage';
    maxSize?: number;
    ttl?: number;
  };
}
```

## 🎯 特性

### ✅ 轻量级

- 核心代码 < 10KB (gzipped)
- 零外部依赖
- Tree-shakable

### ⚡ 高性能

- 内存缓存
- 懒加载
- 批量更新

### 🔧 灵活

- 支持多框架
- 可扩展的插件系统
- 完整的 TypeScript 支持

## 📚 完整文档

- [Runtime API 文档](../../docs/api/runtime.md)
- [快速开始](../../docs/quick-start.md)
- [最佳实践](../../docs/best-practices.md)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)。

## 📄 许可证

MIT © lynncen

