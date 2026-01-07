/**
 * 插件加载器
 */

import { resolve } from 'path';
import { existsSync } from 'fs';
import type {
  I18nPlugin,
  PluginContext,
  PluginConfig,
  PluginLoaderOptions,
} from './types.js';
import { logger } from '../utils/logger.js';

export class PluginLoader {
  private plugins: Map<string, I18nPlugin> = new Map();
  private context: PluginContext | null = null;

  /**
   * 加载插件
   */
  async loadPlugin(
    pluginName: string,
    pluginConfig?: PluginConfig,
    options?: PluginLoaderOptions
  ): Promise<I18nPlugin> {
    try {
      // 检查是否已加载
      if (this.plugins.has(pluginName)) {
        return this.plugins.get(pluginName)!;
      }

      // 尝试加载插件
      let pluginModule: any;

      // 1. 尝试作为 npm 包加载
      try {
        pluginModule = await import(pluginName);
      } catch (error) {
        // 2. 尝试作为本地路径加载
        const localPath = resolve(options?.cwd || process.cwd(), pluginName);
        if (existsSync(localPath)) {
          pluginModule = await import(localPath);
        } else {
          throw new Error(`Plugin "${pluginName}" not found`);
        }
      }

      // 获取插件实例
      const plugin: I18nPlugin =
        pluginModule.default || pluginModule.plugin || pluginModule;

      if (!plugin || typeof plugin !== 'object') {
        throw new Error(`Invalid plugin format: ${pluginName}`);
      }

      // 验证插件元数据
      if (!plugin.metadata || !plugin.metadata.name) {
        throw new Error(`Plugin "${pluginName}" missing metadata`);
      }

      // 初始化插件上下文
      if (!this.context && options) {
        this.context = {
          config: options.config || {},
          logger: options.logger || logger,
          cwd: options.cwd || process.cwd(),
        };
      }

      // 初始化插件
      if (plugin.init && this.context) {
        try {
          await plugin.init(this.context, pluginConfig || {});
        } catch (error) {
          logger.warn(`Plugin "${pluginName}" initialization failed: ${error}`);
        }
      }

      // 注册插件
      this.plugins.set(pluginName, plugin);

      logger.debug(`Plugin "${pluginName}" loaded successfully`);

      return plugin;
    } catch (error) {
      logger.error(`Failed to load plugin "${pluginName}": ${error}`);
      throw error;
    }
  }

  /**
   * 批量加载插件
   */
  async loadPlugins(
    pluginConfigs: Array<string | [string, PluginConfig]>,
    options?: PluginLoaderOptions
  ): Promise<Map<string, I18nPlugin>> {
    const loadedPlugins = new Map<string, I18nPlugin>();

    for (const pluginConfig of pluginConfigs) {
      let pluginName: string;
      let config: PluginConfig | undefined;

      if (Array.isArray(pluginConfig)) {
        [pluginName, config] = pluginConfig;
      } else {
        pluginName = pluginConfig;
      }

      try {
        const plugin = await this.loadPlugin(pluginName, config, options);
        loadedPlugins.set(pluginName, plugin);
      } catch (error) {
        logger.warn(`Skipping plugin "${pluginName}": ${error}`);
      }
    }

    return loadedPlugins;
  }

  /**
   * 获取已加载的插件
   */
  getPlugin(name: string): I18nPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 获取所有已加载的插件
   */
  getAllPlugins(): Map<string, I18nPlugin> {
    return new Map(this.plugins);
  }

  /**
   * 卸载插件
   */
  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      if (plugin.cleanup) {
        try {
          await plugin.cleanup();
        } catch (error) {
          logger.warn(`Plugin "${name}" cleanup failed: ${error}`);
        }
      }
      this.plugins.delete(name);
    }
  }

  /**
   * 卸载所有插件
   */
  async unloadAll(): Promise<void> {
    const pluginNames = Array.from(this.plugins.keys());
    for (const name of pluginNames) {
      await this.unloadPlugin(name);
    }
  }

  /**
   * 设置插件上下文
   */
  setContext(context: PluginContext): void {
    this.context = context;
  }
}

// 单例实例
export const pluginLoader = new PluginLoader();
