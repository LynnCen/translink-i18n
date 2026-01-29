# 术语表

> **国际化相关的术语和缩写说明**

---

## 📖 核心概念

### i18n (Internationalization)
**国际化**。让应用能够支持多语言的技术方案。

> "i18n" 是 "Internationalization" 的缩写，因为 i 和 n 之间有 18 个字母。

### L10n (Localization)
**本地化**。将应用实际翻译成某种语言的过程。

> i18n 是"做准备"，L10n 是"实际翻译"。

### Locale
**语言区域**。表示语言和地区的组合，如 `zh-CN`（简体中文-中国）、`en-US`（英语-美国）。

### Translation Key
**翻译键**。代码中引用翻译的标识符，如 `welcome.message`。

### Fallback Language
**回退语言**。当找不到当前语言的翻译时，使用的备用语言。

---

## 🔧 技术术语

### AST (Abstract Syntax Tree)
**抽象语法树**。源代码的树形结构表示，用于分析和提取翻译文本。

### Hash Key
**哈希键**。根据文本内容自动生成的唯一标识符，如 `a1b2c3d4`。

### Interpolation
**插值**。在翻译文本中嵌入动态变量，如 `"你好，{{name}}"`。

### HMR (Hot Module Replacement)
**热模块替换**。修改翻译文件后，无需刷新页面即可看到更新。

### Tree-shaking
**摇树优化**。构建时移除未使用的翻译，减小打包体积。

### Lazy Loading
**懒加载**。按需加载语言包，而不是一次性加载所有语言。

---

## 📦 TransLink 术语

### CLI (Command Line Interface)
**命令行工具**。`@translink/i18n-cli` 包，用于文本提取、构建、导入导出等。

### Runtime
**运行时**。`@translink/i18n-runtime` 包，负责应用运行时的翻译功能。

### Vite Plugin
**Vite 插件**。`@translink/vite-plugin-i18n` 包，提供构建时优化。

### Provider
在翻译领域有两个含义：
1. **AI Provider**：AI 翻译服务提供商，如 DeepSeek、OpenAI
2. **React Provider**：React 的 Context Provider 组件

### Adapter
**适配器**。将核心翻译引擎适配到特定框架（Vue/React）的代码。

---

## 🌍 语言代码

常用的语言区域代码：

| 代码 | 语言 | 地区 |
|-----|------|------|
| `zh-CN` | 简体中文 | 中国大陆 |
| `zh-TW` | 繁体中文 | 台湾 |
| `zh-HK` | 繁体中文 | 香港 |
| `en-US` | 英语 | 美国 |
| `en-GB` | 英语 | 英国 |
| `ja-JP` | 日语 | 日本 |
| `ko-KR` | 韩语 | 韩国 |
| `de-DE` | 德语 | 德国 |
| `fr-FR` | 法语 | 法国 |
| `es-ES` | 西班牙语 | 西班牙 |
| `pt-BR` | 葡萄牙语 | 巴西 |
| `ru-RU` | 俄语 | 俄罗斯 |
| `ar-SA` | 阿拉伯语 | 沙特阿拉伯 |

---

## 📊 文件格式

### JSON
**JavaScript Object Notation**。最常用的翻译文件格式。

```json
{
  "welcome": "欢迎",
  "greeting": "你好，{{name}}"
}
```

### YAML
**YAML Ain't Markup Language**。另一种翻译文件格式。

```yaml
welcome: 欢迎
greeting: "你好，{{name}}"
```

### XLSX
**Excel 文件格式**。用于与运营/翻译人员协作。

### CSV
**Comma-Separated Values**。逗号分隔值文件，轻量级表格格式。

---

## 🔗 相关术语

### Monorepo
**单体仓库**。将多个包放在同一个代码仓库中管理。

### pnpm
**高性能 npm 替代品**。使用硬链接节省磁盘空间。

### Turborepo
**Monorepo 构建工具**。提供并行构建和缓存功能。

### tsup
**TypeScript 打包工具**。基于 esbuild，用于构建 npm 包。

---

## 💡 缩写对照表

| 缩写 | 全称 | 中文 |
|-----|------|------|
| i18n | Internationalization | 国际化 |
| L10n | Localization | 本地化 |
| CLI | Command Line Interface | 命令行接口 |
| API | Application Programming Interface | 应用程序接口 |
| AST | Abstract Syntax Tree | 抽象语法树 |
| HMR | Hot Module Replacement | 热模块替换 |
| LRU | Least Recently Used | 最近最少使用 |
| TTL | Time To Live | 生存时间 |

---

> 📚 **延伸阅读**
> - [Unicode CLDR](http://cldr.unicode.org/) - 语言区域数据参考
> - [BCP 47](https://tools.ietf.org/html/bcp47) - 语言标签标准
