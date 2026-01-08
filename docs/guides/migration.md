# 迁移指南

本指南帮助您从其他国际化方案迁移到 TransLink I18n，确保平滑的迁移过程。

## 📋 目录

- [从 Vue I18n 迁移](#从-vue-i18n-迁移)
- [从 React i18next 迁移](#从-react-i18next-迁移)
- [从 Nuxt I18n 迁移](#从-nuxt-i18n-迁移)
- [从自定义方案迁移](#从自定义方案迁移)
- [通用迁移步骤](#通用迁移步骤)
- [迁移工具](#迁移工具)
- [常见问题](#常见问题)

## 🔄 从 Vue I18n 迁移

### 1. 依赖替换

```bash
# 移除 Vue I18n
npm uninstall vue-i18n

# 安装 TransLink I18n
npm install @translink/i18n-runtime @translink/vite-plugin-i18n
npm install --save-dev @translink/i18n-cli
```

### 2. 配置迁移

**Vue I18n 配置 (旧)**:
```typescript
// src/i18n/index.ts
import { createI18n } from 'vue-i18n';
import zh from './locales/zh-CN.json';
import en from './locales/en-US.json';

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zh,
    'en-US': en
  }
});

export default i18n;
```

**TransLink I18n 配置 (新)**:
```typescript
// src/i18n/index.ts
import { createI18n } from '@translink/i18n-runtime/vue';

const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en-US',
  resources: {
    'zh-CN': () => import('virtual:i18n-language-zh-CN'),
    'en-US': () => import('virtual:i18n-language-en-US')
  },
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 10 * 60 * 1000
  }
});

export default i18n;
```

### 3. 组件代码迁移

**Vue I18n (旧)**:
```vue
<template>
  <div>
    <h1>{{ $t('welcome.title') }}</h1>
    <p>{{ $t('welcome.message', { name: 'Vue' }) }}</p>
    <button @click="changeLocale">{{ $t('common.switchLanguage') }}</button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const changeLocale = () => {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
};
</script>
```

**TransLink I18n (新)**:
```vue
<template>
  <div>
    <h1>{{ $tsl('欢迎使用') }}</h1>
    <p>{{ $tsl('欢迎 {{name}} 使用我们的产品', { name: 'Vue' }) }}</p>
    <button @click="changeLocale">{{ $tsl('切换语言') }}</button>
  </div>
</template>

<script setup>
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale, setLocale } = useI18n();

const changeLocale = async () => {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
  await setLocale(newLocale);
};
</script>
```

### 4. 翻译文件迁移

**Vue I18n 格式 (旧)**:
```json
{
  "welcome": {
    "title": "欢迎使用",
    "message": "欢迎 {name} 使用我们的产品"
  },
  "common": {
    "switchLanguage": "切换语言"
  }
}
```

**迁移步骤**:
1. 运行文本提取：`npx translink-i18n extract`
2. 手动映射旧的翻译到新的哈希键
3. 构建新的语言文件：`npx translink-i18n build`

### 5. 迁移脚本

```typescript
// scripts/migrate-from-vue-i18n.ts
import fs from 'fs/promises';
import path from 'path';

interface VueI18nMessages {
  [key: string]: any;
}

interface TransLinkTranslations {
  [hash: string]: string;
}

async function migrateVueI18nToTransLink() {
  // 读取旧的翻译文件
  const oldZhCN = JSON.parse(
    await fs.readFile('src/i18n/locales/zh-CN.json', 'utf-8')
  ) as VueI18nMessages;
  
  // 读取提取的文本
  const extractedTexts = JSON.parse(
    await fs.readFile('src/locales/extracted-texts.json', 'utf-8')
  );
  
  // 创建映射
  const newTranslations: TransLinkTranslations = {};
  
  // 扁平化旧的翻译结构
  const flattenMessages = (obj: any, prefix = ''): Record<string, string> => {
    const result: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        result[newKey] = value;
      } else if (typeof value === 'object') {
        Object.assign(result, flattenMessages(value, newKey));
      }
    }
    
    return result;
  };
  
  const flatMessages = flattenMessages(oldZhCN);
  
  // 映射到新的哈希键
  for (const extracted of extractedTexts) {
    // 尝试找到匹配的翻译
    const matchingTranslation = Object.entries(flatMessages).find(
      ([_, value]) => value === extracted.text
    );
    
    if (matchingTranslation) {
      newTranslations[extracted.key] = matchingTranslation[1];
    } else {
      // 如果找不到匹配，使用原文
      newTranslations[extracted.key] = extracted.text;
    }
  }
  
  // 写入新的翻译文件
  await fs.writeFile(
    'src/locales/zh-CN.json',
    JSON.stringify(newTranslations, null, 2)
  );
  
  console.log('Migration completed!');
}

migrateVueI18nToTransLink().catch(console.error);
```

## ⚛️ 从 React i18next 迁移

### 1. 依赖替换

```bash
# 移除 i18next
npm uninstall react-i18next i18next

# 安装 TransLink I18n
npm install @translink/i18n-runtime @translink/vite-plugin-i18n
npm install --save-dev @translink/i18n-cli
```

### 2. 配置迁移

**React i18next (旧)**:
```typescript
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS }
    },
    lng: 'zh-CN',
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

**TransLink I18n (新)**:
```typescript
// src/i18n.ts
import { I18nEngine } from '@translink/i18n-runtime';

export const i18n = new I18nEngine({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'en-US',
  loader: {
    loadFunction: async (language) => {
      const module = await import(`virtual:i18n-language-${language}`);
      return module.default;
    }
  },
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 10 * 60 * 1000
  }
});
```

### 3. 组件代码迁移

**React i18next (旧)**:
```tsx
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.message', { name: 'React' })}</p>
      <Trans i18nKey="welcome.description">
        Welcome to <strong>our app</strong>!
      </Trans>
      <button onClick={() => changeLanguage('en-US')}>
        {t('common.switchLanguage')}
      </button>
    </div>
  );
}
```

**TransLink I18n (新)**:
```tsx
import React from 'react';
import { useTranslation, Trans } from '@translink/i18n-runtime/react';

function MyComponent() {
  const { t, changeLanguage } = useTranslation();

  return (
    <div>
      <h1>{$tsl('欢迎使用')}</h1>
      <p>{$tsl('欢迎 {{name}} 使用我们的产品', { name: 'React' })}</p>
      <Trans
        i18nKey="hash_welcome_desc"
        values={{ appName: 'our app' }}
        components={{ strong: <strong /> }}
      >
        欢迎使用 <strong>{{appName}}</strong>！
      </Trans>
      <button onClick={() => changeLanguage('en-US')}>
        {$tsl('切换语言')}
      </button>
    </div>
  );
}
```

### 4. Provider 迁移

**React i18next (旧)**:
```tsx
// src/App.tsx
import React, { Suspense } from 'react';
import './i18n';

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyComponent />
    </Suspense>
  );
}
```

**TransLink I18n (新)**:
```tsx
// src/App.tsx
import React from 'react';
import { I18nProvider } from '@translink/i18n-runtime/react';
import { i18n } from './i18n';

function App() {
  return (
    <I18nProvider engine={i18n}>
      <MyComponent />
    </I18nProvider>
  );
}
```

## 🚀 从 Nuxt I18n 迁移

### 1. 配置迁移

**Nuxt I18n (旧)**:
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'zh-CN', file: 'zh-CN.json' },
      { code: 'en-US', file: 'en-US.json' }
    ],
    defaultLocale: 'zh-CN',
    langDir: 'locales/'
  }
});
```

**TransLink I18n + Nuxt (新)**:
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@translink/nuxt-i18n'], // 假设有 Nuxt 模块
  translink: {
    defaultLanguage: 'zh-CN',
    supportedLanguages: ['zh-CN', 'en-US'],
    localesDir: 'locales'
  }
});
```

### 2. 页面组件迁移

**Nuxt I18n (旧)**:
```vue
<template>
  <div>
    <h1>{{ $t('pages.home.title') }}</h1>
    <NuxtLink :to="localePath('/about')">
      {{ $t('navigation.about') }}
    </NuxtLink>
  </div>
