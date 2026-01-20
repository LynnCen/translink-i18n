/**
 * 核心翻译引擎
 * 整合资源加载、缓存管理、插值处理等功能
 */

import type {
  I18nOptions,
  TranslationResource,
  TranslationParams,
} from '../types/index.js';
import { EventEmitter } from '../utils/event-emitter.js';
import { CacheManager } from '../cache/cache-manager.js';
import { ResourceLoader } from './resource-loader.js';
import { Interpolator } from './interpolator.js';
import { PluralResolver } from './plural-resolver.js';
import { I18nDevTools } from './devtools.js';
import { Logger, getDefaultLogger } from '../utils/logger.js';

/**
 * 最佳实践：定义明确的事件数据类型
 */
interface ResourceLoadedEventData {
  language: string;
  namespace: string;
}

interface ResourceLoadFailedEventData {
  language: string;
  namespace: string;
  error: Error;
}

interface TranslationMissingEventData {
  key: string;
  language: string;
}

export class I18nEngine extends EventEmitter {
  private options: I18nOptions;
  private currentLanguage: string;
  private cache: CacheManager<string>;
  private resourceLoader: ResourceLoader;
  private interpolator: Interpolator;
  private pluralResolver: PluralResolver;
  private devTools?: I18nDevTools;
  private logger: Logger;
  private isInitialized = false;
  private initPromise?: Promise<void>;

  constructor(options: I18nOptions) {
    super();

    this.options = this.mergeDefaultOptions(options);
    this.currentLanguage = this.options.defaultLanguage;

    // 初始化各个组件
    this.cache = new CacheManager({
      maxSize: this.options.cache?.maxSize || 1000,
      ttl: this.options.cache?.ttl || 5 * 60 * 1000,
      storage: this.options.cache?.storage || 'memory',
      prefix: 'translink_translation_',
    });

    this.resourceLoader = new ResourceLoader({
      loadPath: this.options.loadPath || './locales/{{lng}}.json',
      loadFunction: this.options.loadFunction,
      allowMultiLoading: true,
      timeout: 10000,
      retries: 3,
    });

    this.interpolator = new Interpolator({
      prefix: this.options.interpolation?.prefix || '{{',
      suffix: this.options.interpolation?.suffix || '}}',
      escapeValue: this.options.interpolation?.escapeValue ?? true,
      format: this.options.interpolation?.format,
    });

    this.pluralResolver = new PluralResolver({
      simplifyPluralSuffix:
        this.options.pluralization?.simplifyPluralSuffix ?? true,
    });

    // 初始化 Logger
    this.logger = this.options.logger || getDefaultLogger();
    if (this.options.logLevel) {
      this.logger.setLevel(this.options.logLevel);
    }
    if (this.options.debug) {
      this.logger.setLevel('debug');
    }

    // 初始化 DevTools（仅在 development 模式或显式启用时）
    if (this.options.devTools?.enabled) {
      this.devTools = new I18nDevTools(this, this.options.devTools);
    }

    // 绑定资源加载器事件
    this.bindResourceLoaderEvents();
  }

