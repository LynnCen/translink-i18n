# 教程 3：Runtime 运行时实现

## 📚 本章目标

学习如何实现一个高性能的国际化运行时引擎,包括翻译函数、缓存管理、事件系统和框架适配器。

**学完本章,你将掌握**:
- 翻译引擎核心实现
- 缓存管理策略
- 事件系统设计
- Vue/React 框架适配器

**预计时间**: 2-3 小时

---

## 1. Runtime 架构设计

### 整体架构

```
@translink/i18n-runtime/
├── src/
│   ├── index.ts              # 入口文件
│   ├── core/                 # 核心模块
│   │   ├── i18n-engine.ts    # 翻译引擎
│   │   ├── resource-loader.ts # 资源加载
│   │   └── interpolator.ts   # 插值处理
│   ├── cache/                # 缓存模块
│   │   └── cache-manager.ts  # 缓存管理
│   ├── adapters/             # 框架适配器
│   │   ├── vue.ts            # Vue 适配器
│   │   └── react.ts          # React 适配器
│   ├── utils/                # 工具函数
│   │   └── events.ts         # 事件系统
│   └── types/                # 类型定义
│       └── index.ts
└── package.json
```

### 核心类图

```
┌─────────────────┐
│  I18nEngine     │ ◄── 翻译引擎核心
├─────────────────┤
│ + translate()   │
│ + changeLanguage│
│ + addResources()│
└────────┬────────┘
         │
         ├── uses ──► ┌────────────────┐
         │            │ ResourceLoader  │
         │            └────────────────┘
         │
         ├── uses ──► ┌────────────────┐
         │            │ CacheManager    │
         │            └────────────────┘
         │
         └── uses ──► ┌────────────────┐
                      │ Interpolator    │
                      └────────────────┘
```

---

## 2. 翻译引擎核心

### I18nEngine 实现

**core/i18n-engine.ts**:
```typescript
export class I18nEngine {
  private currentLanguage: string;
  private fallbackLanguage: string;
  private supportedLanguages: string[];
  private resources: Map<string, Record<string, string>> = new Map();
  private cache: CacheManager;
  private eventBus: EventEmitter;
  
  constructor(options: I18nOptions) {
    this.currentLanguage = options.defaultLanguage;
    this.fallbackLanguage = options.fallbackLanguage || options.defaultLanguage;
    this.supportedLanguages = options.supportedLanguages;
    this.cache = new CacheManager(options.cacheConfig);
    this.eventBus = new EventEmitter();
    
    // 初始化资源
    if (options.resources) {
      Object.entries(options.resources).forEach(([lang, resources]) => {
        this.addResources(lang, resources);
      });
    }
  }
  
  /**
   * 翻译函数
   */
  translate(key: string, params?: Record<string, any>, lang?: string): string {
    const language = lang || this.currentLanguage;
    
    // 1. 尝试从缓存获取
    const cacheKey = `${language}:${key}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return this.interpolate(cached, params);
    }
    
    // 2. 从资源中查找
    const translation = this.getTranslation(key, language);
    
    // 3. 缓存结果
    if (translation) {
      this.cache.set(cacheKey, translation);
    }
    
    // 4. 插值处理
    return this.interpolate(translation || key, params);
  }
  
  /**
   * t() 别名
   */
  t(key: string, params?: Record<string, any>, lang?: string): string {
    return this.translate(key, params, lang);
  }
  
  /**
   * 获取翻译
   */
  private getTranslation(key: string, lang: string): string | undefined {
    // 1. 尝试当前语言
    const langResources = this.resources.get(lang);
    if (langResources?.[key]) {
      return langResources[key];
    }
    
    // 2. 尝试回退语言
    if (lang !== this.fallbackLanguage) {
      const fallbackResources = this.resources.get(this.fallbackLanguage);
      if (fallbackResources?.[key]) {
        return fallbackResources[key];
      }
    }
    
    // 3. 返回 undefined
    return undefined;
  }
  
  /**
   * 插值处理
   */
  private interpolate(text: string, params?: Record<string, any>): string {
    if (!params) {
      return text;
    }
    
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }
  
  /**
   * 切换语言
   */
  async changeLanguage(lang: string): Promise<void> {
    if (!this.supportedLanguages.includes(lang)) {
      throw new Error(`不支持的语言: ${lang}`);
    }
    
    const oldLang = this.currentLanguage;
    this.currentLanguage = lang;
    
    // 清除缓存
    this.cache.clear();
    
    // 触发事件
    this.eventBus.emit('languageChanged', {
      from: oldLang,
      to: lang,
    });
  }
  
  /**
   * 添加资源
   */
  addResources(lang: string, resources: Record<string, string>): void {
    const existing = this.resources.get(lang) || {};
    this.resources.set(lang, {
      ...existing,
      ...resources,
    });
    
    // 触发事件
    this.eventBus.emit('resourcesAdded', { lang, resources });
  }
  
  /**
   * 获取当前语言
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
  
  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }
  
  /**
   * 事件监听
   */
  on(event: string, handler: Function): void {
    this.eventBus.on(event, handler);
  }
  
  off(event: string, handler: Function): void {
    this.eventBus.off(event, handler);
  }
}
```

### 关键技术点

#### 1. 三层查找策略

```
1. 缓存查找 (最快)
   ↓ 未命中
