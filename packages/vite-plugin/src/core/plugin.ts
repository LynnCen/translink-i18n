import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { createFilter } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import { I18nTransformer } from './transformer.js';
import { LanguageLoader } from './language-loader.js';
import { HMRHandler } from './hmr-handler.js';
import { ConfigManager } from './config-manager.js';
import type { I18nPluginOptions, TransformContext } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * TransLink I18n Vite 插件
 */
export function createI18nPlugin(options: I18nPluginOptions = {}): Plugin {
  let config: ResolvedConfig;
  let server: ViteDevServer | undefined;
  let transformer: I18nTransformer;
  let languageLoader: LanguageLoader;
  let hmrHandler: HMRHandler;
  let configManager: ConfigManager;
  let filter: (id: string) => boolean;

  // 默认选项
  const resolvedOptions: Required<I18nPluginOptions> = {
    configFile: 'i18n.config.ts',
    include: ['**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**'],
    defaultLanguage: 'zh-CN',
    supportedLanguages: ['zh-CN', 'en-US'],
    loadPath: './locales/{{lng}}.json',
    hmr: true,
    lazyLoading: true,
    transformTsl: true,
    debug: false,
    transformRules: [],
    preload: {
      languages: [],
      timing: 'immediate',
      namespaces: ['translation']
    },
    ...options
  };

  return {
    name: 'translink-i18n',
    
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      
      // 创建文件过滤器
      filter = createFilter(
        resolvedOptions.include,
        resolvedOptions.exclude
      );

      // 初始化核心组件
      configManager = new ConfigManager(resolvedOptions, config);
      transformer = new I18nTransformer(resolvedOptions, config);
      languageLoader = new LanguageLoader(resolvedOptions, config);
      
      if (resolvedOptions.debug) {
        logger.info('TransLink I18n plugin initialized', {
          mode: config.command,
          options: resolvedOptions
        });
      }
    },

    configureServer(devServer) {
      server = devServer;
      
      if (resolvedOptions.hmr) {
        hmrHandler = new HMRHandler(
          resolvedOptions,
          config,
          devServer,
          languageLoader
        );
        hmrHandler.setup();
      }

      // 添加中间件处理语言文件请求
      devServer.middlewares.use('/api/i18n', (req, res, next) => {
        if (req.method === 'GET' && req.url) {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const language = url.searchParams.get('lang');
          const namespace = url.searchParams.get('ns') || 'translation';

          if (language) {
            languageLoader.loadLanguageResource(language, namespace)
              .then(resource => {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Cache-Control', 'no-cache');
                res.end(JSON.stringify(resource.content));
              })
              .catch(error => {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: error.message }));
              });
            return;
          }
        }
        next();
      });
    },

    buildStart() {
      // 预加载语言资源
      if (resolvedOptions.preload.languages.length > 0) {
        const preloadPromises = resolvedOptions.preload.languages.map(lang =>
          languageLoader.loadLanguageResource(lang, 'translation')
            .catch(error => {
              logger.warn(`Failed to preload language ${lang}:`, error);
            })
        );
        
        return Promise.all(preloadPromises);
      }
    },

    async transform(code, id) {
      // 只处理匹配的文件
      if (!filter(id)) {
        return null;
      }

      // 跳过虚拟模块和 node_modules
      if (id.includes('virtual:') || id.includes('node_modules')) {
        return null;
      }

      try {
        const context: TransformContext = {
          filename: id,
          isDev: config.command === 'serve',
          isSSR: config.build?.ssr === true,
          options: resolvedOptions
        };

        const result = await transformer.transform(code, context);
        
        if (result.hasChanged) {
          if (resolvedOptions.debug) {
            logger.info(`Transformed ${path.relative(config.root, id)}`, {
              stats: result.stats,
              extractedKeys: result.extractedKeys?.length || 0
            });
          }

          return {
            code: result.code,
            map: result.map
          };
        }

        return null;
      } catch (error) {
        logger.error(`Transform error in ${id}:`, error);
        return null;
      }
    },

    generateBundle(options, bundle) {
      // 在构建时注入语言资源
      if (config.command === 'build' && resolvedOptions.lazyLoading) {
        const languageChunks = languageLoader.generateLanguageChunks();
        
        for (const [chunkName, chunkContent] of languageChunks) {
          this.emitFile({
            type: 'asset',
            fileName: `locales/${chunkName}.json`,
            source: JSON.stringify(chunkContent, null, 2)
          });
        }
      }
    },

    handleHotUpdate(ctx) {
      if (!resolvedOptions.hmr || !hmrHandler) {
        return;
      }

      // 处理语言文件更新
      if (ctx.file.includes('/locales/') && ctx.file.endsWith('.json')) {
        return hmrHandler.handleLanguageFileUpdate(ctx);
      }

      // 处理配置文件更新
      if (ctx.file.endsWith(resolvedOptions.configFile)) {
        return hmrHandler.handleConfigFileUpdate(ctx);
      }

      return;
    },

    // 添加虚拟模块支持
    resolveId(id) {
      if (id.startsWith('virtual:i18n-')) {
        return id;
      }
      return null;
    },

    load(id) {
      if (id.startsWith('virtual:i18n-language-')) {
        const language = id.replace('virtual:i18n-language-', '');
        return languageLoader.generateLanguageModule(language);
      }

      if (id === 'virtual:i18n-config') {
        return configManager.generateConfigModule();
      }

      return null;
    }
  };
}

/**
 * 默认导出
 */
export default createI18nPlugin;
