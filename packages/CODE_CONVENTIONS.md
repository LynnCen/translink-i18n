# 包代码约定文档

> 本文档说明各包之间的代码约定，用于管理代码冗余和保持包独立性

## 📋 概述

为了保持各包的完全独立性，我们**不创建共享包**。相反，我们通过文档和约定来管理重复代码。

## 🔧 工具类约定

### Logger（日志工具）

各包都有自己的 Logger 实现，这是**有意为之**的设计：

#### CLI 包 (`packages/cli/src/utils/logger.ts`)
- **依赖**: `chalk`, `ora`
- **特点**: 支持 spinner（加载动画），适合 CLI 交互
- **用途**: 命令行工具的输出

#### Vite Plugin 包 (`packages/vite-plugin/src/utils/logger.ts`)
- **依赖**: `picocolors`
- **特点**: 轻量级，支持日志级别和分组
- **用途**: 构建工具的输出

#### Runtime 包
- **实现**: 使用原生 `console.*`
- **原因**: Runtime 包需要最小体积，不引入额外依赖

**约定**: 各包保持独立的 Logger 实现，不共享。

## 📝 类型定义约定

### 命名规范

为了避免类型冲突，各包的类型定义遵循以下命名规范：

#### CLI 包 (`packages/cli/src/types/`)
- 前缀: `I18n` 或 `Extract` 或 `Build`
- 示例: `I18nConfig`, `ExtractConfig`, `ExtractResult`

#### Runtime 包 (`packages/runtime/src/types/`)
- 前缀: `I18n` 或 `Translation` 或 `Cache`
- 示例: `I18nOptions`, `TranslationResource`, `CacheOptions`

#### Vite Plugin 包 (`packages/vite-plugin/src/types/`)
- 前缀: `I18nPlugin` 或 `Transform`
- 示例: `I18nPluginOptions`, `TransformContext`

**约定**: 各包的类型定义使用不同的前缀，避免命名冲突。

### 类型导出规范

各包应该：
1. 在 `src/types/index.ts` 中集中导出所有类型
2. 在包的 `src/index.ts` 中重新导出类型
3. 使用 `export type` 导出类型（避免值导出）

## 🔄 工具函数约定

### 哈希生成

- **CLI 包**: `packages/cli/src/generators/hash-generator.ts`
- **用途**: 为提取的文本生成哈希键

**约定**: 哈希算法和实现应该保持一致，但各包独立维护。

### 文件路径处理

各包可能需要处理文件路径，应该：
- 使用 Node.js 内置的 `path` 模块
- 避免引入额外的路径处理库
- 统一使用 `path.posix` 或 `path.win32`（根据需求）

## 📦 依赖管理约定

### 最小化依赖

各包应该：
1. 只包含必需的依赖
2. 使用 `peerDependencies` 处理可选依赖（如 Vue、React）
3. 避免引入其他内部包作为依赖

### 当前依赖状态

#### CLI 包
- ✅ 独立，无内部依赖
- ⚠️ 未来需要移除 Vika 依赖（阶段一）

#### Runtime 包
- ✅ 独立，无内部依赖
- ✅ Vue/React 为可选 peerDependency

#### Vite Plugin 包
- ❌ 当前依赖 CLI（不合理）
- ⚠️ 未来需要移除 CLI 依赖，只依赖 Runtime（阶段一）

## 🎯 未来优化方向

虽然当前保持各包独立，但未来可以考虑：

1. **共享类型定义**（如果类型确实需要共享）
   - 创建 `@translink/shared-types` 包
   - 但需要评估是否真的需要

2. **工具函数库**（如果工具函数确实需要共享）
   - 创建 `@translink/shared-utils` 包
   - 但需要评估是否真的需要

3. **当前策略**（推荐）
   - 保持各包完全独立
   - 通过文档和约定管理重复代码
   - 只在真正需要时才创建共享包

## 📚 相关文档

- [重构计划](../REFACTOR_PLAN.md) - 详细的架构设计
- [审查报告](../PROJECT_AUDIT_REPORT.md) - 发现的问题和解决方案

---

**最后更新**: 2026-01-03  
**维护者**: 项目团队

