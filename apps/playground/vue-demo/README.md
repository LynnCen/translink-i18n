# TransLink Vue Demo

这是 `@translink/i18n-runtime` 的 Vue 3 集成演示应用。

## 📋 功能演示

本 Demo 专注于展示 **Runtime 功能**，不涉及 CLI 工具使用。

### 演示场景

1. **基础翻译** - t() 函数基本用法
2. **语言切换** - setLocale() 和语言状态管理
3. **参数插值** - 动态参数替换
4. **条件渲染** - 应用层实现的条件逻辑
5. **指令使用** - Vue 3 响应式系统集成
6. **组件化使用** - 多组件中使用 useI18n
7. **全局属性** - useI18n 的所有返回值
8. **加载状态** - isReady 和 isLoading 状态
9. **开发工具** - DevTools 和错误处理

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发服务器

```bash
pnpm dev
```

访问 `http://localhost:5174`

### 构建生产版本

```bash
pnpm build
```

## 📖 新架构特性

### 1. 使用原始文本

开发者直接使用原始文本作为翻译源：

```vue
<template>
  <div>
    <!-- ✅ 直接使用原文 -->
    <h1>{{ t('你好，世界！') }}</h1>

    <!-- ✅ 支持插值 -->
    <p>{{ t('你好，{{name}}！', { name: userName }) }}</p>
  </div>
</template>
```

### 2. Hash 自动生成

Runtime 自动将原始文本哈希为 key：

```typescript
// 开发者代码
t('你好，世界！')

// Runtime 内部处理
generateHash('你好，世界！') → '11141210'

// 查找翻译
resources['11141210'] → 'Hello, World!'
```

### 3. 扁平化结构

移除了嵌套、复数、namespace 等复杂功能，只保留核心功能：

```vue
<script setup lang="ts">
const { t } = useI18n();

// ✅ 支持
t('你好')
t('你好，{{name}}', { name: 'Alice' })
t('缺失的key', {}, { defaultValue: '默认值' })

// ❌ 不支持
t('nested.key.path')        // 嵌套
t('item', { count: 5 })     // 自动复数
</script>
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
    patterns: ['src/**/*.{vue,ts,js}'],
    functions: ['t', '$tsl', 'i18n.t'],
  },
  output: {
    directory: 'src/locales',
    format: 'json',
  },
});
```

### `src/main.ts`

```typescript
import { createApp } from 'vue';
import { createI18n } from '@translink/i18n-runtime/vue';
import App from './App.vue';

const i18n = createI18n({
  defaultLocale: 'zh-CN',
  resources: {
    'zh-CN': () => import('./locales/zh-CN.json'),
    'en-US': () => import('./locales/en-US.json'),
  },
});

const app = createApp(App);
app.use(i18n);
app.mount('#app');
```

## 📝 最佳实践

### 1. 使用 Composition API

```vue
<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale, setLocale, isReady, isLoading } = useI18n();
</script>

<template>
  <div>
    <p>{{ t('欢迎') }}</p>
    <button @click="() => setLocale('en-US')">
      {{ t('切换语言') }}
    </button>
  </div>
</template>
```

### 2. 响应式状态

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale } = useI18n();

// locale 是响应式 ref
const greeting = computed(() =>
  locale.value === 'zh-CN' ? t('你好') : t('Hello')
);
</script>
```

### 3. 模板中使用

```vue
<template>
  <div>
    <!-- 直接使用 -->
    <h1>{{ t('标题') }}</h1>

    <!-- 带参数 -->
    <p>{{ t('你好，{{name}}', { name: userName }) }}</p>

    <!-- 条件渲染 -->
    <span v-if="isLoading">{{ t('加载中...') }}</span>
    <span v-else>{{ t('加载完成') }}</span>
  </div>
</template>
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
- [Vue 最佳实践](../../../packages/runtime/examples/vue-example.md)

## 💡 提示

- **Demo 目的**：展示 Runtime 功能，不演示 CLI 工具
- **语言文件**：已由 CLI 预先生成，开发者无需手动编辑
- **Hash Keys**：语言文件使用 hash 作为 key，由 CLI 自动管理
- **响应式**：所有状态（locale、isReady、isLoading）都是响应式的
