# 教程 6：构建与优化

## 📚 本章目标

学习如何优化构建流程,减小包体积,提升运行性能。

**学完本章,你将掌握**:
- tsup 构建配置优化
- Tree-shaking 策略
- 类型声明生成
- 包体积分析和优化

**预计时间**: 1-2 小时

---

## 1. tsup 构建配置

### 基础配置

**tsup.config.ts**:
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  // 入口文件
  entry: ['src/index.ts'],
  
  // 输出格式
  format: ['cjs', 'esm'],
  
  // 目标环境
  target: 'node16',
  
  // 类型声明
  dts: true,
  
  // 清理输出目录
  clean: true,
  
  // Source Map
  sourcemap: true,
  
  // 代码分割
  splitting: false,
  
  // 压缩
  minify: false,
  
  // Tree-shaking
  treeshake: true,
  
  // 外部依赖
  external: ['gogocode', 'vue', 'react'],
});
```

### 多入口构建

```typescript
export default defineConfig([
  // 主包
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist',
  },
  
  // Vue 适配器
  {
    entry: ['src/vue.ts'],
    format: ['esm'],
    dts: true,
    external: ['vue'],
    outDir: 'dist',
  },
  
  // React 适配器
  {
    entry: ['src/react.ts'],
    format: ['esm'],
    dts: true,
    external: ['react'],
    outDir: 'dist',
  },
]);
```

---

## 2. Tree-shaking 优化

### package.json 配置

```json
{
  "name": "@translink/i18n-runtime",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./vue": {
      "types": "./dist/vue.d.ts",
      "import": "./dist/vue.js"
    },
    "./react": {
      "types": "./dist/react.d.ts",
      "import": "./dist/react.js"
    }
  }
}
```

### 代码优化

```typescript
// ❌ 不利于 Tree-shaking
export default {
  createI18n,
  useI18n,
  I18nEngine,
};

// ✅ 有利于 Tree-shaking
export { createI18n } from './vue.js';
export { useI18n } from './vue.js';
export { I18nEngine } from './core/i18n-engine.js';
```

---

## 3. 类型声明生成

### tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false
  },
  "exclude": ["**/*.test.ts", "**/__tests__/**"]
}
```

### 类型导出

```typescript
// types/index.ts
export interface I18nOptions {
  defaultLanguage: string;
  fallbackLanguage?: string;
  supportedLanguages: string[];
  resources: Record<string, Record<string, string>>;
}

export type TranslateFunction = (
  key: string,
  params?: Record<string, any>
) => string;
```

---

## 4. 包体积优化

### 1. 分析工具

```bash
# 安装 bundle-analyzer
pnpm add -D rollup-plugin-visualizer

# 生成分析报告
pnpm build -- --metafile
```

### 2. 减小依赖

```typescript
// ❌ 引入整个库
import _ from 'lodash';

// ✅ 只引入需要的函数
import merge from 'lodash/merge';
```

### 3. 动态导入

```typescript
// ❌ 静态导入
import ExcelJS from 'exceljs';

// ✅ 动态导入（按需加载）
const ExcelJS = await import('exceljs');
```

---

## 5. 性能优化

### 1. 缓存策略

```typescript
// LRU 缓存
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 移到最前面
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    this.cache.delete(key);
    if (this.cache.size >= this.maxSize) {
      // 删除最旧的
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

### 2. 批处理

```typescript
// 批量更新
class BatchUpdater {
  private pending: Set<Function> = new Set();
  private scheduled = false;
  
  schedule(callback: Function) {
    this.pending.add(callback);
    
    if (!this.scheduled) {
      this.scheduled = true;
      requestIdleCallback(() => this.flush());
    }
  }
  
  flush() {
    this.pending.forEach(cb => cb());
    this.pending.clear();
    this.scheduled = false;
  }
}
```

---

## 6. 测试和验证

### 单元测试

```typescript
import { describe, it, expect } from 'vitest';
import { I18nEngine } from '../src/core/i18n-engine';

describe('I18nEngine', () => {
  it('should translate correctly', () => {
    const engine = new I18nEngine({
      defaultLanguage: 'zh-CN',
      supportedLanguages: ['zh-CN', 'en-US'],
      resources: {
        'zh-CN': { hello: '你好' },
        'en-US': { hello: 'Hello' },
      },
    });
    
    expect(engine.translate('hello')).toBe('你好');
  });
});
```

### 性能测试

```typescript
import { bench } from 'vitest';

bench('translate performance', () => {
  engine.translate('hello');
}, { iterations: 10000 });
```

---

## 7. CI/CD 集成

### GitHub Actions

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install
        run: pnpm install
      
      - name: Type Check
        run: pnpm type-check
      
      - name: Test
        run: pnpm test
      
      - name: Build
        run: pnpm build
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

---

## 8. 小结

本章学习了:

✅ **tsup 配置** - 多入口、多格式输出  
✅ **Tree-shaking** - sideEffects、exports 字段  
✅ **类型声明** - .d.ts 生成和导出  
✅ **体积优化** - 分析工具、减小依赖  
✅ **性能优化** - 缓存、批处理  
✅ **CI/CD** - 自动化构建和测试

---

## 📚 完成教程系列

恭喜！你已完成所有教程，掌握了：

1. Monorepo 架构设计
2. CLI 工具开发
3. Runtime 运行时实现
4. Vite 插件开发
5. 插件系统设计
6. 构建与优化

**下一步建议**:
- 查看 [API 文档](../api/)
- 阅读 [最佳实践](../best-practices.md)
- 参与 [项目贡献](https://github.com/lynncen/translink-i18n)

---

## 📚 扩展阅读

- [tsup 文档](https://tsup.egoist.dev/)
- [Vitest 文档](https://vitest.dev/)
- [性能优化指南](https://web.dev/performance/)
