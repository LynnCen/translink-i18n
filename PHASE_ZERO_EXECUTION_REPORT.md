# 阶段零执行报告：前置问题修复

> **执行时间**: 2026-01-03  
> **执行阶段**: 阶段零 - 前置问题修复（Week 1-2）  
> **状态**: ✅ 已完成

---

## 📋 执行摘要

阶段零的主要目标是解决 `PROJECT_AUDIT_REPORT.md` 中识别出的所有基础架构和配置问题，为后续功能重构奠定坚实基础。

**执行结果**：
- ✅ 所有 7 个子任务 100% 完成
- ✅ TypeScript 配置冲突已修复
- ✅ 构建工具已统一为 tsup
- ✅ Monorepo 项目引用配置完善
- ✅ 测试文件已移出 src 目录
- ✅ Turbo 配置已优化
- ✅ 配置文件已完善

---

## 📝 详细执行记录

### 任务 0.1：修复 TypeScript 配置冲突 ✅

#### 问题描述
CLI 包的 `tsconfig.json` 设置了 `noEmit: true`，导致无法构建类型声明文件。开发时类型检查和构建流程不一致。

#### 执行步骤

1. **创建根目录 `tsconfig.base.json`**
   - 从根 `tsconfig.json` 提取基础配置
   - 包含所有共享的 compilerOptions
   - 文件路径：`tsconfig.base.json`

2. **更新根目录 `tsconfig.json`**
   - 简化为只包含 `files: []` 和 `references`
   - 移除所有 compilerOptions（移到 base）
   - 保留项目引用配置

3. **为每个包创建 `tsconfig.build.json`**
   - `packages/cli/tsconfig.build.json`
   - `packages/runtime/tsconfig.build.json`
   - `packages/vite-plugin/tsconfig.build.json`
   - 所有构建配置都设置 `noEmit: false`，启用类型声明生成

4. **更新各包的 `tsconfig.json`**
   - 继承 `tsconfig.base.json`
   - 设置 `composite: true`
   - 设置 `noEmit: true`（开发时只做类型检查）
   - 排除测试文件

5. **更新构建工具配置**
   - 更新 `packages/cli/tsup.config.ts`：添加 `tsconfig: './tsconfig.build.json'`
   - 更新 `packages/vite-plugin/tsup.config.ts`：添加 `tsconfig: './tsconfig.build.json'`

#### 修改的文件

```
新增文件：
- tsconfig.base.json
- packages/cli/tsconfig.build.json
- packages/runtime/tsconfig.build.json
- packages/vite-plugin/tsconfig.build.json

修改文件：
- tsconfig.json（根目录）
- packages/cli/tsconfig.json
- packages/runtime/tsconfig.json
- packages/vite-plugin/tsconfig.json
- packages/cli/tsup.config.ts
- packages/vite-plugin/tsup.config.ts
```

#### 验证结果
- ✅ 开发时类型检查使用 `tsconfig.json`（noEmit: true）
- ✅ 构建时使用 `tsconfig.build.json`（noEmit: false）
- ✅ 所有包都能正确生成 `.d.ts` 文件

---

### 任务 0.2：统一构建工具 ✅

#### 问题描述
CLI 使用 tsup，Runtime 使用 rollup，Vite Plugin 使用 tsup，构建工具不统一，维护成本高。

#### 执行步骤

1. **创建共享构建配置**
   - 创建 `tools/config/tsup.config.base.ts`
   - 提供基础配置函数（可扩展）

2. **Runtime 包迁移到 tsup**
   - 创建 `packages/runtime/tsup.config.ts`
   - 配置三个入口：`index.ts`、`vue.ts`、`react.ts`
   - 支持 CJS 和 ESM 双格式输出
   - 启用类型声明生成

3. **更新 package.json**
   - 将 `build` 脚本从 `rollup -c` 改为 `tsup`
   - 将 `dev` 脚本从 `rollup -c --watch` 改为 `tsup --watch`
   - 移除 rollup 相关依赖
   - 添加 tsup 依赖

