/**
 * DeepSeek AI Provider (重构版 - 使用OpenAI SDK)
 * DeepSeek API 兼容 OpenAI，因此可以直接使用 OpenAI SDK
 */

import OpenAI from 'openai';
import { BaseAIProvider } from './base.js';
import type {
  TranslateParams,
  TranslateResult,
  TranslateBatchParams,
  TranslateBatchResult,
  StreamChunk,
  ProviderCapabilities,
  AIProviderConfig,
} from '../types.js';
import { ErrorFactory } from '../errors.js';
import { logger } from '../../utils/logger.js';

export class DeepSeekProvider extends BaseAIProvider {
  name = 'deepseek';
  capabilities: ProviderCapabilities = {
    streaming: true,
    batchOptimized: false,
    maxBatchSize: 20,
    maxTokens: 64000,
    supportedModels: [
      'deepseek-chat',
      'deepseek-coder',
    ],
  };

  private client: OpenAI;

  constructor(config: AIProviderConfig) {
    super(config);

    // DeepSeek 使用 OpenAI 兼容的 API
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.deepseek.com',
      timeout: config.timeout || 60000,
      maxRetries: 0, // 使用自己的重试逻辑
    });
  }

  /**
   * 翻译单个文本
   */
  async translate(params: TranslateParams): Promise<TranslateResult> {
    const prompt = this.buildPrompt(params);
    const model = this.config.model || 'deepseek-chat';

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature ?? 0.3,
        max_tokens: this.config.maxTokens || 2000,
      });

      const translatedText = this.cleanTranslation(
        response.choices[0]?.message?.content || ''
      );

      return {
        translatedText,
        sourceLang: params.sourceLang,
        targetLang: params.targetLang,
        tokensUsed: response.usage?.total_tokens || 0,
      };
    } catch (error: unknown) {
      const aiError = ErrorFactory.fromOpenAIError(error as Error, this.name);
      logger.error(`DeepSeek 翻译失败: ${aiError.message}`);
      throw aiError;
    }
  }

  /**
   * 批量翻译（优化实现）
   */
  async translateBatch(
    params: TranslateBatchParams
  ): Promise<TranslateBatchResult> {
    const prompt = this.buildBatchPrompt(params);
    const model = this.config.model || 'deepseek-chat';

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature ?? 0.3,
        max_tokens: this.config.maxTokens || 4000,
      });

      const content = response.choices[0]?.message?.content || '';
      const translations = this.parseBatchResult(content, params.items);

      return {
        translations,
        totalTokens: response.usage?.total_tokens || 0,
      };
    } catch (error: unknown) {
      const aiError = ErrorFactory.fromOpenAIError(error as Error, this.name);
      logger.warn(`DeepSeek 批量翻译失败，降级为逐条翻译: ${aiError.message}`);
      // 降级为逐条翻译
      return await super.translateBatch(params);
    }
  }

  /**
   * 流式翻译
   */
  async *translateStream(
    params: TranslateParams
  ): AsyncGenerator<StreamChunk, TranslateResult> {
    const prompt = this.buildPrompt(params);
    const model = this.config.model || 'deepseek-chat';

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature ?? 0.3,
        max_tokens: this.config.maxTokens || 2000,
        stream: true,
      });

      let fullText = '';
      let totalTokens = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullText += delta;
          yield {
            text: delta,
            finished: false,
          };
        }

        if (chunk.usage) {
          totalTokens = chunk.usage.total_tokens;
        }
      }

      // 返回最终结果
      const translatedText = this.cleanTranslation(fullText);

      return {
        translatedText,
        sourceLang: params.sourceLang,
        targetLang: params.targetLang,
        tokensUsed: totalTokens,
      };
    } catch (error: unknown) {
      const aiError = ErrorFactory.fromOpenAIError(error as Error, this.name);
      logger.error(`DeepSeek 流式翻译失败: ${aiError.message}`);
      throw aiError;
    }
  }
}
