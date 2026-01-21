# TransLink I18n React Demo

A comprehensive React demonstration application showcasing all features and APIs of the `@translink/i18n-runtime` package.

## 🎯 Purpose

This demo is designed to **systematically validate** all Runtime APIs through 9 dedicated scene-based components. Each scene focuses on specific functionality, making it easy to:

- **Verify API correctness** during development
- **Test edge cases** and error handling
- **Demonstrate best practices** for integration
- **Serve as living documentation** for developers

## 📋 Demo Scenes

| Scene | Component | APIs Validated | Description |
|-------|-----------|----------------|-------------|
| 01 | BasicTranslation | `t()` | Basic translation, nested keys, array access, fallback |
| 02 | LanguageSwitcher | `setLocale()`, `locale`, `availableLocales`, `isLoading` | Language switching and reactive state |
| 03 | ParameterInterpolation | `t(key, params)` | String, number, date interpolation, HTML escaping |
| 04 | PluralizationDemo | `t(key, { count })` | Auto pluralization with language-specific rules |
| 05 | TranslationComponent | `<Translation>` | Component-based translation with rich text |
| 06 | HooksDemo | `useI18n()` | React hooks for i18n (best practice) |
| 07 | LoadingStates | `isReady`, `isLoading` | Loading states and conditional rendering |
| 08 | ErrorHandling | Error boundaries, fallbacks | Missing keys, error recovery |
| 09 | PerformanceDemo | Caching, lazy loading | Performance optimization features |

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📁 File Structure

```
react-demo/
├── src/
│   ├── demos/                    # 9 scene-based demo components
│   │   ├── 01-BasicTranslation.tsx
│   │   ├── 02-LanguageSwitcher.tsx
│   │   ├── 03-ParameterInterpolation.tsx
│   │   ├── 04-PluralizationDemo.tsx
│   │   ├── 05-TranslationComponent.tsx
│   │   ├── 06-HooksDemo.tsx
│   │   ├── 07-LoadingStates.tsx
│   │   ├── 08-ErrorHandling.tsx
│   │   ├── 09-PerformanceDemo.tsx
│   │   └── demo-card-styles.css  # Shared styles
│   ├── locales/                  # Translation files
│   │   ├── zh-CN.json
│   │   └── en-US.json
│   ├── App.tsx                   # Main app with scene navigation
│   ├── App.css                   # App styles
│   └── main.tsx                  # Entry point
├── package.json
└── README.md
```

## 🎨 Features

### ✅ Complete API Coverage

- **Core Translation**: `t()`, `locale`, `setLocale()`
- **React Integration**: `useI18n()` (recommended), `<Translation>`, `createI18n()`
- **Global Usage**: Global `t()` for pure functions, class methods, utilities
- **Advanced Features**: Pluralization, interpolation, lazy loading
- **Developer Tools**: DevTools integration, missing key tracking
- **Performance**: Caching, batch updates, optimization

### ✅ Best Practices Implemented

1. **Lazy Loading**: Dynamic imports for language resources
2. **Caching**: Memory cache with TTL and LRU eviction
3. **Error Handling**: Graceful fallbacks and error boundaries
4. **DevTools**: Development-only debugging tools
5. **TypeScript**: Full type safety throughout
6. **Responsive Design**: Mobile-friendly UI
7. **Accessibility**: Semantic HTML and ARIA labels

### ✅ Translation Key Structure

This demo uses **flat translation keys** for better CLI compatibility:

```json
{
  "appTitle": "TransLink I18n React Demo",
  "basicTranslationTitle": "Basic Translation",
  "greeting": "Hello, {{name}}!"
}
```

**Benefits**:
- ✅ CLI extract tool generates flat keys directly
- ✅ Shorter code: `t('hello')` vs `t('demos.basic.hello')`
- ✅ Better performance: single hash lookup
- ✅ Easier maintenance: flat JSON is more readable

**Nested keys** are kept only for demonstration purposes:
- `nested.level1.level2` (testing nested access)
- `items[0]` (testing array access)
- `items_zero/one/other` (pluralization)

## 🛠️ Development

