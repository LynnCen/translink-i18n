import { createHash } from 'crypto';
import type { I18nConfig } from '../types/config.js';
import { logger } from '../utils/logger.js';

export interface HashContext {
  filePath: string;
  componentName?: string;
  functionName?: string;
  namespace?: string;
}

export interface HashOptions {
  content: string;
  context: HashContext;
  algorithm: 'md5' | 'sha1' | 'sha256';
  length: number;
  includeContext: boolean;
  contextFields: string[];
}

export class HashGenerator {
  private collisionMap = new Map<
    string,
    { content: string; context: HashContext }[]
  >();
  private config: I18nConfig['hash'];

  constructor(config: I18nConfig['hash']) {
    this.config = config;
  }

  /**
   * 生成翻译键的哈希值
   * 采用混合智能哈希算法，优先基于内容，发生碰撞时添加上下文
   */
  generate(content: string, context: HashContext): string {
    const options: HashOptions = {
      content,
      context,
      algorithm: this.config.algorithm,
      length: this.config.length,
      includeContext: this.config.includeContext,
      contextFields: this.config.contextFields,
    };

    // 1. 生成基础内容哈希
    const contentHash = this.generateContentHash(
      content,
      options.algorithm,
      options.length
    );

    // 2. 检查哈希冲突
    if (!this.hasCollision(contentHash, content, context)) {
      // 无冲突，记录并返回
      this.recordHash(contentHash, content, context);
      return contentHash;
    }

    // 3. 发生冲突，添加上下文信息
    logger.debug(
      `Hash collision detected for content: "${content.substring(0, 50)}..."`
    );
    const contextualHash = this.generateContextualHash(
      content,
      context,
      options
    );

    // 4. 记录最终哈希
    this.recordHash(contextualHash, content, context);
    return contextualHash;
  }

  /**
   * 生成基于内容的哈希
   */
  private generateContentHash(
    content: string,
    algorithm: string,
    length: number
  ): string {
    // 标准化内容：去除多余空格、统一换行符
    const normalizedContent = content
      .replace(/\s+/g, ' ')
      .replace(/\r\n|\r/g, '\n')
      .trim();

    const hash = createHash(algorithm);
    hash.update(normalizedContent, 'utf8');
    return hash.digest('hex').substring(0, length);
  }

  /**
   * 生成包含上下文的哈希
   */
  private generateContextualHash(
    content: string,
    context: HashContext,
    options: HashOptions
  ): string {
    if (!options.includeContext) {
      // 如果不包含上下文，使用更长的哈希
      return this.generateContentHash(
        content,
        options.algorithm,
        options.length + 4
      );
    }

    // 构建上下文字符串
    const contextParts: string[] = [];

    for (const field of options.contextFields) {
      const value = this.getContextValue(context, field);
      if (value) {
        contextParts.push(`${field}:${value}`);
      }
    }

    // 如果没有有效的上下文，使用文件路径的最后部分
    if (contextParts.length === 0) {
      const fileName = context.filePath.split('/').pop() || 'unknown';
      contextParts.push(`file:${fileName}`);
    }

    const contextString = contextParts.join('|');
    const combinedContent = `${content}::${contextString}`;

    return this.generateContentHash(
      combinedContent,
      options.algorithm,
      options.length
    );
  }

  /**
   * 从上下文对象中获取指定字段的值
   */
  private getContextValue(
    context: HashContext,
    field: string
  ): string | undefined {
    switch (field) {
      case 'filePath':
        return context.filePath;
      case 'componentName':
        return context.componentName;
      case 'functionName':
        return context.functionName;
      case 'namespace':
        return context.namespace;
      default:
        return undefined;
    }
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
