# TransLink I18n

<div align="center">

🌍 Modern, Efficient, and Easy-to-Use Frontend Internationalization Solution

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](https://www.typescriptlang.org/)

[Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples)

</div>

---

## ✨ Features

- 🚀 **Smart Text Extraction** - AST-based automatic Chinese text recognition and hash generation
- 🤖 **AI Auto-Translation** - Integrated OpenAI, Gemini, DeepSeek, Anthropic for one-click multi-language translation 🆕
- 📦 **Independent Package Design** - Each package can be installed independently with zero mutual dependencies
- 📊 **Excel Workflow** - Export/import Excel for operations-friendly translation management
- 🔌 **Plugin System** - Extensible plugin architecture supporting custom translation management solutions
- ⚡ **Developer Experience** - Hot reload, lazy loading, build-time optimization
- 🔧 **Framework Support** - Supports Vue3, React, and other mainstream frameworks
- 📝 **TypeScript** - Complete type definitions and intelligent hints

---

## 📦 Package Structure

TransLink I18n uses a Monorepo architecture with the following independent packages:

| Package                                               | Version | Description                                              | Dependencies       |
| ----------------------------------------------------- | ------- | -------------------------------------------------------- | ------------------ |
| [@translink/i18n-cli](./packages/cli)                 | 1.0.0   | CLI tool (text extraction, build, export/import)         | Zero dependencies  |
| [@translink/i18n-runtime](./packages/runtime)         | 1.0.0   | Runtime library (translation engine, framework adapters) | Zero dependencies  |
| [@translink/vite-plugin-i18n](./packages/vite-plugin) | 1.0.0   | Vite plugin (build-time transformation, HMR)             | Depends on Runtime |
| [@translink/plugin-vika](./packages/plugins/vika)     | 1.0.0   | Vika cloud translation management plugin (optional)      | Depends on CLI     |

---

## 🚀 Quick Start

### Solution A: Excel Workflow (Recommended)

Suitable for team collaboration where operations can directly edit translations in Excel.

#### 1. Install CLI Tool

```bash
npm install -D @translink/i18n-cli
# or
pnpm add -D @translink/i18n-cli
```

#### 2. Initialize Project

```bash
npx translink init
```

This generates a configuration file `i18n.config.ts`:

```typescript
export default {
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    functions: ['t', '$t', '$tsl'],
  },
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP'],
  },
  output: {
    directory: 'locales',
  },
};
```

#### 3. Extract Text

```bash
npx translink extract
```

Scan code and extract Chinese text to `locales/zh-CN.json`.

#### 4. Export to Excel

```bash
npx translink export --format excel --output translations.xlsx
```

Generate an Excel file containing:

- **key**: Translation key
- **zh-CN**, **en-US**, **ja-JP**: Language columns
- **context**: Context information
- **file**, **line**: Source code location

#### 5. Operations Translation

Send `translations.xlsx` to operations or translators to edit translations in Excel.

#### 6. Import Translations

```bash
npx translink import --input translations.xlsx
```

Update JSON files with translations from Excel.

#### 7. Build

```bash
npx translink build
```

Optimize and compress translation files.

---

### Solution B: JSON Workflow

Suitable for small projects or individual development, directly editing JSON files.

```bash
# 1. Extract text
npx translink extract

# 2. Manually edit locales/*.json files

# 3. Build
npx translink build
```

---

### Solution C: Vika Cloud Workflow (Optional Plugin)

Suitable for teams requiring online collaboration.

#### 1. Install Vika Plugin

```bash
npm install -D @translink/plugin-vika
```

#### 2. Configure Plugin

Add to `i18n.config.ts`:

```typescript
export default {
  // ... other configurations
  plugins: [
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

#### 3. Use Vika Commands

```bash
# Push to Vika
npx translink push

# Pull from Vika
npx translink pull
```

---

## 📖 CLI Commands

### `translink init`

Initialize project configuration file.

```bash
npx translink init [options]

Options:
  -f, --force    Force overwrite existing configuration file
```

### `translink extract`

Extract text from code.

```bash
npx translink extract [options]

Options:
  -c, --config <path>    Specify configuration file path
  -w, --watch           Watch file changes and auto-extract
```

### `translink export`

Export translations to Excel/CSV/JSON.

```bash
npx translink export [options]

Options:
  -f, --format <type>    Export format (excel|csv|json)
  -o, --output <path>    Output file path
```

### `translink import`

Import translations from Excel/CSV/JSON.

```bash
npx translink import [options]

Options:
  -i, --input <path>     Input file path
  --force               Force overwrite existing translations
```

### `translink build`

Build and optimize translation files.

```bash
npx translink build [options]

Options:
  -m, --minify    Compress output
  -s, --split     Split output by language
```

### `translink analyze`

Analyze translation coverage.

```bash
npx translink analyze [options]

Options:
  --format <type>    Output format (json|table|html)
```

### `translink translate`

Use AI to automatically translate multi-language files. 🆕

```bash
npx translink translate [options]

Options:
  -f, --from <lang>         Source language (defaults to configured default language)
  -t, --to <langs>          Target languages, comma-separated
  -p, --provider <name>     AI provider (deepseek|gemini|openai|anthropic)
  --stream                  Enable streaming translation
  --force                   Force re-translate existing translations
  --keys <keys>             Only translate specified keys, comma-separated
  --dry-run                 Preview mode, don't write files
  --estimate-cost           Estimate translation cost
```

**Examples:**

```bash
# Translate all supported languages
npx translink translate

# Use DeepSeek to translate to English and Japanese
npx translink translate --provider deepseek --to en-US,ja-JP

# Preview translation results (don't write files)
npx translink translate --dry-run

# Estimate translation cost
npx translink translate --estimate-cost
```

**Supported AI Providers:**

| Provider  | Model           | Cost       | Features                                                 |
| --------- | --------------- | ---------- | -------------------------------------------------------- |
| DeepSeek  | deepseek-chat   | ⭐⭐⭐⭐⭐ | Cost-effective, suitable for bulk translation            |
| Gemini    | gemini-pro      | ⭐⭐⭐⭐⭐ | Free quota, suitable for testing and small projects      |
| OpenAI    | gpt-4-turbo     | ⭐⭐       | Highest quality, suitable for professional documentation |
| Anthropic | claude-3-sonnet | ⭐         | Long text friendly, suitable for complex contexts        |

**Configure AI Translation:**

Add to `i18n.config.ts`:

```typescript
export default {
  // ... other configurations

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
      // Glossary (maintain translation consistency)
      glossary: {
        应用: 'Application',
        用户: 'User',
        设置: 'Settings',
      },
    },
  },
};
```

For more configuration and usage instructions, see the [AI Translation Guide](./docs/guides/ai-translation.md).

---

## 🎨 Usage in Applications

### Vue 3

#### 1. Install

```bash
npm install @translink/i18n-runtime
npm install -D @translink/vite-plugin-i18n
```

#### 2. Configure Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import i18n from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    vue(),
    i18n({
      localesDir: './locales',
      defaultLanguage: 'zh-CN',
    }),
  ],
});
```