### Testing Scenarios

Each scene component validates specific functionality:

```tsx
// Scene 01: Basic Translation
t('hello')                                    // ✅ Basic
t('nested.level1.level2')                     // ✅ Nested
t('items[0]')                                 // ✅ Array
t('missing', {}, { defaultValue: 'Fallback' }) // ✅ Fallback

// Scene 02: Language Switcher
setLocale('en-US')                            // ✅ Switch language
locale                                        // ✅ Current language
availableLocales                              // ✅ Supported languages
isLoading                                     // ✅ Loading state

// Scene 03: Parameter Interpolation
t('greeting', { name: 'Alice' })              // ✅ String params
t('userInfo', { age: 30, date: new Date() })  // ✅ Mixed types

// Scene 04: Pluralization
t('items', { count: 0 })                      // ✅ Zero
t('items', { count: 1 })                      // ✅ One
t('items', { count: 5 })                      // ✅ Other

// Scene 05: Translation Component
<Translation i18nKey="key" />                 // ✅ Basic
<Translation i18nKey="key" values={{...}} />  // ✅ With params
<Translation i18nKey="key" components={{...}} /> // ✅ Rich text

// Scene 06: React Hooks (Best Practice)
const { t, locale, setLocale } = useI18n()   // ✅ One hook for everything

// Scene 07: Loading States
isReady                                       // ✅ Initialization
isLoading                                     // ✅ Resource loading

// Scene 08: Error Handling
t('missing.key')                              // ✅ Returns key
t('missing', {}, { defaultValue: 'X' })       // ✅ Uses default

// Scene 09: Performance
// Cache statistics, batch operations, lazy loading
```

### DevTools Usage

Open browser console and use:

```javascript
// Access DevTools
window.__TRANSLINK_DEVTOOLS__

// Get statistics
__TRANSLINK_DEVTOOLS__.getStats()

// Print missing keys
__TRANSLINK_DEVTOOLS__.printStats()

// Export missing keys as JSON
__TRANSLINK_DEVTOOLS__.exportJSON()

// Clear tracked data
__TRANSLINK_DEVTOOLS__.clear()

// Show help
__TRANSLINK_DEVTOOLS__.help()
```

## 📚 Integration with CLI

This demo works seamlessly with `@translink/i18n-cli`:

```bash
# Extract translation keys from code
pnpm i18n:extract

# Translate to multiple languages with AI
pnpm i18n:translate --provider openai

# Export to Excel for manual editing
pnpm i18n:export

# Import from Excel after editing
pnpm i18n:import
```

## 🎯 Validation Checklist

Use this checklist to verify all features work correctly:

### Core Functionality
- [ ] Basic translation with `t()`
- [ ] Nested key access
- [ ] Array indexing
- [ ] Default value fallback
- [ ] Language switching
- [ ] Reactive locale updates

### Advanced Features
- [ ] Parameter interpolation (string, number, date)
- [ ] HTML escaping
- [ ] Pluralization (zero, one, other)
- [ ] Language-specific plural rules
- [ ] Translation component
- [ ] Rich text with components

### React Integration
- [ ] `useTranslation()` hook
- [ ] `useI18n()` hook
- [ ] `<Translation>` component
- [ ] `<I18nProvider>` setup

### Performance & Optimization
- [ ] Lazy loading of language resources
- [ ] Cache hits and misses
- [ ] Batch translation operations
- [ ] Memory management

### Error Handling
- [ ] Missing key handling
- [ ] Error boundaries
- [ ] Fallback rendering
- [ ] DevTools tracking

### Loading States
- [ ] `isReady` during initialization
- [ ] `isLoading` during language switch
- [ ] Conditional UI rendering
- [ ] Loading indicators

## 🔗 Related Packages

- `@translink/i18n-runtime` - Runtime library
- `@translink/i18n-cli` - CLI tools
- `@translink/vite-plugin-i18n` - Vite plugin

## 📄 License

MIT

---

**Note**: This demo is designed for **validation and testing**. For production applications, refer to the official documentation and examples in the `@translink/i18n-runtime` package.
