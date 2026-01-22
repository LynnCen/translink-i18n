# TransLink React Demo

这是 `@translink/i18n-runtime` 的 React 集成演示应用。

## 📋 功能演示

本 Demo 专注于展示 **Runtime 功能**，不涉及 CLI 工具使用。

### 演示场景

1. **基础翻译** - t() 函数基本用法
2. **语言切换** - setLocale() 和语言状态管理
3. **参数插值** - 动态参数替换
4. **条件渲染** - 应用层实现的条件逻辑
5. **组件化使用** - 多组件中使用 useI18n
6. **Hooks 示例** - useI18n 的所有返回值
7. **加载状态** - isReady 和 isLoading 状态
8. **错误处理** - 缺失翻译和默认值
9. **性能测试** - 缓存和性能优化

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发服务器

```bash
pnpm dev
```

访问 `http://localhost:5173`

### 构建生产版本

```bash
pnpm build
```

## 📖 新架构特性

### 1. 使用原始文本

开发者直接使用原始文本作为翻译源：

```tsx
t('你好，世界！')          // ✅ 直接使用原文
t('Hello, {{name}}！', { name: 'Alice' })  // ✅ 支持插值
```

### 2. Hash 自动生成

Runtime 自动将原始文本哈希为 key：

```tsx
// 开发者代码
t('你好，世界！')

// Runtime 内部处理
generateHash('你好，世界！') → '11141210'

// 查找翻译
resources['11141210'] → 'Hello, World!'
```

### 3. 扁平化结构

移除了嵌套、复数、namespace 等复杂功能，只保留核心功能：

```tsx
// ✅ 支持
t('你好')
t('你好，{{name}}', { name: 'Alice' })
t('缺失的key', {}, { defaultValue: '默认值' })

// ❌ 不支持
t('nested.key.path')        // 嵌套
t('item', { count: 5 })     // 自动复数
```

## 🔧 配置说明

### `translink.config.ts`

```typescript
import { defineConfig } from '@translink/i18n-cli';

export default defineConfig({
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
  },
  extract: {
    patterns: ['src/**/*.{tsx,ts,jsx,js}'],
    functions: ['t', '$t', 'i18n.t'],
  },
  output: {
    directory: 'src/locales',
    format: 'json',
  },
});
```

### `src/i18n.ts`

```typescript
import { createI18n } from '@translink/i18n-runtime/react';

export const { Provider, t } = createI18n({
  defaultLocale: 'zh-CN',
  resources: {
    'zh-CN': () => import('./locales/zh-CN.json'),
    'en-US': () => import('./locales/en-US.json'),
  },
});
```

## 📝 最佳实践

### 1. 统一使用 useI18n

```tsx
function MyComponent() {
  const { t, locale, setLocale, isReady, isLoading } = useI18n();

  return (
    <div>
      <p>{t('欢迎')}</p>
      <button onClick={() => setLocale('en-US')}>
        {t('切换语言')}
      </button>
    </div>
  );
}
```

### 2. 全局 Provider

```tsx
import { Provider } from './i18n';

function App() {
  return (
    <Provider>
      <YourApp />
    </Provider>
  );
}
```

### 3. 非组件环境使用 t

```typescript
import { t } from './i18n';

// 在非 React 组件中使用
const message = t('提示信息');
console.log(message);
```

## 🔍 CLI 工具（可选）

语言文件由 CLI 工具生成（可选）：

```bash
# 提取文本
npx translink extract

# 导出为 Excel
npx translink export

# 从 Excel 导入
npx translink import translations.xlsx
```

## 📚 相关文档

- [Runtime API 文档](../../../docs/api/runtime.md)
- [CLI API 文档](../../../docs/api/cli.md)
- [架构设计文档](../../../docs/development/cli-runtime-architecture-design.md)

## 💡 提示

- **Demo 目的**：展示 Runtime 功能，不演示 CLI 工具
- **语言文件**：已由 CLI 预先生成，开发者无需手动编辑
- **Hash Keys**：语言文件使用 hash 作为 key，由 CLI 自动管理
