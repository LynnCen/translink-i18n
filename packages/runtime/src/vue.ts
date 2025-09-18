/**
 * Vue 3 专用导出
 */

export {
  createI18n,
  useI18n,
  vT,
  Translation,
  withTranslation
} from './adapters/vue.js';

export type {
  VueI18nOptions,
  VueI18nInstance,
  UseI18nReturn
} from './adapters/vue.js';

// 重新导出核心类型
export type {
  I18nOptions,
  TranslationParams,
  TranslationResource
} from './types/index.js';
