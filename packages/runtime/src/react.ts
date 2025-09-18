/**
 * React 专用导出
 */

export {
  I18nProvider,
  useTranslation,
  useI18n,
  Translation,
  withTranslation,
  createI18nWithInit
} from './adapters/react.js';

export type {
  ReactI18nOptions,
  I18nContextValue,
  UseTranslationReturn,
  TranslationProps
} from './adapters/react.js';

// 重新导出核心类型
export type {
  I18nOptions,
  TranslationParams,
  TranslationResource
} from './types/index.js';
