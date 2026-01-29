# 贡献指南

> **欢迎参与 TransLink I18n 的开发！**

---

## 🤝 如何贡献

### 报告问题

发现 Bug 或有功能建议？请提交 Issue：

1. 搜索 [已有 Issues](https://github.com/lynncen/translink-i18n/issues)，确认问题未被报告
2. 创建 [新 Issue](https://github.com/lynncen/translink-i18n/issues/new)
3. 使用清晰的标题和详细描述
4. 提供复现步骤和环境信息

### 提交代码

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 🛠️ 开发环境

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/lynncen/translink-i18n.git
cd translink-i18n

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 运行测试
pnpm test
```

### 开发命令

```bash
# 开发模式（监听变化）
pnpm dev

# 运行特定包的测试
pnpm --filter @translink/i18n-cli test

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

---

## 📁 项目结构

```
translink-i18n/
├── packages/
│   ├── cli/           # CLI 工具
│   ├── runtime/       # 运行时库
│   ├── vite-plugin/   # Vite 插件
│   └── plugins/       # 扩展插件
│       └── vika/
├── apps/
│   └── playground/    # 示例项目
│       ├── vue-demo/
│       └── react-demo/
├── docs/              # 文档
└── tests/             # 集成测试
```

---

## 📝 代码规范

### TypeScript

- 使用 TypeScript 编写所有代码
- 启用 `strict` 模式
- 避免使用 `any` 类型

### 命名规范

```typescript
// 类名：PascalCase
class I18nEngine {}

// 函数名：camelCase
function translateText() {}

// 常量：UPPER_SNAKE_CASE
const DEFAULT_LANGUAGE = 'zh-CN';

// 文件名：kebab-case
// i18n-engine.ts
```

### 注释规范

```typescript
/**
 * 翻译指定的文本
 * @param key - 翻译键
 * @param params - 插值参数
 * @returns 翻译后的文本
 */
function translate(key: string, params?: Record<string, any>): string {
  // ...
}
```

---

## ✅ 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Type 类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式 |
| `refactor` | 重构 |
| `test` | 测试 |
| `chore` | 构建/工具 |

### 示例

```
feat(cli): add AI translation command

- Support DeepSeek, OpenAI, Gemini providers
- Add batch translation optimization
- Implement translation cache

Closes #123
```

---

## 🧪 测试要求

### 单元测试

- 新功能必须包含测试
- 测试覆盖率目标 >= 80%

```typescript
// packages/cli/tests/hash-generator.test.ts
describe('HashGenerator', () => {
  it('should generate consistent hash for same text', () => {
    const generator = new HashGenerator({ length: 8 });
    const hash1 = generator.generate('你好');
    const hash2 = generator.generate('你好');
    expect(hash1).toBe(hash2);
  });
});
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定包测试
pnpm --filter @translink/i18n-cli test

# 查看覆盖率
pnpm test:coverage
```

---

## 📖 文档贡献

### 文档结构

```
docs/
├── 1-getting-started/   # 快速入门
├── 2-user-guide/        # 使用指南
├── 3-tutorials/         # 深度教学
├── 4-api-reference/     # API 参考
├── 5-troubleshooting/   # 问题排查
└── appendix/            # 附录
```

### 文档规范

- 使用清晰的标题层级
- 提供代码示例
- 保持中文文档为主

---

## 🎉 贡献者

感谢所有贡献者！

<!-- 贡献者列表将自动更新 -->

---

## 📜 许可证

贡献的代码将采用 [MIT 许可证](../../LICENSE)。

---

## 💬 联系方式

- GitHub Issues：[问题反馈](https://github.com/lynncen/translink-i18n/issues)
- GitHub Discussions：[讨论区](https://github.com/lynncen/translink-i18n/discussions)

---

> 感谢你的贡献！每一个 Issue、PR 和建议都让 TransLink I18n 变得更好。
