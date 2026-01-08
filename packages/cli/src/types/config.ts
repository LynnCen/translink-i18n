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
