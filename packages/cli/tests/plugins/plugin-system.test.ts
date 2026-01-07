import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginLoader } from '../../src/plugins/loader.js';
import { PluginManager } from '../../src/plugins/manager.js';
import type { I18nPlugin, PluginContext } from '../../src/plugins/types.js';

// Mock plugin for testing
const createTestPlugin = (name: string): I18nPlugin => ({
  metadata: {
    name,
    version: '1.0.0',
    description: `Test ${name} plugin`,
    author: 'test',
  },
  async init(context: PluginContext, config: any) {
    // Mock init
  },
  async push(data: any) {
    return {
      success: true,
      message: 'Push successful',
      count: Object.keys(data.translations || {}).length,
    };
  },
  async pull(data: any) {
    return {
      success: true,
      message: 'Pull successful',
      translations: { key1: '翻译1', key2: '翻译2' },
      count: 2,
    };
  },
  async getStats() {
    return {
      total: 100,
      translated: 80,
      pending: 20,
      reviewed: 60,
    };
  },
  async testConnection() {
    return true;
  },
});

describe('Plugin System Integration', () => {
  let mockContext: PluginContext;

  beforeEach(() => {
    mockContext = {
      config: {},
      logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        success: vi.fn(),
        debug: vi.fn(),
        br: vi.fn(),
        startSpinner: vi.fn(),
        stopSpinner: vi.fn(),
      } as any,
      cwd: process.cwd(),
    };
  });

  describe('PluginLoader', () => {
    let loader: PluginLoader;

    beforeEach(() => {
      loader = new PluginLoader();
      loader.setContext(mockContext);
    });

    it('应该能够创建插件加载器实例', () => {
      expect(loader).toBeDefined();
      expect(typeof loader.loadPlugin).toBe('function');
      expect(typeof loader.loadPlugins).toBe('function');
    });

    it('应该能够获取插件', () => {
      const plugin = loader.getPlugin('non-existent');
      expect(plugin).toBeUndefined();
    });

    it('应该能够获取所有插件', () => {
      const plugins = loader.getAllPlugins();
      expect(plugins).toBeInstanceOf(Map);
      expect(plugins.size).toBeGreaterThanOrEqual(0);
    });

    it('应该能够卸载不存在的插件（不报错）', async () => {
      await expect(loader.unloadPlugin('non-existent')).resolves.not.toThrow();
    });

    it('应该能够卸载所有插件', async () => {
      await expect(loader.unloadAll()).resolves.not.toThrow();
    });

    it('应该能够设置上下文', () => {
      const newContext: PluginContext = {
        config: { test: true },
        logger: console as any,
        cwd: '/test',
      };
      expect(() => loader.setContext(newContext)).not.toThrow();
    });
  });

  describe('PluginManager', () => {
    let manager: PluginManager;

    beforeEach(() => {
      manager = new PluginManager();
    });

    it('应该能够创建插件管理器实例', () => {
      expect(manager).toBeDefined();
      expect(typeof manager.initialize).toBe('function');
      expect(typeof manager.getPlugin).toBe('function');
      expect(typeof manager.getAllPlugins).toBe('function');
    });

    it('应该能够初始化空插件列表', async () => {
      await expect(manager.initialize(mockContext, [])).resolves.not.toThrow();
    });

    it('应该能够获取不存在的插件', () => {
      const plugin = manager.getPlugin('non-existent');
      expect(plugin).toBeUndefined();
    });

    it('应该能够获取所有插件', () => {
      const plugins = manager.getAllPlugins();
      expect(plugins).toBeInstanceOf(Map);
    });

    it('应该在找不到插件时抛出错误或返回false', async () => {
      await expect(manager.push('non-existent', {})).rejects.toThrow(
        'not found'
      );
      await expect(manager.pull('non-existent', {})).rejects.toThrow(
        'not found'
      );
      await expect(manager.getStats('non-existent')).rejects.toThrow(
        'not found'
      );

      // testConnection returns false instead of throwing
      const result = await manager.testConnection('non-existent');
      expect(result).toBe(false);
    });

    it('应该能够注册命令到空程序', () => {
      const mockProgram: any = {
        commands: [],
        command: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
      };

      expect(() => manager.registerPluginCommands(mockProgram)).not.toThrow();
    });

    it('应该能够清理插件', async () => {
      await expect(manager.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Plugin Interface Compliance', () => {
    it('测试插件应该符合I18nPlugin接口', () => {
      const plugin = createTestPlugin('test-plugin');

      expect(plugin.metadata).toBeDefined();
      expect(plugin.metadata.name).toBe('test-plugin');
      expect(plugin.metadata.version).toBeDefined();
      expect(plugin.metadata.description).toBeDefined();
      expect(plugin.metadata.author).toBeDefined();
    });

    it('测试插件应该实现核心方法', async () => {
      const plugin = createTestPlugin('test-plugin');

      // Test push
      if (plugin.push) {
        const pushResult = await plugin.push({
          translations: { key1: 'text1' },
          language: 'zh-CN',
          context: {},
        });
        expect(pushResult.success).toBe(true);
        expect(pushResult.count).toBeGreaterThanOrEqual(0);
      }

      // Test pull
      if (plugin.pull) {
        const pullResult = await plugin.pull({
          language: 'zh-CN',
          context: {},
        });
        expect(pullResult.success).toBe(true);
        expect(pullResult.translations).toBeDefined();
      }

      // Test getStats
      if (plugin.getStats) {
        const stats = await plugin.getStats();
        expect(stats.total).toBeGreaterThanOrEqual(0);
        expect(stats.translated).toBeGreaterThanOrEqual(0);
        expect(stats.pending).toBeGreaterThanOrEqual(0);
      }

      // Test testConnection
      if (plugin.testConnection) {
        const connected = await plugin.testConnection();
        expect(typeof connected).toBe('boolean');
      }

      // Test init
      if (plugin.init) {
        await expect(plugin.init(mockContext, {})).resolves.not.toThrow();
      }
    });
  });
});