#### 3. Usage

```vue
<template>
  <div>
    <!-- Use in template -->
    <h1>{{ $tsl('Welcome to TransLink I18n') }}</h1>
    <p>{{ $t('hello', { name: 'John' }) }}</p>
  </div>
</template>

<script setup>
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, tsl, locale, setLocale } = useI18n();

// Use in Composition API
const greeting = tsl('Hello, World');

// Switch language
const switchLanguage = () => {
  setLocale('en-US');
};
</script>
```

---

### React

#### 1. Install

```bash
npm install @translink/i18n-runtime
npm install -D @translink/vite-plugin-i18n
```

#### 2. Setup

```typescript
// main.tsx
import { I18nProvider } from '@translink/i18n-runtime/react';
import { i18nEngine } from './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider engine={i18nEngine}>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
```

#### 3. Usage

```tsx
import { useI18n } from '@translink/i18n-runtime/react';

function App() {
  const { t, tsl, setLocale } = useI18n();

  return (
    <div>
      <h1>{tsl('Welcome to TransLink I18n')}</h1>
      <p>{t('hello', { name: 'John' })}</p>
      <button onClick={() => setLocale('en-US')}>Switch Language</button>
    </div>
  );
}
```

---

## 🔌 Plugin Development

TransLink I18n supports custom plugin extensions.

