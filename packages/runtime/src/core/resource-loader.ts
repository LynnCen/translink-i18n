/**
 * 资源加载器
 * 支持多种加载方式：静态资源、动态导入、HTTP 请求
 */

import type { TranslationResource, LoaderResult } from '../types/index.js';
import { EventEmitter } from '../utils/event-emitter.js';

export interface LoaderOptions {
  loadPath: string;
  loadFunction?: (lng: string, ns: string) => Promise<TranslationResource>;
  allowMultiLoading?: boolean;
  reloadInterval?: number;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ResourceLoader extends EventEmitter {
  private options: LoaderOptions;
  private loadingPromises = new Map<string, Promise<LoaderResult>>();
  private loadedResources = new Map<string, TranslationResource>();
  private reloadTimers = new Map<string, NodeJS.Timeout>();

  constructor(options: LoaderOptions) {
    super();
    this.options = {
      allowMultiLoading: false,
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      ...options,
    };
  }

  /**
   * 加载语言资源
   */
  async load(
    language: string,
    namespace: string = 'translation'
  ): Promise<TranslationResource> {
    const resourceKey = this.getResourceKey(language, namespace);

    // 如果已经在加载中，返回现有的 Promise
    if (this.loadingPromises.has(resourceKey)) {
      const result = await this.loadingPromises.get(resourceKey)!;
      if (result.status === 'success') {
        return result.data;
      }
      throw result.error;
    }

    // 如果已经加载过，直接返回
    if (this.loadedResources.has(resourceKey)) {
      return this.loadedResources.get(resourceKey)!;
    }

    // 开始加载
    const loadingPromise = this.performLoad(language, namespace);
    this.loadingPromises.set(resourceKey, loadingPromise);

    try {
      const result = await loadingPromise;

      if (result.status === 'success') {
        this.loadedResources.set(resourceKey, result.data);
        this.emit('resourceLoaded', language, namespace);

        // 设置自动重新加载
        if (this.options.reloadInterval && this.options.reloadInterval > 0) {
          this.scheduleReload(language, namespace);
        }

        return result.data;
      } else {
        this.emit('resourceLoadFailed', language, namespace, result.error!);
        throw result.error;
      }
    } finally {
      this.loadingPromises.delete(resourceKey);
    }
  }

  /**
   * 批量加载多个资源
   */
  async loadMultiple(
    requests: Array<{ language: string; namespace?: string }>
  ): Promise<Record<string, TranslationResource>> {
    if (!this.options.allowMultiLoading) {
      throw new Error('Multi-loading is not enabled');
    }

    const loadPromises = requests.map(
      async ({ language, namespace = 'translation' }) => {
        try {
          const resource = await this.load(language, namespace);
          return { key: this.getResourceKey(language, namespace), resource };
        } catch (error) {
          console.warn(`Failed to load ${language}/${namespace}:`, error);
          return {
            key: this.getResourceKey(language, namespace),
            resource: {},
          };
        }
      }
    );

    const results = await Promise.all(loadPromises);

    return results.reduce(
      (acc, { key, resource }) => {
        acc[key] = resource;
        return acc;
      },
      {} as Record<string, TranslationResource>
    );
  }

  /**
   * 重新加载资源
   */
  async reload(
    language: string,
    namespace: string = 'translation'
  ): Promise<TranslationResource> {
    const resourceKey = this.getResourceKey(language, namespace);

    // 清除已加载的资源
    this.loadedResources.delete(resourceKey);

    // 取消重新加载计时器
    const timer = this.reloadTimers.get(resourceKey);
    if (timer) {
      clearTimeout(timer);
      this.reloadTimers.delete(resourceKey);
    }

    return this.load(language, namespace);
  }

  /**
   * 预加载资源
   */
  async preload(
    languages: string[],
    namespace: string = 'translation'
  ): Promise<void> {
    const preloadPromises = languages.map(async language => {
      try {
        await this.load(language, namespace);
      } catch (error) {
        console.warn(`Failed to preload ${language}/${namespace}:`, error);
      }
    });

    await Promise.all(preloadPromises);
  }

  /**
   * 检查资源是否已加载
   */
  isLoaded(language: string, namespace: string = 'translation'): boolean {
    const resourceKey = this.getResourceKey(language, namespace);
    return this.loadedResources.has(resourceKey);
  }

  /**
   * 获取已加载的资源
   */
  getLoadedResource(
    language: string,
    namespace: string = 'translation'
  ): TranslationResource | null {
    const resourceKey = this.getResourceKey(language, namespace);
    return this.loadedResources.get(resourceKey) || null;
  }

  /**
   * 清除所有加载的资源
   */
  clearResources(): void {
    this.loadedResources.clear();

    // 清除所有重新加载计时器
    for (const timer of this.reloadTimers.values()) {
      clearTimeout(timer);
    }
    this.reloadTimers.clear();
  }

  /**
   * 执行实际的加载操作
   */
  private async performLoad(
    language: string,
    namespace: string
  ): Promise<LoaderResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.options.retries!; attempt++) {
      try {
        const data = await this.loadWithTimeout(language, namespace);
        return { data, status: 'success' };
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.options.retries!) {
          // 等待后重试
          await this.delay(this.options.retryDelay! * (attempt + 1));
        }
      }
    }

    return {
      data: {},
      status: 'error',
      error: lastError || new Error('Unknown loading error'),
    };
  }

  /**
   * 带超时的加载
   */
  private async loadWithTimeout(
    language: string,
    namespace: string
  ): Promise<TranslationResource> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Loading timeout for ${language}/${namespace}`));
      }, this.options.timeout);
    });

    const loadPromise = this.options.loadFunction
      ? this.options.loadFunction(language, namespace)
      : this.loadFromPath(language, namespace);

    return Promise.race([loadPromise, timeoutPromise]);
  }

  /**
   * 从路径加载资源
   */
  private async loadFromPath(
    language: string,
    namespace: string
  ): Promise<TranslationResource> {
    const url = this.options.loadPath
      .replace('{{lng}}', language)
      .replace('{{ns}}', namespace);

    // 判断是否为相对路径（用于动态导入）
    if (url.startsWith('./') || url.startsWith('../') || !url.includes('://')) {
      return this.loadByImport(url);
    }

    // HTTP 加载
    return this.loadByFetch(url);
  }

  /**
   * 通过动态导入加载
   */
  private async loadByImport(path: string): Promise<TranslationResource> {
    try {
      const module = await import(path);
      return module.default || module;
    } catch (error) {
      throw new Error(`Failed to import resource from ${path}: ${error}`);
    }
  }

  /**
   * 通过 fetch 加载
   */
  private async loadByFetch(url: string): Promise<TranslationResource> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        return JSON.parse(text);
      }
    } catch (error) {
      throw new Error(`Failed to fetch resource from ${url}: ${error}`);
    }
  }

  /**
   * 生成资源键
   */
  private getResourceKey(language: string, namespace: string): string {
    return `${language}/${namespace}`;
  }

  /**
   * 调度重新加载
   */
  private scheduleReload(language: string, namespace: string): void {
    const resourceKey = this.getResourceKey(language, namespace);

    // 清除现有的计时器
    const existingTimer = this.reloadTimers.get(resourceKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 设置新的计时器
    const timer = setTimeout(() => {
      this.reload(language, namespace).catch(error => {
        console.warn(`Auto-reload failed for ${resourceKey}:`, error);
      });
    }, this.options.reloadInterval);

    this.reloadTimers.set(resourceKey, timer);
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 销毁加载器
   */
  destroy(): void {
    this.clearResources();
    this.loadingPromises.clear();
    this.removeAllListeners();
  }
}
