/**
 * 基础使用示例
 */

import { createI18n } from '../index.js';

// 创建 i18n 实例
const i18n = createI18n({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  resources: {
    'zh-CN': {
      welcome: '欢迎使用 TransLink I18n',
      greeting: '你好，{{name}}！',
      itemCount: '共有 {{count}} 个项目',
      user: {
        profile: '用户资料',
        settings: '设置'
      }
    },
    'en-US': {
      welcome: 'Welcome to TransLink I18n',
      greeting: 'Hello, {{name}}!',
      itemCount: 'There are {{count}} items',
      user: {
        profile: 'User Profile',
        settings: 'Settings'
      }
    }
  },
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000,
    storage: 'memory'
  },
  debug: true
});

// 使用示例
async function example() {
  // 初始化
  await i18n.init();
  
  // 基础翻译
  console.log(i18n.t('welcome')); // 输出: 欢迎使用 TransLink I18n
  
  // 带参数的翻译
  console.log(i18n.t('greeting', { name: '张三' })); // 输出: 你好，张三！
  
  // 嵌套键翻译
  console.log(i18n.t('user.profile')); // 输出: 用户资料
  
  // 切换语言
  await i18n.changeLanguage('en-US');
  console.log(i18n.t('welcome')); // 输出: Welcome to TransLink I18n
  console.log(i18n.t('greeting', { name: 'John' })); // 输出: Hello, John!
  
  // 获取缓存统计
  console.log('Cache stats:', i18n.getCacheStats());
}

example().catch(console.error);
