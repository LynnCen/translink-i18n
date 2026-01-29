# 安装与配置

> **3 分钟完成安装，开始你的国际化之旅**

---

## 📋 环境要求

| 依赖 | 版本要求 |
|-----|---------|
| Node.js | >= 16.0.0 |
| npm/pnpm/yarn | 任意 |
| 构建工具 | Vite（推荐） |

```bash
# 检查 Node.js 版本
node --version  # 需要 >= 16.0.0
```

---

## 📦 安装步骤

### 方式 A：完整安装（推荐）

适合 Vue/React 项目，需要完整功能：

```bash
# 使用 npm
npm install @translink/i18n-runtime
npm install -D @translink/i18n-cli @translink/vite-plugin-i18n

# 使用 pnpm
pnpm add @translink/i18n-runtime
pnpm add -D @translink/i18n-cli @translink/vite-plugin-i18n

# 使用 yarn
yarn add @translink/i18n-runtime
yarn add -D @translink/i18n-cli @translink/vite-plugin-i18n
```

### 方式 B：仅 CLI 工具

只需要文本提取和翻译管理：

```bash
npm install -D @translink/i18n-cli
```

### 方式 C：仅运行时

已有翻译文件，只需要运行时：

```bash
npm install @translink/i18n-runtime
```

---

## ⚙️ 配置

### 1. 初始化配置文件

```bash
npx translink init
```

这会在项目根目录创建 `translink.config.ts`：

```typescript
import { defineConfig } from '@translink/i18n-cli';

export default defineConfig({
  // 提取配置
  extract: {
    patterns: ['src/**/*.{vue,ts,tsx,js,jsx}'],
    exclude: ['node_modules', 'dist'],
    functions: ['$tsl', 't'],
  },

  // 语言配置
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
  },

  // 输出配置
  output: {
    directory: 'src/locales',
    format: 'json',
  },
});
```

### 2. 配置 Vite 插件

修改 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// 或 import react from '@vitejs/plugin-react';
import i18nPlugin from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    vue(),  // 或 react()
    i18nPlugin({
      localesDir: 'src/locales',
      defaultLanguage: 'zh-CN',
      hotReload: true,
      lazyLoad: true,
    }),
  ],
});
```

### 3. 初始化运行时

#### Vue 3

```typescript
// src/main.ts
import { createApp } from 'vue';
import { createI18n } from '@translink/i18n-runtime/vue';
import App from './App.vue';

const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  // 翻译资源会由 Vite 插件注入
});

const app = createApp(App);
app.use(i18n);
app.mount('#app');
```

#### React

```typescript
// src/i18n.ts
import { createI18n } from '@translink/i18n-runtime/react';

export const { engine, t, Provider } = createI18n({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  loadFunction: async (lng) => {
    return await import(`./locales/${lng}.json`);
  },
});
```

```typescript
// src/main.tsx
import { Provider } from './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider>
    <App />
  </Provider>
);
```

---

## 📁 目录结构

配置完成后，推荐的目录结构：

```
my-project/
├── src/
│   ├── locales/           # 翻译文件目录
│   │   ├── zh-CN.json     # 中文翻译
│   │   └── en-US.json     # 英文翻译
│   ├── components/
│   ├── App.vue            # 或 App.tsx
│   └── main.ts
├── translink.config.ts    # CLI 配置文件
├── vite.config.ts         # Vite 配置
└── package.json
```

---

## ✅ 验证安装

```bash
# 检查 CLI 是否安装成功
npx translink --version

# 检查配置是否正确
npx translink extract --dry-run
```

如果看到版本号和提取预览，说明安装成功！

---

## 🔧 常见问题

### Q: 报错 "Cannot find module '@translink/i18n-cli'"

确保安装了 CLI 包：
```bash
npm install -D @translink/i18n-cli
```

### Q: TypeScript 类型报错

在 `tsconfig.json` 中添加：
```json
{
  "compilerOptions": {
    "types": ["@translink/i18n-runtime"]
  }
}
```

### Q: Vite 插件不生效

确保插件顺序正确（i18n 插件在框架插件之后）：
```typescript
plugins: [
  vue(),       // 框架插件在前
  i18nPlugin() // i18n 插件在后
]
```

---

## 👉 下一步

安装完成！现在让我们创建第一个多语言应用：

[5分钟快速体验](./04-quick-example.md)

---

> 💡 **提示**
>
> 如果遇到其他问题，可以查看 [常见问题 FAQ](../5-troubleshooting/faq.md) 或提交 [Issue](https://github.com/lynncen/translink-i18n/issues)。
