# 常见问题解答 (FAQ)

本文档收集了 TransLink I18n 使用过程中的常见问题和解决方案。

## 📋 目录

- [安装和配置](#安装和配置)
- [文本提取](#文本提取)
- [翻译和语言管理](#翻译和语言管理)
- [开发和调试](#开发和调试)
- [性能和优化](#性能和优化)
- [部署和生产](#部署和生产)
- [框架集成](#框架集成)
- [云端同步](#云端同步)
- [故障排除](#故障排除)

## 🔧 安装和配置

### Q: 如何安装 TransLink I18n？

**A**: 根据您的项目类型选择合适的安装方式：

```bash
# 基础安装
npm install @translink/i18n-runtime

# 开发工具
npm install --save-dev @translink/i18n-cli @translink/vite-plugin-i18n

# 或使用 yarn
yarn add @translink/i18n-runtime
yarn add -D @translink/i18n-cli @translink/vite-plugin-i18n
```

### Q: 支持哪些 Node.js 版本？

**A**: TransLink I18n 支持 Node.js 16.0.0 及以上版本。推荐使用 LTS 版本。

```bash
# 检查 Node.js 版本
node --version

# 如果版本过低，请升级
nvm install --lts
nvm use --lts
```

### Q: 如何配置 TypeScript 支持？

**A**: TransLink I18n 内置了完整的 TypeScript 支持：

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "src/**/*",
    "i18n.config.ts"
  ]
}

// 类型声明
declare module 'virtual:i18n-language-*' {
  const translations: Record<string, string>;
  export default translations;
}
```

### Q: 配置文件应该放在哪里？

**A**: 配置文件 `i18n.config.ts` 应该放在项目根目录：

```
my-project/
├── src/
├── public/
├── package.json
├── vite.config.ts
└── i18n.config.ts  ← 这里
```

### Q: 如何在 monorepo 中使用？

**A**: 在 monorepo 中，每个包可以有自己的配置：

```bash
# 项目结构
packages/
├── web/
│   ├── i18n.config.ts
│   └── src/
├── mobile/
│   ├── i18n.config.ts
│   └── src/
└── shared/
    └── locales/

# 共享配置
# packages/shared/i18n.base.config.ts
export const baseConfig = {
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
    fallback: 'en-US'
  }
};

# packages/web/i18n.config.ts
import { defineConfig } from '@translink/i18n-cli';
import { baseConfig } from '../shared/i18n.base.config';

export default defineConfig({
  ...baseConfig,
  extract: {
    patterns: ['src/**/*.{vue,ts,js}']
  }
});
```

## 📝 文本提取

### Q: 为什么我的文本没有被提取？

**A**: 检查以下几个方面：

1. **文件模式匹配**：

```typescript
// i18n.config.ts
export default defineConfig({
  extract: {
    patterns: [
      'src/**/*.{vue,ts,js,tsx,jsx}', // 确保包含您的文件类型
      'components/**/*.vue',
    ],
    exclude: [
      'node_modules',
      'dist',
      '**/*.test.*', // 确保没有意外排除
    ],
  },
});
```

2. **函数名称**：

```typescript
// 确保使用了配置中的函数名
$tsl('需要翻译的文本'); // ✅
t('需要翻译的文本'); // ✅ 如果在 functions 中配置了
translate('文本'); // ❌ 如果没有在 functions 中配置
```

3. **文本格式**：

```typescript
// ✅ 正确的格式
$tsl('这是需要翻译的文本');
$tsl('用户名：{{username}}', { username });

// ❌ 不会被提取
const text = '这是变量中的文本';
$tsl(text); // 动态文本无法提取
```

### Q: 如何提取模板字符串中的文本？

**A**: TransLink I18n 支持模板字符串提取：

```typescript
// ✅ 支持的模板字符串
$tsl(`欢迎 ${username} 使用我们的产品`);
// 会被转换为：$tsl('欢迎 {{username}} 使用我们的产品', { username })

// ✅ 复杂的模板字符串
$tsl(`您有 ${count} 条${type}消息`);
// 会被转换为：$tsl('您有 {{count}} 条{{type}}消息', { count, type })
```

### Q: 如何处理条件文本？

**A**: 对于条件文本，建议拆分为多个翻译：

```typescript
// ❌ 不推荐
$tsl(isVip ? '尊贵的VIP用户' : '普通用户');

// ✅ 推荐
const userType = isVip ? $tsl('尊贵的VIP用户') : $tsl('普通用户');

// 或者使用上下文
$tsl('用户类型', {}, { context: isVip ? 'vip' : 'normal' });
```

### Q: 提取后的文本在哪里？

**A**: 提取的文本会保存在配置的输出目录：

```bash
# 默认位置
src/locales/
├── extracted-texts.json  # 提取的原始数据
├── zh-CN.json           # 构建后的中文翻译
└── en-US.json           # 构建后的英文翻译

# 查看提取结果
npx translink-i18n extract --dry-run  # 预览模式
npx translink-i18n analyze           # 分析报告
```

## 🌐 翻译和语言管理

### Q: 如何添加新语言？

**A**: 添加新语言需要几个步骤：

1. **更新配置**：

```typescript
// i18n.config.ts
export default defineConfig({
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP'], // 添加 ja-JP
    fallback: 'en-US',
  },
});
```

2. **构建语言文件**：

```bash
npx translink-i18n build
# 会自动生成 src/locales/ja-JP.json
```

3. **添加翻译内容**：

```json
// src/locales/ja-JP.json
{
  "hash_welcome": "ようこそ",
  "hash_greeting": "こんにちは、{{name}}さん！"
}
```

### Q: 如何处理复数形式？

**A**: TransLink I18n 支持 ICU 复数规则：

```typescript
// 在翻译文件中定义复数形式
{
  "hash_items": {
    "zero": "没有项目",
    "one": "1 个项目",
    "other": "{{count}} 个项目"
  }
}

// 在代码中使用
$tsl('{{count}} 个项目', { count }, { count })
```

### Q: 如何实现上下文相关的翻译？

**A**: 使用上下文功能：

```typescript
// 配置上下文
// i18n.config.ts
export default defineConfig({
  hash: {
    includeContext: true,
    contextFields: ['componentName', 'functionName'],
  },
});

// 在不同组件中使用相同文本
// UserProfile.vue
$tsl('编辑'); // 生成 hash_UserProfile_edit

// ProductList.vue
$tsl('编辑'); // 生成 hash_ProductList_edit

// 手动指定上下文
$tsl('删除', {}, { context: 'user' });
$tsl('删除', {}, { context: 'product' });
```

### Q: 如何处理嵌套的翻译对象？

**A**: 可以使用命名空间或扁平化键名：

```typescript
// 方式1：使用命名空间
i18n.t('user:profile.name')
i18n.t('common:buttons.save')

// 方式2：扁平化键名
{
  "hash_user_profile_name": "姓名",
  "hash_common_buttons_save": "保存"
}

// 方式3：保持嵌套结构（推荐）
{
  "user": {
    "hash_profile_name": "姓名"
  },
  "common": {
    "hash_buttons_save": "保存"
  }
}
```

## 🛠️ 开发和调试

### Q: 热更新不工作怎么办？

**A**: 检查以下配置：

1. **Vite 插件配置**：

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    createI18nPlugin({
      hotReload: true, // 确保启用
      localesDir: 'src/locales', // 确保路径正确
    }),
  ],
});
```

2. **开发服务器设置**：

```typescript
// 确保开发服务器正在运行
npm run dev

// 检查控制台是否有 HMR 相关日志
// [vite] hmr update /src/locales/zh-CN.json
```

3. **文件监听**：

```bash
# 确保文件系统支持监听
# 在某些系统上可能需要增加监听限制
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Q: 如何调试翻译问题？

**A**: 使用内置的调试功能：

```typescript
// 开启调试模式
const i18n = new I18nEngine({
  debug: process.env.NODE_ENV === 'development',
  // ... 其他配置
});

// 监听调试事件
i18n.on('translationMissing', (key, language) => {
  console.warn(`🌐 Missing: ${key} for ${language}`);
});

i18n.on('translationUsed', (key, result) => {
  console.log(`🌐 Used: ${key} -> ${result}`);
});

// 检查翻译状态
console.log('Current language:', i18n.getCurrentLanguage());
console.log('Available languages:', i18n.getAvailableLanguages());
console.log('Cache stats:', i18n.getCacheStats());
```

### Q: 如何在开发时预览不同语言？

**A**: 几种方式可以快速切换语言：

```typescript
// 1. URL 参数
// http://localhost:3000?lang=en-US
const urlParams = new URLSearchParams(window.location.search);
const langFromUrl = urlParams.get('lang');
if (langFromUrl) {
  i18n.changeLanguage(langFromUrl);
}

// 2. localStorage 持久化
const savedLang = localStorage.getItem('preferred-language');
if (savedLang) {
  i18n.changeLanguage(savedLang);
}

// 3. 开发工具面板
if (process.env.NODE_ENV === 'development') {
  window.__i18n_debug__ = {
    changeLanguage: lang => i18n.changeLanguage(lang),
    getStats: () => i18n.getCacheStats(),
    clearCache: () => i18n.clearCache(),
  };
}
```

### Q: 如何处理异步加载的翻译？

**A**: 使用懒加载和加载状态管理：

```typescript
// Vue 示例
const { t, locale, setLocale } = useI18n();
const loading = ref(false);

const changeLanguage = async (newLang: string) => {
  loading.value = true;
  try {
    await setLocale(newLang);
  } catch (error) {
    console.error('Language change failed:', error);
    // 显示错误提示
  } finally {
    loading.value = false;
  }
};

// React 示例
const [loading, setLoading] = useState(false);
const { changeLanguage } = useTranslation();

const handleLanguageChange = async (newLang: string) => {
  setLoading(true);
  try {
    await changeLanguage(newLang);
  } catch (error) {
    console.error('Language change failed:', error);
  } finally {
    setLoading(false);
  }
};
```

## ⚡ 性能和优化

### Q: 如何优化翻译性能？

**A**: 几个关键的优化策略：

1. **启用缓存**：

```typescript
const i18n = new I18nEngine({
  cache: {
    enabled: true,
    maxSize: 1000, // 根据应用大小调整
    ttl: 10 * 60 * 1000, // 10分钟
    storage: 'memory', // 或 'localStorage'
  },
});
```

2. **使用懒加载**：

```typescript
// Vite 插件配置
createI18nPlugin({
  lazyLoad: true,
  preload: ['zh-CN'], // 只预加载默认语言
});
```

3. **优化构建输出**：

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'i18n-zh': ['virtual:i18n-language-zh-CN'],
          'i18n-en': ['virtual:i18n-language-en-US'],
        },
      },
    },
  },
});
```

### Q: 翻译文件太大怎么办？

**A**: 几种减小文件大小的方法：

1. **移除未使用的翻译**：

```bash
# 分析未使用的翻译
npx translink-i18n analyze --unused

# 构建时自动移除
npx translink-i18n build --remove-unused
```

2. **按功能模块分割**：

```typescript
// 按命名空间分割
// i18n.config.ts
export default defineConfig({
  output: {
    splitByNamespace: true, // 生成多个文件
  },
});

// 结果：
// src/locales/zh-CN/common.json
// src/locales/zh-CN/user.json
// src/locales/zh-CN/product.json
```

3. **压缩翻译文件**：

```typescript
// 生产环境压缩
export default defineConfig({
  output: {
    minify: process.env.NODE_ENV === 'production',
  },
});
```

### Q: 如何监控翻译性能？

**A**: 使用性能监控工具：

```typescript
// 性能监控
class I18nPerformanceMonitor {
  private metrics = new Map<string, number[]>();

  measureTranslation(key: string, fn: () => string): string {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    const times = this.metrics.get(key) || [];
    times.push(end - start);
    this.metrics.set(key, times);

    return result;
  }

  getReport() {
    const report: Record<string, any> = {};

    for (const [key, times] of this.metrics) {
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      const max = Math.max(...times);

      report[key] = {
        count: times.length,
        avgTime: avg.toFixed(2),
        maxTime: max.toFixed(2),
      };
    }

    return report;
  }
}

// 使用监控
const monitor = new I18nPerformanceMonitor();
const originalT = i18n.t;

i18n.t = (key, params, options) => {
  return monitor.measureTranslation(key, () =>
    originalT.call(i18n, key, params, options)
  );
};
```

## 🚀 部署和生产

### Q: 生产环境需要注意什么？

**A**: 生产环境的关键配置：

1. **构建优化**：

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    createI18nPlugin({
      // 生产环境配置
      minify: true,
      removeUnusedKeys: true,
      hotReload: false, // 生产环境关闭
    }),
  ],
});
```

2. **错误处理**：

```typescript
// 生产环境错误处理
i18n.on('error', error => {
  // 发送到错误监控服务
  errorReporting.captureException(error);
});

i18n.on('translationMissing', (key, language) => {
  // 记录缺失的翻译
  analytics.track('translation_missing', { key, language });
});
```

3. **CDN 部署**：

```typescript
// 使用 CDN 加载翻译文件
const i18n = new I18nEngine({
  loader: {
    loadFunction: async language => {
      const response = await fetch(
        `https://cdn.example.com/locales/${language}.json`
      );
      return response.json();
    },
  },
});
```

### Q: 如何处理翻译文件的版本控制？

**A**: 建议的版本控制策略：

```json
// 翻译文件版本信息
{
  "_meta": {
    "version": "1.2.0",
    "lastUpdated": "2023-12-25T10:00:00Z",
    "hash": "abc123def456"
  },
  "hash_welcome": "欢迎使用",
  "hash_greeting": "你好，{{name}}！"
}
```

```typescript
// 版本检查
const checkTranslationVersion = async (language: string) => {
  const local = await getLocalTranslationVersion(language);
  const remote = await getRemoteTranslationVersion(language);

  if (local !== remote) {
    console.log(`Translation update available for ${language}`);
    // 可选择性更新或提示用户
  }
};
```

### Q: 如何实现翻译的 A/B 测试？

**A**: 翻译 A/B 测试实现：

```typescript
// A/B 测试配置
interface TranslationVariant {
  id: string;
  weight: number;
  translations: Record<string, string>;
}

class I18nABTester {
  private variants: TranslationVariant[] = [];
  private currentVariant: string | null = null;

  addVariant(variant: TranslationVariant) {
    this.variants.push(variant);
  }

  selectVariant(): string {
    if (this.currentVariant) return this.currentVariant;

    const random = Math.random();
    let cumulative = 0;

    for (const variant of this.variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        this.currentVariant = variant.id;
        return variant.id;
      }
    }

    return this.variants[0]?.id || 'default';
  }

  getTranslation(key: string, defaultValue: string): string {
    const variantId = this.selectVariant();
    const variant = this.variants.find(v => v.id === variantId);

    return variant?.translations[key] || defaultValue;
  }
}

// 使用 A/B 测试
const abTester = new I18nABTester();
abTester.addVariant({
  id: 'variant_a',
  weight: 0.5,
  translations: {
    hash_cta_button: '立即购买',
  },
});
abTester.addVariant({
  id: 'variant_b',
  weight: 0.5,
  translations: {
    hash_cta_button: '马上下单',
  },
});
```

## 🔌 框架集成

### Q: Vue 3 集成有什么注意事项？

**A**: Vue 3 集成的关键点：

1. **正确的插件安装**：

```typescript
// main.ts
import { createApp } from 'vue';
import { createI18n } from '@translink/i18n-runtime/vue';
import App from './App.vue';

const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  // ... 配置
});

