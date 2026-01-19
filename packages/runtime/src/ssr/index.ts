/**
 * SSR (Server-Side Rendering) Support
 * 支持服务端渲染和同构应用
 */

import type { I18nOptions, TranslationResource } from '../types/index.js';
import { I18nEngine } from '../core/i18n-engine.js';

export interface SSRContext {
  language: string;
  resources: Record<string, TranslationResource>;
  supportedLanguages: string[];
  timestamp: number;
}

export interface SSROptions extends I18nOptions {
  hydrate?: boolean;
  ssrContext?: SSRContext;
}

/**
 * 序列化 SSR 上下文
 * 用于服务端渲染时将状态传递给客户端
 */
export function serializeSSRContext(engine: I18nEngine): SSRContext {
  const currentLanguage = engine.getCurrentLanguage();
  const supportedLanguages = engine.getSupportedLanguages();

  // 收集当前语言的资源
  const resources: Record<string, TranslationResource> = {};
  
  // 注意：这里简化处理，实际应该从 ResourceLoader 获取已加载的资源
  // 为了避免循环依赖，我们通过公开方法获取
  resources[currentLanguage] = {};

  return {
    language: currentLanguage,
    resources,
    supportedLanguages,
    timestamp: Date.now(),
  };
}

/**
 * 反序列化 SSR 上下文
 * 用于客户端 hydrate 时恢复服务端状态
 */
export function deserializeSSRContext(context: SSRContext): Partial<I18nOptions> {
  return {
    defaultLanguage: context.language,
    supportedLanguages: context.supportedLanguages as any,
    resources: context.resources,
  };
}

/**
 * 创建支持 SSR 的 I18n 实例
 * 
 * @example
 * // 服务端
 * const i18n = await createI18nWithSSR({
 *   defaultLanguage: 'zh-CN',
 *   supportedLanguages: ['zh-CN', 'en-US'],
 *   resources: { ... }
 * });
 * 
 * // 渲染完成后序列化上下文
 * const ssrContext = serializeSSRContext(i18n);
 * 
 * // 客户端 hydrate
 * const i18n = await createI18nWithSSR({
 *   ...deserializeSSRContext(ssrContext),
 *   hydrate: true
 * });
 */
export async function createI18nWithSSR(
  options: SSROptions
): Promise<I18nEngine> {
  // 如果是 hydrate 模式，使用 SSR 上下文
  let finalOptions: I18nOptions;

  if (options.hydrate && options.ssrContext) {
    finalOptions = {
      ...options,
      ...deserializeSSRContext(options.ssrContext),
    };
  } else {
    finalOptions = options;
  }

  // 创建引擎
  const engine = new I18nEngine(finalOptions);

  // 初始化
  await engine.init();

  return engine;
}

/**
 * 提取 SSR 脚本标签
 * 用于在 HTML 中嵌入 SSR 上下文
 */
export function renderSSRScript(context: SSRContext, varName = '__I18N_SSR__'): string {
  const json = JSON.stringify(context);
  return `<script>window.${varName}=${json}</script>`;
}

/**
 * 从 window 对象读取 SSR 上下文
 */
export function loadSSRContextFromWindow(varName = '__I18N_SSR__'): SSRContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const context = (window as any)[varName];
  
  if (!context || typeof context !== 'object') {
    return null;
  }

  return context as SSRContext;
}

/**
 * 创建同构 I18n 实例
 * 自动判断服务端或客户端环境
 * 
 * @example
 * // 通用代码（同时运行在服务端和客户端）
 * const i18n = await createIsomorphicI18n({
 *   defaultLanguage: 'zh-CN',
 *   supportedLanguages: ['zh-CN', 'en-US'],
 *   resources: { ... }
 * });
 */
export async function createIsomorphicI18n(
  options: SSROptions
): Promise<I18nEngine> {
  // 检测是否在浏览器环境
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    // 客户端：尝试从 window 加载 SSR 上下文
    const ssrContext = loadSSRContextFromWindow();

    if (ssrContext) {
      return createI18nWithSSR({
        ...options,
        hydrate: true,
        ssrContext,
      });
    }
  }

  // 服务端或无 SSR 上下文的客户端
  return createI18nWithSSR(options);
}

// 导出类型
export type { SSRContext, SSROptions };
