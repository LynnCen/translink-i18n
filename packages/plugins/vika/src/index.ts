/**
 * Vika 插件
 */

import type {
  I18nPlugin,
  PluginContext,
  PluginConfig,
  PushTranslationsData,
  PullTranslationsData,
  PushResult,
  PullResult,
  TranslationStats,
  TranslationItem,
} from '@translink/i18n-cli';
import { VikaClient } from './vika-client.js';

export class VikaPlugin implements I18nPlugin {
  metadata = {
    name: '@translink/plugin-vika',
    version: '1.0.0',
    description: 'Vika integration plugin for TransLink I18n',
    author: 'lynncen',
    homepage: 'https://github.com/lynncen/translink-i18n',
  };

  private client: VikaClient | null = null;
  private context: PluginContext | null = null;

  async init(context: PluginContext, config: PluginConfig): Promise<void> {
    this.context = context;

    const apiKey = config.apiKey || process.env.VIKA_API_KEY;
    const datasheetId = config.datasheetId || process.env.VIKA_DATASHEET_ID;

    if (!apiKey || !datasheetId) {
      throw new Error(
        'Vika plugin requires apiKey and datasheetId in config or environment variables'
      );
    }

    this.client = new VikaClient(apiKey, datasheetId);
  }

  async push(data: PushTranslationsData): Promise<PushResult> {
    if (!this.client) {
      throw new Error('Vika plugin not initialized');
    }

    try {
      const result = await this.client.pushTranslations(data.translations);

      return {
        success: true,
        created: result.created,
        updated: result.updated,
        errors: result.errors,
        message: `Pushed ${result.created + result.updated} translations (${result.created} created, ${result.updated} updated)`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Push failed: ${error}`,
      };
    }
  }

  async pull(data: PullTranslationsData): Promise<PullResult> {
    if (!this.client) {
      throw new Error('Vika plugin not initialized');
    }

    try {
      const translations = await this.client.pullTranslations(data.language);

      return {
        success: true,
        translations,
        message: `Pulled ${Object.keys(translations).length} translations for ${data.language}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Pull failed: ${error}`,
      };
    }
  }

  async getStats(): Promise<TranslationStats> {
    if (!this.client) {
      throw new Error('Vika plugin not initialized');
    }

    return await this.client.getTranslationStats();
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    return await this.client.testConnection();
  }

  registerCommands(program: any): void {
    const pushCmd = program
      .command('push')
      .description('Push translations to Vika')
      .option('-l, --language <language>', 'Target language')
      .action(async (options: any) => {
        if (!this.client) {
          this.context?.logger.error('Vika plugin not initialized');
          process.exit(1);
        }

        // 实现 push 命令逻辑
        this.context?.logger.info('Pushing translations to Vika...');
        // TODO: 实现完整的 push 命令
      });

    const pullCmd = program
      .command('pull')
      .description('Pull translations from Vika')
      .option('-l, --language <language>', 'Target language')
      .action(async (options: any) => {
        if (!this.client) {
          this.context?.logger.error('Vika plugin not initialized');
          process.exit(1);
        }

        // 实现 pull 命令逻辑
        this.context?.logger.info('Pulling translations from Vika...');
        // TODO: 实现完整的 pull 命令
      });
  }

  async cleanup(): Promise<void> {
    this.client = null;
    this.context = null;
  }
}

// 导出插件实例
const plugin = new VikaPlugin();
export default plugin;
