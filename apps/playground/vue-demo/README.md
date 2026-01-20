# TransLink I18n Vue 3 Demo

这是一个**系统化验证** TransLink I18n Runtime API 的演示项目，通过 9 个独立场景全面展示各项功能。

## 🎯 项目定位

**功能验证平台** - 每个场景组件专门验证 Runtime 提供的特定 API，确保所有功能正确可用。

## 📋 演示场景

| # | 场景 | 验证的 API | 功能点 |
|---|------|-----------|--------|
| **01** | **基础翻译** | `t(key)` | 基础翻译、嵌套键、数组访问、默认值 |
| **02** | **语言切换** | `setLocale()`, `isLoading`, `availableLocales` | 响应式语言切换、加载状态 |
| **03** | **参数插值** | `t(key, params)` | 动态参数、多参数、转义 |
| **04** | **复数支持** | `t(key, { count })` | 自动复数化、语言规则 |
| **05** | **v-t 指令** | `v-t`, `v-t.html` | 指令基础、参数、HTML 模式 |
| **06** | **Translation 组件** | `<Translation />` | keypath、params、plural、tag |
| **07** | **全局属性** | `$t`, `$i18n`, `$locale` | 全局方法、Options API 兼容 |
| **08** | **加载状态** | `isReady`, `isLoading` | 初始化、加载状态管理 |
| **09** | **DevTools** | `window.__TRANSLINK_DEVTOOLS__` | 统计、追踪、导出 |

## 🚀 快速开始

### 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 启动开发服务器

```bash
# 方式 1: 直接启动（在 vue-demo 目录）
cd apps/playground/vue-demo
pnpm dev

# 方式 2: 使用根目录脚本
pnpm demo
# 然后选择 "vue-demo"
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## 📁 项目结构

```
vue-demo/
├── src/
│   ├── App.vue                          # 主应用（场景导航）
│   ├── main.ts                          # 入口文件（应用最佳实践）
│   ├── demos/                           # 场景验证组件
│   │   ├── 01-BasicTranslation.vue
│   │   ├── 02-LanguageSwitcher.vue
│   │   ├── 03-ParameterInterpolation.vue
│   │   ├── 04-PluralizationDemo.vue
│   │   ├── 05-DirectiveDemo.vue
│   │   ├── 06-TranslationComponent.vue
│   │   ├── 07-GlobalProperties.vue
│   │   ├── 08-LoadingStates.vue
│   │   ├── 09-DevToolsDemo.vue
│   │   └── demo-card-styles.css        # 共享样式
│   └── locales/                         # 翻译文件
│       ├── zh-CN.json
│       └── en-US.json
├── vite.config.ts                       # Vite 配置
├── translink.config.ts                  # CLI 配置
└── package.json
```

## ✅ Runtime API 验证清单

### useI18n() Composition API

- [x] **t(key, params, options)** - 翻译函数
  - 基础翻译
  - 参数插值
  - 嵌套键访问
  - 默认值 fallback

- [x] **locale** - 当前语言（ComputedRef）
  - 响应式获取
  - 自动更新 UI

- [x] **setLocale(lang)** - 切换语言
  - 异步切换
  - 错误处理

- [x] **availableLocales** - 可用语言列表
  - 动态获取支持的语言

- [x] **isReady** - 初始化状态
  - 条件渲染
  - 加载提示

- [x] **isLoading** - 加载状态
  - 切换时的状态
  - UI 禁用控制

### Vue 指令

- [x] **v-t="'key'"** - 基础指令
- [x] **v-t="{ key, params }"** - 带参数
- [x] **v-t.html** - HTML 模式
- [x] 响应式更新

### Vue 组件

- [x] **<Translation keypath="" />** - 基础用法
- [x] **<Translation :params="" />** - 参数支持
- [x] **<Translation :plural="" />** - 复数支持
- [x] **<Translation tag="" />** - 自定义标签
- [x] **<Translation>slot</Translation>** - 插槽支持

### 全局属性

- [x] **$t(key, params)** - 全局翻译方法
- [x] **$i18n** - 全局 i18n 实例
- [x] **$locale** - 当前语言访问
- [x] Options API 兼容性

### 高级功能

- [x] **参数插值** - `{{ name }}`, `{{ count }}`
- [x] **复数化** - 自动根据 count 选择形式
- [x] **DevTools** - 开发工具集成
- [x] **缓存** - 多级缓存策略
- [x] **懒加载** - 按需加载语言包
- [x] **错误处理** - Fallback 机制
- [x] **TypeScript** - 完整类型支持

## 🛠️ DevTools 使用

在开发环境下，打开浏览器控制台：

```javascript
// 查看帮助
window.__TRANSLINK_DEVTOOLS__.help()

