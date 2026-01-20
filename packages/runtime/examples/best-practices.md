# Best Practices Guide

This guide provides recommendations for using TransLink I18n Runtime effectively in production applications.

## Table of Contents

1. [Performance Optimization](#performance-optimization)
2. [Memory Management](#memory-management)
3. [Error Handling](#error-handling)
4. [Development Workflow](#development-workflow)
5. [Production Deployment](#production-deployment)
6. [Common Pitfalls](#common-pitfalls)

---

## Performance Optimization

### 1. Lazy Load Languages

**❌ Bad**: Loading all languages upfront

```typescript
import zhCN from './locales/zh-CN.json'; // 100KB
import enUS from './locales/en-US.json'; // 100KB
import jaJP from './locales/ja-JP.json'; // 100KB
import frFR from './locales/fr-FR.json'; // 100KB
// Total: 400KB in initial bundle!

const i18n = createI18n({
  resources: { 'zh-CN': zhCN, 'en-US': enUS, 'ja-JP': jaJP, 'fr-FR': frFR },
});
```

**✅ Good**: Load language on demand

```typescript
const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US', 'ja-JP', 'fr-FR'],
  loadFunction: async lng => {
    const module = await import(`./locales/${lng}.json`);
    return module.default;
  },
});
// Initial bundle: only current language (~100KB)
```

### 2. Enable Caching

**✅ Good**: Enable cache with appropriate TTL

```typescript
const i18n = createI18n({
  cache: {
    enabled: true,
    maxSize: 1000, // Limit memory usage
    ttl: 5 * 60 * 1000, // 5 minutes
    storage: 'memory', // or 'localStorage' for persistence
  },
});
```

### 3. Use Batch Updates

**❌ Bad**: Multiple individual updates

```typescript
translations.forEach(key => {
  updateUI(t(key)); // Triggers re-render for each key
});
```

**✅ Good**: Batch updates together

```typescript
import { batchUpdates } from '@translink/i18n-runtime';

batchUpdates(translations.map(key => () => updateUI(t(key))));
// Single re-render for all updates
```

### 4. Prefetch Languages

```typescript
// Prefetch next likely language in the background
const i18n = await createI18n({
  /* ... */
});

// After app loads
requestIdleCallback(() => {
  i18n.preloadLanguages(['en-US', 'ja-JP']);
});
```

### 5. Optimize Bundle Size

```typescript
// Use tree-shaking - import only what you need
import { I18nEngine } from '@translink/i18n-runtime';
// ✅ Only core engine, ~15KB

// Avoid importing everything
import * as I18n from '@translink/i18n-runtime';
// ❌ All features, ~50KB
```

---

## Memory Management

### 1. Clean Up Event Listeners

**✅ Good**: Always unsubscribe

```typescript
// Vue
const { t } = useI18n();
const unsubscribe = engine.on('languageChanged', handler);
onUnmounted(() => unsubscribe());

// React
useEffect(() => {
  const unsubscribe = engine.on('languageChanged', handler);
  return () => unsubscribe();
}, []);
```

### 2. Limit Cache Size

```typescript
const i18n = createI18n({
  cache: {
    maxSize: 1000, // Prevent unlimited growth
  },
});
```

### 3. Clear Cache When Appropriate

```typescript
// Clear cache when user logs out
function logout() {
  i18n.clearCache();
  // ... rest of logout logic
}

// Or clear specific language cache
function switchUser() {
  const cache = i18n.getCacheManager();
  cache.clearByPrefix('en-US:');
}
```

### 4. Destroy Engine on Unmount

```typescript
// Clean up when app unmounts
function cleanup() {
  i18n.destroy(); // Clears cache, removes listeners
}
```

---

## Error Handling

### 1. Always Provide Fallbacks

**❌ Bad**: No fallback

```typescript
const text = t('some.key'); // Returns "some.key" if missing
```

**✅ Good**: Explicit fallback

```typescript
const text = t('some.key', {}, { defaultValue: 'Default Text' });
```

### 2. Handle Missing Translations

```typescript
const i18n = createI18n({
  devTools: {
    enabled: true,
    trackMissingKeys: true,
  },
});

// Track missing keys
i18n.on('translationMissing', (key, language) => {
  // Log to analytics
  console.warn(`Missing translation: ${key} for ${language}`);

  // Send to error tracking service
  errorTracker.captureMessage(`Missing i18n key: ${key}`);
});
```

### 3. Handle Load Failures

```typescript
const i18n = createI18n({
  loadFunction: async lng => {
    try {
      const response = await fetch(`/api/translations/${lng}`);
      if (!response.ok) throw new Error('Load failed');
      return response.json();
    } catch (error) {
      console.error(`Failed to load ${lng}:`, error);
      // Return fallback translations
      return getFallbackTranslations(lng);
    }
  },
});
```

---

## Development Workflow

### 1. Use DevTools During Development

```typescript
const i18n = createI18n({
  devTools: {
    enabled: process.env.NODE_ENV === 'development',
    trackMissingKeys: true,
    logMissingKeys: true,
    exposeToWindow: true,
  },
});
```

**Check missing keys in console**:

```javascript
// Print statistics
window.__TRANSLINK_DEVTOOLS__.printStats();

// Export missing keys for translation
window.__TRANSLINK_DEVTOOLS__.exportCSV();
```

### 2. Type-Safe Translation Keys

```typescript
// Define translation schema
interface Translations {
  common: {
    welcome: string;
    goodbye: string;
  };
  errors: {
    network: string;
    auth: string;
  };
}

// Use with type checking
declare module '@translink/i18n-runtime' {
  interface I18nEngine {
    t<K extends keyof Translations>(key: K): string;
  }
}
```

### 3. Organize Translation Files

```
locales/
├── zh-CN/
│   ├── common.json      # Common UI texts
│   ├── errors.json      # Error messages
│   ├── validation.json  # Form validation
│   └── pages/
│       ├── home.json
│       └── profile.json
└── en-US/
    └── ... (same structure)
```

### 4. Use Extraction Tools

```bash
# Extract texts from code
npx translink extract

# Export to Excel for translators
npx translink export --format excel

# Import translated texts
npx translink import translations.xlsx
```

---

## Production Deployment

### 1. Disable DevTools in Production

```typescript
const i18n = createI18n({
  devTools: {
    enabled: false, // ✅ Disable in production
  },
  debug: false,
  logLevel: 'error', // Only log errors
});
```

### 2. Use CDN for Translation Files

```typescript
const i18n = createI18n({
  loadFunction: async lng => {
    // Load from CDN
    const response = await fetch(
      `https://cdn.example.com/translations/${lng}.json`
    );
    return response.json();
  },
});
```

### 3. Cache Translation Files

```typescript
// Use service worker to cache translation files
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/translations/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### 4. Monitor Performance

```typescript
// Track translation performance
const start = performance.now();
const text = t('some.key');
const duration = performance.now() - start;

if (duration > 10) {
  console.warn(`Slow translation: ${duration}ms for ${key}`);
}

// Monitor cache hit rate
const stats = i18n.getCacheStats();
console.log(`Cache hit rate: ${stats.hitRate * 100}%`);
```

---

## Common Pitfalls

### 1. ❌ Don't Translate in Loops

**Bad**:

```typescript
items.forEach(item => {
  item.label = t(item.key); // Translates on every render
});
```

**Good**:

```typescript
const translations = useMemo(() => {
  return items.map(item => ({
    ...item,
    label: t(item.key),
  }));
}, [items, locale]); // Only retranslate when needed
```

### 2. ❌ Don't Load All Languages Synchronously

**Bad**:

```typescript
const allLanguages = ['zh-CN', 'en-US', 'ja-JP', ...];
allLanguages.forEach(lang => {
  i18n.loadLanguage(lang);  // Blocks UI
});
```

**Good**:

```typescript
// Load current language
await i18n.loadLanguage(currentLang);

// Prefetch others in background
requestIdleCallback(() => {
  otherLanguages.forEach(lang => i18n.loadLanguage(lang));
});
```

### 3. ❌ Don't Ignore Pluralization

**Bad**:

```typescript
const text = count === 1 ? `${count} item` : `${count} items`;
```

**Good**:

```typescript
const text = t('item', { count });
// Handles all plural forms automatically
```

### 4. ❌ Don't Mutate Translation Objects

**Bad**:

```typescript
const translations = i18n.getResource('zh-CN');
translations.newKey = 'new value'; // Don't mutate!
```

**Good**:

```typescript
i18n.addResource('zh-CN', 'translation', {
  newKey: 'new value',
});
```

### 5. ❌ Don't Forget Error Boundaries

**Bad**:

```typescript
// Crashes app if translation fails
<h1>{t('title')}</h1>
```

**Good**:

```typescript
// Wrapped in error boundary
<ErrorBoundary fallback={<h1>Welcome</h1>}>
  <h1>{t('title', {}, { defaultValue: 'Welcome' })}</h1>
</ErrorBoundary>
```

---

## Performance Checklist

- [ ] Enable caching with appropriate TTL
- [ ] Lazy load languages on demand
- [ ] Prefetch likely next languages
- [ ] Use batch updates for multiple translations
- [ ] Disable DevTools in production
- [ ] Monitor cache hit rate
- [ ] Clean up event listeners
- [ ] Provide fallback translations
- [ ] Use CDN for translation files
- [ ] Implement service worker caching

---

## Security Checklist

- [ ] Sanitize user input before translation
- [ ] Escape HTML in translations
- [ ] Validate translation file sources
- [ ] Use HTTPS for remote translations
- [ ] Implement CSP headers
- [ ] Audit translation file access
- [ ] Rate limit translation API calls

---

## See Also

- [Vue 3 Example](./vue-example.md)
- [React Example](./react-example.md)
- [SSR Example](./ssr-example.md)
- [API Documentation](../README.md)
