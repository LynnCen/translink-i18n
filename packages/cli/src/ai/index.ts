/**
 * AI 模块入口
 */

export * from './types.js';
export * from './engine.js';
export * from './provider-manager.js';
export * from './providers/index.js';
export * from './utils/cache.js';
export * from './errors.js';
export * from './utils/retry.js';

// 注册所有 providers
import { providerManager } from './provider-manager.js';
import {
  DeepSeekProvider,
  GeminiProvider,
  OpenAIProvider,
  AnthropicProvider,
} from './providers/index.js';

providerManager.register('deepseek', DeepSeekProvider);
providerManager.register('gemini', GeminiProvider);
providerManager.register('openai', OpenAIProvider);
providerManager.register('anthropic', AnthropicProvider);
