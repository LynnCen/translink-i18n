# AI 翻译：Provider 抽象与成本优化

> **AI 翻译的核心挑战不是调用 API，而是如何在质量、成本、速度之间取得平衡。**

CLI 已经能提取文本、生成翻译文件。本章实现用 AI 自动完成翻译。

---

## 问题分析

### 需求

```bash
translink translate --to en-US --provider deepseek
```

一行命令，把所有中文文案翻译成英文。

### 挑战一：多平台支持

用户的选择各不相同：

| 平台 | 特点 |
|-----|------|
| OpenAI | 质量高，成本高 |
| DeepSeek | 性价比高，国内可用 |
| Gemini | 免费额度大 |
| Claude | 翻译质量优秀 |

**每个平台 SDK 不同，API 格式不同。**

### 挑战二：成本控制

朴素实现：

```javascript
for (const text of texts) {
  await translate(text)  // 1000 条 = 1000 次 API 调用
}
```

**问题**：
- 每次调用有系统提示词开销
- 网络延迟累加
- 没有利用缓存

---

## 设计方案

### 策略模式：Provider 抽象

```
┌─────────────────────────────────────────┐
│         AIProvider（接口）               │
│  translate(params): Promise<Result>     │
│  translateBatch?(params): Promise<...>  │
└─────────────────────────────────────────┘
        △               △               △
        │               │               │
┌──────────┐    ┌──────────┐    ┌──────────┐
│ OpenAI   │    │ DeepSeek │    │ Gemini   │
│ Provider │    │ Provider │    │ Provider │
└──────────┘    └──────────┘    └──────────┘
```

**切换 AI 平台 = 切换 Provider 实现，调用代码不变。**

### 接口定义

```typescript
interface TranslateParams {
  text: string
  sourceLang: string
  targetLang: string
  context?: string
}

interface TranslateResult {
  translatedText: string
  tokensUsed?: number
}

interface AIProvider {
  name: string
  translate(params: TranslateParams): Promise<TranslateResult>
  translateBatch?(params: BatchParams): Promise<BatchResult>
  testConnection(): Promise<boolean>
}
```

### 统一返回格式

不同 API 返回结构不同：

```javascript
// OpenAI
{ choices: [{ message: { content: '...' } }] }

// DeepSeek
{ choices: [{ message: { content: '...' } }] }  // 兼容 OpenAI

// Gemini
{ candidates: [{ content: { parts: [{ text: '...' }] } }] }
```

**在 Provider 内部转换为统一的 `TranslateResult`。**

---

## Provider 实现示例

```typescript
class DeepSeekProvider implements AIProvider {
  name = 'deepseek'
  private client: OpenAI

  constructor(config: { apiKey: string }) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://api.deepseek.com'
    })
  }

  async translate(params: TranslateParams): Promise<TranslateResult> {
      const response = await this.client.chat.completions.create({
      model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
          content: '你是专业翻译，直接输出译文，不要解释。'
          },
          {
            role: 'user',
          content: `将以下${params.sourceLang}文本翻译成${params.targetLang}：\n\n${params.text}`
        }
      ],
      temperature: 0.3  // 低温度保持稳定
    })

      return {
      translatedText: response.choices[0].message.content?.trim() || '',
      tokensUsed: response.usage?.total_tokens
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.translate({ text: 'test', sourceLang: 'en', targetLang: 'zh' })
      return true
    } catch {
      return false
    }
  }
}
```

---

## 成本优化策略

### 策略一：批量请求

```
单条翻译：1000 条 = 1000 次 API 调用
批量翻译：1000 条 = 1 次 API 调用（合并为 JSON）
```

**系统提示词从 1000 份降为 1 份。**

```typescript
async translateBatch(params: BatchParams): Promise<BatchResult> {
  const prompt = `将以下 JSON 数组中的文本翻译成 ${params.targetLang}。
保持 key 不变，只翻译 text 字段，返回相同格式的 JSON。

${JSON.stringify(params.items.map(i => ({ key: i.key, text: i.text })))}`

  const response = await this.client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: '你是翻译专家，按要求返回 JSON。' },
      { role: 'user', content: prompt }
    ]
  })

  const content = response.choices[0].message.content || ''
  const jsonMatch = content.match(/\[[\s\S]*\]/)

  return { translations: JSON.parse(jsonMatch![0]) }
}
```

### 策略二：增量翻译

```typescript
async translateIncremental(
  allTexts: Map<string, string>,
  targetLang: string,
  cache: TranslationCache
): Promise<Map<string, string>> {
  // 找出需要翻译的
  const needTranslate = new Map<string, string>()

  for (const [key, text] of allTexts) {
    if (!cache.has(key, targetLang)) {
      needTranslate.set(key, text)
    }
  }

  if (needTranslate.size === 0) {
    return cache.getAll(targetLang)
  }

  // 翻译新增的
  const results = await this.translateBatch({
    items: Array.from(needTranslate, ([key, text]) => ({ key, text })),
    targetLang
  })

  // 更新缓存
  for (const item of results.translations) {
    cache.set(item.key, targetLang, item.text)
  }

  return cache.getAll(targetLang)
}
```

### 策略三：结果缓存

```typescript
class TranslationCache {
  private cache = new Map<string, string>()

  private getKey(textKey: string, lang: string): string {
    return `${textKey}::${lang}`
  }

  has(textKey: string, lang: string): boolean {
    return this.cache.has(this.getKey(textKey, lang))
  }

  get(textKey: string, lang: string): string | undefined {
    return this.cache.get(this.getKey(textKey, lang))
  }

  set(textKey: string, lang: string, translation: string): void {
    this.cache.set(this.getKey(textKey, lang), translation)
  }
}
```

---

## 成本对比

| 场景 | 策略 | API 调用 | 估算成本 |
|-----|------|---------|---------|
| 1000 条首次翻译 | 逐条 | 1000 次 | $5.00 |
| 1000 条首次翻译 | 批量 | 20 次 | $0.50 |
| 新增 10 条 | 全量重翻 | 20 次 | $0.50 |
| 新增 10 条 | 增量 | 1 次 | $0.03 |

**批量 + 增量 + 缓存，可降低 90%+ 成本。**

---

## 设计决策总结

| 策略 | 原理 | 收益 |
|-----|------|------|
| Provider 抽象 | 策略模式 | 平台可切换 |
| 批量请求 | 合并 API 调用 | 减少系统提示词开销 |
| 增量翻译 | 只处理变化 | 避免重复翻译 |
| 结果缓存 | 持久化翻译结果 | 跨次调用复用 |

---

## 下一步

所有功能实现完成。最后一步：优化包体积，让用户下载更少：

👉 [08. 构建优化](./08-build-optimization.md)