</template>

<script setup>
const { locale, setLocale } = useI18n();
</script>
```

**TransLink I18n (新)**:
```vue
<template>
  <div>
    <h1>{{ $tsl('首页标题') }}</h1>
    <NuxtLink to="/about">
      {{ $tsl('关于我们') }}
    </NuxtLink>
  </div>
</template>

<script setup>
import { useI18n } from '@translink/i18n-runtime/vue';

const { locale, setLocale } = useI18n();
</script>
```

## 🔧 从自定义方案迁移

### 1. 分析现有方案

```typescript
// 分析脚本：analyze-current-i18n.ts
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface AnalysisResult {
  translationFiles: string[];
  translationKeys: Set<string>;
  usagePatterns: Array<{
    file: string;
    pattern: string;
    count: number;
  }>;
}

async function analyzeCurrentI18n(): Promise<AnalysisResult> {
  const result: AnalysisResult = {
    translationFiles: [],
    translationKeys: new Set(),
    usagePatterns: []
  };

  // 查找翻译文件
  const translationFiles = await glob('**/*.{json,js,ts}', {
    ignore: ['node_modules/**', 'dist/**']
  });

  for (const file of translationFiles) {
    const content = await fs.readFile(file, 'utf-8');
    
    // 检查是否包含翻译内容
    if (isTranslationFile(content)) {
      result.translationFiles.push(file);
      
      // 提取翻译键
      const keys = extractTranslationKeys(content);
      keys.forEach(key => result.translationKeys.add(key));
    }
  }

  // 分析使用模式
  const sourceFiles = await glob('src/**/*.{vue,tsx,jsx,ts,js}');
  
  for (const file of sourceFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const patterns = findTranslationUsage(content);
    
    result.usagePatterns.push(...patterns.map(pattern => ({
      file,
      pattern: pattern.pattern,
      count: pattern.count
    })));
  }

  return result;
}

