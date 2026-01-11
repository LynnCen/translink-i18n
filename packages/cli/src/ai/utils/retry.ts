/**
 * 智能重试机制
 */

import { logger } from '../../utils/logger.js';
import type { AIProviderError } from '../errors.js';
import { RateLimitError } from '../errors.js';

/**
 * 重试配置
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // 初始延迟（毫秒）
  maxDelay: number; // 最大延迟（毫秒）
  backoffMultiplier: number; // 退避倍数
  jitter: boolean; // 是否添加抖动
}

/**
 * 默认重试配置
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 60000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * 重试策略
 */
export class RetryStrategy {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * 判断错误是否应该重试
   */
  shouldRetry(error: AIProviderError, attempt: number): boolean {
    // 超过最大重试次数
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    // 明确标记为可重试的错误
    if (error.retryable) {
      return true;
    }

    // 某些错误不应重试
    if (!error.retryable && error.retryable !== undefined) {
      return false;
    }

    // 默认不重试
    return false;
  }

  /**
   * 计算下次重试的延迟时间（毫秒）
   */
  getRetryDelay(attempt: number, error?: AIProviderError): number {
    // 如果是速率限制错误且有retry-after，优先使用
    if (error instanceof RateLimitError && error.retryAfter) {
      return error.retryAfter * 1000; // 转换为毫秒
    }

    // 指数退避算法
    let delay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt),
      this.config.maxDelay
    );

    // 添加抖动（随机化），避免雷鸣羊群效应
    if (this.config.jitter) {
      const jitterAmount = delay * 0.1; // 10%的抖动
      delay = delay - jitterAmount / 2 + Math.random() * jitterAmount;
    }

    return Math.floor(delay);
  }

  /**
   * 延迟函数
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 执行带重试的异步操作
   */
  async execute<T>(
    operation: () => Promise<T>,
    operationName: string = 'Operation'
  ): Promise<T> {
    let lastError: AIProviderError | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        // 第一次尝试或重试
        if (attempt > 0) {
          const delay = this.getRetryDelay(attempt - 1, lastError);
          logger.info(
            `${operationName} 重试 ${attempt}/${this.config.maxRetries}，等待 ${delay}ms...`
          );
          await this.sleep(delay);
        }

        return await operation();
      } catch (error: any) {
        lastError = error as AIProviderError;

        // 判断是否应该重试
        if (!this.shouldRetry(lastError, attempt)) {
          logger.error(`${operationName} 失败且不可重试: ${lastError.message}`);
          throw lastError;
        }

        // 如果还有重试机会，继续
        if (attempt < this.config.maxRetries) {
          logger.warn(
            `${operationName} 失败 (尝试 ${attempt + 1}/${this.config.maxRetries + 1}): ${lastError.message}`
          );
        } else {
          // 已达到最大重试次数
          logger.error(
            `${operationName} 失败，已达到最大重试次数 (${this.config.maxRetries})`
          );
          throw lastError;
        }
      }
    }

    // 理论上不会到达这里，但为了类型安全
    throw lastError || new Error(`${operationName} 失败`);
  }
}

/**
 * 便捷函数：执行带重试的操作
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>,
  operationName?: string
): Promise<T> {
  const strategy = new RetryStrategy(config);
  return strategy.execute(operation, operationName);
}

/**
 * 批量操作的重试策略（支持部分失败）
 */
export class BatchRetryStrategy {
  private strategy: RetryStrategy;

  constructor(config: Partial<RetryConfig> = {}) {
    this.strategy = new RetryStrategy(config);
  }

  /**
   * 执行批量操作，失败的项目会重试
   */
  async executeBatch<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    operationName: string = 'Batch operation'
  ): Promise<{ results: R[]; failures: Array<{ item: T; error: Error }> }> {
    const results: R[] = [];
    const failures: Array<{ item: T; error: Error }> = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const result = await this.strategy.execute(
          () => operation(item),
          `${operationName} [${i + 1}/${items.length}]`
        );
        results.push(result);
      } catch (error: any) {
        logger.error(`批量操作项 ${i + 1} 失败: ${error.message}`);
        failures.push({ item, error });
      }
    }

    return { results, failures };
  }
}

/**
 * 并发控制的重试策略
 */
export class ConcurrentRetryStrategy {
  private strategy: RetryStrategy;
  private concurrency: number;

  constructor(config: Partial<RetryConfig> = {}, concurrency: number = 3) {
    this.strategy = new RetryStrategy(config);
    this.concurrency = concurrency;
  }

  /**
   * 并发执行多个操作，每个操作都有重试机制
   */
  async executeAll<T>(
    operations: Array<() => Promise<T>>,
    operationName: string = 'Concurrent operation'
  ): Promise<T[]> {
    const results: T[] = [];
    const queue = [...operations];
    const executing: Promise<void>[] = [];

    let index = 0;

    while (queue.length > 0 || executing.length > 0) {
      // 启动新的操作直到达到并发限制
      while (executing.length < this.concurrency && queue.length > 0) {
        const operation = queue.shift()!;
        const currentIndex = index++;

        const promise = this.strategy
          .execute(operation, `${operationName} #${currentIndex + 1}`)
          .then(result => {
            results[currentIndex] = result;
          })
          .finally(() => {
            executing.splice(executing.indexOf(promise), 1);
          });

        executing.push(promise);
      }

      // 等待至少一个操作完成
      if (executing.length > 0) {
        await Promise.race(executing);
      }
    }

    return results;
  }
}
