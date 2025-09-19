import type { ResolvedConfig } from 'vite';
import path from 'node:path';
import fs from 'node:fs/promises';
import { glob } from 'fast-glob';
import type { 
  I18nPluginOptions, 
  LanguageResource 
} from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * 语言加载器 - 负责语言资源的加载和管理
 */
export class LanguageLoader {
  private options: I18nPluginOptions;
  private config: ResolvedConfig;
  private resourceCache = new Map<string, LanguageResource>();
  private loadingPromises = new Map<string, Promise<LanguageResource>>();

  constructor(options: I18nPluginOptions, config: ResolvedConfig) {
    this.options = options;
    this.config = config;
  }

  /**
   * 加载语言资源
   */
  async loadLanguageResource(
    language: string, 
    namespace: string = 'translation'
  ): Promise<LanguageResource> {
    const resourceKey = `${language}:${namespace}`;
    
    // 检查缓存
    if (this.resourceCache.has(resourceKey)) {
      const cached = this.resourceCache.get(resourceKey)!;
      
      // 检查文件是否有更新
      try {
        const stats = await fs.stat(cached.path);
        if (stats.mtime.getTime() === cached.mtime) {
          return cached;
        }
      } catch {
        // 文件可能被删除，从缓存中移除
        this.resourceCache.delete(resourceKey);
      }
    }

    // 避免重复加载
    if (this.loadingPromises.has(resourceKey)) {
      return this.loadingPromises.get(resourceKey)!;
    }

    // 执行加载
    const loadingPromise = this.performLoad(language, namespace);
    this.loadingPromises.set(resourceKey, loadingPromise);

    try {
      const resource = await loadingPromise;
      this.resourceCache.set(resourceKey, resource);
      return resource;
    } finally {
      this.loadingPromises.delete(resourceKey);
    }
  }

  /**
   * 执行实际的加载操作
   */
  private async performLoad(
    language: string, 
    namespace: string
  ): Promise<LanguageResource> {
    const filePath = this.resolveLanguageFilePath(language, namespace);
    
    try {
      const [content, stats] = await Promise.all([
        fs.readFile(filePath, 'utf-8'),
        fs.stat(filePath)
      ]);

      const parsedContent = JSON.parse(content);
      
      const resource: LanguageResource = {
        language,
        namespace,
        path: filePath,
        content: parsedContent,
        mtime: stats.mtime.getTime()
      };

      if (this.options.debug) {
        logger.info(`Loaded language resource: ${language}:${namespace}`, {
          path: path.relative(this.config.root, filePath),
          keys: Object.keys(parsedContent).length
        });
      }

      return resource;
    } catch (error) {
      if (this.options.debug) {
        logger.warn(`Failed to load language resource: ${language}:${namespace}`, error);
      }
      
      // 返回空资源而不是抛出错误
      return {
        language,
        namespace,
        path: filePath,
        content: {},
        mtime: 0
      };
    }
  }

  /**
   * 解析语言文件路径
   */
  private resolveLanguageFilePath(language: string, namespace: string): string {
    const loadPath = this.options.loadPath || './locales/{{lng}}.json';
    
    let filePath = loadPath
      .replace('{{lng}}', language)
      .replace('{{ns}}', namespace);

    // 如果包含命名空间且不是默认的 translation，调整路径
    if (namespace !== 'translation') {
      const ext = path.extname(filePath);
      const base = path.basename(filePath, ext);
      const dir = path.dirname(filePath);
      filePath = path.join(dir, `${base}.${namespace}${ext}`);
    }

    return path.resolve(this.config.root, filePath);
  }

  /**
   * 批量加载语言资源
   */
  async loadMultipleLanguages(
    languages: string[], 
    namespaces: string[] = ['translation']
  ): Promise<Map<string, LanguageResource>> {
    const results = new Map<string, LanguageResource>();
    const loadPromises: Promise<void>[] = [];

    for (const language of languages) {
      for (const namespace of namespaces) {
        const promise = this.loadLanguageResource(language, namespace)
          .then(resource => {
            results.set(`${language}:${namespace}`, resource);
          })
          .catch(error => {
            logger.warn(`Failed to load ${language}:${namespace}:`, error);
          });
        
        loadPromises.push(promise);
      }
    }

    await Promise.all(loadPromises);
    return results;
  }

