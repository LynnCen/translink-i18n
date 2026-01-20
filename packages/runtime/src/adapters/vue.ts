/**
 * Vue 3 适配器
 * 提供 Composition API 和全局属性支持
 */

import {
  App,
  computed,
  ref,
  inject,
  watch,
  onUnmounted,
  ComputedRef,
  Ref,
  h,
} from 'vue';
import { I18nEngine } from '../core/i18n-engine.js';
import type { I18nOptions, TranslationParams } from '../types/index.js';

const I18N_SYMBOL = Symbol('i18n');

export interface VueI18nOptions extends I18nOptions {
  globalInjection?: boolean;
  globalProperties?: boolean;
  compositionOnly?: boolean;
}

export interface VueI18nInstance {
  global: {
    t: (key: string, params?: TranslationParams) => string;
    locale: ComputedRef<string>;
    availableLocales: ComputedRef<string[]>;
    engine: I18nEngine;
  };
  install: (app: App) => void;
}

export interface UseI18nReturn {
  t: (
    key: string,
    params?: TranslationParams,
    options?: {
      lng?: string;
      defaultValue?: string;
    }
  ) => string;
  locale: ComputedRef<string>;
  setLocale: (locale: string) => Promise<void>;
  availableLocales: ComputedRef<string[]>;
  isReady: Ref<boolean>;
  isLoading: Ref<boolean>;
}

/**
 * 创建 Vue I18n 实例
 */
export function createI18n(options: VueI18nOptions): VueI18nInstance {
  const engine = new I18nEngine(options);
  const currentLanguage = ref(engine.getCurrentLanguage());
  const isReady = ref(false);
  const isLoading = ref(false);

  // 监听引擎事件
  engine.on('languageChanged', (language: string) => {
    currentLanguage.value = language;
  });

  engine.on('ready', () => {
    isReady.value = true;
  });

  // 全局翻译函数
  const globalT = (key: string, params?: TranslationParams) => {
    return engine.t(key, params);
  };

  // 响应式语言切换
  const locale = computed({
    get: () => currentLanguage.value,
    set: async (lang: string) => {
      if (lang !== currentLanguage.value) {
        isLoading.value = true;
        try {
          await engine.changeLanguage(lang);
        } finally {
          isLoading.value = false;
        }
      }
    },
  });

  // 可用语言列表
  const availableLocales = computed(() => engine.getSupportedLanguages());

  const i18n: VueI18nInstance = {
    global: {
      t: globalT,
      locale,
      availableLocales,
      engine,
    },

    install(app: App) {
      // 提供全局实例
      app.provide(I18N_SYMBOL, i18n);

      // 全局属性注入
      if (
        options.globalInjection !== false &&
        options.globalProperties !== false
      ) {
        app.config.globalProperties.$t = globalT;
        app.config.globalProperties.$i18n = i18n.global;
        app.config.globalProperties.$locale = locale;
      }

      // 自动初始化
      engine.init().catch(error => {
        console.error('Failed to initialize i18n:', error);
      });

      // 应用卸载时清理
      const originalUnmount = app.unmount;
      app.unmount = function () {
        engine.destroy();
        return originalUnmount.call(this);
      };
    },
  };

  return i18n;
}

/**
 * Composition API Hook
 */
export function useI18n(_options?: {
  useScope?: 'global' | 'local';
  inheritLocale?: boolean;
}): UseI18nReturn {
  const i18n = inject<VueI18nInstance>(I18N_SYMBOL);

  if (!i18n) {
    throw new Error(
      'useI18n must be used within i18n context. ' +
        'Make sure to install the i18n plugin: app.use(i18n)'
    );
  }

  const { engine } = i18n.global;
  const isReady = ref(false);
  const isLoading = ref(false);

  // 监听引擎状态 - on 方法现在返回清理函数
  const unsubscribeReady = engine.on('ready', () => {
    isReady.value = true;
  });

  // 本地翻译函数
  const t = (
    key: string,
    params?: TranslationParams,
    localOptions?: { lng?: string; defaultValue?: string }
  ) => {
    return engine.t(key, params, {
      lng: localOptions?.lng,
      defaultValue: localOptions?.defaultValue,
    });
  };

  // 本地语言切换函数
  const setLocale = async (locale: string) => {
    isLoading.value = true;
    try {
      await engine.changeLanguage(locale);
    } finally {
      isLoading.value = false;
    }
  };

  // 组件卸载时清理 - 直接调用清理函数
  onUnmounted(() => {
    if (unsubscribeReady) {
      unsubscribeReady();
    }
  });

  return {
    t,
    locale: i18n.global.locale,
    setLocale,
    availableLocales: i18n.global.availableLocales,
    isReady,
    isLoading,
  };
}

