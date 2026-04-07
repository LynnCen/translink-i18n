# 配置文件详解

> **TransLink 使用 `translink.config.ts` 作为配置文件，支持完整的 TypeScript 类型提示。**

---

## 📁 配置文件位置

配置文件应放在项目根目录：

```
my-project/
├── src/
├── translink.config.ts  ← 这里
├── package.json
└── vite.config.ts
```

支持的文件名：
- `translink.config.ts`（推荐）
- `translink.config.js`
- `i18n.config.ts`
- `i18n.config.js`

---

## 📋 完整配置示例

```typescript
import { defineConfig } from '@translink/i18n-cli';

export default defineConfig({
  // 提取配置
  extract: {
    patterns: ['src/**/*.{vue,ts,tsx,js,jsx}'],
    exclude: ['node_modules', 'dist', '**/*.test.*'],
    functions: ['$tsl', 't'],
    extensions: ['.vue', '.ts', '.tsx', '.js', '.jsx'],
  },

  // 哈希配置
  hash: {
    algorithm: 'md5',
    length: 8,
    includeContext: false,
    contextFields: ['componentName', 'functionName'],
  },

  // 语言配置
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP'],
    fallback: 'zh-CN',
  },

  // 输出配置
  output: {
    directory: 'src/locales',
    format: 'json',
    indent: 2,
    splitByNamespace: false,
  },

  // AI 翻译配置
  aiTranslation: {
    defaultProvider: 'deepseek',
    providers: {
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        model: 'deepseek-chat',
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4-turbo-preview',
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: 'gemini-pro',
      },
    },
    options: {
      cache: true,
      batchSize: 20,
      concurrency: 3,
      glossary: {
        '应用': 'Application',
        '用户': 'User',
      },
    },
  },

  // 插件配置
  plugins: [
    ['@translink/plugin-vika', {
      apiKey: process.env.VIKA_API_KEY,
      datasheetId: process.env.VIKA_DATASHEET_ID,
    }],
  ],
});
```

---

## 🔧 配置项详解

### extract - 提取配置

| 字段 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `patterns` | `string[]` | `['src/**/*']` | 文件匹配模式（glob） |
| `exclude` | `string[]` | `['node_modules']` | 排除的路径 |
| `functions` | `string[]` | `['$tsl', 't']` | 翻译函数名 |
| `extensions` | `string[]` | `['.vue', '.ts', ...]` | 文件扩展名 |

**示例：**

```typescript
extract: {
  // 只扫描 src 目录
  patterns: ['src/**/*.{vue,ts,tsx}'],

  // 排除测试文件
  exclude: ['**/*.test.*', '**/*.spec.*'],

  // 自定义翻译函数名
  functions: ['$tsl', 't', '$t', 'i18n'],
}
```

### hash - 哈希配置

| 字段 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `algorithm` | `'md5' \| 'sha256'` | `'md5'` | 哈希算法 |
| `length` | `number` | `8` | 哈希长度 |
| `includeContext` | `boolean` | `false` | 是否包含上下文 |
| `contextFields` | `string[]` | `[]` | 上下文字段 |

**示例：**

```typescript
hash: {
  // 使用 SHA256（更安全）
  algorithm: 'sha256',

  // 更长的哈希（减少冲突）
  length: 12,

  // 包含文件名上下文（相同文本不同组件生成不同 Key）
  includeContext: true,
  contextFields: ['componentName'],
}
```

### languages - 语言配置

| 字段 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `default` | `string` | `'zh-CN'` | 默认语言 |
| `supported` | `string[]` | `['zh-CN', 'en-US']` | 支持的语言 |
| `fallback` | `string` | 同 `default` | 回退语言 |

**常用语言代码：**

| 代码 | 语言 |
|-----|------|
| `zh-CN` | 简体中文 |
| `zh-TW` | 繁体中文 |
| `en-US` | 英语（美国） |
| `ja-JP` | 日语 |
| `ko-KR` | 韩语 |
| `de-DE` | 德语 |
| `fr-FR` | 法语 |

### output - 输出配置

| 字段 | 类型 | 默认值 | 说明 |
|-----|------|-------|------|
| `directory` | `string` | `'locales'` | 输出目录 |
| `format` | `'json' \| 'yaml'` | `'json'` | 文件格式 |
| `indent` | `number` | `2` | 缩进空格数 |
| `splitByNamespace` | `boolean` | `false` | 按命名空间分割 |

### aiTranslation - AI 翻译配置

```typescript
aiTranslation: {
  // 默认使用的提供商
  defaultProvider: 'deepseek',

  // 各提供商配置
  providers: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      model: 'deepseek-chat',
      baseURL: 'https://api.deepseek.com',  // 可选
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4-turbo-preview',
    },
  },

  // 翻译选项
  options: {
    cache: true,           // 启用缓存
    batchSize: 20,         // 批量大小
    concurrency: 3,        // 并发数
    retryAttempts: 3,      // 重试次数
    timeout: 30000,        // 超时时间（ms）

    // 术语表（保持翻译一致性）
    glossary: {
      '应用': 'Application',
      '用户': 'User',
      '设置': 'Settings',
    },
  },
}
```

---

## 🔐 环境变量

敏感信息应使用环境变量：

```bash
# .env
DEEPSEEK_API_KEY=sk-xxx
OPENAI_API_KEY=sk-xxx
VIKA_API_KEY=xxx
VIKA_DATASHEET_ID=xxx
```

在配置中引用：

```typescript
aiTranslation: {
  providers: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
    },
  },
}
```

---

## 📚 相关文档

- [CLI 命令详解](./commands.md)
- [AI 翻译指南](../03-workflows/ai-translation.md)
- [插件开发](../../3-tutorials/06-plugin-system.md)
