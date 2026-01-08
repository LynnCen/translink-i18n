# @translink/i18n-cli

TransLink I18n 命令行工具 - 强大的国际化管理 CLI。

## 📦 安装

```bash
# 全局安装
pnpm add -g @translink/i18n-cli

# 或项目内安装
pnpm add -D @translink/i18n-cli
```

## 🚀 快速开始

### 1. 初始化配置

```bash
npx translink init
```

这将创建 `translink.config.ts` 配置文件。

### 2. 提取翻译文本

```bash
npx translink extract
```

自动扫描代码，提取需要翻译的文本，生成语言文件。

### 3. 导出到 Excel

```bash
npx translink export --format excel
```

导出翻译数据到 Excel，方便翻译人员编辑。

### 4. 导入翻译

```bash
npx translink import --input translations.xlsx
```

导入翻译后的 Excel 文件。

### 5. 构建语言包

```bash
npx translink build
```

构建优化后的语言包。

## 📖 命令参考

### `translink init`

初始化配置文件。

**选项**：
- `--ts` - 生成 TypeScript 配置（默认）
- `--js` - 生成 JavaScript 配置

### `translink extract`

提取翻译文本。

**选项**：
- `--config <path>` - 指定配置文件
- `--verbose` - 显示详细输出

### `translink export`

导出翻译数据。

**选项**：
- `--format <type>` - 导出格式：excel（默认）、csv、json
- `--output <path>` - 输出文件路径
- `--languages <langs>` - 指定语言，逗号分隔

### `translink import`

导入翻译数据。

**选项**：
- `--input <path>` - 输入文件路径（必需）
- `--merge` - 合并模式（默认：true）
- `--force` - 强制覆盖已有翻译

### `translink build`

构建语言包。

**选项**：
- `--minify` - 压缩输出
- `--sourcemap` - 生成 source map

### `translink analyze`

分析翻译覆盖率。

**选项**：
- `--detailed` - 显示详细分析

## ⚙️ 配置文件

创建 `translink.config.ts`：

```typescript
import type { I18nConfig } from '@translink/i18n-cli';

export default {
  // 项目信息
  project: {
    name: 'my-app',
    version: '1.0.0',
  },

  // 提取配置
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**'],
    functions: ['t', '$tsl', '$t', 'i18n.t'],
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js'],
  },

  // 哈希配置
  hash: {
    enabled: true,
    algorithm: 'sha256',
    length: 8,
    numericOnly: true, // 使用纯数字键
  },

  // 语言配置
  languages: {
    source: 'zh-CN',
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP'],
    fallback: 'zh-CN',
  },

  // 输出配置
  output: {
    directory: 'src/locales',
    format: 'json',
    indent: 2,
    sortKeys: true,
  },

  // 导入导出配置
  importExport: {
    format: 'excel',
    directory: 'translations',
    outputFile: 'translations',
    excel: {
      includeMetadata: false,
    },
  },

  // CLI 配置
  cli: {
    table: {
      enabled: true,
      maxRows: 20,
    },
  },

  // 插件配置
  plugins: [],
} as I18nConfig;
```

## 🔌 插件系统

CLI 支持可扩展的插件系统。

### 使用插件

```typescript
// translink.config.ts
export default {
  plugins: [
    // 使用 Vika 插件
    ['@translink/i18n-plugin-vika', {
      apiKey: process.env.VIKA_API_KEY,
      datasheetId: process.env.VIKA_DATASHEET_ID,
    }],
  ],
};
```

### 开发插件

查看 [插件开发指南](../../docs/guides/plugin-development.md)。

## 📚 完整文档

- [CLI API 文档](../../docs/api/cli.md)
- [快速开始](../../docs/quick-start.md)
- [Excel 工作流](../../docs/guides/excel-workflow.md)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)。

## 📄 许可证

MIT © lynncen

