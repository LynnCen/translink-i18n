# @translink/vite-plugin-i18n

TransLink I18n Vite Plugin - Build-time optimization and HMR support.

## 📦 Installation

```bash
npm install -D @translink/vite-plugin-i18n
npm install @translink/i18n-runtime
```

## 🚀 Quick Start

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import i18n from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    vue(),
    i18n({
      // Language package directory
      localeDir: 'src/locales',

      // Supported languages
      languages: ['zh-CN', 'en-US', 'ja-JP'],

      // Default language
      defaultLanguage: 'zh-CN',

      // Enable HMR
      hmr: true,

      // Enable lazy loading
      lazyLoad: true,
    }),
  ],
});
```

### Using in Application

```typescript
// main.ts
import { createApp } from 'vue';
import { createI18n } from '@translink/i18n-runtime/vue';
import App from './App.vue';

const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US', 'ja-JP'],
});

const app = createApp(App);
app.use(i18n);
app.mount('#app');
```

## ⚙️ Configuration Options

```typescript
interface PluginOptions {
  // Language package directory (relative to project root)
  localeDir?: string;

  // Supported languages list
  languages: string[];

  // Default language
  defaultLanguage: string;

  // Fallback language
  fallbackLanguage?: string;

  // Enable hot module replacement (HMR)
  hmr?: boolean;

  // Enable lazy loading
  lazyLoad?: boolean;

  // Code transformation
  transform?: {
    // Whether to transform $tsl() to hash keys
    enabled: boolean;
    // List of function names to transform
    functions?: string[];
  };

  // Build optimization
  build?: {
    // Compress output
    minify?: boolean;
    // Generate source map
    sourcemap?: boolean;
  };

  // Debug mode
  debug?: boolean;
}
```

## 🎯 Features

### ⚡ Hot Module Replacement (HMR)

Automatically update UI when language files change, without page refresh.

```typescript
i18n({
  hmr: true, // Enable HMR
});
```

**Benefits:**

- Instant translation updates during development
- No page refresh required
- Preserves application state
- Fast feedback loop

### 📦 Lazy Loading

Load language packages on demand to optimize initial load speed.

```typescript
i18n({
  lazyLoad: true,
});
```

**Benefits:**

- Smaller initial bundle size
- Faster page load times
- Load languages only when needed
- Reduced memory footprint

### 🔄 Code Transformation

Automatically transform `$tsl()` to hash keys at build time for improved runtime performance.

```typescript
i18n({
  transform: {
    enabled: true,
    functions: ['$tsl', 't', '$t'],
  },
});
```

**Transformation Example:**

```vue
<!-- Development -->
<h1>{{ $tsl('Welcome') }}</h1>

<!-- After build -->
<h1>{{ t('12345678') }}</h1>
```

**Benefits:**

- Smaller runtime overhead
- Faster lookups
- Automatic key management
- No manual key naming

### 🗜️ Build Optimization

- Automatic language file compression
- Tree-shaking unused translations
- Generate optimized language packages

```typescript
i18n({
  build: {
    minify: true,
    sourcemap: false,
  },
});
```

## 📖 How It Works

### 1. Virtual Modules

The plugin creates virtual modules that dynamically import language files:

```typescript
import { useI18n } from '@translink/i18n-runtime/vue';

// Virtual modules automatically generated
// virtual:i18n/zh-CN
// virtual:i18n/en-US
```

### 2. Code Transformation

Scan code during build and transform translation function calls to hash keys:

```typescript
// Source code
const text = $tsl('Hello World');

// Transformed
const text = t('12345678');
```

### 3. HMR Integration

Watch language file changes and trigger hot updates:

```typescript
if (import.meta.hot) {
  import.meta.hot.accept('/path/to/locale.json', newModule => {
    // Update translations
  });
}
```

### 4. Virtual Module Resolution

The plugin intercepts virtual module requests and provides language data:

```typescript
// When importing
import zhCN from 'virtual:i18n/zh-CN';

// Plugin resolves to
{
  "key1": "translation1",
  "key2": "translation2"
}
```

## 🔧 Advanced Usage

### Custom Language Loader

```typescript
i18n({
  localeDir: 'src/locales',
  languages: ['zh-CN', 'en-US'],

  // Custom loading logic
  loader: async lang => {
    const response = await fetch(`/api/locales/${lang}`);
    return response.json();
  },
});
```

### Multiple Language Package Directories

```typescript
i18n([
  {
    localeDir: 'src/locales',
    languages: ['zh-CN', 'en-US'],
  },
  {
    localeDir: 'src/common-locales',
    languages: ['zh-CN', 'en-US'],
  },
]);
```

### Integration with CLI Tools

```bash
# 1. Extract translations
npx translink extract

# 2. Generate language files to src/locales/

# 3. Vite plugin automatically recognizes and processes
pnpm dev
```

### Custom Transformation Functions

```typescript
i18n({
  transform: {
    enabled: true,
    functions: ['t', '$t', '$tsl', 'i18n.t', 'translate'],
  },
});
```

This will transform all specified functions:

```typescript
// Before
$tsl('Hello');
t('World');
i18n.t('Foo');

// After
t('abc12345');
t('def67890');
t('ghi11121');
```

## 🎨 Framework Support

### Vue 3

Full support for Vue 3 with:

- Template transformation
- Script setup support
- Options API compatibility

### React

Works with:

- JSX/TSX transformation
- Hook-based API
- Server-side rendering

### Other Frameworks

Compatible with any framework that uses:

- ESM modules
- Vite build system

## 📊 Performance

### Build Performance

- **Fast transformation**: AST-based parsing with caching
- **Parallel processing**: Handle multiple files concurrently
- **Incremental builds**: Only process changed files

### Runtime Performance

- **Smaller bundles**: Hash keys reduce bundle size
- **Faster lookups**: Direct object access vs. string matching
- **Lazy loading**: Load translations on demand

## 📚 Complete Documentation

- [Vite Plugin API Documentation](../../docs/api/vite-plugin.md)
- [Quick Start Guide](../../docs/quick-start.md)
- [Best Practices](../../docs/best-practices.md)

## 🤝 Contributing

Contributions are welcome! Please see the [Contributing Guide](../../CONTRIBUTING.md).

## 📄 License

MIT © lynncen