const app = createApp(App);
app.use(i18n);
app.mount('#app');
```

2. **组合式 API 使用**：

```vue
<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale, setLocale } = useI18n();

// 响应式语言切换
watch(locale, newLocale => {
  document.documentElement.lang = newLocale;
});
</script>
```

3. **SSR 支持**：

```typescript
// 服务端渲染配置
import { createSSRApp } from 'vue';
import { createI18n } from '@translink/i18n-runtime/vue';

export function createApp() {
  const app = createSSRApp(App);
  const i18n = createI18n({
    // SSR 特定配置
    ssr: true,
    defaultLanguage: 'zh-CN',
  });

  app.use(i18n);
  return { app, i18n };
}
```

### Q: React 集成有什么特殊要求？

**A**: React 集成的注意事项：

1. **Provider 设置**：

```tsx
// App.tsx
import { I18nProvider } from '@translink/i18n-runtime/react';
import { i18n } from './i18n';

function App() {
  return (
    <I18nProvider engine={i18n}>
      <Router>
        <Routes>{/* 路由配置 */}</Routes>
      </Router>
    </I18nProvider>
  );
}
```

2. **Hook 使用**：

```tsx
// 组件中使用
function MyComponent() {
  const { t, language, changeLanguage } = useTranslation();

  // 处理异步语言切换
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = async (newLang: string) => {
    setLoading(true);
    try {
      await changeLanguage(newLang);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{$tsl('欢迎使用')}</h1>
      {loading && <div>切换中...</div>}
    </div>
  );
}
```

3. **Next.js 集成**：

```typescript
// _app.tsx
import type { AppProps } from 'next/app';
import { I18nProvider } from '@translink/i18n-runtime/react';
import { i18n } from '../lib/i18n';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider engine={i18n}>
      <Component {...pageProps} />
    </I18nProvider>
  );
}

