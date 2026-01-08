# @translink/vite-plugin-i18n

TransLink I18n Vite 插件 - 构建时优化和 HMR 支持。

## 📦 安装

```bash
pnpm add -D @translink/vite-plugin-i18n
pnpm add @translink/i18n-runtime
```

## 🚀 快速开始

### Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import i18n from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    vue(),
    i18n({
      // 语言包目录
      localeDir: 'src/locales',
      
      // 支持的语言
      languages: ['zh-CN', 'en-US', 'ja-JP'],
      
      // 默认语言
      defaultLanguage: 'zh-CN',
      
      // 启用 HMR
      hmr: true,
      
      // 启用懒加载
      lazyLoad: true,
    }),
  ],
});
```

### 在应用中使用

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

## ⚙️ 配置选项

```typescript
interface PluginOptions {
  // 语言包目录（相对于项目根目录）
  localeDir?: string;
  
  // 支持的语言列表
  languages: string[];
  
  // 默认语言
  defaultLanguage: string;
  
  // 回退语言
  fallbackLanguage?: string;
  
  // 启用热更新（HMR）
  hmr?: boolean;
  
  // 启用懒加载
  lazyLoad?: boolean;
  
  // 代码转换
  transform?: {
    // 是否转换 $tsl() 为哈希键
    enabled: boolean;
    // 转换函数名列表
    functions?: string[];
  };
  
  // 构建优化
  build?: {
    // 压缩输出
    minify?: boolean;
    // 生成 source map
    sourcemap?: boolean;
  };
  
  // 调试模式
  debug?: boolean;
}
```

## 🎯 特性

### ⚡ 热更新（HMR）

语言文件变更时自动更新界面，无需刷新页面。

```typescript
i18n({
  hmr: true, // 启用 HMR
});
```

### 📦 懒加载

按需加载语言包，优化首屏加载速度。

```typescript
i18n({
  lazyLoad: true,
});
```

### 🔄 代码转换

构建时将 `$tsl()` 自动转换为哈希键，提升运行时性能。

```typescript
i18n({
  transform: {
    enabled: true,
    functions: ['$tsl', 't', '$t'],
  },
});
```

**转换示例**：

```vue
<!-- 开发时 -->
<h1>{{ $tsl('欢迎使用') }}</h1>

<!-- 构建后 -->
<h1>{{ t('12345678') }}</h1>
```

### 🗜️ 构建优化

- 自动压缩语言文件
- Tree-shaking 未使用的翻译
- 生成优化的语言包

```typescript
i18n({
  build: {
    minify: true,
    sourcemap: false,
  },
});
```

## 📖 工作原理

### 1. 语言包虚拟模块

插件创建虚拟模块，动态导入语言文件：

```typescript
import { useI18n } from '@translink/i18n-runtime/vue';

// 虚拟模块自动生成
// virtual:i18n/zh-CN
// virtual:i18n/en-US
```

### 2. 代码转换

在构建时扫描代码，将翻译函数调用转换为哈希键：

```typescript
// 源代码
const text = $tsl('你好世界');

// 转换后
const text = t('12345678');
```

### 3. HMR 集成

监听语言文件变化，触发热更新：

```typescript
if (import.meta.hot) {
  import.meta.hot.accept('/path/to/locale.json', (newModule) => {
    // 更新翻译
  });
}
```

## 🔧 高级用法

### 自定义语言加载器

```typescript
i18n({
  localeDir: 'src/locales',
  languages: ['zh-CN', 'en-US'],
  
  // 自定义加载逻辑
  loader: async (lang) => {
    const response = await fetch(`/api/locales/${lang}`);
    return response.json();
  },
});
```

### 多个语言包目录

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

### 与 CLI 工具集成

```bash
# 1. 提取翻译
npx translink extract

# 2. 生成语言文件到 src/locales/

# 3. Vite 插件自动识别并处理
pnpm dev
```

## 📚 完整文档

- [Vite Plugin API 文档](../../docs/api/vite-plugin.md)
- [快速开始](../../docs/quick-start.md)
- [最佳实践](../../docs/best-practices.md)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)。

## 📄 许可证

MIT © lynncen

