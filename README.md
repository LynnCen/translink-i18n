# TransLink I18n

<div align="center">

🌍 现代化、高效、易用的前端国际化解决方案

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](https://www.typescriptlang.org/)

[快速开始](#-快速开始) • [完整文档](#-完整文档) • [示例项目](#-示例项目)

</div>

---

## ✨ 特性

- 🚀 **智能文本提取** - 基于 AST 的中文文本自动识别和哈希生成
- 🤖 **AI 自动翻译** - 集成 OpenAI、Gemini、DeepSeek、Anthropic，一键翻译多语言 🆕
- 📦 **独立包设计** - 每个包可独立安装使用，零相互依赖
- 📊 **Excel 工作流** - 支持导出/导入 Excel，运营友好的翻译管理
- 🔌 **插件系统** - 可扩展的插件架构，支持自定义翻译管理方案
- ⚡ **开发体验** - 热更新、懒加载、构建时优化
- 🔧 **框架支持** - 支持 Vue3、React 等主流框架
- 📝 **TypeScript** - 完整的类型定义和智能提示

---

## 📦 包结构

TransLink I18n 采用 Monorepo 架构，包含以下独立包：

| 包名                                                  | 版本  | 描述                                  | 依赖         |
| ----------------------------------------------------- | ----- | ------------------------------------- | ------------ |
| [@translink/i18n-cli](./packages/cli)                 | 1.0.0 | CLI 工具（文本提取、构建、导出/导入） | 零依赖       |
| [@translink/i18n-runtime](./packages/runtime)         | 1.0.0 | 运行时库（翻译引擎、框架适配）        | 零依赖       |
| [@translink/vite-plugin-i18n](./packages/vite-plugin) | 1.0.0 | Vite 插件（构建时转换、HMR）          | 依赖 Runtime |
| [@translink/plugin-vika](./packages/plugins/vika)     | 1.0.0 | Vika 云端翻译管理插件（可选）         | 依赖 CLI     |

---

## 🚀 快速开始

### 方案 A：Excel 工作流（推荐）

适合团队协作，运营可直接在 Excel 中编辑翻译。

#### 1. 安装 CLI 工具

```bash
npm install -D @translink/i18n-cli
# 或
pnpm add -D @translink/i18n-cli
```

#### 2. 初始化项目

```bash
npx translink init
```

这会生成配置文件 `i18n.config.ts`：

```typescript
export default {
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    functions: ['t', '$t', '$tsl'],
  },
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP'],
  },
  output: {
    directory: 'locales',
  },
};
```

#### 3. 提取文本

```bash
npx translink extract
```

扫描代码，提取中文文本到 `locales/zh-CN.json`。

#### 4. 导出 Excel

```bash
npx translink export --format excel --output translations.xlsx
```

生成 Excel 文件，包含：

- **key**: 翻译键
- **zh-CN**, **en-US**, **ja-JP**: 各语言列
- **context**: 上下文信息
- **file**, **line**: 源代码位置

#### 5. 运营翻译

将 `translations.xlsx` 发给运营或翻译人员，在 Excel 中编辑翻译。

#### 6. 导入翻译

```bash
npx translink import --input translations.xlsx
```

将 Excel 中的翻译更新回 JSON 文件。

#### 7. 构建

```bash
npx translink build
```

优化和压缩翻译文件。

---

### 方案 B：JSON 工作流

适合小型项目或个人开发，直接编辑 JSON 文件。

```bash
# 1. 提取文本
npx translink extract

# 2. 手动编辑 locales/*.json 文件

# 3. 构建
npx translink build
```

---

### 方案 C：Vika 云端工作流（可选插件）

适合需要在线协作的团队。

#### 1. 安装 Vika 插件

```bash
npm install -D @translink/plugin-vika
```

#### 2. 配置插件

在 `i18n.config.ts` 中添加：

```typescript
export default {
  // ... 其他配置
  plugins: [
    [
      '@translink/plugin-vika',
      {
        apiKey: process.env.VIKA_API_KEY,
        datasheetId: process.env.VIKA_DATASHEET_ID,
      },
    ],
  ],
};
```

#### 3. 使用 Vika 命令

```bash
# 推送到 Vika
npx translink push

# 从 Vika 拉取
npx translink pull
```

---

## 📖 CLI 命令详解

### `translink init`

初始化项目配置文件。

```bash
npx translink init [options]

选项:
  -f, --force    强制覆盖已存在的配置文件
```

### `translink extract`

提取代码中的文本。

```bash
npx translink extract [options]

选项:
  -c, --config <path>    指定配置文件路径
  -w, --watch           监听文件变化，自动提取
```

### `translink export`

导出翻译为 Excel/CSV/JSON。

```bash
npx translink export [options]

选项:
  -f, --format <type>    导出格式 (excel|csv|json)
  -o, --output <path>    输出文件路径
```

### `translink import`

从 Excel/CSV/JSON 导入翻译。

```bash
npx translink import [options]

选项:
  -i, --input <path>     输入文件路径
  --force               强制覆盖已存在的翻译
```

### `translink build`

构建和优化翻译文件。

```bash
npx translink build [options]

选项:
  -m, --minify    压缩输出
  -s, --split     按语言分割输出
```

### `translink analyze`

分析翻译覆盖率。

```bash
npx translink analyze [options]

选项:
  --format <type>    输出格式 (json|table|html)
```

### `translink translate`

使用 AI 自动翻译多语言文件。🆕

```bash
npx translink translate [options]

选项:
  -f, --from <lang>         源语言 (默认为配置的默认语言)
  -t, --to <langs>          目标语言，逗号分隔
  -p, --provider <name>     AI 提供商 (deepseek|gemini|openai|anthropic)
  --stream                  启用流式翻译
  --force                   强制重新翻译已有的翻译
  --keys <keys>             只翻译指定的键，逗号分隔
  --dry-run                 预览模式，不写入文件
  --estimate-cost           估算翻译成本
```

**示例：**

```bash
# 翻译所有支持的语言
npx translink translate

# 使用 DeepSeek 翻译成英文和日文
npx translink translate --provider deepseek --to en-US,ja-JP

# 预览翻译结果（不写入文件）
npx translink translate --dry-run

# 估算翻译成本
npx translink translate --estimate-cost
```

**支持的 AI 提供商：**

| 提供商 | 模型 | 成本 | 特点 |
|--------|------|------|------|
| DeepSeek | deepseek-chat | ⭐⭐⭐⭐⭐ | 性价比高，适合大批量翻译 |
| Gemini | gemini-pro | ⭐⭐⭐⭐⭐ | 免费额度，适合测试和小项目 |
| OpenAI | gpt-4-turbo | ⭐⭐ | 质量最高，适合专业文档 |
| Anthropic | claude-3-sonnet | ⭐ | 长文本友好，适合复杂上下文 |

**配置 AI 翻译：**

在 `i18n.config.ts` 中添加：

```typescript
export default {
  // ... 其他配置
  
  // AI 翻译配置
  aiTranslation: {
    defaultProvider: 'deepseek',
    providers: {
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY,
        model: 'deepseek-chat',
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-pro',
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4-turbo-preview',
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-3-sonnet-20240229',
      },
    },
    options: {
      cache: true,
      batchSize: 20,
      concurrency: 3,
      // 术语表（保持翻译一致性）
      glossary: {
        '应用': 'Application',
        '用户': 'User',
        '设置': 'Settings',
      },
    },
  },
};
```

更多配置和使用说明，请查看 [AI 翻译使用指南](./docs/guides/ai-translation.md)。

---

## 🎨 在应用中使用

### Vue 3

#### 1. 安装

```bash
npm install @translink/i18n-runtime
npm install -D @translink/vite-plugin-i18n
```

#### 2. 配置 Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import i18n from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    vue(),
    i18n({
      localesDir: './locales',
      defaultLanguage: 'zh-CN',
    }),
  ],
});
```

#### 3. 使用

```vue
<template>
  <div>
    <!-- 模板中使用 -->
    <h1>{{ $tsl('欢迎使用 TransLink I18n') }}</h1>
    <p>{{ $t('hello', { name: '张三' }) }}</p>
  </div>
