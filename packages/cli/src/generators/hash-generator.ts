import { generateHash as baseGenerateHash } from '@translink/hash';
import { logger } from '../utils/logger.js';

/**
 * Hash 上下文信息（用于冲突处理）
 */
export interface HashContext {
  filePath: string;
  componentName?: string;
  functionName?: string;
  namespace?: string;
}

/**
 * Hash 生成器
 *
 * 核心职责：
 * 1. 使用 @translink/hash 生成基础 hash
 * 2. 检测并处理极少数的 hash 冲突
 */
export class HashGenerator {
  private collisionMap = new Map<
    string,
    { content: string; context: HashContext }[]
  >();

  constructor() {
    // 不再需要配置，hash 生成完全由 @translink/hash 管理
  }

  /**
   * 生成翻译键的哈希值
   *
   * 流程：
   * 1. 使用 @translink/hash 生成基础 hash
   * 2. 检测冲突
   * 3. 如有冲突，添加文件路径重新生成
   */
  generate(content: string, context: HashContext): string {
    // 1. 生成基础内容哈希（使用 @translink/hash）
    const contentHash = baseGenerateHash(content);

    // 2. 检查哈希冲突
    if (!this.hasCollision(contentHash, content, context)) {
      // 无冲突，记录并返回
      this.recordHash(contentHash, content, context);
      return contentHash;
    }

    // 3. 发生冲突（极少数情况），添加文件路径重新生成
    logger.debug(
      `Hash collision detected for content: "${content.substring(0, 50)}..."`
    );

    const contextualHash = this.generateContextualHash(content, context);

    // 4. 记录最终哈希
    this.recordHash(contextualHash, content, context);
    return contextualHash;
  }

  /**
   * 生成包含上下文的哈希（用于处理冲突）
   *
   * 策略：将内容与文件路径组合后重新 hash
   * 例如：'你好，世界' + '::file:App.tsx' → hash
   */
  private generateContextualHash(
    content: string,
    context: HashContext
  ): string {
    // 使用文件名作为上下文（最简单有效的冲突解决方案）
    const fileName = context.filePath.split('/').pop() || 'unknown';
    const combinedContent = `${content}::file:${fileName}`;

    // 使用 @translink/hash 重新生成
    return baseGenerateHash(combinedContent);
  }

  /**
   * 检查哈希是否发生冲突
   */
  private hasCollision(
    hash: string,
    content: string,
    _context: HashContext
  ): boolean {
    const existing = this.collisionMap.get(hash);
    if (!existing) {
      return false;
    }

    // 检查是否是相同内容（不算冲突）
    return !existing.some(item => item.content === content);
  }

  /**
   * 记录哈希映射，用于冲突检测
   */
  private recordHash(
    hash: string,
    content: string,
    context: HashContext
  ): void {
    if (!this.collisionMap.has(hash)) {
      this.collisionMap.set(hash, []);
    }

    const existing = this.collisionMap.get(hash)!;
    // 避免重复记录相同内容
    if (!existing.some(item => item.content === content)) {
      existing.push({ content, context });
    }
  }

  /**
   * 获取冲突统计信息
   */
  getCollisionStats(): {
    totalHashes: number;
    collisions: number;
    collisionRate: number;
  } {
    const totalHashes = this.collisionMap.size;
    const collisions = Array.from(this.collisionMap.values()).filter(
      items => items.length > 1
    ).length;

    return {
      totalHashes,
      collisions,
      collisionRate: totalHashes > 0 ? collisions / totalHashes : 0,
    };
  }

  /**
   * 清空冲突记录
   */
  clear(): void {
    this.collisionMap.clear();
  }

  /**
   * 验证哈希的唯一性和稳定性
   */
  validateHash(
    content: string,
    context: HashContext
  ): {
    hash: string;
    isStable: boolean;
    hasCollision: boolean;
  } {
    const hash1 = this.generate(content, context);

    // 清除记录重新生成，测试稳定性
    const tempMap = new Map(this.collisionMap);
    this.collisionMap.clear();
    const hash2 = this.generate(content, context);
    this.collisionMap = tempMap;

    return {
      hash: hash1,
      isStable: hash1 === hash2,
      hasCollision: this.hasCollision(hash1, content, context),
    };
  }
}
