# CLI 开发：AST 解析与内容寻址

> **CLI 的核心价值不是命令行界面，而是「从代码中自动发现可翻译文本」的能力。**

设计方案确定了「内容哈希」替代「人工 Key」。本章实现这个能力的核心：AST 文本提取和哈希生成。

---

## 问题定义

**输入**：源代码

```javascript
<h1>{{ $tsl('欢迎使用') }}</h1>
<p>{{ $tsl('这是描述') }}</p>
```

**输出**：翻译清单

```json
{
  "a1b2c3d4": "欢迎使用",
  "e5f6g7h8": "这是描述"
}
```

**核心问题**：如何从代码中「找到」所有 `$tsl(...)` 调用？

---

## 方案对比：正则 vs AST

### 方案 A：正则表达式

```javascript
const regex = /\$tsl\(['"](.+?)['"]\)/g
const matches = code.match(regex)
```

**边界情况**：

```javascript
// 嵌套引号
$tsl("He said \"Hello\"")

// 模板字符串
$tsl(`Hello ${name}`)

// 跨行
$tsl(
  '长文本'
)

// 注释中的
// $tsl('不应提取')
```

**正则无法处理这些情况，因为正则操作的是「字符流」，不理解「语法结构」。**

### 方案 B：AST（抽象语法树）

代码不是字符串，代码是**有结构的**。

```javascript
$tsl('欢迎')
```

这段代码的语法结构：

```
CallExpression（函数调用）
├── callee: Identifier('$tsl')
└── arguments: [
    └── StringLiteral('欢迎')
    ]
```

**AST 把代码的结构显式化，让我们可以「查询」结构而非「匹配」字符。**

---

## AST 的工作原理

### 解析过程

```
源代码 → 词法分析 → Token 流 → 语法分析 → AST

$tsl('欢迎')
    ↓
[Identifier('$tsl'), Punctuator('('), String('欢迎'), Punctuator(')')]
    ↓
CallExpression { callee: Identifier('$tsl'), arguments: [StringLiteral('欢迎')] }
```

### AST 节点类型

| 节点类型 | 对应语法 |
|---------|---------|
| `Identifier` | 变量名、函数名 |
| `StringLiteral` | 字符串字面量 |
| `CallExpression` | 函数调用 |
| `MemberExpression` | 属性访问 |
| `TemplateLiteral` | 模板字符串 |

### 查询 AST

**需求**：找到所有 `$tsl(...)` 调用，提取第一个参数。

**伪代码**：

```
遍历 AST 中的所有 CallExpression 节点
  如果 callee.name === '$tsl'
    取 arguments[0]
    如果是 StringLiteral，提取 value
```

### 工具实现

使用 GoGoCode（类 jQuery 的 AST 操作库）：

```javascript
import $ from 'gogocode'

const ast = $(code)
const matches = ast.find('$tsl($_$)')

matches.each(node => {
  const text = node.match[0][0].value
  console.log('提取到:', text)
})
```

`$_$` 是通配符，匹配任意参数。

---

## 哈希生成：内容寻址

### 设计目标

1. **确定性**：相同输入 = 相同输出
2. **唯一性**：不同输入 = 不同输出（极低碰撞率）
3. **紧凑性**：输出长度可控

### 实现

```javascript
import { createHash } from 'crypto'

function generateKey(text: string, context?: string): string {
  const input = context ? `${text}::${context}` : text

  return createHash('sha256')
    .update(input)
    .digest('hex')
    .substring(0, 8)
}
```

**8 位十六进制 = 16^8 = 42 亿种可能。**

### 碰撞概率分析

根据生日悖论，n 个随机哈希在 k 位空间内的碰撞概率：

```
P(碰撞) ≈ n² / (2 × 2^(k×4))

n = 10000（文案数量）
k = 8（哈希位数）
P ≈ 10000² / (2 × 2³²) ≈ 0.001%
```

**可接受。如需更低碰撞率，增加哈希长度即可。**

---

## 核心流程

```javascript
async function extract(options: ExtractOptions) {
  const { include, output } = options
  const results = new Map<string, string>()

  // 1. 收集源文件
  const files = glob.sync(include)

  for (const file of files) {
    // 2. 读取源码
    const code = fs.readFileSync(file, 'utf-8')

    // 3. AST 查找
    const ast = $(code)
    const matches = ast.find('$tsl($_$)')

    // 4. 提取并哈希
    matches.each(node => {
      const text = node.match[0][0].value
      if (typeof text === 'string') {
        const key = generateKey(text)
        results.set(key, text)
      }
    })
  }

  // 5. 输出
  const json = Object.fromEntries(results)
  fs.writeFileSync(output, JSON.stringify(json, null, 2))
}
```

---

## 边界情况处理

### 动态参数

```javascript
$tsl(variable)  // 参数是变量，不是字面量
```

**处理策略**：跳过，并输出警告。动态内容应该用参数插值：

```javascript
// ❌ 不可提取
$tsl(`欢迎 ${name}`)

// ✅ 可提取
$tsl('欢迎 {name}', { name })
```

### 上下文参数

```javascript
$tsl('保存', { context: 'button' })
```

**处理**：提取第二个参数的 context 字段，加入哈希计算。

---

## 设计决策总结

| 决策 | 原因 |
|-----|------|
| 使用 AST 而非正则 | 操作语法结构，处理边界情况 |
| SHA-256 哈希 | 加密安全、分布均匀 |
| 8 位截断 | 平衡唯一性和可读性 |
| 跳过动态参数 | 无法静态分析的内容应使用插值 |

---

## 下一步

CLI 提取了文本，生成了翻译文件。接下来实现运行时翻译引擎：

👉 [04. Runtime 实现](./04-runtime-implementation.md)
