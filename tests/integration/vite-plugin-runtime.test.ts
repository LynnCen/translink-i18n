import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createServer, ViteDevServer } from 'vite';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { createI18nPlugin } from '../../packages/vite-plugin/src/core/plugin.js';
import { I18nEngine } from '../../packages/runtime/src/core/i18n-engine.js';

describe('Vite 插件与 Runtime 集成测试', () => {
  const testProjectDir = join(process.cwd(), 'test-vite-project');
  let viteServer: ViteDevServer;

  beforeEach(async () => {
    // 创建测试项目目录
    await fs.mkdir(testProjectDir, { recursive: true });
    await fs.mkdir(join(testProjectDir, 'src'), { recursive: true });
    await fs.mkdir(join(testProjectDir, 'src/locales'), { recursive: true });
  });

  afterEach(async () => {
    // 关闭 Vite 服务器
    if (viteServer) {
      await viteServer.close();
    }

    // 清理测试项目
    await fs.rm(testProjectDir, { recursive: true, force: true });
  });

  describe('开发模式集成', () => {
    it('应该在开发模式下保持原文并添加映射', async () => {
      // 创建语言文件
      await createLanguageFiles();

      // 创建 Vite 配置
      const viteConfig = {
        root: testProjectDir,
        plugins: [
          createI18nPlugin({
            localesDir: 'src/locales',
            defaultLanguage: 'zh-CN',
          }),
        ],
        server: { port: 0 }, // 使用随机端口
      };

      viteServer = await createServer(viteConfig);
      await viteServer.listen();

      // 创建包含 $tsl 的源文件
      const sourceCode = `
export const component = {
  template: \`
    <div>
      <h1>{{ $tsl('欢迎使用 TransLink I18n') }}</h1>
      <p>{{ t('这是开发模式测试') }}</p>
    </div>
  \`
};
      `;

      // 通过 Vite 转换代码
      const result = await viteServer.transformRequest('/src/test.js');

      expect(result).toBeDefined();
      if (result) {
        // 开发模式应该保持原文
        expect(result.code).toContain('欢迎使用 TransLink I18n');
        expect(result.code).toContain('这是开发模式测试');
        // 应该添加默认值参数
        expect(result.code).toContain('defaultValue');
      }
    });

    it('应该支持虚拟模块加载', async () => {
      await createLanguageFiles();

      const viteConfig = {
        root: testProjectDir,
        plugins: [
          createI18nPlugin({
            localesDir: 'src/locales',
            defaultLanguage: 'zh-CN',
          }),
        ],
      };

      viteServer = await createServer(viteConfig);

      // 请求虚拟语言模块
      const result = await viteServer.transformRequest(
        'virtual:i18n-language-zh-CN'
      );

      expect(result).toBeDefined();
      if (result) {
        expect(result.code).toContain('export default');
        expect(result.code).toContain('欢迎使用');
        expect(result.code).toContain('用户资料');
      }
    });
  });

  describe('热更新集成', () => {
    it('应该在语言文件变更时触发热更新', async () => {
      await createLanguageFiles();

      const viteConfig = {
        root: testProjectDir,
        plugins: [
          createI18nPlugin({
            localesDir: 'src/locales',
            defaultLanguage: 'zh-CN',
            hotReload: true,
          }),
        ],
      };

      viteServer = await createServer(viteConfig);
      await viteServer.listen();

      // Mock WebSocket 发送
      const wsSendSpy = vi.spyOn(viteServer.ws, 'send');

      // 修改语言文件
      const zhCNFile = join(testProjectDir, 'src/locales/zh-CN.json');
      const updatedContent = {
        welcome: '欢迎使用 TransLink I18n - 已更新',
        greeting: '你好，{{name}}！',
        user: {
          profile: '用户资料',
          settings: '设置',
        },
      };

      await fs.writeFile(zhCNFile, JSON.stringify(updatedContent, null, 2));

      // 等待文件系统事件
      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证 HMR 更新被发送
      expect(wsSendSpy).toHaveBeenCalled();

      const updateCall = wsSendSpy.mock.calls.find(
        call =>
          call[0] && typeof call[0] === 'object' && call[0].type === 'update'
      );
      expect(updateCall).toBeDefined();
    });

    it('应该在源文件变更时正确处理', async () => {
      await createLanguageFiles();

      const viteConfig = {
        root: testProjectDir,
        plugins: [
          createI18nPlugin({
            localesDir: 'src/locales',
            defaultLanguage: 'zh-CN',
          }),
        ],
      };

      viteServer = await createServer(viteConfig);

      // 创建源文件
      const sourceFile = join(testProjectDir, 'src/App.vue');
      await fs.writeFile(
        sourceFile,
        `
<template>
  <h1>{{ $tsl('原始标题') }}</h1>
</template>
      `
      );

      // 首次转换
      const result1 = await viteServer.transformRequest('/src/App.vue');
      expect(result1?.code).toContain('原始标题');

      // 修改源文件
      await fs.writeFile(
        sourceFile,
        `
<template>
  <h1>{{ $tsl('更新后的标题') }}</h1>
</template>
      `
      );

      // 再次转换
      const result2 = await viteServer.transformRequest('/src/App.vue');
      expect(result2?.code).toContain('更新后的标题');
      expect(result2?.code).not.toContain('原始标题');
    });
  });

  describe('构建模式集成', () => {
    it('应该在构建模式下转换为哈希', async () => {
      await createLanguageFiles();

      // 模拟构建模式配置
      const buildConfig = {
        root: testProjectDir,
        mode: 'production',
        command: 'build' as const,
        plugins: [
          createI18nPlugin({
            localesDir: 'src/locales',
            defaultLanguage: 'zh-CN',
          }),
        ],
      };

      viteServer = await createServer(buildConfig);

      const sourceCode = `
const message = $tsl('这将被转换为哈希');
const greeting = t('你好，世界');
      `;

      // 模拟构建时转换
      const plugin = buildConfig.plugins[0] as any;
      plugin.configResolved({
        ...buildConfig,
        isProduction: true,
      });

      const result = await plugin.transform(sourceCode, '/src/test.js');

      expect(result).toBeDefined();
      if (result && typeof result === 'object' && 'code' in result) {
        // 生产模式应该转换为哈希
        expect(result.code).toMatch(/t\(['"][a-f0-9]{8}['"][\),]/);
        expect(result.code).not.toContain('这将被转换为哈希');
        expect(result.code).not.toContain('defaultValue');
      }
    });
  });

  describe('Runtime 与插件协作', () => {
    it('应该正确加载插件生成的虚拟模块', async () => {
      await createLanguageFiles();

      const viteConfig = {
        root: testProjectDir,
        plugins: [
          createI18nPlugin({
            localesDir: 'src/locales',
            defaultLanguage: 'zh-CN',
          }),
        ],
      };

      viteServer = await createServer(viteConfig);

      // 获取虚拟模块内容
      const zhCNModule = await viteServer.transformRequest(
        'virtual:i18n-language-zh-CN'
      );
      const enUSModule = await viteServer.transformRequest(
        'virtual:i18n-language-en-US'
      );

      expect(zhCNModule?.code).toBeDefined();
      expect(enUSModule?.code).toBeDefined();

      // 解析模块内容
      const zhCNData = extractModuleData(zhCNModule!.code);
      const enUSData = extractModuleData(enUSModule!.code);

      // 使用 Runtime 加载这些数据
      const i18nEngine = new I18nEngine({
        defaultLanguage: 'zh-CN',
        supportedLanguages: ['zh-CN', 'en-US'],
        resources: {
          'zh-CN': zhCNData,
          'en-US': enUSData,
        },
      });

      await i18nEngine.init();

      // 测试翻译功能
      expect(i18nEngine.t('welcome')).toBe('欢迎使用');
      expect(i18nEngine.t('user.profile')).toBe('用户资料');

      await i18nEngine.changeLanguage('en-US');
      expect(i18nEngine.t('welcome')).toBe('Welcome');
      expect(i18nEngine.t('user.profile')).toBe('User Profile');
    });

    it('应该支持懒加载语言包', async () => {
      await createLanguageFiles();

      // 添加更多语言文件
      const jaJPContent = {
        welcome: 'いらっしゃいませ',
        greeting: 'こんにちは、{{name}}さん！',
        user: {
          profile: 'ユーザープロフィール',
          settings: '設定',
        },
      };

      await fs.writeFile(
        join(testProjectDir, 'src/locales/ja-JP.json'),
        JSON.stringify(jaJPContent, null, 2)
      );

      const viteConfig = {
        root: testProjectDir,
        plugins: [
          createI18nPlugin({
            localesDir: 'src/locales',
            defaultLanguage: 'zh-CN',
            lazyLoad: true,
          }),
        ],
      };

      viteServer = await createServer(viteConfig);

      // 模拟懒加载场景
      const loadLanguageModule = async (lang: string) => {
        const result = await viteServer.transformRequest(
          `virtual:i18n-language-${lang}`
        );
        return result ? extractModuleData(result.code) : null;
      };

      // 初始只加载中文
      const zhCNData = await loadLanguageModule('zh-CN');
      expect(zhCNData).toBeDefined();

      const i18nEngine = new I18nEngine({
        defaultLanguage: 'zh-CN',
        supportedLanguages: ['zh-CN', 'en-US', 'ja-JP'],
        resources: {
          'zh-CN': zhCNData!,
        },
        loadFunction: async lang => {
          return await loadLanguageModule(lang);
        },
      });

      await i18nEngine.init();
      expect(i18nEngine.t('welcome')).toBe('欢迎使用');

      // 懒加载日语
      await i18nEngine.changeLanguage('ja-JP');
      expect(i18nEngine.t('welcome')).toBe('いらっしゃいませ');
    });
  });

  describe('错误处理集成', () => {
    it('应该处理缺失的语言文件', async () => {
      // 只创建中文文件，不创建英文文件
      const zhCNContent = {
        welcome: '欢迎使用',
        greeting: '你好，{{name}}！',
      };

      await fs.writeFile(
        join(testProjectDir, 'src/locales/zh-CN.json'),
        JSON.stringify(zhCNContent, null, 2)
      );

      const viteConfig = {
        root: testProjectDir,
        plugins: [
          createI18nPlugin({
            localesDir: 'src/locales',
            defaultLanguage: 'zh-CN',
          }),
        ],
      };

      viteServer = await createServer(viteConfig);

      // 请求存在的语言文件
      const zhResult = await viteServer.transformRequest(
        'virtual:i18n-language-zh-CN'
      );
      expect(zhResult).toBeDefined();

      // 请求不存在的语言文件
      const enResult = await viteServer.transformRequest(
        'virtual:i18n-language-en-US'
      );
      expect(enResult).toBeNull();
    });

    it('应该处理无效的语言文件格式', async () => {
      // 创建无效的 JSON 文件
      await fs.writeFile(
        join(testProjectDir, 'src/locales/invalid.json'),
        '{ invalid json content'
      );

      const viteConfig = {
        root: testProjectDir,
        plugins: [
          createI18nPlugin({
            localesDir: 'src/locales',
            defaultLanguage: 'zh-CN',
          }),
        ],
      };

      viteServer = await createServer(viteConfig);

      // 请求无效的语言文件应该返回 null 而不是抛出错误
      const result = await viteServer.transformRequest(
        'virtual:i18n-language-invalid'
      );
      expect(result).toBeNull();
    });
  });

  // 辅助函数
  async function createLanguageFiles() {
    const zhCNContent = {
      welcome: '欢迎使用',
      greeting: '你好，{{name}}！',
      user: {
        profile: '用户资料',
        settings: '设置',
      },
    };

    const enUSContent = {
      welcome: 'Welcome',
      greeting: 'Hello, {{name}}!',
      user: {
        profile: 'User Profile',
        settings: 'Settings',
      },
    };

    await fs.writeFile(
      join(testProjectDir, 'src/locales/zh-CN.json'),
      JSON.stringify(zhCNContent, null, 2)
    );

    await fs.writeFile(
      join(testProjectDir, 'src/locales/en-US.json'),
      JSON.stringify(enUSContent, null, 2)
    );
  }

  function extractModuleData(moduleCode: string): any {
    // 从模块代码中提取导出的数据
    // 这是一个简化的实现，实际情况可能需要更复杂的解析
    const match = moduleCode.match(/export default\s+({.*?});?\s*$/s);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        // 如果 JSON.parse 失败，尝试 eval（仅用于测试）
        return eval(`(${match[1]})`);
      }
    }
    return {};
  }
});
