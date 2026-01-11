/**
 * 翻译缓存
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { CacheItem, CacheConfig } from '../types.js';
import { logger } from '../../utils/logger.js';

export class TranslationCache {
  private cache: Map<string, CacheItem> = new Map();
  private config: CacheConfig;
  private cacheFile: string;
  private isDirty: boolean = false;

  constructor(cacheFile: string, config: CacheConfig) {
    this.cacheFile = cacheFile;
    this.config = config;

    if (config.enabled) {
      this.load();
    }
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(
    key: string,
    sourceLang: string,
    targetLang: string
  ): string {
    return `${key}:${sourceLang}:${targetLang}`;
  }

  /**
   * 获取缓存
   */
  get(key: string, sourceLang: string, targetLang: string): string | null {
    if (!this.config.enabled) {
      return null;
    }

    const cacheKey = this.getCacheKey(key, sourceLang, targetLang);
    const item = this.cache.get(cacheKey);

    if (!item) {
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    const age = (now - item.timestamp) / 1000; // 转换为秒

    if (age > this.config.ttl) {
      // 过期，删除
      this.cache.delete(cacheKey);
      this.isDirty = true;
      return null;
    }

    logger.debug(`缓存命中: ${key}`);
    return item.text;
  }

  /**
   * 设置缓存
   */
  set(key: string, sourceLang: string, targetLang: string, text: string): void {
    if (!this.config.enabled) {
      return;
    }

    const cacheKey = this.getCacheKey(key, sourceLang, targetLang);
    this.cache.set(cacheKey, {
      key,
      sourceLang,
      targetLang,
      text,
      timestamp: Date.now(),
    });

    this.isDirty = true;

    // 检查缓存大小限制
    if (this.config.maxSize && this.cache.size > this.config.maxSize) {
      this.evictOldest();
    }
  }

  /**
   * 清除过期缓存
   */
  private evictOldest(): void {
    const items = Array.from(this.cache.entries());

    // 按时间排序
    items.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // 删除最旧的 10%
    const toDelete = Math.ceil(items.length * 0.1);
    for (let i = 0; i < toDelete; i++) {
      this.cache.delete(items[i][0]);
    }

    logger.debug(`清除了 ${toDelete} 个旧缓存项`);
  }

  /**
   * 从文件加载缓存
   */
  private load(): void {
    if (!existsSync(this.cacheFile)) {
      logger.debug('缓存文件不存在，使用空缓存');
      return;
    }

    try {
      const content = readFileSync(this.cacheFile, 'utf-8');
      const items: CacheItem[] = JSON.parse(content);

      const now = Date.now();
      let loaded = 0;
      let expired = 0;

      for (const item of items) {
        const age = (now - item.timestamp) / 1000;
        if (age <= this.config.ttl) {
          const cacheKey = this.getCacheKey(
            item.key,
            item.sourceLang,
            item.targetLang
          );
          this.cache.set(cacheKey, item);
          loaded++;
        } else {
          expired++;
        }
      }

      logger.debug(`加载缓存: ${loaded} 项有效, ${expired} 项已过期`);
    } catch (error: any) {
      logger.warn(`加载缓存失败: ${error.message}`);
    }
  }

  /**
   * 保存缓存到文件
   */
  save(): void {
    if (!this.config.enabled || !this.isDirty) {
      return;
    }

    try {
      const dir = dirname(this.cacheFile);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      const items = Array.from(this.cache.values());
      writeFileSync(this.cacheFile, JSON.stringify(items, null, 2), 'utf-8');

      this.isDirty = false;
      logger.debug(`缓存已保存: ${items.length} 项`);
    } catch (error: any) {
      logger.warn(`保存缓存失败: ${error.message}`);
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.isDirty = true;
    logger.debug('缓存已清空');
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;

    for (const item of this.cache.values()) {
      const age = (now - item.timestamp) / 1000;
      if (age <= this.config.ttl) {
        validCount++;
      } else {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      validCount,
      expiredCount,
      enabled: this.config.enabled,
      ttl: this.config.ttl,
      maxSize: this.config.maxSize,
    };
  }

  /**
   * 预热缓存（批量加载）
   */
  preload(
    items: Array<{
      key: string;
      sourceLang: string;
      targetLang: string;
      text: string;
    }>
  ) {
    if (!this.config.enabled) {
      return;
    }

    const timestamp = Date.now();
    for (const item of items) {
      const cacheKey = this.getCacheKey(
        item.key,
        item.sourceLang,
        item.targetLang
      );
      this.cache.set(cacheKey, {
        ...item,
        timestamp,
      });
    }

    this.isDirty = true;
    logger.debug(`预热缓存: ${items.length} 项`);
  }

  /**
   * 清理过期项
   */
  cleanExpired(): number {
    if (!this.config.enabled) {
      return 0;
    }

    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      const age = (now - item.timestamp) / 1000;
      if (age > this.config.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.isDirty = true;
      logger.debug(`清理了 ${cleaned} 个过期缓存项`);
    }

    return cleaned;
  }
}
