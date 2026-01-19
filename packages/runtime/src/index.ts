/**
 * TransLink I18n Runtime Library
 * 主入口文件
 */

// 核心引擎
export { I18nEngine } from './core/i18n-engine.js';
export { ResourceLoader } from './core/resource-loader.js';
export { Interpolator } from './core/interpolator.js';
export { PluralResolver } from './core/plural-resolver.js';
export { I18nDevTools } from './core/devtools.js';

// 缓存系统
export { CacheManager } from './cache/cache-manager.js';

// SSR 支持
export {
  createI18nWithSSR,
  createIsomorphicI18n,
  serializeSSRContext,
  deserializeSSRContext,
  renderSSRScript,
  loadSSRContextFromWindow,
} from './ssr/index.js';

// 工具类
export { EventEmitter } from './utils/event-emitter.js';
export {
  Logger,
  getDefaultLogger,
  setDefaultLogger,
  createLogHandler,
  createMemoryHandler,
} from './utils/logger.js';
export {
  UpdateScheduler,
  getGlobalScheduler,
  scheduleUpdate,
  batchUpdates,
} from './utils/update-scheduler.js';

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
  TypedTranslationResource,
  TypedTranslationParams,
  StrictTranslationResource,
  TranslationParamValue,
} from './types/index.js';

// SSR 类型
export type { SSRContext, SSROptions } from './ssr/index.js';

// Logger 类型
export type { LogLevel, LogMessage, LogHandler, LoggerOptions } from './utils/logger.js';

// Scheduler 类型
export type { UpdateCallback, SchedulerOptions } from './utils/update-scheduler.js';

// 创建便捷的实例创建函数
export function createI18n(options: I18nOptions): I18nEngine {
  return new I18nEngine(options);
}

// 默认导出引擎类
export default I18nEngine;
