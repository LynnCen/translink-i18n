# AI 自动翻译功能

TransLink 提供了基于大语言模型的自动翻译功能，支持 DeepSeek、Gemini、OpenAI 等多种 AI 提供商。

## 特性

✅ 多模型支持 - DeepSeek、Gemini、OpenAI  
✅ 批量翻译 - 提高效率，降低成本  
✅ 智能缓存 - 避免重复翻译  
✅ 质量控制 - 验证结果，保证质量  
✅ 成本优化 - 估算成本，控制预算  
✅ 灵活配置 - 丰富的配置选项

## 快速开始

### 1. 配置 AI 翻译

在 `translink.config.ts` 中添加 AI 翻译配置：

```typescript
import { defineConfig } from '@translink/i18n-cli';

export default defineConfig({
  // ... 其他配置 ...

  // AI 翻译配置
  aiTranslation: {
    // 默认提供商
    defaultProvider: 'deepseek',

    // 提供商配置
    providers: {
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseURL: 'https://api.deepseek.com',
        model: 'deepseek-chat',
        temperature: 0.3,
      },

      gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        baseURL: 'https://generativelanguage.googleapis.com',
        model: 'gemini-pro',
      },

      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        baseURL: 'https://api.openai.com',
        model: 'gpt-4-turbo-preview',
      },
    },

    // 翻译选项
    options: {
      cache: true, // 启用缓存
      cacheTTL: 86400, // 缓存过期时间（24小时）
      batchSize: 20, // 每批翻译20条
      concurrency: 3, // 同时处理3个批次
      maxRetries: 3, // 最大重试次数
      retryDelay: 1000, // 重试延迟（毫秒）

      // 术语表（保持翻译一致性）
      glossary: {
        应用: 'Application',
        用户: 'User',
        设置: 'Settings',
      },

      // 自定义上下文提示
      contextPrompt: `You are translating a SaaS product UI.
Please use professional and concise language.
Maintain consistency with the glossary provided.`,
    },

    // 质量配置
    quality: {
      detectUntranslated: true, // 检测未翻译
      minLengthRatio: 0.3, // 最小长度比例
      maxLengthRatio: 3.0, // 最大长度比例
    },
  },
});
```

### 2. 设置 API Key

使用环境变量存储 API Key：

```bash
# .env
DEEPSEEK_API_KEY=your_api_key_here
GEMINI_API_KEY=your_api_key_here
OPENAI_API_KEY=your_api_key_here
```

### 3. 运行翻译

```bash
# 基本用法（翻译所有支持的语言）
npx translink translate

# 指定源语言和目标语言
npx translink translate --from zh-CN --to en-US,ja-JP

# 指定 AI 提供商
npx translink translate --provider gemini

# 强制重新翻译
npx translink translate --force

# 只翻译特定的键
npx translink translate --keys "12345678,87654321"

# 预览模式（不写入文件）
npx translink translate --dry-run

# 估算翻译成本
npx translink translate --estimate-cost
```

## 使用场景

### 场景 1：初次使用

```bash
# 1. 提取翻译文本
npx translink extract

# 2. 估算成本
npx translink translate --estimate-cost

# 3. 预览翻译
npx translink translate --provider gemini --dry-run

# 4. 正式翻译
npx translink translate --provider deepseek
```

### 场景 2：日常开发

```bash
# 1. 提取新增文本（增量）
npx translink extract

# 2. 翻译新增内容（自动跳过已有）
npx translink translate
```

### 场景 3：修复单个翻译

```bash
# 只翻译指定的键
npx translink translate --keys "12345678,87654321" --force
```

### 场景 4：切换翻译模型

```bash
# 使用更好的模型重新翻译
npx translink translate --provider openai --force
```

## AI 提供商对比

| 提供商    | 成本       | 质量       | 速度       | 适用场景             |
| --------- | ---------- | ---------- | ---------- | -------------------- |
| DeepSeek  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | 日常大批量翻译       |
| Gemini    | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | 测试、小规模项目     |
| OpenAI    | ⭐⭐       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | 专业文档、高质量要求 |

### 成本估算

以翻译 1000 条文本（平均 15 字）为例：