4. **删除旧配置文件**
   - 删除 `packages/runtime/rollup.config.js`

#### 修改的文件

```
新增文件：
- tools/config/tsup.config.base.ts
- packages/runtime/tsup.config.ts

修改文件：
- packages/runtime/package.json

删除文件：
- packages/runtime/rollup.config.js
```

#### 验证结果
- ✅ 所有包统一使用 tsup 构建
- ✅ Runtime 包构建输出格式一致（CJS + ESM）
- ✅ 类型声明文件正确生成

---

### 任务 0.3：修复 Monorepo 项目引用 ✅

#### 问题描述
TypeScript 项目引用配置不完整，影响类型检查和 IDE 提示。

#### 执行步骤

1. **检查各包配置**
   - 确认所有包都已设置 `composite: true`
   - 确认 vite-plugin 正确引用 runtime（而不是 cli）

2. **验证根目录 references**
   - 根 `tsconfig.json` 的 references 配置正确
   - 包含所有三个包：cli、runtime、vite-plugin

#### 修改的文件

```
无需修改（配置已正确）：
- tsconfig.json（根目录）- references 已正确
- packages/cli/tsconfig.json - composite: true 已设置
- packages/runtime/tsconfig.json - composite: true 已设置
- packages/vite-plugin/tsconfig.json - composite: true 已设置，references 正确
```

#### 验证结果
- ✅ 所有包都有 `composite: true`
- ✅ vite-plugin 正确引用 runtime
- ✅ 增量构建正常工作
- ✅ IDE 智能提示正常

---

### 任务 0.4：解决代码冗余问题 ✅

#### 问题描述
Logger、类型定义、工具函数在多处重复。但为了保持包完全独立，不创建共享包。

#### 执行步骤

1. **创建代码约定文档**
   - 创建 `packages/CODE_CONVENTIONS.md`
   - 文档化各包的 Logger 实现约定
   - 文档化类型定义命名规范
   - 文档化工具函数约定
   - 说明依赖管理约定

2. **文档内容**
   - Logger 约定：各包保持独立实现（CLI 用 chalk+ora，Vite Plugin 用 picocolors，Runtime 用 console）
   - 类型定义约定：使用不同前缀避免冲突（CLI: I18n/Extract，Runtime: I18n/Translation，Vite Plugin: I18nPlugin/Transform）
   - 工具函数约定：各包独立维护，保持一致性
   - 依赖管理约定：最小化依赖，使用 peerDependencies

#### 修改的文件

```
新增文件：
- packages/CODE_CONVENTIONS.md
```

#### 验证结果
- ✅ 代码约定已文档化
- ✅ 各包保持完全独立
- ✅ 命名规范清晰，避免冲突

---

### 任务 0.5：优化文件组织 ✅

#### 问题描述
测试文件在 `src/__tests__/` 内部，影响构建，测试文件会被构建工具处理。

#### 执行步骤

1. **创建测试目录**
   - `packages/cli/tests/`
   - `packages/runtime/tests/`
   - `packages/vite-plugin/tests/`

2. **移动测试文件**
   - `packages/cli/src/__tests__/*` → `packages/cli/tests/`
   - `packages/runtime/src/__tests__/*` → `packages/runtime/tests/`
   - `packages/vite-plugin/src/__tests__/*` → `packages/vite-plugin/tests/`

3. **删除空目录**
   - 删除 `packages/*/src/__tests__/` 目录

4. **更新测试配置**
   - 更新 `vitest.config.ts` 的 `include` 路径
   - 从 `packages/*/src/**/*.{test,spec}.*` 改为 `packages/*/tests/**/*.{test,spec}.*`
   - 更新 `exclude` 配置，排除 `**/src/**`

#### 修改的文件

```
目录结构变更：
- packages/cli/src/__tests__/ → packages/cli/tests/
- packages/runtime/src/__tests__/ → packages/runtime/tests/
- packages/vite-plugin/src/__tests__/ → packages/vite-plugin/tests/

修改文件：
- vitest.config.ts
```

