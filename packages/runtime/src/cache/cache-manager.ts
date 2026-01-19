/**
 * 多级缓存管理器
 * 支持内存缓存、LocalStorage 和 SessionStorage
 */

import type { CacheEntry } from '../types/index.js';

export interface CacheOptions {
  maxSize: number;
  ttl: number; // 生存时间（毫秒）
  storage: 'memory' | 'localStorage' | 'sessionStorage';
  prefix: string;
}

export class CacheManager<T = any> {
  private memoryCache = new Map<string, CacheEntry<T>>();
  private options: CacheOptions;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      maxSize: 1000,
      ttl: 5 * 60 * 1000, // 5分钟
      storage: 'memory',
      prefix: 'translink_i18n_',
      ...options,
    };

    // 启动定期清理
    this.startCleanup();
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      ttl: ttl || this.options.ttl,
      accessCount: 0,
      lastAccessed: now,
    };

    // 内存缓存
    if (this.options.storage === 'memory' || this.isMemoryFallback()) {
      this.setMemoryCache(key, entry);
    }

    // 持久化缓存
    if (this.options.storage !== 'memory' && this.isStorageAvailable()) {
      this.setStorageCache(key, entry);
    }
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | null {
    let entry: CacheEntry<T> | null = null;

    // 先从内存缓存获取
    if (this.options.storage === 'memory' || this.isMemoryFallback()) {
      entry = this.getMemoryCache(key);
    }

    // 如果内存中没有，从持久化缓存获取
    if (
      !entry &&
      this.options.storage !== 'memory' &&
      this.isStorageAvailable()
    ) {
      entry = this.getStorageCache(key);

      // 将持久化缓存的数据加载到内存中
      if (entry && this.isMemoryFallback()) {
        this.setMemoryCache(key, entry);
      }
    }

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.delete(key);
      return null;
    }

    // 更新访问信息
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.value;
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    let deleted = false;

    // 从内存缓存删除
    if (this.memoryCache.has(key)) {
      this.memoryCache.delete(key);
      deleted = true;
    }

    // 从持久化缓存删除
    if (this.options.storage !== 'memory' && this.isStorageAvailable()) {
      const storage = this.getStorage();
      const storageKey = this.getStorageKey(key);

      if (storage.getItem(storageKey)) {
        storage.removeItem(storageKey);
        deleted = true;
      }
    }

    return deleted;
  }

  /**
   * 检查缓存项是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    // 清空内存缓存
    this.memoryCache.clear();

    // 清空持久化缓存
    if (this.options.storage !== 'memory' && this.isStorageAvailable()) {
      const storage = this.getStorage();
      const keys: string[] = [];

      // 收集所有相关的键
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.options.prefix)) {
          keys.push(key);
        }
      }

      // 删除所有相关键
      keys.forEach(key => storage.removeItem(key));
    }
  }

  /**
   * 按前缀清除缓存
   */
  clearByPrefix(prefix: string): number {
    let cleared = 0;

    // 清除内存缓存中匹配前缀的项
    const keysToDelete: string[] = [];
    for (const [key, _entry] of this.memoryCache.entries()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.memoryCache.delete(key);
      cleared++;
    });

    // 清除持久化缓存中匹配前缀的项
    if (this.options.storage !== 'memory' && this.isStorageAvailable()) {
      const storage = this.getStorage();
      const storageKeysToDelete: string[] = [];
      const fullPrefix = this.getStorageKey(prefix);

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(fullPrefix)) {
          storageKeysToDelete.push(key);
        }
      }

      storageKeysToDelete.forEach(key => {
        storage.removeItem(key);
        cleared++;
      });
    }

    return cleared;
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const memorySize = this.memoryCache.size;
    let storageSize = 0;

    if (this.options.storage !== 'memory' && this.isStorageAvailable()) {
      const storage = this.getStorage();
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.options.prefix)) {
          storageSize++;
        }
      }
    }

    return {
      memorySize,
      storageSize,
      totalSize: memorySize + storageSize,
      maxSize: this.options.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  /**
   * 设置内存缓存
   */
  private setMemoryCache(key: string, entry: CacheEntry<T>): void {
    // 如果超过最大大小，删除最久未使用的项
    if (this.memoryCache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.memoryCache.set(key, entry);
  }

  /**
   * 获取内存缓存
   */
  private getMemoryCache(key: string): CacheEntry<T> | null {
    return this.memoryCache.get(key) || null;
  }

  /**
   * 设置持久化缓存
   */
  private setStorageCache(key: string, entry: CacheEntry<T>): void {
    try {
      const storage = this.getStorage();
      const storageKey = this.getStorageKey(key);
      storage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to set storage cache:', error);
    }
  }

  /**
   * 获取持久化缓存
   */
  private getStorageCache(key: string): CacheEntry<T> | null {
    try {
      const storage = this.getStorage();
      const storageKey = this.getStorageKey(key);
      const item = storage.getItem(storageKey);

      if (item) {
        return JSON.parse(item) as CacheEntry<T>;
      }
    } catch (error) {
      console.warn('Failed to get storage cache:', error);
    }

    return null;
  }

  /**
   * 获取存储对象
   */
  private getStorage(): Storage {
    if (typeof window === 'undefined') {
      throw new Error('Storage is not available in non-browser environment');
    }

    return this.options.storage === 'localStorage'
      ? window.localStorage
      : window.sessionStorage;
  }

  /**
   * 生成存储键名
   */
  private getStorageKey(key: string): string {
    return `${this.options.prefix}${key}`;
  }

  /**
   * 检查存储是否可用
   */
  private isStorageAvailable(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const storage = this.getStorage();
      const testKey = '__translink_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 是否使用内存作为后备
   */
  private isMemoryFallback(): boolean {
    return this.options.storage !== 'memory' && !this.isStorageAvailable();
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * LRU 淘汰策略
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  /**
   * 计算缓存命中率
   */
  private calculateHitRate(): number {
    let totalAccess = 0;
    let totalHits = 0;

    for (const entry of this.memoryCache.values()) {
      totalAccess += entry.accessCount;
      if (entry.accessCount > 0) {
        totalHits++;
      }
    }

    return totalAccess > 0 ? totalHits / totalAccess : 0;
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.options.ttl);
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // 清理内存缓存
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.memoryCache.delete(key));
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    this.memoryCache.clear();
  }
}
