/**
 * TransLink I18n 配置文件类型定义
 */

export interface I18nConfig {
  // 项目信息
  project?: {
    name: string;
    version: string;
  };

  // 扫描配置
  extract: {
    patterns: string[];
    exclude: string[];
    functions: string[];
    extensions: string[];
    incremental?: boolean;
    createEmptyTranslations?: boolean;
  };

  // 哈希配置
  hash: {
    enabled: boolean;
    algorithm: 'md5' | 'sha1' | 'sha256';
    length: number;
    numericOnly?: boolean; // 🆕 只保留数字
    includeContext: boolean;
    contextFields?: ('filePath' | 'componentName' | 'functionName')[];
  };

  // 语言配置
  languages: {
    source: string; // 🆕 源语言（代码中使用的语言）
    default: string;
    supported: string[];
    fallback: string;
  };

  // 输出配置
  output: {
    directory: string;
    format: 'json' | 'yaml' | 'js' | 'ts';
    indent?: number;
    sortKeys?: boolean;
    splitByNamespace?: boolean;
    flattenKeys?: boolean;
  };

  // 导入导出配置
  importExport?: {
    format: 'excel' | 'csv' | 'json';
    directory?: string; // 🆕 导入导出文件存放目录
    outputFile?: string; // 🆕 默认输出文件名
    excel?: {
      sheetName?: string;
      includeMetadata?: boolean;
      freezeHeader?: boolean;
      autoWidth?: boolean;
    };
    csv?: {
      delimiter?: string;
      encoding?: string;
      includeHeaders?: boolean;
    };
  };

  // 构建配置
  build?: {
    minify?: boolean;
    sourcemap?: boolean;
    outputDir?: string;
  };

  // CLI 输出配置
  cli?: {
    verbose?: boolean;
    table?: {
      enabled?: boolean;
      maxRows?: number;
      showDiff?: boolean;
    };
  };

  // 插件配置
  plugins?: Array<string | [string, any]>;

  // AI 翻译配置
  aiTranslation?: AITranslationConfig;
}

export interface AITranslationConfig {
  // 默认提供商
  defaultProvider?: string;

  // 提供商配置
  providers: {
    [key: string]: AIProviderConfig;
  };

  // 翻译选项
  options: {
    cache?: boolean;
    cacheTTL?: number; // 缓存过期时间（秒）
    cacheMaxSize?: number; // 缓存最大条目数
    batchSize?: number; // 批次大小
    concurrency?: number; // 并发数
    maxRetries?: number; // 最大重试次数
    retryDelay?: number; // 重试延迟（毫秒）
    skipTranslated?: boolean; // 跳过已翻译项
    contextPrompt?: string; // 自定义上下文提示
    glossary?: Record<string, string>; // 术语表
  };

  // 质量配置
  quality?: {
    detectUntranslated?: boolean; // 检测未翻译（原文==译文）
    minLengthRatio?: number; // 最小长度比例
    maxLengthRatio?: number; // 最大长度比例
    validateFormat?: boolean; // 验证格式（保留换行、占位符等）
  };
}

export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  contextPrompt?: string;
  [key: string]: any;
}

export interface ExtractResult {
  key: string;
  text: string;
  filePath: string;
  line: number;
  column: number;
  context: {
    componentName?: string;
    functionName?: string;
    namespace?: string;
  };
}

export interface TranslationItem {
  key: string;
  text: string;
  context?: string;
  filePath?: string;
  status?: 'pending' | 'translated' | 'reviewed';
}
