import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheManager } from '../cache/cache-manager.js';

describe('CacheManager', () => {
  let cacheManager: CacheManager<string>;
  const mockOptions = {
    maxSize: 5,
    ttl: 1000,
    storage: 'memory' as const
  };

  beforeEach(() => {
    cacheManager = new CacheManager(mockOptions);
  });

  describe('基本操作', () => {
    it('应该设置和获取值', () => {
      cacheManager.set('key1', 'value1');
      expect(cacheManager.get('key1')).toBe('value1');
    });

    it('应该对不存在的键返回 null', () => {
      expect(cacheManager.get('nonexistent')).toBeNull();
    });

    it('应该检查键是否存在', () => {
      cacheManager.set('key1', 'value1');
      expect(cacheManager.has('key1')).toBe(true);
      expect(cacheManager.has('nonexistent')).toBe(false);
    });

    it('应该删除值', () => {
      cacheManager.set('key1', 'value1');
      expect(cacheManager.has('key1')).toBe(true);
      
      cacheManager.delete('key1');
      expect(cacheManager.has('key1')).toBe(false);
    });

    it('应该清除所有值', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      expect(cacheManager.size()).toBe(2);
      
      cacheManager.clear();
      expect(cacheManager.size()).toBe(0);
    });

    it('应该返回正确的大小', () => {
      expect(cacheManager.size()).toBe(0);
      
      cacheManager.set('key1', 'value1');
      expect(cacheManager.size()).toBe(1);
      
      cacheManager.set('key2', 'value2');
      expect(cacheManager.size()).toBe(2);
    });
  });

  describe('TTL (生存时间)', () => {
    it('应该在 TTL 后过期条目', async () => {
      const shortTTLManager = new CacheManager<string>({
        maxSize: 10,
        ttl: 50, // 50ms
        storage: 'memory'
      });

      shortTTLManager.set('key1', 'value1');
      expect(shortTTLManager.get('key1')).toBe('value1');

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 60));

      expect(shortTTLManager.get('key1')).toBeNull();
    });

    it('应该在获取时更新访问时间', () => {
      cacheManager.set('key1', 'value1');
      
      const entry = (cacheManager as any).memoryCache.get('key1');
      const originalAccessTime = entry.lastAccessed;
      
      // 小延迟确保不同的时间戳
      setTimeout(() => {
        cacheManager.get('key1');
        const updatedEntry = (cacheManager as any).memoryCache.get('key1');
        expect(updatedEntry.lastAccessed).toBeGreaterThan(originalAccessTime);
      }, 10);
    });

    it('应该增加访问计数', () => {
      cacheManager.set('key1', 'value1');
      
      cacheManager.get('key1');
      cacheManager.get('key1');
      
      const entry = (cacheManager as any).memoryCache.get('key1');
      expect(entry.accessCount).toBe(2);
    });

    it('应该在设置时重置 TTL', async () => {
      const shortTTLManager = new CacheManager<string>({
        maxSize: 10,
        ttl: 100, // 100ms
        storage: 'memory'
      });

      shortTTLManager.set('key1', 'value1');
      
      // 等待一半时间
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 重新设置值，应该重置 TTL
      shortTTLManager.set('key1', 'newValue');
      
      // 再等待一半时间，应该仍然存在
      await new Promise(resolve => setTimeout(resolve, 60));
      
      expect(shortTTLManager.get('key1')).toBe('newValue');
    });
  });

  describe('LRU 淘汰', () => {
    it('应该在超过最大大小时淘汰最少使用的项目', () => {
      // 填满缓存到最大大小
      for (let i = 0; i < 5; i++) {
        cacheManager.set(`key${i}`, `value${i}`);
      }
      expect(cacheManager.size()).toBe(5);

      // 添加一个更多项目，应该淘汰最旧的
      cacheManager.set('key5', 'value5');
      expect(cacheManager.size()).toBe(5);
      
      // key0 应该被淘汰（最旧的）
      expect(cacheManager.has('key0')).toBe(false);
      expect(cacheManager.has('key5')).toBe(true);
    });

    it('应该在访问时更新 LRU 顺序', () => {
      // 填满缓存
      for (let i = 0; i < 5; i++) {
        cacheManager.set(`key${i}`, `value${i}`);
      }

      // 访问 key0 使其成为最近使用的
      cacheManager.get('key0');

      // 添加新项目，应该淘汰 key1（现在是最旧的）
      cacheManager.set('key5', 'value5');
      
      expect(cacheManager.has('key0')).toBe(true); // 应该仍然存在
      expect(cacheManager.has('key1')).toBe(false); // 应该被淘汰
    });

    it('应该在设置时更新 LRU 顺序', () => {
      // 填满缓存
      for (let i = 0; i < 5; i++) {
        cacheManager.set(`key${i}`, `value${i}`);
      }

      // 重新设置 key0，使其成为最近使用的
      cacheManager.set('key0', 'newValue0');

      // 添加新项目
      cacheManager.set('key5', 'value5');
      
      expect(cacheManager.has('key0')).toBe(true);
      expect(cacheManager.get('key0')).toBe('newValue0');
      expect(cacheManager.has('key1')).toBe(false); // 应该被淘汰
    });
  });

  describe('存储后端', () => {
    it('应该与 localStorage 后端工作', () => {
      const localStorageManager = new CacheManager<string>({
        maxSize: 10,
        ttl: 5000,
        storage: 'localStorage'
      });

      localStorageManager.set('test', 'value');
      expect(window.localStorage.setItem).toHaveBeenCalled();
      
      localStorageManager.get('test');
      expect(window.localStorage.getItem).toHaveBeenCalled();
    });

    it('应该与 sessionStorage 后端工作', () => {
      const sessionStorageManager = new CacheManager<string>({
        maxSize: 10,
        ttl: 5000,
        storage: 'sessionStorage'
      });

      sessionStorageManager.set('test', 'value');
      expect(window.sessionStorage.setItem).toHaveBeenCalled();
      
      sessionStorageManager.get('test');
      expect(window.sessionStorage.getItem).toHaveBeenCalled();
    });

    it('应该在 localStorage 不可用时回退到内存', () => {
      // Mock localStorage 抛出错误
      vi.mocked(window.localStorage.setItem).mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const fallbackManager = new CacheManager<string>({
        maxSize: 10,
        ttl: 5000,
        storage: 'localStorage'
      });

      // 应该不抛出错误并使用内存存储工作
      expect(() => {
        fallbackManager.set('key', 'value');
        expect(fallbackManager.get('key')).toBe('value');
      }).not.toThrow();
    });
  });

  describe('统计信息', () => {
    it('应该提供缓存统计信息', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      
      cacheManager.get('key1');
      cacheManager.get('key1');
      cacheManager.get('key2');
      cacheManager.get('nonexistent'); // 未命中

      const stats = cacheManager.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.hits).toBe(3);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.75); // 3/4
    });

    it('应该重置统计信息', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.get('key1');
      cacheManager.get('nonexistent');

      let stats = cacheManager.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);

      cacheManager.resetStats();
      stats = cacheManager.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });

    it('应该正确计算命中率', () => {
      // 没有操作时命中率应该为 0
      expect(cacheManager.getStats().hitRate).toBe(0);
      
      cacheManager.set('key1', 'value1');
      
      // 只有命中，没有未命中
      cacheManager.get('key1');
      expect(cacheManager.getStats().hitRate).toBe(1);
      
      // 添加一些未命中
      cacheManager.get('nonexistent1');
      cacheManager.get('nonexistent2');
      
      // 命中率应该是 1/3
      expect(cacheManager.getStats().hitRate).toBeCloseTo(0.33, 2);
    });
  });

  describe('清理和维护', () => {
    it('应该清理过期条目', async () => {
      const shortTTLManager = new CacheManager<string>({
        maxSize: 10,
        ttl: 50,
        storage: 'memory'
      });

      shortTTLManager.set('key1', 'value1');
      shortTTLManager.set('key2', 'value2');
      expect(shortTTLManager.size()).toBe(2);

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 60));

      // 触发清理通过访问缓存
      shortTTLManager.get('key1');

      expect(shortTTLManager.size()).toBe(0);
    });

    it('应该正确释放资源', () => {
      cacheManager.set('key1', 'value1');
      expect(cacheManager.size()).toBe(1);

      cacheManager.dispose();
      expect(cacheManager.size()).toBe(0);
    });

    it('应该在清理时保留未过期的条目', async () => {
      const mixedTTLManager = new CacheManager<string>({
        maxSize: 10,
        ttl: 100,
        storage: 'memory'
      });

      mixedTTLManager.set('key1', 'value1');
      
      // 等待一半时间
      await new Promise(resolve => setTimeout(resolve, 50));
      
      mixedTTLManager.set('key2', 'value2'); // 这个应该有更长的剩余时间
      
      // 等待第一个过期
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // 触发清理
      mixedTTLManager.get('key2');
      
      expect(mixedTTLManager.has('key1')).toBe(false); // 应该过期
      expect(mixedTTLManager.has('key2')).toBe(true);  // 应该仍然存在
    });
  });

  describe('边界情况', () => {
    it('应该处理 undefined 和 null 值', () => {
      cacheManager.set('undefined', undefined as any);
      cacheManager.set('null', null as any);

      expect(cacheManager.get('undefined')).toBeUndefined();
      expect(cacheManager.get('null')).toBeNull();
    });

    it('应该处理空字符串键', () => {
      cacheManager.set('', 'empty key value');
      expect(cacheManager.get('')).toBe('empty key value');
    });

    it('应该处理非常大的值', () => {
      const largeValue = 'x'.repeat(10000);
      cacheManager.set('large', largeValue);
      expect(cacheManager.get('large')).toBe(largeValue);
    });

    it('应该处理零 TTL', () => {
      const zeroTTLManager = new CacheManager<string>({
        maxSize: 10,
        ttl: 0,
        storage: 'memory'
      });

      zeroTTLManager.set('key1', 'value1');
      
      // 零 TTL 意味着立即过期
      expect(zeroTTLManager.get('key1')).toBeNull();
    });

    it('应该处理零最大大小', () => {
      const zeroSizeManager = new CacheManager<string>({
        maxSize: 0,
        ttl: 1000,
        storage: 'memory'
      });

      zeroSizeManager.set('key1', 'value1');
      
      // 零大小意味着不能存储任何东西
      expect(zeroSizeManager.get('key1')).toBeNull();
      expect(zeroSizeManager.size()).toBe(0);
    });
  });

  describe('并发访问', () => {
    it('应该处理并发访问', async () => {
      // 模拟并发访问
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() => {
            cacheManager.set(`key${i}`, `value${i}`);
            return cacheManager.get(`key${i}`);
          })
        );
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(100);
      
      // 由于 LRU 淘汰，只有最后 5 个应该保留
      expect(cacheManager.size()).toBe(5);
    });

    it('应该在并发操作中保持数据一致性', async () => {
      const key = 'concurrent-key';
      
      // 并发设置相同键
      const setPromises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve().then(() => cacheManager.set(key, `value${i}`))
      );
      
      await Promise.all(setPromises);
      
      // 应该有一个值（最后一个获胜）
      expect(cacheManager.has(key)).toBe(true);
      expect(cacheManager.get(key)).toMatch(/^value\d$/);
    });
  });
});
