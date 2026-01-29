# Vite 插件：编译时优化

> **Vite Plugin 的价值是将计算从运行时前移到编译时，降低用户侧的性能开销。**

Runtime 实现了运行时翻译。但有些工作可以在构建时完成，本章实现这些优化。

---

## 优化空间分析

### 当前流程

```
开发时代码          运行时
$tsl('欢迎')  →   计算哈希 → 查找翻译 → '欢迎'
```

**问题**：每次调用都计算哈希，运行时包含哈希算法代码。

### 优化后流程

```
开发时代码       构建时         运行时
$tsl('欢迎')  →  预计算哈希  →  t('a1b2c3d4')  →  查找翻译
```

**哈希在构建时算好，运行时直接用。**

---

## Vite Plugin 的能力

| 能力 | 应用场景 |
|-----|---------|
| **transform** | 代码转换 |
| **resolveId + load** | 虚拟模块 |
| **configureServer** | 开发服务器扩展（HMR） |

---

## 能力一：代码转换

### 需求

```javascript
// 输入
$tsl('欢迎使用')

// 输出
t('a1b2c3d4')
```

### 实现

```javascript
export default function i18nPlugin() {
  return {
    name: 'vite-plugin-i18n',

    transform(code, id) {
      // 跳过 node_modules
      if (id.includes('node_modules')) return null
      // 跳过非 JS/TS 文件
      if (!/\.(vue|tsx?|jsx?)$/.test(id)) return null

      // AST 转换
      const result = $(code)
        .replace('$tsl($_$)', (match) => {
          const text = match.match[0][0].value
          if (typeof text !== 'string') return match.source

          const key = generateHash(text)
          return `t('${key}')`
        })
        .generate()

      return { code: result, map: null }
    }
  }
}
```

---

## 能力二：虚拟模块

### 需求

```javascript
// 这个文件在磁盘上不存在
import resources from 'virtual:i18n/zh-CN'
```

Plugin 在运行时「生成」这个模块的内容。

### 实现

```javascript
const VIRTUAL_PREFIX = 'virtual:i18n/'

export default function i18nPlugin(options) {
  return {
    name: 'vite-plugin-i18n',

    // 1. 声明「我认识这个模块」
    resolveId(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        return id  // 返回 id 表示接管
      }
    },

    // 2. 返回模块内容
    load(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const lang = id.slice(VIRTUAL_PREFIX.length)
        const resources = loadTranslations(options.localesDir, lang)
        return `export default ${JSON.stringify(resources)}`
      }
    }
  }
}
```

### 虚拟模块的优势

1. **按需生成**：不需要预先写入文件
2. **动态内容**：可以根据配置/环境返回不同内容
3. **缓存友好**：Vite 可以智能缓存虚拟模块

---

## 能力三：热更新（HMR）

### 需求

修改 `locales/zh-CN.json` 后，页面立即更新，无需刷新。

### 实现思路

1. **服务端**：监听翻译文件变化，通知浏览器
2. **客户端**：接收通知，重新加载翻译资源

### 服务端

```javascript
export default function i18nPlugin(options) {
  return {
    name: 'vite-plugin-i18n',

    configureServer(server) {
      // 监听翻译文件目录
      server.watcher.add(options.localesDir)

      server.watcher.on('change', (file) => {
        if (file.startsWith(options.localesDir)) {
          // 通过 WebSocket 通知浏览器
          server.ws.send({
            type: 'custom',
            event: 'i18n:update',
            data: { file }
          })
        }
      })
    }
  }
}
```

### 客户端

```javascript
// 在 Runtime 初始化时注入
if (import.meta.hot) {
  import.meta.hot.on('i18n:update', async (data) => {
    // 重新加载翻译资源
    await reloadResources()
    // 触发 UI 更新
    engine.notifyUpdate()
  })
}
```

---

## 能力四：懒加载优化

### 需求

10 种语言，用户只需加载当前语言。

### 实现

利用 Vite 的动态导入自动分包：

```javascript
// 虚拟模块返回懒加载代码
load(id) {
  if (id === 'virtual:i18n-loader') {
    return `
      export async function loadLanguage(lang) {
        const module = await import(\`./locales/\${lang}.json\`)
        return module.default
      }
    `
  }
}
```

**Vite 会自动将 `import()` 的内容拆分成独立 chunk。**

构建产物：

```
dist/
├── assets/
│   ├── locales-zh-CN-abc123.js
│   ├── locales-en-US-def456.js
│   └── locales-ja-JP-ghi789.js
└── main.js
```

---

## 完整插件结构

```javascript
export default function i18nPlugin(options) {
  const { localesDir, defaultLanguage } = options

  return {
    name: 'vite-plugin-i18n',

    // 代码转换
    transform(code, id) { /* ... */ },

    // 虚拟模块解析
    resolveId(id) { /* ... */ },

    // 虚拟模块加载
    load(id) { /* ... */ },

    // 开发服务器配置
    configureServer(server) { /* ... */ }
  }
}
```

---

## 设计决策总结

| 能力 | 作用 | 原理 |
|-----|------|------|
| transform | 代码转换 | 编译时预计算哈希 |
| 虚拟模块 | 按需生成资源 | 不依赖物理文件 |
| HMR | 即时更新 | WebSocket 通知 |
| 动态导入 | 懒加载分包 | Vite 自动 code splitting |

---

## 下一步

核心功能完成。如果用户想接入自定义平台（Vika、Notion），如何扩展？

👉 [06. 插件系统](./06-plugin-system.md)
