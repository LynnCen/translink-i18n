import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import type { I18nConfig } from '../types/config.js';
import { logger } from './logger.js';

export const DEFAULT_CONFIG: I18nConfig = {
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    functions: ['t', '$tsl', 'i18n.t'],
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js'],
  },
  hash: {
    algorithm: 'sha256',
    length: 8,
    includeContext: true,
    contextFields: ['componentName', 'functionName'],
  },
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
    fallback: 'zh-CN',
  },
  output: {
    directory: 'src/locales',
    format: 'json',
    splitByNamespace: false,
    flattenKeys: false,
  },
  plugins: [],
};

export class ConfigManager {
  private config: I18nConfig | null = null;
  private configPath: string | null = null;

  async loadConfig(cwd = process.cwd()): Promise<I18nConfig> {
    if (this.config) {
      return this.config;
    }

    const configFiles = [
      'translink.config.ts',
      'translink.config.js',
      'i18n.config.ts',
      'i18n.config.js',
    ];

    for (const configFile of configFiles) {
      const configPath = resolve(cwd, configFile);
      if (existsSync(configPath)) {
        this.configPath = configPath;
        this.config = await this.loadConfigFile(configPath);
        logger.debug(`Loaded config from ${configPath}`);
        return this.config;
      }
    }

    logger.warn('No config file found, using default configuration');
    this.config = DEFAULT_CONFIG;
    return this.config;
  }

  private async loadConfigFile(configPath: string): Promise<I18nConfig> {
    try {
      let config: any;

      if (configPath.endsWith('.ts') || configPath.endsWith('.js')) {
        // 动态导入配置文件
        const fileUrl = pathToFileURL(configPath).href;
        const module = await import(fileUrl);
        config = module.default || module;
      } else {
        // JSON 配置
        const content = readFileSync(configPath, 'utf-8');
        config = JSON.parse(content);
      }

      // 合并默认配置
      return this.mergeConfig(DEFAULT_CONFIG, config);
    } catch (error) {
      logger.error(`Failed to load config from ${configPath}: ${error}`);
      throw error;
    }
  }

  private mergeConfig(defaultConfig: I18nConfig, userConfig: any): I18nConfig {
    return {
      extract: { ...defaultConfig.extract, ...userConfig.extract },
      hash: { ...defaultConfig.hash, ...userConfig.hash },
      languages: { ...defaultConfig.languages, ...userConfig.languages },
      output: { ...defaultConfig.output, ...userConfig.output },
      plugins: userConfig.plugins || defaultConfig.plugins,
    };
  }

  getConfig(): I18nConfig {
    if (!this.config) {
      throw new Error('Config not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  getConfigPath(): string | null {
    return this.configPath;
  }
}

export const configManager = new ConfigManager();
