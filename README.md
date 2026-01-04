# TransLink I18n 项目文档

欢迎来到 TransLink I18n 项目文档中心！这里包含了项目的完整技术文档和开发教程。

## 📚 文档目录

### 技术方案

- [技术实施方案](./apps/docs/technical/technical-plan.md) - 项目整体技术架构和设计方案
- [详细实施计划](./apps/docs/technical/implementation-plan.md) - 具体的开发实施计划和代码规范
- [命名策略](./apps/docs/technical/naming-strategy.md) - 项目命名规范和品牌策略
- [ESLint & Prettier 配置指南](./apps/docs/technical/eslint-prettier-guide.md) - 代码格式化和检查工具配置

### 开发教程

- [01. Monorepo 基础架构搭建](./apps/docs/tutorials/01-monorepo-setup.md) - 从零搭建现代化 TypeScript monorepo 项目
- [02. CLI 工具核心开发](./apps/docs/tutorials/02-cli-core-development.md) - AST 文本提取、智能哈希生成和云端集成
- [03. 运行时库实现](./apps/docs/tutorials/03-runtime-implementation.md) - 多级缓存系统、框架适配器和插值处理
- [04. Vite 插件开发](./apps/docs/tutorials/04-vite-plugin-development.md) - 代码转换、热更新、懒加载和构建优化
- [05. 测试与文档](./apps/docs/tutorials/05-testing-and-documentation.md) - 全面测试覆盖、API文档和示例项目

### API 参考文档

- [API 文档总览](./apps/docs/api/README.md) - 完整的 API 文档导航
- [CLI API 文档](./apps/docs/api/cli.md) - 命令行工具完整 API 参考
- [Runtime API 文档](./apps/docs/api/runtime.md) - 运行时库核心 API 和框架集成
- [Vite Plugin API 文档](./apps/docs/api/vite-plugin.md) - Vite 插件配置和使用
- [TypeScript 类型文档](./apps/docs/api/typescript.md) - 完整的类型定义参考

### 使用指南

- [使用指南总览](./apps/docs/guides/README.md) - 完整的使用指南导航
- [快速开始](./apps/docs/guides/quick-start.md) - 5分钟快速上手指南
- [最佳实践](./apps/docs/best-practices.md) - 开发最佳实践和规范
- [迁移指南](./apps/docs/migration-guide.md) - 从其他 i18n 方案迁移
- [FAQ 常见问题](./apps/docs/faq.md) - 常见问题解答和故障排除

### 完整教程系列

我们已经完成了 TransLink I18n 的完整开发教程，涵盖从项目初始化到测试文档的全过程。每个教程都包含详细的步骤说明、完整的代码示例和验证清单。

## 🎯 项目概述

TransLink I18n 是一套现代化的国际化工具集，旨在为前端开发者提供：

- 🚀 **智能文本提取**: 基于 AST 的中文文本自动识别和哈希生成
- ☁️ **云端协作管理**: 集成维格表(Vika)的翻译协作平台
- ⚡ **开发体验优化**: 热更新、懒加载、构建时优化
- 🔧 **框架无关**: 支持 Vue3、React 等主流框架
- 📦 **现代工具链**: 基于 pnpm + Turborepo 的高效构建

## 🏗️ 项目架构

```
translink-i18n/
├── packages/
│   ├── cli/           # @translink/i18n-cli - CLI 工具
│   ├── runtime/       # @translink/i18n-runtime - 运行时库
│   └── vite-plugin/   # @translink/vite-plugin - Vite 插件
├── apps/
│   ├── docs/          # 文档站点
│   └── playground/    # 示例应用
├── apps/
│   ├── docs/          # 文档站点
│   │   ├── technical/ # 技术文档
│   │   ├── tutorials/ # 开发教程
│   │   └── api/       # API 文档
│   └── playground/    # 示例应用
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发命令

```bash
# 构建所有包
pnpm build

# 开发模式
pnpm dev

# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 运行测试
pnpm test
```

## 📖 如何使用文档

1. **技术方案文档** - 了解项目整体设计思路和技术选型
2. **开发教程** - 跟随教程学习具体的实现细节
3. **实施计划** - 查看详细的开发计划和代码规范

每个教程都包含：

- 📋 详细的步骤说明
- 💻 完整的代码示例
- 🎯 关键知识点总结
- ✅ 验证检查清单

## 🤝 贡献指南

欢迎为项目文档做出贡献！

### 文档结构规范

- 技术方案文档放在 `apps/docs/technical/` 目录
- 教程文档放在 `apps/docs/tutorials/` 目录
- 使用清晰的标题和目录结构
- 提供完整的代码示例
- 包含验证步骤和检查清单

### 教程编写规范

- 使用 `##-title.md` 格式命名
- 包含目标概述和最终效果
- 提供详细的步骤说明
- 解释关键配置的作用
- 提供验证方法

## 📝 更新日志

- **2024-09-18**: 创建项目文档结构
- **2024-09-18**: 完成 Monorepo 基础架构搭建教程
- **2024-09-18**: 完成 CLI 工具核心开发教程
- **2024-09-18**: 完成运行时库实现教程
- **2024-09-18**: 完成 Vite 插件开发教程
- **2024-09-18**: 完成测试与文档开发教程
- **2024-09-18**: 发布完整 API 参考文档
- **2024-09-18**: 发布快速开始使用指南

## 📧 联系方式

- 作者: lynncen
- 项目: TransLink I18n
- 许可: MIT

---

_持续更新中，敬请关注！_
