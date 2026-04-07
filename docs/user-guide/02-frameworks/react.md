# React 集成指南

> **完整的 React 项目国际化集成方案**

---

## 🚀 快速集成

### 1. 安装依赖

```bash
npm install @translink/i18n-runtime
npm install -D @translink/vite-plugin-i18n
```

### 2. 配置 Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import i18nPlugin from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    react(),
    i18nPlugin({
      localesDir: 'src/locales',
      defaultLanguage: 'zh-CN',
      hotReload: true,
    }),
  ],
});
```

### 3. 初始化 i18n

```typescript
// src/i18n.ts
import { createI18n } from '@translink/i18n-runtime/react';

export const { engine, t, Provider } = createI18n({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  loadFunction: async (lng) => {
    return await import(`./locales/${lng}.json`);
  },
});
```

### 4. 包装应用

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from './i18n';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
);
```

---

## 📝 使用方式

### 在组件中使用（推荐）

```tsx
import { useI18n } from '@translink/i18n-runtime/react';

function MyComponent() {
  const { t, locale, setLocale, isReady } = useI18n();

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('greeting', { name: '张三' })}</p>
      <p>当前语言: {locale}</p>
      <button onClick={() => setLocale('en-US')}>
        Switch to English
      </button>
    </div>
  );
}
```

### 在纯函数中使用

```typescript
// utils/formatters.ts
import { t } from './i18n';

export function formatPrice(price: number) {
  return `${price} ${t('currency')}`;
}

export function getErrorMessage(code: number) {
  return t(`error.${code}`, { defaultValue: '未知错误' });
}
```

### 在类组件中使用

```tsx
import { withI18n, WithI18nProps } from '@translink/i18n-runtime/react';

interface Props extends WithI18nProps {
  name: string;
}

class MyComponent extends React.Component<Props> {
  render() {
    const { t, locale, setLocale } = this.props;

    return (
      <div>
        <h1>{t('welcome')}</h1>
        <p>{t('greeting', { name: this.props.name })}</p>
      </div>
    );
  }
}

export default withI18n(MyComponent);
```

---

## 🔧 useI18n API

```typescript
const {
  t,           // 翻译函数
  locale,      // 当前语言
  setLocale,   // 切换语言
  isReady,     // 是否就绪
  isLoading,   // 是否加载中
} = useI18n();
```

### t() 函数

```typescript
// 基本翻译
t('welcome')  // "欢迎"

// 带参数
t('greeting', { name: '张三' })  // "你好，张三"

// 带默认值
t('unknown_key', {}, { defaultValue: '默认文本' })
```

### setLocale() 函数

```typescript
// 切换语言（异步）
const handleSwitch = async () => {
  await setLocale('en-US');
  // 切换完成后执行
};
```

---

## 🎨 进阶用法

### 处理加载状态

```tsx
function App() {
  const { t, isReady, isLoading } = useI18n();

  if (!isReady) {
    return <Spinner />;
  }

  return (
    <div>
      {isLoading && <LoadingOverlay />}
      <h1>{t('welcome')}</h1>
    </div>
  );
}
```

### 持久化语言设置

```tsx
// src/i18n.ts
export const { engine, t, Provider } = createI18n({
  defaultLanguage: localStorage.getItem('locale') || 'zh-CN',
  // ...
});

// 切换语言时保存
function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const handleChange = async (lang: string) => {
    await setLocale(lang);
    localStorage.setItem('locale', lang);
  };

  return (
    <select value={locale} onChange={(e) => handleChange(e.target.value)}>
      <option value="zh-CN">中文</option>
      <option value="en-US">English</option>
    </select>
  );
}
```

### 配合 React Router

```tsx
// 路由配置
import { t } from './i18n';

const routes = [
  {
    path: '/',
    element: <Home />,
    handle: { title: () => t('routes.home') },
  },
  {
    path: '/about',
    element: <About />,
    handle: { title: () => t('routes.about') },
  },
];

// 在布局组件中更新标题
function Layout() {
  const matches = useMatches();
  const { t } = useI18n();

  useEffect(() => {
    const match = matches[matches.length - 1];
    if (match?.handle?.title) {
      document.title = match.handle.title();
    }
  }, [matches, t]);

  return <Outlet />;
}
```

### 处理富文本

```tsx
import { Translation } from '@translink/i18n-runtime/react';

function TermsPage() {
  return (
    <Translation
      i18nKey="terms"
      values={{ siteName: 'MyApp' }}
      components={{
        Link: ({ children }) => <a href="/terms">{children}</a>,
        Bold: ({ children }) => <strong>{children}</strong>,
      }}
    />
  );
}

// 翻译文件
// "terms": "使用 <Bold>{{siteName}}</Bold> 即表示您同意<Link>服务条款</Link>"
```

---

## 📁 推荐目录结构

```
src/
├── locales/
│   ├── zh-CN.json
│   └── en-US.json
├── i18n.ts           # i18n 初始化（导出 t, Provider）
├── components/
├── pages/
├── App.tsx
└── main.tsx
```

---

## 🔧 TypeScript 支持

### 类型定义

```typescript
// src/types/i18n.d.ts
declare module '@translink/i18n-runtime/react' {
  export function useI18n(): {
    t: (key: string, params?: Record<string, any>) => string;
    locale: string;
    setLocale: (lang: string) => Promise<void>;
    isReady: boolean;
    isLoading: boolean;
  };

  export function createI18n(options: I18nOptions): {
    engine: I18nEngine;
    t: (key: string, params?: Record<string, any>) => string;
    Provider: React.FC<{ children: React.ReactNode }>;
  };
}
```

---

## ❓ 常见问题

### Q: 组件不响应语言切换？

确保组件被 Provider 包裹，且使用 useI18n Hook：

```tsx
// ✅ 正确
function App() {
  const { t, locale } = useI18n();
  return <h1>{t('welcome')}</h1>;  // 语言切换时会重新渲染
}

// ❌ 错误（直接使用全局 t，不会触发重新渲染）
import { t } from './i18n';
function App() {
  return <h1>{t('welcome')}</h1>;  // 不会响应语言切换
}
```

### Q: 如何在 Redux/Zustand 中使用？

使用全局 t 函数：

```typescript
// store/userSlice.ts
import { t } from '@/i18n';

export const userSlice = createSlice({
  name: 'user',
  reducers: {
    setError(state, action) {
      state.error = t(`errors.${action.payload}`);
    },
  },
});
```

### Q: Next.js 如何集成？

```tsx
// pages/_app.tsx
import { Provider } from '@/i18n';

function MyApp({ Component, pageProps }) {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
}
```

---

## 📚 相关文档

- [Vue 集成](./vue.md)
- [CLI 命令](../01-cli/commands.md)
- [最佳实践](../04-best-practices.md)