/**
 * 翻译指令
 */
export const vT = {
  mounted(el: HTMLElement, binding: any) {
    const { value, modifiers } = binding;
    const i18n = inject<VueI18nInstance>(I18N_SYMBOL);

    if (!i18n) {
      console.warn('v-t directive requires i18n context');
      return;
    }

    let translationKey: string;
    let params: TranslationParams | undefined;

    if (typeof value === 'string') {
      translationKey = value;
    } else if (typeof value === 'object') {
      translationKey = value.key || '';
      params = value.params;
    } else {
      console.warn('v-t directive value must be a string or object');
      return;
    }

    const translation = i18n.global.t(translationKey, params);

    if (modifiers.html) {
      el.innerHTML = translation;
    } else {
      el.textContent = translation;
    }

    // 监听语言变化
    const unwatch = watch(i18n.global.locale, () => {
      const newTranslation = i18n.global.t(translationKey, params);
      if (modifiers.html) {
        el.innerHTML = newTranslation;
      } else {
        el.textContent = newTranslation;
      }
    });

    // 存储清理函数
    (el as any).__i18n_unwatch = unwatch;
  },

  unmounted(el: HTMLElement) {
    const unwatch = (el as any).__i18n_unwatch;
    if (unwatch) {
      unwatch();
      delete (el as any).__i18n_unwatch;
    }
  },
};

/**
 * 翻译组件
 */
export const Translation = {
  name: 'Translation',
  props: {
    keypath: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: 'span',
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    plural: {
      type: Number,
    },
    locale: {
      type: String,
    },
  },
  setup(props: any, { slots }: any) {
    const i18n = inject<VueI18nInstance>(I18N_SYMBOL);

    if (!i18n) {
      throw new Error('Translation component requires i18n context');
    }

    const translation = computed(() => {
      const options: any = {};
      if (props.locale) {
        options.lng = props.locale;
      }

      let params = props.params || {};
      if (props.plural !== undefined) {
        params = { ...params, count: props.plural };
      }

      return i18n.global.t(props.keypath, params);
    });

    return () => {
      const children = slots.default
        ? slots.default({ translation: translation.value })
        : translation.value;

      if (props.tag === 'template') {
        return children;
      }

      return h(props.tag, {}, children);
    };
  },
};

/**
 * withTranslation HOC (Vue 版本)
 */
export function withTranslation<T extends Record<string, any>>(
  component: T,
  options?: { name?: string }
): T {
  // Vue 3 中更推荐使用 Composition API
  // 这里提供一个简单的 HOC 实现
  const wrappedComponent = {
    ...component,
    setup(props: any, ctx: any) {
      const { t, locale, setLocale, availableLocales, isReady, isLoading } =
        useI18n();

      // 如果原组件有 setup 函数，调用它
      if (component.setup) {
        const result = component.setup(props, ctx);

        // 如果返回函数（render function），包装它
        if (typeof result === 'function') {
          return (renderProps: any) =>
            result({
              ...renderProps,
              $t: t,
              $locale: locale,
              $setLocale: setLocale,
              $availableLocales: availableLocales,
              $i18nReady: isReady,
              $i18nLoading: isLoading,
            });
        }

        // 如果返回对象，扩展它
        if (result && typeof result === 'object') {
          return {
            ...result,
            $t: t,
            $locale: locale,
            $setLocale: setLocale,
            $availableLocales: availableLocales,
            $i18nReady: isReady,
            $i18nLoading: isLoading,
          };
        }

        return result;
      }

      // 如果没有 setup 函数，提供默认的
      return {
        $t: t,
        $locale: locale,
        $setLocale: setLocale,
        $availableLocales: availableLocales,
        $i18nReady: isReady,
        $i18nLoading: isLoading,
      };
    },
  };

  // 最佳实践：使用 Object.defineProperty 设置 name
  if (options?.name) {
    Object.defineProperty(wrappedComponent, 'name', {
      value: options.name,
      writable: false,
      configurable: true,
    });
  }

  return wrappedComponent as T;
}
