# 快速入门

欢迎使用 TransLink I18n！本指南将在 5 分钟内帮您快速体验 TransLink I18n 的核心功能。

## 🎯 学习目标

通过本指南，您将学会：

- 安装和配置 TransLink I18n
- 创建第一个多语言应用
- 使用自动文本提取功能
- 实现语言切换

## 📋 前置条件

- Node.js 16.0.0 或更高版本
- 基本的 JavaScript/TypeScript 知识
- 了解 Vue 3 或 React（可选）

## 🚀 第一步：安装

### 创建新项目

```bash
# 创建 Vue 项目
npm create vue@latest my-i18n-app
cd my-i18n-app
npm install

# 或创建 React 项目
npx create-react-app my-i18n-app --template typescript
cd my-i18n-app
```

### 安装 TransLink I18n

```bash
# 安装核心包
npm install @translink/i18n-runtime

# 安装开发工具
npm install --save-dev @translink/i18n-cli @translink/vite-plugin-i18n
```

## ⚙️ 第二步：配置

### 1. 创建配置文件

在项目根目录创建 `i18n.config.ts`：

```typescript
import { defineConfig } from '@translink/i18n-cli';

export default defineConfig({
  extract: {
    patterns: ['src/**/*.{vue,ts,js,tsx,jsx}'],
    exclude: ['node_modules', 'dist'],
    functions: ['t', '$tsl'],
    extensions: ['.vue', '.ts', '.js', '.tsx', '.jsx'],
  },
  hash: {
    algorithm: 'md5',
    length: 8,
    includeContext: false,
    contextFields: [],
  },
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
    fallback: 'en-US',
  },
  output: {
    directory: 'src/locales',
    format: 'json',
    splitByNamespace: false,
    flattenKeys: false,
  },
});
```

### 2. 配置 Vite 插件

修改 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'; // Vue 项目
// import react from '@vitejs/plugin-react'; // React 项目
import createI18nPlugin from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    vue(), // 或 react()
    createI18nPlugin({
      localesDir: 'src/locales',
      defaultLanguage: 'zh-CN',
      hotReload: true,
      lazyLoad: true,
    }),
  ],
});
```

## 📝 第三步：编写代码

### Vue 3 示例

创建 `src/App.vue`：

```vue
<template>
  <div class="app">
    <header>
      <h1>{{ $tsl('欢迎使用 TransLink I18n') }}</h1>
      <div class="language-switcher">
        <button
          v-for="lang in availableLocales"
          :key="lang"
          @click="setLocale(lang)"
          :class="{ active: locale === lang }"
        >
          {{ getLanguageName(lang) }}
        </button>
      </div>
    </header>

    <main>
      <section class="greeting">
        <h2>{{ $tsl('个人信息') }}</h2>
        <p>{{ $tsl('姓名：{{name}}', { name: '张三' }) }}</p>
        <p>{{ $tsl('邮箱：{{email}}', { email: 'zhangsan@example.com' }) }}</p>
      </section>

      <section class="features">
        <h2>{{ $tsl('主要功能') }}</h2>
        <ul>
          <li>{{ $tsl('自动文本提取') }}</li>
          <li>{{ $tsl('实时热更新') }}</li>
          <li>{{ $tsl('智能哈希生成') }}</li>
          <li>{{ $tsl('多框架支持') }}</li>
        </ul>
      </section>

      <section class="demo">
        <h2>{{ $tsl('交互演示') }}</h2>
        <button @click="showMessage">
          {{ $tsl('点击显示消息') }}
        </button>
        <p v-if="message" class="message">
          {{ message }}
        </p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale, setLocale, availableLocales } = useI18n();
const message = ref('');

const getLanguageName = (lang: string) => {
  const names: Record<string, string> = {
    'zh-CN': '中文',
    'en-US': 'English',
  };
  return names[lang] || lang;
};

const showMessage = () => {
  const messages = [
    $tsl('这是一条测试消息！'),
    $tsl('TransLink I18n 工作正常！'),
    $tsl('恭喜您成功配置了国际化！'),
  ];
  message.value = messages[Math.floor(Math.random() * messages.length)];
};
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 40px;
}

.language-switcher {
  margin-top: 20px;
}

