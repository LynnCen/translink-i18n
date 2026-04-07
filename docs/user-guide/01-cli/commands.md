# CLI 命令详解

> **TransLink CLI 提供了完整的命令行工具，覆盖国际化开发的全流程。**

---

## 📋 命令一览

| 命令 | 说明 | 使用频率 |
|-----|------|---------|
| `init` | 初始化配置文件 | ⭐ 一次 |
| `extract` | 从代码提取文本 | ⭐⭐⭐ 高 |
| `build` | 构建语言包 | ⭐⭐⭐ 高 |
| `export` | 导出 Excel/CSV | ⭐⭐ 中 |
| `import` | 导入翻译 | ⭐⭐ 中 |
| `translate` | AI 翻译 | ⭐⭐ 中 |
| `analyze` | 分析覆盖率 | ⭐ 低 |

---

## translink init

初始化项目配置文件。

```bash
npx translink init [options]
```

**选项：**

| 选项 | 说明 |
|-----|------|
| `-f, --force` | 强制覆盖已有配置 |

**示例：**

```bash
# 初始化配置
npx translink init

# 强制重新初始化
npx translink init --force
```

**生成文件：** `translink.config.ts`

---

## translink extract

从源代码中提取需要翻译的文本。

```bash
npx translink extract [options]
```

**选项：**

| 选项 | 说明 |
|-----|------|
| `-c, --config <path>` | 指定配置文件路径 |
| `-v, --verbose` | 显示详细输出 |
| `--dry-run` | 预览模式，不写入文件 |
| `-w, --watch` | 监听文件变化 |

**示例：**

```bash
# 基本提取
npx translink extract

# 预览提取结果
npx translink extract --dry-run

# 监听模式
npx translink extract --watch

# 显示详细信息
npx translink extract --verbose
```

**输出：** 更新 `locales/zh-CN.json`

---

## translink build

构建和优化翻译文件。

```bash
npx translink build [options]
```

**选项：**

| 选项 | 说明 |
|-----|------|
| `-m, --minify` | 压缩输出 |
| `-s, --split` | 按语言分割输出 |
| `--remove-unused` | 移除未使用的 Key |

**示例：**

```bash
# 基本构建
npx translink build

# 压缩构建
npx translink build --minify

# 移除未使用的翻译
npx translink build --remove-unused
```

---

## translink export

导出翻译到 Excel/CSV/JSON 文件。

```bash
npx translink export [options]
```

**选项：**

| 选项 | 说明 |
|-----|------|
| `-f, --format <type>` | 导出格式：excel \| csv \| json |
| `-o, --output <path>` | 输出文件路径 |
| `--include-empty` | 包含未翻译的 Key |

**示例：**

```bash
# 导出 Excel
npx translink export --format excel --output translations.xlsx

# 导出 CSV
npx translink export --format csv --output translations.csv

# 只导出未翻译的
npx translink export --format excel --include-empty
```

**Excel 结构：**

| Key | zh-CN | en-US | ja-JP | Context | File |
|-----|-------|-------|-------|---------|------|
| a1b2c3d4 | 欢迎 | Welcome | | button | App.vue:12 |

---

## translink import

从 Excel/CSV/JSON 导入翻译。

```bash
npx translink import [options]
```

**选项：**

| 选项 | 说明 |
|-----|------|
| `-i, --input <path>` | 输入文件路径 |
| `--force` | 强制覆盖已有翻译 |
| `--dry-run` | 预览模式 |

**示例：**

```bash
# 导入 Excel
npx translink import --input translations.xlsx

# 预览导入
npx translink import --input translations.xlsx --dry-run

# 强制覆盖
npx translink import --input translations.xlsx --force
```

---

## translink translate

使用 AI 自动翻译。

```bash
npx translink translate [options]
```

**选项：**

| 选项 | 说明 |
|-----|------|
| `-f, --from <lang>` | 源语言（默认配置的默认语言） |
| `-t, --to <langs>` | 目标语言，逗号分隔 |
| `-p, --provider <name>` | AI 提供商：deepseek \| gemini \| openai \| anthropic |
| `--stream` | 启用流式翻译 |
| `--force` | 强制重新翻译 |
| `--keys <keys>` | 只翻译指定 Key |
| `--dry-run` | 预览模式 |
| `--estimate-cost` | 估算翻译成本 |

**示例：**

```bash
# 翻译所有支持的语言
npx translink translate

# 使用 DeepSeek 翻译到英文和日文
npx translink translate --provider deepseek --to en-US,ja-JP

# 预览翻译结果
npx translink translate --dry-run

# 估算成本
npx translink translate --estimate-cost

# 只翻译指定 Key
npx translink translate --keys key1,key2,key3
```

**支持的 AI 提供商：**

| 提供商 | 成本 | 质量 | 适用场景 |
|-------|------|------|---------|
| DeepSeek | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 日常大批量翻译 |
| Gemini | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 测试、小项目 |
| OpenAI | ⭐⭐ | ⭐⭐⭐⭐⭐ | 高质量要求 |
| Anthropic | ⭐ | ⭐⭐⭐⭐⭐ | 复杂上下文 |

---

## translink analyze

分析翻译覆盖率和状态。

```bash
npx translink analyze [options]
```

**选项：**

| 选项 | 说明 |
|-----|------|
| `--format <type>` | 输出格式：table \| json \| html |
| `--output <path>` | 输出文件路径 |

**示例：**

```bash
# 表格显示
npx translink analyze

# 输出 JSON
npx translink analyze --format json --output report.json

# 生成 HTML 报告
npx translink analyze --format html --output report.html
```

**输出示例：**

```
翻译覆盖率分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
语言        已翻译    总计     覆盖率
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
zh-CN       500      500     100%
en-US       450      500      90%
ja-JP       300      500      60%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

未翻译的 Key（en-US）：
- a1b2c3d4: "新增功能"
- e5f6g7h8: "设置选项"
...
```

---

## 🔧 全局选项

所有命令都支持的选项：

| 选项 | 说明 |
|-----|------|
| `--help` | 显示帮助信息 |
| `--version` | 显示版本号 |
| `--config <path>` | 指定配置文件 |
| `--debug` | 调试模式 |

---

## 📚 相关文档

- [配置文件详解](./configuration.md)
- [Excel 工作流](../03-workflows/excel-workflow.md)
- [AI 翻译指南](../03-workflows/ai-translation.md)
