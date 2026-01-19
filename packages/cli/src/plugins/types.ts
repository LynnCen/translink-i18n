/**
 * TransLink I18n 插件系统类型定义
 */

import type { TranslationItem } from '../types/config.js';

/**
 * 插件元数据
 */
export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
}

import type { I18nConfig } from '../types/config.js';
import type { Logger } from '../utils/logger.js';

/**
 * 插件配置
 */
export interface PluginConfig {
  [key: string]: unknown;
}

/**
 * 插件上下文
 */
export interface PluginContext {
  config: I18nConfig;
  logger: Logger;
  cwd: string;
}

/**
 * 插件命令选项
 */
export interface PluginCommandOptions {
  [key: string]: unknown;
}

/**
 * 推送翻译数据
 */
export interface PushTranslationsData {
  translations: TranslationItem[];
  language?: string;
  options?: PluginCommandOptions;
}

/**
 * 推送结果
 */
export interface PushResult {
  success: boolean;
  created?: number;
  updated?: number;
  errors?: number;
  message?: string;
}

/**
 * 拉取翻译数据
 */
export interface PullTranslationsData {
  language: string;
  options?: PluginCommandOptions;
}

/**
 * 拉取结果
 */
export interface PullResult {
  success: boolean;
  translations?: Record<string, string>;
  message?: string;
}

/**
 * 翻译统计信息
 */
export interface TranslationStats {
  total: number;
  pending: number;
  translated: number;
  reviewed: number;
  languages: Record<string, number>;
}

/**
 * 插件接口
 */
export interface I18nPlugin {
  /**
   * 插件元数据
   */
  metadata: PluginMetadata;

  /**
   * 初始化插件
   */
  init?(context: PluginContext, config: PluginConfig): Promise<void> | void;

  /**
   * 推送翻译到云端
   */
  push?(data: PushTranslationsData): Promise<PushResult>;

  /**
   * 从云端拉取翻译
   */
  pull?(data: PullTranslationsData): Promise<PullResult>;

  /**
   * 获取翻译统计信息
   */
  getStats?(): Promise<TranslationStats>;

  /**
   * 测试连接
   */
  testConnection?(): Promise<boolean>;

  /**
   * 注册 CLI 命令（可选）
   * 插件可以注册自己的命令到 CLI
   */
  registerCommands?(program: import('commander').Command): void;

  /**
   * 清理资源
   */
  cleanup?(): Promise<void> | void;
}

/**
 * 插件加载器选项
 */
export interface PluginLoaderOptions {
  cwd?: string;
  config?: I18nConfig;
  logger?: Logger;
}