// 查看统计信息
window.__TRANSLINK_DEVTOOLS__.printStats()

// 获取缺失的翻译键
window.__TRANSLINK_DEVTOOLS__.getMissingKeys()

// 导出缺失键为 JSON
window.__TRANSLINK_DEVTOOLS__.exportJSON()

// 导出缺失键为 CSV
window.__TRANSLINK_DEVTOOLS__.exportCSV()

// 清除缺失键记录
window.__TRANSLINK_DEVTOOLS__.clear()
```

## 🎨 特色功能

### 1. 场景导航

侧边栏提供清晰的场景导航，点击即可切换到对应的验证场景。

### 2. 实时验证

每个场景都包含：
- **代码示例** - 展示如何使用 API
- **实时结果** - 即时显示运行结果
- **API 清单** - 列出验证的 API 列表

### 3. 响应式设计

完全响应式布局，支持桌面端和移动端。

### 4. 快捷操作

提供快速切换语言和打开 DevTools 的便捷按钮。

## 📚 最佳实践应用

### 1. 入口配置 (main.ts)

```typescript
import { createI18n } from '@translink/i18n-runtime/vue';

const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],

  // ✅ 懒加载
  loadFunction: async (lang) => {
    return await import(`./locales/${lang}.json`);
  },

  // ✅ 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000,
  },

  // ✅ DevTools（仅开发环境）
  devTools: {
    enabled: import.meta.env.DEV,
    trackMissingKeys: true,
  },

  // ✅ 复数支持
  pluralization: {
    enabled: true,
  },
});
```

### 2. 组件中使用

```vue
<template>
  <div>
    <!-- 基础翻译 -->
    <h1>{{ t('app.title') }}</h1>

    <!-- 参数插值 -->
    <p>{{ t('greeting', { name: 'Alice' }) }}</p>

    <!-- 复数支持 -->
    <p>{{ t('items', { count: itemCount }) }}</p>

    <!-- v-t 指令 -->
    <p v-t="'app.description'" />

    <!-- Translation 组件 -->
    <Translation keypath="user.info" :params="{ name: 'Bob' }" />
  </div>
</template>

<script setup lang="ts">
import { useI18n, Translation } from '@translink/i18n-runtime/vue';

const { t, locale, setLocale, isLoading } = useI18n();

// 切换语言
const switchLanguage = async () => {
  await setLocale('en-US');
};
</script>
```

## 🔗 相关文档

- [Runtime API 文档](../../../packages/runtime/README.md)
- [Vue 最佳实践](../../../packages/runtime/examples/best-practices.md)
- [Vue 完整示例](../../../packages/runtime/examples/vue-example.md)
- [CLI 文档](../../../packages/cli/README.md)

## 💡 提示

1. **开发环境**：DevTools 自动追踪缺失的翻译键
2. **生产环境**：所有调试功能自动禁用
3. **性能监控**：使用 DevTools 查看缓存命中率
4. **翻译工作流**：使用 `pnpm i18n:extract` 提取新的翻译键

## 📝 CLI 命令

```bash
# 提取翻译键
pnpm i18n:extract

# 构建翻译文件
pnpm i18n:build

# 推送翻译到远程
pnpm i18n:push

# 拉取远程翻译
pnpm i18n:pull
```

## 🎓 学习路径

1. **开始**：运行 Demo，浏览各个场景
2. **理解**：查看每个场景的代码实现
3. **实践**：在自己的项目中应用这些 API
4. **优化**：参考最佳实践文档进一步优化

---

**开始探索代码，体验现代化的国际化开发！** 🚀