### Create a Plugin

```typescript
// my-plugin.ts
import type { I18nPlugin } from '@translink/i18n-cli/plugins';

const MyPlugin: I18nPlugin = {
  metadata: {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'My custom plugin',
    author: 'your-name',
  },

  async init(context, config) {
    // Initialization logic
  },

  async push(data) {
    // Push translations to your platform
    return {
      success: true,
      message: 'Push successful',
      count: Object.keys(data.translations).length,
    };
  },

  async pull(data) {
    // Pull translations from your platform
    return {
      success: true,
      message: 'Pull successful',
      translations: {},
      count: 0,
    };
  },
};

export default MyPlugin;
```

### Use Plugin

```typescript
// i18n.config.ts
export default {
  // ... other configurations
  plugins: [
    [
      './my-plugin.ts',
      {
        /* plugin configuration */
      },
    ],
  ],
};
```

For more plugin development documentation, see the [Plugin Development Guide](./docs/guides/plugin-development.md).

---

## 📊 Complete Configuration Example

```typescript
// i18n.config.ts
import type { I18nConfig } from '@translink/i18n-cli';

export default {
  // Extraction configuration
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**'],
    functions: ['t', '$t', '$tsl'],
    extensions: ['.vue', '.ts', '.tsx', '.js', '.jsx'],
  },

  // Hash configuration
  hash: {
    algorithm: 'md5',
    length: 8,
    prefix: '',
  },

  // Language configuration
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
  },

  // Output configuration
  output: {
    directory: 'locales',
    format: 'json',
    indent: 2,
  },

  // Plugin configuration (optional)
  plugins: [
    // Excel plugin (built-in)
    [
      'excel',
      {
        template: './templates/translation.xlsx',
      },
    ],

    // Vika plugin (requires separate installation)
    [
      '@translink/plugin-vika',
      {
        apiKey: process.env.VIKA_API_KEY,
        datasheetId: process.env.VIKA_DATASHEET_ID,
      },
    ],
  ],
} satisfies I18nConfig;
```

---

## 🏗️ Project Architecture

```
translink-i18n/
├── packages/
│   ├── cli/                      # @translink/i18n-cli
│   │   ├── src/
│   │   │   ├── commands/         # CLI commands
│   │   │   ├── extractors/       # Text extractors
│   │   │   ├── generators/       # Hash generators
│   │   │   ├── plugins/          # Plugin system
│   │   │   └── utils/            # Utility functions
│   │   └── tests/                # Test files
│   │
│   ├── runtime/                  # @translink/i18n-runtime
│   │   ├── src/
│   │   │   ├── core/             # Core engine
│   │   │   ├── adapters/         # Framework adapters
│   │   │   └── types/            # Type definitions
│   │   └── tests/                # Test files
│   │
│   ├── vite-plugin/              # @translink/vite-plugin-i18n
│   │   ├── src/
│   │   │   ├── core/             # Core logic
│   │   │   └── utils/            # Utility functions
│   │   └── tests/                # Test files
│   │
│   └── plugins/                  # Optional plugins
│       └── vika/                 # @translink/plugin-vika
│           ├── src/
│           └── tests/
│
├── apps/
│   ├── docs/                     # Documentation site
│   └── playground/               # Example applications
│
└── docs/                         # Project documentation
    ├── api/                      # API documentation
    ├── guides/                   # User guides
    └── tutorials/                # Technical tutorials
```

---

## 📚 Documentation

**[📖 View Complete Documentation](./docs/)**

### Core Documentation

- [Quick Start](./docs/quick-start.md) - Get started in 5 minutes
- [Architecture Overview](./docs/architecture.md) - System architecture design
- [Best Practices](./docs/best-practices.md) - Development best practices
- [FAQ](./docs/faq.md) - Frequently asked questions

