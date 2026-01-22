import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import type { I18nConfig } from '../types/config.js';
import { logger } from './logger.js';

export const DEFAULT_CONFIG: I18nConfig = {
  project: {
    name: 'my-app',
    version: '1.0.0',
  },
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    functions: ['t', '$tsl', 'i18n.t'],
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js'],
    incremental: true,
    createEmptyTranslations: true,
  },
  languages: {
    source: 'zh-CN',
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
    fallback: 'zh-CN',
  },
  output: {
    directory: 'src/locales',
    format: 'json',
    indent: 2,
    sortKeys: true,
    splitByNamespace: false,
    flattenKeys: false,
  },
  importExport: {
    format: 'excel',
    directory: 'translations', // 默认存放在 translations 目录
    outputFile: 'translations', // 默认文件名（会自动添加扩展名）
    excel: {
      sheetName: 'Translations',
      includeMetadata: false,
      freezeHeader: true,
      autoWidth: true,
    },
    csv: {
      delimiter: ',',
      encoding: 'utf-8',
      includeHeaders: true,
    },
  },
  build: {
    minify: true,
    sourcemap: false,
    outputDir: 'dist/locales',
  },
  cli: {
    verbose: false,
    table: {
      enabled: true,
      maxRows: 20,
      showDiff: true,
    },
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

      if (configPath.endsWith('.ts')) {
        // TypeScript 配置文件 - 使用 jiti 动态加载（与 Vite/Nuxt 相同的方案）
        try {
          // 动态导入 jiti
          const { createJiti } = await import('jiti');

          // 创建 jiti 实例
          const jiti = createJiti(process.cwd(), {
            interopDefault: true,
          });

          // 使用 jiti 加载 TypeScript 配置
          config = jiti(configPath);

          // 如果是 Promise，等待resolve
          if (config && typeof config.then === 'function') {
            config = await config;
          }

          // 处理 default export
          config = config?.default || config;

          logger.debug(`✓ 使用 jiti 加载 TypeScript 配置: ${configPath}`);
        } catch (jitiError: any) {
          logger.error(
            `Failed to load TypeScript config with jiti: ${jitiError.message}`
          );
          throw new Error(
            `无法加载 TypeScript 配置文件 ${configPath}。` +
              `错误: ${jitiError.message}`
          );
        }
      } else if (configPath.endsWith('.js') || configPath.endsWith('.mjs')) {
        // JavaScript 配置文件
        const fileUrl = pathToFileURL(configPath).href;
        const module = await import(fileUrl);
        config = module.default || module;
      } else if (configPath.endsWith('.json')) {
        // JSON 配置
        const content = readFileSync(configPath, 'utf-8');
        config = JSON.parse(content);
      } else {
        throw new Error(`不支持的配置文件格式: ${configPath}`);
      }

      // 合并默认配置
      return this.mergeConfig(DEFAULT_CONFIG, config);
    } catch (error) {
      logger.error(`Failed to load config from ${configPath}: ${error}`);
      throw error;
    }
  }

  private mergeConfig(
    defaultConfig: I18nConfig,
    userConfig: Partial<I18nConfig>
  ): I18nConfig {
    // 深度合并配置，用户配置优先
    return {
      project: userConfig.project
        ? { ...defaultConfig.project, ...userConfig.project }
        : defaultConfig.project,
      extract: userConfig.extract
        ? { ...defaultConfig.extract, ...userConfig.extract }
        : defaultConfig.extract,
      languages: {
        ...defaultConfig.languages,
        ...userConfig.languages,
        // 设置合理的默认值
        source:
          userConfig.languages?.source ||
          userConfig.languages?.default ||
          defaultConfig.languages.source,
        fallback:
          userConfig.languages?.fallback ||
          userConfig.languages?.default ||
          defaultConfig.languages.fallback,
      },
      output: { ...defaultConfig.output, ...userConfig.output },
      importExport: userConfig.importExport
        ? {
            ...defaultConfig.importExport,
            ...userConfig.importExport,
            excel: {
              ...defaultConfig.importExport?.excel,
              ...userConfig.importExport?.excel,
            },
            csv: {
              ...defaultConfig.importExport?.csv,
              ...userConfig.importExport?.csv,
            },
          }
        : defaultConfig.importExport,
      build: userConfig.build
        ? { ...defaultConfig.build, ...userConfig.build }
        : defaultConfig.build,
      cli: userConfig.cli
        ? {
            ...defaultConfig.cli,
            ...userConfig.cli,
            table: {
              ...defaultConfig.cli?.table,
              ...userConfig.cli?.table,
            },
          }
        : defaultConfig.cli,
      plugins: userConfig.plugins || defaultConfig.plugins,
      aiTranslation: userConfig.aiTranslation,
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

/**
 * Define configuration helper function
 * Provides type hints and validates config structure
 *
 * @example
 * ```typescript
 * import { defineConfig } from '@translink/i18n-cli';
 *
 * export default defineConfig({
 *   languages: {
 *     default: 'zh-CN',
 *     supported: ['zh-CN', 'en-US'],
 *   },
 *   output: {
 *     directory: 'src/locales',
 *   },
 * });
 * ```
 */
export function defineConfig(config: Partial<I18nConfig>): Partial<I18nConfig> {
  return config;
}
