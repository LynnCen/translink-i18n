/**
 * AI Provider 管理器
 */

import type { AIProvider, AIProviderConfig } from './types.js';
import { logger } from '../utils/logger.js';

export class ProviderManager {
  private providers: Map<string, new (config: AIProviderConfig) => AIProvider> =
    new Map();
  private instances: Map<string, AIProvider> = new Map();

  /**
   * 注册 Provider
   */
  register(
    name: string,
    ProviderClass: new (config: AIProviderConfig) => AIProvider
  ): void {
    this.providers.set(name.toLowerCase(), ProviderClass);
    logger.debug(`注册 AI Provider: ${name}`);
  }

  /**
   * 获取 Provider 实例
   */
  getProvider(name: string, config: AIProviderConfig): AIProvider {
    const normalizedName = name.toLowerCase();

    // 检查是否已有实例
    const cached = this.instances.get(normalizedName);
    if (cached) {
      return cached;
    }

    // 创建新实例
    const ProviderClass = this.providers.get(normalizedName);
    if (!ProviderClass) {
      throw new Error(
        `未找到 AI Provider: ${name}。支持的 Provider: ${Array.from(this.providers.keys()).join(', ')}`
      );
    }

    const instance = new ProviderClass(config);
    this.instances.set(normalizedName, instance);

    logger.debug(`创建 AI Provider 实例: ${name}`);
    return instance;
  }

  /**
   * 列出所有已注册的 Provider
   */
  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * 检查 Provider 是否已注册
   */
  hasProvider(name: string): boolean {
    return this.providers.has(name.toLowerCase());
  }

  /**
   * 清除缓存的实例
   */
  clearInstances(): void {
    this.instances.clear();
    logger.debug('已清除所有 AI Provider 实例');
  }
}

// 导出单例
export const providerManager = new ProviderManager();