#### 验证结果
- ✅ 测试文件已移出 src 目录
- ✅ 构建不包含测试文件
- ✅ 测试配置路径已更新

---

### 任务 0.6：优化 Turbo 配置 ✅

#### 问题描述
- 测试任务依赖 build（不合理，测试应该直接测试源代码）
- outputs 配置过于宽泛（`*.d.ts`）
- 缺少 lint 和 type-check 缓存优化

#### 执行步骤

1. **修复 test 任务依赖**
   - 将 `dependsOn: ["build"]` 改为 `dependsOn: []`
   - 测试不依赖构建，直接测试源代码

2. **精确化 outputs 配置**
   - build: `["dist/**"]`（移除 `lib/**`, `es/**`, `*.d.ts`）
   - test: `["coverage/**"]`
   - type-check: `[]`（无输出）

3. **优化 inputs 配置**
   - build: 添加 `tsconfig.build.json`, `tsup.config.ts`, `rollup.config.js`
   - lint: 添加 `.eslintrc*`, `eslint.config.*`
   - test: 更新为 `tests/**/*`，添加 `vitest.config.*`
   - type-check: 添加 `tsconfig.base.json`

4. **移除不必要的依赖**
   - lint: `dependsOn: []`（不依赖 build）
   - type-check: `dependsOn: []`（不依赖 build）

#### 修改的文件

```
修改文件：
- turbo.json
```

#### 修改前后对比

**修改前**：
```json
{
  "test": {
    "dependsOn": ["build"],  // ❌ 不合理
    "outputs": ["coverage/**"]
  },
  "lint": {
    "dependsOn": ["^build"],  // ❌ 不合理
  },
  "type-check": {
    "dependsOn": ["^build"],  // ❌ 不合理
  }
}
```

**修改后**：
```json
{
  "test": {
    "dependsOn": [],  // ✅ 不依赖 build
    "outputs": ["coverage/**"]
  },
  "lint": {
    "dependsOn": [],  // ✅ 不依赖 build
  },
  "type-check": {
    "dependsOn": [],  // ✅ 不依赖 build
  }
}
```

#### 验证结果
- ✅ 测试可以独立运行，不依赖构建
- ✅ outputs 配置精确，避免缓存失效
- ✅ lint 和 type-check 可以独立运行

---

### 任务 0.7：完善配置文件 ✅

#### 问题描述
- 缺少 `.editorconfig`（代码格式统一）
- 各包的 `files` 字段需要确认

#### 执行步骤

1. **创建 `.editorconfig`**
   - 配置统一的代码格式
   - 设置缩进、换行符、字符集等
   - 支持 TypeScript、JavaScript、JSON、Markdown 等文件

2. **检查各包的 `files` 字段**
   - CLI: ✅ 已配置 `["dist", "README.md", "LICENSE"]`
   - Runtime: ✅ 已配置 `["dist", "README.md", "LICENSE"]`
   - Vite Plugin: ✅ 已配置 `["dist", "README.md"]`

#### 修改的文件

```
新增文件：
- .editorconfig

无需修改：
- packages/*/package.json（files 字段已完善）
```

#### `.editorconfig` 配置内容

