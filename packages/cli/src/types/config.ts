/**
 * TransLink I18n 配置文件类型定义
 */

export interface I18nConfig {
  // 扫描配置
  extract: {
    patterns: string[];
    exclude: string[];
    functions: string[];
    extensions: string[];
  };
  
  // 哈希配置
  hash: {
    algorithm: 'md5' | 'sha1' | 'sha256';
    length: number;
    includeContext: boolean;
    contextFields: ('filePath' | 'componentName' | 'functionName')[];
  };
  
  // 语言配置
  languages: {
    default: string;
    supported: string[];
    fallback: string;
  };
  
  // 输出配置
  output: {
    directory: string;
    format: 'json' | 'yaml' | 'js' | 'ts';
    splitByNamespace: boolean;
    flattenKeys: boolean;
  };
  
  // 云端配置
  vika: {
    apiKey: string;
    datasheetId: string;
    autoSync: boolean;
    syncInterval: number;
  };
  
  // 插件配置
  plugins: Array<string | [string, any]>;
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
