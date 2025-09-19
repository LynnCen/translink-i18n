import type { ResolvedConfig } from 'vite';
import path from 'node:path';
import fs from 'node:fs/promises';
import type { I18nPluginOptions } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * 配置管理器 - 负责 i18n 配置的加载和管理
 */
export class ConfigManager {
  private options: I18nPluginOptions;
  private config: ResolvedConfig;
  private userConfig: any = null;
  private configPath: string;

  constructor(options: I18nPluginOptions, config: ResolvedConfig) {
    this.options = options;
    this.config = config;
    this.configPath = path.resolve(config.root, options.configFile || 'i18n.config.ts');
  }

  /**
   * 加载用户配置
   */
  async loadUserConfig(): Promise<any> {
    try {
      // 检查配置文件是否存在
      await fs.access(this.configPath);
      
      // 动态导入配置文件
      const configModule = await import(this.configPath + '?t=' + Date.now());
      this.userConfig = configModule.default || configModule;
      
      if (this.options.debug) {
        logger.info('Loaded user config:', {
          path: path.relative(this.config.root, this.configPath),
          config: this.userConfig
        });
      }

      return this.userConfig;
    } catch (error) {
      if (this.options.debug) {
        logger.warn('No user config found, using defaults:', error);
      }
      
      // 返回默认配置
      this.userConfig = this.getDefaultConfig();
      return this.userConfig;
    }
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): any {
    return {
      defaultLanguage: 'zh-CN',
      supportedLanguages: ['zh-CN', 'en-US'],
      loadPath: './locales/{{lng}}.json',
      fallbackLanguage: 'zh-CN',
      debug: false,
      cache: {
        enabled: true,
        maxSize: 1000,
        ttl: 5 * 60 * 1000, // 5 minutes
        storage: 'memory'
      },
      interpolation: {
        prefix: '{{',
        suffix: '}}',
        escapeValue: true
      }
    };
  }

  /**
   * 合并配置
   */
  getMergedConfig(): any {
    const defaultConfig = this.getDefaultConfig();
    const userConfig = this.userConfig || {};
    
    return {
      ...defaultConfig,
      ...userConfig,
      cache: {
        ...defaultConfig.cache,
        ...(userConfig.cache || {})
      },
      interpolation: {
        ...defaultConfig.interpolation,
        ...(userConfig.interpolation || {})
      }
    };
  }

  /**
   * 生成配置模块代码（用于虚拟模块）
   */
  generateConfigModule(): string {
    const mergedConfig = this.getMergedConfig();
    
    return `
// Auto-generated i18n config module
export const i18nConfig = ${JSON.stringify(mergedConfig, null, 2)};

export default i18nConfig;

// Runtime helpers
export function getLanguagePath(language, namespace = 'translation') {
  const loadPath = i18nConfig.loadPath || './locales/{{lng}}.json';
  return loadPath
    .replace('{{lng}}', language)
    .replace('{{ns}}', namespace);
}

export function getSupportedLanguages() {
  return i18nConfig.supportedLanguages || ['zh-CN', 'en-US'];
}

export function getDefaultLanguage() {
  return i18nConfig.defaultLanguage || 'zh-CN';
}

export function getFallbackLanguage() {
  return i18nConfig.fallbackLanguage || i18nConfig.defaultLanguage || 'zh-CN';
}

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept();
}
`;
  }

  /**
   * 创建默认配置文件
   */
  async createDefaultConfigFile(): Promise<void> {
    const defaultConfigContent = `import type { I18nConfig } from '@translink/i18n-runtime';

const config: I18nConfig = {
  // 默认语言
  defaultLanguage: 'zh-CN',
  
  // 回退语言
  fallbackLanguage: 'zh-CN',
  
  // 支持的语言列表
  supportedLanguages: ['zh-CN', 'en-US'],
  
  // 语言文件路径模板
  loadPath: './locales/{{lng}}.json',
  
  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5 分钟
    storage: 'memory' // 'memory' | 'localStorage' | 'sessionStorage'
  },
  
  // 插值配置
  interpolation: {
    prefix: '{{',
    suffix: '}}',
    escapeValue: true,
    // 自定义格式化函数
    format: (value, format, lng) => {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      return value;
    }
  },
  
  // 调试模式
  debug: process.env.NODE_ENV === 'development',
  
  // 预加载配置
  preload: {
    languages: ['zh-CN'], // 预加载的语言
    timing: 'immediate', // 'immediate' | 'idle' | 'interaction'
    namespaces: ['translation'] // 预加载的命名空间
  }
};

export default config;
`;

    try {
      await fs.writeFile(this.configPath, defaultConfigContent, 'utf-8');
      
      logger.info('Created default i18n config file:', {
        path: path.relative(this.config.root, this.configPath)
      });
    } catch (error) {
      logger.error('Failed to create default config file:', error);
      throw error;
    }
  }

  /**
   * 验证配置
   */
  validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 检查必需字段
    if (!config.defaultLanguage) {
      errors.push('defaultLanguage is required');
    }
    
    if (!config.supportedLanguages || !Array.isArray(config.supportedLanguages)) {
      errors.push('supportedLanguages must be an array');
    }
    
    if (config.supportedLanguages && !config.supportedLanguages.includes(config.defaultLanguage)) {
      errors.push('defaultLanguage must be included in supportedLanguages');
    }
    
    if (!config.loadPath) {
      errors.push('loadPath is required');
    }
    
    // 检查缓存配置
    if (config.cache) {
      if (typeof config.cache.enabled !== 'boolean') {
        errors.push('cache.enabled must be a boolean');
      }
      
      if (config.cache.maxSize && typeof config.cache.maxSize !== 'number') {
        errors.push('cache.maxSize must be a number');
      }
      
      if (config.cache.ttl && typeof config.cache.ttl !== 'number') {
        errors.push('cache.ttl must be a number');
      }
      
      if (config.cache.storage && !['memory', 'localStorage', 'sessionStorage'].includes(config.cache.storage)) {
        errors.push('cache.storage must be one of: memory, localStorage, sessionStorage');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取配置文件路径
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * 检查配置文件是否存在
   */
  async configExists(): Promise<boolean> {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 重新加载配置
   */
  async reloadConfig(): Promise<any> {
    // 清除模块缓存
    if (require.cache[this.configPath]) {
      delete require.cache[this.configPath];
    }
    
    return this.loadUserConfig();
  }

  /**
   * 获取当前配置
   */
  getCurrentConfig(): any {
    return this.userConfig || this.getDefaultConfig();
  }
}
