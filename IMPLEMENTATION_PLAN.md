# TransLink I18n 详细实施计划

## 📋 实施清单

### 阶段一：项目基础架构搭建

#### 1. 初始化 Monorepo 结构
- [ ] 创建根目录和基础文件结构
- [ ] 配置 pnpm workspace
- [ ] 设置 Turborepo 配置
- [ ] 初始化各子包的 package.json

#### 2. 开发环境配置
- [ ] 配置 TypeScript 项目引用
- [ ] 设置 ESLint 和 Prettier 共享配置
- [ ] 配置 Vitest 测试环境
- [ ] 设置 Husky Git hooks

#### 3. CI/CD 基础设施
- [ ] 配置 GitHub Actions 工作流
- [ ] 设置自动化测试和构建
- [ ] 配置 NPM 发布流程
- [ ] 设置代码质量检查

### 阶段二：CLI 工具核心开发

#### 1. 命令行框架搭建
- [ ] 使用 Commander.js 创建 CLI 结构
- [ ] 实现配置文件解析 (i18n.config.ts)
- [ ] 添加日志和错误处理系统
- [ ] 实现插件系统架构

#### 2. AST 文本提取器
- [ ] 集成 GoGoCode AST 处理库
- [ ] 实现中文文本识别正则表达式
- [ ] 开发多种模式的文本提取器
  - 静态字符串提取
  - 模板字符串处理
  - 条件表达式识别
- [ ] 添加文件扫描和过滤功能

#### 3. 智能哈希生成器
- [ ] 实现内容哈希算法 (SHA-256)
- [ ] 开发哈希冲突检测机制
- [ ] 实现上下文信息收集
- [ ] 添加哈希映射存储系统

#### 4. Vika 云端集成
- [ ] 集成 Vika API SDK
- [ ] 实现推送 (push) 功能
- [ ] 实现拉取 (pull) 功能
- [ ] 添加增量同步逻辑
- [ ] 实现冲突解决策略

### 阶段三：运行时库开发

#### 1. 核心翻译引擎
- [ ] 实现基础 I18n 类
- [ ] 开发多级缓存系统
  - 内存缓存
  - LocalStorage 缓存
  - 网络缓存
- [ ] 实现参数插值功能
- [ ] 添加复数处理支持

#### 2. 语言包管理
- [ ] 实现动态语言包加载
- [ ] 开发懒加载机制
- [ ] 添加语言切换功能
- [ ] 实现语言包热更新

#### 3. 框架适配器
- [ ] Vue3 Composition API 集成
  - 实现 useI18n hook
  - 开发 t() 全局属性
  - 添加响应式语言切换
- [ ] React Hooks 集成
  - 实现 useTranslation hook
  - 开发 Translation 组件
  - 添加 Context Provider

### 阶段四：Vite 插件开发

#### 1. 插件核心架构
- [ ] 实现 Vite 插件接口
- [ ] 开发配置解析系统
- [ ] 添加开发/构建模式区分
- [ ] 实现插件选项验证

#### 2. 代码转换系统
- [ ] 开发 AST 代码转换器
- [ ] 实现渐进式转换逻辑
  - 开发模式：保持原文 + 映射
  - 构建模式：转换为哈希调用
- [ ] 添加 Source Map 支持
- [ ] 实现转换缓存机制

#### 3. 热更新支持
- [ ] 实现语言文件监听
- [ ] 开发模块失效机制
- [ ] 添加 WebSocket 通信
- [ ] 实现增量更新推送

#### 4. 构建优化
- [ ] 实现语言包自动注入
- [ ] 开发按需加载生成器
- [ ] 添加 Tree Shaking 支持
- [ ] 实现构建缓存优化

### 阶段五：测试与文档

#### 1. 测试套件开发
- [ ] CLI 工具单元测试
- [ ] 运行时库单元测试
- [ ] Vite 插件单元测试
- [ ] 集成测试用例
- [ ] E2E 测试场景

#### 2. 示例项目
- [ ] Vue3 + Vite 示例
- [ ] React + Vite 示例
- [ ] TypeScript 示例
- [ ] JavaScript 示例

#### 3. 文档编写
- [ ] API 文档生成
- [ ] 使用指南编写
- [ ] 最佳实践文档
- [ ] 迁移指南
- [ ] FAQ 文档

## 🔧 详细技术规范