  /**
   * 扫描可用的语言文件
   */
  async scanAvailableLanguages(): Promise<{
    languages: string[];
    namespaces: string[];
    files: string[];
  }> {
    const localesDir = path.resolve(this.config.root, 'locales');
    
    try {
      const files = await glob('**/*.json', {
        cwd: localesDir,
        absolute: false
      });

      const languages = new Set<string>();
      const namespaces = new Set<string>();

      for (const file of files) {
        const parsed = this.parseLanguageFileName(file);
        if (parsed.language) {
          languages.add(parsed.language);
          namespaces.add(parsed.namespace);
        }
      }

      return {
        languages: Array.from(languages).sort(),
        namespaces: Array.from(namespaces).sort(),
        files: files.sort()
      };
    } catch (error) {
      logger.warn('Failed to scan language files:', error);
      return {
        languages: this.options.supportedLanguages || [],
        namespaces: ['translation'],
        files: []
      };
    }
  }

  /**
   * 解析语言文件名
   */
  private parseLanguageFileName(fileName: string): {
    language: string | null;
    namespace: string;
  } {
    const baseName = path.basename(fileName, '.json');
    const parts = baseName.split('.');
    
    if (parts.length === 1) {
      return {
        language: parts[0],
        namespace: 'translation'
      };
    } else if (parts.length === 2) {
      return {
        language: parts[0],
        namespace: parts[1]
      };
    }
    
    return {
      language: null,
      namespace: 'translation'
    };
  }

  /**
   * 生成语言模块代码（用于虚拟模块）
   */
  generateLanguageModule(language: string): string {
    const resources = Array.from(this.resourceCache.values())
      .filter(r => r.language === language);

    if (resources.length === 0) {
      return `export default {};`;
    }

    const moduleContent = resources.reduce((acc, resource) => {
      acc[resource.namespace] = resource.content;
      return acc;
    }, {} as Record<string, any>);

    return `export default ${JSON.stringify(moduleContent, null, 2)};`;
  }

  /**
   * 生成语言块（用于构建时）
   */
  generateLanguageChunks(): Map<string, any> {
    const chunks = new Map<string, any>();
    
    for (const resource of this.resourceCache.values()) {
      const chunkName = resource.namespace === 'translation' 
        ? resource.language 
        : `${resource.language}.${resource.namespace}`;
      
      chunks.set(chunkName, resource.content);
    }

    return chunks;
  }

  /**
   * 预加载语言资源
   */
  async preloadLanguages(languages?: string[]): Promise<void> {
    const targetLanguages = languages || this.options.supportedLanguages || [];
    const preloadNamespaces = this.options.preload?.namespaces || ['translation'];

    if (targetLanguages.length === 0) {
      return;
    }

    try {
      await this.loadMultipleLanguages(targetLanguages, preloadNamespaces);
      
      if (this.options.debug) {
        logger.info('Preloaded languages:', {
          languages: targetLanguages,
          namespaces: preloadNamespaces
        });
      }
    } catch (error) {
      logger.warn('Error preloading languages:', error);
    }
  }

  /**
   * 获取资源统计信息
   */
  getStats(): {
    cachedResources: number;
    loadingPromises: number;
    languages: string[];
    namespaces: string[];
  } {
    const languages = new Set<string>();
    const namespaces = new Set<string>();

    for (const resource of this.resourceCache.values()) {
      languages.add(resource.language);
      namespaces.add(resource.namespace);
    }

    return {
      cachedResources: this.resourceCache.size,
      loadingPromises: this.loadingPromises.size,
      languages: Array.from(languages),
      namespaces: Array.from(namespaces)
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.resourceCache.clear();
    this.loadingPromises.clear();
    
    if (this.options.debug) {
      logger.info('Language loader cache cleared');
    }
  }

  /**
   * 获取特定语言的资源
   */
  getLanguageResource(language: string, namespace: string = 'translation'): LanguageResource | null {
    return this.resourceCache.get(`${language}:${namespace}`) || null;
  }

  /**
   * 检查语言资源是否存在
   */
  hasLanguageResource(language: string, namespace: string = 'translation'): boolean {
    return this.resourceCache.has(`${language}:${namespace}`);
  }
}
