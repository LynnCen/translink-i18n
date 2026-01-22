# @translink/hash

TransLink I18n 系统的统一哈希算法包。

## 📦 简介

`@translink/hash` 是 TransLink I18n 系统的核心组件，提供统一的哈希生成算法，确保 CLI 和 Runtime 使用完全一致的哈希逻辑。

## 🎯 为什么需要独立包？

在 TransLink I18n 系统中，CLI 工具和 Runtime 库都需要生成相同的哈希值：

- **CLI**: 提取翻译文本时生成 hash 作为 key
- **Runtime**: 运行时将原始文本 hash 后查找翻译

如果两者的哈希算法不一致，会导致翻译失败。通过独立的包，我们确保：

1. ✅ 单一事实来源（Single Source of Truth）
2. ✅ 算法完全一致
3. ✅ 易于维护和更新

## 📥 安装

```bash
# pnpm
pnpm add @translink/hash

# npm
npm install @translink/hash

# yarn
yarn add @translink/hash
```

## 🚀 使用

### 基础用法

```typescript
import { generateHash } from '@translink/hash';

// 生成哈希
const hash = generateHash('你好，世界！');
console.log(hash); // → 'abc12345' (8位十六进制)

// 带插值的文本
const hash2 = generateHash('你好，{{name}}！');
console.log(hash2); // → 'xyz67890'
```

### 标准化特性

哈希算法会自动标准化输入内容：

```typescript
// 多余空格被统一
generateHash('你好，  世界！');    // → 'abc12345'
generateHash('你好，   世界！');   // → 'abc12345'
generateHash('你好， 世界！');     // → 'abc12345'

// 换行符被统一
generateHash('你好，\n世界！');    // → 'abc12345'
generateHash('你好，\r\n世界！');  // → 'abc12345'
generateHash('你好，\r世界！');    // → 'abc12345'

// 首尾空格被去除
generateHash('  你好，世界！  ');  // → 'abc12345'
generateHash('你好，世界！');      // → 'abc12345'
```

### 在 CLI 中使用

```typescript
import { generateHash } from '@translink/hash';

// 提取文本时生成 hash
function extractText(content: string) {
  const hash = generateHash(content);
  return {
    key: hash,
    text: content,
  };
}
```

### 在 Runtime 中使用

```typescript
import { generateHash } from '@translink/hash';

// 翻译时查找
function t(text: string) {
  const hash = generateHash(text);
  return resources[hash] || text;
}
```

## 📖 API

### `generateHash(content: string): string`

生成内容的 MD5 哈希值。

**参数**:
- `content`: 需要哈希的字符串内容

**返回值**:
- 8位十六进制哈希字符串

**标准化规则**:
1. 多个空格 → 单个空格
2. 统一换行符（\r\n 或 \r → \n）
3. 去除首尾空格

**算法规范**:
- 算法：MD5
- 编码：UTF-8
- 格式：十六进制
- 长度：前 8 位

### `HASH_VERSION: string`

哈希算法的版本号，用于验证 CLI 和 Runtime 的算法版本是否一致。

```typescript
import { HASH_VERSION } from '@translink/hash';

console.log(HASH_VERSION); // → '1.0.0'
```

### `HASH_CONFIG: object`

哈希算法的配置信息。

```typescript
import { HASH_CONFIG } from '@translink/hash';

console.log(HASH_CONFIG);
// {
//   algorithm: 'md5',
//   encoding: 'utf8',
//   format: 'hex',
//   length: 8,
// }
```

## 🔒 算法保证

### 一致性保证

- ✅ CLI 和 Runtime 使用完全相同的算法
- ✅ 相同内容总是生成相同的哈希
- ✅ 跨平台一致（Node.js + 浏览器）

### 标准化保证

- ✅ 自动处理空白字符差异
- ✅ 自动处理换行符差异
- ✅ 开发者无需关心格式细节

## 🧪 测试

```bash
pnpm test
```

测试覆盖：
- ✅ 基本功能测试
- ✅ 标准化逻辑测试
- ✅ 稳定性测试
- ✅ 实际场景测试

## 📝 许可证

MIT

## 🔗 相关链接

- [@translink/i18n-cli](../cli) - CLI 工具包
- [@translink/i18n-runtime](../runtime) - Runtime 库
- [GitHub Repository](https://github.com/lynncen/translink-i18n)