| 提供商   | 估算 Tokens | 成本     | 时间 |
| -------- | ----------- | -------- | ---- |
| DeepSeek | ~22,500     | $0.003   | 30s  |
| Gemini   | ~22,500     | $0       | 25s  |
| OpenAI   | ~22,500     | $0.225   | 35s  |

## 工作原理

### 1. 数据筛选

翻译引擎只翻译需要的项：

```
源文件 (1000条)
  ↓ 筛选
- 已翻译: 700条 → 跳过
- 缓存命中: 100条 → 使用缓存
- 需要翻译: 200条 → 进入队列
```

### 2. 批量处理

将多条文本合并成一个请求：

```
200条待翻译
  ↓ 分批（每批20条）
10个批次
  ↓ 批量优化
10次API调用（而不是200次）
```

### 3. 并发处理

同时处理多个批次：

```
批次1、2、3 → 并发执行
批次4、5、6 → 等待前3个完成
批次7、8、9 → 继续
批次10     → 最后
```

### 性能对比

| 指标     | 未优化 | 优化后 | 提升        |
| -------- | ------ | ------ | ----------- |
| 需要翻译 | 300条  | 200条  | ↓33% (缓存) |
| API调用  | 300次  | 10次   | ↓97% (批量) |
| 处理时间 | 90秒   | 10秒   | ↑9倍 (并发) |
| 翻译成本 | $0.42  | $0.028 | ↓93% (综合) |

## 高级功能

### 术语表

保持术语翻译一致性：

```typescript
{
  options: {
    glossary: {
      '应用': 'Application',
      '工作区': 'Workspace',
      '数据面板': 'Data Board',
    }
  }
}
```

### 自定义上下文

提供额外的翻译上下文：

```typescript
{
  options: {
    contextPrompt: `
You are translating a project management SaaS product.
Target audience: Business professionals.
Tone: Professional and friendly.
    `
  }
}
```

### 质量验证

自动验证翻译质量：

```typescript
{
  quality: {
    detectUntranslated: true,    // 检测未翻译（原文==译文）
    minLengthRatio: 0.3,          // 最小长度比例（防止翻译过短）
    maxLengthRatio: 3.0,          // 最大长度比例（防止翻译过长）
  }
}
```

## 最佳实践

### 1. 使用缓存

启用缓存可以避免重复翻译：

```typescript
{
  options: {
    cache: true,
    cacheTTL: 86400, // 24小时
  }
}
```

### 2. 选择合适的模型

- **DeepSeek** - 日常使用，性价比最高
- **Gemini** - 测试和小项目，免费
- **OpenAI** - 高质量翻译，专业文档

### 3. 增量翻译

不要使用 `--force`，让工具自动跳过已翻译项：

```bash
# ✅ 推荐：增量翻译
npx translink translate

# ❌ 不推荐：全量翻译（成本高）
npx translink translate --force
```

### 4. 维护术语表

建立统一的术语表，确保翻译一致性：

```typescript
glossary: {
  // 产品术语
  '应用': 'Application',
  '工作区': 'Workspace',
  
  // UI 术语
  '确定': 'Confirm',
  '取消': 'Cancel',
  
  // 功能术语
  '数据面板': 'Data Board',
  '权限管理': 'Permission Management',
}
```

### 5. 人工审核

AI 翻译后建议进行人工审核：

1. 使用 `--dry-run` 预览翻译结果
2. 检查关键术语是否正确
3. 审核后再提交代码

## 故障排查

### API Key 无效

```
错误: 401 Unauthorized
解决: 检查环境变量中的 API Key 是否正确
```

### 速率限制

```
错误: 429 Too Many Requests
解决: 减少 concurrency 或增加 retryDelay
```

### 翻译质量不佳

```
解决:
1. 添加术语表
2. 提供更详细的上下文
3. 切换到更好的模型
```

### 成本过高

```
解决:
1. 启用缓存
2. 使用增量翻译（不要 --force）
3. 选择更便宜的模型（DeepSeek）
```

## 相关命令

```bash
# 提取翻译文本
npx translink extract

# 导出为 Excel
npx translink export

# 从 Excel 导入
npx translink import

# 查看翻译统计
npx translink analyze
```

## 参考资料

- [AI Translation Design](../AI_TRANSLATION_DESIGN.md) - 完整的设计方案
- [Configuration](./configuration.md) - 配置说明
- [Quick Start](./quick-start.md) - 快速开始指南

