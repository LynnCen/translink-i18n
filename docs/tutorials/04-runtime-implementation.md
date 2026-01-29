# Runtime 实现：翻译引擎架构

> **翻译引擎不是简单的 key-value 查找，而是处理缺失、插值、响应式的完整系统。**

CLI 生成了翻译文件，本章实现运行时使用这些翻译的引擎。

---

## 需求分析

翻译引擎的核心职责：

```
输入：Key + 当前语言 + 参数
输出：翻译后的文本

t('a1b2c3d4', { name: '张三' })  →  'Hello, 张三'
```

**但这只是基础。完整的引擎需要处理：**

1. **缺失处理**：Key 不存在或当前语言缺少翻译
2. **参数插值**：`{name}` → 实际值
3. **语言切换**：切换后触发 UI 更新
4. **性能优化**：避免重复计算

---

## 问题一：缺失处理策略

### 场景

```javascript
t('不存在的key')  // 返回什么？
```

### 设计决策：多层回退

```
查找顺序：
1. 当前语言 (en-US) → 未找到
2. 回退语言 (zh-CN) → 找到，返回中文
3. 都没有 → 返回 Key 本身
```

**原理：渐进降级（Graceful Degradation）**

```javascript
function translate(key: string): string {
  const resources = this.resources[key]

  // 1. 当前语言
  if (resources?.[this.currentLang]) {
    return resources[this.currentLang]
  }

  // 2. 回退语言
  if (resources?.[this.fallbackLang]) {
    return resources[this.fallbackLang]
  }

  // 3. Key 本身（便于调试）
  return key
}
```

---

## 问题二：参数插值

### 场景

```javascript
// 翻译文件
{ 'a1b2c3d4': { 'en-US': 'Hello, {name}!' } }

// 调用
t('a1b2c3d4', { name: 'John' })  // → 'Hello, John!'
```

### 设计决策：占位符语法

**为什么不用模板字符串？**

```javascript
// ❌ 模板字符串
`Hello, ${name}!`
```

问题：不同语言语序可能不同。

```
英文：Hello, John!
日文：ジョンさん、こんにちは！  // 名字在前
```

**占位符让翻译者决定参数位置。**

### 实现

```javascript
function interpolate(text: string, params: Record<string, any>): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined
      ? String(params[key])
      : match  // 参数缺失时保留占位符
  })
}
```

---

## 问题三：语言切换与响应式

### 场景

用户点击「English」，页面所有文本需要更新。

### 挑战

`currentLang` 是普通变量，改变它不会触发 UI 更新。

```javascript
currentLang = 'en-US'  // UI 无反应
```

### 设计决策：发布-订阅模式

```javascript
class I18nEngine {
  private listeners: Set<(lang: string) => void> = new Set()

  changeLanguage(lang: string) {
    this.currentLang = lang
    this.listeners.forEach(fn => fn(lang))  // 通知所有订阅者
  }

  onLanguageChange(callback: (lang: string) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)  // 返回取消订阅函数
  }
}
```

### 框架适配

**Vue 适配器**：

```javascript
export function useI18n() {
  const engine = inject('i18n')
  const locale = ref(engine.currentLang)

  onMounted(() => {
    engine.onLanguageChange(lang => {
      locale.value = lang  // 触发 Vue 响应式更新
    })
  })

  return {
    t: (key, params) => engine.translate(key, params),
    locale,
    setLocale: lang => engine.changeLanguage(lang)
  }
}
```

**React 适配器**：

```javascript
export function useI18n() {
  const engine = useContext(I18nContext)
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  useEffect(() => {
    return engine.onLanguageChange(() => forceUpdate())
  }, [engine])

  return {
    t: (key, params) => engine.translate(key, params),
    locale: engine.currentLang,
    setLocale: lang => engine.changeLanguage(lang)
  }
}
```

**核心引擎不依赖框架，适配器负责桥接。**

---

## 问题四：性能优化

### 场景

页面有 100 个翻译调用，每次渲染都执行 100 次查找。

### 设计决策：结果缓存

```javascript
class I18nEngine {
  private cache = new Map<string, string>()

  translate(key: string, params?: Record<string, any>): string {
    const cacheKey = params
      ? `${key}::${JSON.stringify(params)}`
      : key

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const result = this.doTranslate(key, params)
    this.cache.set(cacheKey, result)
    return result
  }

  changeLanguage(lang: string) {
    this.currentLang = lang
    this.cache.clear()  // 语言切换时清空缓存
    this.listeners.forEach(fn => fn(lang))
  }
}
```

---

## 完整引擎实现

```javascript
interface I18nEngineOptions {
  defaultLanguage: string
  fallbackLanguage?: string
  resources: Record<string, Record<string, string>>
}

class I18nEngine {
  private currentLang: string
  private fallbackLang: string
  private resources: Record<string, Record<string, string>>
  private cache = new Map<string, string>()
  private listeners = new Set<(lang: string) => void>()

  constructor(options: I18nEngineOptions) {
    this.currentLang = options.defaultLanguage
    this.fallbackLang = options.fallbackLanguage || options.defaultLanguage
    this.resources = options.resources
  }

  translate(key: string, params?: Record<string, any>): string {
    const cacheKey = params ? `${key}::${JSON.stringify(params)}` : key

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    let text = this.resources[key]?.[this.currentLang]
              || this.resources[key]?.[this.fallbackLang]
              || key

    if (params) {
      text = this.interpolate(text, params)
    }

    this.cache.set(cacheKey, text)
    return text
  }

  private interpolate(text: string, params: Record<string, any>): string {
    return text.replace(/\{(\w+)\}/g, (_, k) =>
      params[k] !== undefined ? String(params[k]) : `{${k}}`
    )
  }

  changeLanguage(lang: string) {
    if (lang === this.currentLang) return
    this.currentLang = lang
    this.cache.clear()
    this.listeners.forEach(fn => fn(lang))
  }

  onLanguageChange(callback: (lang: string) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }
}
```

---

## 设计决策总结

| 问题 | 决策 | 原理 |
|-----|------|------|
| 缺失翻译 | 多层回退 | 渐进降级 |
| 动态内容 | 占位符语法 | 支持语序差异 |
| 语言切换 | 发布-订阅 | 解耦引擎与 UI |
| 性能 | 结果缓存 | 避免重复计算 |
| 框架集成 | 适配器模式 | 核心与框架分离 |

---

## 下一步

Runtime 解决了运行时翻译，但还有优化空间。Vite Plugin 可以在构建时做更多：

👉 [05. Vite 插件](./05-vite-plugin.md)