// next.config.js
const createI18nPlugin = require('@translink/vite-plugin-i18n');

module.exports = {
  webpack: (config) => {
    // 添加 TransLink I18n 支持
    return config;
  }
};
```

## ☁️ 云端同步

### Q: 如何配置 Vika 云端同步？

**A**: Vika 配置步骤：

1. **获取 API 密钥**：
   - 登录 [Vika](https://vika.cn)
   - 创建数据表
   - 获取 API Token 和 Datasheet ID

2. **配置环境变量**：

```bash
# .env
VIKA_API_KEY=your_api_key_here
VIKA_DATASHEET_ID=your_datasheet_id_here
```

3. **更新配置文件**：

```typescript
// i18n.config.ts
export default defineConfig({
  vika: {
    apiKey: process.env.VIKA_API_KEY!,
    datasheetId: process.env.VIKA_DATASHEET_ID!,
    autoSync: false, // 手动同步更安全
    syncInterval: 0,
  },
});
```

4. **使用同步命令**：

```bash
# 推送到云端
npx translink-i18n push

# 从云端拉取
npx translink-i18n pull

# 预览同步内容
npx translink-i18n push --dry-run
npx translink-i18n pull --dry-run
```

### Q: 云端同步失败怎么办？

**A**: 常见的同步问题和解决方案：

1. **认证失败**：

```bash
# 检查 API 密钥
echo $VIKA_API_KEY

