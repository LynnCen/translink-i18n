# 为什么选择 TransLink I18n？

> **不是另一个 i18n 库，而是一套完整的国际化解决方案**

---

## 🤔 市面上已经有 vue-i18n、react-i18next...

是的，它们都是优秀的库。那为什么还需要 TransLink I18n？

### 传统方案的局限

```javascript
// vue-i18n 的用法
<template>
  <h1>{{ $t('welcome.title') }}</h1>
  <p>{{ $t('welcome.description') }}</p>
</template>
```

**问题来了**：

❓ `welcome.title` 这个 Key 谁来维护？
❓ 翻译文件怎么给运营编辑？
❓ 如何确保代码和翻译文件同步？
❓ 新增文案后怎么批量翻译？

**传统库只解决了「运行时翻译」，没有解决「开发流程」的问题。**

---

## ✨ TransLink I18n 的不同

### 🔑 核心特性 1：自动哈希 Key

```javascript
// 传统：手动维护 Key
t('welcome.message')  // 需要记忆、需要规范

// TransLink：直接写中文
$tsl('欢迎使用我们的产品')  // 自动生成哈希 Key
```

**再也不用想 Key 叫什么名字了！**

### 📊 核心特性 2：Excel 工作流

```bash
# 导出给运营
translink export --format excel --output translations.xlsx

# 运营在 Excel 中翻译...

# 导入翻译
translink import --input translations.xlsx
```

**运营不需要学习技术，直接用 Excel 工作！**

### 🤖 核心特性 3：AI 自动翻译

```bash
# 一键翻译所有语言
translink translate --provider deepseek

# 或者指定目标语言
translink translate --to en-US,ja-JP
```

**支持 DeepSeek、OpenAI、Gemini、Anthropic 等主流 AI！**

### 📦 核心特性 4：独立包设计

```bash
# 只需要 CLI？
npm install @translink/i18n-cli

# 只需要运行时？
npm install @translink/i18n-runtime

# 需要 Vite 优化？
npm install @translink/vite-plugin-i18n
```

**按需安装，不绑定框架！**

---

## 📊 对比表

| 特性 | vue-i18n | react-i18next | TransLink I18n |
|-----|----------|---------------|----------------|
| 运行时翻译 | ✅ | ✅ | ✅ |
| 自动 Key 生成 | ❌ | ❌ | ✅ |
| AST 文本提取 | ❌ | ❌ | ✅ |
| Excel 工作流 | ❌ | ❌ | ✅ |
| AI 翻译集成 | ❌ | ❌ | ✅ |
| 框架无关核心 | ❌ | ❌ | ✅ |
| Vite 深度集成 | 部分 | 部分 | ✅ |
| HMR 热更新 | 部分 | 部分 | ✅ |

---

## 🎯 适用场景

### ✅ 非常适合

- 🏢 **企业项目**：需要运营参与翻译
- 🌍 **多语言网站**：支持 3+ 种语言
- 👥 **团队协作**：开发和翻译分工明确
- 🚀 **快速迭代**：频繁新增文案

### ⚠️ 可能过度

- 📝 **个人博客**：只有几十个文案
- 🔧 **内部工具**：只需要中英文
- 📦 **组件库**：无动态文案

---

## 🏗️ 架构优势

```
┌─────────────────────────────────────────────────────────┐
│                   TransLink I18n                         │
├─────────────────┬─────────────────┬─────────────────────┤
│      CLI        │    Runtime      │    Vite Plugin      │
│   开发时工具     │    运行时引擎    │     构建优化         │
├─────────────────┼─────────────────┼─────────────────────┤
│ • 文本提取      │ • 翻译查找      │ • 代码转换           │
│ • 哈希生成      │ • 语言切换      │ • 懒加载            │
│ • Excel导入导出 │ • 缓存管理      │ • HMR              │
│ • AI翻译       │ • 框架适配      │ • Tree-shaking      │
└─────────────────┴─────────────────┴─────────────────────┘
```

**三个独立的包，各司其职，按需组合。**

---

## 💬 用户评价

> "终于不用再手动维护那些 Key 了！" — 前端开发者

> "运营可以直接用 Excel，太方便了！" — 产品经理

> "AI 翻译帮我们节省了 90% 的翻译成本。" — 创业公司 CTO

---

## 🚀 快速体验

只需 3 步，体验 TransLink I18n：

```bash
# 1. 安装
npm install @translink/i18n-cli @translink/i18n-runtime

# 2. 初始化
npx translink init

# 3. 提取文本
npx translink extract
```

---

## 👉 下一步

准备好了吗？让我们开始安装：

[安装与配置](./03-installation.md)

---

> 💡 **一句话总结**
>
> TransLink I18n = vue-i18n 的运行时能力 + 自动化的开发工具 + AI 翻译加持
