# TransLink I18n 最佳实践

本文档总结了使用 TransLink I18n 的最佳实践，帮助您构建高质量、可维护的国际化应用。

## 📋 目录

- [项目结构](#项目结构)
- [翻译文本编写](#翻译文本编写)
- [键名管理](#键名管理)
- [性能优化](#性能优化)
- [团队协作](#团队协作)
- [测试策略](#测试策略)
- [部署和维护](#部署和维护)
- [安全考虑](#安全考虑)

## 🏗️ 项目结构

### 推荐的目录结构

```
src/
├── locales/                 # 语言文件目录
│   ├── zh-CN.json          # 中文翻译
│   ├── en-US.json          # 英文翻译
│   ├── ja-JP.json          # 日文翻译
│   └── extracted-texts.json # 提取的文本（开发时）
├── i18n/                   # i18n 相关配置和工具
│   ├── index.ts            # i18n 初始化
│   ├── formatters.ts       # 自定义格式化器
│   └── plugins.ts          # 自定义插件
├── components/             # 组件目录
├── views/                  # 页面目录
└── utils/                  # 工具函数
```

### 配置文件组织

```typescript
// i18n.config.ts - 主配置文件
export default defineConfig({
  // 基础配置
});

// i18n/index.ts - 运行时初始化
import { I18nEngine } from '@translink/i18n-runtime';
import { formatters } from './formatters';

export const i18n = new I18nEngine({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en-US',
  interpolation: {
    formatters,
  },
});

// i18n/formatters.ts - 自定义格式化器
export const formatters = {
  currency: (value: number, currency = 'CNY') => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
    }).format(value);
  },
  date: (value: Date | string, format = 'short') => {
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('zh-CN', {
      dateStyle: format as any,
    }).format(date);
  },
};
```

## ⚛️ React 最佳实践

### 1. 使用 createI18n 初始化（推荐）

```typescript
// src/i18n.ts
import { createI18n } from '@translink/i18n-runtime/react';

export const { engine, t, Provider } = createI18n({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  loadFunction: async (lng) => {
    return await import(`./locales/${lng}.json`);
  },
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000,
    storage: 'memory',
  },
});

// main.tsx
import { Provider } from './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
);
```

### 2. 在组件中使用 useI18n（推荐）

```tsx
import { useI18n } from '@translink/i18n-runtime/react';

function MyComponent() {
  // ✅ 推荐：一次性获取所有功能
  const { t, locale, setLocale, isReady, isLoading } = useI18n();

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('greeting', { name: 'User' })}</p>
      <button onClick={() => setLocale('en-US')}>Switch Language</button>
    </div>
  );
}

// ❌ 不推荐：多次调用 Hook
function BadComponent() {
  const { t } = useTranslation();
  const { locale } = useI18n();
  const { setLocale } = useI18n(); // 重复调用
  // ...
}
```

### 3. 在纯函数中使用全局 t

```typescript
// utils/formatters.ts
import { t } from './i18n';

// ✅ 推荐：在纯函数中使用全局 t
export function formatPrice(price: number) {
  return `${price} ${t('currency')}`;
}

export class Validator {
  static validateEmail(email: string) {
    if (!email) {
      return { valid: false, message: t('emailRequired') };
    }
    return { valid: true };
  }
}

// 在异步函数中使用
export async function fetchAndTranslate(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(t('networkError', { status: response.status }));
    }
    return await response.json();
  } catch (error) {
    console.error(t('fetchFailed'), error);
    throw error;
  }
}
```

### 4. 使用 Translation 组件处理富文本

```tsx
import { Translation } from '@translink/i18n-runtime/react';

function RichTextComponent() {
  return (
    <Translation
      i18nKey="termsText"
      values={{ siteName: 'MyApp' }}
      components={{
        Link: ({ children }) => <a href="/terms">{children}</a>,
        Bold: ({ children }) => <strong>{children}</strong>,
      }}
    />
  );
}
```

### 5. 处理加载状态

```tsx
import { useI18n } from '@translink/i18n-runtime/react';

function App() {
  const { t, isReady, isLoading, error } = useI18n();

  // ✅ 推荐：处理所有状态
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!isReady) {
    return <div>Initializing...</div>;
  }

  return (
    <div>
      {isLoading && <div className="loading-indicator">Switching language...</div>}
      <h1>{t('welcome')}</h1>
    </div>
  );
}
```

## ✍️ 翻译文本编写

### 1. 使用清晰、简洁的文本

```typescript
// ✅ 好的做法
t('saveSuccess');
t('usernameRequired');
t('confirmDelete');

// ❌ 避免的做法
t('yourDataHasBeenSuccessfullySavedToOurServerYouCanContinueWithOtherOperations');
t('sorryTheUsernameFieldYouEnteredDoesNotSeemToHaveAnyContentPleasCheckAndReenter');
```

### 2. 合理使用插值

```typescript
// ✅ 推荐的插值使用
$tsl('欢迎回来，{{username}}！');
$tsl('您有 {{count}} 条新消息');
$tsl('文件大小：{{size, fileSize}}');

// ❌ 避免复杂的插值
$tsl(
  '{{user.profile.firstName}} {{user.profile.lastName}} 在 {{formatDate(user.lastLogin)}} 最后登录'
);

// ✅ 应该拆分为更简单的形式
$tsl('{{fullName}} 最后登录时间：{{lastLogin, date}}');
```

### 3. 考虑上下文和语境

```typescript
// ✅ 提供足够的上下文
$tsl('删除用户'); // 按钮文本
$tsl('确认删除用户 {{username}}？'); // 确认对话框
$tsl('用户 {{username}} 已被删除'); // 成功消息

// ❌ 缺乏上下文
$tsl('删除');
$tsl('确认？');
$tsl('完成');
```

### 4. 处理复数形式

```typescript
// ✅ 正确处理复数
$tsl('{{count}} 个文件', { count })
$tsl('{{count}} 条评论', { count })

// 在翻译文件中提供复数形式
{
  "hash_files": {
    "zero": "没有文件",
    "one": "1 个文件",
    "other": "{{count}} 个文件"
  }
}
```

## 🔑 键名管理

### 1. 使用语义化的哈希配置

```typescript
// i18n.config.ts
export default defineConfig({
  hash: {
    algorithm: 'md5',
    length: 8,
    includeContext: true,
    contextFields: ['componentName', 'functionName'],
  },
});
```

### 2. 组织翻译文件结构

```json
{
  "common": {
    "hash_save": "保存",
    "hash_cancel": "取消",
    "hash_confirm": "确认",
    "hash_delete": "删除"
  },
  "user": {
    "hash_profile": "个人资料",
    "hash_settings": "设置",
    "hash_logout": "退出登录"
  },
  "errors": {
    "hash_network": "网络连接失败",
    "hash_validation": "输入验证失败",
    "hash_permission": "权限不足"
  }
}
```

### 3. 避免键名冲突

```typescript
// ✅ 使用上下文避免冲突
// UserProfile.vue
$tsl('编辑'); // 生成 hash_UserProfile_edit

// ProductList.vue
$tsl('编辑'); // 生成 hash_ProductList_edit

// ❌ 不使用上下文可能导致冲突
// 两个组件的"编辑"可能生成相同的哈希
```

## ⚡ 性能优化

### 1. 启用缓存

```typescript
// 运行时配置
const i18n = new I18nEngine({
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 10 * 60 * 1000, // 10分钟
    storage: 'memory',
  },
});
```

### 2. 使用懒加载

```typescript
// Vite 插件配置
createI18nPlugin({
  lazyLoad: true,
  preload: ['zh-CN'], // 预加载默认语言
});

// 运行时懒加载
const loadLanguage = async (language: string) => {
  if (!i18n.isLanguageLoaded(language)) {
    await i18n.loadLanguage(language);
  }
  await i18n.changeLanguage(language);
};
```

### 3. 优化构建输出

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将语言文件分离到独立的 chunk
          'i18n-zh-CN': ['virtual:i18n-language-zh-CN'],
          'i18n-en-US': ['virtual:i18n-language-en-US'],
        },
      },
    },
  },
});
```

### 4. 移除未使用的翻译

```typescript
// i18n.config.ts
export default defineConfig({
  output: {
    removeUnusedKeys: true, // 移除未使用的键
    minify: true, // 压缩输出
  },
});
```

## 👥 团队协作

### 1. 统一配置管理

```typescript
// 使用环境变量管理不同环境的配置
export default defineConfig({
  vika: {
    apiKey: process.env.VIKA_API_KEY!,
    datasheetId: process.env.VIKA_DATASHEET_ID!,
    autoSync: process.env.NODE_ENV === 'development',
  },
});
```

### 2. 建立翻译工作流

```bash
# 1. 开发者提取新文本
npm run i18n:extract

# 2. 推送到云端供翻译者翻译
npm run i18n:push

# 3. 翻译完成后拉取最新翻译
npm run i18n:pull

# 4. 构建最终语言文件
npm run i18n:build
```

### 3. 代码审查检查点

```typescript
// .eslintrc.js - 添加 i18n 相关规则
module.exports = {
  rules: {
    // 禁止硬编码中文字符串
    'no-chinese-string': 'error',
    // 要求使用 $tsl 而不是字符串字面量
    'prefer-i18n-function': 'error',
  },
};
```

### 4. 自动化 CI/CD

```yaml
# .github/workflows/i18n.yml
name: I18n Check
on: [push, pull_request]

jobs:
  i18n-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Extract texts
        run: npm run i18n:extract

      - name: Check for missing translations
        run: npm run i18n:analyze

      - name: Build language files
        run: npm run i18n:build
```

## 🧪 测试策略

### 1. 单元测试

```typescript
// tests/i18n.test.ts
import { I18nEngine } from '@translink/i18n-runtime';

describe('I18n Engine', () => {
  let i18n: I18nEngine;

  beforeEach(() => {
    i18n = new I18nEngine({
      defaultLanguage: 'zh-CN',
      resources: {
        'zh-CN': { hash_greeting: '你好，{{name}}！' },
        'en-US': { hash_greeting: 'Hello, {{name}}!' },
      },
    });
  });

  it('should translate with parameters', () => {
    const result = i18n.t('hash_greeting', { name: 'World' });
    expect(result).toBe('你好，World！');
  });

  it('should switch language', async () => {
    await i18n.changeLanguage('en-US');
    const result = i18n.t('hash_greeting', { name: 'World' });
    expect(result).toBe('Hello, World!');
  });
});
```

### 2. 组件测试

```typescript
// tests/components/UserProfile.test.ts
import { mount } from '@vue/test-utils';
import { createI18n } from '@translink/i18n-runtime/vue';
import UserProfile from '@/components/UserProfile.vue';

describe('UserProfile', () => {
  it('should display translated content', () => {
    const i18n = createI18n({
      defaultLanguage: 'zh-CN',
      resources: {
        'zh-CN': { hash_profile: '个人资料' },
      },
    });

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.text()).toContain('个人资料');
  });
});
```

### 3. E2E 测试

```typescript
// tests/e2e/language-switching.spec.ts
import { test, expect } from '@playwright/test';

test('should switch language correctly', async ({ page }) => {
  await page.goto('/');

  // 检查默认语言
  await expect(page.locator('h1')).toHaveText('欢迎使用我们的产品');

  // 切换到英文
  await page.click('[data-testid="language-en"]');
  await expect(page.locator('h1')).toHaveText('Welcome to Our Product');

  // 切换回中文
  await page.click('[data-testid="language-zh"]');
  await expect(page.locator('h1')).toHaveText('欢迎使用我们的产品');
});
```

## 🚀 部署和维护

### 1. 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    createI18nPlugin({
      // 生产环境配置
      minify: process.env.NODE_ENV === 'production',
      removeUnusedKeys: true,
      compressTranslations: true,
    }),
  ],
});
```

### 2. CDN 部署

```typescript
// 将语言文件部署到 CDN
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

### 3. 监控和分析

```typescript
// 添加翻译使用统计
i18n.on('translationUsed', (key, language) => {
  // 发送统计数据到分析服务
  analytics.track('translation_used', {
    key,
    language,
    timestamp: Date.now(),
  });
});

// 监控翻译缺失
i18n.on('translationMissing', (key, language) => {
  // 发送错误报告
  errorReporting.captureMessage(`Missing translation: ${key} for ${language}`);
});
```

### 4. 版本管理

```json
{
  "version": "1.2.0",
  "translations": {
    "zh-CN": {
      "version": "1.2.0",
      "hash": "abc123",
      "lastUpdated": "2023-12-25T10:00:00Z"
    },
    "en-US": {
      "version": "1.1.0",
      "hash": "def456",
      "lastUpdated": "2023-12-20T15:30:00Z"
    }
  }
}
```

## 🔒 安全考虑

### 1. 输入验证

```typescript
// 验证插值参数
const sanitizeParams = (params: Record<string, any>) => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // 转义 HTML 特殊字符
      sanitized[key] = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// 使用安全的插值
const safeT = (key: string, params?: Record<string, any>) => {
  return i18n.t(key, params ? sanitizeParams(params) : undefined);
};
```

### 2. 敏感信息保护

```typescript
// 不要在翻译文件中存储敏感信息
// ❌ 错误做法
{
  "api_key": "sk-1234567890abcdef",
  "secret_token": "secret_value"
}

// ✅ 正确做法 - 使用环境变量
{
  "api_error": "API 调用失败，请稍后重试"
}
```

### 3. 内容安全策略 (CSP)

```html
<!-- 如果使用动态加载，确保 CSP 允许相关域名 -->
<meta
  http-equiv="Content-Security-Policy"
  content="script-src 'self' https://cdn.example.com;
               connect-src 'self' https://api.example.com;"
/>
```

## 📊 性能监控

### 1. 关键指标

```typescript
// 监控翻译性能
const performanceMonitor = {
  translationTime: new Map<string, number>(),
  cacheHitRate: 0,

  measureTranslation(key: string, fn: () => string) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    this.translationTime.set(key, end - start);
    return result;
  },

  getAverageTranslationTime() {
    const times = Array.from(this.translationTime.values());
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  },
};
```

### 2. 内存使用优化

```typescript
// 定期清理缓存
setInterval(
  () => {
    const stats = i18n.getCacheStats();

    // 如果缓存命中率低于 50%，清理缓存
    if (stats.hitRate < 0.5) {
      i18n.clearCache();
    }
  },
  5 * 60 * 1000
); // 每 5 分钟检查一次
```

## 🔧 调试技巧

### 1. 开发模式调试

```typescript
// 开发环境启用详细日志
if (process.env.NODE_ENV === 'development') {
  i18n.on('translationMissing', (key, language) => {
    console.warn(`🌐 Missing translation: ${key} for ${language}`);
  });

  i18n.on('languageChanged', language => {
    console.log(`🌐 Language changed to: ${language}`);
  });
}
```

### 2. 翻译覆盖率检查

```typescript
// 检查翻译覆盖率
const checkTranslationCoverage = (
  baseLanguage: string,
  targetLanguage: string
) => {
  const baseKeys = new Set(Object.keys(i18n.getResources(baseLanguage) || {}));
  const targetKeys = new Set(
    Object.keys(i18n.getResources(targetLanguage) || {})
  );

  const missingKeys = [...baseKeys].filter(key => !targetKeys.has(key));
  const extraKeys = [...targetKeys].filter(key => !baseKeys.has(key));

  console.log(`Missing in ${targetLanguage}:`, missingKeys);
  console.log(`Extra in ${targetLanguage}:`, extraKeys);

  return {
    coverage: (targetKeys.size / baseKeys.size) * 100,
    missingKeys,
    extraKeys,
  };
};
```

## 📝 总结

遵循这些最佳实践可以帮助您：

1. **提高代码质量** - 清晰的结构和规范的命名
2. **优化性能** - 合理的缓存和懒加载策略
3. **增强团队协作** - 统一的工作流和自动化工具
4. **确保安全性** - 输入验证和敏感信息保护
5. **便于维护** - 完善的测试和监控机制

记住，国际化不仅仅是翻译文本，更是为全球用户提供优质体验的重要手段。持续优化和改进您的 i18n 实现，将为您的应用带来更好的用户体验和更广阔的市场机会。
