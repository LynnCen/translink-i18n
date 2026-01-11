/**
 * AI 翻译引擎 (重构版)
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { AITranslationConfig } from '../types/config.js';
import type { TranslationReport } from './types.js';
import { providerManager } from './provider-manager.js';
import { TranslationCache } from './utils/cache.js';
import { RetryStrategy } from './utils/retry.js';
import { logger } from '../utils/logger.js';

export interface TranslateFileParams {
  sourceFile: string;
  targetFile: string;
  sourceLang: string;
  targetLang: string;
  provider: string;
  force?: boolean;
  keys?: string[];
  dryRun?: boolean;
  stream?: boolean; // 是否使用流式响应
  onProgress?: (progress: TranslationProgress) => void;
}

export interface TranslationProgress {
  current: number;
  total: number;
  currentKey: string;
  translatedText?: string;
}

export class AITranslationEngine {
  private config: AITranslationConfig;
  private cache: TranslationCache;
  private retryStrategy: RetryStrategy;

  constructor(config: AITranslationConfig) {
    this.config = config;

    // 初始化缓存
    const cacheFile = resolve(
      process.cwd(),
      '.translink/translation-cache.json'
    );
    this.cache = new TranslationCache(cacheFile, {
      enabled: config.options.cache ?? true,
      ttl: config.options.cacheTTL ?? 86400, // 默认 24 小时
      maxSize: config.options.cacheMaxSize ?? 10000,
    });

    // 初始化重试策略
    this.retryStrategy = new RetryStrategy({
      maxRetries: config.options.maxRetries ?? 3,
      initialDelay: config.options.retryDelay ?? 1000,
      maxDelay: 60000,
      backoffMultiplier: 2,
      jitter: true,
    });
  }

  /**
   * 翻译整个语言文件
   */
  async translateLanguageFile(
    params: TranslateFileParams
  ): Promise<TranslationReport> {
    const {
      sourceFile,
      targetFile,
      sourceLang,
      targetLang,
      provider,
      force = false,
      keys = [],
      dryRun = false,
      stream = false,
      onProgress,
    } = params;

    const startTime = Date.now();

    // 1. 读取文件
    if (!existsSync(sourceFile)) {
      throw new Error(`源文件不存在: ${sourceFile}`);
    }

    const sourceData = JSON.parse(readFileSync(sourceFile, 'utf-8'));
    const targetData = existsSync(targetFile)
      ? JSON.parse(readFileSync(targetFile, 'utf-8'))
      : {};

    // 2. 识别待翻译项
    const itemsToTranslate = this.identifyItemsToTranslate(
      sourceData,
      targetData,
      sourceLang,
      targetLang,
      force,
      keys
    );

    if (itemsToTranslate.length === 0) {
      logger.info('没有需要翻译的项');
      return {
        total: Object.keys(sourceData).length,
        translated: 0,
        skipped: Object.keys(targetData).length,
        failed: 0,
        duration: Date.now() - startTime,
      };
    }

    logger.info(`需要翻译 ${itemsToTranslate.length} 个项目`);

    // 3. 获取 AI Provider
    const providerConfig = this.config.providers[provider];
    if (!providerConfig) {
      throw new Error(
        `未配置 Provider: ${provider}。请在 translink.config.ts 中添加配置`
      );
    }

    const aiProvider = providerManager.getProvider(provider, providerConfig);

    // 4. 根据是否流式选择不同的翻译策略
    let translated = 0;
    let failed = 0;
    let totalTokens = 0;

    if (stream && aiProvider.capabilities.streaming) {
      // 流式翻译（逐个处理）
      const result = await this.translateWithStream(
        aiProvider,
        itemsToTranslate,
        sourceLang,
        targetLang,
        sourceData,
        targetData,
        onProgress
      );
      translated = result.translated;
      failed = result.failed;
      totalTokens = result.totalTokens;
    } else {
      // 批量翻译
      const batchSize = this.config.options.batchSize || 20;
      const batches = this.createBatches(itemsToTranslate, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        logger.info(
          `正在翻译批次 ${i + 1}/${batches.length} (${batch.length} 项)...`
        );

        try {
          const result = await this.translateBatchWithRetry(
            aiProvider,
            batch,
            sourceLang,
            targetLang
          );

          // 5. 验证和保存结果
          for (const { key, text } of result.translations) {
            if (this.validateTranslation(sourceData[key], text)) {
              targetData[key] = text;
              translated++;

              // 缓存结果
              if (this.config.options.cache) {
                this.cache.set(key, sourceLang, targetLang, text);
              }

              // 报告进度
              if (onProgress) {
                onProgress({
                  current: translated + failed,
                  total: itemsToTranslate.length,
                  currentKey: key,
                  translatedText: text,
                });
              }
            } else {
              logger.warn(`翻译验证失败: ${key}`);
              failed++;
            }
          }

          totalTokens += result.totalTokens || 0;

          // 进度延迟（避免触发速率限制）
          if (i < batches.length - 1) {
            const delay = this.config.options.retryDelay || 1000;
            await this.sleep(delay);
          }
        } catch (error: any) {
          logger.error(`批次 ${i + 1} 翻译失败: ${error.message}`);
          failed += batch.length;
        }
      }
    }

    // 6. 保存缓存
    this.cache.save();

    // 7. 写入文件（如果不是预览模式）
    if (!dryRun) {
      const outputDir = dirname(targetFile);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      writeFileSync(targetFile, JSON.stringify(targetData, null, 2), 'utf-8');
    }

    const duration = Date.now() - startTime;
    const cost = this.estimateCost(totalTokens, provider);

    return {
      total: Object.keys(sourceData).length,
      translated,
      skipped: Object.keys(sourceData).length - translated - failed,
      failed,
      duration,
      tokensUsed: totalTokens,
      cost,
    };
  }

  /**
   * 流式翻译处理
   */
  private async translateWithStream(
    provider: any,
    items: Array<{ key: string; text: string }>,
    sourceLang: string,
    targetLang: string,
    sourceData: Record<string, string>,
    targetData: Record<string, string>,
    onProgress?: (progress: TranslationProgress) => void
  ): Promise<{ translated: number; failed: number; totalTokens: number }> {
    let translated = 0;
    let failed = 0;
    let totalTokens = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      logger.info(`流式翻译 [${i + 1}/${items.length}]: ${item.key}`);

      try {
        const result = await this.retryStrategy.execute(async () => {
          let fullText = '';
          const stream = provider.translateStream({
            text: item.text,
            sourceLang,
            targetLang,
            context: this.config.options.contextPrompt,
            glossary: this.config.options.glossary,
          });

          for await (const chunk of stream) {
            fullText += chunk.text;
            // 实时输出进度
            if (onProgress) {
              onProgress({
                current: i + 1,
                total: items.length,
                currentKey: item.key,
                translatedText: fullText,
              });
            }
          }

          return await stream.return(undefined);
        }, `流式翻译 ${item.key}`);

        if (
          this.validateTranslation(
            sourceData[item.key],
            result.value.translatedText
          )
        ) {
          targetData[item.key] = result.value.translatedText;
          translated++;
          totalTokens += result.value.tokensUsed || 0;

          // 缓存结果
          if (this.config.options.cache) {
            this.cache.set(
              item.key,
              sourceLang,
              targetLang,
              result.value.translatedText
            );
          }
        } else {
          logger.warn(`翻译验证失败: ${item.key}`);
          failed++;
        }
      } catch (error: any) {
        logger.error(`流式翻译失败 [${item.key}]: ${error.message}`);
        failed++;
      }

      // 延迟（避免触发速率限制）
      if (i < items.length - 1) {
        await this.sleep(this.config.options.retryDelay || 1000);
      }
    }

    return { translated, failed, totalTokens };
  }

  /**
   * 识别待翻译项
   */
  private identifyItemsToTranslate(
    sourceData: Record<string, string>,
    targetData: Record<string, string>,
    sourceLang: string,
    targetLang: string,
    force: boolean,
    keys: string[]
  ): Array<{ key: string; text: string }> {
    const items: Array<{ key: string; text: string }> = [];

    // 如果指定了 keys，只处理这些 keys
    const keysToProcess = keys.length > 0 ? keys : Object.keys(sourceData);

    for (const key of keysToProcess) {
      const text = sourceData[key];
      if (!text) continue;

      // 场景1: 强制翻译
      if (force) {
        items.push({ key, text });
        continue;
      }

      // 场景2: 目标文件中不存在
      if (!targetData[key]) {
        items.push({ key, text });
        continue;
      }

      // 场景3: 目标文件中为空
      if (!targetData[key].trim()) {
        items.push({ key, text });
        continue;
      }

      // 场景4: 检查缓存
      if (this.config.options.cache) {
        const cached = this.cache.get(key, sourceLang, targetLang);
        if (cached && cached !== targetData[key]) {
          targetData[key] = cached;
        }
      }
    }

    return items;
  }

  /**
   * 创建批次
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * 带重试的批量翻译
   */
  private async translateBatchWithRetry(
    provider: any,
    batch: Array<{ key: string; text: string }>,
    sourceLang: string,
    targetLang: string
  ): Promise<any> {
    return await this.retryStrategy.execute(
      () =>
        provider.translateBatch({
          items: batch,
          sourceLang,
          targetLang,
          context: this.config.options.contextPrompt,
          glossary: this.config.options.glossary,
        }),
      `批量翻译 (${batch.length} 项)`
    );
  }

  /**
   * 验证翻译结果
   */
  private validateTranslation(
    originalText: string,
    translatedText: string
  ): boolean {
    if (!translatedText || !translatedText.trim()) {
      return false;
    }

    const quality = this.config.quality || {};

    // 检测未翻译（原文和译文相同）
    if (quality.detectUntranslated && originalText === translatedText) {
      return false;
    }

    // 检查长度比例（防止翻译结果过短或过长）
    const minRatio = quality.minLengthRatio || 0.3;
    const maxRatio = quality.maxLengthRatio || 3.0;
    const lengthRatio = translatedText.length / originalText.length;

    if (lengthRatio < minRatio || lengthRatio > maxRatio) {
      logger.warn(
        `翻译长度异常: 原文 ${originalText.length} → 译文 ${translatedText.length} (比例 ${lengthRatio.toFixed(2)})`
      );
      // 不完全拒绝，只是警告
    }

    return true;
  }

  /**
   * 估算成本
   */
  private estimateCost(tokens: number, provider: string): number {
    const pricing: Record<string, number> = {
      deepseek: 0.14 / 1_000_000, // $0.14 per 1M tokens
      gemini: 0, // Free
      openai: 10.0 / 1_000_000, // $10 per 1M tokens
      anthropic: 15.0 / 1_000_000, // $15 per 1M tokens
    };

    const pricePerToken = pricing[provider] || 1.0 / 1_000_000;
    return tokens * pricePerToken;
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
