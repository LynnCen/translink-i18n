/**
 * TransLink I18n Runtime 类型定义
 */

// 翻译资源类型（支持嵌套）
export interface TranslationResource {
  [key: string]: string | TranslationResource;
}

// 严格的翻译资源类型（仅字符串值，用于运行时）
export type StrictTranslationResource = Record<string, string>;

// 带类型推断的翻译资源
export type TypedTranslationResource<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? TypedTranslationResource<T[K]>
    : string;
};

// 泛型化的 I18nOptions，支持类型推断
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
  loadFunction?: (lng: string, ns: string) => Promise<TResource>;

  // 缓存配置
  cache?: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
    storage: 'memory' | 'localStorage' | 'sessionStorage';
  };

  // 插值配置
  interpolation?: {
    prefix: string;
    suffix: string;
    escapeValue: boolean;
    format?: (value: any, format: string, lng: string) => string;
  };

  // 复数配置
  pluralization?: {
    enabled?: boolean;
    simplifyPluralSuffix?: boolean;
    rules?: Record<string, (count: number) => number>;
  };

  // 调试配置
  debug?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';

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

// 翻译参数类型
export type TranslationParamValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export interface TranslationParams {
  [key: string]: TranslationParamValue | TranslationParams; // 支持嵌套对象
  count?: number; // 用于复数处理
}

// 类型安全的翻译参数
export type TypedTranslationParams<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends object
    ? TypedTranslationParams<T[K]>
    : TranslationParamValue;
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

export interface I18nEventMap {
  languageChanged: (language: string) => void;
  resourceLoaded: (language: string, namespace: string) => void;
  resourceLoadFailed: (
    language: string,
    namespace: string,
    error: Error
  ) => void;
  translationMissing: (key: string, language: string) => void;
  ready: () => void;
}

export type I18nEventType = keyof I18nEventMap;
export type I18nEventHandler<T extends I18nEventType> = I18nEventMap[T];

export interface PluralRule {
  (count: number): number;
}

export interface PluralRules {
  [language: string]: PluralRule;
}

export interface FormatFunction {
  (value: any, format: string, lng: string, options?: any): string;
}

export interface InterpolationOptions {
  prefix: string;
  suffix: string;
  escapeValue: boolean;
  format: FormatFunction;
  defaultVariables?: Record<string, any>;
}

export interface NamespaceOptions {
  defaultNS: string;
  fallbackNS: string | string[];
  ns: string | string[];
}

export interface BackendOptions {
  loadPath: string;
  addPath?: string;
  allowMultiLoading?: boolean;
  reloadInterval?: number;
}
