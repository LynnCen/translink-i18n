# TransLink I18n 使用指南

欢迎使用 TransLink I18n 使用指南！本指南将帮助您快速上手并深入了解 TransLink I18n 的各项功能。

## 📚 指南目录

### 🚀 快速开始
- [**快速入门**](./quick-start.md) - 5分钟快速体验 TransLink I18n
- [**安装指南**](./installation.md) - 详细的安装和配置步骤
- [**项目初始化**](./project-setup.md) - 从零开始设置 i18n 项目

### 🏗️ 核心功能
- [**文本提取**](./text-extraction.md) - 自动提取需要翻译的文本
- [**语言管理**](./language-management.md) - 管理多语言资源和切换
- [**翻译函数**](./translation-functions.md) - 使用 `t()` 和 `$tsl()` 函数
- [**插值和格式化**](./interpolation.md) - 处理动态内容和格式化

### 🔧 工具使用
- [**CLI 工具**](./cli-usage.md) - 命令行工具的详细使用
- [**Vite 插件**](./vite-plugin-usage.md) - Vite 插件的配置和使用
- [**配置文件**](./configuration.md) - 完整的配置选项说明

### 🌐 框架集成
- [**Vue 3 集成**](./vue-integration.md) - 在 Vue 3 项目中使用
- [**React 集成**](./react-integration.md) - 在 React 项目中使用
- [**TypeScript 支持**](./typescript-support.md) - TypeScript 类型安全

### ⚡ 高级特性
- [**热更新**](./hot-reload.md) - 开发时的实时翻译更新
- [**懒加载**](./lazy-loading.md) - 按需加载语言资源
- [**缓存机制**](./caching.md) - 优化性能的缓存策略
- [**云端同步**](./cloud-sync.md) - 使用 Vika 进行云端管理

### 🚀 部署和优化
- [**构建优化**](./build-optimization.md) - 生产环境的构建优化
- [**性能调优**](./performance-tuning.md) - 性能监控和优化
- [**错误处理**](./error-handling.md) - 错误处理和调试

### 🔌 扩展和定制
- [**插件开发**](./plugin-development.md) - 开发自定义插件
- [**自定义格式化器**](./custom-formatters.md) - 创建自定义格式化器
- [**主题和样式**](./theming.md) - 自定义 UI 主题

## 🎯 按使用场景导航

### 新手入门
如果您是第一次使用 TransLink I18n，建议按以下顺序阅读：

1. [快速入门](./quick-start.md) - 了解基本概念
2. [安装指南](./installation.md) - 安装和配置
3. [项目初始化](./project-setup.md) - 设置您的项目
4. [Vue 集成](./vue-integration.md) 或 [React 集成](./react-integration.md) - 根据您的框架选择

### 进阶使用
如果您已经熟悉基本用法，想要了解更多高级功能：

1. [文本提取](./text-extraction.md) - 自动化工作流
2. [热更新](./hot-reload.md) - 提升开发效率
3. [云端同步](./cloud-sync.md) - 团队协作
4. [性能调优](./performance-tuning.md) - 优化应用性能

### 团队协作
如果您在团队中使用 TransLink I18n：

1. [配置文件](./configuration.md) - 统一团队配置
2. [云端同步](./cloud-sync.md) - 协作翻译管理
3. [CLI 工具](./cli-usage.md) - 自动化工作流
4. [构建优化](./build-optimization.md) - 部署最佳实践

### 问题解决
如果您遇到问题需要帮助：