2. 当前语言查找
   ↓ 未找到
3. 回退语言查找
   ↓ 未找到
4. 返回 key 本身
```

#### 2. 插值语法

```typescript
// 基础插值
translate('hello', { name: '张三' })
// "你好，{name}!" → "你好，张三!"

// 嵌套对象
translate('user', { user: { name: '张三', age: 25 } })
// "{user.name}今年{user.age}岁" → "张三今年25岁"
```

---

## 3. 缓存管理

### CacheManager 实现

**cache/cache-manager.ts**:
```typescript
export class CacheManager {
  private cache: Map<string, CacheItem>;
  private maxSize: number;
  private ttl: number;
  
  constructor(config?: CacheConfig) {
    this.cache = new Map();
    this.maxSize = config?.maxSize || 1000;
    this.ttl = config?.ttl || 3600000; // 1小时
  }
  
  /**
   * 获取缓存
   */
  get(key: string): string | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    // 更新访问计数
    item.hits++;
    item.lastAccess = Date.now();
    
    return item.value;
  }
  
  /**
   * 设置缓存
   */
  set(key: string, value: string): void {
    // 检查容量
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      lastAccess: Date.now(),
      hits: 0,
    });
  }
  
  /**
   * LRU 淘汰策略
   */
  private evict(): void {
    let lruKey: string | undefined;
    let lruTime = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccess < lruTime) {
        lruTime = item.lastAccess;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
  
  /**
   * 清除缓存
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }
  
  private calculateHitRate(): number {
    let totalHits = 0;
    let totalAccesses = 0;
    
    for (const item of this.cache.values()) {
      totalHits += item.hits;
      totalAccesses += item.hits + 1;
    }
    
    return totalAccesses > 0 ? totalHits / totalAccesses : 0;
  }
}
```

---

## 4. Vue 适配器

### createI18n 实现

**adapters/vue.ts**:
```typescript
import { reactive, computed, inject, provide, App } from 'vue';
import { I18nEngine } from '../core/i18n-engine.js';

const I18N_KEY = Symbol('i18n');

export function createI18n(options: I18nOptions) {
  const engine = new I18nEngine(options);
  
  // 响应式状态
  const state = reactive({
    locale: engine.getCurrentLanguage(),
    isReady: true,
  });
  
  // 翻译函数
  const t = (key: string, params?: Record<string, any>) => {
    return engine.translate(key, params);
  };
  
  // 切换语言
  const changeLanguage = async (lang: string) => {
    await engine.changeLanguage(lang);
    state.locale = lang;
  };
  
  // Vue 插件
  const install = (app: App) => {
    // 提供依赖
    app.provide(I18N_KEY, {
      t,
      locale: computed(() => state.locale),
      changeLanguage,
      isReady: computed(() => state.isReady),
    });
    
    // 全局属性
    app.config.globalProperties.$tsl = t;
    app.config.globalProperties.$i18n = {
      locale: state.locale,
      changeLanguage,
    };
  };
  
  return {
    install,
    global: {
      t,
      locale: computed(() => state.locale),
      changeLanguage,
    },
  };
}

/**
 * Composition API
 */
export function useI18n() {
  const i18n = inject(I18N_KEY);
  
  if (!i18n) {
    throw new Error('未找到 i18n 实例。请确保已调用 app.use(i18n)');
  }
  
  return i18n;
}
```

### 使用示例

```vue
<template>
  <div>
    <!-- Options API -->
    <h1>{{ $tsl('欢迎') }}</h1>
    
    <!-- Composition API -->
    <p>{{ t('描述') }}</p>
    
    <!-- 切换语言 -->
    <button @click="changeLanguage('en-US')">
      English
    </button>
  </div>
</template>

<script setup>
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale, changeLanguage } = useI18n();
</script>
```

---

## 5. React 适配器

### I18nProvider 实现

**adapters/react.ts**:
```typescript
import React, { createContext, useContext, useState, useMemo } from 'react';
import { I18nEngine } from '../core/i18n-engine.js';

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children, ...options }: I18nProviderProps) {
  const [engine] = useState(() => new I18nEngine(options));
  const [locale, setLocale] = useState(engine.getCurrentLanguage());
  const [isReady, setIsReady] = useState(true);
  
  const contextValue = useMemo(() => ({
    t: (key: string, params?: Record<string, any>) => {
      return engine.translate(key, params);
    },
    locale,
    changeLanguage: async (lang: string) => {
      await engine.changeLanguage(lang);
      setLocale(lang);
    },
    isReady,
  }), [engine, locale, isReady]);
  
  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * React Hook
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18n 必须在 I18nProvider 内使用');
  }
  
  return context;
}
```

### 使用示例

```tsx
import { I18nProvider, useI18n } from '@translink/i18n-runtime/react';

