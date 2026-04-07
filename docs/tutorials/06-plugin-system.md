# 插件系统：可扩展架构设计

> **插件系统的本质是定义「扩展边界」——什么可以扩展，什么必须遵守。**

用户需求是多样的：有人用 Vika，有人用 Notion，有人有自己的翻译管理系统。如何在不修改核心代码的前提下支持这些需求？

---

## 问题定义

### 无插件系统的做法

```javascript
async function sync(platform: string) {
  if (platform === 'vika') {
    // Vika 同步逻辑
  } else if (platform === 'notion') {
    // Notion 同步逻辑
  } else if (platform === 'airtable') {
    // Airtable 同步逻辑
  }
  // 无限膨胀...
}
```

**问题**：
1. 每加一个平台，核心代码就要改
2. 用户只用一个平台，却要下载所有平台的代码
3. 维护者需要了解所有平台的 API

### 设计目标

**开放封闭原则**：对扩展开放，对修改封闭。

```
核心 CLI（不变）
    ↓
定义插件接口（契约）
    ↓
外部插件实现接口（扩展）
```

---

## 接口设计

### 原则一：最小化必需项

```typescript
// ❌ 过度设计
interface Plugin {
  init(): void
  push(): void
  pull(): void
  delete(): void
  update(): void
  query(): void
  validate(): void
  // 用户只想实现 push，却被迫实现 7 个方法
}

// ✅ 合理设计
interface Plugin {
  metadata: PluginMetadata      // 必需：标识信息
  init?(ctx: PluginContext): Promise<void>  // 可选
  push?(data: PushData): Promise<PushResult>  // 可选
  pull?(data: PullData): Promise<PullResult>  // 可选
}
```

**可选方法用 `?` 标记，插件只实现需要的部分。**

### 原则二：数据结构通用化

```typescript
// ❌ 平台特定
interface PushData {
  vikaRecords: VikaRecord[]  // Notion 插件怎么办？
}

// ✅ 业务抽象
interface PushData {
  translations: Array<{
    key: string
    sourceText: string
    translations: Record<string, string>
  }>
  languages: string[]
}
```

**接口中只出现「业务概念」（翻译），不出现「平台概念」（Vika 记录）。**

### 原则三：提供足够上下文

```typescript
interface PluginContext {
  logger: Logger          // 日志输出
  config: I18nConfig      // 全局配置
  cwd: string             // 当前工作目录
}

interface Plugin {
  init?(context: PluginContext, config: PluginConfig): Promise<void>
}
```

**插件需要的「环境信息」通过 context 显式传入。**

---

## 生命周期管理

插件不是「调用一下」就结束，它有状态需要管理。

### 生命周期阶段

```
加载 → 初始化 → 使用 → 销毁

1. 加载：从 npm 或本地路径导入插件模块
2. 初始化：创建 API 客户端，验证配置
3. 使用：调用 push/pull 方法
4. 销毁：关闭连接，释放资源
```

### 完整接口定义

```typescript
interface PluginMetadata {
  name: string
  version: string
  description?: string
}

interface I18nPlugin {
  metadata: PluginMetadata

  // 生命周期
  init?(ctx: PluginContext, config: unknown): Promise<void>
  destroy?(): Promise<void>

  // 核心功能
  push?(data: PushData): Promise<PushResult>
  pull?(data: PullData): Promise<PullResult>

  // 辅助功能
  testConnection?(): Promise<boolean>
}
```

---

## 插件加载器

### 路径解析策略

```typescript
function resolvePath(name: string): string {
  // 1. 本地路径：./my-plugin.ts
  if (name.startsWith('.')) {
    return resolve(process.cwd(), name)
  }

  // 2. 完整包名：@translink/plugin-vika
  if (name.startsWith('@translink/plugin-')) {
    return name
  }

  // 3. 简写：vika → @translink/plugin-vika
  return `@translink/plugin-${name}`
}
```

### 加载流程

```typescript
class PluginLoader {
  private plugins = new Map<string, I18nPlugin>()

  async load(name: string, config?: unknown): Promise<I18nPlugin> {
    // 1. 解析路径
    const path = resolvePath(name)

    // 2. 动态导入
    const module = await import(path)
    const plugin = module.default as I18nPlugin

    // 3. 验证接口
    if (!plugin.metadata?.name) {
      throw new Error('插件缺少 metadata.name')
    }

    // 4. 初始化
    if (plugin.init) {
      await plugin.init(this.context, config)
    }

    // 5. 注册
    this.plugins.set(plugin.metadata.name, plugin)

    return plugin
  }
}
```

---

## 插件实现示例

以 Vika 插件为例：

```typescript
const vikaPlugin: I18nPlugin = {
  metadata: {
    name: 'vika',
    version: '1.0.0',
    description: 'Vika 云端翻译管理'
  },

  _client: null as VikaClient | null,

  async init(ctx, config: { apiKey: string; datasheetId: string }) {
    if (!config.apiKey) throw new Error('缺少 apiKey')
    if (!config.datasheetId) throw new Error('缺少 datasheetId')

    this._client = new VikaClient(config)
  },

  async push(data) {
    const records = data.translations.map(item => ({
      fields: {
        Key: item.key,
        'zh-CN': item.translations['zh-CN'],
        'en-US': item.translations['en-US']
      }
    }))

    await this._client!.createRecords(records)
    return { success: true, count: records.length }
  },

  async pull() {
    const records = await this._client!.getRecords()

    return {
      translations: records.map(r => ({
        key: r.fields.Key,
        translations: {
          'zh-CN': r.fields['zh-CN'],
          'en-US': r.fields['en-US']
        }
      }))
    }
  },

  async destroy() {
    this._client = null
  }
}

export default vikaPlugin
```

---

## 配置与使用

```typescript
// translink.config.ts
export default {
  plugins: [
    // 简写形式
    ['vika', { apiKey: process.env.VIKA_KEY, datasheetId: 'xxx' }],

    // 完整包名
    ['@translink/plugin-notion', { ... }],

    // 本地插件
    ['./my-plugin.ts', { ... }]
  ]
}
```

```bash
# 使用插件
translink push --plugin vika
translink pull --plugin vika
```

---

## 设计决策总结

| 决策 | 原理 |
|-----|------|
| 接口最小化 | 降低实现成本 |
| 数据结构通用化 | 不绑定具体平台 |
| 生命周期明确 | 资源管理可控 |
| 动态导入 | 按需加载，不增加包体积 |
| 多路径支持 | 灵活性（本地/npm/简写） |

---

## 下一步

插件系统实现了外部扩展能力。接下来看如何集成 AI 翻译：

👉 [07. AI 翻译](./07-ai-translation.md)