</template>

<script setup>
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, tsl, locale, setLocale } = useI18n();

// Composition API 中使用
const greeting = tsl('你好，世界');

// 切换语言
const switchLanguage = () => {
  setLocale('en-US');
};
</script>
```

---

### React

#### 1. 安装

```bash
npm install @translink/i18n-runtime
npm install -D @translink/vite-plugin-i18n
```

#### 2. 配置

```typescript
// main.tsx
import { I18nProvider } from '@translink/i18n-runtime/react';
import { i18nEngine } from './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider engine={i18nEngine}>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
```

#### 3. 使用

```tsx
import { useI18n } from '@translink/i18n-runtime/react';

function App() {
  const { t, tsl, setLocale } = useI18n();

  return (
    <div>
      <h1>{tsl('欢迎使用 TransLink I18n')}</h1>
      <p>{t('hello', { name: '张三' })}</p>
      <button onClick={() => setLocale('en-US')}>切换语言</button>
    </div>
  );
}
```

---

## 🔌 插件开发

TransLink I18n 支持自定义插件扩展。

### 创建插件

```typescript
// my-plugin.ts
import type { I18nPlugin } from '@translink/i18n-cli/plugins';

const MyPlugin: I18nPlugin = {
  metadata: {
    name: 'my-plugin',
    version: '1.0.0',
    description: '我的自定义插件',
    author: 'your-name',
  },

  async init(context, config) {
    // 初始化逻辑
  },

  async push(data) {
    // 推送翻译到你的平台
    return {
      success: true,
      message: '推送成功',
      count: Object.keys(data.translations).length,
    };
  },

  async pull(data) {
    // 从你的平台拉取翻译
    return {
      success: true,
      message: '拉取成功',
      translations: {},
      count: 0,
    };
  },
};

