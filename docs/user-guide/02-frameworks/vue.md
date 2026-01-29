# Vue 3 集成指南

> **完整的 Vue 3 项目国际化集成方案**

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
import vue from '@vitejs/plugin-vue';
import i18nPlugin from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    vue(),
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
// src/main.ts
import { createApp } from 'vue';
import { createI18n } from '@translink/i18n-runtime/vue';
import App from './App.vue';

const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
});

const app = createApp(App);
app.use(i18n);
app.mount('#app');
```

---

## 📝 使用方式

### Composition API（推荐）

```vue
<template>
  <div>
    <h1>{{ t('welcome') }}</h1>
    <p>{{ t('greeting', { name: '张三' }) }}</p>
    <button @click="switchLanguage">
      {{ locale === 'zh-CN' ? 'English' : '中文' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale, setLocale } = useI18n();

const switchLanguage = () => {
  setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN');
};
</script>
```

### Options API

```vue
<template>
  <div>
    <h1>{{ $tsl('欢迎使用') }}</h1>
    <p>{{ $t('greeting', { name: '张三' }) }}</p>
  </div>
</template>

<script>
export default {
  methods: {
    switchLanguage() {
      this.$i18n.setLocale('en-US');
    }
  }
}
</script>
```

### 模板语法

```vue
<template>
  <!-- 基本翻译 -->
  <h1>{{ $tsl('欢迎') }}</h1>

  <!-- 带参数 -->
  <p>{{ $tsl('你好，{{name}}', { name: userName }) }}</p>

  <!-- 在属性中使用 -->
  <input :placeholder="$tsl('请输入用户名')" />

  <!-- 在指令中使用 -->
  <button :title="$tsl('点击提交')">
    {{ $tsl('提交') }}
  </button>
</template>
```

---

## 🔧 useI18n API

```typescript
const {
  t,           // 翻译函数
  locale,      // 当前语言（ref）
  setLocale,   // 切换语言
  isReady,     // 是否就绪
  isLoading,   // 是否加载中
  availableLocales,  // 支持的语言列表
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
// 切换语言
await setLocale('en-US');

// 切换后页面自动更新
```

---

## 🎨 进阶用法

### 监听语言变化

```typescript
import { watch } from 'vue';

const { locale } = useI18n();

watch(locale, (newLocale) => {
  // 更新 HTML lang 属性
  document.documentElement.lang = newLocale;

  // 保存到 localStorage
  localStorage.setItem('locale', newLocale);
});
```

### 懒加载语言包

```typescript
// main.ts
const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  loadFunction: async (lang) => {
    const module = await import(`./locales/${lang}.json`);
    return module.default;
  },
});
```

### 处理加载状态

```vue
<template>
  <div v-if="!isReady">
    加载中...
  </div>
  <div v-else>
    <h1>{{ t('welcome') }}</h1>
  </div>
</template>

<script setup>
const { t, isReady } = useI18n();
</script>
```

### 全局方法

```typescript
// 在非组件代码中使用
import { t } from '@/i18n';

export function formatError(code: number) {
  return t(`error.${code}`, { defaultValue: '未知错误' });
}
```

---

## 📁 推荐目录结构

```
src/
├── locales/
│   ├── zh-CN.json
│   └── en-US.json
├── i18n/
│   └── index.ts      # i18n 初始化
├── components/
├── views/
├── App.vue
└── main.ts
```

---

## 🔧 TypeScript 支持

### 类型声明

```typescript
// src/types/i18n.d.ts
declare module '@translink/i18n-runtime/vue' {
  export function useI18n(): {
    t: (key: string, params?: Record<string, any>) => string;
    locale: import('vue').Ref<string>;
    setLocale: (lang: string) => Promise<void>;
    isReady: import('vue').Ref<boolean>;
    isLoading: import('vue').Ref<boolean>;
    availableLocales: string[];
  };
}
```

### 全局属性类型

```typescript
// src/types/vue.d.ts
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $tsl: (key: string, params?: Record<string, any>) => string;
    $t: (key: string, params?: Record<string, any>) => string;
    $i18n: {
      locale: string;
      setLocale: (lang: string) => Promise<void>;
    };
  }
}
```

---

## ❓ 常见问题

### Q: 切换语言后页面没有更新？

确保使用 `locale` ref 响应式地获取当前语言：

```typescript
// ✅ 正确
const { locale } = useI18n();
console.log(locale.value);

// ❌ 错误（非响应式）
const currentLocale = locale.value;
```

### Q: 如何持久化语言设置？

```typescript
// 初始化时读取
const savedLocale = localStorage.getItem('locale') || 'zh-CN';

const i18n = createI18n({
  defaultLanguage: savedLocale,
  // ...
});

// 切换时保存
watch(locale, (newLocale) => {
  localStorage.setItem('locale', newLocale);
});
```

### Q: 如何在路由守卫中使用？

```typescript
// router/index.ts
import { t } from '@/i18n';

router.beforeEach((to, from, next) => {
  document.title = t(`routes.${to.name}`) || 'My App';
  next();
});
```

---

## 📚 相关文档

- [React 集成](./react.md)
- [CLI 命令](../01-cli/commands.md)
- [最佳实践](../04-best-practices.md)
