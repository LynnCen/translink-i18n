import { describe, it, expect, beforeEach, vi } from 'vitest';
import { I18nEngine } from '../core/i18n-engine.js';
import { createMockI18nOptions, waitForNextTick } from './setup.js';

describe('I18nEngine', () => {
  let i18nEngine: I18nEngine;
  let mockOptions: any;

  beforeEach(() => {
    mockOptions = createMockI18nOptions();
    i18nEngine = new I18nEngine(mockOptions);
  });

  describe('初始化', () => {
    it('应该使用正确的默认语言初始化', () => {
      expect(i18nEngine.getCurrentLanguage()).toBe('zh-CN');
    });

    it('应该正确设置支持的语言', () => {
      expect(i18nEngine.getSupportedLanguages()).toEqual(['zh-CN', 'en-US']);
    });

    it('应该在初始化完成后触发 ready 事件', async () => {
      const readyHandler = vi.fn();
      i18nEngine.on('ready', readyHandler);

      await i18nEngine.init();

      expect(readyHandler).toHaveBeenCalled();
    });

    it('应该正确加载初始资源', async () => {
      await i18nEngine.init();

      expect(i18nEngine.hasLanguage('zh-CN')).toBe(true);
    });
  });

  describe('翻译功能', () => {
    beforeEach(async () => {
      await i18nEngine.init();
    });

    it('应该翻译简单的键', () => {
      expect(i18nEngine.t('welcome')).toBe('欢迎使用');
    });

    it('应该翻译嵌套的键', () => {
      expect(i18nEngine.t('user.profile')).toBe('用户资料');
    });

    it('应该处理参数插值', () => {
      expect(i18nEngine.t('greeting', { name: '张三' })).toBe('你好，张三！');
    });

    it('应该在翻译不存在时返回键名', () => {
      expect(i18nEngine.t('nonexistent')).toBe('nonexistent');
    });

    it('应该使用回退语言', async () => {
      // 切换到英文
      await i18nEngine.changeLanguage('en-US');

      // 模拟英文中缺失的翻译
      const resources = i18nEngine.getResources();
      delete resources['en-US'].welcome;

      // 应该回退到中文
      expect(i18nEngine.t('welcome')).toBe('欢迎使用');
    });

    it('应该使用默认值选项', () => {
      expect(
        i18nEngine.t('nonexistent', undefined, { defaultValue: '默认值' })
      ).toBe('默认值');
    });

    it('应该处理复杂的插值参数', () => {
      // 添加复杂模板用于测试
      const complexTemplate =
        '用户{{user.name}}在{{date}}时{{action}}了{{count}}个项目';
      i18nEngine.addResource('zh-CN', 'complex', complexTemplate);

      const result = i18nEngine.t('complex', {
        user: { name: '张三' },
        date: '2024年1月1日',
        action: '创建',
        count: 5,
      });

      expect(result).toBe('用户张三在2024年1月1日时创建了5个项目');
    });

    it('应该处理缺失的插值参数', () => {
      const result = i18nEngine.t('greeting', {
        /* 缺少 name 参数 */
      });
      expect(result).toBe('你好，{{name}}！'); // 应该保留占位符
    });
  });

  describe('语言切换', () => {
    beforeEach(async () => {
      await i18nEngine.init();
    });

    it('应该成功切换语言', async () => {
      await i18nEngine.changeLanguage('en-US');
      expect(i18nEngine.getCurrentLanguage()).toBe('en-US');
      expect(i18nEngine.t('welcome')).toBe('Welcome');
    });

    it('应该在语言切换时触发事件', async () => {
      const changeHandler = vi.fn();
      i18nEngine.on('languageChanged', changeHandler);

      await i18nEngine.changeLanguage('en-US');

      expect(changeHandler).toHaveBeenCalledWith('en-US');
    });

    it('应该拒绝不支持的语言', async () => {
      await expect(i18nEngine.changeLanguage('fr-FR')).rejects.toThrow(
        'Language "fr-FR" is not supported'
      );
    });

    it('应该在语言切换时清除缓存', async () => {
      // 先进行翻译以填充缓存
      i18nEngine.t('welcome');

      const cacheStats = i18nEngine.getCacheStats();
      expect(cacheStats.size).toBeGreaterThan(0);

      await i18nEngine.changeLanguage('en-US');

      const newCacheStats = i18nEngine.getCacheStats();
      expect(newCacheStats.size).toBe(0);
    });

    it('应该在切换到相同语言时不执行操作', async () => {
      const changeHandler = vi.fn();
      i18nEngine.on('languageChanged', changeHandler);

      await i18nEngine.changeLanguage('zh-CN'); // 当前已经是中文

      expect(changeHandler).not.toHaveBeenCalled();
    });
  });

  describe('缓存系统', () => {
    beforeEach(async () => {
      await i18nEngine.init();
    });

    it('应该缓存翻译结果', () => {
      const result1 = i18nEngine.t('welcome');
      const result2 = i18nEngine.t('welcome');

      expect(result1).toBe(result2);

      const stats = i18nEngine.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.hits).toBeGreaterThan(0);
    });

    it('应该尊重缓存 TTL', async () => {
      // 创建短 TTL 的引擎
      const shortTTLEngine = new I18nEngine({
        ...mockOptions,
        cache: {
          enabled: true,
          maxSize: 100,
          ttl: 10, // 10ms
          storage: 'memory',
        },
      });

      await shortTTLEngine.init();

      shortTTLEngine.t('welcome');
      expect(shortTTLEngine.getCacheStats().size).toBe(1);

      // 等待 TTL 过期
      await new Promise(resolve => setTimeout(resolve, 20));

      // 触发清理
      shortTTLEngine.t('greeting', { name: 'test' });

      // 过期的条目应该被清理
      const stats = shortTTLEngine.getCacheStats();
      expect(stats.size).toBe(1); // 只有新条目
    });

    it('应该处理缓存禁用', () => {
      const noCacheEngine = new I18nEngine({
        ...mockOptions,
        cache: {
          enabled: false,
          maxSize: 100,
          ttl: 5000,
          storage: 'memory',
        },
      });

      noCacheEngine.init();
      noCacheEngine.t('welcome');

      expect(noCacheEngine.getCacheStats().size).toBe(0);
    });

    it('应该支持不同的缓存存储', () => {
      const localStorageEngine = new I18nEngine({
        ...mockOptions,
        cache: {
          enabled: true,
          maxSize: 100,
          ttl: 5000,
          storage: 'localStorage',
        },
      });

      localStorageEngine.init();
      localStorageEngine.t('welcome');

      // 应该调用 localStorage
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('资源管理', () => {
    beforeEach(async () => {
      await i18nEngine.init();
    });

    it('应该动态添加资源', () => {
      i18nEngine.addResource('zh-CN', 'dynamic', '动态添加的文本');

      expect(i18nEngine.t('dynamic')).toBe('动态添加的文本');
    });

    it('应该动态添加资源包', () => {
      const newBundle = {
        button: {
          save: '保存',
          cancel: '取消',
        },
      };

      i18nEngine.addResourceBundle('zh-CN', 'common', newBundle);

      expect(i18nEngine.t('common:button.save')).toBe('保存');
    });

    it('应该移除资源包', () => {
      i18nEngine.addResourceBundle('zh-CN', 'temp', { test: '测试' });
      expect(i18nEngine.t('temp:test')).toBe('测试');

      i18nEngine.removeResourceBundle('zh-CN', 'temp');
      expect(i18nEngine.t('temp:test')).toBe('temp:test'); // 应该返回键名
    });

    it('应该检查语言是否存在', () => {
      expect(i18nEngine.hasLanguage('zh-CN')).toBe(true);
      expect(i18nEngine.hasLanguage('fr-FR')).toBe(false);
    });
  });

  describe('动态加载', () => {
    it('应该使用加载函数加载资源', async () => {
      const mockLoadFunction = vi.fn().mockResolvedValue({
        dynamic: '动态加载的文本',
      });

      const dynamicEngine = new I18nEngine({
        ...mockOptions,
        resources: undefined,
        loadFunction: mockLoadFunction,
      });

      await dynamicEngine.init();

      expect(mockLoadFunction).toHaveBeenCalledWith('zh-CN', 'translation');
      expect(dynamicEngine.t('dynamic')).toBe('动态加载的文本');
    });

    it('应该优雅处理加载错误', async () => {
      const mockLoadFunction = vi
        .fn()
        .mockRejectedValue(new Error('Load failed'));

      const errorEngine = new I18nEngine({
        ...mockOptions,
        resources: undefined,
        loadFunction: mockLoadFunction,
      });

      const errorHandler = vi.fn();
      errorEngine.on('error', errorHandler);

      await errorEngine.init();

      expect(errorHandler).toHaveBeenCalled();
    });

    it('应该支持懒加载语言', async () => {
      const mockLoadFunction = vi.fn().mockImplementation(lang => {
        if (lang === 'ja-JP') {
          return Promise.resolve({
            welcome: 'いらっしゃいませ',
          });
        }
        return Promise.resolve({});
      });

      const lazyEngine = new I18nEngine({
        ...mockOptions,
        supportedLanguages: ['zh-CN', 'en-US', 'ja-JP'],
        loadFunction: mockLoadFunction,
      });

      await lazyEngine.init();

      // 懒加载日语
      await lazyEngine.loadLanguage('ja-JP');
      await lazyEngine.changeLanguage('ja-JP');

      expect(lazyEngine.t('welcome')).toBe('いらっしゃいませ');
    });
  });

  describe('事件系统', () => {
    beforeEach(async () => {
      await i18nEngine.init();
    });

    it('应该触发翻译缺失事件', () => {
      const missingHandler = vi.fn();
      i18nEngine.on('translationMissing', missingHandler);

      i18nEngine.t('nonexistent.key');

      expect(missingHandler).toHaveBeenCalledWith('nonexistent.key', 'zh-CN');
    });

    it('应该支持事件取消订阅', () => {
      const handler = vi.fn();

      i18nEngine.on('languageChanged', handler);
      i18nEngine.off('languageChanged', handler);

      i18nEngine.changeLanguage('en-US');

      expect(handler).not.toHaveBeenCalled();
    });

    it('应该触发资源加载事件', async () => {
      const loadedHandler = vi.fn();
      i18nEngine.on('resourceLoaded', loadedHandler);

      await i18nEngine.loadLanguage('en-US');

      expect(loadedHandler).toHaveBeenCalledWith('en-US', 'translation');
    });
  });

  describe('性能测试', () => {
    beforeEach(async () => {
      await i18nEngine.init();
    });

    it('应该高效处理高频翻译', () => {
      const startTime = Date.now();

      // 执行10000次翻译
      for (let i = 0; i < 10000; i++) {
        i18nEngine.t('welcome');
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // 缓存应该让这个很快
    });

    it('应该高效处理复杂插值', () => {
      const complexParams = {
        user: { name: '张三', level: 'VIP', score: 9999 },
        date: new Date().toISOString(),
        items: Array.from({ length: 100 }, (_, i) => `item${i}`),
      };

      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        i18nEngine.t('greeting', complexParams);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(200);
    });

    it('应该有效管理内存使用', () => {
      const initialStats = i18nEngine.getCacheStats();

      // 生成大量翻译
      for (let i = 0; i < 1000; i++) {
        i18nEngine.t('welcome', { param: `value${i}` });
      }

      const finalStats = i18nEngine.getCacheStats();

      // 缓存大小应该受到限制
      expect(finalStats.size).toBeLessThanOrEqual(mockOptions.cache.maxSize);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的翻译键', () => {
      expect(() => i18nEngine.t(null as any)).not.toThrow();
      expect(() => i18nEngine.t(undefined as any)).not.toThrow();
      expect(() => i18nEngine.t('')).not.toThrow();
    });

    it('应该处理循环引用的插值参数', () => {
      const circular: any = { name: '测试' };
      circular.self = circular;

      expect(() => i18nEngine.t('greeting', circular)).not.toThrow();
    });

    it('应该处理格式错误的资源', () => {
      expect(() => {
        i18nEngine.addResource('zh-CN', 'invalid', null as any);
      }).not.toThrow();
    });
  });
});
