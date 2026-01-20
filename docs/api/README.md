# TransLink I18n API 文档

欢迎使用 TransLink I18n API 文档。本文档提供了所有包的详细 API 参考。

## 📦 包概览

TransLink I18n 工具集包含以下核心包：

- **[@translink/i18n-cli](./cli.md)** - 命令行工具，用于文本提取、构建和云端同步
- **[@translink/i18n-runtime](./runtime.md)** - 运行时库，提供 i18n 引擎和框架适配器
- **[@translink/vite-plugin-i18n](./vite-plugin.md)** - Vite 插件，提供构建时转换和开发时热更新

## 🚀 快速导航

### 按使用场景

| 场景         | 相关 API                                              |
| ------------ | ----------------------------------------------------- |
| 项目初始化   | [CLI - init](./cli.md#init)                           |
| 文本提取     | [CLI - extract](./cli.md#extract)                     |
| 语言文件构建 | [CLI - build](./cli.md#build)                         |
| 云端同步     | [CLI - push/pull](./cli.md#push--pull)                |
| 运行时翻译   | [Runtime - I18nEngine](./runtime.md#i18nengine)       |
| Vue 集成     | [Runtime - Vue Adapter](./runtime.md#vue-adapter)     |
| React 集成   | [Runtime - React Adapter](./runtime.md#react-adapter) |
| Vite 构建    | [Vite Plugin](./vite-plugin.md)                       |

### 按功能分类

#### 🔧 开发工具

- [CLI 命令](./cli.md#commands)
- [配置文件](./cli.md#configuration)
- [Vite 插件配置](./vite-plugin.md#configuration)

#### 🌐 国际化核心

- [I18n 引擎](./runtime.md#i18nengine)
- [翻译函数](./runtime.md#translation-functions)
- [语言管理](./runtime.md#language-management)

#### ⚡ 性能优化

- [缓存管理](./runtime.md#cache-manager)
- [懒加载](./runtime.md#lazy-loading)
- [热更新](./vite-plugin.md#hot-module-replacement)

#### 🔌 框架集成

- [Vue 3 适配器](./runtime.md#vue-adapter)
- [React 适配器](./runtime.md#react-adapter)
- [TypeScript 支持](./typescript.md)

## 📖 API 文档结构

每个包的 API 文档都包含以下部分：

### 1. 概述 (Overview)

- 包的主要功能和用途
- 安装和基本使用方法
- 核心概念介绍

### 2. API 参考 (API Reference)

- 类和接口的详细说明
- 方法和属性的完整列表
- 参数类型和返回值说明

### 3. 类型定义 (Type Definitions)

- TypeScript 类型定义
- 接口和枚举说明
- 泛型参数说明

### 4. 示例代码 (Examples)

- 基本使用示例
- 高级功能演示
- 最佳实践代码

### 5. 配置选项 (Configuration)

- 配置对象结构
- 选项详细说明
- 默认值和推荐设置

## 🔍 API 搜索指南

### 按关键词搜索

| 关键词      | 相关 API                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------- |
| `extract`   | [CLI.extract()](./cli.md#extract), [ASTExtractor](./cli.md#astextractor)                     |
| `translate` | [I18nEngine.t()](./runtime.md#t), [useI18n()](./runtime.md#usei18n)                          |
| `cache`     | [CacheManager](./runtime.md#cache-manager), [缓存配置](./runtime.md#cache-options)           |
| `language`  | [changeLanguage()](./runtime.md#changelanguage), [loadLanguage()](./runtime.md#loadlanguage) |
| `plugin`    | [createI18nPlugin()](./vite-plugin.md#createi18nplugin)                                      |
| `config`    | [I18nConfig](./cli.md#i18nconfig), [插件配置](./vite-plugin.md#configuration)                |

### 按类型搜索

| 类型        | 描述            | 文档链接                          |
| ----------- | --------------- | --------------------------------- |
| `class`     | 主要的类定义    | 各包的主要类                      |
| `interface` | TypeScript 接口 | [类型定义](./typescript.md)       |
| `function`  | 函数和方法      | 各包的方法列表                    |
| `type`      | 类型别名        | [类型定义](./typescript.md)       |
| `enum`      | 枚举类型        | [枚举定义](./typescript.md#enums) |

## 📚 相关文档

- [使用指南](../guides/README.md) - 详细的使用教程
- [最佳实践](../best-practices.md) - 推荐的开发模式
- [迁移指南](../migration-guide.md) - 从其他 i18n 方案迁移
- [FAQ](../faq.md) - 常见问题解答
- [示例项目](../../examples/README.md) - 完整的示例代码

## 🆕 版本信息

当前 API 文档对应版本：

- `@translink/i18n-cli`: v1.0.0
- `@translink/i18n-runtime`: v1.0.0
- `@translink/vite-plugin-i18n`: v1.0.0

## 📝 API 变更日志

### v1.0.0 (初始版本)

- 发布核心 API
- CLI 工具完整功能
- Runtime 库基础功能
- Vite 插件集成

## 🤝 贡献指南

如果您发现 API 文档中的错误或需要改进的地方，请：

1. 在 [GitHub Issues](https://github.com/lynncen/translink-i18n/issues) 中报告问题
2. 提交 Pull Request 改进文档
3. 参与 [讨论](https://github.com/lynncen/translink-i18n/discussions) 提出建议

## 📄 许可证

本 API 文档遵循 [MIT License](../../LICENSE)。
