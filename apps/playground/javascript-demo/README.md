# JavaScript Demo - TransLink I18n

这是一个展示如何在纯 JavaScript 项目中使用 TransLink I18n 的完整示例。

## 功能特性

- 🌍 **多语言支持**: 支持中文、英文、日文
- 📝 **任务管理**: 完整的任务 CRUD 操作
- 👥 **用户管理**: 用户注册、登录、资料管理
- 🔔 **通知系统**: 多类型通知和历史记录
- 📊 **统计分析**: 详细的数据统计和报告
- 🎯 **性能优化**: 缓存机制和性能监控
- 🔧 **模块化设计**: 清晰的模块分离和依赖管理

## 项目结构

```
javascript-demo/
├── src/
│   ├── index.js              # 主应用入口
│   └── modules/
│       ├── userManager.js    # 用户管理模块
│       ├── taskManager.js    # 任务管理模块
│       └── notifications.js  # 通知系统模块
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd examples/javascript-demo
pnpm install
```

### 2. 运行示例

```bash
pnpm dev
```

### 3. 查看输出

应用将在控制台中展示以下功能演示：

1. **应用初始化**: i18n 引擎配置和模块加载
2. **任务管理演示**: 创建、完成、统计任务
3. **用户管理演示**: 注册、登录、列表显示
4. **通知系统演示**: 各类型通知发送和历史记录
5. **语言切换演示**: 动态切换多种语言
6. **性能测试**: 缓存效果和性能统计

## 核心代码解析

### 1. i18n 引擎初始化

```javascript
// src/index.js
this.i18n = new I18nEngine({
  defaultLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US', 'ja-JP'],
  resources: {
    'zh-CN': { /* 中文翻译 */ },
    'en-US': { /* 英文翻译 */ },
    // ...
  },
  cache: {
    enabled: true,
    maxSize: 500,
    ttl: 10 * 60 * 1000, // 10分钟
    storage: 'memory'
  }
});
```

### 2. 模块化设计

每个功能模块都是独立的工厂函数，接收 i18n 实例作为参数：

```javascript
// src/modules/userManager.js
export function createUserManager(i18n) {
  return {
    registerUser(userData) {
      // 使用 i18n.t() 进行翻译
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      // ...
    }
  };
}
```

### 3. 翻译函数使用

项目中使用了两种翻译方式：

- `i18n.t(key, params)`: 标准翻译函数
- `$tsl(text)`: 直接文本翻译（需要 Vite 插件转换）

```javascript
// 标准方式
console.log(i18n.t('user.login.success', { name: user.name }));

// 直接文本方式（开发时）
console.log($tsl('用户登录成功: {{name}}'), { name: user.name });
```

### 4. 事件监听

```javascript
// 监听语言切换事件
this.i18n.on('languageChanged', (language) => {
  console.log($tsl('语言已切换到: {{language}}'), { language });
  this.showWelcome();
});

// 监听翻译缺失事件
this.i18n.on('translationMissing', (key, language) => {
  console.warn($tsl('缺失翻译: {{key}} ({{language}})'), { key, language });
});
```

## 功能模块详解

### 用户管理模块 (userManager.js)

- **用户注册**: 数据验证、邮箱唯一性检查
- **用户登录**: 密码验证、状态管理
- **资料管理**: 更新、删除用户信息
- **用户搜索**: 按姓名、邮箱搜索
- **统计信息**: 用户数量、活跃度统计

### 任务管理模块 (taskManager.js)

- **任务 CRUD**: 创建、读取、更新、删除任务
- **优先级管理**: 低、中、高、紧急四个级别
- **状态跟踪**: 待完成、已完成状态管理
- **子任务支持**: 任务分解和进度跟踪
- **评论系统**: 任务评论和历史记录
- **数据导出**: JSON、CSV 格式导出

### 通知系统模块 (notifications.js)

- **多类型通知**: 成功、错误、警告、信息
- **通知历史**: 完整的通知记录和查询
- **批量操作**: 批量发送、标记已读、清除
- **模板系统**: 可重用的通知模板
- **过滤功能**: 按类型、状态、时间过滤

## 国际化最佳实践

### 1. 翻译键命名规范

```javascript
// 推荐的命名方式
'user.login.success'        // 用户.登录.成功
'task.validation.required'  // 任务.验证.必填
'notification.type.error'   // 通知.类型.错误
```

### 2. 插值参数使用

```javascript
// 正确的插值使用
i18n.t('validation.required', { field: i18n.t('user.name') })
i18n.t('task.dueDate.value', { date: task.dueDate.toLocaleDateString() })
```

### 3. 错误处理

```javascript
// 翻译缺失时的降级处理
this.i18n.on('translationMissing', (key, language) => {
  // 记录缺失的翻译，便于后续补充
  console.warn(`Missing translation: ${key} for ${language}`);
});
```

### 4. 性能优化

```javascript
// 启用缓存提高性能
cache: {
  enabled: true,
  maxSize: 500,        // 最大缓存条目数
  ttl: 10 * 60 * 1000, // 缓存过期时间
  storage: 'memory'    // 缓存存储方式
}
```

## 扩展示例

### 添加新语言

```javascript
// 在 resources 中添加新语言
resources: {
  'zh-CN': { /* 中文 */ },
  'en-US': { /* 英文 */ },
  'ja-JP': { /* 日文 */ },
  'ko-KR': { /* 韩文 - 新增 */ }
}
```

### 自定义验证规则

```javascript
// 在模块中添加自定义验证
validateCustomData(data) {
  const errors = [];
  
  if (data.customField && !this.isValidCustomField(data.customField)) {
    errors.push(i18n.t('validation.custom.invalid', { 
      field: i18n.t('fields.customField') 
    }));
  }
  
  return { isValid: errors.length === 0, errors };
}
```

### 添加新的通知类型

```javascript
// 扩展通知类型配置
const notificationTypes = {
  success: { icon: '✅', color: '\x1b[32m', priority: 1 },
  error: { icon: '❌', color: '\x1b[31m', priority: 4 },
  warning: { icon: '⚠️', color: '\x1b[33m', priority: 3 },
  info: { icon: 'ℹ️', color: '\x1b[36m', priority: 2 },
  debug: { icon: '🐛', color: '\x1b[90m', priority: 0 } // 新增调试类型
};
```

## 注意事项

1. **Node.js 版本**: 需要 Node.js 16.0.0 或更高版本
2. **ES 模块**: 项目使用 ES 模块语法，确保 package.json 中设置了 `"type": "module"`
3. **依赖关系**: 确保 `@translink/i18n-runtime` 包已正确安装
4. **控制台输出**: 示例主要通过控制台展示功能，适合学习和测试

## 相关资源

- [TransLink I18n 文档](../../docs/README.md)
- [API 参考](../../docs/api/README.md)
- [Vue 示例](../vue-demo/README.md)
- [React 示例](../react-demo/README.md)
- [TypeScript 示例](../typescript-demo/README.md)

## 许可证

MIT License
