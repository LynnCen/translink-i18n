/**
 * AI Provider 基类（重构版）
 */

import type {
  AIProvider,
  AIProviderConfig,
  TranslateParams,
  TranslateResult,
  TranslateBatchParams,
  TranslateBatchResult,
  StreamChunk,
  ProviderCapabilities,
} from '../types.js';
import { ValidationError } from '../errors.js';
import { logger } from '../../utils/logger.js';

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  abstract capabilities: ProviderCapabilities;
  
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * 验证配置（子类可重写）
   */
  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new ValidationError('API密钥不能为空', {
        field: 'apiKey',
        provider: this.name,
      });
    }
  }

  /**
   * 翻译单个文本（子类必须实现）
   */
  abstract translate(params: TranslateParams): Promise<TranslateResult>;

  /**
   * 批量翻译（默认实现：循环调用单个翻译）
   * 子类可以重写以提供更优化的批量处理
   */
  async translateBatch(
    params: TranslateBatchParams
  ): Promise<TranslateBatchResult> {
    const translations = [];
    let totalTokens = 0;

    for (const item of params.items) {
      try {
        const result = await this.translate({
          text: item.text,
          sourceLang: params.sourceLang,
          targetLang: params.targetLang,
          context: params.context,
          glossary: params.glossary,
        });

        translations.push({
          key: item.key,
          text: result.translatedText,
          confidence: result.confidence,
        });

        totalTokens += result.tokensUsed || 0;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`翻译失败 [${item.key}]: ${errorMessage}`);
        // 失败时使用原文
        translations.push({
          key: item.key,
          text: item.text,
          confidence: 0,
        });
      }
    }

    return {
      translations,
      totalTokens,
    };
  }

  /**
   * 流式翻译（可选，子类可实现）
   * 注意：所有Provider都应该重写此方法以提供真正的流式支持
   * 此默认实现仅作为fallback
   */
  async *translateStream?(
    params: TranslateParams
  ): AsyncGenerator<StreamChunk, TranslateResult> {
    logger.debug(
      `${this.name}: 使用默认translateStream实现（非真实流式）`
    );
    
    // 默认实现：直接调用translate并返回完整结果
    const result = await this.translate(params);
    yield {
      text: result.translatedText,
      finished: true,
      tokensUsed: result.tokensUsed,
    };
    return result;
  }

  /**
   * 构建翻译提示
   */
  protected buildPrompt(params: TranslateParams): string {
    const { text, sourceLang, targetLang, context, glossary } = params;

    let prompt = context || this.config.contextPrompt || '';
    
    if (!prompt) {
      prompt = 'You are a professional translator. Translate the following text accurately while maintaining its original meaning, tone, and style.';
    }

    prompt += `\n\nSource Language: ${sourceLang}`;
    prompt += `\nTarget Language: ${targetLang}`;

    if (glossary && Object.keys(glossary).length > 0) {
      prompt += `\n\nGlossary (maintain consistency):`;
      Object.entries(glossary).forEach(([key, value]) => {
        prompt += `\n- ${key} → ${value}`;
      });
    }

    prompt += `\n\nText to translate:\n${text}`;
    prompt += `\n\nIMPORTANT: Return ONLY the translated text, without any explanations, notes, or additional formatting.`;
    prompt += `\n\nTranslation:`;

    return prompt;
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      // 测试翻译一个简单文本
      const result = await this.translate({
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'zh-CN',
      });
      return !!result.translatedText;
    } catch (error) {
      logger.debug(`${this.name} connection test failed: ${error}`);
      return false;
    }
  }

  /**
   * 清理翻译结果（移除可能的格式标记）
   */
  protected cleanTranslation(text: string): string {
    // 移除常见的markdown代码块标记
    text = text.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
    
    // 移除引号（如果整个文本被引号包裹）
    text = text.replace(/^["'](.*)["']$/s, '$1');
    
    // 移除首尾空白
    text = text.trim();
    
    return text;
  }

  /**
   * 从批量文本中解析单个翻译（用于批量优化实现）
   */
  protected parseBatchResult(
    content: string,
    items: Array<{ key: string; text: string }>
  ): Array<{ key: string; text: string; confidence?: number }> {
    const lines = content.split('\n').filter(l => l.trim());
    const translations = [];

    for (let i = 0; i < items.length; i++) {
      // 尝试匹配 [index] 格式
      const pattern = new RegExp(`^\\[${i}\\]\\s*(.+)$`);
      const line = lines.find(l => pattern.test(l));
      
      if (line) {
        const match = line.match(pattern);
        const text = match ? match[1].trim() : line.replace(`[${i}]`, '').trim();
        translations.push({
          key: items[i].key,
          text: this.cleanTranslation(text),
          confidence: 0.9,
        });
      } else {
        // 未找到对应翻译，使用原文
        logger.warn(`未找到索引 [${i}] 的翻译结果: ${items[i].key}`);
        translations.push({
          key: items[i].key,
          text: items[i].text,
          confidence: 0,
        });
      }
    }

    return translations;
  }

  /**
   * 构建批量翻译提示
   */
  protected buildBatchPrompt(params: TranslateBatchParams): string {
    // 将多个文本组合成一个请求
    const batchText = params.items
      .map((item, idx) => `[${idx}] ${item.text}`)
      .join('\n');

    const prompt = this.buildPrompt({
      text: batchText,
      sourceLang: params.sourceLang,
      targetLang: params.targetLang,
      context: params.context,
      glossary: params.glossary,
    });

    // 添加批量翻译的特殊说明
    return prompt.replace(
      'Translation:',
      'Please translate each line and keep the [index] prefix in your response.\n\nTranslation:'
    );
  }
}