export default MyPlugin;
```

### 使用插件

```typescript
// i18n.config.ts
export default {
  // ... 其他配置
  plugins: [
    [
      './my-plugin.ts',
      {
        /* 插件配置 */
      },
    ],
  ],
};
```

更多插件开发文档，请参考 [插件开发指南](./apps/docs/plugin-development.md)。

---

## 📊 配置文件完整示例

```typescript
// i18n.config.ts
import type { I18nConfig } from '@translink/i18n-cli';

export default {
  // 提取配置
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**'],
    functions: ['t', '$t', '$tsl'],
    extensions: ['.vue', '.ts', '.tsx', '.js', '.jsx'],
  },

  // 哈希配置
  hash: {
    algorithm: 'md5',
    length: 8,
    prefix: '',
  },

  // 语言配置
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
  },

  // 输出配置
  output: {
    directory: 'locales',
    format: 'json',
    indent: 2,
  },

  // 插件配置（可选）
  plugins: [
    // Excel 插件（内置）
    [
      'excel',
      {
        template: './templates/translation.xlsx',
      },
    ],

    // Vika 插件（需要单独安装）
    [
      '@translink/plugin-vika',
      {
        apiKey: process.env.VIKA_API_KEY,
        datasheetId: process.env.VIKA_DATASHEET_ID,
      },
    ],
  ],
} satisfies I18nConfig;
```

---

## 🏗️ 项目架构

```
translink-i18n/
├── packages/
│   ├── cli/                      # @translink/i18n-cli
│   │   ├── src/
│   │   │   ├── commands/         # CLI 命令
│   │   │   ├── extractors/       # 文本提取器
│   │   │   ├── generators/       # 哈希生成器
│   │   │   ├── plugins/          # 插件系统
│   │   │   └── utils/            # 工具函数
│   │   └── tests/                # 测试文件
│   │
│   ├── runtime/                  # @translink/i18n-runtime
│   │   ├── src/
│   │   │   ├── core/             # 核心引擎
│   │   │   ├── adapters/         # 框架适配器
│   │   │   └── types/            # 类型定义
│   │   └── tests/                # 测试文件
│   │
│   ├── vite-plugin/              # @translink/vite-plugin-i18n
│   │   ├── src/
│   │   │   ├── core/             # 核心逻辑
│   │   │   └── utils/            # 工具函数
│   │   └── tests/                # 测试文件
│   │
│   └── plugins/                  # 可选插件
│       └── vika/                 # @translink/plugin-vika
│           ├── src/
│           └── tests/
│
├── apps/
│   ├── docs/                     # 文档站点
│   └── playground/               # 示例应用
│
└── docs/                         # 项目文档
    ├── REFACTOR_PLAN.md          # 重构方案
    ├── PROJECT_AUDIT_REPORT.md   # 项目审查报告
    └── I18N_ARCHITECTURE_GUIDE.md # 架构指南
