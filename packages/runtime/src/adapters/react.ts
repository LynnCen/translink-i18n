/**
 * React 适配器
 * 提供 Hooks 和 Context 支持
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
  ComponentType,
} from 'react';
import { I18nEngine } from '../core/i18n-engine.js';
import type { I18nOptions, TranslationParams } from '../types/index.js';

export interface ReactI18nOptions extends I18nOptions {
  suspense?: boolean;
  errorBoundary?: boolean;
}

export interface I18nContextValue {
  engine: I18nEngine;
  t: (
    key: string,
    params?: TranslationParams,
    options?: {
      lng?: string;
      defaultValue?: string;
    }
  ) => string;
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  availableLocales: string[];
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface UseTranslationReturn {
  t: (
    key: string,
    params?: TranslationParams,
    options?: {
      lng?: string;
      defaultValue?: string;
    }
  ) => string;
  i18n: I18nContextValue;
  ready: boolean;
}

export interface TranslationProps {
  i18nKey: string;
  values?: TranslationParams;
  components?: Record<string, ComponentType<any>>;
  defaults?: string;
  ns?: string;
  lng?: string;
  children?: ReactNode;
}

// 创建 Context
const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * I18n Provider 组件
 */
export interface I18nProviderProps {
  i18n: I18nEngine;
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>;
}

