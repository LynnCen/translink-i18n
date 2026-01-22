/**
 * I18n 配置文件
 *
 * 使用 createI18n() 创建全局可用的 i18n 实例
 */

import { createI18n } from '@translink/i18n-runtime/react';

// 创建 i18n 实例
export const { engine, t, Provider } = createI18n({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],

  // 使用动态导入加载翻译资源
  loadFunction: async (lng: string) => {
    const module = await import(`./locales/${lng}.json`);
    return module.default || module;
  },

  // 启用缓存
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5分钟
    storage: 'memory',
  },

  // 插值配置
  interpolation: {
    prefix: '{{',
    suffix: '}}',
    escapeValue: true,
  },

  // 启用 DevTools
  devTools: {
    enabled: true,
  },

  // 开发模式日志
  debug: process.env.NODE_ENV === 'development',
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
});

// 导出 engine 供需要直接访问的场景使用
export default engine;
