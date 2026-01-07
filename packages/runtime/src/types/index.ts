/**
 * TransLink I18n Runtime 类型定义
 */

export interface TranslationResource {
  [key: string]: string | TranslationResource;
}

export interface I18nOptions {
  // 语言配置
  defaultLanguage: string;
  fallbackLanguage: string;
  supportedLanguages: string[];

  // 资源配置
  resources?: Record<string, TranslationResource>;
  loadPath?: string;
  loadFunction?: (lng: string, ns: string) => Promise<TranslationResource>;

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
    enabled: boolean;
    rules?: Record<string, (count: number) => number>;
  };

  // 调试配置
  debug?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}

export interface TranslationParams {
  [key: string]: string | number | boolean | Date | null | undefined;
}

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
