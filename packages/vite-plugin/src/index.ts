/**
 * TransLink I18n Vite Plugin
 * 
 * 提供以下功能：
 * - 自动代码转换 ($tsl -> t(hash))
 * - 热更新支持
 * - 懒加载机制
 * - 构建优化
 * - 开发时调试
 */

export { createI18nPlugin as default } from './core/plugin.js';
export { createI18nPlugin } from './core/plugin.js';

// 导出类型定义
export type {
  I18nPluginOptions,
  TransformRule,
  PreloadStrategy,
  TransformContext,
  LanguageResource,
  HMRUpdateInfo,
  TransformResult
} from './types/index.js';

// 导出核心组件（用于高级用法）
export { I18nTransformer } from './core/transformer.js';
export { LanguageLoader } from './core/language-loader.js';
export { HMRHandler } from './core/hmr-handler.js';
export { ConfigManager } from './core/config-manager.js';

// 导出工具函数
export { logger } from './utils/logger.js';

/**
 * 创建插件的便捷函数
 */
export function i18n(options?: I18nPluginOptions) {
  return createI18nPlugin(options);
}

/**
 * 预设配置
 */
export const presets = {
  /**
   * Vue 3 项目预设
   */
  vue: (options: Partial<I18nPluginOptions> = {}) => createI18nPlugin({
    include: ['**/*.{vue,ts,js}'],
    transformTsl: true,
    hmr: true,
    lazyLoading: true,
    debug: process.env.NODE_ENV === 'development',
    ...options
  }),

  /**
   * React 项目预设
   */
  react: (options: Partial<I18nPluginOptions> = {}) => createI18nPlugin({
    include: ['**/*.{tsx,ts,jsx,js}'],
    transformTsl: true,
    hmr: true,
    lazyLoading: true,
    debug: process.env.NODE_ENV === 'development',
    ...options
  }),

  /**
   * 最小配置预设
   */
  minimal: (options: Partial<I18nPluginOptions> = {}) => createI18nPlugin({
    transformTsl: false,
    hmr: false,
    lazyLoading: false,
    debug: false,
    ...options
  }),

  /**
   * 开发模式预设
   */
  development: (options: Partial<I18nPluginOptions> = {}) => createI18nPlugin({
    transformTsl: true,
    hmr: true,
    lazyLoading: true,
    debug: true,
    ...options
  }),

  /**
   * 生产模式预设
   */
  production: (options: Partial<I18nPluginOptions> = {}) => createI18nPlugin({
    transformTsl: true,
    hmr: false,
    lazyLoading: true,
    debug: false,
    ...options
  })
};

/**
 * 版本信息
 */
export const version = '1.0.0';