function isTranslationFile(content: string): boolean {
  // 检查文件是否包含翻译内容的逻辑
  return /["'][\u4e00-\u9fa5]+["']\s*:/.test(content);
}

function extractTranslationKeys(content: string): string[] {
  // 提取翻译键的逻辑
  const matches = content.match(/["']([^"']+)["']\s*:/g);
  return matches ? matches.map(m => m.replace(/["':\s]/g, '')) : [];
}

function findTranslationUsage(content: string): Array<{ pattern: string; count: number }> {
  // 查找翻译使用模式的逻辑
  const patterns = [
    { regex: /\$t\(['"`]([^'"`]+)['"`]\)/g, name: '$t()' },
    { regex: /t\(['"`]([^'"`]+)['"`]\)/g, name: 't()' },
    { regex: /i18n\.t\(['"`]([^'"`]+)['"`]\)/g, name: 'i18n.t()' }
  ];

  return patterns.map(({ regex, name }) => ({
    pattern: name,
    count: (content.match(regex) || []).length
  })).filter(p => p.count > 0);
}
```

### 2. 创建迁移计划

```typescript
// migration-plan.ts
interface MigrationPlan {
  phase1: {
    description: '安装和基础配置';
    tasks: string[];
    estimatedTime: string;
  };
  phase2: {
    description: '翻译文件迁移';
    tasks: string[];
    estimatedTime: string;
  };
  phase3: {
    description: '代码迁移';
    tasks: string[];
    estimatedTime: string;
  };
  phase4: {
    description: '测试和优化';
    tasks: string[];
    estimatedTime: string;
  };
}

const migrationPlan: MigrationPlan = {
  phase1: {
    description: '安装和基础配置',
    tasks: [
      '安装 TransLink I18n 依赖',
      '创建 i18n.config.ts 配置文件',
      '配置 Vite 插件',
      '设置基础目录结构'
    ],
    estimatedTime: '2-4 小时'
  },
  phase2: {
    description: '翻译文件迁移',
    tasks: [
      '分析现有翻译文件结构',
      '运行文本提取工具',
      '映射旧翻译到新哈希键',
      '验证翻译完整性'
    ],
    estimatedTime: '4-8 小时'
  },
  phase3: {
    description: '代码迁移',
    tasks: [
      '替换翻译函数调用',
      '更新组件导入',
      '修改语言切换逻辑',
      '处理复杂的翻译场景'
    ],
    estimatedTime: '8-16 小时'
  },
  phase4: {
    description: '测试和优化',
    tasks: [
      '运行单元测试',
      '执行 E2E 测试',
      '性能优化',
      '文档更新'
    ],
    estimatedTime: '4-8 小时'
  }
};
```

## 🛠️ 通用迁移步骤

### 1. 准备阶段

```bash
# 1. 备份现有项目
git checkout -b migration-to-translink-i18n
git add .
git commit -m "Backup before TransLink I18n migration"

# 2. 分析现有 i18n 使用情况
npm run analyze-i18n  # 使用上面的分析脚本

# 3. 安装 TransLink I18n
npm install @translink/i18n-runtime @translink/vite-plugin-i18n
npm install --save-dev @translink/i18n-cli
```

### 2. 配置阶段

```typescript
// 1. 创建配置文件
// i18n.config.ts
export default defineConfig({
  extract: {
    patterns: ['src/**/*.{vue,ts,js,tsx,jsx}'],
    exclude: ['node_modules', 'dist', 'legacy-i18n/**'],
    functions: ['t', '$tsl', '$t'], // 包含旧的函数名以便迁移
    extensions: ['.vue', '.ts', '.js', '.tsx', '.jsx']
  },
  // ... 其他配置
});

// 2. 配置 Vite 插件
// vite.config.ts
export default defineConfig({
  plugins: [
    // ... 其他插件
    createI18nPlugin({
      localesDir: 'src/locales',
      defaultLanguage: 'zh-CN',
      // 迁移期间的特殊配置
      migration: {
        enabled: true,
        legacyFunctions: ['$t', 'i18n.t'] // 支持旧的函数名
      }
    })
  ]
});
```

### 3. 迁移阶段

```bash
# 1. 提取现有文本
npx translink-i18n extract

# 2. 运行迁移脚本
npm run migrate-translations

# 3. 构建新的语言文件
npx translink-i18n build

# 4. 验证迁移结果
npm run test:i18n
```

### 4. 验证阶段

```typescript
// tests/migration.test.ts
import { describe, it, expect } from 'vitest';
import { I18nEngine } from '@translink/i18n-runtime';

describe('Migration Validation', () => {
  it('should have all required translations', async () => {
    const i18n = new I18nEngine({
      defaultLanguage: 'zh-CN',
      resources: {
        'zh-CN': await import('../src/locales/zh-CN.json')
      }
    });

    // 验证关键翻译是否存在
    const criticalKeys = [
      'hash_welcome',
      'hash_login',
      'hash_logout',
      // ... 其他关键键
    ];

    for (const key of criticalKeys) {
      expect(i18n.t(key)).not.toBe(key); // 确保有翻译
    }
  });

  it('should maintain translation consistency', () => {
    // 验证翻译一致性的测试
  });
});
```

## 🔧 迁移工具

### 1. 自动化迁移脚本

```typescript
// scripts/auto-migrate.ts
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

class AutoMigrator {
  private readonly sourcePatterns = [
    'src/**/*.{vue,tsx,jsx,ts,js}'
  ];

  private readonly replacements = [
    // Vue I18n 迁移
    {
      from: /\$t\(['"`]([^'"`]+)['"`](?:,\s*([^)]+))?\)/g,
      to: (match: string, key: string, params?: string) => {
        return `$tsl('${this.keyToText(key)}'${params ? `, ${params}` : ''})`;
      }
    },
    // React i18next 迁移
    {
      from: /t\(['"`]([^'"`]+)['"`](?:,\s*([^)]+))?\)/g,
      to: (match: string, key: string, params?: string) => {
        return `$tsl('${this.keyToText(key)}'${params ? `, ${params}` : ''})`;
      }
    }
  ];

  async migrate() {
    const files = await glob(this.sourcePatterns);
    
    for (const file of files) {
      await this.migrateFile(file);
    }
  }

  private async migrateFile(filePath: string) {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;

    for (const replacement of this.replacements) {
      const newContent = content.replace(replacement.from, replacement.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }

    if (modified) {
      await fs.writeFile(filePath, content);
      console.log(`Migrated: ${filePath}`);
    }
  }

  private keyToText(key: string): string {
    // 将键名转换为实际文本的逻辑
    // 这需要根据您的具体情况实现
    return key.replace(/\./g, ' ').replace(/([A-Z])/g, ' $1').trim();
  }
}

// 运行迁移
const migrator = new AutoMigrator();
migrator.migrate().catch(console.error);
```

### 2. 翻译映射工具

```typescript
// scripts/translation-mapper.ts
interface TranslationMapping {
  oldKey: string;
  newHash: string;
  text: string;
  confidence: number;
}

class TranslationMapper {
  async createMapping(
    oldTranslations: Record<string, any>,
    extractedTexts: Array<{ text: string; key: string }>
  ): Promise<TranslationMapping[]> {
    const mappings: TranslationMapping[] = [];
    const flatOldTranslations = this.flattenTranslations(oldTranslations);

    for (const extracted of extractedTexts) {
      const bestMatch = this.findBestMatch(extracted.text, flatOldTranslations);
      
      if (bestMatch) {
        mappings.push({
          oldKey: bestMatch.key,
          newHash: extracted.key,
          text: extracted.text,
          confidence: bestMatch.confidence
        });
      }
    }

    return mappings.sort((a, b) => b.confidence - a.confidence);
  }

  private flattenTranslations(
    obj: Record<string, any>,
    prefix = ''
  ): Array<{ key: string; value: string }> {
    const result: Array<{ key: string; value: string }> = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        result.push({ key: fullKey, value });
      } else if (typeof value === 'object') {
        result.push(...this.flattenTranslations(value, fullKey));
      }
    }

    return result;
  }

  private findBestMatch(
    text: string,
    translations: Array<{ key: string; value: string }>
  ): { key: string; confidence: number } | null {
    let bestMatch: { key: string; confidence: number } | null = null;

    for (const translation of translations) {
      const confidence = this.calculateSimilarity(text, translation.value);
      
      if (confidence > 0.8 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { key: translation.key, confidence };
      }
    }

    return bestMatch;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // 简单的相似度计算，可以使用更复杂的算法
    if (str1 === str2) return 1;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}
```

## ❓ 常见问题

### Q1: 迁移过程中如何保持应用正常运行？

**A**: 建议采用渐进式迁移策略：

1. **并行运行**: 在迁移期间同时支持新旧两套 i18n 系统
2. **功能开关**: 使用功能开关控制使用哪套系统
3. **分模块迁移**: 按模块或页面逐步迁移，而不是一次性全部迁移

```typescript
// 渐进式迁移示例
const useNewI18n = process.env.ENABLE_NEW_I18N === 'true';

const t = useNewI18n 
  ? useTransLinkI18n().t 
  : useVueI18n().t;
```

### Q2: 如何处理复杂的翻译逻辑？

**A**: 对于复杂的翻译场景：

1. **复数形式**: 使用 TransLink I18n 的复数支持
2. **上下文翻译**: 利用哈希生成的上下文功能
3. **动态翻译**: 使用插值和格式化器

```typescript
// 复杂翻译示例
// 旧方式
$t('items', { count }, { plural: count })

// 新方式
$tsl('{{count}} 个项目', { count }, { count })
```

### Q3: 迁移后性能如何？

**A**: TransLink I18n 通常会带来性能提升：

1. **更好的缓存**: 多级缓存机制
2. **懒加载**: 按需加载语言资源
3. **构建优化**: 更好的 Tree Shaking 和代码分割

### Q4: 如何验证迁移的正确性？

**A**: 建议的验证策略：

1. **自动化测试**: 编写测试验证翻译功能
2. **视觉回归测试**: 使用截图对比工具
3. **手动测试**: 逐一验证关键功能
4. **A/B 测试**: 在生产环境中对比新旧系统

```typescript
// 迁移验证测试
describe('Migration Validation', () => {
  it('should render same content as before', () => {
    const oldComponent = renderWithOldI18n(<MyComponent />);
    const newComponent = renderWithNewI18n(<MyComponent />);
    
    expect(oldComponent.text()).toBe(newComponent.text());
  });
});
```

## 📝 迁移检查清单

### 迁移前准备
- [ ] 备份现有代码
- [ ] 分析现有 i18n 使用情况
- [ ] 制定迁移计划和时间表
- [ ] 准备测试环境

### 安装和配置
- [ ] 安装 TransLink I18n 依赖
- [ ] 创建配置文件
- [ ] 配置构建工具
- [ ] 设置开发环境

### 翻译迁移
- [ ] 提取现有翻译
- [ ] 运行文本提取工具
- [ ] 创建翻译映射
- [ ] 验证翻译完整性

### 代码迁移
- [ ] 更新导入语句
- [ ] 替换翻译函数调用
- [ ] 修改语言切换逻辑
- [ ] 处理特殊场景

### 测试验证
- [ ] 运行单元测试
- [ ] 执行集成测试
- [ ] 进行 E2E 测试
- [ ] 性能测试

### 部署上线
- [ ] 构建生产版本
- [ ] 部署到测试环境
- [ ] 用户验收测试
- [ ] 生产环境部署

### 后续优化
- [ ] 性能监控
- [ ] 用户反馈收集
- [ ] 持续优化
- [ ] 文档更新

## 🔗 相关资源

- [快速入门指南](./guides/quick-start.md)
- [API 文档](./api/README.md)
- [最佳实践](./best-practices.md)
- [示例项目](../examples/README.md)
- [GitHub Issues](https://github.com/lynncen/translink-i18n/issues) - 获取迁移帮助

---

迁移到 TransLink I18n 是一个值得的投资，它将为您的项目带来更好的开发体验、更高的性能和更强的可维护性。如果在迁移过程中遇到问题，请随时寻求帮助！