### CLI 工具技术规范

#### 命令结构设计

```typescript
// packages/cli/src/index.ts
#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { extractCommand } from './commands/extract';
import { buildCommand } from './commands/build';
import { pushCommand } from './commands/push';
import { pullCommand } from './commands/pull';
import { analyzeCommand } from './commands/analyze';

const program = new Command();

program
  .name('@translink/i18n-cli')
  .description('TransLink I18n CLI Tool')
  .version('1.0.0');

// 注册所有命令
program.addCommand(initCommand);
program.addCommand(extractCommand);
program.addCommand(buildCommand);
program.addCommand(pushCommand);
program.addCommand(pullCommand);
program.addCommand(analyzeCommand);

program.parse();
```

#### 配置文件类型定义

```typescript
// packages/cli/src/types/config.ts
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
```

#### AST 提取器实现

```typescript
// packages/cli/src/extractors/ast-extractor.ts
import $ from 'gogocode';
import { readFileSync } from 'fs';
import { glob } from 'glob';

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

export class ASTExtractor {
  private config: I18nConfig['extract'];
  private hashGenerator: HashGenerator;
  
  constructor(config: I18nConfig['extract'], hashGenerator: HashGenerator) {
    this.config = config;
    this.hashGenerator = hashGenerator;
  }
  
  async extractFromProject(): Promise<ExtractResult[]> {
    const files = await this.scanFiles();
    const results: ExtractResult[] = [];
    
    for (const filePath of files) {
      const fileResults = await this.extractFromFile(filePath);
      results.push(...fileResults);
    }
    
    return this.deduplicateResults(results);
  }
  
  private async scanFiles(): Promise<string[]> {
    const allFiles: string[] = [];
    
    for (const pattern of this.config.patterns) {
      const files = await glob(pattern, {
        ignore: this.config.exclude
      });
      allFiles.push(...files);
    }
    
    return [...new Set(allFiles)];
  }
  
  private async extractFromFile(filePath: string): Promise<ExtractResult[]> {
    const content = readFileSync(filePath, 'utf-8');
    const ast = $(content);
    const results: ExtractResult[] = [];
    
    // 查找翻译函数调用
    ast.find('CallExpression').each((node) => {
      const callee = node.attr('callee');
      const functionName = this.getFunctionName(callee);
      
      if (this.config.functions.includes(functionName)) {
        const args = node.attr('arguments');
        const textArg = args[0];
        
        if (textArg && this.isStringLiteral(textArg)) {
          const text = textArg.value;
          
          if (this.isChineseText(text)) {
            const context = this.extractContext(node, filePath);
            const key = this.hashGenerator.generate(text, context);
            
            results.push({
              key,
              text,
              filePath,
              line: node.attr('loc.start.line'),
              column: node.attr('loc.start.column'),
              context
            });
          }
        }
      }
    });
    
    return results;
  }
  
  private isChineseText(text: string): boolean {
    return /[\u4e00-\u9fa5]/.test(text);
  }
  
  private extractContext(node: any, filePath: string) {
    // 提取上下文信息：组件名、函数名等
    const context: any = {};
    
    // 查找所在的组件或函数
    let parent = node.parent();
    while (parent) {
      if (parent.attr('type') === 'FunctionDeclaration') {
        context.functionName = parent.attr('id.name');
        break;
      }
      if (parent.attr('type') === 'VariableDeclarator') {
        context.componentName = parent.attr('id.name');
        break;
      }
      parent = parent.parent();
    }
    
    return context;
  }
}
```

### 运行时库技术规范

#### 核心翻译引擎