# 测试连接
npx translink-i18n test-connection
```

2. **网络问题**：

```typescript
// 配置代理
export default defineConfig({
  vika: {
    apiKey: process.env.VIKA_API_KEY!,
    datasheetId: process.env.VIKA_DATASHEET_ID!,
    proxy: 'http://proxy.company.com:8080', // 如果需要代理
  },
});
```

3. **数据冲突**：

```bash
# 强制覆盖云端数据
npx translink-i18n push --force

# 强制覆盖本地数据
npx translink-i18n pull --force

# 备份后同步
npx translink-i18n pull --backup
```

### Q: 如何实现团队协作翻译？

**A**: 团队协作的最佳实践：

1. **建立工作流**：

```bash
# 开发者工作流
git checkout -b feature/new-texts
# 开发新功能，添加 $tsl() 调用
npx translink-i18n extract
npx translink-i18n push
git commit -m "Add new translatable texts"

# 翻译者工作流
# 在 Vika 中翻译
# 通知开发者翻译完成

# 开发者拉取翻译
npx translink-i18n pull
npx translink-i18n build
git add src/locales/
git commit -m "Update translations"
```

2. **权限管理**：

```typescript
// 不同环境使用不同的 API 密钥
const vikaConfig = {
  development: {
    apiKey: process.env.VIKA_DEV_API_KEY,
    datasheetId: process.env.VIKA_DEV_DATASHEET_ID,
  },
  production: {
    apiKey: process.env.VIKA_PROD_API_KEY,
    datasheetId: process.env.VIKA_PROD_DATASHEET_ID,
  },
};

