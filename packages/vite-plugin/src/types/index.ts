import type { FilterPattern } from 'vite';

/**
 * Vite 插件选项配置
 */
export interface I18nPluginOptions {
  /**
   * i18n 配置文件路径
   * @default 'i18n.config.ts'
   */
  configFile?: string;

  /**
   * 需要处理的文件模式
   * @default ['**\/*.{vue,tsx,ts,jsx,js}']
   */
  include?: FilterPattern;

  /**
   * 排除的文件模式
   * @default ['node_modules/**', 'dist/**']
   */
  exclude?: FilterPattern;

  /**
   * 默认语言
   * @default 'zh-CN'
   */
  defaultLanguage?: string;

  /**
   * 支持的语言列表
   */
  supportedLanguages?: string[];

  /**
   * 语言文件路径模板
   * @default './locales/{{lng}}.json'
   */
  loadPath?: string;

  /**
   * 是否启用热更新
   * @default true
   */
  hmr?: boolean;

  /**
   * 是否启用懒加载
   * @default true
   */
  lazyLoading?: boolean;

  /**
   * 是否在构建时转换 $tsl 为 t(hash)
   * @default true
   */
  transformTsl?: boolean;

  /**
   * 是否启用调试模式
   * @default false
   */
  debug?: boolean;

  /**
   * 自定义转换规则
   */
  transformRules?: TransformRule[];

  /**
   * 预加载策略
   */
  preload?: PreloadStrategy;
}

/**
 * 转换规则
 */
export interface TransformRule {
  /**
   * 匹配模式
   */
  pattern: RegExp;

  /**
   * 转换函数
   */
  transform: (match: string, ...args: any[]) => string;

  /**
   * 是否仅在生产环境应用
   */
  productionOnly?: boolean;
}

/**
 * 预加载策略
 */
export interface PreloadStrategy {
  /**
   * 预加载的语言
   */
  languages?: string[];

  /**
   * 预加载时机
   */
  timing?: 'immediate' | 'idle' | 'interaction';

  /**
   * 预加载的命名空间
   */
  namespaces?: string[];
}

/**
 * 转换上下文
 */
export interface TransformContext {
  /**
   * 文件路径
   */
  filename: string;

  /**
   * 是否为开发模式
   */
  isDev: boolean;

  /**
   * 是否为 SSR
   */
  isSSR: boolean;

  /**
   * 插件选项
   */
  options: I18nPluginOptions;
}

/**
 * 语言资源信息
 */
export interface LanguageResource {
  /**
   * 语言代码
   */
  language: string;

  /**
   * 命名空间
   */
  namespace: string;

  /**
   * 资源路径
   */
  path: string;

  /**
   * 资源内容
   */
  content: Record<string, any>;

  /**
   * 最后修改时间
   */
  mtime: number;
}

/**
 * HMR 更新信息
 */
export interface HMRUpdateInfo {
  /**
   * 更新类型
   */
  type: 'language-changed' | 'resource-updated' | 'config-changed';

  /**
   * 受影响的语言
   */
  languages?: string[];

  /**
   * 受影响的命名空间
   */
  namespaces?: string[];

  /**
   * 更新的文件路径
   */
  files?: string[];

  /**
   * 更新时间戳
   */
  timestamp: number;
}

/**
 * 代码转换结果
 */
export interface TransformResult {
  /**
   * 转换后的代码
   */
  code: string;

  /**
   * Source Map
   */
  map?: string;

  /**
   * 是否有变更
   */
  hasChanged: boolean;

  /**
   * 提取的翻译键
   */
  extractedKeys?: string[];

  /**
   * 转换统计
   */
  stats?: {
    tslCount: number;
    transformedCount: number;
    skippedCount: number;
  };
}
