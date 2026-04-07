# 构建优化：Tree-shaking 与包体积控制

> **构建优化的目标是让用户只下载他们真正需要的代码。**

作为 npm 包发布后，用户的最终 bundle 大小直接影响页面加载性能。本章讨论如何让包「小而美」。

---

## 核心概念：Tree-shaking

### 定义

**Tree-shaking** 是一种死代码消除技术——移除打包产物中未被使用的代码。

```javascript
// 库导出 10 个函数
export { a, b, c, d, e, f, g, h, i, j }

// 用户只用 2 个
import { a, b } from 'lib'

// Tree-shaking 后，bundle 只包含 a, b
```

### 前提条件

**ES Module 静态结构**：

```javascript
// ESM：import 是静态的，编译时可分析
import { a } from 'lib'

// CommonJS：require 是动态的，运行时才知道
const fn = require('lib')[variable]  // 无法静态分析
```

**只有 ESM 才能被 Tree-shake。**

---

## 让代码可被 Tree-shake

### 规则一：输出 ESM 格式

```typescript
// tsup.config.ts
export default {
  format: ['esm'],  // 只输出 ESM
}
```

### 规则二：使用命名导出

```typescript
// ❌ 默认导出对象
export default { createI18n, useI18n, formatNumber }
// 即使只用 createI18n，其他也会被打包

// ✅ 命名导出
export { createI18n } from './core'
export { useI18n } from './hooks'
export { formatNumber } from './format'
// 用户只 import createI18n，其他不会被打包
```

### 规则三：声明 sideEffects

**副作用**：模块被导入时产生的「额外效果」。

```javascript
// 有副作用
import './polyfill'    // 立即执行 polyfill
import './styles.css'  // 注入 CSS

// 无副作用
import { fn } from './utils'  // 只是导出，不执行代码
```

**在 package.json 声明**：

```json
{
  "sideEffects": false
}
```

告诉打包工具：「这个包没有副作用，未使用的导出可以安全删除。」

---

## 分包策略：隔离框架代码

### 问题

```typescript
// runtime/src/index.ts
export { createI18n } from './core'
export { useI18n } from './vue'       // Vue 专用
export { useTranslation } from './react'  // React 专用
```

Vue 用户导入时，React 代码会被打包吗？

**可能会**，因为它们在同一入口文件。

### 解决方案：多入口

```
@translink/runtime        # 核心
@translink/runtime/vue    # Vue 适配器
@translink/runtime/react  # React 适配器
```

**package.json exports**：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./vue": {
      "types": "./dist/vue.d.ts",
      "import": "./dist/vue.js"
    },
    "./react": {
      "types": "./dist/react.d.ts",
      "import": "./dist/react.js"
    }
  }
}
```

**Vue 用户的 bundle 不包含任何 React 代码。**

---

## External：避免重复打包

### 问题

Vite Plugin 依赖 Runtime。如果 Plugin 把 Runtime 打包进去：

```
用户项目
├── @translink/runtime (用户安装)
└── @translink/vite-plugin-i18n
    └── 包含了一份 runtime 代码 (打包进去的)
```

**同一份代码出现两次。**

### 解决方案

```typescript
// vite-plugin 的 tsup.config.ts
export default {
  external: ['@translink/i18n-runtime'],
}
```

`external` 告诉打包工具：这个依赖由外部提供，不要打包。

---

## 构建配置示例

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig([
  // 核心包
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    treeshake: true,
  },
  // Vue 适配器
  {
    entry: ['src/vue.ts'],
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    external: ['vue', '@translink/i18n-runtime'],
  },
  // React 适配器
  {
    entry: ['src/react.ts'],
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    external: ['react', '@translink/i18n-runtime'],
  },
])
```

---

## 检查清单

发布前确认：

| 检查项 | 配置 |
|-------|------|
| 输出格式 | `format: ['esm']` |
| 副作用声明 | `"sideEffects": false` |
| 框架分包 | `exports` 多入口 |
| 外部依赖 | `external: ['vue', 'react']` |
| 导出方式 | 命名导出 |
| 类型文件 | `dts: true` |

---

## 体积分析工具

```bash
# 查看打包后大小
npx bundlephobia @translink/i18n-runtime

# 本地分析
pnpm add -D rollup-plugin-visualizer
```

---

## 设计决策总结

| 优化 | 原理 | 效果 |
|-----|------|------|
| ESM 输出 | 静态分析 | 支持 Tree-shaking |
| 命名导出 | 细粒度导出 | 按需打包 |
| sideEffects | 声明无副作用 | 安全删除未用代码 |
| 多入口 | 框架隔离 | Vue/React 互不影响 |
| external | 避免重复 | 依赖由用户提供 |

---

## 教程总结

至此，我们完成了整个国际化方案的设计与实现：

| 章节 | 主题 | 核心收获 |
|-----|------|---------|
| 00 | 问题分析 | 理解 i18n 工程困境的本质 |
| 01 | 方案设计 | 关注点分离、开放封闭原则 |
| 02 | Monorepo | 多包协作的工程实践 |
| 03 | CLI | AST 解析、内容寻址 |
| 04 | Runtime | 翻译引擎、发布订阅模式 |
| 05 | Vite Plugin | 编译时优化、虚拟模块 |
| 06 | 插件系统 | 可扩展架构设计 |
| 07 | AI 翻译 | Provider 抽象、成本优化 |
| 08 | 构建优化 | Tree-shaking、分包策略 |

**这些设计模式和工程实践，不仅适用于 i18n，也适用于任何复杂前端项目。**

---

## 下一步

- **动手实践**：克隆项目，尝试修改和扩展
- **深入阅读**：查看各包的源码实现
- **参与贡献**：提交 Issue 或 Pull Request