```

---

## 📚 完整文档

**[📖 查看完整文档](./docs/)**

### 核心文档

- [快速开始](./docs/quick-start.md) - 5分钟快速上手
- [架构概览](./docs/architecture.md) - 系统架构设计
- [最佳实践](./docs/best-practices.md) - 开发最佳实践
- [常见问题](./docs/faq.md) - FAQ

### 技术教程

深入学习如何从零构建国际化解决方案：

- [教程系列总览](./docs/tutorials/) - 完整技术教程
  - [1. Monorepo 架构设计](./docs/tutorials/01-monorepo-architecture.md) - pnpm + Turborepo + TypeScript
  - [2. CLI 工具开发](./docs/tutorials/02-cli-development.md) - Commander + AST + 哈希生成
  - [3. Runtime 运行时实现](./docs/tutorials/03-runtime-implementation.md) - 翻译引擎 + 缓存 + 框架适配
  - [4. Vite 插件开发](./docs/tutorials/04-vite-plugin.md) - 虚拟模块 + HMR + 代码转换
  - [5. 插件系统设计](./docs/tutorials/05-plugin-system.md) - 接口设计 + 生命周期 + Vika 插件
  - [6. 构建与优化](./docs/tutorials/06-build-optimization.md) - tsup + Tree-shaking + 性能优化
  - [7. AI 翻译功能实现](./docs/tutorials/07-ai-translation.md) - Provider 抽象 + 批量优化 + 错误处理 🆕

### 使用指南

- [AI 自动翻译](./docs/guides/ai-translation.md) - 使用 AI 自动翻译文本 🆕
- [Excel 工作流](./docs/guides/excel-workflow.md) - 使用 Excel 管理翻译
- [TypeScript 配置](./docs/guides/typescript-config.md) - TypeScript 配置说明
- [插件开发](./docs/guides/plugin-development.md) - 开发自定义插件
- [迁移指南](./docs/guides/migration.md) - 从其他方案迁移

### API 文档

- [CLI API](./docs/api/cli.md) - 命令行工具 API
- [Runtime API](./docs/api/runtime.md) - 运行时库 API
- [Vite Plugin API](./docs/api/vite-plugin.md) - Vite 插件 API
- [TypeScript 类型](./docs/api/types.md) - 类型定义
- [项目审查](./PROJECT_AUDIT_REPORT.md) - 项目质量审查

---

## 🛣️ Roadmap

### 已完成 ✅

- [x] 基础架构搭建（Monorepo + TypeScript + Turborepo）
- [x] CLI 工具核心功能（extract、build、init、analyze）
- [x] Runtime 核心引擎和框架适配器（Vue3、React）
- [x] Vite 插件开发（代码转换、HMR）
- [x] 完全解耦的包设计（零相互依赖）
- [x] Excel 导出/导入功能
- [x] 插件系统架构
- [x] Vika 插件（独立包）

### 进行中 🚧

- [ ] 完善测试覆盖（目标 80%+）
- [ ] 性能优化（AST 缓存、并发控制）
- [ ] 文档完善

### 计划中 📝

- [ ] 支持更多框架（Svelte、Angular）
- [ ] CLI 交互式UI
- [ ] VSCode 插件
- [ ] Web 管理界面
- [ ] 更多翻译平台插件（Crowdin、Lokalise等）

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 [MIT](./LICENSE) 许可证。

---

## 🙏 致谢

感谢以下开源项目的启发：

- [vue-i18n](https://github.com/intlify/vue-i18n-next)
- [react-i18next](https://github.com/i18next/react-i18next)
- [GoGoCode](https://github.com/thx/gogocode)

---

## 📧 联系方式

- 作者: lynncen
- 项目: [TransLink I18n](https://github.com/lynncen/translink-i18n)
- 问题反馈: [GitHub Issues](https://github.com/lynncen/translink-i18n/issues)

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！**

</div>
