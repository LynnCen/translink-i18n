/**
 * TransLink I18n Runtime 类型定义（简化版）
 */

// 翻译资源类型（扁平化，只支持字符串值）
export type TranslationResource = Record<string, string>;

// 严格的翻译资源类型（已与 TranslationResource 合并）
export type StrictTranslationResource = TranslationResource;

// 带类型推断的翻译资源
export type TypedTranslationResource<T extends Record<string, string>> = T;

// I18nOptions 配置
export interface I18nOptions<
  TResource extends TranslationResource = TranslationResource,
> {
  // 语言配置
  defaultLanguage: string;
  fallbackLanguage: string;
  supportedLanguages: readonly string[];

  // 资源配置
  resources?: Record<string, TResource>;
  loadPath?: string;
  loadFunction?: (lng: string) => Promise<TResource>;

  // 缓存配置
  cache?: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
    storage: 'memory' | 'localStorage' | 'sessionStorage';
  };

  // 插值配置（简化版）
  interpolation?: {
    prefix: string;
    suffix: string;
    escapeValue: boolean;
  };

  // 调试配置
  debug?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  logger?: any; // Logger 实例

  // DevTools 配置
  devTools?: {
    enabled: boolean;
    trackMissingKeys?: boolean;
    logMissingKeys?: boolean;
    maxMissingKeys?: number;
    exposeToWindow?: boolean;
    windowKey?: string;
  };
}

// 翻译参数类型（简化版）
export type TranslationParamValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export interface TranslationParams {
  [key: string]: TranslationParamValue;
}

// 类型安全的翻译参数
export type TypedTranslationParams<T extends Record<string, any>> = {
  [K in keyof T]: TranslationParamValue;
};

export interface LoaderResult {
  data: TranslationResource;
  status: 'success' | 'error';
  error?: Error;
}

export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

// I18n 事件类型（简化版，删除 namespace）
export interface I18nEventMap {
  languageChanged: (language: string) => void;
  resourceLoaded: (language: string) => void;
  resourceLoadFailed: (language: string, error: Error) => void;
  translationMissing: (key: string, language: string) => void;
  ready: () => void;
}

export type I18nEventType = keyof I18nEventMap;
export type I18nEventHandler<T extends I18nEventType> = I18nEventMap[T];

// 格式化函数类型（保留用于向后兼容，但已不再使用）
export interface FormatFunction {
  (value: any, format: string, lng: string, options?: any): string;
}

// Backend 选项
export interface BackendOptions {
  loadPath: string;
  addPath?: string;
  allowMultiLoading?: boolean;
  reloadInterval?: number;
}
