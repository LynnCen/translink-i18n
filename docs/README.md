# TransLink I18n 项目文档

欢迎来到 TransLink I18n 项目文档中心！这里包含了项目的完整技术文档和开发教程。

## 📚 文档目录

### 技术方案
- [技术实施方案](../TECHNICAL_PLAN.md) - 项目整体技术架构和设计方案
- [详细实施计划](../IMPLEMENTATION_PLAN.md) - 具体的开发实施计划和代码规范
- [命名策略](../NAMING_STRATEGY.md) - 项目命名规范和品牌策略

### 开发教程
- [01. Monorepo 基础架构搭建](./tutorials/01-monorepo-setup.md) - 从零搭建现代化 TypeScript monorepo 项目
- [02. CLI 工具核心开发](./tutorials/02-cli-core-development.md) - AST 文本提取、智能哈希生成和云端集成
- [03. 运行时库实现](./tutorials/03-runtime-implementation.md) - 多级缓存系统、框架适配器和插值处理

### 即将发布的教程
- [ ] 04. Vite 插件开发 - 热更新和构建优化
- [ ] 05. 云端集成 - Vika API 集成和同步机制
- [ ] 06. 测试和部署 - 完整的测试策略和发布流程

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
├── tools/
│   └── eslint-config/ # 共享 ESLint 配置
└── docs/              # 项目文档
    └── tutorials/     # 开发教程
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
- 技术方案文档放在根目录
- 教程文档放在 `docs/tutorials/` 目录
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

## 📧 联系方式

- 作者: lynncen
- 项目: TransLink I18n
- 许可: MIT

---

*持续更新中，敬请关注！*