```typescript
// packages/runtime/src/core/i18n-engine.ts
export interface TranslationResource {
  [key: string]: string | TranslationResource;
}

export interface I18nOptions {
  defaultLanguage: string;
  fallbackLanguage: string;
  resources: Record<string, TranslationResource>;
  cache: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
  };
  loader: {
    loadPath: string;
    loadFunction?: (lng: string, ns: string) => Promise<TranslationResource>;
  };
}

export class I18nEngine extends EventEmitter {
  private currentLanguage: string;
  private resources = new Map<string, TranslationResource>();
  private cache = new LRUCache<string, string>(1000);
  private options: I18nOptions;
  
  constructor(options: I18nOptions) {
    super();
    this.options = options;
    this.currentLanguage = options.defaultLanguage;
    this.init();
  }
  
  private async init() {
    // 加载初始语言资源
    await this.loadLanguage(this.currentLanguage);
    this.emit('ready');
  }
  
  async loadLanguage(language: string): Promise<void> {
    if (this.resources.has(language)) {
      return;
    }
    
    try {
      let resource: TranslationResource;
      
      if (this.options.loader.loadFunction) {
        resource = await this.options.loader.loadFunction(language, 'translation');
      } else {
        const response = await fetch(
          this.options.loader.loadPath.replace('{{lng}}', language)
        );
        resource = await response.json();
      }
      
      this.resources.set(language, resource);
      this.emit('languageLoaded', language);
    } catch (error) {
      this.emit('failedLoading', language, error);
      throw error;
    }
  }
  
  t(key: string, options?: { [key: string]: any }): string {
    const cacheKey = `${this.currentLanguage}:${key}:${JSON.stringify(options || {})}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // 获取翻译
    const translation = this.getTranslation(key, this.currentLanguage) ||
                       this.getTranslation(key, this.options.fallbackLanguage) ||
                       key;
    
    // 插值处理
    const result = this.interpolate(translation, options);
    
    // 缓存结果
    if (this.options.cache.enabled) {
      this.cache.set(cacheKey, result);
    }
    
    return result;
  }
  
  private getTranslation(key: string, language: string): string | null {
    const resource = this.resources.get(language);
    if (!resource) return null;
    
    return this.getNestedValue(resource, key);
  }
  
  private getNestedValue(obj: any, path: string): string | null {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return null;
      }
    }
    
    return typeof current === 'string' ? current : null;
  }
  
  private interpolate(template: string, values: { [key: string]: any } = {}): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] !== undefined ? String(values[key]) : match;
    });
  }
  
  async changeLanguage(language: string): Promise<void> {
    if (language === this.currentLanguage) return;
    
    await this.loadLanguage(language);
    this.currentLanguage = language;
    this.cache.clear();
    this.emit('languageChanged', language);
  }
}
```

#### Vue3 适配器

```typescript
// packages/runtime/src/adapters/vue.ts
import { App, computed, ref, inject, provide } from 'vue';
import { I18nEngine } from '../core/i18n-engine';

const I18N_SYMBOL = Symbol('i18n');

export interface VueI18nOptions {
  engine: I18nEngine;
  globalInjection?: boolean;
}

export function createI18n(options: VueI18nOptions) {
  const { engine } = options;
  const currentLanguage = ref(engine.getCurrentLanguage());
  
  // 监听语言变化
  engine.on('languageChanged', (lang: string) => {
    currentLanguage.value = lang;
  });
  
  const i18n = {
    global: {
      t: (key: string, options?: any) => engine.t(key, options),
      locale: computed({
        get: () => currentLanguage.value,
        set: (lang: string) => engine.changeLanguage(lang)
      })
    },
    install(app: App) {
      // 提供全局实例
      app.provide(I18N_SYMBOL, i18n);
      
      // 全局属性注入
      if (options.globalInjection !== false) {
        app.config.globalProperties.$t = i18n.global.t;
        app.config.globalProperties.$i18n = i18n;
      }
    }
  };
  
  return i18n;
}

export function useI18n() {
  const i18n = inject(I18N_SYMBOL);
  if (!i18n) {
    throw new Error('useI18n must be used within i18n context');
  }
  
  return {
    t: i18n.global.t,
    locale: i18n.global.locale
  };
}
```

### Vite 插件技术规范

#### 插件主体实现

```typescript
// packages/vite-plugin/src/index.ts
import type { Plugin, ResolvedConfig } from 'vite';
import { I18nTransformer } from './transformer';
import { LanguageLoader } from './loader';
import { HMRHandler } from './hmr';

export interface I18nPluginOptions {
  configFile?: string;
  include?: string[];
  exclude?: string[];
  defaultLanguage?: string;
  loadPath?: string;
  transformMode?: 'development' | 'production' | 'auto';
}

