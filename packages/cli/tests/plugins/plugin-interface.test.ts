import { describe, it, expect } from 'vitest';
import type {
  I18nPlugin,
  PluginMetadata,
  PushTranslationsData,
  PullTranslationsData,
  PushResult,
  PullResult,
  TranslationStats,
  PluginContext,
} from '../../src/plugins/types.js';

describe('Plugin Interface', () => {
  describe('Type Definitions', () => {
    it('应该定义正确的 PluginMetadata 结构', () => {
      const metadata: PluginMetadata = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'Test plugin',
        author: 'test-author',
        homepage: 'https://example.com',
      };

      expect(metadata.name).toBe('test-plugin');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.description).toBe('Test plugin');
      expect(metadata.author).toBe('test-author');
      expect(metadata.homepage).toBe('https://example.com');
    });

    it('应该定义正确的 PushTranslationsData 结构', () => {
      const pushData: PushTranslationsData = {
        translations: {
          key1: '文本1',
          key2: '文本2',
        },
        language: 'zh-CN',
        context: {
          key1: { file: 'App.vue', line: 10 },
        },
      };

      expect(pushData.translations).toBeDefined();
      expect(pushData.language).toBe('zh-CN');
      expect(pushData.context).toBeDefined();
    });

    it('应该定义正确的 PullTranslationsData 结构', () => {
      const pullData: PullTranslationsData = {
        language: 'zh-CN',
        context: {},
      };

      expect(pullData.language).toBe('zh-CN');
      expect(pullData.context).toBeDefined();
    });

    it('应该定义正确的 PushResult 结构', () => {
      const pushResult: PushResult = {
        success: true,
        message: 'Push successful',
        count: 10,
        errors: [],
      };

      expect(pushResult.success).toBe(true);
      expect(pushResult.message).toBe('Push successful');
      expect(pushResult.count).toBe(10);
      expect(pushResult.errors).toEqual([]);
    });

    it('应该定义正确的 PullResult 结构', () => {
      const pullResult: PullResult = {
        success: true,
        message: 'Pull successful',
        translations: {
          key1: '翻译1',
          key2: '翻译2',
        },
        count: 2,
        errors: [],
      };

      expect(pullResult.success).toBe(true);
      expect(pullResult.message).toBe('Pull successful');
      expect(pullResult.translations).toBeDefined();
      expect(pullResult.count).toBe(2);
    });

    it('应该定义正确的 TranslationStats 结构', () => {
      const stats: TranslationStats = {
        total: 100,
        translated: 80,
        pending: 20,
        reviewed: 60,
        languages: ['zh-CN', 'en-US', 'ja-JP'],
      };

      expect(stats.total).toBe(100);
      expect(stats.translated).toBe(80);
      expect(stats.pending).toBe(20);
      expect(stats.reviewed).toBe(60);
      expect(stats.languages).toHaveLength(3);
    });
  });

  describe('Plugin Implementation', () => {
    it('应该实现完整的插件接口', async () => {
      const plugin: I18nPlugin = {
        metadata: {
          name: 'test-plugin',
          version: '1.0.0',
          description: 'Test plugin',
          author: 'test',
        },
        async init(context: PluginContext, config: any) {
          expect(context).toBeDefined();
          expect(context.logger).toBeDefined();
          expect(context.config).toBeDefined();
        },
        async push(data: PushTranslationsData): Promise<PushResult> {
          expect(data.translations).toBeDefined();
          expect(data.language).toBeDefined();

          return {
            success: true,
            message: 'Pushed successfully',
            count: Object.keys(data.translations).length,
          };
        },
        async pull(data: PullTranslationsData): Promise<PullResult> {
          expect(data.language).toBeDefined();

          return {
            success: true,
            message: 'Pulled successfully',
            translations: {},
            count: 0,
          };
        },
        async getStats(): Promise<TranslationStats> {
          return {
            total: 100,
            translated: 80,
            pending: 20,
            reviewed: 60,
          };
        },
        async testConnection(): Promise<boolean> {
          return true;
        },
        registerCommands(program: any) {
          expect(program).toBeDefined();
        },
        async cleanup() {
          // Cleanup logic
        },
      };

      // Test metadata
      expect(plugin.metadata).toBeDefined();
      expect(plugin.metadata.name).toBe('test-plugin');

      // Test init
      if (plugin.init) {
        await plugin.init(
          {
            config: {},
            logger: console as any,
            cwd: process.cwd(),
          },
          {}
        );
      }

      // Test push
      if (plugin.push) {
        const pushResult = await plugin.push({
          translations: { key1: 'text1' },
          language: 'zh-CN',
          context: {},
        });
        expect(pushResult.success).toBe(true);
      }

      // Test pull
      if (plugin.pull) {
        const pullResult = await plugin.pull({
          language: 'zh-CN',
          context: {},
        });
        expect(pullResult.success).toBe(true);
      }

      // Test getStats
      if (plugin.getStats) {
        const stats = await plugin.getStats();
        expect(stats.total).toBeGreaterThanOrEqual(0);
      }

      // Test testConnection
      if (plugin.testConnection) {
        const connected = await plugin.testConnection();
        expect(typeof connected).toBe('boolean');
      }

      // Test registerCommands
      if (plugin.registerCommands) {
        const mockProgram = {
          command: vi.fn().mockReturnThis(),
          description: vi.fn().mockReturnThis(),
          action: vi.fn().mockReturnThis(),
        };
        plugin.registerCommands(mockProgram);
      }

      // Test cleanup
      if (plugin.cleanup) {
        await plugin.cleanup();
      }
    });

    it('应该支持最小化插件实现（只有必需方法）', () => {
      const minimalPlugin: I18nPlugin = {
        metadata: {
          name: 'minimal-plugin',
          version: '1.0.0',
          description: 'Minimal plugin',
          author: 'test',
        },
      };

      expect(minimalPlugin.metadata).toBeDefined();
      expect(minimalPlugin.init).toBeUndefined();
      expect(minimalPlugin.push).toBeUndefined();
      expect(minimalPlugin.pull).toBeUndefined();
    });

    it('应该支持插件的部分功能实现', async () => {
      const partialPlugin: I18nPlugin = {
        metadata: {
          name: 'partial-plugin',
          version: '1.0.0',
          description: 'Partial plugin',
          author: 'test',
        },
        async push(data: PushTranslationsData): Promise<PushResult> {
          return {
            success: true,
            message: 'Only push is implemented',
            count: Object.keys(data.translations).length,
          };
        },
        // pull, getStats, etc. are not implemented
      };

      expect(partialPlugin.metadata).toBeDefined();
      expect(partialPlugin.push).toBeDefined();
      expect(partialPlugin.pull).toBeUndefined();
      expect(partialPlugin.getStats).toBeUndefined();

      // Test push works
      if (partialPlugin.push) {
        const result = await partialPlugin.push({
          translations: { key1: 'text1' },
          language: 'zh-CN',
          context: {},
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('应该能够返回错误信息', async () => {
      const plugin: I18nPlugin = {
        metadata: {
          name: 'error-plugin',
          version: '1.0.0',
          description: 'Plugin with errors',
          author: 'test',
        },
        async push(data: PushTranslationsData): Promise<PushResult> {
          return {
            success: false,
            message: 'Push failed',
            count: 0,
            errors: [
              { key: 'key1', message: 'Invalid format' },
              { key: 'key2', message: 'Network error' },
            ],
          };
        },
      };

      if (plugin.push) {
        const result = await plugin.push({
          translations: { key1: 'text1', key2: 'text2' },
          language: 'zh-CN',
          context: {},
        });

        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors).toHaveLength(2);
      }
    });

    it('应该能够抛出异常', async () => {
      const plugin: I18nPlugin = {
        metadata: {
          name: 'throwing-plugin',
          version: '1.0.0',
          description: 'Plugin that throws',
          author: 'test',
        },
        async push(data: PushTranslationsData): Promise<PushResult> {
          throw new Error('Critical error');
        },
      };

      if (plugin.push) {
        await expect(
          plugin.push({
            translations: {},
            language: 'zh-CN',
            context: {},
          })
        ).rejects.toThrow('Critical error');
      }
    });
  });

  describe('Context and Configuration', () => {
    it('应该接收并使用上下文', async () => {
      let receivedContext: PluginContext | undefined;

      const plugin: I18nPlugin = {
        metadata: {
          name: 'context-plugin',
          version: '1.0.0',
          description: 'Context test plugin',
          author: 'test',
        },
        async init(context: PluginContext, config: any) {
          receivedContext = context;
        },
      };

      const mockContext: PluginContext = {
        config: { testKey: 'testValue' },
        logger: console as any,
        cwd: '/test/path',
      };

      if (plugin.init) {
        await plugin.init(mockContext, {});
      }

      expect(receivedContext).toBeDefined();
      expect(receivedContext?.config).toEqual({ testKey: 'testValue' });
      expect(receivedContext?.cwd).toBe('/test/path');
    });

    it('应该接收并使用配置', async () => {
      let receivedConfig: any;

      const plugin: I18nPlugin = {
        metadata: {
          name: 'config-plugin',
          version: '1.0.0',
          description: 'Config test plugin',
          author: 'test',
        },
        async init(context: PluginContext, config: any) {
          receivedConfig = config;
        },
      };

      const mockConfig = {
        apiKey: 'test-key',
        endpoint: 'https://api.test.com',
        timeout: 5000,
      };

      if (plugin.init) {
        await plugin.init(
          {
            config: {},
            logger: console as any,
            cwd: process.cwd(),
          },
          mockConfig
        );
      }

      expect(receivedConfig).toBeDefined();
      expect(receivedConfig.apiKey).toBe('test-key');
      expect(receivedConfig.endpoint).toBe('https://api.test.com');
      expect(receivedConfig.timeout).toBe(5000);
    });
  });
});