function App() {
  return (
    <I18nProvider
      defaultLanguage="zh-CN"
      supportedLanguages={['zh-CN', 'en-US']}
      resources={{
        'zh-CN': zhCN,
        'en-US': enUS,
      }}
    >
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t, locale, changeLanguage } = useI18n();
  
  return (
    <div>
      <h1>{t('欢迎')}</h1>
      <button onClick={() => changeLanguage('en-US')}>
        English
      </button>
    </div>
  );
}
```

---

## 6. 性能优化

### 1. 懒加载资源

```typescript
class ResourceLoader {
  private loadedLanguages = new Set<string>();
  
  async loadLanguage(lang: string): Promise<Record<string, string>> {
    if (this.loadedLanguages.has(lang)) {
      return {};
    }
    
    // 动态导入
    const module = await import(`./locales/${lang}.json`);
    this.loadedLanguages.add(lang);
    
    return module.default;
  }
}
```

### 2. 批量更新

```typescript
// 使用 requestIdleCallback 进行批量更新
const pendingUpdates = new Set<Function>();

function scheduleUpdate(callback: Function) {
  pendingUpdates.add(callback);
  
  requestIdleCallback(() => {
    pendingUpdates.forEach(cb => cb());
    pendingUpdates.clear();
  });
}
```

### 3. Tree-shaking 优化

```typescript
// 按需导出
export { I18nEngine } from './core/i18n-engine.js';
export { CacheManager } from './cache/cache-manager.js';

// 框架适配器分离
export * from './adapters/vue.js';  // 单独导入
export * from './adapters/react.js'; // 单独导入
```

---

## 7. 小结

本章学习了:

✅ **翻译引擎** - 三层查找、插值处理、事件系统  
✅ **缓存管理** - LRU 策略、TTL 过期、统计信息  
✅ **Vue 适配器** - Composition API、全局属性  
✅ **React 适配器** - Context API、Hook 实现  
✅ **性能优化** - 懒加载、批量更新、Tree-shaking

### 下一步

👉 [教程 4：Vite 插件开发](./04-vite-plugin.md) - 学习构建时优化

---

## 📚 扩展阅读

- [Vue 3 插件开发](https://vuejs.org/guide/reusability/plugins.html)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [性能优化最佳实践](https://web.dev/performance/)