.language-switcher button {
  margin: 0 10px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.language-switcher button.active {
  background: #007bff;
  color: white;
}

section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.message {
  margin-top: 10px;
  padding: 10px;
  background: #f0f8ff;
  border-left: 4px solid #007bff;
}
</style>
```

### React 示例

创建 `src/App.tsx`：

```tsx
import React, { useState } from 'react';
import { useTranslation } from '@translink/i18n-runtime/react';
import './App.css';

function App() {
  const { t, language, changeLanguage } = useTranslation();
  const [message, setMessage] = useState('');

  const availableLanguages = ['zh-CN', 'en-US'];

  const getLanguageName = (lang: string) => {
    const names: Record<string, string> = {
      'zh-CN': '中文',
      'en-US': 'English',
    };
    return names[lang] || lang;
  };

  const showMessage = () => {
    const messages = [
      $tsl('这是一条测试消息！'),
      $tsl('TransLink I18n 工作正常！'),
      $tsl('恭喜您成功配置了国际化！'),
    ];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
  };

  return (
    <div className="app">
      <header>
        <h1>{$tsl('欢迎使用 TransLink I18n')}</h1>
        <div className="language-switcher">
          {availableLanguages.map(lang => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={language === lang ? 'active' : ''}
            >
              {getLanguageName(lang)}
            </button>
          ))}
        </div>
      </header>

      <main>
        <section className="greeting">
          <h2>{$tsl('个人信息')}</h2>
          <p>{$tsl('姓名：{{name}}', { name: '张三' })}</p>
          <p>{$tsl('邮箱：{{email}}', { email: 'zhangsan@example.com' })}</p>
        </section>

        <section className="features">
          <h2>{$tsl('主要功能')}</h2>
          <ul>
            <li>{$tsl('自动文本提取')}</li>
            <li>{$tsl('实时热更新')}</li>
            <li>{$tsl('智能哈希生成')}</li>
            <li>{$tsl('多框架支持')}</li>
          </ul>
        </section>

        <section className="demo">
          <h2>{$tsl('交互演示')}</h2>
          <button onClick={showMessage}>{$tsl('点击显示消息')}</button>
          {message && <p className="message">{message}</p>}
        </section>
      </main>
    </div>
  );
}

export default App;
```

## 🔨 第四步：初始化和提取

### 1. 初始化项目

```bash
# 初始化 i18n 配置
npx translink-i18n init
```

### 2. 提取文本

```bash
# 从代码中提取需要翻译的文本
npx translink-i18n extract

# 查看提取结果
ls src/locales/
# 应该看到 extracted-texts.json
```

### 3. 构建语言文件

```bash
# 构建最终的语言文件
npx translink-i18n build

# 查看生成的语言文件
ls src/locales/
# 应该看到 zh-CN.json 和 en-US.json
```

## 🌐 第五步：添加翻译

### 1. 查看生成的语言文件

`src/locales/zh-CN.json`：

```json
{
  "hash_12345678": "欢迎使用 TransLink I18n",
  "hash_87654321": "个人信息",
  "hash_abcdefgh": "姓名：{{name}}",
  "hash_ijklmnop": "邮箱：{{email}}",
  "hash_qrstuvwx": "主要功能"
}
```

### 2. 添加英文翻译

编辑 `src/locales/en-US.json`：

```json
{
  "hash_12345678": "Welcome to TransLink I18n",
  "hash_87654321": "Personal Information",
  "hash_abcdefgh": "Name: {{name}}",
  "hash_ijklmnop": "Email: {{email}}",
  "hash_qrstuvwx": "Main Features",
  "hash_yzabcdef": "Automatic Text Extraction",
  "hash_ghijklmn": "Real-time Hot Reload",
  "hash_opqrstuv": "Smart Hash Generation",
  "hash_wxyzabcd": "Multi-framework Support",
  "hash_efghijkl": "Interactive Demo",
  "hash_mnopqrst": "Click to Show Message",
  "hash_uvwxyzab": "This is a test message!",
  "hash_cdefghij": "TransLink I18n is working properly!",
  "hash_klmnopqr": "Congratulations on successfully configuring i18n!"
}
```

## 🎉 第六步：运行和测试

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 测试功能

打开浏览器访问 `http://localhost:5173`（或显示的端口），您应该看到：

1. **页面显示中文内容**（默认语言）
2. **点击 "English" 按钮**，页面内容切换为英文
3. **点击 "中文" 按钮**，页面内容切换回中文
4. **点击 "点击显示消息" 按钮**，显示随机消息

### 3. 测试热更新

1. 保持开发服务器运行
2. 修改 `src/locales/zh-CN.json` 中的任意翻译
3. 保存文件
4. 观察浏览器页面自动更新，无需刷新