### Technical Tutorials

Learn how to build an internationalization solution from scratch:

- [Tutorial Series Overview](./docs/tutorials/) - Complete technical tutorials
  - [1. Monorepo Architecture](./docs/tutorials/01-monorepo-architecture.md) - pnpm + Turborepo + TypeScript
  - [2. CLI Tool Development](./docs/tutorials/02-cli-development.md) - Commander + AST + Hash generation
  - [3. Runtime Implementation](./docs/tutorials/03-runtime-implementation.md) - Translation engine + Cache + Framework adapters
  - [4. Vite Plugin Development](./docs/tutorials/04-vite-plugin.md) - Virtual modules + HMR + Code transformation
  - [5. Plugin System Design](./docs/tutorials/05-plugin-system.md) - Interface design + Lifecycle + Vika plugin
  - [6. Build & Optimization](./docs/tutorials/06-build-optimization.md) - tsup + Tree-shaking + Performance optimization
  - [7. AI Translation Implementation](./docs/tutorials/07-ai-translation.md) - Provider abstraction + Batch optimization + Error handling 🆕

### User Guides

- [AI Auto-Translation](./docs/guides/ai-translation.md) - Use AI to automatically translate text 🆕
- [Excel Workflow](./docs/guides/excel-workflow.md) - Manage translations using Excel
- [TypeScript Configuration](./docs/guides/typescript-config.md) - TypeScript configuration guide
- [Plugin Development](./docs/guides/plugin-development.md) - Develop custom plugins
- [Migration Guide](./docs/guides/migration.md) - Migrate from other solutions

### API Documentation

- [CLI API](./docs/api/cli.md) - Command-line tool API
- [Runtime API](./docs/api/runtime.md) - Runtime library API
- [Vite Plugin API](./docs/api/vite-plugin.md) - Vite plugin API
- [TypeScript Types](./docs/api/types.md) - Type definitions

---

## 🎯 Examples

Check out our example projects in the [playground](./apps/playground/) directory:

- [Vue 3 Demo](./apps/playground/vue-demo) - Complete Vue 3 application with i18n
- [React Demo](./apps/playground/react-demo) - React application example
- [TypeScript Demo](./apps/playground/typescript-demo) - Pure TypeScript usage
- [JavaScript Demo](./apps/playground/javascript-demo) - Vanilla JavaScript example

---

## 🛣️ Roadmap

### Completed ✅

- [x] Basic architecture (Monorepo + TypeScript + Turborepo)
- [x] CLI core features (extract, build, init, analyze)
- [x] Runtime core engine and framework adapters (Vue3, React)
- [x] Vite plugin development (code transformation, HMR)
- [x] Fully decoupled package design (zero mutual dependencies)
- [x] Excel export/import functionality
- [x] Plugin system architecture
- [x] Vika plugin (independent package)
- [x] AI auto-translation (DeepSeek, Gemini, OpenAI, Anthropic) 🆕

### In Progress 🚧

- [ ] Improve test coverage (target 80%+)
- [ ] Performance optimization (AST caching, concurrency control)
- [ ] Complete documentation

### Planned 📝

- [ ] Support more frameworks (Svelte, Angular)
- [ ] CLI interactive UI
- [ ] VSCode extension
- [ ] Web management interface
- [ ] More translation platform plugins (Crowdin, Lokalise, etc.)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit code, report issues, or suggest improvements.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT](./LICENSE) License.

---

## 🙏 Acknowledgments

Thanks to the following open source projects for inspiration:

- [vue-i18n](https://github.com/intlify/vue-i18n-next)
- [react-i18next](https://github.com/i18next/react-i18next)
- [GoGoCode](https://github.com/thx/gogocode)

---

## 📧 Contact

- Author: lynncen
- Project: [TransLink I18n](https://github.com/lynncen/translink-i18n)
- Issues: [GitHub Issues](https://github.com/lynncen/translink-i18n/issues)

---

<div align="center">

**If this project helps you, please give it a ⭐️ Star!**

</div>
