# Monorepo 架构：多包工程的组织策略

> **Monorepo 不是把代码放在一起，而是让多个包作为一个整体进行版本控制和发布。**

方案设计确定了三个包：CLI、Runtime、Vite Plugin。本章解决它们的组织方式。

---

## 问题空间

### Multi-repo vs Monorepo

**Multi-repo**（多仓库）：

```
github.com/translink/i18n-cli
github.com/translink/i18n-runtime
github.com/translink/vite-plugin-i18n
```

**Monorepo**（单仓库多包）：

```
translink-i18n/
├── packages/
│   ├── cli/
│   ├── runtime/
│   └── vite-plugin/
└── package.json
```

### Multi-repo 的痛点

**跨包修改的开发体验**：

假设需要同时修改 Runtime 和 Vite Plugin：

```
Multi-repo 流程：
1. 修改 runtime 仓库
2. 发布 runtime@0.1.1
3. 切换到 vite-plugin 仓库
4. 更新依赖版本
5. 修改 vite-plugin
6. 本地测试... 发现 runtime 有 bug
7. 切回 runtime 修复
8. 重复步骤 2-6
```

**一个跨包 Bug，来回切换 N 次仓库。**

**版本一致性问题**：

```
runtime: 0.1.0, 0.1.1, 0.1.2, 0.2.0, 0.2.1...
cli 依赖 runtime@0.1.x
vite-plugin 依赖 runtime@0.2.x

用户同时使用 cli 和 vite-plugin：
→ 安装了两个版本的 runtime
→ 潜在的运行时冲突
```

---

## Monorepo 的核心挑战

选择 Monorepo 后，需要解决三个工程问题：

### 挑战一：包间依赖管理

Vite Plugin 依赖 Runtime。版本号写什么？

```json
{
  "dependencies": {
    "@translink/i18n-runtime": "???"
  }
}
```

**解决方案：Workspace Protocol**

```json
{
  "dependencies": {
    "@translink/i18n-runtime": "workspace:*"
  }
}
```

| 阶段 | workspace:* 的行为 |
|-----|-------------------|
| 开发时 | 链接到本地源码 |
| 发布时 | 替换为实际版本号 |

**开发时享受 Monorepo 便利，发布时输出正确的版本依赖。**

### 挑战二：构建顺序

三个包有依赖关系：

```
vite-plugin → runtime
cli → runtime（可能）
runtime → 无依赖
```

并行构建时，vite-plugin 构建时 runtime 可能还未完成。

**解决方案：拓扑排序**

根据依赖图计算构建顺序：

```
Level 0: runtime（无依赖）
Level 1: cli, vite-plugin（依赖 runtime）
```

先构建 Level 0，再并行构建 Level 1。

### 挑战三：增量构建

10 个包的仓库，只改了 1 个，全部重建太慢。

**解决方案：基于内容哈希的缓存**

```
输入哈希 = hash(源码 + 依赖版本 + 构建配置)

if (输入哈希 === 上次构建的输入哈希) {
  使用缓存产物
} else {
  重新构建
}
```

---

## 工具选型

### pnpm：包管理器

**为什么不用 npm/yarn？**

npm/yarn 的 node_modules 是**扁平结构**：

```
node_modules/
├── axios/           # 被 cli 依赖
├── vue/             # 被 runtime 依赖
└── lodash/          # 被 axios 传递依赖
```

**问题**：cli 可以 `import 'vue'`（幽灵依赖）——本地正常，发布后报错。

**pnpm 的隔离结构**：

```
node_modules/
├── .pnpm/
│   ├── axios@1.0.0/
│   └── vue@3.0.0/
└── axios → .pnpm/axios@1.0.0/  # 只有声明的依赖有符号链接
```

**cli 无法访问未声明的 vue，问题在开发时暴露。**

### Turborepo：任务编排

**能力矩阵**：

| 能力 | 说明 |
|-----|------|
| 依赖图分析 | 自动识别包间依赖关系 |
| 拓扑排序执行 | 按正确顺序构建 |
| 并行执行 | 无依赖的任务同时运行 |
| 增量缓存 | 未修改的包直接用缓存 |
| 远程缓存 | CI 之间共享构建缓存 |

---

## 配置详解

### pnpm-workspace.yaml

定义 workspace 包含的路径：

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### turbo.json

定义任务依赖和缓存策略：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**关键配置解释**：

| 配置 | 含义 |
|-----|------|
| `"dependsOn": ["^build"]` | 构建前先构建依赖的包（`^` 表示依赖） |
| `"outputs": ["dist/**"]` | 指定构建产物，用于缓存判断 |
| `"cache": false` | 禁用缓存（用于 watch 模式） |
| `"persistent": true` | 长时间运行的任务（如 dev server） |

### TypeScript Project References

让 IDE 正确识别跨包类型：

```json
// 根 tsconfig.json
{
  "references": [
    { "path": "./packages/cli" },
    { "path": "./packages/runtime" },
    { "path": "./packages/vite-plugin" }
  ]
}
```

```json
// packages/vite-plugin/tsconfig.json
{
  "references": [
    { "path": "../runtime" }
  ]
}
```

---

## 开发工作流

```bash
# 安装所有依赖
pnpm install

# 构建所有包
turbo run build

# 只构建特定包及其依赖
turbo run build --filter=@translink/vite-plugin-i18n...

# 开发模式（watch）
turbo run dev

# 只构建有变更的包
turbo run build --filter=...[origin/main]
```

---

## 设计决策总结

| 决策 | 原因 |
|-----|------|
| 选择 Monorepo | 简化跨包开发、保证版本一致性 |
| 使用 pnpm | 严格依赖隔离、节省磁盘空间 |
| 使用 Turborepo | 自动化拓扑排序和增量缓存 |
| workspace:* 协议 | 开发用本地代码、发布用版本号 |

---

## 下一步

基础设施就绪，开始实现核心功能。首先是 CLI 的文本提取：

👉 [03. CLI 开发](./03-cli-development.md)
