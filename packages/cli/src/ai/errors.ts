/**
 * AI Provider 错误处理系统
 */

/**
 * AI Provider 错误基类
 */
export class AIProviderError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly provider?: string;
  public readonly retryable: boolean;
  public readonly errorCause?: Error;

  constructor(
    message: string,
    options: {
      code: string;
      statusCode?: number;
      provider?: string;
      retryable?: boolean;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'AIProviderError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.provider = options.provider;
    this.retryable = options.retryable ?? false;
    this.errorCause = options.cause;

    // 保持正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * API 调用错误
 */
export class APIError extends AIProviderError {
  constructor(
    message: string,
    options: {
      statusCode: number;
      provider?: string;
      retryable?: boolean;
      cause?: Error;
    }
  ) {
    super(message, {
      code: 'API_ERROR',
      ...options,
    });
    this.name = 'APIError';
  }
}

/**
 * 速率限制错误
 */
export class RateLimitError extends AIProviderError {
  public readonly retryAfter?: number; // 秒数

  constructor(
    message: string,
    options: {
      provider?: string;
      retryAfter?: number;
      cause?: Error;
    }
  ) {
    super(message, {
      code: 'RATE_LIMIT',
      statusCode: 429,
      retryable: true,
      ...options,
    });
    this.name = 'RateLimitError';
    this.retryAfter = options.retryAfter;
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends AIProviderError {
  constructor(
    message: string,
    options: {
      provider?: string;
      cause?: Error;
    }
  ) {
    super(message, {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
      retryable: false,
      ...options,
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * 超时错误
 */
export class TimeoutError extends AIProviderError {
  constructor(
    message: string,
    options: {
      provider?: string;
      cause?: Error;
    }
  ) {
    super(message, {
      code: 'TIMEOUT',
      retryable: true,
      ...options,
    });
    this.name = 'TimeoutError';
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AIProviderError {
  public readonly field?: string;

  constructor(
    message: string,
    options: {
      field?: string;
      provider?: string;
      cause?: Error;
    }
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      retryable: false,
      ...options,
    });
    this.name = 'ValidationError';
    this.field = options.field;
  }
}

/**
 * 内容过滤错误（例如Gemini的安全过滤）
 */
export class ContentFilterError extends AIProviderError {
  public readonly reason?: string;

  constructor(
    message: string,
    options: {
      reason?: string;
      provider?: string;
      cause?: Error;
    }
  ) {
    super(message, {
      code: 'CONTENT_FILTERED',
      retryable: false,
      ...options,
    });
    this.name = 'ContentFilterError';
    this.reason = options.reason;
  }
}

/**
 * 配额不足错误
 */
export class QuotaExceededError extends AIProviderError {
  constructor(
    message: string,
    options: {
      provider?: string;
      cause?: Error;
    }
  ) {
    super(message, {
      code: 'QUOTA_EXCEEDED',
      statusCode: 429,
      retryable: false,
      ...options,
    });
    this.name = 'QuotaExceededError';
  }
}

/**
 * 网络错误
 */
export class NetworkError extends AIProviderError {
  constructor(
    message: string,
    options: {
      provider?: string;
      cause?: Error;
    }
  ) {
    super(message, {
      code: 'NETWORK_ERROR',
      retryable: true,
      ...options,
    });
    this.name = 'NetworkError';
  }
}

/**
 * 解析响应错误
 */
export class ParseError extends AIProviderError {
  constructor(
    message: string,
    options: {
      provider?: string;
      cause?: Error;
    }
  ) {
    super(message, {
      code: 'PARSE_ERROR',
      retryable: false,
      ...options,
    });
    this.name = 'ParseError';
  }
}

/**
 * 错误工厂 - 根据不同SDK的错误类型创建统一的错误对象
 */
export class ErrorFactory {
  /**
   * 从OpenAI SDK错误创建
   */
  static fromOpenAIError(error: any, provider: string): AIProviderError {
    const status = error.status || error.statusCode;
    const message = error.message || '未知错误';

    // 速率限制
    if (status === 429) {
      const retryAfter = error.headers?.['retry-after'];
      return new RateLimitError(message, {
        provider,
        retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
        cause: error,
      });
    }

    // 认证错误
    if (status === 401 || status === 403) {
      return new AuthenticationError(message, { provider, cause: error });
    }

    // 验证错误
    if (status === 400) {
      return new ValidationError(message, { provider, cause: error });
    }

    // 超时
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return new TimeoutError(message, { provider, cause: error });
    }

    // 网络错误
    if (
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET'
    ) {
      return new NetworkError(message, { provider, cause: error });
    }

    // 通用API错误
    if (status) {
      return new APIError(message, {
        statusCode: status,
        provider,
        retryable: status >= 500,
        cause: error,
      });
    }

    // 其他错误
    return new AIProviderError(message, {
      code: 'UNKNOWN_ERROR',
      provider,
      cause: error,
    });
  }

  /**
   * 从Gemini SDK错误创建
   */
  static fromGeminiError(error: any, provider: string): AIProviderError {
    const message = error.message || '未知错误';

    // 安全过滤
    if (message.includes('SAFETY') || message.includes('blocked')) {
      return new ContentFilterError(message, {
        reason: 'safety_filter',
        provider,
        cause: error,
      });
    }

    // 速率限制
    if (message.includes('RATE_LIMIT') || message.includes('429')) {
      return new RateLimitError(message, { provider, cause: error });
    }

    // API密钥错误
    if (message.includes('API_KEY') || message.includes('API key')) {
      return new AuthenticationError(message, { provider, cause: error });
    }

    // 配额
    if (message.includes('QUOTA') || message.includes('quota')) {
      return new QuotaExceededError(message, { provider, cause: error });
    }

    // 通用错误
    return new AIProviderError(message, {
      code: 'GEMINI_ERROR',
      provider,
      cause: error,
    });
  }

  /**
   * 从Anthropic SDK错误创建
   */
  static fromAnthropicError(error: any, provider: string): AIProviderError {
    const status = error.status || error.statusCode;
    const message = error.message || '未知错误';

    // 速率限制
    if (status === 429) {
      return new RateLimitError(message, { provider, cause: error });
    }

    // 认证错误
    if (status === 401 || status === 403) {
      return new AuthenticationError(message, { provider, cause: error });
    }

    // 验证错误
    if (status === 400) {
      return new ValidationError(message, { provider, cause: error });
    }

    // 内容过滤
    if (error.type === 'invalid_request_error' && message.includes('content')) {
      return new ContentFilterError(message, { provider, cause: error });
    }

    // 通用API错误
    if (status) {
      return new APIError(message, {
        statusCode: status,
        provider,
        retryable: status >= 500,
        cause: error,
      });
    }

    return new AIProviderError(message, {
      code: 'ANTHROPIC_ERROR',
      provider,
      cause: error,
    });
  }

  /**
   * 通用错误转换
   */
  static fromError(error: any, provider: string): AIProviderError {
    // 如果已经是AIProviderError，直接返回
    if (error instanceof AIProviderError) {
      return error;
    }

    // 尝试根据错误特征判断
    const message = error.message || String(error);

    // 网络相关
    if (
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNRESET'
    ) {
      return new NetworkError(message, { provider, cause: error });
    }

    // 超时
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return new TimeoutError(message, { provider, cause: error });
    }

    // 默认返回通用错误
    return new AIProviderError(message, {
      code: 'UNKNOWN_ERROR',
      provider,
      cause: error,
    });
  }
}
