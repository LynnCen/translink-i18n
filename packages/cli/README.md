# @translink/i18n-cli

TransLink I18n Command Line Tool - Powerful internationalization management CLI.

## 📦 Installation

```bash
# Global installation
npm install -g @translink/i18n-cli

# Or install in project
npm install -D @translink/i18n-cli
```

## 🚀 Quick Start

### 1. Initialize Configuration

```bash
npx translink init
```

This creates a `translink.config.ts` configuration file.

### 2. Extract Translation Text

```bash
npx translink extract
```

Automatically scan code, extract text requiring translation, and generate language files.

### 3. Export to Excel

```bash
npx translink export --format excel
```

Export translation data to Excel for easy editing by translators.

### 4. Import Translations

```bash
npx translink import --input translations.xlsx
```

Import translated Excel files.

### 5. Build Language Packages

```bash
npx translink build
```

Build optimized language packages.

## 📖 Command Reference

### `translink init`

Initialize configuration file.

**Options**:

- `--ts` - Generate TypeScript configuration (default)
- `--js` - Generate JavaScript configuration

### `translink extract`

Extract translation text.

**Options**:

- `--config <path>` - Specify configuration file
- `--verbose` - Show detailed output

### `translink export`

Export translation data.

**Options**:

- `--format <type>` - Export format: excel (default), csv, json
- `--output <path>` - Output file path
- `--languages <langs>` - Specify languages, comma-separated

### `translink import`

Import translation data.

**Options**:

- `--input <path>` - Input file path (required)
- `--merge` - Merge mode (default: true)
- `--force` - Force overwrite existing translations

### `translink build`

Build language packages.

**Options**:

- `--minify` - Compress output
- `--sourcemap` - Generate source map

### `translink analyze`

Analyze translation coverage.

**Options**:

- `--detailed` - Show detailed analysis

### `translink translate`

Use AI to automatically translate text. 🆕

**Options**:

- `-f, --from <lang>` - Source language (default: configured default language)
- `-t, --to <langs>` - Target languages, comma-separated
- `-p, --provider <name>` - AI provider (deepseek|gemini|openai|anthropic)
- `--stream` - Enable streaming translation
- `--force` - Force re-translate existing translations
- `--keys <keys>` - Only translate specified keys, comma-separated
- `--dry-run` - Preview mode, don't write files
- `--estimate-cost` - Estimate translation cost

**Examples**:

```bash
# Translate all supported languages
npx translink translate

# Use DeepSeek to translate to English and Japanese
npx translink translate --provider deepseek --to en-US,ja-JP

# Preview translation results
npx translink translate --dry-run

# Estimate translation cost
npx translink translate --estimate-cost
```

## ⚙️ Configuration File

Create `translink.config.ts`:

```typescript
import type { I18nConfig } from '@translink/i18n-cli';

export default {
  // Project information
  project: {
    name: 'my-app',
    version: '1.0.0',
  },

  // Extraction configuration
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**'],
    functions: ['t', '$tsl', '$t', 'i18n.t'],
    extensions: ['.vue', '.ts', '.tsx', '.js', '.jsx'],
  },

  // Hash configuration
  hash: {
    enabled: true,
    algorithm: 'sha256',
    length: 8,
    numericOnly: true, // Use numeric-only keys
  },

  // Language configuration
  languages: {
    source: 'zh-CN',
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP'],
    fallback: 'zh-CN',
  },

  // Output configuration
  output: {
    directory: 'src/locales',
    format: 'json',
    indent: 2,
    sortKeys: true,
  },

  // Import/export configuration
  importExport: {
    format: 'excel',
    directory: 'translations',
    outputFile: 'translations',
    excel: {
      includeMetadata: false,
    },
  },

  // AI translation configuration
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
      glossary: {
        应用: 'Application',
        用户: 'User',
        设置: 'Settings',
      },
    },
  },

  // CLI configuration
  cli: {
    table: {
      enabled: true,
      maxRows: 20,
    },
  },

  // Plugin configuration
  plugins: [],
} as I18nConfig;
```

## 🔌 Plugin System

The CLI supports an extensible plugin system.

### Using Plugins

```typescript
// translink.config.ts
export default {
  plugins: [
    // Use Vika plugin
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

### Developing Plugins

See the [Plugin Development Guide](../../docs/guides/plugin-development.md).

## 🎯 Features

### Smart Text Extraction

- **AST-based**: Uses Abstract Syntax Tree parsing for accurate text extraction
- **Auto-detection**: Automatically identifies Chinese text in code
- **Hash generation**: Generates unique hash keys for each text
- **Context aware**: Preserves context information for better translation

### AI Auto-Translation

- **Multiple providers**: Supports OpenAI, Gemini, DeepSeek, Anthropic
- **Cost-effective**: Choose the best provider for your budget
- **Batch processing**: Efficiently translate large volumes of text
- **Glossary support**: Maintain consistent terminology across translations

### Excel Workflow

- **Operations-friendly**: Non-technical team members can edit translations
- **Metadata included**: File paths, line numbers, and context information
- **Easy import/export**: Seamless workflow between code and Excel
- **Version control**: Track translation changes over time

## 📚 Complete Documentation

- [CLI API Documentation](../../docs/api/cli.md)
- [Quick Start Guide](../../docs/quick-start.md)
- [Excel Workflow Guide](../../docs/guides/excel-workflow.md)
- [AI Translation Guide](../../docs/guides/ai-translation.md)

## 🤝 Contributing

Contributions are welcome! Please see the [Contributing Guide](../../CONTRIBUTING.md).

## 📄 License

MIT © lynncen
