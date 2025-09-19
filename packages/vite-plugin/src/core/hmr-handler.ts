import type { ResolvedConfig, ViteDevServer, HmrContext } from 'vite';
import type { FSWatcher } from 'chokidar';
import chokidar from 'chokidar';
import path from 'node:path';
import fs from 'node:fs/promises';
import type { 
  I18nPluginOptions, 
  HMRUpdateInfo,
  LanguageResource 
} from '../types/index.js';
import type { LanguageLoader } from './language-loader.js';
import { logger } from '../utils/logger.js';

/**
 * HMR 处理器 - 负责热更新功能
 */
export class HMRHandler {
  private options: I18nPluginOptions;
  private config: ResolvedConfig;
  private server: ViteDevServer;
  private languageLoader: LanguageLoader;
  private watcher: FSWatcher | null = null;
  private languageFiles = new Map<string, LanguageResource>();

  constructor(
    options: I18nPluginOptions,
    config: ResolvedConfig,
    server: ViteDevServer,
    languageLoader: LanguageLoader
  ) {
    this.options = options;
    this.config = config;
    this.server = server;
    this.languageLoader = languageLoader;
  }

  /**
   * 设置 HMR 监听
   */
  setup(): void {
    this.setupLanguageFileWatcher();
    this.setupConfigFileWatcher();
    this.injectHMRClient();
  }

  /**
   * 设置语言文件监听
   */
  private setupLanguageFileWatcher(): void {
    const localesPath = path.resolve(this.config.root, 'locales');
    
    this.watcher = chokidar.watch(`${localesPath}/**/*.json`, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: false
    });

    this.watcher
      .on('add', (filePath) => this.handleLanguageFileChange(filePath, 'add'))
      .on('change', (filePath) => this.handleLanguageFileChange(filePath, 'change'))
      .on('unlink', (filePath) => this.handleLanguageFileChange(filePath, 'unlink'))
      .on('error', (error) => {
        logger.error('Language file watcher error:', error);
      });

