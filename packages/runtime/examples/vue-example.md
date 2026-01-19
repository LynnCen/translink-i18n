# Vue 3 Complete Example

This guide shows how to use TransLink I18n Runtime in a Vue 3 application.

## Installation

```bash
npm install @translink/i18n-runtime
# or
pnpm add @translink/i18n-runtime
```

## Setup

### 1. Create Language Files

```
src/
├── locales/
│   ├── zh-CN.json
│   └── en-US.json
└── main.ts
```

**zh-CN.json**:
```json
{
  "welcome": "欢迎",
  "hello": "你好，{{name}}！",
  "item": "项",
  "item_one": "{{count}} 项",
  "item_other": "{{count}} 项",
  "user": {
    "profile": "个人资料",
    "settings": "设置"
  }
}
```

**en-US.json**:
```json
{
  "welcome": "Welcome",
  "hello": "Hello, {{name}}!",
  "item": "item",
  "item_one": "{{count}} item",
  "item_other": "{{count}} items",
  "user": {
    "profile": "Profile",
    "settings": "Settings"
  }
}
```

### 2. Initialize I18n

**main.ts**:
```typescript
import { createApp } from 'vue';
import { createI18n } from '@translink/i18n-runtime/vue';
import App from './App.vue';

// Import language files
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

// Create i18n instance
const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  resources: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
  // Enable DevTools in development
  devTools: {
    enabled: import.meta.env.DEV,
    trackMissingKeys: true,
    exposeToWindow: true,
  },
  // Enable cache
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5 minutes
    storage: 'memory',
  },
  // Pluralization
  pluralization: {
    enabled: true,
    simplifyPluralSuffix: true,
  },
});

const app = createApp(App);
app.use(i18n);
app.mount('#app');
```

## Usage

### Composition API

```vue
<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';
import { ref } from 'vue';

const { t, locale, setLocale, availableLocales, isReady } = useI18n();
const userName = ref('Alice');
const itemCount = ref(5);

// Switch language
const switchLanguage = () => {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
  setLocale(newLocale);
};
</script>

<template>
  <div v-if="isReady">
    <!-- Basic translation -->
    <h1>{{ t('welcome') }}</h1>

    <!-- With parameters -->
    <p>{{ t('hello', { name: userName }) }}</p>

    <!-- With pluralization -->
    <p>{{ t('item', { count: itemCount }) }}</p>

    <!-- Nested keys -->
    <p>{{ t('user.profile') }}</p>

    <!-- Language switcher -->
    <button @click="switchLanguage">
      {{ locale === 'zh-CN' ? 'English' : '中文' }}
    </button>

    <!-- Language selector -->
    <select :value="locale" @change="e => setLocale(e.target.value)">
      <option v-for="lang in availableLocales" :key="lang" :value="lang">
        {{ lang }}
      </option>
    </select>
  </div>
</template>
```

### Options API

```vue
<script>
export default {
  data() {
    return {
      userName: 'Bob',
      itemCount: 3
    };
  },
  methods: {
    switchLanguage() {
      const newLocale = this.$locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
      this.$i18n.changeLanguage(newLocale);
    }
  }
};
</script>

<template>
  <div>
    <!-- Using $t global property -->
    <h1>{{ $t('welcome') }}</h1>
    <p>{{ $t('hello', { name: userName }) }}</p>
    <p>{{ $t('item', { count: itemCount }) }}</p>

    <!-- Language switcher -->
    <button @click="switchLanguage">
      {{ $locale.value === 'zh-CN' ? 'English' : '中文' }}
    </button>
  </div>
</template>
```

### Using Translation Component

```vue
<script setup>
import { Translation } from '@translink/i18n-runtime/vue';
import { ref } from 'vue';

const userName = ref('Charlie');
</script>

<template>
  <Translation keypath="hello" :params="{ name: userName }" />
  
  <!-- With render prop -->
  <Translation keypath="welcome" v-slot="{ translation }">
    <strong>{{ translation }}</strong>
  </Translation>
</template>
```

### Using v-t Directive

```vue
<script setup>
import { vT } from '@translink/i18n-runtime/vue';

// Register directive locally
const directives = { t: vT };
</script>

<template>
  <div>
    <!-- Simple usage -->
    <span v-t="'welcome'"></span>

    <!-- With parameters -->
    <span v-t="{ key: 'hello', params: { name: 'David' } }"></span>

    <!-- HTML mode -->
    <div v-t.html="'welcome'"></div>
  </div>
</template>
```

## Advanced Usage

### Lazy Loading Languages

```typescript
import { createI18n } from '@translink/i18n-runtime/vue';

const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US', 'ja-JP'],
  // Don't load all resources upfront
  loadPath: '/locales/{{lng}}.json',
  // Or provide custom load function
  loadFunction: async (lng, ns) => {
    const response = await fetch(`/api/translations/${lng}/${ns}`);
    return response.json();
  },
});
```

### SSR Support

```typescript
// server.ts
import { createI18nWithSSR, serializeSSRContext } from '@translink/i18n-runtime';

app.get('*', async (req, res) => {
  const i18n = await createI18nWithSSR({
    defaultLanguage: 'zh-CN',
    supportedLanguages: ['zh-CN', 'en-US'],
    resources: { /* ... */ }
  });

  // Render app
  const html = await renderApp(i18n);
  
  // Serialize context
  const ssrContext = serializeSSRContext(i18n);
  const ssrScript = renderSSRScript(ssrContext);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>${ssrScript}</head>
      <body>${html}</body>
    </html>
  `);
});
```

```typescript
// client.ts
import { createIsomorphicI18n } from '@translink/i18n-runtime';

// Automatically detects SSR context
const i18n = await createIsomorphicI18n({
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
});
```

### Using DevTools

Open browser console:

```javascript
// Check missing translations
window.__TRANSLINK_DEVTOOLS__.printStats()

// Get missing keys
window.__TRANSLINK_DEVTOOLS__.getMissingKeys()

// Export as JSON
window.__TRANSLINK_DEVTOOLS__.exportJSON()

// Export as CSV
window.__TRANSLINK_DEVTOOLS__.exportCSV()

// Clear tracked keys
window.__TRANSLINK_DEVTOOLS__.clear()

// Show help
window.__TRANSLINK_DEVTOOLS__.help()
```

## TypeScript Support

```typescript
// Define your translation structure
interface Translations {
  welcome: string;
  hello: string;
  user: {
    profile: string;
    settings: string;
  };
}

// Use typed i18n
import { useI18n } from '@translink/i18n-runtime/vue';

const { t } = useI18n();

// Type-safe translation keys
const text = t('user.profile'); // ✅ OK
const invalid = t('user.invalid'); // ⚠️ Type error in strict mode
```

## Best Practices

1. **Lazy Load Languages**: Only load the current language to reduce initial bundle size
2. **Enable Caching**: Cache translations to improve performance
3. **Use DevTools**: Track missing translations during development
4. **Prefetch Languages**: Prefetch other languages in the background
5. **Handle Errors**: Always provide fallback values for translations
6. **Use Pluralization**: Let the runtime handle plural forms automatically

## See Also

- [React Example](./react-example.md)
- [SSR Example](./ssr-example.md)
- [Best Practices Guide](./best-practices.md)