export function I18nProvider({
  i18n,
  children,
  fallback = null,
  errorFallback: ErrorFallback,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState(i18n.getCurrentLanguage());
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 翻译函数
  const t = useCallback(
    (
      key: string,
      params?: TranslationParams,
      options?: { lng?: string; defaultValue?: string }
    ) => {
      return i18n.t(key, params, options);
    },
    [i18n]
  );

  // 语言切换函数
  const setLocale = useCallback(
    async (newLocale: string) => {
      if (newLocale === locale) return;

      setIsLoading(true);
      setError(null);

      try {
        await i18n.changeLanguage(newLocale);
        setLocaleState(newLocale);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [i18n, locale]
  );

  // 监听引擎事件
  useEffect(() => {
    const handleReady = () => setIsReady(true);
    const handleLanguageChanged = (language: string) =>
      setLocaleState(language);
    const handleError = (error: Error) => setError(error);

    i18n.on('ready', handleReady);
    i18n.on('languageChanged', handleLanguageChanged);
    i18n.on('resourceLoadFailed', handleError);

    // 初始化引擎
    i18n.init().catch(setError);

    return () => {
      i18n.off('ready', handleReady);
      i18n.off('languageChanged', handleLanguageChanged);
      i18n.off('resourceLoadFailed', handleError);
    };
  }, [i18n]);

  // Context 值
  const contextValue: I18nContextValue = useMemo(
    () => ({
      engine: i18n,
      t,
      locale,
      setLocale,
      availableLocales: i18n.getSupportedLanguages(),
      isReady,
      isLoading,
      error,
    }),
    [i18n, t, locale, setLocale, isReady, isLoading, error]
  );

  // 错误处理
  if (error && ErrorFallback) {
    return React.createElement(ErrorFallback, {
      error,
      retry: () => {
        setError(null);
        i18n.init().catch(setError);
      },
    });
  }

  // 加载状态
  if (!isReady && fallback) {
    return React.createElement(React.Fragment, {}, fallback);
  }

  return React.createElement(
    I18nContext.Provider,
    { value: contextValue },
    children
  );
}

/**
 * useTranslation Hook
 */
export function useTranslation(ns?: string): UseTranslationReturn {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error(
      'useTranslation must be used within I18nProvider. ' +
        'Make sure to wrap your app with <I18nProvider>.'
    );
  }

  const { engine } = context;

  // 带命名空间的翻译函数
  const t = useCallback(
    (
      key: string,
      params?: TranslationParams,
      options?: { lng?: string; defaultValue?: string }
    ) => {
      const fullKey = ns ? `${ns}:${key}` : key;
      return engine.t(fullKey, params, options);
    },
    [engine, ns]
  );

  return {
    t,
    i18n: context,
    ready: context.isReady,
  };
}

/**
 * useI18n Hook（访问完整的 i18n 实例）
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error(
      'useI18n must be used within I18nProvider. ' +
        'Make sure to wrap your app with <I18nProvider>.'
    );
  }

  return context;
}

/**
 * Translation 组件
 */
export function Translation({
  i18nKey,
  values = {},
  components = {},
  defaults,
  ns,
  lng,
  children,
}: TranslationProps) {
  const { t } = useTranslation(ns);

  const translation = useMemo(() => {
    return t(i18nKey, values, { lng, defaultValue: defaults });
  }, [t, i18nKey, values, lng, defaults]);

  // 如果有组件替换，处理富文本
  if (Object.keys(components).length > 0) {
    return React.createElement(InterpolatedComponent, {
      translation,
      components,
      children,
    });
  }

  // 如果有子组件，作为 render prop
  if (children && typeof children === 'function') {
    return (children as any)(translation);
  }

  return React.createElement(React.Fragment, {}, translation);
}

/**
 * 支持组件插值的内部组件
 */
function InterpolatedComponent({
  translation,
  components,
  _children,
}: {
  translation: string;
  components: Record<string, ComponentType<any>>;
  _children?: ReactNode;
}) {
  // 解析包含组件标签的翻译文本
  const parsed = useMemo(() => {
    return parseTranslationWithComponents(translation, components);
  }, [translation, components]);

  return React.createElement(React.Fragment, {}, parsed);
}

/**
 * 解析包含组件的翻译文本
 */
function parseTranslationWithComponents(
  translation: string,
  components: Record<string, ComponentType<any>>
): ReactNode[] {
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let keyCounter = 0;

  // 简单的组件标签解析 <0>text</0> 或 <Link>text</Link>
  const componentRegex = /<(\w+|[0-9]+)>(.*?)<\/\1>/g;
  let match;

  while ((match = componentRegex.exec(translation)) !== null) {
    const [fullMatch, componentKey, innerText] = match;
    const matchStart = match.index;

    // 添加前面的文本
    if (matchStart > lastIndex) {
      const beforeText = translation.slice(lastIndex, matchStart);
      if (beforeText) {
        result.push(beforeText);
      }
    }

    // 添加组件
    const Component = components[componentKey];
    if (Component) {
      result.push(
        React.createElement(
          Component,
          { key: `component-${keyCounter++}` },
          innerText
        )
      );
    } else {
      // 如果组件不存在，保留原文
      result.push(fullMatch);
    }

    lastIndex = matchStart + fullMatch.length;
  }

  // 添加剩余的文本
  if (lastIndex < translation.length) {
    const remainingText = translation.slice(lastIndex);
    if (remainingText) {
      result.push(remainingText);
    }
  }

  return result.length > 0 ? result : [translation];
}

/**
 * withTranslation HOC
 */
export function withTranslation<P extends object>(
  Component: ComponentType<
    P & { t: UseTranslationReturn['t']; i18n: I18nContextValue }
  >,
  options?: { withRef?: boolean }
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const { t, i18n } = useTranslation();

    const enhancedProps = {
      ...props,
      t,
      i18n,
    } as P & { t: UseTranslationReturn['t']; i18n: I18nContextValue };

    if (options?.withRef) {
      return React.createElement(Component, { ...enhancedProps, ref });
    }

    return React.createElement(Component, enhancedProps);
  });

  WrappedComponent.displayName = `withTranslation(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * 创建带初始化的 I18n 实例
 */
export async function createI18nWithInit(options: ReactI18nOptions): Promise<{
  i18n: I18nEngine;
  Provider: ComponentType<{ children: ReactNode }>;
}> {
  const engine = new I18nEngine(options);

  // 初始化引擎
  await engine.init();

  const Provider = ({ children }: { children: ReactNode }) => {
    return React.createElement(I18nProvider, { i18n: engine }, children);
  };

  return { i18n: engine, Provider };
}

// 导出类型
export type {
  ReactI18nOptions,
  I18nContextValue,
  UseTranslationReturn,
  TranslationProps,
};
