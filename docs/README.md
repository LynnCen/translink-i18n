# TransLink I18n 文档

<div align="center">

🌍 **现代化、高效、易用的前端国际化解决方案**

[快速入门](#-快速入门) • [使用指南](#-使用指南) • [深度教学](#-深度教学) • [API 参考](#-api-参考)

</div>

---

## 📖 文档导航

### 🚀 快速入门
**新手必读，5分钟上手**

| 文档 | 说明 |
|-----|------|
| [什么是国际化？](./getting-started/01-what-is-i18n.md) | 从业务痛点理解国际化 |
| [为什么选择 TransLink？](./getting-started/02-why-translink.md) | 核心优势与设计理念 |
| [安装与配置](./getting-started/03-installation.md) | 完整安装步骤 |
| [5分钟快速体验](./getting-started/04-quick-example.md) | 动手创建第一个多语言应用 |

### 📚 使用指南
**日常开发参考**

| 分类 | 文档 |
|-----|------|
| **CLI 工具** | [命令详解](./user-guide/01-cli/commands.md) · [配置文件](./user-guide/01-cli/configuration.md) |
| **框架集成** | [Vue 3](./user-guide/02-frameworks/vue.md) · [React](./user-guide/02-frameworks/react.md) |
| **工作流** | [Excel 工作流](./user-guide/03-workflows/excel-workflow.md) · [AI 翻译](./user-guide/03-workflows/ai-translation.md) |
| **最佳实践** | [最佳实践汇总](./user-guide/04-best-practices.md) |

### 🎓 深度教学
**从0到1，理解原理**

| 阶段 | 文档 | 说明 |
|-----|------|------|
| **开篇** | [业务痛点剖析](./tutorials/00-business-pain-points.md) | ⭐ 理解"为什么" |
| **设计** | [方案设计思路](./tutorials/01-solution-design.md) | ⭐ 架构设计 |
| **基建** | [Monorepo 架构](./tutorials/02-monorepo-architecture.md) | pnpm + Turborepo |
| **核心** | [CLI 开发](./tutorials/03-cli-development.md) | AST + 哈希生成 |
| **核心** | [Runtime 实现](./tutorials/04-runtime-implementation.md) | 翻译引擎 + 缓存 |
| **集成** | [Vite 插件](./tutorials/05-vite-plugin.md) | HMR + 代码转换 |
| **扩展** | [插件系统](./tutorials/06-plugin-system.md) | 插件接口设计 |
| **进阶** | [AI 翻译](./tutorials/07-ai-translation.md) | Provider 抽象层 |
| **优化** | [构建优化](./tutorials/08-build-optimization.md) | Tree-shaking |

### 📋 API 参考
**完整 API 文档**

| 包 | 文档 |
|---|------|
| `@translink/i18n-cli` | [CLI API](./api-reference/cli.md) |
| `@translink/i18n-runtime` | [Runtime API](./api-reference/runtime.md) |
| `@translink/vite-plugin-i18n` | [Vite Plugin API](./api-reference/vite-plugin.md) |
| TypeScript 类型 | [类型定义](./api-reference/types.md) |

### 🔧 问题排查

| 文档 | 说明 |
|-----|------|
| [常见问题 FAQ](./troubleshooting/faq.md) | 最常见问题的解答 |
| [迁移指南](./troubleshooting/migration.md) | 从其他方案迁移 |

### 📎 附录

| 文档 | 说明 |
|-----|------|
| [术语表](./appendix/glossary.md) | 术语和缩写说明 |
| [贡献指南](./appendix/contributing.md) | 参与项目开发 |

---

## 🎯 按角色查找

### 👨‍💻 我是前端开发者
1. [快速入门](./getting-started/) → 5分钟上手
2. [Vue](./user-guide/02-frameworks/vue.md) / [React](./user-guide/02-frameworks/react.md) 集成 → 框架对接
3. [最佳实践](./user-guide/04-best-practices.md) → 规范开发

### 📝 我是翻译人员/运营
1. [Excel 工作流](./user-guide/03-workflows/excel-workflow.md) → 翻译管理
2. [CLI 命令](./user-guide/01-cli/commands.md) → 导入导出

### 🤖 我想使用 AI 翻译
1. [AI 翻译指南](./user-guide/03-workflows/ai-translation.md) → 配置和使用
2. [配置文件](./user-guide/01-cli/configuration.md#ai-翻译配置) → 详细配置

### 🔧 我想了解实现原理
1. [业务痛点](./tutorials/00-business-pain-points.md) → 理解问题
2. [深度教学](./tutorials/) → 从0到1实现

---

## 📦 包文档

各包的独立文档：

- [@translink/i18n-cli](../packages/cli/README.md) - CLI 工具包
- [@translink/i18n-runtime](../packages/runtime/README.md) - 运行时包
- [@translink/vite-plugin-i18n](../packages/vite-plugin/README.md) - Vite 插件包
- [@translink/plugin-vika](../packages/plugins/vika/README.md) - Vika 插件包

---

## 🔗 外部链接

- [GitHub 仓库](https://github.com/lynncen/translink-i18n)
- [问题反馈](https://github.com/lynncen/translink-i18n/issues)
- [讨论区](https://github.com/lynncen/translink-i18n/discussions)

---

**文档版本**：v2.0.0
**更新时间**：2026-01-29
