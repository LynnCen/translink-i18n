# Runtime 审查报告

> 生成时间: 2026-01-19  
> 审查范围: `@translink/i18n-runtime` 包

---

## 📋 目录

1. [应实现功能清单](#应实现功能清单)
2. [当前实现审查](#当前实现审查)
3. [发现的问题](#发现的问题)
4. [优化建议](#优化建议)
5. [重构优先级](#重构优先级)

---

## 应实现功能清单

根据架构设计文档（`docs/architecture.md`）和教程（`docs/tutorials/03-runtime-implementation.md`），Runtime 应该实现以下核心功能：

### 1. 核心翻译引擎 (I18nEngine)

#### 基础功能

- [x] `translate(key, params)` - 翻译函数
- [x] `t()` - translate 的别名
- [x] `changeLanguage(lang)` - 切换语言
- [x] `getCurrentLanguage()` - 获取当前语言
- [x] `getSupportedLanguages()` - 获取支持的语言列表
- [x] `addResource()` - 动态添加翻译资源
- [x] `exists()` - 检查翻译key是否存在

#### 查找策略

- [x] 三层查找机制（缓存 → 当前语言 → 回退语言）
- [x] 嵌套路径支持（`user.name`）
- [x] 命名空间支持（`namespace:key`）

#### 生命周期

- [x] `init()` - 异步初始化
- [x] `destroy()` - 清理资源
- [x] 事件系统（languageChanged, ready, translationMissing等）

### 2. 资源加载器 (ResourceLoader)

- [x] 支持动态导入（`import()`）
- [x] 支持HTTP请求（`fetch()`）
- [x] 懒加载机制
- [x] 预加载功能 `preload()`
- [x] 批量加载 `loadMultiple()`
- [x] 重试机制（带超时）
- [x] 自动重新加载（可配置间隔）

### 3. 缓存管理器 (CacheManager)

- [x] 内存缓存（Memory）
- [x] 持久化缓存（localStorage/sessionStorage）
- [x] LRU淘汰策略
- [x] TTL过期机制
- [x] 缓存统计信息
- [x] 定期清理

### 4. 插值处理器 (Interpolator)

#### 基础插值

- [x] 简单变量替换 `{{name}}`
- [x] 嵌套对象路径 `{{user.profile.name}}`
- [x] 递归插值支持

#### 格式化函数

- [x] 数字格式化 `{{count|number}}`
- [x] 货币格式化 `{{price|currency:USD}}`
- [x] 日期格式化 `{{date|date:long}}`
- [x] 时间格式化 `{{time|time:short}}`
- [x] 相对时间 `{{date|relative}}`
- [x] 大小写转换 `{{text|uppercase}}`
- [x] 复数处理 `{{count|plural:zero:one:other}}`
- [x] 自定义格式化器注册

#### 安全性

- [x] HTML转义（可配置）
- [x] XSS防护

### 5. Vue 3 适配器

#### Composition API

- [x] `createI18n()` - 创建实例
- [x] `useI18n()` - Hook支持
- [x] 响应式locale
- [x] 自动初始化

#### Options API

- [x] 全局属性注入（`$t`, `$i18n`, `$locale`）
- [x] 自动清理（unmount时）

#### 高级功能

- [x] 自定义指令 `v-t`
- [x] Translation组件
- [x] `withTranslation()` HOC
- [x] 命名空间支持

### 6. React 适配器

#### Hooks API

- [x] `I18nProvider` - Context Provider
- [x] `useTranslation()` - 翻译Hook
- [x] `useI18n()` - 完整实例Hook
- [x] 错误边界支持
- [x] Loading/Ready状态

#### 组件

- [x] `<Translation>` 组件
- [x] 组件插值支持（`<0>text</0>`）
- [x] Render props支持

#### 高级功能

- [x] `withTranslation()` HOC
- [x] `createI18nWithInit()` - 异步初始化帮助器
- [x] 命名空间支持

### 7. 事件系统 (EventEmitter)

- [x] `on()` - 注册监听器
- [x] `off()` - 移除监听器
- [x] `emit()` - 触发事件
- [x] `once()` - 一次性监听
- [x] `removeAllListeners()` - 清除所有监听器

### 8. 性能优化

- [x] Tree-shaking支持（ESM导出）
- [x] 懒加载（按需加载语言文件）
- [ ] 批量更新优化（requestIdleCallback）
- [x] 缓存优化
- [ ] SSR支持

---

## 当前实现审查

### ✅ 已完成且质量良好

#### 1. 核心引擎架构 (90%)

```
src/core/
├── i18n-engine.ts      ✅ 429行，架构完善
├── resource-loader.ts  ✅ 344行，功能完整
├── interpolator.ts     ✅ 366行，功能强大
└── 完整的事件系统
```

**优点**:

- 代码结构清晰，职责分明
- 完善的TypeScript类型支持
- 良好的错误处理
- 事件驱动设计

#### 2. 缓存系统 (85%)

```
src/cache/cache-manager.ts  ✅ 360行
```

**优点**:

- 多级缓存支持（内存+持久化）
- LRU淘汰策略
- TTL过期机制
- 统计信息收集

#### 3. 插值系统 (95%)

```
src/core/interpolator.ts  ✅ 最完善的模块
```

**优点**:

- 支持8种内置格式化器
- 可扩展的formatter注册机制
- 嵌套对象路径解析
- HTML转义安全

#### 4. Vue 适配器 (90%)

```
src/adapters/vue.ts  ✅ 385行
```

**优点**:

- 完整的Composition API支持
- Options API兼容
- 自定义指令和组件
- 响应式设计

#### 5. React 适配器 (88%)

```
src/adapters/react.ts  ✅ 399行
```

**优点**:

- 现代Hook设计
- Context API最佳实践
- 组件插值支持
- HOC支持

---

## 发现的问题

### 🔴 严重问题（必须修复）

#### 问题1: ResourceLoader 动态导入路径不安全

**位置**: `src/core/resource-loader.ts:266-272`

```typescript
// ❌ 当前实现
private async loadByImport(path: string): Promise<TranslationResource> {
  try {
    const module = await import(path);  // 不安全！
    return module.default || module;
  } catch (error) {
    throw new Error(`Failed to import resource from ${path}: ${error}`);
  }
}
```

**问题**:

- 动态`import()`在打包工具中无法静态分析
- Vite/Webpack无法正确处理变量路径
- 会导致运行时加载失败

**解决方案**:

```typescript
// ✅ 建议实现
private async loadByImport(path: string): Promise<TranslationResource> {
  // 使用Vite的glob导入或让用户通过loadFunction传入
  throw new Error(
    'Dynamic import requires explicit loadFunction. ' +
    'Please provide a loadFunction in I18nOptions.'
  );
}
```

---

#### 问题2: addResource 功能未完整实现

**位置**: `src/core/i18n-engine.ts:188-202`

```typescript
// ❌ 当前实现
addResource(
  language: string,
  namespace: string,
  resource: TranslationResource
): void {
  const resourceKey = `${language}/${namespace}`;
  this.resourceLoader.getLoadedResource(language, namespace);  // 只是查询？

  // 这里需要扩展 ResourceLoader 来支持动态添加资源
  // 暂时通过事件通知
  this.emit('resourceLoaded', language, namespace);

  // 清除相关缓存
  this.clearCacheForLanguage(language);
}
```

**问题**:

- 函数没有实际添加资源
- 只是触发事件和清缓存
- 违反了函数语义

**解决方案**:

```typescript
// ✅ 需要在 ResourceLoader 中添加
class ResourceLoader {
  addResource(language: string, namespace: string, resource: TranslationResource): void {
    const resourceKey = this.getResourceKey(language, namespace);
    this.loadedResources.set(resourceKey, resource);
    this.emit('resourceLoaded', language, namespace);
  }
}

// ✅ I18nEngine 中调用
addResource(language: string, namespace: string, resource: TranslationResource): void {
  this.resourceLoader.addResource(language, namespace, resource);
  this.clearCacheForLanguage(language);
}
```

---

#### 问题3: clearCacheForLanguage 实现不完整

**位置**: `src/core/i18n-engine.ts:347-351`

```typescript
// ❌ 当前实现
private clearCacheForLanguage(language: string): void {
  // 这里需要扩展 CacheManager 来支持按前缀清除
  // 暂时清除所有缓存
  this.cache.clear();
}
```

**问题**:

- 清除了所有语言的缓存（过度清理）
- 影响其他语言的性能
- 注释说需要扩展CacheManager但没做

**解决方案**:

```typescript
// ✅ 在 CacheManager 中添加
clearByPrefix(prefix: string): void {
  const keysToDelete: string[] = [];

  for (const key of this.memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => this.delete(key));
}

// ✅ I18nEngine 中调用
private clearCacheForLanguage(language: string): void {
  this.cache.clearByPrefix(`${language}:`);
}
```

---

### 🟡 重要问题（需要改进）

#### 问题4: 类型定义不够严格

**位置**: `src/types/index.ts:5-7`

```typescript
// ❌ 当前实现
export interface TranslationResource {
  [key: string]: string | TranslationResource; // 太宽泛
}
```

**问题**:

- 允许任意嵌套深度
- 没有约束叶子节点必须是string
- 可能导致运行时错误

**建议**:

```typescript
// ✅ 更严格的类型
export type TranslationValue = string;
export type TranslationResource = {
  [key: string]: TranslationValue | TranslationResource;
};

// 或者使用泛型
export interface TypedTranslationResource<T = string> {
  [key: string]: T | TypedTranslationResource<T>;
}
```

---

#### 问题5: Vue适配器中事件监听未正确清理

**位置**: `src/adapters/vue.ts:154-156`

```typescript
// ❌ 当前实现
const unsubscribeReady = engine.on('ready', () => {
  isReady.value = true;
});

// ...

onUnmounted(() => {
  if (unsubscribeReady) {
    engine.off('ready', unsubscribeReady); // ❌ 错误用法
  }
});
```

**问题**:

- `engine.on()` 返回的不是handler本身
- `off()` 需要传入原始handler
- 导致事件监听器泄漏

**解决方案**:

```typescript
// ✅ 方案1: EventEmitter返回清理函数
class EventEmitter {
  on(event: string, handler: Function): () => void {
    // ...
    return () => this.off(event, handler);
  }
}

// 使用
const unsubscribe = engine.on('ready', () => {
  isReady.value = true;
});
onUnmounted(unsubscribe);

// ✅ 方案2: 保存原始handler引用
const readyHandler = () => {
  isReady.value = true;
};
engine.on('ready', readyHandler);
onUnmounted(() => {
  engine.off('ready', readyHandler);
});
```

---

#### 问题6: React适配器缺少性能优化

**位置**: `src/adapters/react.ts:89-99`

```typescript
// ❌ 当前实现
const t = useCallback(
  (key: string, params?: TranslationParams, options?: {...}) => {
    return i18n.t(key, params, options);
  },
  [i18n]
);
```

**问题**:

- `t`函数会在每次locale变化时重新创建（因为依赖i18n）
- 可能导致不必要的组件重渲染
- 没有memo优化

**建议**:

```typescript
// ✅ 优化版本
const t = useCallback(
  (key: string, params?: TranslationParams, options?: {...}) => {
    return i18n.t(key, params, options);
  },
  [i18n]  // i18n实例不会变，这里是正确的
);

// 但是contextValue的memo依赖可以优化
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
  [locale, isReady, isLoading, error]  // ✅ 移除不必要的依赖
);
```

---

### 🟢 次要问题（可选优化）

#### 问题7: 缺少SSR支持

**位置**: 全局架构

**问题**:

- 没有考虑服务端渲染场景
- `window`、`localStorage`等在SSR中不可用
- 缺少异步数据序列化/hydration

**建议**:

```typescript
// ✅ 添加SSR支持
export interface SSRContext {
  initialLanguage: string;
  initialResources: Record<string, TranslationResource>;
}

export function createI18nSSR(options: I18nOptions, ssrContext?: SSRContext) {
  if (ssrContext) {
    // 服务端：预加载资源
    return createI18nWithPreloadedResources(options, ssrContext);
  } else {
    // 客户端：使用hydration数据
    return createI18nWithHydration(options);
  }
}
```

---

#### 问题8: 缺少批量更新优化

**位置**: 架构设计提到但未实现

**教程中提到**:

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

**问题**:

- 当前每次翻译都立即执行
- 短时间内多次语言切换会触发多次渲染
- 没有使用`requestIdleCallback`优化

**建议**:

```typescript
// ✅ 在 I18nEngine 中添加
private updateScheduler = {
  pending: new Set<() => void>(),
  scheduled: false,

  schedule(callback: () => void) {
    this.pending.add(callback);
    if (!this.scheduled) {
      this.scheduled = true;
      requestIdleCallback(() => {
        this.pending.forEach(cb => cb());
        this.pending.clear();
        this.scheduled = false;
      });
    }
  }
};
```

---

#### 问题9: 缺少复数（Pluralization）功能

**位置**: 类型定义中提到但未实现

```typescript
// ✅ types/index.ts 中有定义
pluralization?: {
  enabled: boolean;
  rules?: Record<string, (count: number) => number>;
}

// ❌ 但 I18nEngine 中没有实际实现
```

**建议**:

```typescript
// ✅ 实现 Pluralization
class PluralResolver {
  private rules: Map<string, PluralRule>;

  constructor() {
    this.registerDefaultRules();
  }

  resolve(language: string, count: number): string {
    const rule = this.rules.get(language) || this.rules.get('en')!;
    const index = rule(count);

    // 返回: 'zero', 'one', 'two', 'few', 'many', 'other'
    const forms = ['zero', 'one', 'two', 'few', 'many', 'other'];
    return forms[index] || 'other';
  }

  private registerDefaultRules() {
    // 英语: 0 -> zero, 1 -> one, other -> other
    this.rules.set('en', count => {
      if (count === 0) return 0;
      if (count === 1) return 1;
      return 5;
    });

    // 中文: 全部是 'other'
    this.rules.set('zh', () => 5);

    // 其他语言规则...
  }
}

// 使用
const plural = this.pluralResolver.resolve('en', count);
const key = `${baseKey}_${plural}`; // e.g., "message_one", "message_other"
```

---

#### 问题10: 日志系统可以抽离

**位置**: `src/core/i18n-engine.ts:404-427`

**问题**:

- 日志逻辑混在Engine中
- 不利于自定义和扩展
- 没有日志级别控制

**建议**:

```typescript
// ✅ 抽离为独立模块
// src/utils/logger.ts
export class Logger {
  constructor(
    private options: {
      debug: boolean;
      logLevel: 'error' | 'warn' | 'info' | 'debug';
      prefix: string;
    }
  ) {}

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(`[${this.options.prefix}]`, message, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`[${this.options.prefix}]`, message, ...args);
    }
  }

  // ... info, debug

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.options.logLevel);
  }
}

// ✅ 在 I18nEngine 中使用
this.logger = new Logger({
  debug: options.debug,
  logLevel: options.logLevel,
  prefix: 'TransLink I18n',
});

this.logger.warn('I18n engine not initialized');
```

---

## 优化建议

### 1. 架构优化

#### 建议A: 将ResourceLoader的addResource功能补全

```typescript
// src/core/resource-loader.ts
class ResourceLoader {
  // ✅ 新增方法
  addResource(
    language: string,
    namespace: string,
    resource: TranslationResource
  ): void {
    const resourceKey = this.getResourceKey(language, namespace);

    // 合并现有资源
    const existing = this.loadedResources.get(resourceKey) || {};
    this.loadedResources.set(resourceKey, {
      ...existing,
      ...resource,
    });

    this.emit('resourceLoaded', language, namespace);
  }

  // ✅ 新增方法: 替换资源（不合并）
  setResource(
    language: string,
    namespace: string,
    resource: TranslationResource
  ): void {
    const resourceKey = this.getResourceKey(language, namespace);
    this.loadedResources.set(resourceKey, resource);
    this.emit('resourceLoaded', language, namespace);
  }
}
```

---

#### 建议B: CacheManager 添加按前缀清除功能

```typescript
// src/cache/cache-manager.ts
class CacheManager<T = any> {
  // ✅ 新增方法
  clearByPrefix(prefix: string): number {
    let count = 0;

    // 清除内存缓存
    const memoryKeysToDelete: string[] = [];
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryKeysToDelete.push(key);
      }
    }
    memoryKeysToDelete.forEach(key => {
      this.memoryCache.delete(key);
      count++;
    });

    // 清除持久化缓存
    if (this.options.storage !== 'memory' && this.isStorageAvailable()) {
      const storage = this.getStorage();
      const storagePrefix = this.getStorageKey(prefix);

      for (let i = storage.length - 1; i >= 0; i--) {
        const key = storage.key(i);
        if (key && key.startsWith(storagePrefix)) {
          storage.removeItem(key);
          count++;
        }
      }
    }

    return count;
  }

  // ✅ 新增方法: 批量删除
  deleteMany(keys: string[]): number {
    let count = 0;
    keys.forEach(key => {
      if (this.delete(key)) {
        count++;
      }
    });
    return count;
  }
}
```

---

### 2. 功能增强

#### 建议C: 添加 Pluralization 支持

```typescript
// src/core/plural-resolver.ts
export type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export class PluralResolver {
  private rules = new Map<string, PluralRule>();

  constructor() {
    this.registerDefaultRules();
  }

  resolve(language: string, count: number): PluralForm {
    const rule = this.rules.get(language) || this.rules.get('en')!;
    const index = rule(count);

    const forms: PluralForm[] = ['zero', 'one', 'two', 'few', 'many', 'other'];
    return forms[index] || 'other';
  }

  registerRule(language: string, rule: PluralRule): void {
    this.rules.set(language, rule);
  }

  private registerDefaultRules(): void {
    // English (1, 2, 3, ...)
    this.rules.set('en', (count) => {
      if (count === 0) return 0;  // zero
      if (count === 1) return 1;  // one
      return 5;  // other
    });

    // Chinese (all 'other')
    this.rules.set('zh', () => 5);

    // Russian (complex plural rules)
    this.rules.set('ru', (count) => {
      if (count % 10 === 1 && count % 100 !== 11) return 1;  // one
      if (
        count % 10 >= 2 &&
        count % 10 <= 4 &&
        (count % 100 < 10 || count % 100 >= 20)
      ) {
        return 3;  // few
      }
      return 5;  // other
    });

    // Add more languages as needed
  }
}

// ✅ 在 I18nEngine 中使用
class I18nEngine {
  private pluralResolver: PluralResolver;

  constructor(options: I18nOptions) {
    // ...
    if (options.pluralization?.enabled !== false) {
      this.pluralResolver = new PluralResolver();

      // 注册自定义规则
      if (options.pluralization?.rules) {
        Object.entries(options.pluralization.rules).forEach(([lang, rule]) => {
          this.pluralResolver.registerRule(lang, rule);
        });
      }
    }
  }

  t(key: string, params?: TranslationParams, options?: {...}): string {
    // 如果有count参数，使用复数形式
    if (params && 'count' in params && this.pluralResolver) {
      const pluralForm = this.pluralResolver.resolve(
        options?.lng || this.currentLanguage,
        params.count as number
      );

      // 尝试 key_plural 形式
      const pluralKey = `${key}_${pluralForm}`;
      if (this.exists(pluralKey, options)) {
        return this.t(pluralKey, params, options);
      }
    }

    // 原有逻辑...
  }
}
```

---

#### 建议D: 添加 SSR 支持

```typescript
// src/ssr/index.ts
export interface SSRContext {
  language: string;
  resources: Record<string, Record<string, TranslationResource>>;
}

export function serializeSSRContext(engine: I18nEngine): SSRContext {
  const resources: Record<string, Record<string, TranslationResource>> = {};

  engine.getSupportedLanguages().forEach(lang => {
    resources[lang] = {};
    // 收集已加载的资源
    // TODO: 需要ResourceLoader提供获取所有资源的方法
  });

  return {
    language: engine.getCurrentLanguage(),
    resources,
  };
}

export function createI18nWithSSR(
  options: I18nOptions,
  ssrContext?: SSRContext
): I18nEngine {
  const engine = new I18nEngine({
    ...options,
    // 禁用自动加载（使用预加载的数据）
    loadFunction: ssrContext
      ? async (lng, ns) => {
          return ssrContext.resources[lng]?.[ns] || {};
        }
      : options.loadFunction,
  });

  return engine;
}

// 使用示例
// Server side:
const ssrContext = serializeSSRContext(i18n);
const html = renderToString(app, { i18nContext: ssrContext });

// Client side:
const i18n = createI18nWithSSR(options, window.__I18N_SSR_CONTEXT__);
```

---

### 3. 性能优化

#### 建议E: 实现批量更新调度器

```typescript
// src/utils/scheduler.ts
export class UpdateScheduler {
  private pending = new Set<() => void>();
  private scheduled = false;
  private rafId?: number;

  schedule(callback: () => void): void {
    this.pending.add(callback);

    if (!this.scheduled) {
      this.scheduled = true;
      this.scheduleFlush();
    }
  }

  private scheduleFlush(): void {
    // 优先使用 requestIdleCallback
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => this.flush(), { timeout: 50 });
    } else {
      // 降级到 requestAnimationFrame
      this.rafId = requestAnimationFrame(() => this.flush());
    }
  }

  private flush(): void {
    const callbacks = Array.from(this.pending);
    this.pending.clear();
    this.scheduled = false;

    callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Scheduled update error:', error);
      }
    });
  }

  cancel(): void {
    this.pending.clear();
    this.scheduled = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }
}

// ✅ 在框架适配器中使用
// Vue:
const updateScheduler = new UpdateScheduler();

engine.on('languageChanged', language => {
  updateScheduler.schedule(() => {
    currentLanguage.value = language;
  });
});

// React:
useEffect(() => {
  const updateScheduler = new UpdateScheduler();

  const handleLanguageChange = (language: string) => {
    updateScheduler.schedule(() => {
      setLocaleState(language);
    });
  };

  i18n.on('languageChanged', handleLanguageChange);

  return () => {
    i18n.off('languageChanged', handleLanguageChange);
    updateScheduler.cancel();
  };
}, [i18n]);
```

---

#### 建议F: 优化嵌套路径查找

```typescript
// src/core/i18n-engine.ts
class I18nEngine {
  // ✅ 添加路径缓存
  private pathCache = new Map<string, string[]>();

  private getNestedValue(
    obj: TranslationResource,
    path: string
  ): string | null {
    // 缓存路径解析结果
    let keys = this.pathCache.get(path);

    if (!keys) {
      keys = path.split('.');
      this.pathCache.set(path, keys);
    }

    let current: any = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return null;
      }
    }

    return typeof current === 'string' ? current : null;
  }
}
```

---

### 4. 开发体验优化

#### 建议G: 添加 DevTools 支持

```typescript
// src/devtools/index.ts
export interface DevToolsOptions {
  enabled: boolean;
  logMissingKeys?: boolean;
  highlightMissing?: boolean;
}

export class I18nDevTools {
  private missingKeys = new Set<string>();
  private translationCalls = 0;

  constructor(
    private engine: I18nEngine,
    private options: DevToolsOptions
  ) {
    this.attachToEngine();
    this.exposeToWindow();
  }

  private attachToEngine(): void {
    this.engine.on('translationMissing', (key, language) => {
      this.missingKeys.add(`${language}:${key}`);

      if (this.options.logMissingKeys) {
        console.warn(`[i18n] Missing translation: ${key} (${language})`);
      }
    });

    // 拦截 t() 调用
    const originalT = this.engine.t.bind(this.engine);
    this.engine.t = (...args) => {
      this.translationCalls++;
      return originalT(...args);
    };
  }

  private exposeToWindow(): void {
    if (typeof window !== 'undefined') {
      (window as any).__TRANSLINK_DEVTOOLS__ = {
        engine: this.engine,
        missingKeys: () => Array.from(this.missingKeys),
        stats: () => ({
          translationCalls: this.translationCalls,
          cachedTranslations: this.engine.getCacheStats(),
          loadedLanguages: this.engine.getSupportedLanguages(),
        }),
        clearMissing: () => this.missingKeys.clear(),
      };
    }
  }
}

// 使用
if (process.env.NODE_ENV === 'development') {
  new I18nDevTools(engine, {
    enabled: true,
    logMissingKeys: true,
  });
}
```

---

#### 建议H: 添加类型推断支持

```typescript
// src/types/typed.ts
export type TypedKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${TypedKeys<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

export type TranslationKeys<Resources extends Record<string, any>> =
  TypedKeys<Resources>;

// 使用
interface MyTranslations {
  common: {
    hello: string;
    goodbye: string;
  };
  user: {
    profile: {
      name: string;
      age: string;
    };
  };
}

// ✅ 类型安全的翻译函数
const t = useI18n<MyTranslations>();

t('common.hello'); // ✅ OK
t('user.profile.name'); // ✅ OK
t('user.profile.invalid'); // ❌ Type error
```

---

## 重构优先级

### 阶段1: 修复严重问题 (Week 1) 🔴 必须完成

**目标**: 修复核心功能缺陷

1. ✅ **修复 addResource 功能**
   - 在 ResourceLoader 中实现真正的addResource方法
   - 更新 I18nEngine 的调用
   - 添加单元测试
2. ✅ **修复 clearCacheForLanguage**
   - 在 CacheManager 中实现 clearByPrefix
   - 更新 I18nEngine 使用新方法
   - 添加测试

3. ✅ **修复动态导入路径问题**
   - 移除不安全的动态import
   - 要求用户提供 loadFunction
   - 更新文档说明

4. ✅ **修复 Vue 事件监听清理**
   - 修改 EventEmitter 返回清理函数
   - 更新 Vue 适配器
   - 测试内存泄漏

**验收标准**:

- 所有严重问题修复完成
- 单元测试覆盖率 > 80%
- 无内存泄漏

---

### 阶段2: 功能增强 (Week 2-3) 🟡 重要

**目标**: 补全缺失的核心功能

1. ✅ **实现 Pluralization**
   - 创建 PluralResolver 模块
   - 注册常见语言的复数规则
   - 集成到 I18nEngine
   - 添加测试和文档

2. ✅ **优化类型定义**
   - 严格化 TranslationResource 类型
   - 添加泛型支持
   - 提供类型推断工具

3. ✅ **添加 DevTools**
   - 实现 missing key 追踪
   - 添加统计信息收集
   - 暴露到 window 对象
   - 编写使用文档

4. ✅ **性能优化**
   - 实现 UpdateScheduler
   - 优化嵌套路径查找
   - 添加性能基准测试

**验收标准**:

- Pluralization 功能完整可用
- DevTools 可以追踪问题
- 性能提升 20%+

---

### 阶段3: SSR 和高级功能 (Week 4-5) 🟢 次要

**目标**: 支持服务端渲染和高级场景

1. ✅ **SSR 支持**
   - 实现 serializeSSRContext
   - 实现 createI18nWithSSR
   - 编写 Next.js 集成示例
   - 编写 Nuxt 集成示例

2. ✅ **批量更新优化**
   - 实现 requestIdleCallback 调度
   - 集成到框架适配器
   - 添加性能测试

3. ✅ **日志系统抽离**
   - 创建独立的 Logger 模块
   - 支持自定义日志处理器
   - 更新文档

**验收标准**:

- SSR 示例项目可以运行
- 批量更新性能提升明显
- 文档完整

---

### 阶段4: 文档和示例 (Week 6) 🟢 重要

**目标**: 完善文档和示例代码

1. ✅ **API 文档**
   - 补全所有公开API的文档
   - 添加代码示例
   - 生成 TypeDoc

2. ✅ **使用示例**
   - Vue 3 完整示例
   - React 完整示例
   - SSR 示例
   - TypeScript 类型示例

3. ✅ **最佳实践指南**
   - 性能优化建议
   - 常见问题解答
   - 迁移指南

**验收标准**:

- 文档完整可读
- 示例可运行
- 新用户可以快速上手

---

## 总结

### 当前状态评分

| 模块         | 完成度 | 质量   | 评分 |
| ------------ | ------ | ------ | ---- |
| 核心引擎     | 90%    | 良好   | A-   |
| 资源加载器   | 85%    | 良好   | B+   |
| 缓存管理     | 85%    | 良好   | B+   |
| 插值处理     | 95%    | 优秀   | A    |
| Vue 适配器   | 90%    | 良好   | A-   |
| React 适配器 | 88%    | 良好   | B+   |
| 类型定义     | 80%    | 一般   | B    |
| 文档         | 85%    | 良好   | B+   |
| 测试         | 60%    | 待改进 | C+   |

**总体评分**: B+ (83%)

### 主要优点

1. ✅ **架构设计优秀**
   - 职责清晰，模块化好
   - 事件驱动，易于扩展
   - TypeScript 支持良好

2. ✅ **功能完整度高**
   - 核心功能 90% 已实现
   - 支持 Vue 和 React
   - 插值系统功能强大

3. ✅ **代码质量良好**
   - 错误处理完善
   - 注释清晰
   - 命名规范

### 主要问题

1. ❌ **部分功能未完全实现**
   - `addResource` 只有框架没有实现
   - `clearCacheForLanguage` 实现简陋
   - 缺少 Pluralization 实现

2. ❌ **缺少测试**
   - 测试覆盖率低（目测 < 60%）
   - 缺少集成测试
   - 缺少性能测试

3. ❌ **文档待完善**
   - API 文档不完整
   - 缺少完整示例
   - 缺少最佳实践指南

### 下一步行动

**立即执行** (Week 1):

1. 修复 `addResource` 功能
2. 修复 `clearCacheForLanguage`
3. 修复动态导入路径问题
4. 修复 Vue 事件监听清理

**尽快完成** (Week 2-3): 5. 实现 Pluralization 6. 添加 DevTools 7. 性能优化（UpdateScheduler、路径缓存）

**后续计划** (Week 4-6): 8. SSR 支持 9. 完善文档和示例 10. 补充测试

---

**报告完成时间**: 2026-01-19  
**审查人员**: AI Assistant  
**下次审查**: 完成阶段1后
