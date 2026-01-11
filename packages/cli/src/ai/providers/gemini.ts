/**
 * Google Gemini AI Provider (重构版 - 使用官方SDK)
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
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

export class GeminiProvider extends BaseAIProvider {
  name = 'gemini';
  capabilities: ProviderCapabilities = {
    streaming: true,
    batchOptimized: false,
    maxBatchSize: 20,
    maxTokens: 32000,
    supportedModels: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  };

  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(config: AIProviderConfig) {
    super(config);

    this.genAI = new GoogleGenerativeAI(config.apiKey);

    const modelName = config.model || 'gemini-pro';
    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: config.temperature ?? 0.3,
        maxOutputTokens: config.maxTokens || 2000,
      },
    });
  }

  /**
   * 翻译单个文本
   */
  async translate(params: TranslateParams): Promise<TranslateResult> {
    const prompt = this.buildPrompt(params);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const translatedText = this.cleanTranslation(response.text());

      return {
        translatedText,
        sourceLang: params.sourceLang,
        targetLang: params.targetLang,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      };
    } catch (error: unknown) {
      const aiError = ErrorFactory.fromGeminiError(error as Error, this.name);
      logger.error(`Gemini 翻译失败: ${aiError.message}`);
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

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // 解析批量结果
      const translations = this.parseBatchResult(content, params.items);

      return {
        translations,
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
      };
    } catch (error: unknown) {
      const aiError = ErrorFactory.fromGeminiError(error as Error, this.name);
      logger.warn(`Gemini 批量翻译失败，降级为逐条翻译: ${aiError.message}`);
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

    try {
      const result = await this.model.generateContentStream(prompt);

      let fullText = '';
      let totalTokens = 0;

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullText += chunkText;
          yield {
            text: chunkText,
            finished: false,
          };
        }
      }

      // 获取最终的响应以获取token统计
      const finalResponse = await result.response;
      totalTokens = finalResponse.usageMetadata?.totalTokenCount || 0;

      // 返回最终结果
      const translatedText = this.cleanTranslation(fullText);

      return {
        translatedText,
        sourceLang: params.sourceLang,
        targetLang: params.targetLang,
        tokensUsed: totalTokens,
      };
    } catch (error: unknown) {
      const aiError = ErrorFactory.fromGeminiError(error as Error, this.name);
      logger.error(`Gemini 流式翻译失败: ${aiError.message}`);
      throw aiError;
    }
  }
}