1. [错误处理](./error-handling.md) - 常见问题和解决方案
2. [FAQ](../faq.md) - 常见问题解答
3. [API 文档](../api/README.md) - 详细的 API 参考
4. [GitHub Issues](https://github.com/lynncen/translink-i18n/issues) - 报告问题

## 🔍 快速查找

### 按功能查找

| 功能 | 相关指南 |
|------|----------|
| 自动提取中文文本 | [文本提取](./text-extraction.md) |
| 实时翻译更新 | [热更新](./hot-reload.md) |
| 多语言切换 | [语言管理](./language-management.md) |
| 动态内容插值 | [插值和格式化](./interpolation.md) |
| 团队翻译协作 | [云端同步](./cloud-sync.md) |
| 性能优化 | [缓存机制](./caching.md), [性能调优](./performance-tuning.md) |
| 构建时优化 | [Vite 插件](./vite-plugin-usage.md), [构建优化](./build-optimization.md) |

### 按技术栈查找

| 技术栈 | 相关指南 |
|--------|----------|
| Vue 3 + Vite | [Vue 集成](./vue-integration.md), [Vite 插件](./vite-plugin-usage.md) |
| React + Vite | [React 集成](./react-integration.md), [Vite 插件](./vite-plugin-usage.md) |
| TypeScript | [TypeScript 支持](./typescript-support.md) |
| 纯 JavaScript | [快速入门](./quick-start.md), [CLI 工具](./cli-usage.md) |
| 单页应用 (SPA) | [懒加载](./lazy-loading.md), [缓存机制](./caching.md) |
| 服务端渲染 (SSR) | [构建优化](./build-optimization.md) |

## 📖 学习路径

### 初学者路径 (1-2 小时)
```
快速入门 → 安装指南 → 项目初始化 → 框架集成 → 基本使用
```

### 开发者路径 (3-4 小时)
```
初学者路径 → 文本提取 → CLI 工具 → 热更新 → 配置文件
```

### 高级用户路径 (5-6 小时)
```
开发者路径 → 云端同步 → 性能调优 → 插件开发 → 自定义扩展
```

### 团队负责人路径 (2-3 小时)
```
快速入门 → 配置文件 → 云端同步 → 构建优化 → 最佳实践
```

## 🛠️ 实践项目

### 示例项目
我们提供了多个示例项目，您可以直接运行和学习：

- [Vue 3 示例](../../examples/vue-demo/README.md) - 完整的 Vue 3 应用示例
- [React 示例](../../examples/react-demo/README.md) - 完整的 React 应用示例
- [TypeScript 示例](../../examples/typescript-demo/README.md) - TypeScript 项目示例
- [JavaScript 示例](../../examples/javascript-demo/README.md) - 纯 JavaScript 项目示例

### 练习项目
建议您通过以下练习项目来加深理解：

1. **个人博客国际化** - 为个人博客添加多语言支持
2. **电商网站翻译** - 实现产品信息的多语言展示
3. **管理后台本地化** - 为管理系统添加国际化功能
4. **移动应用 i18n** - 在移动端应用中实现国际化

## 📝 贡献指南

我们欢迎您为使用指南做出贡献：

### 如何贡献
1. **报告问题** - 发现文档错误或不清楚的地方
2. **改进内容** - 提供更好的解释或示例
3. **添加指南** - 为新功能或用例编写指南
4. **翻译文档** - 帮助翻译文档到其他语言

### 贡献流程
1. Fork 项目仓库
2. 创建功能分支
3. 编写或修改文档
4. 提交 Pull Request
5. 等待审核和合并

### 文档规范
- 使用清晰的标题和结构
- 提供完整的代码示例
- 包含必要的截图或图表
- 遵循 Markdown 格式规范

## 🔗 相关资源

- [API 文档](../api/README.md) - 完整的 API 参考
- [最佳实践](../best-practices.md) - 推荐的开发模式
- [迁移指南](../migration-guide.md) - 从其他方案迁移
- [FAQ](../faq.md) - 常见问题解答
- [更新日志](../../CHANGELOG.md) - 版本更新记录

## 📞 获取帮助

如果您在使用过程中遇到问题：

1. **查看文档** - 首先查看相关的使用指南和 API 文档
2. **搜索问题** - 在 GitHub Issues 中搜索类似问题
3. **提问讨论** - 在 GitHub Discussions 中提问
4. **报告 Bug** - 在 GitHub Issues 中报告问题
5. **联系作者** - 通过邮件或社交媒体联系

---

希望这些指南能够帮助您更好地使用 TransLink I18n！如果您有任何建议或问题，请随时联系我们。
