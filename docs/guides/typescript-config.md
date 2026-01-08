# TypeScript 配置文件加载问题说明

## 🔍 问题原因

当你看到以下错误时：

```
⚠ Failed to register tsx loader. Make sure tsx is installed.
✗ Failed to load config from .../translink.config.ts: 
  TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"
```

**根本原因**：

1. **Node.js 原生不支持 `.ts` 文件**
   - Node.js 只能直接执行 `.js`、`.mjs`、`.cjs` 文件
   - `.ts` 文件需要编译或使用特殊加载器

2. **tsx 的 ESM Loader Hooks 限制**
   - tsx 使用 Node.js 的 ESM Loader Hooks API
   - 这些 hooks **必须在 Node.js 启动时注册**，无法在运行时动态注册
   - 当 CLI 工具运行时，Node.js 已经启动，无法再注册新的 loader

3. **运行时加载的限制**
   - CLI 工具使用 `import()` 动态加载配置文件
   - 此时 Node.js 已经启动，无法注册 tsx loader
   - 因此无法直接加载 `.ts` 文件

---

## ✅ 解决方案

### 方案 1：自动转换（推荐）⭐

**CLI 工具现在会自动尝试转换**：

当你运行命令时，如果检测到 `.ts` 配置文件，CLI 会：
1. 自动将其转换为 `.js` 文件
2. 保留配置内容
3. 添加 JSDoc 类型注释
4. 使用转换后的 `.js` 文件

**示例**：
```bash
npx translink extract
# 输出：
# ℹ  检测到 TypeScript 配置文件，正在转换为 JavaScript...
# ✓ 已自动转换为 JavaScript: translink.config.js
```

---

### 方案 2：手动转换为 JavaScript

如果自动转换失败，可以手动转换：

**步骤 1：复制文件**
```bash
cp translink.config.ts translink.config.js
```

**步骤 2：修改文件内容**

**原 TypeScript 配置**：
```typescript
import type { I18nConfig } from '@translink/i18n-cli';

const config: I18nConfig = {
  // ... 配置
};

export default config;
```

**转换为 JavaScript**：
```javascript
/** @type {import('@translink/i18n-cli').I18nConfig} */
export default {
  // ... 配置（移除类型注解）
};
```

**关键修改**：
- ✅ 第一行改为 JSDoc 类型注释
- ✅ 移除 `import type` 语句
- ✅ 移除 `: I18nConfig` 类型注解
- ✅ 移除 `satisfies I18nConfig`（如果有）
- ✅ 保留 `export default`

---

### 方案 3：直接使用 JavaScript 配置

创建 `translink.config.js` 文件：

```javascript
/** @type {import('@translink/i18n-cli').I18nConfig} */
export default {
  project: {
    name: 'my-app',
    version: '1.0.0',
  },
  
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    functions: ['t', '$tsl', '$t', 'i18n.t'],
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js'],
    incremental: true,
    createEmptyTranslations: true,
  },
  
  hash: {
    enabled: true,
    algorithm: 'sha256',
    length: 8,
    numericOnly: true,
    includeContext: false,
  },
  
  languages: {
    source: 'zh-CN',
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
    fallback: 'zh-CN',
  },
  
  output: {
    directory: 'src/locales',
    format: 'json',
    indent: 2,
    sortKeys: true,
  },
  
  importExport: {
    format: 'excel',
    excel: {
      includeMetadata: false,
    },
  },
  
  cli: {
    table: {
      enabled: true,
      maxRows: 20,
    },
  },
  
  plugins: [],
};
```

**优势**：
- ✅ 无需转换，直接可用
- ✅ JSDoc 注释提供类型提示（在 VSCode 中）
- ✅ 兼容性最好

---

### 方案 4：使用 JSON 配置

创建 `translink.config.json` 文件：

```json
{
  "project": {
    "name": "my-app",
    "version": "1.0.0"
  },
  "hash": {
    "enabled": true,
    "numericOnly": true
  },
  "languages": {
    "source": "zh-CN",
    "supported": ["zh-CN", "en-US"]
  }
}
```

**注意**：JSON 配置不支持注释和复杂表达式

---

## 🔧 技术细节

### 为什么 tsx 无法在运行时注册？

```javascript
// ❌ 这样不行（运行时注册）
const tsx = await import('tsx');
tsx.register();  // 太晚了，Node.js 已经启动

// ✅ 必须在启动时注册（通过命令行参数）
node --loader tsx/esm app.js
```

### ESM Loader Hooks 的工作方式

1. Node.js 启动时读取 loader hooks
2. Loader hooks 处理模块加载
3. 一旦启动，无法动态添加新的 loader

### CLI 工具的加载流程

```
CLI 启动 → 查找配置文件 → 尝试加载
  ↓
检测到 .ts 文件 → 尝试转换 → 加载 .js 文件
  ↓
成功加载配置 → 继续执行
```

---

## 📝 最佳实践

### 推荐配置方式

1. **开发时**：使用 TypeScript 配置文件（`.ts`）
   - 获得完整的类型检查
   - IDE 自动补全
   - 编译时错误提示

2. **运行时**：使用 JavaScript 配置文件（`.js`）
   - CLI 工具可以直接加载
   - 无需编译步骤
   - 兼容性最好

3. **转换工具**：使用 CLI 自动转换
   - 无需手动操作
   - 保留配置内容
   - 自动添加类型注释

---

## 🎯 总结

| 方案 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| **自动转换** | 无需手动操作 | 可能需要检查 | ⭐⭐⭐⭐⭐ |
| **手动转换** | 完全控制 | 需要手动操作 | ⭐⭐⭐⭐ |
| **JavaScript 配置** | 直接可用 | 无编译时类型检查 | ⭐⭐⭐⭐ |
| **JSON 配置** | 最简单 | 功能受限 | ⭐⭐⭐ |

**推荐**：使用 TypeScript 配置文件，让 CLI 自动转换为 JavaScript。

---

## 🔗 相关资源

- [Node.js ESM Loader Hooks](https://nodejs.org/api/esm.html#loaders)
- [tsx 文档](https://github.com/esbuild-kit/tsx)
- [JSDoc 类型注释](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)