  /**
   * 初始化引擎
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInit();
    return this.initPromise;
  }

  /**
   * 翻译函数
   */
  t(
    key: string,
    params?: TranslationParams,
    options?: {
      lng?: string;
      ns?: string;
      defaultValue?: string;
      count?: number;
    }
  ): string {
    if (!this.isInitialized) {
      this.logWarning('I18n engine not initialized, call init() first');
      return options?.defaultValue || key;
    }

    const language = options?.lng || this.currentLanguage;
    const namespace = options?.ns || 'translation';
    const defaultValue = options?.defaultValue || key;
    const count = options?.count ?? params?.count;

    try {
      // 生成缓存键
      const cacheKey = this.generateCacheKey(key, language, namespace, params);

      // 检查缓存
      if (this.options.cache?.enabled !== false) {
        const cached = this.cache.get(cacheKey);
        if (cached !== null) {
          return cached;
        }
      }

      // 处理复数形式
      let translationKey = key;
      if (
        count !== undefined &&
        this.options.pluralization?.enabled !== false
      ) {
        const pluralCategory = this.pluralResolver.resolve(language, count);
        const pluralKey = this.pluralResolver.generateKey(key, pluralCategory);

        // 尝试使用复数key，如果不存在则回退到原key
        const pluralTranslation = this.getTranslation(
          pluralKey,
          language,
          namespace
        );
        if (pluralTranslation) {
          translationKey = pluralKey;
        }
      }

      // 获取翻译文本
      const translation = this.getTranslation(
        translationKey,
        language,
        namespace
      );

      if (!translation) {
        // 最佳实践：传递对象而不是多个参数
        this.emit<TranslationMissingEventData>('translationMissing', {
          key: translationKey,
          language,
        });
        return defaultValue;
      }

      // 处理插值
      const result = params
        ? this.interpolator.interpolate(translation, params, language)
        : translation;

      // 缓存结果
      if (this.options.cache?.enabled !== false) {
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      this.logError('Translation error:', error);
      return defaultValue;
    }
  }

  /**
   * 切换语言
   */
  async changeLanguage(language: string): Promise<void> {
    if (language === this.currentLanguage) {
      return;
    }

    if (!this.options.supportedLanguages.includes(language)) {
      throw new Error(`Language "${language}" is not supported`);
    }

    try {
      // 加载新语言资源
      await this.resourceLoader.load(language);

      // 更新当前语言
      const previousLanguage = this.currentLanguage;
      this.currentLanguage = language;

      // 清除缓存（因为语言变了）
      this.cache.clear();

      this.emit('languageChanged', language);
      this.log(`Language changed from ${previousLanguage} to ${language}`);
    } catch (error) {
      this.logError(`Failed to change language to ${language}:`, error);
      throw error;
    }
  }

  /**
   * 预加载语言资源
   */
  async preloadLanguages(languages: string[]): Promise<void> {
    const validLanguages = languages.filter(lang =>
      this.options.supportedLanguages.includes(lang)
    );

    if (validLanguages.length === 0) {
      return;
    }

    try {
      await this.resourceLoader.preload(validLanguages);
      this.log(`Preloaded languages: ${validLanguages.join(', ')}`);
    } catch (error) {
      this.logError('Failed to preload languages:', error);
    }
  }

  /**
   * 添加资源
   */
  addResource(
    language: string,
    namespace: string,
    resource: TranslationResource
  ): void {
    // 使用 ResourceLoader 的 addResource 方法
    this.resourceLoader.addResource(language, namespace, resource);

    // 清除相关缓存
    this.clearCacheForLanguage(language);
  }

  /**
   * 批量添加资源
   */
  addResources(
    language: string,
    resources: Record<string, TranslationResource>
  ): void {
    this.resourceLoader.addResources(language, resources);
    this.clearCacheForLanguage(language);
  }

  /**
   * 检查翻译是否存在
   */
  exists(key: string, options?: { lng?: string; ns?: string }): boolean {
    const language = options?.lng || this.currentLanguage;
    const namespace = options?.ns || 'translation';

    return this.getTranslation(key, language, namespace) !== null;
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): string[] {
    return [...this.options.supportedLanguages];
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * 获取 DevTools 实例
   */
  getDevTools(): I18nDevTools | undefined {
    return this.devTools;
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.log('Cache cleared');
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    this.cache.destroy();
    this.resourceLoader.destroy();
    this.removeAllListeners();
    this.isInitialized = false;
    this.log('I18n engine destroyed');
  }

  /**
   * 执行初始化
   */
  private async performInit(): Promise<void> {
    try {
      this.log('Initializing I18n engine...');

      // 加载默认语言资源
      await this.resourceLoader.load(this.currentLanguage);

      // 预加载其他语言（如果配置了）
      const otherLanguages = this.options.supportedLanguages.filter(
        lang => lang !== this.currentLanguage
      );

      if (otherLanguages.length > 0) {
        // 异步预加载，不阻塞初始化
        this.resourceLoader.preload(otherLanguages).catch(error => {
          this.logWarning('Failed to preload languages:', error);
        });
      }

      this.isInitialized = true;
      this.emit('ready');
      this.log('I18n engine initialized successfully');
    } catch (error) {
      this.logError('Failed to initialize I18n engine:', error);
      throw error;
    }
  }

  /**
   * 获取翻译文本
   */
  private getTranslation(
    key: string,
    language: string,
    namespace: string
  ): string | null {
    const resource = this.resourceLoader.getLoadedResource(language, namespace);

    if (!resource) {
      // 尝试使用回退语言
      if (language !== this.options.fallbackLanguage) {
        return this.getTranslation(
          key,
          this.options.fallbackLanguage,
          namespace
        );
      }
      return null;
    }

    return this.getNestedValue(resource, key);
  }

  /**
   * 获取嵌套对象的值
   */
  private getNestedValue(
    obj: TranslationResource,
    path: string
  ): string | null {
    const keys = path.split('.');
    let current: any = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(
    key: string,
    language: string,
    namespace: string,
    params?: TranslationParams
  ): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${language}:${namespace}:${key}:${paramsStr}`;
  }

  /**
   * 清除特定语言的缓存
   */
  private clearCacheForLanguage(language: string): void {
    // 清除特定语言的所有缓存
    const prefix = `${language}:`;
    this.cache.clearByPrefix(prefix);
  }

  /**
   * 最佳实践：绑定资源加载器事件，使用类型安全的事件数据
   */
  private bindResourceLoaderEvents(): void {
    this.resourceLoader.on<ResourceLoadedEventData>('resourceLoaded', data => {
      // 传递整个事件数据对象
      this.emit<ResourceLoadedEventData>('resourceLoaded', data);
      this.clearCacheForLanguage(data.language);
    });

    this.resourceLoader.on<ResourceLoadFailedEventData>(
      'resourceLoadFailed',
      data => {
        // 传递整个事件数据对象
        this.emit<ResourceLoadFailedEventData>('resourceLoadFailed', data);
      }
    );
  }

  /**
   * 最佳实践：合并默认选项，避免重复定义
   */
  private mergeDefaultOptions(options: I18nOptions): I18nOptions {
    const defaults: Partial<I18nOptions> = {
      cache: {
        enabled: true,
        maxSize: 1000,
        ttl: 5 * 60 * 1000, // 5分钟
        storage: 'memory',
      },
      interpolation: {
        prefix: '{{',
        suffix: '}}',
        escapeValue: true,
      },
      pluralization: {
        enabled: true,
      },
      debug: false,
      logLevel: 'warn',
    };

    // 只在用户未提供时使用默认值
    return {
      ...defaults,
      ...options,
      // 确保必需字段存在
      defaultLanguage: options.defaultLanguage || 'en',
      fallbackLanguage:
        options.fallbackLanguage || options.defaultLanguage || 'en',
      supportedLanguages: options.supportedLanguages || [
        options.defaultLanguage || 'en',
      ],
    };
  }

  /**
   * 日志记录
   */
  private log(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  private logWarning(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  private logError(message: string, ...args: any[]): void {
    this.logger.error(message, ...args);
  }

  /**
   * 获取 Logger 实例
   */
  getLogger(): Logger {
    return this.logger;
  }
}
