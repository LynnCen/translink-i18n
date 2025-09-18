# TransLink I18n 命名策略

## 🎯 品牌命名理念

### 核心概念：TransLink
**Trans** (转换/翻译) + **Link** (连接/链接) = **TransLink**

**品牌寓意：**
- 🌍 **全球连接**: 连接不同语言和文化的桥梁
- 🔄 **智能转换**: 无缝转换文本到多语言形式  
- 🔗 **开发链接**: 连接开发者与国际化需求
- ⚡ **高效传输**: 快速、准确的翻译传输

## 📦 NPM 包命名方案

### 主推荐：@translink 作用域
```
@translink/i18n-cli       # CLI 工具
@translink/i18n-runtime   # 运行时库  
@translink/vite-plugin    # Vite 插件 (简化名称)
```

### 备选方案：独立包名
```
translink-cli             # CLI 工具
translink-runtime         # 运行时库
translink-vite            # Vite 插件
```

## 🔧 命令行工具命名

### 全局命令
```bash
# 主命令
translink

# 或更简洁的别名
tl
```

### 子命令设计
```bash
translink init          # 初始化项目
translink extract       # 提取翻译文本
translink build         # 构建语言包
translink push          # 推送到云端
translink pull          # 从云端拉取
translink analyze       # 分析翻译覆盖率
translink sync          # 双向同步
```

## 🏗️ 项目结构命名

### 仓库名称
```
translink-i18n          # GitHub 仓库名
```

### 目录结构
```
translink-i18n/
├── packages/
│   ├── cli/             # @translink/i18n-cli
│   ├── runtime/         # @translink/i18n-runtime  
│   └── vite-plugin/     # @translink/vite-plugin
├── apps/
│   ├── docs/            # 文档站点
│   └── playground/      # 示例应用
└── tools/               # 开发工具
```

## 🌐 域名和品牌资产

### 推荐域名
- `translink.dev` (主域名)
- `translink.io` (备选)
- `translink-i18n.com` (备选)

### 文档站点
- `docs.translink.dev`
- `translink.dev/docs`

### 品牌标识建议
```
🔗 TransLink    # 简洁图标 + 文字
🌐 TransLink    # 全球化图标
⚡ TransLink    # 速度图标
```

## 📚 相关资源命名

### GitHub 组织/用户
- `translink-i18n` (推荐作为组织名)
- 或继续使用个人账号 `lynncen/translink-i18n`

### NPM 作用域申请
需要申请 `@translink` 作用域，如果不可用，备选：
- `@translink-i18n`
- `@trans-link`
- `@tl-i18n`

### 社交媒体
- Twitter: `@translink_dev`
- Discord: `TransLink I18n Community`

## 🎨 命名的技术优势

### SEO 友好
- "translink i18n" 搜索独特性强
- "translink internationalization" 专业术语结合
- "translink vue react" 框架关联度高

### 开发者体验
- 命令简洁：`translink extract`
- 导入清晰：`import { t } from '@translink/i18n-runtime'`
- 配置直观：`translink.config.ts`

### 品牌扩展性
- 可扩展到其他开发工具
- 保持统一的品牌形象
- 易于形成技术生态

## 🔍 竞品分析

### 现有类似命名
- `i18next` - 经典但功能定位不同
- `vue-i18n` - 框架特定
- `react-intl` - 框架特定
- `lingui` - 简洁但不够直观

### TransLink 的差异化
- ✅ 明确表达"连接"概念
- ✅ 暗示智能转换能力
- ✅ 品牌记忆度高
- ✅ 国际化友好

## 📋 实施检查清单

### NPM 包发布前
- [ ] 检查 `@translink` 作用域可用性
- [ ] 注册 NPM 账号和作用域
- [ ] 验证包名不与现有包冲突

### 域名注册
- [ ] 检查 `translink.dev` 可用性
- [ ] 考虑购买相关域名保护品牌

### 商标检查
- [ ] 简单检查 "TransLink" 商标情况
- [ ] 确保在软件开发领域无冲突

---

**最终推荐：采用 `@translink` 作用域的完整命名方案，体现专业性和品牌一致性。**
