# 教程 1：Monorepo 架构设计

## 📚 本章目标

学习如何使用 pnpm + Turborepo + TypeScript 搭建现代化的 Monorepo 项目。

**学完本章，你将掌握**：
- pnpm Workspace 配置
- Turborepo 构建优化
- TypeScript 项目引用
- 包依赖管理策略

**预计时间**：1-1.5 小时

---

## 1. 为什么选择 Monorepo？

### 传统多仓库的痛点

```
传统方案：
@company/cli        → 独立仓库
@company/runtime    → 独立仓库
@company/vite-plugin → 独立仓库

问题：
❌ 版本管理困难
❌ 代码复用麻烦
❌ 联调效率低
❌ 依赖升级繁琐
```

### Monorepo 的优势

```
Monorepo 方案：
translink-i18n/
  ├── packages/cli/
  ├── packages/runtime/
  └── packages/vite-plugin/

优势：
✅ 统一版本管理
✅ 代码共享简单
✅ 原子化提交
✅ 依赖升级一次
```

---

## 2. 技术选型

### pnpm vs npm/yarn

| 特性 | pnpm | npm | yarn |
|------|------|-----|------|
| 磁盘空间 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 安装速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Workspace | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 严格性 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

**选择 pnpm 的原因**：
- 硬链接机制，节省磁盘空间
- 天然防止幽灵依赖
- Workspace 功能强大
- 性能最优

### Turborepo 构建优化

**为什么需要 Turborepo？**

```bash
# 传统方式：串行构建
pnpm --filter cli build
pnpm --filter runtime build
pnpm --filter vite-plugin build

# Turborepo：并行 + 缓存
turbo run build
# ✅ 并行构建
# ✅ 依赖拓扑排序
# ✅ 增量构建缓存
```

---

## 3. 项目结构设计

### 目录结构

```
translink-i18n/
├── packages/                   # 核心包
│   ├── cli/                    # CLI 工具
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsconfig.build.json
│   ├── runtime/                # 运行时
│   ├── vite-plugin/            # Vite 插件
│   └── plugins/                # 插件
│       └── vika/               # Vika 插件
│
├── apps/                       # 应用和示例
│   ├── docs/                   # 文档网站
│   └── playground/             # 示例项目
│       ├── vue-demo/
│       ├── react-demo/
│       └── javascript-demo/
│
├── tools/                      # 工具和配置
│   └── config/
│       └── tsup.config.base.ts
│
├── tests/                      # 集成测试
│   ├── integration/
│   └── e2e/
│
├── pnpm-workspace.yaml         # pnpm workspace 配置
├── turbo.json                  # Turborepo 配置
├── tsconfig.base.json          # 基础 TS 配置
├── tsconfig.json               # 根 TS 配置
└── package.json                # 根 package.json
```

### 设计原则

1. **packages/**: 可发布的 npm 包
2. **apps/**: 不发布的应用和示例
3. **tools/**: 共享配置和工具
4. **tests/**: 跨包的集成测试

---

## 4. pnpm Workspace 配置

### pnpm-workspace.yaml

```yaml
packages:
  # 核心包
  - 'packages/*'
  - 'packages/plugins/*'
  
  # 应用和示例
  - 'apps/*'
  - 'apps/playground/*'
  
  # 工具
  - 'tools/*'
```

**关键点**：
- 使用 glob 模式匹配包路径
- 支持嵌套包（plugins/*）
- 可以排除特定目录

### 根 package.json

```json
{
  "name": "translink-i18n",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "typescript": "^5.3.0"
  }
}
```

**关键点**：
- `"private": true` 防止误发布
- 使用 `turbo run` 执行任务
- 共享的 devDependencies

### 包的 package.json

```json
{
  "name": "@translink/i18n-cli",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/cli.js",
  "types": "./dist/cli.d.ts",
  "exports": {
    ".": {
      "types": "./dist/cli.d.ts",
      "import": "./dist/cli.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "commander": "^11.0.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  }
}
```

**关键点**：
- `"type": "module"` 使用 ESM
- `exports` 字段定义导出
- `files` 字段控制发布内容

---

## 5. Turborepo 配置

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "lib/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

### 关键概念

#### 1. 依赖拓扑（dependsOn）

```json
{
  "build": {
    "dependsOn": ["^build"]  // ^ 表示依赖包的 build 先执行
  }
}
```

**示例**：
```
vite-plugin 依赖 runtime
→ 执行 vite-plugin:build 前
→ 先执行 runtime:build
```

#### 2. 缓存（outputs）

```json
{
  "build": {
    "outputs": ["dist/**"]  // 缓存 dist 目录
  }
}
```

**效果**：
- 首次构建：正常执行
- 二次构建（无变更）：使用缓存，秒级完成

#### 3. 持久任务（persistent）

```json
{
  "dev": {
    "cache": false,
    "persistent": true  // 长期运行的任务
  }
}
```

**用于**：
- 开发服务器
- Watch 模式

---

## 6. TypeScript 配置

### 三层配置结构

```
tsconfig.base.json     ← 基础配置（编译选项）
  ↓
tsconfig.json          ← 根配置（项目引用）
  ↓
packages/*/tsconfig.json  ← 包配置（继承 + 自定义）
```

### tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true
  }
}
```

