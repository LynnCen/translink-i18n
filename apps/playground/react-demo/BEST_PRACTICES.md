# TransLink I18n React 最佳实践

本文档展示了如何使用 `@translink/i18n-runtime/react` 的最佳实践。

## 📋 目录

- [核心概念](#核心概念)
- [设置 I18n](#设置-i18n)
- [在组件中使用](#在组件中使用)
- [在纯函数中使用](#在纯函数中使用)
- [常见场景](#常见场景)
- [API 对比](#api-对比)

---

## 核心概念

### 两种使用方式

TransLink I18n 提供两种使用翻译的方式：

1. **Hook 方式** - 用于 React 组件（响应式，语言切换时自动重新渲染）
2. **全局实例方式** - 用于纯函数、类方法、条件判断等（不响应式）

### 为什么需要两种方式？

React Hooks 只能在组件顶层调用，不能在：
- 纯函数中
- 类方法中
- 条件判断中
- 循环中
- 异步函数中

因此，我们需要全局实例方式来覆盖这些场景。

---

## 设置 I18n

### 步骤 1：创建 i18n 配置文件

```typescript
// src/i18n.ts
import { createI18n } from '@translink/i18n-runtime/react';

// ✅ 使用 createI18n 创建 i18n 实例
export const { engine, t, Provider } = createI18n({
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],

  // 使用动态导入加载翻译资源
  loadFunction: async (lng: string) => {
    const module = await import(`./locales/${lng}.json`);
    return module.default || module;
  },

  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5分钟
  },

  // DevTools
  devTools: {
    enabled: import.meta.env.DEV,
  },
});

export default engine;
```

**返回值说明：**
- `engine` - I18nEngine 实例，可以直接调用 `engine.t()`, `engine.changeLanguage()` 等
- `t` - 全局翻译函数，等同于 `engine.t()`，用于纯函数中
- `Provider` - React Provider 组件，用于包裹应用

### 步骤 2：在根组件使用 Provider

```typescript
// src/App.tsx
import { Provider } from './i18n';

function App() {
  return (
    <Provider>
      <AppContent />
    </Provider>
  );
}
```

---

## 在组件中使用

### ✅ 推荐：使用 useI18n Hook

`useI18n()` 是主要的 Hook，提供所有 i18n 功能：

```typescript
import { useI18n } from '@translink/i18n-runtime/react';

function MyComponent() {
  // ✅ 一次性获取所有功能
  const { t, locale, setLocale, isReady, isLoading } = useI18n();

  // 显示加载状态
  if (!isReady) {
    return <div>Loading translations...</div>;
  }

  // 切换语言
  const handleLanguageSwitch = async () => {
    await setLocale('en-US');
  };

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('greeting', { name: 'Alice' })}</p>
      <p>Current: {locale}</p>
      <button onClick={handleLanguageSwitch}>
        {t('switchLanguage')}
      </button>
    </div>
  );
}
```

### useI18n 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `t` | `function` | 翻译函数 |
| `locale` | `string` | 当前语言 |
| `setLocale` | `function` | 切换语言 |
| `availableLocales` | `string[]` | 支持的语言列表 |
| `isReady` | `boolean` | 初始化状态 |
| `isLoading` | `boolean` | 加载状态 |
| `error` | `Error \| null` | 错误信息 |
| `engine` | `I18nEngine` | 引擎实例 |

### useTranslation Hook（可选）

如果需要 namespace 功能，可以使用 `useTranslation`：

```typescript
import { useTranslation } from '@translink/i18n-runtime/react';

function DashboardComponent() {
  // ✅ 带 namespace 的翻译
  const { t } = useTranslation('dashboard');

  return (
    <div>
      {/* 自动添加前缀: 'dashboard:title' */}
      <h1>{t('title')}</h1>
    </div>
  );
}
```

---

## 在纯函数中使用

### ✅ 使用全局 t 函数

从 `i18n.ts` 导出的 `t` 函数可以在任何地方使用：

```typescript
// src/utils/formatters.ts
import { t } from '../i18n';

// ✅ 在纯函数中使用
export function formatPrice(price: number): string {
  return `${price} ${t('currency')}`;
}

// ✅ 在条件判断中使用
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return t('greetingMorning'); // ✅ 正常使用
  } else {
    return t('greetingAfternoon');
  }
}

// ✅ 在类方法中使用
export class Validator {
  static validateEmail(email: string) {
    if (!email) {
      return {
        valid: false,
        message: t('validationEmailRequired'), // ✅ 正常使用
      };
    }
    // ...
  }
}

// ✅ 在异步函数中使用
export async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(t('errorNetworkFailed')); // ✅ 正常使用
    }
    return await response.json();
  } catch (error) {
    console.error(t('errorOccurred'), error);
    throw error;
  }
}
```

### ⚠️ 全局 t 函数的限制

- **不响应式** - 语言切换时，纯函数的返回值不会自动更新
- **需要手动刷新** - 如果需要更新，必须重新调用函数

示例：

```typescript
// ❌ 错误示例
const greeting = t('greeting'); // 只会执行一次

// 语言切换后，greeting 仍然是旧语言
await setLocale('en-US');
console.log(greeting); // 仍然是中文

// ✅ 正确示例
function getGreeting() {
  return t('greeting'); // 每次调用都会重新翻译
}

// 语言切换后，重新调用函数
await setLocale('en-US');
console.log(getGreeting()); // 现在是英文
```

---

## 常见场景

### 场景 1：组件中的响应式翻译

```typescript
function UserProfile() {
  const { t, locale } = useI18n();

  return (
    <div>
      <h1>{t('profile')}</h1>
      <p>{locale}</p>
    </div>
  );
}
```

### 场景 2：工具函数中的翻译

```typescript
import { t } from './i18n';

export function formatDate(date: Date) {
  return `${date.toLocaleDateString()} ${t('at')} ${date.toLocaleTimeString()}`;
}
```

### 场景 3：错误消息翻译

```typescript
import { t } from './i18n';

export class ApiError extends Error {
  constructor(code: string) {
    super(t(`errors.${code}`));
    this.name = 'ApiError';
  }
}
```

### 场景 4：表单验证翻译

```typescript
import { t } from './i18n';

export const validationSchema = {
  email: {
    required: t('validationEmailRequired'),
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: t('validationEmailInvalid'),
    },
  },
};
```

### 场景 5：条件渲染中的翻译

```typescript
function ConditionalComponent() {
  const { t } = useI18n(); // ✅ 在顶层调用 Hook
  const [showDetails, setShowDetails] = useState(false);

  // ✅ 在条件中使用 t 函数（不是 Hook）
  if (showDetails) {
    return <div>{t('details')}</div>;
  }

  return <button onClick={() => setShowDetails(true)}>{t('showMore')}</button>;
}
```

---

## API 对比

### useI18n vs useTranslation

| 特性 | useI18n | useTranslation |
|------|---------|----------------|
| 用途 | 主要 Hook | 带 namespace 支持 |
| 返回 t 函数 | ✅ | ✅ |
| 返回 locale | ✅ | 通过 `i18n.locale` |
| 返回 setLocale | ✅ | 通过 `i18n.setLocale` |
| 返回 isReady | ✅ | 通过 `ready` |
| Namespace 支持 | ❌ | ✅ |
| 推荐使用 | ✅ 主要使用 | 特殊场景（namespace）|

### Hook 方式 vs 全局实例

| 特性 | Hook (`useI18n`) | 全局实例 (`t`) |
|------|------------------|----------------|
| 响应式 | ✅ 自动重新渲染 | ❌ 不响应式 |
| 使用场景 | React 组件 | 纯函数、类、异步 |
| 调用位置 | 组件顶层 | 任何地方 |
| 条件判断 | ❌ 违反 Hook 规则 | ✅ 可以使用 |
| 循环中 | ❌ 违反 Hook 规则 | ✅ 可以使用 |
| 类方法 | ❌ 无法使用 | ✅ 可以使用 |

---

## 总结

### ✅ 推荐做法

1. **在组件中** - 使用 `useI18n()` Hook
2. **在纯函数中** - 使用全局 `t` 函数
3. **需要 namespace** - 使用 `useTranslation(ns)` Hook
4. **需要引擎实例** - 使用导出的 `engine`

### ❌ 避免的做法

1. ❌ 重复调用 Hook
```typescript
const { t } = useI18n();
const { locale } = useI18n(); // ❌ 重复调用
```

2. ❌ 在条件中调用 Hook
```typescript
if (condition) {
  const { t } = useI18n(); // ❌ 违反 Hook 规则
}
```

3. ❌ 在纯函数中使用 Hook
```typescript
function formatPrice(price: number) {
  const { t } = useI18n(); // ❌ 无法使用
  return `${price} ${t('currency')}`;
}
```

### ✅ 正确做法

1. ✅ 一次性解构所有需要的属性
```typescript
const { t, locale, setLocale, isReady } = useI18n();
```

2. ✅ Hook 在顶层，t 函数在条件中
```typescript
const { t } = useI18n(); // ✅ 顶层
if (condition) {
  return <div>{t('key')}</div>; // ✅ 使用 t 函数
}
```

3. ✅ 纯函数中使用全局 t
```typescript
import { t } from './i18n';

function formatPrice(price: number) {
  return `${price} ${t('currency')}`; // ✅ 正确
}
```

---

## 参考

- [React Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)
- [TransLink I18n 文档](../../docs)
- [React Demo 源码](./src)