export default defineConfig({
  vika: vikaConfig[process.env.NODE_ENV] || vikaConfig.development,
});
```

## 🔍 故障排除

### Q: 常见错误及解决方案

**A**: 以下是一些常见错误的解决方案：

#### 错误：`Cannot resolve virtual:i18n-language-*`

```bash
# 解决方案：确保 Vite 插件正确配置
# vite.config.ts
import createI18nPlugin from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    createI18nPlugin() // 确保插件已添加
  ]
});
```

#### 错误：`Translation key not found`

```typescript
// 解决方案：检查翻译文件和键名
// 1. 确保运行了构建命令
npx translink-i18n build

// 2. 检查翻译文件是否存在
ls src/locales/

// 3. 验证键名是否正确
console.log(Object.keys(translations));
```

#### 错误：`Language loading failed`

```typescript
// 解决方案：检查加载配置
const i18n = new I18nEngine({
  loader: {
    loadFunction: async language => {
      try {
        const module = await import(`virtual:i18n-language-${language}`);
        return module.default;
      } catch (error) {
        console.error(`Failed to load ${language}:`, error);
        throw error;
      }
    },
  },
});
```

### Q: 如何启用详细的调试信息？

**A**: 启用调试模式：

```typescript
// 1. 环境变量
DEBUG=translink:* npm run dev