**关键选项**：
- `composite: true` - 启用项目引用
- `declaration: true` - 生成 .d.ts
- `strict: true` - 严格模式

### 根 tsconfig.json

```json
{
  "files": [],
  "references": [
    { "path": "./packages/cli" },
    { "path": "./packages/runtime" },
    { "path": "./packages/vite-plugin" },
    { "path": "./packages/plugins/vika" }
  ]
}
```

**作用**：
- 定义包之间的引用关系
- 支持增量编译
- IDE 智能提示

### 包的 tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "noEmit": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 包的 tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "declarationMap": true
  },
  "exclude": ["**/*.test.ts", "**/__tests__/**"]
}
```

**分离原因**：
- `tsconfig.json` - 开发时类型检查（noEmit: true）
- `tsconfig.build.json` - 构建时生成文件

---

## 7. 包依赖管理

### Workspace 协议

```json
{
  "name": "@translink/vite-plugin-i18n",
  "dependencies": {
    "@translink/i18n-runtime": "workspace:*"
  }
}
```

**优势**：
- 始终使用本地最新版本
- 避免版本不一致
- 发布时自动替换为实际版本

### 依赖类型选择

```json
{
  "dependencies": {
    // 运行时依赖
    "gogocode": "^1.0.55"
  },
  "devDependencies": {
    // 开发时依赖
    "typescript": "^5.3.0",
    "tsup": "^8.0.0"
  },
  "peerDependencies": {
    // 宿主提供的依赖
    "vite": "^4.0.0 || ^5.0.0"
  },
  "optionalDependencies": {
    // 可选依赖
    "sharp": "^0.32.0"
  }
}
```

### 避免幽灵依赖

**幽灵依赖示例**：

```typescript
// 错误：使用了未声明的依赖
import axios from 'axios'; // axios 只在其他包中安装

// 正确：明确声明依赖
// package.json 中添加 "axios": "^1.0.0"
```

**pnpm 的防护**：
- 严格的 node_modules 结构
- 只能访问声明的依赖
- 编译时报错，而不是运行时

---

## 8. 构建脚本优化

### 并行构建

```json
{
  "scripts": {
    "build": "turbo run build",
    "build:cli": "turbo run build --filter=@translink/i18n-cli",
    "build:runtime": "turbo run build --filter=@translink/i18n-runtime"
  }
}
```

### 增量构建

```bash
# 首次构建
$ turbo run build
✓ @translink/runtime:build: 2.5s
✓ @translink/cli:build: 3.1s
✓ @translink/vite-plugin:build: 1.8s

# 无变更，使用缓存
$ turbo run build
✓ @translink/runtime:build: CACHED
✓ @translink/cli:build: CACHED
✓ @translink/vite-plugin:build: CACHED
```

### 选择性构建

```bash
# 只构建变更的包及其依赖者
turbo run build --filter=...[origin/main]

