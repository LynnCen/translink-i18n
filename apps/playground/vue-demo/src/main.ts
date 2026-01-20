/**
 * Vue 3 Demo - Main Entry
 * 应用 TransLink I18n 最佳实践
 */

import { createApp } from 'vue';
import { createI18n } from '@translink/i18n-runtime/vue';
import App from './App.vue';

/**
 * 最佳实践 #1: 懒加载语言文件
 * 只在需要时加载语言包，减少初始 bundle 大小
 */
const loadLanguageResource = async (language: string) => {
  try {
    const module = await import(`./locales/${language}.json`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load language ${language}:`, error);
    // 返回空对象作为 fallback
    return {};
  }
};

/**
 * 最佳实践 #2: 完整的 I18n 配置
 * 包含缓存、DevTools、复数支持等所有最佳实践
 */
const i18n = createI18n({
  // 语言配置
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'] as const,

  /**
   * 最佳实践 #3: 启用缓存
   * 提升翻译性能，减少重复计算
   */
  cache: {
    enabled: true,
    maxSize: 1000, // 限制缓存大小防止内存泄漏
    ttl: 5 * 60 * 1000, // 5分钟 TTL
    storage: 'memory', // 或 'localStorage' 用于持久化
  },

  /**
   * 最佳实践 #4: 懒加载函数
   * 按需加载语言资源
   */
  loadFunction: loadLanguageResource,

  /**
   * 最佳实践 #5: 启用复数支持
   * 自动处理不同语言的复数规则
   */
  pluralization: {
    enabled: true,
    simplifyPluralSuffix: true,
  },

  /**
   * 最佳实践 #6: 开发环境启用 DevTools
   * 追踪缺失的翻译 key，方便调试
   */
  devTools: {
    enabled: import.meta.env.DEV, // 仅开发环境启用
    trackMissingKeys: true,
    logMissingKeys: true,
    maxMissingKeys: 100,
    exposeToWindow: true, // 暴露到 window.__TRANSLINK_DEVTOOLS__
    windowKey: '__TRANSLINK_DEVTOOLS__',
  },

  /**
   * 最佳实践 #7: 配置日志级别
   * 开发环境详细日志，生产环境仅错误
   */
  debug: import.meta.env.DEV,
  logLevel: import.meta.env.DEV ? 'info' : 'error',

  /**
   * 最佳实践 #8: 插值配置
   * 支持多种格式化函数
   */
  interpolation: {
    escapeValue: true, // 安全：转义 HTML
    prefix: '{{',
    suffix: '}}',
  },
});

// 创建 Vue 应用
const app = createApp(App);

/**
 * 最佳实践 #9: 使用 Vue 插件方式安装
 * 自动注入全局属性和组合式 API
 */
app.use(i18n);

/**
 * 最佳实践 #10: 错误处理
 * 捕获未处理的错误
 */
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err, info);
};

// 挂载应用
app.mount('#app');

/**
 * 最佳实践 #11: 暴露 i18n 实例到 window
 * 方便其他组件和 DevTools 访问
 */
if (typeof window !== 'undefined') {
  (window as any).__i18n_engine__ = i18n;
}

/**
 * 最佳实践 #12: 开发环境提示
 * 在控制台显示有用的调试信息
 */
if (import.meta.env.DEV) {
  console.log('🚀 TransLink I18n Vue Demo Started');
  console.log('📊 DevTools available at: window.__TRANSLINK_DEVTOOLS__');
  console.log('🔍 Try: window.__TRANSLINK_DEVTOOLS__.printStats()');
  console.log('🌐 I18n Engine: window.__i18n_engine__');
}

/**
 * 最佳实践 #13: 预加载常用语言
 * 在空闲时预加载其他语言，提升切换速度
 */
/**
 * 最佳实践 #13: 预加载常用语言
 * 在空闲时预加载其他语言，提升切换速度
 */
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  requestIdleCallback(
    () => {
      // 使用 i18n.global.engine 访问引擎方法
      const currentLang = i18n.global.engine.getCurrentLanguage();
      const otherLanguages = ['en-US', 'zh-CN'].filter(
        lang => lang !== currentLang
      );

      otherLanguages.forEach(async lang => {
        try {
          // 预加载语言资源
          await loadLanguageResource(lang);
          console.log(`✓ Preloaded language: ${lang}`);
        } catch (error) {
          console.warn(`Failed to preload language ${lang}:`, error);
        }
      });
    },
    { timeout: 2000 }
  );
}

// 导出 i18n 实例供其他模块使用
export { i18n };
