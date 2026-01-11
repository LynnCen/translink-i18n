/**
 * AI 翻译相关类型定义
 */

/**
 * AI Provider 接口
 */
export interface AIProvider {
  name: string;

  /**
   * Provider 能力声明
   */
  capabilities: ProviderCapabilities;

  /**
   * 翻译单个文本
   */
  translate(params: TranslateParams): Promise<TranslateResult>;

  /**
   * 批量翻译
   */
  translateBatch(params: TranslateBatchParams): Promise<TranslateBatchResult>;

  /**
   * 流式翻译（可选，用于长文本场景）
   */
  translateStream?(
    params: TranslateParams
  ): AsyncGenerator<StreamChunk, TranslateResult>;

  /**
   * 测试连接
   */
  testConnection(): Promise<boolean>;
}

/**
 * Provider 能力声明
 */
export interface ProviderCapabilities {
  streaming: boolean; // 是否支持流式响应
  batchOptimized: boolean; // 是否有原生批量API支持
  maxBatchSize?: number; // 最大批量大小
  maxTokens?: number; // 最大token限制
  supportedModels?: string[]; // 支持的模型列表
}

/**
 * 翻译参数
 */
export interface TranslateParams {
  text: string;
  sourceLang: string;
  targetLang: string;
  context?: string;
  glossary?: Record<string, string>;
}

/**
 * 翻译结果
 */
export interface TranslateResult {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  confidence?: number;
  tokensUsed?: number;
}

/**
 * 批量翻译参数
 */
export interface TranslateBatchParams {
  items: Array<{
    key: string;
    text: string;
  }>;
  sourceLang: string;
  targetLang: string;
  context?: string;
  glossary?: Record<string, string>;
}

/**
 * 批量翻译结果
 */
export interface TranslateBatchResult {
  translations: Array<{
    key: string;
    text: string;
    confidence?: number;
  }>;
  totalTokens?: number;
  cost?: number;
}

/**
 * AI Provider 配置
 */
export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  contextPrompt?: string;
  timeout?: number; // 超时时间（毫秒）
  maxRetries?: number; // 最大重试次数
  [key: string]: any;
}

/**
 * 流式响应块
 */
export interface StreamChunk {
  text: string; // 本次返回的文本片段
  finished: boolean; // 是否完成
  tokensUsed?: number; // 已使用的token数
}

/**
 * 翻译报告
 */
export interface TranslationReport {
  total: number;
  translated: number;
  skipped: number;
  failed: number;
  duration?: number;
  tokensUsed?: number;
  cost?: number;
}

/**
 * 翻译统计
 */
export interface TranslationStats {
  total: number;
  pending: number;
  translated: number;
  reviewed: number;
}

/**
 * 翻译缓存项
 */
export interface CacheItem {
  key: string;
  sourceLang: string;
  targetLang: string;
  text: string;
  timestamp: number;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxSize?: number;
}