# 只构建 CLI 及其依赖
turbo run build --filter=@translink/i18n-cli...
```

---

## 9. 实践：创建新包

### 步骤 1：创建包目录

```bash
mkdir -p packages/my-plugin/src
cd packages/my-plugin
```

### 步骤 2：初始化 package.json

```bash
pnpm init
```

```json
{
  "name": "@translink/my-plugin",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "@translink/i18n-cli": "workspace:*"
  },
  "devDependencies": {
    "tsup": "workspace:*",
    "typescript": "workspace:*"
  }
}
```

### 步骤 3：配置 TypeScript

**tsconfig.json**:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "noEmit": true
  },
  "include": ["src/**/*"]
}
```

**tsconfig.build.json**:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false
  }
}
```

### 步骤 4：配置构建工具

**tsup.config.ts**:
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

### 步骤 5：编写代码

**src/index.ts**:
```typescript
export const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
};
```

### 步骤 6：更新根配置

**tsconfig.json**:
```json
{
  "references": [
    // ... 其他包
    { "path": "./packages/my-plugin" }
  ]
}
```

### 步骤 7：安装依赖并构建

```bash
# 回到根目录
cd ../..

# 安装依赖
pnpm install

# 构建
turbo run build --filter=@translink/my-plugin
```

---

## 10. 常见问题

### Q1: 为什么用 tsup 而不是 tsc？

**回答**：

| 特性 | tsup | tsc |
|------|------|-----|
| 速度 | ⚡⚡⚡⚡⚡ (esbuild) | ⚡⚡ |
| 配置 | 简单 | 复杂 |
| 打包 | 支持 | 不支持 |
| Tree-shaking | 支持 | 不支持 |

```typescript
// tsup 一行配置
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
});

// vs tsc 需要复杂配置 + Rollup/Webpack
```

### Q2: workspace:* 和具体版本的区别？

**workspace:***:
```json
"dependencies": {
  "@translink/runtime": "workspace:*"
}
```
- 开发时：链接到本地最新代码
- 发布时：自动替换为实际版本（如 1.0.0）

**具体版本**:
```json
"dependencies": {
  "@translink/runtime": "^1.0.0"
}
```
- 始终使用 npm 发布的版本
- 本地开发不便

### Q3: 如何处理循环依赖？

**检测循环依赖**：

```bash
# 使用 madge 检测
npx madge --circular packages/**/src
```

**解决方案**：
1. **提取共享代码** - 创建独立的 shared 包
2. **接口抽象** - 使用依赖注入
3. **重新设计** - 调整包的职责划分

---

## 11. 最佳实践

### ✅ DO

1. **使用 workspace 协议**
   ```json
   "@translink/runtime": "workspace:*"
   ```

2. **明确声明依赖**
   ```json
   "dependencies": {
     "commander": "^11.0.0"  // 不要依赖幽灵依赖
   }
   ```

3. **分离配置文件**
   - `tsconfig.json` - 类型检查
   - `tsconfig.build.json` - 构建

4. **利用 Turborepo 缓存**
   ```json
   "outputs": ["dist/**"]
   ```

### ❌ DON'T

1. **不要在包之间创建循环依赖**
   ```
   ❌ cli → runtime → cli
   ```

2. **不要在 devDependencies 中放运行时依赖**
   ```json
   ❌ "devDependencies": {
        "axios": "^1.0.0"  // 运行时需要
      }
   ```

3. **不要忽略 TypeScript 错误**
   ```bash
   ❌ tsc --noEmit || true
   ✅ tsc --noEmit
   ```

---

## 12. 小结

本章学习了：

✅ **Monorepo 的优势** - 统一管理、代码共享、原子提交  
✅ **pnpm Workspace** - workspace协议、严格依赖  
✅ **Turborepo** - 并行构建、增量缓存、依赖拓扑  
✅ **TypeScript 配置** - 项目引用、分离配置  
✅ **包依赖管理** - 避免幽灵依赖、合理使用 workspace

### 下一步

掌握了 Monorepo 架构后，接下来学习：

👉 [教程 2：CLI 工具开发](./02-cli-development.md) - 学习如何开发命令行工具

---

## 📚 扩展阅读

- [pnpm Workspace 文档](https://pnpm.io/workspaces)
- [Turborepo 手册](https://turbo.build/repo/docs)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Monorepo 最佳实践](https://monorepo.tools/)

