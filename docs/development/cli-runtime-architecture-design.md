# CLI-Runtime 架构设计方案

## 📋 目录

1. [核心架构](#核心架构)
2. [职责边界](#职责边界)
3. [Hash 算法一致性保证](#hash-算法一致性保证)
4. [Runtime 功能审查](#runtime-功能审查)
5. [实施方案](#实施方案)
6. [工作流程](#工作流程)
7. [实施计划](#实施计划)

---

## 核心架构

### 整体流程（正确理解）

```typescript
// ===== 开发者写代码（永远保持原样，不替换）=====
t('你好，{{name}}', { name: 'Alice' })

// ===== Runtime 执行流程 =====
1. 接收原始内容: '你好，{{name}}'
2. 生成 hash: hash('你好，{{name}}') → '123'
3. 查找翻译: resources[currentLang]['123']
   - zh-CN: '你好，{{name}}'
   - en-US: 'Hello, {{name}}'
4. 插值替换: 将 {{name}} 替换为 'Alice'
5. 返回: '你好，Alice' 或 'Hello, Alice'

// ===== CLI 执行流程 =====
1. 扫描代码: t('你好，{{name}}', { name: 'Alice' })
2. 提取第一个参数: '你好，{{name}}'
3. 生成 hash: hash('你好，{{name}}') → '123'  // 和 Runtime 用同样算法
4. 生成 JSON:
   // zh-CN.json
   { "123": "你好，{{name}}" }

   // en-US.json (翻译后)
   { "123": "Hello, {{name}}" }

// ✅ 源代码永远不变！
```

### 核心原则

1. **✅ 源代码不变**：开发者永远写原始内容 `t('你好，{{name}}')`，不是 `t('123')`
2. **✅ CLI 和 Runtime 都需要生成 hash**：两边用同样的算法
3. **✅ 使用 @translink/hash 包**：统一管理 hash 生成逻辑，确保 CLI 和 Runtime 算法完全一致
4. **✅ 扁平化结构**：只支持扁平键值对，不支持嵌套和数组
5. **✅ 极简 Runtime**：移除复数、格式化等复杂功能

---

## 职责边界

### CLI 的职责

**核心任务：**
1. 扫描代码，找到翻译函数调用：`t('中文', params)`
2. 提取第一个参数（字符串）：`'中文'`
3. 生成哈希 key：`hash('中文')` → `'abc123'`
4. 生成 JSON 文件：`{ "abc123": "中文" }`

**✅ 负责：**
- ✅ 提取翻译文本
- ✅ 生成 hash key（用于生成 JSON）
- ✅ 生成翻译资源文件

**❌ 不负责：**
- ❌ **不替换源代码**（开发者代码保持原样）
- ❌ 不处理第二个参数（插值参数对象）
- ❌ 不进行插值替换
- ❌ 不处理运行时逻辑

### Runtime 的职责

**核心任务：**
1. 加载翻译资源（JSON 文件）
2. 接收翻译请求：`t('你好，{{name}}', { name: 'Alice' })`
3. 生成 hash key：`hash('你好，{{name}}')` → `'abc123'`
4. 查找翻译文本：`resources[lang]['abc123']` → `'你好，{{name}}'` 或 `'Hello, {{name}}'`
5. 执行基础插值：将 `{{name}}` 替换为 `'Alice'`
6. 返回最终文本：`'你好，Alice'` 或 `'Hello, Alice'`

**✅ 负责：**
- ✅ 生成 hash key（用于运行时查找）
- ✅ 查找翻译
- ✅ 插值替换
- ✅ 语言切换
- ✅ 缓存管理

**❌ 不负责：**
- ❌ 不修改源代码
- ❌ 不提取翻译文本
- ❌ 不生成 JSON 文件

### Hash 生成策略

**✅ 使用 @translink/hash 包统一管理**

```
packages/
  ├── hash/                          # ✅ 独立的 hash 包（统一管理）
  │   ├── src/
  │   │   └── index.ts               # generateHash() 统一实现
  │   ├── dist/                      # ESM + CJS + .d.ts
  │   ├── tests/                     # 一致性测试
  │   └── package.json               # @translink/hash
  ├── cli/
  │   ├── src/
  │   │   └── generators/
  │   │       └── hash-generator.ts  # ✅ 使用 @translink/hash
  │   └── package.json               # dependencies: @translink/hash
  └── runtime/
      ├── src/
      │   └── utils/
      │       └── hash.ts             # ✅ 重新导出 @translink/hash
      └── package.json                # dependencies: @translink/hash
```

**关键点：**
1. **单一事实来源（Single Source of Truth）**：所有 hash 生成逻辑在 `@translink/hash` 包中
2. **自动一致性保证**：CLI 和 Runtime 导入同一个包，算法天然一致
3. **易于维护**：算法修改只需在一处进行
4. **符合 Monorepo 架构**：遵循包职责单一原则

---

## Hash 算法一致性保证

### 使用 @translink/hash 包保证一致性

通过创建独立的 `@translink/hash` 包，从架构层面确保 CLI 和 Runtime 使用完全相同的 hash 算法。

#### 1. @translink/hash 包实现

```typescript
// packages/hash/src/index.ts
import { createHash } from 'crypto';

/**
 * TransLink 统一 Hash 算法
 *
 * 算法规范：SHA256 + UTF-8 + 纯数字 + 8位
 *
 * 标准化规则：
 * 1. 多个空格 → 单个空格
 * 2. 统一换行符（\r\n 或 \r → \n）
 * 3. 去除首尾空格
 */
export function generateHash(content: string): string {
  // ✅ 标准化内容
  const normalized = content
    .replace(/\s+/g, ' ')
    .replace(/\r\n|\r/g, '\n')
    .trim();

  // ✅ SHA256 哈希
  const hash = createHash('sha256');
  hash.update(normalized, 'utf8');
  const hexHash = hash.digest('hex');

  // ✅ 转换为纯数字格式
  return toNumericHash(hexHash, 8);
}

function toNumericHash(hexHash: string, length: number): string {
  let numeric = '';
  for (let i = 0; i < hexHash.length && numeric.length < length; i++) {
    const value = parseInt(hexHash[i], 16);
    numeric += value.toString();
  }
  return numeric.substring(0, length);
}

export const HASH_CONFIG = {
  algorithm: 'sha256',
  encoding: 'utf8',
  format: 'numeric',
  length: 8,
} as const;
```

#### 2. CLI 使用 @translink/hash

```typescript
// packages/cli/src/generators/hash-generator.ts
import { generateHash as baseGenerateHash } from '@translink/hash';

export class HashGenerator {
  private generateContentHash(content: string): string {
    // ✅ 直接使用 @translink/hash 提供的统一算法
    return baseGenerateHash(content);
  }

  // ... 其他碰撞检测逻辑
}
```

#### 3. Runtime 使用 @translink/hash

```typescript
// packages/runtime/src/utils/hash.ts

// ✅ 重新导出 @translink/hash
export {
  generateHash,
  HASH_VERSION,
  HASH_CONFIG
} from '@translink/hash';
```

#### 4. 单元测试保证

```typescript
// packages/hash/tests/hash.test.ts
import { generateHash } from '../src/index.js';
import { createHash } from 'crypto';

describe('@translink/hash 一致性测试', () => {
  // 模拟原生实现
  function nativeHash(text: string): string {
    const normalized = text
      .replace(/\s+/g, ' ')
      .replace(/\r\n|\r/g, '\n')
      .trim();

    const hash = createHash('sha256')
      .update(normalized, 'utf8')
      .digest('hex');

    return toNumericHash(hash, 8);
  }

  const testCases = [
    { input: '你好，世界', description: '简单中文' },
    { input: '你好，{{name}}', description: '带插值的中文' },
    { input: 'Hello, World!', description: '简单英文' },
    // ...
  ];

  testCases.forEach(({ input, description }) => {
    it(`应该为 "${description}" 生成一致的 hash`, () => {
      const result = generateHash(input);
      const expected = nativeHash(input);
      expect(result).toBe(expected);
      expect(result).toHaveLength(8);
      expect(/^[0-9]{8}$/.test(result)).toBe(true);
    });
  });
});
```

### 总结：Hash 一致性保证机制

| 层面 | 措施 | 作用 |
|------|------|------|
| **架构层面** | 独立的 @translink/hash 包 | 单一事实来源 |
| **实现层面** | CLI 和 Runtime 都依赖同一个包 | 自动保证一致性 |
| **测试层面** | @translink/hash 包内部测试 | 验证算法正确性 |
| **维护层面** | 算法修改只在一处进行 | 降低维护成本 |

**核心原则：**
- ✅ 算法写在文档规范中
- ✅ CLI 和 Runtime 各自实现，但遵循同一规范
- ✅ 通过测试持续验证一致性
- ❌ 不需要单独的 `@translink/hash` 包

---

## Runtime 功能审查

### 当前 Runtime 功能清单

| 功能 | 文件 | 代码行数 | 必需？ | 建议 |
|------|------|---------|-------|------|
| **基础翻译** | `i18n-engine.ts` | ~500 | ✅ 必需 | 保留 |
| **Hash 生成** | 新增 `utils/hash.ts` | ~20 | ✅ 必需 | **新增** |
| **语言切换** | `i18n-engine.ts` | ~50 | ✅ 必需 | 保留 |
| **资源加载** | `resource-loader.ts` | ~300 | ✅ 必需 | 保留 |
| **基础缓存** | `cache-manager.ts` | ~150 | ✅ 必需 | 保留 |
| **DevTools** | `devtools.ts` | ~200 | ✅ 必需 | 保留 |
| **基础插值** | `interpolator.ts` | ~100 | ✅ 必需 | **大幅简化** |
| **嵌套键访问** | `i18n-engine.ts` | ~20 | ❌ 移除 | **删除** |
| **复数支持** | `plural-resolver.ts` | 278 | ❌ 移除 | **删除整个文件** |
| **格式化函数** | `interpolator.ts` | ~250 | ❌ 移除 | **删除** |
| **嵌套插值** | `interpolator.ts` | ~50 | ❌ 移除 | **删除** |
| **格式化管道** | `interpolator.ts` | ~50 | ❌ 移除 | **删除** |
| **Namespace 支持** | `i18n-engine.ts` | ~30 | ❌ 移除 | **删除** |

### 为什么移除复数支持？

**复数支持的复杂性：**
- 278 行代码
- 支持 20+ 种语言的复数规则
- 包含复杂的数学计算（mod10, mod100）

**为什么是鸡肋？**
1. **使用频率极低**：99% 的翻译不需要复数形式
2. **可以用条件渲染替代**：
   ```typescript
   {count === 1 ? t('一个项目') : t('{{count}} 个项目', { count })}
   ```
3. **增加复杂度**：278 行代码，20+ 种语言规则
4. **维护成本高**：每增加一种语言都要添加规则
5. **与 hash 模式不兼容**

### 为什么移除格式化函数？

**格式化函数的复杂性：**
- number, currency, date, time, relative 等
- ~250 行代码

**为什么是鸡肋？**
1. **职责不清**：格式化应该由业务代码完成，而非 i18n 库
2. **可以用 Intl API 替代**：
   ```typescript
   const formatted = new Intl.NumberFormat('zh-CN', {
     style: 'currency',
     currency: 'CNY'
   }).format(100);
   t('价格：{{amount}}', { amount: formatted })
   ```
3. **增加包体积**：~250 行代码
4. **不是 i18n 的核心功能**

### 极简 i18n 应该保留什么？

**核心功能（仅 6 个）：**

1. **基础翻译**
   ```typescript
   t('你好，世界')  // → "你好，世界" 或 "Hello, World"
   ```

2. **Hash 生成**
   ```typescript
   // Runtime 内部：hash('你好，世界') → 'abc123'
   ```

3. **基础插值**
   ```typescript
   t('你好，{{name}}', { name: 'Alice' })
   // → "你好，Alice" 或 "Hello, Alice"
   ```

4. **语言切换**
   ```typescript
   await setLocale('en-US')
   ```

5. **懒加载**
   ```typescript
   loadFunction: async (lng) => import(`./locales/${lng}.json`)
   ```

6. **基础缓存**
   ```typescript
   cache: { enabled: true, maxSize: 1000 }
   ```

**仅此而已！**

---

## 实施方案

### 方案 1: Runtime 添加 Hash 生成

#### 1.1 创建 Hash 工具

```typescript
// packages/runtime/src/utils/hash.ts

/**
 * 生成内容的 hash key
 *
 * ⚠️ 重要：必须和 CLI 的 hash 算法完全一致
 */
export function generateHash(text: string): string {
  // 选项 1: 使用原生 crypto API（浏览器 + Node.js）
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // 浏览器环境
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    return crypto.subtle.digest('SHA-256', data).then(hash => {
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex.substring(0, 8); // 取前 8 位
    });
  }

  // 选项 2: 使用简单的 hash 函数（同步版本）
  // ⚠️ 必须和 CLI 的算法一致
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}
```

#### 1.2 更新 I18nEngine

```typescript
// packages/runtime/src/core/i18n-engine.ts

import { generateHash } from '../utils/hash.js';

export class I18nEngine {
  /**
   * 翻译函数
   */
  t(
    text: string,
    params?: Record<string, any>,
    options?: {
      lng?: string;
      defaultValue?: string;
    }
  ): string {
    if (!this.isInitialized) {
      return options?.defaultValue || text;
    }

    const language = options?.lng || this.currentLanguage;
    const defaultValue = options?.defaultValue || text;

    try {
      // 1. 生成 hash key（和 CLI 使用同样算法）
      const hashKey = generateHash(text);

      // 2. 生成缓存键
      const cacheKey = `${language}:${hashKey}:${JSON.stringify(params || {})}`;

      // 3. 检查缓存
      if (this.options.cache?.enabled !== false) {
        const cached = this.cache.get(cacheKey);
        if (cached !== null) {
          return cached;
        }
      }

      // 4. 查找翻译文本（扁平化，无嵌套）
      const translation = this.getTranslation(hashKey, language);

      if (!translation) {
        this.emit('translationMissing', { key: hashKey, text, language });
        return defaultValue;
      }

      // 5. 基础插值
      const result = params
        ? this.interpolator.interpolate(translation, params)
        : translation;

      // 6. 缓存结果
      if (this.options.cache?.enabled !== false) {
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      this.logger.error('Translation error:', error);
      return defaultValue;
    }
  }

  /**
   * 获取翻译文本（扁平化，无嵌套）
   */
  private getTranslation(hashKey: string, language: string): string | null {
    const resource = this.resourceLoader.getLoadedResource(language, 'translation');

    if (!resource) {
      // 尝试回退语言
      if (language !== this.options.fallbackLanguage) {
        return this.getTranslation(hashKey, this.options.fallbackLanguage);
      }
      return null;
    }

    // ✅ 直接查找 hash key，不处理嵌套
    return resource[hashKey] || null;
  }

  // ❌ 删除: getNestedValue()
  // ❌ 删除: 复数相关逻辑
  // ❌ 删除: namespace 相关逻辑
}
```

### 方案 2: 简化 Interpolator

```typescript
// packages/runtime/src/core/interpolator.ts

export class Interpolator {
  private prefix: string;
  private suffix: string;
  private escapeValue: boolean;

  constructor(options: { prefix?: string; suffix?: string; escapeValue?: boolean } = {}) {
    this.prefix = options.prefix || '{{';
    this.suffix = options.suffix || '}}';
    this.escapeValue = options.escapeValue ?? true;
  }

  /**
   * 基础插值（仅支持简单变量替换）
   */
  interpolate(template: string, params: Record<string, any> = {}): string {
    if (!template || typeof template !== 'string') {
      return template || '';
    }

    const regex = this.createInterpolationRegex();

    return template.replace(regex, (match, variable) => {
      const key = variable.trim();
      const value = params[key];

      if (value === undefined || value === null) {
        return match;  // 保持原样
      }

      const result = String(value);
      return this.escapeValue ? this.escapeHtml(result) : result;
    });
  }

  private createInterpolationRegex(): RegExp {
    const prefix = this.escapeRegex(this.prefix);
    const suffix = this.escapeRegex(this.suffix);
    return new RegExp(`${prefix}([^${suffix}]+)${suffix}`, 'g');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return str.replace(/[&<>"']/g, match => htmlEscapes[match]);
  }
}

// ❌ 删除：registerDefaultFormatters()
// ❌ 删除：所有格式化函数（~250 行）
// ❌ 删除：嵌套插值逻辑
// ❌ 删除：格式化管道解析

// 从 ~365 行简化为 ~50 行
```

### 方案 3: 删除冗余模块

```bash
# 删除复数解析器
rm packages/runtime/src/core/plural-resolver.ts

# 删除 i18n-engine.ts 中的：
# - getNestedValue() 方法
# - namespace 相关逻辑
# - 复数相关的 count 参数处理
```

### 方案 4: CLI 容错处理

#### 问题：`TypeError: text.trim is not a function`

**原因：**假设所有值都是字符串，但实际可能遇到对象、数组、null 等。

**解决方案：**简单的类型检查 + 默认值

```typescript
// packages/cli/src/commands/export.ts

// ❌ 之前：假设是字符串
const value = translations[key].trim();

// ✅ 现在：简单容错
const value = typeof translations[key] === 'string' ? translations[key] : '';
```

**在所有 CLI 命令中统一应用：**
- `export` 命令：遇到非字符串值时使用空字符串
- `import` 命令：只保留字符串类型的值
- `extract` 命令：提取时验证是字符串

**核心原则：**
- ✅ 简单的 `typeof` 检查
- ✅ 非字符串统一处理为空字符串
- ✅ 不抛错，继续执行

---

## 工作流程

### 完整工作流

```bash
# ===== 阶段 1: 开发 =====

# 开发者编写代码（直接写中文，保持原样）
t('你好，世界！')
t('欢迎来到 {{appName}}', { appName: 'TransLink' })

# ===== 阶段 2: 提取 =====

npx translink extract

# CLI 自动处理：
# 1. 扫描代码，找到 t() 调用
# 2. 提取第一个参数：
#    - '你好，世界！'
#    - '欢迎来到 {{appName}}'
# 3. 生成 hash key：
#    hash('你好，世界！') → 'a1b2c3d4'
#    hash('欢迎来到 {{appName}}') → 'e5f6g7h8'
# 4. 生成 JSON 文件（扁平化）：
#    {
#      "a1b2c3d4": "你好，世界！",
#      "e5f6g7h8": "欢迎来到 {{appName}}"
#    }
#
# ✅ 源代码不变！

# ===== 阶段 3: 翻译 =====

# 方式 1: AI 翻译
npx translink translate --provider openai

# 方式 2: Excel 翻译
npx translink export
# 翻译后
npx translink import

# 生成的 en-US.json:
# {
#   "a1b2c3d4": "Hello, World!",
#   "e5f6g7h8": "Welcome to {{appName}}"
# }

# ===== 阶段 4: 运行 =====

# Runtime 处理：

// 代码: t('你好，世界！')
// 1. 生成 hash: hash('你好，世界！') → 'a1b2c3d4'
// 2. 查找翻译:
//    - zh-CN: resources['a1b2c3d4'] = "你好，世界！"
//    - en-US: resources['a1b2c3d4'] = "Hello, World!"
// 3. 返回: "你好，世界！" 或 "Hello, World!"

// 代码: t('欢迎来到 {{appName}}', { appName: 'TransLink' })
// 1. 生成 hash: hash('欢迎来到 {{appName}}') → 'e5f6g7h8'
// 2. 查找翻译:
//    - zh-CN: resources['e5f6g7h8'] = "欢迎来到 {{appName}}"
//    - en-US: resources['e5f6g7h8'] = "Welcome to {{appName}}"
// 3. 插值: "欢迎来到 TransLink" 或 "Welcome to TransLink"
// 4. 返回: "欢迎来到 TransLink" 或 "Welcome to TransLink"
```

---

## 实施计划

### 阶段 1: Runtime 添加 Hash 生成（高优先级）

**任务清单：**
- [ ] 创建 `packages/runtime/src/utils/hash.ts`
- [ ] 实现 `generateHash()` 函数（必须和 CLI 算法一致）
- [ ] 更新 `i18n-engine.ts` 的 `t()` 方法
- [ ] 添加 hash 生成的单元测试

**代码文件：**
- `packages/runtime/src/utils/hash.ts`（新增）
- `packages/runtime/src/core/i18n-engine.ts`
- `packages/runtime/tests/hash.test.ts`（新增）

**预计时间：** 2-3 小时

### 阶段 2: Runtime 简化（高优先级）

**任务清单：**
- [ ] **删除** `packages/runtime/src/core/plural-resolver.ts`（278 行）
- [ ] **简化** `packages/runtime/src/core/interpolator.ts`（从 365 行 → 50 行）
  - 删除所有格式化函数
  - 删除嵌套插值逻辑
  - 删除格式化管道解析
- [ ] **简化** `packages/runtime/src/core/i18n-engine.ts`（从 517 行 → 300 行）
  - 删除 `getNestedValue()` 方法
  - 删除复数相关逻辑
  - 删除 namespace 相关逻辑
- [ ] **更新类型定义** `packages/runtime/src/types/index.ts`
  - 删除 `PluralOptions`
  - 删除 `NamespaceOptions`
  - 简化 `TranslationResources` 为纯扁平结构
- [ ] **更新测试**
  - 删除复数相关测试
  - 删除嵌套相关测试
  - 添加扁平化验证测试

**代码文件：**
- `packages/runtime/src/core/i18n-engine.ts`
- `packages/runtime/src/core/interpolator.ts`
- `packages/runtime/src/types/index.ts`
- `packages/runtime/tests/`

**预计时间：** 6-8 小时

### 阶段 3: CLI 容错处理（高优先级）

**任务清单：**
- [ ] 在 `export` 命令中添加 `typeof` 检查
- [ ] 在 `import` 命令中添加类型过滤
- [ ] 在 `extract` 命令中添加字符串验证

**代码文件：**
- `packages/cli/src/commands/export.ts`
- `packages/cli/src/commands/import.ts`
- `packages/cli/src/commands/extract.ts`

**预计时间：** 1-2 小时

### 阶段 4: Demo 和文档更新（中优先级）

**任务清单：**
- [ ] **React Demo**
  - 更新代码：保持 `t('中文内容')` 形式
  - 将 JSON 改为扁平化（hash key: value）
  - 移除嵌套和数组演示
  - 更新 README
- [ ] **Vue Demo**
  - 更新代码：保持 `t('中文内容')` 形式
  - 将 JSON 改为扁平化（hash key: value）
  - 移除嵌套和数组演示
  - 更新 README
- [ ] **文档更新**
  - README.md
  - docs/quick-start.md
  - docs/best-practices.md
  - docs/api/cli.md
  - docs/api/runtime.md

**预计时间：** 4-6 小时

### 阶段 5: 测试与验证（高优先级）

**任务清单：**
- [ ] 完整工作流测试
- [ ] React Demo 测试
- [ ] Vue Demo 测试
- [ ] Hash 一致性测试（CLI vs Runtime）
- [ ] 单元测试覆盖率检查
- [ ] 集成测试
- [ ] E2E 测试

**预计时间：** 4-6 小时

---

## 总结

### 核心决策（已纠正）

1. **✅ 源代码不变**：开发者永远写 `t('你好')`，不是 `t('abc123')`
2. **✅ CLI 和 Runtime 都生成 hash**：两边用同样算法
3. **✅ 不需要单独的 hash 包**：算法简单，各自实现即可
4. **✅ 插值归 Runtime**：CLI 只提取字符串，不处理参数对象
5. **✅ 极简 Runtime**：移除复数、嵌套、格式化等鸡肋功能
6. **✅ 扁平化结构**：只支持扁平键值对，强制最佳实践

### 代码变化对比

| 模块 | 原代码行数 | 新代码行数 | 变化 |
|------|----------|----------|------|
| **Runtime** ||||
| `utils/hash.ts` | 0 | 20（新增） | +20 |
| `plural-resolver.ts` | 278 | 0（删除） | -278 |
| `interpolator.ts` | 365 | 50 | -315 |
| `i18n-engine.ts` | 517 | 320 | -197 |
| Runtime 小计 | 1160 | 390 | **-770（-66%）** |
| **CLI** ||||
| `commands/export.ts` | ~100 | ~105 | +5 |
| `commands/import.ts` | ~80 | ~85 | +5 |
| `commands/extract.ts` | ~150 | ~155 | +5 |
| CLI 小计 | 330 | 345 | **+15（+5%）** |
| **总计** | **1490** | **735** | **-755（-51%）** |

### 时间预估对比

| 阶段 | 预计时间 |
|------|---------|
| 阶段 1: Runtime 添加 Hash 生成 | 2-3 小时 |
| 阶段 2: Runtime 简化 | 6-8 小时 |
| 阶段 3: CLI 容错处理 | 1-2 小时 |
| 阶段 4: Demo 和文档更新 | 4-6 小时 |
| 阶段 5: 测试与验证 | 4-6 小时 |
| **总计** | **17-25 小时** |

### 优势

- **简单**：代码量减少 66%，易于理解和维护
- **高效**：移除不必要的功能，性能更好
- **可靠**：CLI 和 Runtime 使用统一的哈希算法
- **易用**：只保留核心功能，降低学习成本
- **灵活**：开发者写原始内容，可读性好

### 实施重点

1. **立即执行**：
   - Runtime 添加 hash 生成功能
   - Runtime 删除复数和格式化功能
   - CLI 添加容错处理

2. **重点测试**：
   - Hash 一致性（CLI vs Runtime）
   - 基础插值的正确性
   - CLI 容错处理（简单验证）

3. **文档同步**：
   - 更新所有相关文档
   - 提供简洁的示例
   - 强调极简设计理念

---

**文档版本：** v4.1
**最后更新：** 2026-01-22
**状态：** 设计完成，已简化容错处理，等待确认后实施

### 本次更新（v4.1）

1. **✅ 添加了 "Hash 算法一致性保证" 章节**
   - 通过文档规范、实现、测试三个层面保证算法一致性
   - 明确了 MD5 + UTF-8 + hex + 8位 的统一规范
   - 提供了 CLI 和 Runtime 的具体实现示例
   - 添加了单元测试检查机制

2. **✅ 删除了 "Validate 命令" 相关内容**
   - 从实施方案中删除
   - 从工作流程中删除
   - 从实施计划中删除

3. **✅ 添加了 "CLI 容错处理" 设计（简化版）**
   - 针对 `TypeError: text.trim is not a function` 问题
   - 使用简单的 `typeof` 检查 + 默认值
   - 在 export/import/extract 命令中统一应用
   - 不增加冗余代码，保持简洁