// 2. 配置文件
export default defineConfig({
  debug: true,
  logLevel: 'verbose'
});

// 3. 运行时调试
const i18n = new I18nEngine({
  debug: true,
  // ... 其他配置
});

// 监听所有事件
i18n.onAny((event, ...args) => {
  console.log(`I18n Event: ${event}`, args);
});
```

### Q: 性能问题如何排查？

**A**: 性能排查步骤：

```typescript
// 1. 检查缓存命中率
const stats = i18n.getCacheStats();
console.log('Cache hit rate:', stats.hitRate);

// 2. 监控翻译时间
const start = performance.now();
const result = i18n.t('some.key');
const end = performance.now();
console.log('Translation time:', end - start, 'ms');

// 3. 分析包大小
npx webpack-bundle-analyzer dist/

// 4. 检查内存使用
console.log('Memory usage:', process.memoryUsage());
```

### Q: 如何报告 Bug？

**A**: 报告 Bug 时请提供：

1. **环境信息**：

```bash
# 收集环境信息
npx translink-i18n --version
node --version
npm --version

# 项目信息
cat package.json | grep -A 10 -B 10 translink
```

2. **重现步骤**：
   - 详细的操作步骤
   - 预期结果 vs 实际结果
   - 错误信息和堆栈跟踪

3. **最小重现示例**：
   - 创建最小的重现案例
   - 提供相关的配置文件
   - 包含必要的代码片段

4. **提交位置**：
   - [GitHub Issues](https://github.com/lynncen/translink-i18n/issues)
   - 使用合适的 Issue 模板
   - 添加相关的标签

---

如果您的问题没有在这里找到答案，请：

1. 查看 [使用指南](./guides/README.md)
2. 搜索 [GitHub Issues](https://github.com/lynncen/translink-i18n/issues)
3. 在 [GitHub Discussions](https://github.com/lynncen/translink-i18n/discussions) 中提问
4. 提交新的 [Issue](https://github.com/lynncen/translink-i18n/issues/new)

我们会尽快为您提供帮助！
