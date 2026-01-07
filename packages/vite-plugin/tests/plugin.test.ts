import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createI18nPlugin } from '../core/plugin.js';
import {
  createMockResolvedConfig,
  createMockViteDevServer,
  createMockSourceFiles,
  createMockLanguageFiles,
} from './setup.js';
import type { I18nPluginOptions } from '../types/index.js';

describe('I18nPlugin', () => {
  let pluginOptions: I18nPluginOptions;
  let mockConfig: any;
  let mockServer: any;

  beforeEach(() => {
    pluginOptions = {
      configFile: 'i18n.config.ts',
      include: ['**/*.{vue,tsx,ts,jsx,js}'],
      exclude: ['node_modules/**'],
      defaultLanguage: 'zh-CN',
      localesDir: 'src/locales',
      hotReload: true,
      lazyLoad: true,
      virtualModulePrefix: 'virtual:i18n-language-',
    };

    mockConfig = createMockResolvedConfig();
    mockServer = createMockViteDevServer();
  });

  describe('插件创建和配置', () => {
    it('应该创建插件实例', () => {
      const plugin = createI18nPlugin(pluginOptions);

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('@translink/vite-plugin-i18n');
      expect(plugin.enforce).toBe('pre');
    });

    it('应该使用默认选项', () => {
      const plugin = createI18nPlugin();

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('@translink/vite-plugin-i18n');
    });

    it('应该在 configResolved 时初始化组件', async () => {
      const plugin = createI18nPlugin(pluginOptions);

      expect(() => {
        plugin.configResolved!(mockConfig);
      }).not.toThrow();
    });
  });

  describe('代码转换', () => {
    it('应该转换包含 $tsl 的 Vue 文件', async () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      const vueContent = `
<template>
  <h1>{{ $tsl('欢迎使用 TransLink I18n') }}</h1>
  <p>{{ $tsl('这是一个测试') }}</p>
</template>

<script setup>
const message = $tsl('脚本消息');
</script>
      `;

      const result = await plugin.transform!(vueContent, 'src/App.vue');

      expect(result).toBeDefined();
      if (result && typeof result === 'object' && 'code' in result) {
        // 在开发模式下，应该保持原文并添加默认值
        expect(result.code).toContain('defaultValue');
        expect(result.code).toContain('欢迎使用 TransLink I18n');
      }
    });

    it('应该转换 React/TSX 文件', async () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      const tsxContent = `
import React from 'react';

export function Component() {
  return (
    <div>
      <h1>{$tsl('React 组件标题')}</h1>
      <button onClick={() => alert($tsl('按钮点击'))}>
        {$tsl('点击我')}
      </button>
    </div>
  );
}
      `;

      const result = await plugin.transform!(tsxContent, 'src/Component.tsx');

      expect(result).toBeDefined();
      if (result && typeof result === 'object' && 'code' in result) {
        expect(result.code).toContain('React 组件标题');
        expect(result.code).toContain('按钮点击');
        expect(result.code).toContain('点击我');
      }
    });

    it('应该跳过不匹配的文件', async () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      const result = await plugin.transform!(
        'console.log("test");',
        'node_modules/test.js'
      );

      expect(result).toBeNull();
    });

    it('应该在生产模式下转换为哈希', async () => {
      const prodConfig = createMockResolvedConfig({
        command: 'build',
        mode: 'production',
        isProduction: true,
      });

      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(prodConfig);

      const content = `const message = $tsl('测试消息');`;
      const result = await plugin.transform!(content, 'src/test.ts');

      expect(result).toBeDefined();
      if (result && typeof result === 'object' && 'code' in result) {
        // 生产模式应该转换为哈希，不包含原文
        expect(result.code).toMatch(/t\(['"][a-f0-9]{8}['"]\)/);
        expect(result.code).not.toContain('defaultValue');
      }
    });
  });

  describe('虚拟模块处理', () => {
    it('应该解析虚拟模块 ID', () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      const virtualId = 'virtual:i18n-language-zh-CN';
      const result = plugin.resolveId!(virtualId, undefined);

      expect(result).toBe(virtualId);
    });

    it('应该跳过非虚拟模块', () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      const normalId = 'src/App.vue';
      const result = plugin.resolveId!(normalId, undefined);

      expect(result).toBeNull();
    });

    it('应该加载虚拟语言模块', async () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      // Mock 语言文件存在
      const mockFs = vi.doMock('node:fs/promises', () => ({
        readFile: vi.fn().mockResolvedValue(
          JSON.stringify({
            welcome: '欢迎使用',
            greeting: '你好，{{name}}！',
          })
        ),
      }));

      const virtualId = 'virtual:i18n-language-zh-CN';
      const result = await plugin.load!(virtualId);

      expect(result).toBeDefined();
      expect(result).toContain('export default');
      expect(result).toContain('welcome');
    });

    it('应该处理语言文件加载失败', async () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      // Mock 文件不存在
      vi.doMock('node:fs/promises', () => ({
        readFile: vi.fn().mockRejectedValue(new Error('File not found')),
      }));

      const virtualId = 'virtual:i18n-language-nonexistent';
      const result = await plugin.load!(virtualId);

      expect(result).toBeNull();
    });
  });

  describe('热更新处理', () => {
    it('应该配置开发服务器', () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      expect(() => {
        plugin.configureServer!(mockServer);
      }).not.toThrow();
    });

    it('应该处理语言文件热更新', async () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);
      plugin.configureServer!(mockServer);

      const hmrContext = {
        file: '/test/project/src/locales/zh-CN.json',
        timestamp: Date.now(),
        modules: [],
        read: vi.fn(),
        server: mockServer,
      };

      const result = await plugin.handleHotUpdate!(hmrContext);

      // 应该处理语言文件更新
      expect(mockServer.ws.send).toHaveBeenCalled();
    });

    it('应该跳过非语言文件的更新', async () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);
      plugin.configureServer!(mockServer);

      const hmrContext = {
        file: '/test/project/src/App.vue',
        timestamp: Date.now(),
        modules: [],
        read: vi.fn(),
        server: mockServer,
      };

      const result = await plugin.handleHotUpdate!(hmrContext);

      // 应该返回 undefined，让 Vite 处理
      expect(result).toBeUndefined();
    });
  });

  describe('构建优化', () => {
    it('应该配置代码分割', () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      const originalOptions = {
        manualChunks: undefined,
      };

      const result = plugin.outputOptions!(originalOptions);

      expect(result).toBeDefined();
      expect(typeof result.manualChunks).toBe('function');
    });

    it('应该将语言模块分组到单独的块中', () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      const options = { manualChunks: undefined };
      plugin.outputOptions!(options);

      const manualChunks = options.manualChunks as Function;

      // 测试虚拟语言模块
      const languageChunk = manualChunks(
        'virtual:i18n-language-zh-CN',
        {} as any
      );
      expect(languageChunk).toBe('i18n-language-zh-CN');

      // 测试普通模块
      const normalChunk = manualChunks('src/App.vue', {} as any);
      expect(normalChunk).toBeUndefined();
    });

    it('应该保留现有的 manualChunks 配置', () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      const existingManualChunks = vi.fn().mockReturnValue('existing-chunk');
      const options = { manualChunks: existingManualChunks };

      plugin.outputOptions!(options);

      const manualChunks = options.manualChunks as Function;

      // 测试现有配置仍然工作
      const result = manualChunks('src/utils.ts', {} as any);
      expect(existingManualChunks).toHaveBeenCalledWith('src/utils.ts', {});
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的配置文件', async () => {
      const invalidOptions = {
        ...pluginOptions,
        configFile: 'nonexistent.config.ts',
      };

      const plugin = createI18nPlugin(invalidOptions);

      expect(() => {
        plugin.configResolved!(mockConfig);
      }).not.toThrow();
    });

    it('应该处理转换错误', async () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      // 无效的 JavaScript 语法
      const invalidContent = `const invalid = $tsl('未闭合的字符串`;

      const result = await plugin.transform!(invalidContent, 'src/invalid.js');

      // 应该优雅处理错误，不崩溃
      expect(result).toBeDefined();
    });

    it('应该处理虚拟模块加载错误', async () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      // Mock 系统错误
      vi.doMock('node:fs/promises', () => ({
        readFile: vi.fn().mockRejectedValue(new Error('System error')),
      }));

      const virtualId = 'virtual:i18n-language-zh-CN';
      const result = await plugin.load!(virtualId);

      expect(result).toBeNull();
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大文件转换', async () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      // 生成大文件内容
      const largeContent = Array.from(
        { length: 1000 },
        (_, i) => `const msg${i} = $tsl('消息${i}');`
      ).join('\n');

      const startTime = Date.now();
      const result = await plugin.transform!(largeContent, 'src/large.ts');
      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(5000); // 应该在5秒内完成
    });

    it('应该高效处理多个虚拟模块', async () => {
      const plugin = createI18nPlugin(pluginOptions);
      plugin.configResolved!(mockConfig);

      // Mock 多个语言文件
      const languages = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'fr-FR'];

      const startTime = Date.now();

      const promises = languages.map(lang =>
        plugin.load!(`virtual:i18n-language-${lang}`)
      );

      await Promise.all(promises);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });
  });

  describe('配置选项', () => {
    it('应该支持自定义虚拟模块前缀', () => {
      const customOptions = {
        ...pluginOptions,
        virtualModulePrefix: 'custom:lang-',
      };

      const plugin = createI18nPlugin(customOptions);
      plugin.configResolved!(mockConfig);

      const customId = 'custom:lang-zh-CN';
      const result = plugin.resolveId!(customId, undefined);

      expect(result).toBe(customId);
    });

    it('应该支持自定义包含/排除模式', async () => {
      const customOptions = {
        ...pluginOptions,
        include: ['**/*.vue'],
        exclude: ['**/*.test.*'],
      };

      const plugin = createI18nPlugin(customOptions);
      plugin.configResolved!(mockConfig);

      // 应该处理 .vue 文件
      const vueResult = await plugin.transform!('$tsl("测试")', 'src/App.vue');
      expect(vueResult).toBeDefined();

      // 应该跳过 .ts 文件（不在 include 中）
      const tsResult = await plugin.transform!('$tsl("测试")', 'src/utils.ts');
      expect(tsResult).toBeNull();

      // 应该跳过测试文件
      const testResult = await plugin.transform!(
        '$tsl("测试")',
        'src/App.test.vue'
      );
      expect(testResult).toBeNull();
    });

    it('应该支持禁用热更新', () => {
      const noHMROptions = {
        ...pluginOptions,
        hotReload: false,
      };

      const plugin = createI18nPlugin(noHMROptions);
      plugin.configResolved!(mockConfig);

      // 应该仍然可以配置服务器，但不设置监听器
      expect(() => {
        plugin.configureServer!(mockServer);
      }).not.toThrow();
    });

    it('应该支持禁用懒加载', () => {
      const noLazyOptions = {
        ...pluginOptions,
        lazyLoad: false,
      };

      const plugin = createI18nPlugin(noLazyOptions);
      plugin.configResolved!(mockConfig);

      // 应该仍然处理虚拟模块，但可能有不同的行为
      const virtualId = 'virtual:i18n-language-zh-CN';
      const result = plugin.resolveId!(virtualId, undefined);

      expect(result).toBe(virtualId);
    });
  });
});