## 🎯 恭喜！

您已经成功创建了第一个 TransLink I18n 应用！现在您可以：

- ✅ 使用 `$tsl()` 函数标记需要翻译的文本
- ✅ 自动提取和生成哈希键
- ✅ 实现多语言切换
- ✅ 享受热更新带来的开发效率提升

## 🚀 下一步

现在您已经掌握了基础用法，可以继续学习：

1. [**文本提取**](./text-extraction.md) - 了解更多提取选项和配置
2. [**CLI 工具**](./cli-usage.md) - 掌握命令行工具的完整功能
3. [**配置文件**](./configuration.md) - 深入了解配置选项
4. [**热更新**](./hot-reload.md) - 优化开发体验
5. [**云端同步**](./cloud-sync.md) - 团队协作翻译管理

## 💡 小贴士

### 开发技巧

1. **使用 `$tsl()` 而不是 `t()`**：

   ```typescript
   // ✅ 推荐：直接写中文，自动提取
   $tsl('欢迎使用我们的产品');

   // ❌ 不推荐：需要手动管理键名
   t('welcome.message');
   ```

2. **合理使用插值**：

   ```typescript
   // ✅ 正确的插值使用
   $tsl('用户 {{name}} 有 {{count}} 条消息', { name: 'Alice', count: 5 });

   // ❌ 避免复杂的字符串拼接
   $tsl('用户 ' + name + ' 有 ' + count + ' 条消息');
   ```

3. **保持翻译文本的简洁**：

   ```typescript
   // ✅ 简洁明了
   $tsl('保存成功');

   // ❌ 过于冗长
   $tsl('您的数据已经成功保存到服务器，请继续您的操作');
   ```

### 常见问题

**Q: 为什么我的翻译没有生效？**
A: 确保运行了 `npx translink-i18n extract` 和 `npx translink-i18n build` 命令。

**Q: 如何添加新语言？**
A: 在 `i18n.config.ts` 的 `languages.supported` 中添加新语言代码，然后运行构建命令。

**Q: 热更新不工作怎么办？**
A: 检查 Vite 配置中是否正确配置了 `createI18nPlugin`，并确保 `hotReload: true`。

## 🤖 AI 自动翻译（可选）

TransLink 支持使用 AI 自动翻译文本，大幅提升翻译效率。

### 1. 配置 AI 翻译

在 `translink.config.ts` 中添加：

```typescript
export default defineConfig({
  // ... 其他配置 ...

  aiTranslation: {
    defaultProvider: 'deepseek',
    providers: {
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseURL: 'https://api.deepseek.com',
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
});
```

### 2. 设置 API Key

```bash
# .env
DEEPSEEK_API_KEY=your_api_key_here
```

### 3. 运行 AI 翻译

```bash
# 估算成本
npx translink translate --estimate-cost

# 预览翻译
npx translink translate --dry-run

# 正式翻译
npx translink translate
```

### 翻译结果

```
AI 自动翻译
─────────────────────────────
源语言: zh-CN
目标语言: en-US, ja-JP

正在翻译: zh-CN → en-US
─────────────────────────────
需要翻译 50 个项目
正在翻译批次 1/3 (20 项)...
正在翻译批次 2/3 (20 项)...
正在翻译批次 3/3 (10 项)...

┌──────────┬───────┐
│ 总计     │ 100   │
│ 已翻译   │ 50    │
│ 已跳过   │ 50    │
│ 失败     │ 0     │
│ 耗时     │ 3.2s  │
│ Tokens   │ 1,250 │
│ 成本     │ $0.00 │
└──────────┴───────┘

✓ en-US 翻译完成
```

### AI 提供商对比

| 提供商   | 成本       | 质量       | 速度       | 适用场景         |
| -------- | ---------- | ---------- | ---------- | ---------------- |
| DeepSeek | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | 日常大批量翻译   |
| Gemini   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | 测试、小规模项目 |
| OpenAI   | ⭐⭐       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | 高质量要求       |

> 💡 **提示**: 详细的 AI 翻译功能请参考 [AI Translation Guide](./ai-translation.md)

## 🔗 相关资源

- [AI 翻译指南](./ai-translation.md) - 详细的 AI 翻译功能说明
- [完整示例项目](../../examples/) - 查看完整的示例代码
- [API 文档](../api/README.md) - 详细的 API 参考
- [配置指南](./configuration.md) - 完整的配置选项
- [最佳实践](../best-practices.md) - 推荐的开发模式
