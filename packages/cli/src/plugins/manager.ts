/**
 * 插件管理器
 */

import type { I18nPlugin, PluginContext, PluginConfig } from './types.js';
import { PluginLoader } from './loader.js';
import { logger } from '../utils/logger.js';

export class PluginManager {
  private loader: PluginLoader;
  private context: PluginContext | null = null;

  constructor(loader?: PluginLoader) {
    this.loader = loader || new PluginLoader();
  }

  /**
   * 初始化插件管理器
   */
  async initialize(context: PluginContext, pluginConfigs: Array<string | [string, PluginConfig]>): Promise<void> {
    this.context = context;
    this.loader.setContext(context);

    if (pluginConfigs.length === 0) {
      return;
    }

    logger.info(`Loading ${pluginConfigs.length} plugin(s)...`);

    try {
      await this.loader.loadPlugins(pluginConfigs, {
        cwd: context.cwd,
        config: context.config,
        logger: context.logger,
      });

      const loadedPlugins = this.loader.getAllPlugins();
      if (loadedPlugins.size > 0) {
        logger.success(`Loaded ${loadedPlugins.size} plugin(s):`);
        for (const [name, plugin] of loadedPlugins) {
          logger.info(`  - ${plugin.metadata.name}@${plugin.metadata.version}`);
        }
      }
    } catch (error) {
      logger.warn(`Some plugins failed to load: ${error}`);
    }
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): I18nPlugin | undefined {
    return this.loader.getPlugin(name);
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Map<string, I18nPlugin> {
    return this.loader.getAllPlugins();
  }

  /**
   * 执行推送操作
   */
  async push(pluginName: string, data: any): Promise<any> {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }

    if (!plugin.push) {
      throw new Error(`Plugin "${pluginName}" does not support push operation`);
    }

    try {
      return await plugin.push(data);
    } catch (error) {
      logger.error(`Plugin "${pluginName}" push failed: ${error}`);
      throw error;
    }
  }

  /**
   * 执行拉取操作
   */
  async pull(pluginName: string, data: any): Promise<any> {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }

    if (!plugin.pull) {
      throw new Error(`Plugin "${pluginName}" does not support pull operation`);
    }

    try {
      return await plugin.pull(data);
    } catch (error) {
      logger.error(`Plugin "${pluginName}" pull failed: ${error}`);
      throw error;
    }
  }

  /**
   * 获取统计信息
   */
  async getStats(pluginName: string): Promise<any> {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }

    if (!plugin.getStats) {
      throw new Error(`Plugin "${pluginName}" does not support stats operation`);
    }

    try {
      return await plugin.getStats();
    } catch (error) {
      logger.error(`Plugin "${pluginName}" getStats failed: ${error}`);
      throw error;
    }
  }

  /**
   * 测试连接
   */
  async testConnection(pluginName: string): Promise<boolean> {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      return false;
    }

    if (!plugin.testConnection) {
      return false;
    }

    try {
      return await plugin.testConnection();
    } catch (error) {
      logger.debug(`Plugin "${pluginName}" connection test failed: ${error}`);
      return false;
    }
  }

  /**
   * 注册插件命令
   */
  registerPluginCommands(program: any): void {
    const plugins = this.getAllPlugins();
    
    for (const [name, plugin] of plugins) {
      if (plugin.registerCommands) {
        try {
          plugin.registerCommands(program);
          logger.debug(`Registered commands from plugin "${name}"`);
        } catch (error) {
          logger.warn(`Failed to register commands from plugin "${name}": ${error}`);
        }
      }
    }
  }

  /**
   * 清理所有插件
   */
  async cleanup(): Promise<void> {
    await this.loader.unloadAll();
  }
}

