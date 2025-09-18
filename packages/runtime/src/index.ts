/**
 * TransLink I18n Runtime Library
 * 主入口文件
 */

// 核心引擎
export { I18nEngine } from './core/i18n-engine.js';
export { ResourceLoader } from './core/resource-loader.js';
export { Interpolator } from './core/interpolator.js';

// 缓存系统
export { CacheManager } from './cache/cache-manager.js';

// 工具类
export { EventEmitter } from './utils/event-emitter.js';

// 类型定义
export type {
  I18nOptions,
  TranslationResource,
  TranslationParams,
  LoaderResult,
  CacheEntry,
  I18nEventMap,
  I18nEventType,
  I18nEventHandler,
  InterpolationOptions,
  FormatFunction,
} from './types/index.js';

// 创建便捷的实例创建函数
export function createI18n(options: I18nOptions): I18nEngine {
  return new I18nEngine(options);
}

// 默认导出引擎类
export default I18nEngine;