    if (this.options.debug) {
      logger.info(`Watching language files in: ${localesPath}`);
    }
  }

  /**
   * 设置配置文件监听
   */
  private setupConfigFileWatcher(): void {
    const configPath = path.resolve(this.config.root, this.options.configFile || 'i18n.config.ts');
    
    if (this.watcher) {
      this.watcher.add(configPath);
    }
  }

  /**
   * 注入 HMR 客户端代码
   */
  private injectHMRClient(): void {
    const clientCode = `
// TransLink I18n HMR Client
if (import.meta.hot) {
  import.meta.hot.on('i18n:language-updated', (data) => {
    console.log('[TransLink I18n] Language updated:', data);
    
    // 通知运行时库更新
    if (window.__TRANSLINK_I18N__) {
      window.__TRANSLINK_I18N__.handleHMRUpdate(data);
    }
    
    // 强制重新渲染
    if (data.forceReload) {
      window.location.reload();
    }
  });

  import.meta.hot.on('i18n:config-updated', (data) => {
    console.log('[TransLink I18n] Config updated:', data);
    window.location.reload();
  });

  import.meta.hot.on('i18n:keys-extracted', (data) => {
    console.log('[TransLink I18n] New keys extracted:', data);
    
    // 可选：显示开发者通知
    if (data.newKeys.length > 0) {
      console.group('[TransLink I18n] New translation keys detected:');
      data.newKeys.forEach(key => console.log('  -', key));
      console.groupEnd();
    }
  });
}`;

    // 将客户端代码添加到虚拟模块
    this.server.ws.send({
      type: 'custom',
      event: 'i18n:client-inject',
      data: { code: clientCode }
    });
  }

  /**
   * 处理语言文件变更
   */
  private async handleLanguageFileChange(
    filePath: string, 
    changeType: 'add' | 'change' | 'unlink'
  ): Promise<void> {
    try {
      const relativePath = path.relative(this.config.root, filePath);
      const { language, namespace } = this.parseLanguageFilePath(filePath);

      if (!language) {
        return;
      }

      let updateInfo: HMRUpdateInfo;

      switch (changeType) {
        case 'add':
        case 'change':
          // 重新加载语言资源
          const resource = await this.languageLoader.loadLanguageResource(language, namespace);
          this.languageFiles.set(`${language}:${namespace}`, resource);

          updateInfo = {
            type: 'resource-updated',
            languages: [language],
            namespaces: [namespace],
            files: [relativePath],
            timestamp: Date.now()
          };

          if (this.options.debug) {
            logger.info(`Language file ${changeType}:`, relativePath);
          }
          break;

        case 'unlink':
          this.languageFiles.delete(`${language}:${namespace}`);
          
          updateInfo = {
            type: 'resource-updated',
            languages: [language],
            namespaces: [namespace],
            files: [relativePath],
            timestamp: Date.now()
          };

          if (this.options.debug) {
            logger.info(`Language file removed:`, relativePath);
          }
          break;
      }

      // 发送 HMR 更新
      this.sendHMRUpdate(updateInfo);

    } catch (error) {
      logger.error(`Error handling language file change (${filePath}):`, error);
    }
  }

  /**
   * 处理语言文件更新（Vite HMR 回调）
   */
  async handleLanguageFileUpdate(ctx: HmrContext): Promise<void> {
    const { file, server } = ctx;
    
    try {
      const { language, namespace } = this.parseLanguageFilePath(file);
      
      if (!language) {
        return;
      }

      // 重新加载资源
      const resource = await this.languageLoader.loadLanguageResource(language, namespace);
      
      const updateInfo: HMRUpdateInfo = {
        type: 'resource-updated',
        languages: [language],
        namespaces: [namespace],
        files: [path.relative(this.config.root, file)],
        timestamp: Date.now()
      };

      // 发送自定义 HMR 事件
      server.ws.send({
        type: 'custom',
        event: 'i18n:language-updated',
        data: {
          ...updateInfo,
          resource: resource.content
        }
      });

      if (this.options.debug) {
        logger.info('HMR: Language file updated', updateInfo);
      }

    } catch (error) {
      logger.error('HMR: Error updating language file:', error);
    }
  }

  /**
   * 处理配置文件更新
   */
  async handleConfigFileUpdate(ctx: HmrContext): Promise<void> {
    const { server } = ctx;
    
    try {
      const updateInfo: HMRUpdateInfo = {
        type: 'config-changed',
        timestamp: Date.now()
      };

      // 配置文件变更通常需要重新加载
      server.ws.send({
        type: 'custom',
        event: 'i18n:config-updated',
        data: {
          ...updateInfo,
          forceReload: true
        }
      });

      if (this.options.debug) {
        logger.info('HMR: Config file updated, reloading...');
      }

    } catch (error) {
      logger.error('HMR: Error updating config file:', error);
    }
  }

  /**
   * 发送 HMR 更新
   */
  private sendHMRUpdate(updateInfo: HMRUpdateInfo): void {
    this.server.ws.send({
      type: 'custom',
      event: 'i18n:language-updated',
      data: updateInfo
    });
  }

  /**
   * 解析语言文件路径
   */
  private parseLanguageFilePath(filePath: string): { language: string | null; namespace: string } {
    const fileName = path.basename(filePath, '.json');
    const parts = fileName.split('.');
    
    if (parts.length === 1) {
      // 简单格式: zh-CN.json
      return {
        language: parts[0],
        namespace: 'translation'
      };
    } else if (parts.length === 2) {
      // 命名空间格式: zh-CN.common.json
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
   * 获取当前加载的语言文件
   */
  getLoadedLanguageFiles(): Map<string, LanguageResource> {
    return new Map(this.languageFiles);
  }

  /**
   * 手动触发语言更新
   */
  async triggerLanguageUpdate(language: string, namespace: string = 'translation'): Promise<void> {
    try {
      const resource = await this.languageLoader.loadLanguageResource(language, namespace);
      
      const updateInfo: HMRUpdateInfo = {
        type: 'language-changed',
        languages: [language],
        namespaces: [namespace],
        timestamp: Date.now()
      };

      this.sendHMRUpdate(updateInfo);
      
      if (this.options.debug) {
        logger.info('Manual language update triggered:', updateInfo);
      }
    } catch (error) {
      logger.error('Error triggering manual language update:', error);
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    
    this.languageFiles.clear();
    
    if (this.options.debug) {
      logger.info('HMR handler disposed');
    }
  }
}
