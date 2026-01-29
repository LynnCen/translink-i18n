# Excel 工作流完整指南

> 本指南详细介绍如何使用 TransLink I18n 的 Excel 导出/导入功能进行翻译管理，非常适合团队协作和运营人员参与的场景。

---

## 📖 目录

- [为什么使用 Excel 工作流](#为什么使用-excel-工作流)
- [快速开始](#快速开始)
- [Excel 文件结构](#excel-文件结构)
- [完整工作流程](#完整工作流程)
- [高级用法](#高级用法)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 为什么使用 Excel 工作流？

### 优势

✅ **运营友好**: 运营和翻译人员无需了解代码，可以直接在 Excel 中编辑  
✅ **离线工作**: 无需联网，可以随时随地编辑翻译  
✅ **批量操作**: 支持 Excel 的筛选、排序、查找替换等强大功能  
✅ **版本控制**: Excel 文件可以通过 Git 管理，方便追踪修改历史  
✅ **易于审核**: 可以使用 Excel 的批注功能进行审核和反馈  
✅ **成本低**: 无需付费的翻译管理平台

### 适用场景

- 团队协作翻译项目
- 需要运营人员参与翻译
- 离线翻译场景
- 预算有限的项目
- 翻译量较大需要批量处理

---

## 快速开始

### 前提条件

1. 已安装 TransLink I18n CLI:

```bash
npm install -D @translink/i18n-cli
```

2. 项目已初始化:

```bash
npx translink init
```

### 5 分钟上手

#### 步骤 1: 提取文本

```bash
npx translink extract
```

这会扫描你的代码，提取所有中文文本到 `locales/zh-CN.json`。

#### 步骤 2: 导出 Excel

```bash
npx translink export --format excel --output translations.xlsx
```

生成 `translations.xlsx` 文件，包含所有待翻译的文本。

#### 步骤 3: 编辑翻译

使用 Excel、WPS 或 Google Sheets 打开 `translations.xlsx`，填写各语言列的翻译。

#### 步骤 4: 导入翻译

```bash
npx translink import --input translations.xlsx
```

将 Excel 中的翻译更新到 JSON 文件。

#### 步骤 5: 构建

```bash
npx translink build
```

生成最终的翻译文件。

---

## Excel 文件结构

### 工作表

导出的 Excel 文件包含两个工作表：

1. **Translations** (翻译表) - 主要工作表
2. **Metadata** (元数据表) - 项目信息

### Translations 表结构

| 列名    | 说明             | 是否必填 | 示例          |
| ------- | ---------------- | -------- | ------------- |
| key     | 翻译键（哈希值） | ✅ 是    | `a1b2c3d4`    |
| zh-CN   | 中文（原文）     | ✅ 是    | `欢迎使用`    |
| en-US   | 英文翻译         | ⚠️ 建议  | `Welcome`     |
| ja-JP   | 日文翻译         | ⚠️ 建议  | `ようこそ`    |
| ...     | 其他语言         | ⚠️ 建议  | ...           |
| context | 上下文           | ❌ 否    | `按钮文本`    |
| file    | 文件路径         | ❌ 否    | `src/App.vue` |
| line    | 行号             | ❌ 否    | `42`          |
| status  | 状态             | ❌ 否    | `pending`     |

### 示例

| key      | zh-CN    | en-US    | ja-JP      | context  | file          | line | status     |
| -------- | -------- | -------- | ---------- | -------- | ------------- | ---- | ---------- |
| a1b2c3d4 | 欢迎使用 | Welcome  | ようこそ   | 标题     | src/App.vue   | 10   | pending    |
| e5f6g7h8 | 用户名   | Username | ユーザー名 | 表单标签 | src/Login.vue | 25   | pending    |
| i9j0k1l2 | 提交     | Submit   | 送信       | 按钮     | src/Form.vue  | 50   | translated |

### 状态说明

- `pending` - 待翻译
- `translated` - 已翻译
- `reviewed` - 已审核
- `approved` - 已批准

---

## 完整工作流程

### 开发阶段

#### 1. 编写代码时使用翻译函数

```vue
<template>
  <div>
    <h1>{{ $tsl('欢迎使用 TransLink I18n') }}</h1>
    <p>{{ $t('hello', { name: '张三' }) }}</p>
  </div>
</template>
```

#### 2. 定期提取新增文本

```bash
# 提取新增的文本
npx translink extract

# 查看提取结果
cat locales/zh-CN.json
```

#### 3. 导出 Excel（包含新增文本）

```bash
# 导出为 Excel
npx translink export --format excel --output translations.xlsx

# 或导出为 CSV（更轻量）
npx translink export --format csv --output translations.csv
```

### 翻译阶段

#### 1. 分发 Excel 文件

将 `translations.xlsx` 发送给翻译团队或运营人员。

#### 2. 翻译人员编辑

**推荐工作流程**：

1. **筛选待翻译项**:
   - 使用 Excel 的筛选功能
   - 筛选 `status = pending` 的行
   - 或筛选翻译列为空的行

2. **填写翻译**:
   - 按行填写各语言列的翻译
   - 参考 `context`、`file`、`line` 列理解上下文

3. **标记状态**:
   - 翻译完成后，将 `status` 改为 `translated`
   - 审核通过后，改为 `reviewed`

4. **使用批注**:
   - 对于不确定的翻译，可以添加批注
   - 审核人员可以通过批注反馈意见

#### 3. 质量检查（可选）

- 使用 Excel 的拼写检查功能
- 检查翻译长度是否合理（避免 UI 问题）
- 确保术语一致性

### 导入阶段

#### 1. 接收翻译好的 Excel

收到翻译人员返回的 `translations.xlsx`。

#### 2. 导入翻译

```bash
# 导入翻译
npx translink import --input translations.xlsx

# 强制覆盖（慎用）
npx translink import --input translations.xlsx --force
```

#### 3. 验证导入结果

```bash
# 查看更新后的翻译文件
cat locales/en-US.json
cat locales/ja-JP.json

# 分析翻译覆盖率
npx translink analyze
```

### 构建和部署

#### 1. 构建翻译文件

```bash
# 构建并优化
npx translink build

# 构建时压缩
npx translink build --minify

# 按语言分割
npx translink build --split
```

#### 2. 测试

启动应用，切换语言测试翻译效果。

#### 3. 部署

将构建好的翻译文件随应用一起部署。

---

## 高级用法

### 增量更新

#### 场景：只更新部分翻译

```bash
# 1. 导出时只包含特定语言
npx translink export --format excel --languages en-US,ja-JP

# 2. 翻译人员只编辑这些语言

# 3. 导入时会自动合并
npx translink import --input translations.xlsx
```

### 批量翻译

#### 使用 Excel 公式辅助翻译

在 Excel 中可以使用一些技巧：

1. **查找替换**:

   ```
   将所有 "用户" 替换为 "User"
   ```

2. **填充序列**:

   ```
   对于编号类文本，可以使用填充功能
   ```

3. **VLOOKUP**:
   ```
   从术语表中查找标准翻译
   ```

### 导出特定内容

```bash
# 只导出未翻译的内容
npx translink export --format excel --filter untranslated

# 只导出特定文件的翻译
npx translink export --format excel --files "src/views/**"

# 导出特定语言
npx translink export --format excel --languages en-US
```

### 使用模板

#### 自定义 Excel 模板

1. 创建模板文件 `templates/translation-template.xlsx`:
   - 添加公司 Logo
   - 设置品牌颜色
   - 添加说明文档

2. 配置使用模板:

```typescript
// i18n.config.ts
export default {
  plugins: [
    [
      'excel',
      {
        template: './templates/translation-template.xlsx',
      },
    ],
  ],
};
```

### 多人协作

#### 方案 A：按文件分割

```bash
# 导出不同模块的翻译
npx translink export --format excel --files "src/views/user/**" --output user-translations.xlsx
npx translink export --format excel --files "src/views/admin/**" --output admin-translations.xlsx

# 不同人员翻译不同模块

# 分别导入
npx translink import --input user-translations.xlsx
npx translink import --input admin-translations.xlsx
```

#### 方案 B：按语言分割

```bash
# 导出不同语言
npx translink export --format excel --languages en-US --output en-translations.xlsx
npx translink export --format excel --languages ja-JP --output ja-translations.xlsx

# 不同译者负责不同语言

# 分别导入
npx translink import --input en-translations.xlsx
npx translink import --input ja-translations.xlsx
```

#### 方案 C：使用 Git

```bash
# 1. 导出 Excel 到 Git 仓库
npx translink export --format excel --output translations/current.xlsx
git add translations/current.xlsx
git commit -m "export: add translations for review"

# 2. 翻译人员 Fork 仓库，编辑后提 PR

# 3. 审核通过后合并

# 4. 导入最新的翻译
git pull
npx translink import --input translations/current.xlsx
```

---

## 最佳实践

### 1. 建立翻译流程规范

**推荐流程**:

```
代码开发 → 提取文本 → 导出 Excel → 翻译 → 审核 → 导入 → 构建 → 测试 → 部署
```

**角色分工**:

- **开发**: 编写代码，提取文本，导出 Excel
- **翻译**: 填写翻译，标记状态
- **审核**: 检查翻译质量，批注反馈
- **QA**: 测试翻译效果，验证 UI

### 2. 使用状态管理

在 Excel 中充分利用 `status` 列：

| 状态       | 说明   | 责任人   |
| ---------- | ------ | -------- |
| pending    | 待翻译 | 翻译人员 |
| translated | 已翻译 | 审核人员 |
| reviewed   | 已审核 | QA       |
| approved   | 已批准 | 项目经理 |
| rejected   | 需修改 | 翻译人员 |

### 3. 建立术语表

创建一个单独的 Excel 文件作为术语表：

| 中文 | 英文    | 日文     | 说明     |
| ---- | ------- | -------- | -------- |
| 用户 | User    | ユーザー | 统一使用 |
| 提交 | Submit  | 送信     | 按钮用   |
| 确认 | Confirm | 確認     | 对话框用 |

**使用方式**:

1. 翻译时参考术语表
2. 使用 VLOOKUP 自动填充
3. 定期更新术语表

### 4. 版本控制

```bash
# 给翻译文件加上版本号
npx translink export --format excel --output translations-v1.0.0.xlsx

# 提交到 Git
git add translations-v1.0.0.xlsx
git commit -m "translations: v1.0.0"
git tag -a v1.0.0 -m "Release v1.0.0"
```

### 5. 备份和恢复

```bash
# 导出前备份当前翻译
cp -r locales locales.backup

# 如果导入出错，可以恢复
mv locales.backup locales

# 或使用 Git
git checkout -- locales/
```

### 6. 定期同步

建立定期同步机制：

```bash
# 每周一导出最新翻译
npx translink extract
npx translink export --format excel --output translations-$(date +%Y%m%d).xlsx

# 每周五导入翻译
npx translink import --input translations-latest.xlsx
npx translink build
```

### 7. 自动化

使用 npm scripts 简化流程：

```json
{
  "scripts": {
    "i18n:extract": "translink extract",
    "i18n:export": "translink export --format excel --output translations/latest.xlsx",
    "i18n:import": "translink import --input translations/latest.xlsx",
    "i18n:build": "translink build",
    "i18n:full": "npm run i18n:extract && npm run i18n:export",
    "i18n:update": "npm run i18n:import && npm run i18n:build"
  }
}
```

使用：

```bash
# 开发完成后
npm run i18n:full

# 收到翻译后
npm run i18n:update
```

---

## 常见问题

### Q: Excel 文件太大怎么办？

**A**: 可以使用以下方法：

1. **分批导出**:

   ```bash
   npx translink export --filter new --output new-translations.xlsx
   ```

2. **使用 CSV 格式**:

   ```bash
   npx translink export --format csv --output translations.csv
   ```

3. **压缩文件**:
   ```bash
   zip translations.zip translations.xlsx
   ```

### Q: 如何处理翻译冲突？

**A**: 如果多人编辑同一个翻译：

1. **使用 --force 强制覆盖**:

   ```bash
   npx translink import --input translations.xlsx --force
   ```

2. **手动合并**:
   - 对比两个版本的差异
   - 手动选择正确的翻译
   - 重新导入

3. **使用版本控制**:
   - 将 Excel 文件加入 Git
   - 使用分支管理不同版本
   - 通过 PR 合并

### Q: Excel 格式被破坏了怎么办？

**A**: 重新导出：

```bash
# 从 JSON 重新导出
npx translink export --format excel --output translations-fixed.xlsx
```

### Q: 如何只更新特定语言？

**A**:

```bash
# 导出时只包含特定语言
npx translink export --languages en-US,ja-JP

# 翻译后导入
npx translink import --input translations.xlsx
```

### Q: 可以在 Google Sheets 中编辑吗？

**A**: 可以！

1. 将 Excel 上传到 Google Drive
2. 使用 Google Sheets 打开
3. 在线协作编辑
4. 下载为 Excel 格式
5. 导入翻译

### Q: 翻译的上下文信息不够怎么办？

**A**:

1. **查看源代码**:
   - Excel 中有 `file` 和 `line` 列
   - 直接定位到源代码查看

2. **添加注释**:

   ```vue
   <!-- i18n-context: 这是登录页面的标题 -->
   <h1>{{ $tsl('欢迎登录') }}</h1>
   ```

3. **使用批注**:
   - 在 Excel 中对不清楚的翻译添加批注
   - 让开发人员补充说明

---

## 相关资源

- [快速开始](./quick-start.md) - 5分钟快速上手指南
- [CLI 命令参考](../api/cli.md) - 详细的命令文档
- [配置文件说明](../guides/configuration.md) - 完整的配置选项

---

**更新时间**: 2026-01-07  
**版本**: 1.0.0
