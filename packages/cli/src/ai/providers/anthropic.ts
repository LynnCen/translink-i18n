/**
 * Anthropic Claude AI Provider (使用官方SDK)
 */

import Anthropic from '@anthropic-ai/sdk';
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

export class AnthropicProvider extends BaseAIProvider {
  name = 'anthropic';
  capabilities: ProviderCapabilities = {
    streaming: true,
    batchOptimized: false,
    maxBatchSize: 20,
    maxTokens: 200000, // Claude 3 支持超长上下文
    supportedModels: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-3-5-sonnet-20241022',
    ],
  };

  private client: Anthropic;

  constructor(config: AIProviderConfig) {
    super(config);

    this.client = new Anthropic({
      apiKey: config.apiKey,
      timeout: config.timeout || 60000,
      maxRetries: 0, // 使用自己的重试逻辑
    });
  }

  /**
   * 翻译单个文本
   */
  async translate(params: TranslateParams): Promise<TranslateResult> {
    const prompt = this.buildPrompt(params);
    const model = this.config.model || 'claude-3-sonnet-20240229';

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature ?? 0.3,
        messages: [{ role: 'user', content: prompt }],
      });

      // Claude 的响应格式
      const translatedText = this.cleanTranslation(
        response.content[0]?.type === 'text' ? response.content[0].text : ''
      );

      return {
        translatedText,
        sourceLang: params.sourceLang,
        targetLang: params.targetLang,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      };
    } catch (error: unknown) {
      const aiError = ErrorFactory.fromAnthropicError(
        error as Error,
        this.name
      );
      logger.error(`Anthropic 翻译失败: ${aiError.message}`);
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
    const model = this.config.model || 'claude-3-sonnet-20240229';

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: this.config.maxTokens || 4000,
        temperature: this.config.temperature ?? 0.3,
        messages: [{ role: 'user', content: prompt }],
      });

      const content =
        response.content[0]?.type === 'text' ? response.content[0].text : '';
      const translations = this.parseBatchResult(content, params.items);

      return {
        translations,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      };
    } catch (error: unknown) {
      const aiError = ErrorFactory.fromAnthropicError(
        error as Error,
        this.name
      );
      logger.warn(`Anthropic 批量翻译失败，降级为逐条翻译: ${aiError.message}`);
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
    const model = this.config.model || 'claude-3-sonnet-20240229';

    try {
      const stream = await this.client.messages.create({
        model,
        max_tokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature ?? 0.3,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });

      let fullText = '';
      let inputTokens = 0;
      let outputTokens = 0;

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            const delta = event.delta.text;
            fullText += delta;
            yield {
              text: delta,
              finished: false,
            };
          }
        } else if (event.type === 'message_start') {
          // 获取输入token统计
          inputTokens = event.message.usage.input_tokens;
        } else if (event.type === 'message_delta') {
          // 获取输出token统计
          if (event.usage) {
            outputTokens = event.usage.output_tokens;
          }
        }
      }

      // 返回最终结果
      const translatedText = this.cleanTranslation(fullText);

      return {
        translatedText,
        sourceLang: params.sourceLang,
        targetLang: params.targetLang,
        tokensUsed: inputTokens + outputTokens,
      };
    } catch (error: unknown) {
      const aiError = ErrorFactory.fromAnthropicError(
        error as Error,
        this.name
      );
      logger.error(`Anthropic 流式翻译失败: ${aiError.message}`);
      throw aiError;
    }
  }
}
