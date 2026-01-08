# 教程 4：Vite 插件开发

## 📚 本章目标

学习如何开发 Vite 插件,实现虚拟模块、HMR 热更新和代码转换等高级功能。

**学完本章,你将掌握**:
- Vite 插件机制和生命周期
- 虚拟模块系统实现
- HMR 热更新机制
- 代码转换和优化

**预计时间**: 2-3 小时

---

## 1. Vite 插件机制

### 插件接口

```typescript
import type { Plugin } from 'vite';

export default function i18nPlugin(options: PluginOptions): Plugin {
  return {
    name: 'vite-plugin-i18n',
    
    // 配置解析
    config(config) {
      return {
        // 修改配置
      };
    },
    
    // 配置完成
    configResolved(resolvedConfig) {
      // 保存配置
    },
    
    // 服务器启动
    configureServer(server) {
      // 配置开发服务器
    },
    
    // 模块解析
    resolveId(id) {
      if (id.startsWith('virtual:i18n')) {
        return `\0${id}`;
      }
    },
    
    // 模块加载
    load(id) {
      if (id.startsWith('\0virtual:i18n')) {
        return generateVirtualModule(id);
      }
    },
    
    // 代码转换
    transform(code, id) {
      if (!/\.(vue|jsx|tsx)$/.test(id)) {
        return null;
      }
      
      return transformCode(code, id);
    },
    
    // HMR 更新
    handleHotUpdate(ctx) {
      if (ctx.file.includes('/locales/')) {
        // 触发 HMR
        return ctx.modules;
      }
    },
  };
}
```

---

## 2. 虚拟模块系统

### 创建虚拟模块

```typescript
const VIRTUAL_PREFIX = 'virtual:i18n/';

export function resolveId(id: string): string | void {
  if (id.startsWith(VIRTUAL_PREFIX)) {
    // 返回 \0 前缀表示虚拟模块
    return `\0${id}`;
  }
}

export function load(id: string): string | void {
  if (!id.startsWith('\0virtual:i18n/')) {
    return;
  }
  
  // 解析语言
  const lang = id.replace('\0virtual:i18n/', '');
  
  // 生成模块代码
  return `
    import resources from './locales/${lang}.json';
    export default resources;
  `;
}
```

### 使用虚拟模块

```typescript
// 应用代码中
import zhCN from 'virtual:i18n/zh-CN';
import enUS from 'virtual:i18n/en-US';

const i18n = createI18n({
  resources: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});
```

---

## 3. HMR 热更新

### 监听文件变化

```typescript
export function handleHotUpdate(ctx: HmrContext) {
  const { file, server, modules } = ctx;
  
  // 检查是否是语言文件
  if (!file.includes('/locales/')) {
    return;
  }
  
  // 提取语言
  const lang = extractLanguage(file);
  
  // 发送自定义 HMR 事件
  server.ws.send({
    type: 'custom',
    event: 'i18n-update',
    data: {
      lang,
      file,
    },
  });
  
  // 返回受影响的模块
  return modules;
}
```

### 客户端 HMR 处理

```typescript
// 注入到客户端
if (import.meta.hot) {
  import.meta.hot.on('i18n-update', (data) => {
    const { lang, file } = data;
    
    // 重新加载语言包
    fetch(`/locales/${lang}.json`)
      .then(res => res.json())
      .then(resources => {
        i18n.addResources(lang, resources);
        // 触发界面更新
      });
  });
}
```

---

## 4. 代码转换

### 转换 $tsl() 调用

```typescript
import MagicString from 'magic-string';

export function transform(code: string, id: string) {
  const s = new MagicString(code);
  
  // 正则匹配 $tsl('文本')
  const pattern = /\$tsl\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  
  let match;
  while ((match = pattern.exec(code)) !== null) {
    const text = match[1];
    const hash = generateHash(text);
    
    // 替换为 t('hash')
    s.overwrite(
      match.index,
      match.index + match[0].length,
      `t('${hash}')`
    );
  }
  
  return {
    code: s.toString(),
    map: s.generateMap(),
  };
}
```

---

## 5. 配置管理

### 配置文件查找

```typescript
export class ConfigManager {
  async findConfig(root: string): Promise<string | null> {
    const configFiles = [
      'translink.config.ts',
      'translink.config.js',
    ];
    
    for (const file of configFiles) {
      const configPath = resolve(root, file);
      if (existsSync(configPath)) {
        return configPath;
      }
    }
    
    return null;
  }
  
  async loadConfig(configPath: string): Promise<I18nConfig> {
    // 使用 Vite 的模块加载
    const module = await import(configPath);
    return module.default || module;
  }
}
```

---

## 6. 构建优化

### Tree-shaking 未使用的翻译

```typescript
export function renderChunk(code: string, chunk: RenderedChunk) {
  // 分析使用的翻译 key
  const usedKeys = new Set<string>();
  const pattern = /t\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  
  let match;
  while ((match = pattern.exec(code)) !== null) {
    usedKeys.add(match[1]);
  }
  
  // 过滤语言包
  const filteredResources = filterResources(resources, usedKeys);
  
  return {
    code: generateOptimizedCode(filteredResources),
    map: null,
  };
}
```

---

## 7. 小结

本章学习了:

✅ **Vite 插件机制** - 生命周期钩子  
✅ **虚拟模块** - 动态模块生成  
✅ **HMR** - 热更新实现  
✅ **代码转换** - MagicString 使用  
✅ **构建优化** - Tree-shaking

### 下一步

👉 [教程 5：插件系统设计](./05-plugin-system.md)

---

## 📚 扩展阅读

- [Vite 插件 API](https://vitejs.dev/guide/api-plugin.html)
- [Rollup 插件开发](https://rollupjs.org/guide/en/#plugin-development)