export function i18nPlugin(options: I18nPluginOptions = {}): Plugin {
  let config: ResolvedConfig;
  let transformer: I18nTransformer;
  let loader: LanguageLoader;
  let hmrHandler: HMRHandler;
  
  return {
    name: 'translink-i18n',
    
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      transformer = new I18nTransformer(options, config);
      loader = new LanguageLoader(options, config);
      hmrHandler = new HMRHandler(options, config);
    },
    
    buildStart() {
      // 初始化语言资源
      loader.loadResources();
    },
    
    resolveId(id) {
      // 处理虚拟模块
      if (id.startsWith('virtual:i18n-')) {
        return id;
      }
    },
    
    load(id) {
      // 加载虚拟模块
      if (id.startsWith('virtual:i18n-')) {
        return loader.loadVirtualModule(id);
      }
    },
    
    transform(code, id) {
      // 转换包含翻译函数的文件
      if (transformer.shouldTransform(id)) {
        return transformer.transform(code, id);
      }
    },
    
    handleHotUpdate(ctx) {
      // 处理语言文件热更新
      if (hmrHandler.isLanguageFile(ctx.file)) {
        return hmrHandler.handleLanguageUpdate(ctx);
      }
    },
    
    generateBundle() {
      // 生成语言包资源
      loader.generateLanguageBundles(this);
    }
  };
}
```

#### 代码转换器

```typescript
// packages/vite-plugin/src/transformer.ts
import { transformWithEsbuild } from 'vite';
import $ from 'gogocode';

export class I18nTransformer {
  private options: I18nPluginOptions;
  private config: ResolvedConfig;
  private keyMappings = new Map<string, string>();
  
  constructor(options: I18nPluginOptions, config: ResolvedConfig) {
    this.options = options;
    this.config = config;
  }
  
  shouldTransform(id: string): boolean {
    // 检查文件是否需要转换
    const include = this.options.include || ['**/*.{vue,tsx,ts,jsx,js}'];
    const exclude = this.options.exclude || ['node_modules/**'];
    
    return this.matchesPattern(id, include) && !this.matchesPattern(id, exclude);
  }
  
  async transform(code: string, id: string) {
    const mode = this.getTransformMode();
    
    if (mode === 'development') {
      return this.transformForDevelopment(code, id);
    } else {
      return this.transformForProduction(code, id);
    }
  }
  
  private transformForDevelopment(code: string, id: string) {
    // 开发模式：保持原文，添加映射信息
    const ast = $(code);
    const mappings: Array<{ key: string; text: string; line: number }> = [];
    
    ast.find('CallExpression').each((node) => {
      const callee = node.attr('callee');
      if (this.isTranslationFunction(callee)) {
        const textArg = node.attr('arguments.0');
        if (textArg && this.isChineseText(textArg.value)) {
          const key = this.generateKey(textArg.value, id);
          mappings.push({
            key,
            text: textArg.value,
            line: node.attr('loc.start.line')
          });
        }
      }
    });
    
    // 添加映射信息到模块
    const mappingCode = `
if (import.meta.hot) {
  import.meta.hot.data.i18nMappings = ${JSON.stringify(mappings)};
}
`;
    
    return {
      code: code + mappingCode,
      map: null
    };
  }
  
  private transformForProduction(code: string, id: string) {
    // 生产模式：转换为哈希调用
    const ast = $(code);
    
    ast.find('CallExpression').each((node) => {
      const callee = node.attr('callee');
      if (this.isTranslationFunction(callee)) {
        const textArg = node.attr('arguments.0');
        if (textArg && this.isChineseText(textArg.value)) {
          const key = this.generateKey(textArg.value, id);
          // 替换文本为哈希key
          node.attr('arguments.0.value', key);
        }
      }
    });
    
    return {
      code: ast.generate(),
      map: null
    };
  }
  
  private getTransformMode() {
    if (this.options.transformMode === 'auto') {
      return this.config.command === 'serve' ? 'development' : 'production';
    }
    return this.options.transformMode || 'auto';
  }
}
```

## 🎯 执行计划批准请求

以上是完整的技术实施方案，包括：

1. **详细的实施清单** - 分阶段的具体任务
2. **核心技术规范** - 每个组件的详细实现方案
3. **代码架构设计** - 完整的类和接口定义
4. **构建和发布流程** - CI/CD 和版本管理策略

**关键实施要点：**
- 采用 TypeScript 严格类型检查
- 基于 pnpm + Turborepo 的 monorepo 架构
- 智能哈希生成避免key冲突
- 渐进式代码转换保持开发体验
- 多级缓存提升运行时性能
- Vika 云端集成实现协作翻译

**请确认是否批准此实施方案，我将开始执行具体的开发任务。**
