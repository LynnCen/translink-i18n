/**
 * React 专用导出
 */

export {
  I18nProvider,
  useI18n,
  useTranslation,
  Translation,
  withTranslation,
  createI18n,
  createI18nWithInit,
} from './adapters/react.js';

export type {
  ReactI18nOptions,
  I18nContextValue,
  UseTranslationReturn,
  TranslationProps,
} from './adapters/react.js';

// 重新导出核心类型和类
export { I18nEngine } from './core/i18n-engine.js';
export type {
  I18nOptions,
  TranslationParams,
  TranslationResource,
} from './types/index.js';