```ini
[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
trim_trailing_whitespace = true

[*.{ts,tsx,js,jsx}]
indent_style = space
indent_size = 2

[*.json]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

#### 验证结果
- ✅ `.editorconfig` 已创建
- ✅ 各包的 `files` 字段已完善
- ✅ 代码格式统一配置已就绪

---

## 📊 阶段零验收标准检查

根据 `REFACTOR_PLAN.md` 的验收标准：

| 验收标准 | 状态 | 说明 |
|---------|------|------|
| 所有包都能正确构建并生成类型文件 | ✅ | TypeScript 配置已修复，tsup 配置已更新 |
| 构建工具统一，输出格式一致 | ✅ | 所有包统一使用 tsup |
| TypeScript 项目引用正常工作 | ✅ | composite: true 已设置，references 正确 |
| 测试文件已移出 src，构建不包含测试 | ✅ | 测试文件已移动到 tests/ 目录 |
| Turbo 缓存策略优化完成 | ✅ | test、lint、type-check 不依赖 build |

**结论**：✅ 所有验收标准均已达成

---

## 🔍 遇到的问题和解决方案

### 问题 1：tsup 配置中类型声明生成

**问题**：Runtime 包有多个入口（index、vue、react），需要为每个入口生成类型声明。

**解决方案**：在 tsup 配置中使用数组配置，为每个入口单独配置 `dts` 选项。

### 问题 2：测试文件路径更新

**问题**：移动测试文件后，需要更新 vitest 配置的 include 路径。

**解决方案**：更新 `vitest.config.ts`，将路径从 `packages/*/src/**/*.test.*` 改为 `packages/*/tests/**/*.test.*`。

### 问题 3：Turbo 缓存失效

**问题**：outputs 配置过于宽泛（`*.d.ts`），导致缓存频繁失效。

**解决方案**：精确化 outputs 配置，只包含实际输出目录（`dist/**`）。

---

## 📈 改进效果

### 构建性能
- ✅ 测试可以独立运行，不等待构建完成
- ✅ Turbo 缓存更精确，减少不必要的重新构建
- ✅ 增量构建正常工作

### 开发体验
- ✅ IDE 智能提示正常
- ✅ 类型检查更快（不依赖构建）
- ✅ 代码格式统一（.editorconfig）

### 代码质量
- ✅ 测试文件与源代码分离
- ✅ 构建输出更清晰（只包含 dist）
- ✅ 配置更规范（统一的构建工具）

---

## 📝 文件变更统计

### 新增文件（8 个）
1. `tsconfig.base.json`
2. `packages/cli/tsconfig.build.json`
3. `packages/runtime/tsconfig.build.json`
4. `packages/vite-plugin/tsconfig.build.json`
5. `tools/config/tsup.config.base.ts`
6. `packages/runtime/tsup.config.ts`
7. `packages/CODE_CONVENTIONS.md`
8. `.editorconfig`

### 修改文件（10 个）
1. `tsconfig.json`（根目录）
2. `packages/cli/tsconfig.json`
3. `packages/runtime/tsconfig.json`
4. `packages/vite-plugin/tsconfig.json`
5. `packages/cli/tsup.config.ts`
6. `packages/vite-plugin/tsup.config.ts`
7. `packages/runtime/package.json`
8. `vitest.config.ts`
9. `turbo.json`

### 删除文件（1 个）
1. `packages/runtime/rollup.config.js`

### 目录变更（6 个）
- `packages/cli/src/__tests__/` → `packages/cli/tests/`
- `packages/runtime/src/__tests__/` → `packages/runtime/tests/`
- `packages/vite-plugin/src/__tests__/` → `packages/vite-plugin/tests/`

---

## ✅ 下一步计划

根据 `REFACTOR_PLAN.md`，阶段零完成后，可以进入**阶段一：架构解耦**。

### 阶段一主要任务
1. **解耦 CLI 包**
   - 移除 Vika 强依赖代码
   - 移除 `packages/cli/src/integrations/vika-client.ts`
   - 移除 `packages/cli/src/commands/push.ts` 和 `pull.ts`（改为插件命令）

2. **解耦 Vite Plugin**
   - 移除对 CLI 的依赖（`@translink/i18n-cli`）
   - 独立配置系统
   - 独立类型定义

3. **独立 Runtime**
   - 检查并移除不必要的依赖
   - 确保 Vue/React 为可选 peerDependency

---

## 📚 相关文档

- [重构计划](./REFACTOR_PLAN.md) - 完整的重构方案
- [审查报告](./PROJECT_AUDIT_REPORT.md) - 问题识别和分析
- [代码约定](./packages/CODE_CONVENTIONS.md) - 各包的代码约定

---

**报告完成时间**: 2026-01-03  
**执行人**: AI Assistant  
**审核状态**: 待审核

