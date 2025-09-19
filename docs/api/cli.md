# CLI API 文档

`@translink/i18n-cli` 提供了完整的命令行工具，用于 i18n 项目的管理和维护。

## 📦 安装

```bash
# 全局安装
npm install -g @translink/i18n-cli

# 项目本地安装
npm install --save-dev @translink/i18n-cli
```

## 🚀 基本使用

```bash
# 查看帮助
translink-i18n --help

# 查看版本
translink-i18n --version

# 初始化项目
translink-i18n init

# 提取文本
translink-i18n extract

# 构建语言文件
translink-i18n build
```

## 📋 Commands

### init

初始化 i18n 项目配置。

```bash
translink-i18n init [options]
```

#### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--config-file` | `string` | `i18n.config.ts` | 配置文件路径 |
| `--template` | `string` | `default` | 配置模板类型 |
| `--force` | `boolean` | `false` | 强制覆盖已存在的配置 |

#### 示例

```bash
# 使用默认配置初始化
translink-i18n init

# 指定配置文件路径
translink-i18n init --config-file ./config/i18n.config.ts

# 使用 Vue 模板
translink-i18n init --template vue

# 强制覆盖现有配置
translink-i18n init --force
```

#### 配置模板

| 模板 | 描述 | 适用场景 |
|------|------|----------|
| `default` | 通用配置 | 大多数项目 |
| `vue` | Vue 项目优化配置 | Vue 3 项目 |
| `react` | React 项目优化配置 | React 项目 |
| `minimal` | 最小化配置 | 简单项目 |

### extract

从源代码中提取需要翻译的文本。

```bash
translink-i18n extract [patterns...] [options]
```

#### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `patterns` | `string[]` | 文件匹配模式 |

#### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--config` | `string` | `i18n.config.ts` | 配置文件路径 |
| `--output` | `string` | - | 输出文件路径 |
| `--format` | `string` | `json` | 输出格式 |
| `--dry-run` | `boolean` | `false` | 预览模式，不写入文件 |
| `--verbose` | `boolean` | `false` | 详细输出 |

#### 示例

```bash
# 使用配置文件中的模式提取
translink-i18n extract

# 指定文件模式
translink-i18n extract "src/**/*.{vue,ts,js}"

# 预览提取结果
translink-i18n extract --dry-run

# 输出到指定文件
translink-i18n extract --output ./extracted-texts.json
```

#### 支持的文件类型

| 文件类型 | 扩展名 | 提取方式 |
|----------|--------|----------|
| Vue 单文件组件 | `.vue` | 模板和脚本中的 `t()` 和 `$tsl()` |
| TypeScript | `.ts` | AST 解析提取函数调用 |
| JavaScript | `.js` | AST 解析提取函数调用 |
| JSX/TSX | `.jsx`, `.tsx` | JSX 表达式中的翻译函数 |

### build

构建最终的语言文件。

```bash
translink-i18n build [options]
```

#### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--config` | `string` | `i18n.config.ts` | 配置文件路径 |
| `--output-dir` | `string` | - | 输出目录 |
| `--languages` | `string[]` | - | 指定构建的语言 |
| `--format` | `string` | `json` | 输出格式 |
| `--minify` | `boolean` | `false` | 压缩输出 |
| `--watch` | `boolean` | `false` | 监听模式 |

#### 示例

```bash
# 构建所有语言
translink-i18n build

# 构建指定语言
translink-i18n build --languages zh-CN,en-US

# 输出到指定目录
translink-i18n build --output-dir ./dist/locales

# 压缩输出
translink-i18n build --minify

# 监听模式
translink-i18n build --watch
```

#### 输出格式

| 格式 | 扩展名 | 描述 |
|------|--------|------|
| `json` | `.json` | 标准 JSON 格式 |
| `js` | `.js` | JavaScript 模块 |
| `ts` | `.ts` | TypeScript 模块 |
| `yaml` | `.yaml` | YAML 格式 |

### push

将本地翻译推送到云端。

```bash
translink-i18n push [options]
```

#### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--config` | `string` | `i18n.config.ts` | 配置文件路径 |
| `--force` | `boolean` | `false` | 强制覆盖云端数据 |
| `--dry-run` | `boolean` | `false` | 预览模式 |
| `--languages` | `string[]` | - | 指定推送的语言 |

#### 示例

```bash
# 推送所有语言
translink-i18n push

# 推送指定语言
translink-i18n push --languages zh-CN

# 预览推送内容
translink-i18n push --dry-run

# 强制覆盖
translink-i18n push --force
```

### pull

从云端拉取翻译到本地。

```bash
translink-i18n pull [options]
```

#### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--config` | `string` | `i18n.config.ts` | 配置文件路径 |
| `--force` | `boolean` | `false` | 强制覆盖本地数据 |
| `--languages` | `string[]` | - | 指定拉取的语言 |
| `--backup` | `boolean` | `true` | 备份本地文件 |

#### 示例

```bash
# 拉取所有语言
translink-i18n pull

# 拉取指定语言
translink-i18n pull --languages en-US

# 不备份本地文件
translink-i18n pull --no-backup

# 强制覆盖
translink-i18n pull --force
```

### analyze

分析项目的 i18n 使用情况。

```bash
translink-i18n analyze [options]
```

#### 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--config` | `string` | `i18n.config.ts` | 配置文件路径 |
| `--output` | `string` | - | 输出报告文件 |
| `--format` | `string` | `console` | 报告格式 |
| `--detailed` | `boolean` | `false` | 详细报告 |

#### 示例

```bash
# 控制台输出分析结果
translink-i18n analyze

# 输出详细报告
translink-i18n analyze --detailed

# 输出到文件
translink-i18n analyze --output ./i18n-report.json --format json
```

#### 分析报告内容

- 翻译覆盖率统计
- 未使用的翻译键
- 缺失的翻译
- 文件使用统计
- 性能建议

## 🔧 Configuration

### I18nConfig

主配置接口，定义了所有 CLI 工具的行为。

```typescript
interface I18nConfig {
  extract: ExtractConfig;
  hash: HashConfig;
  languages: LanguageConfig;
  output: OutputConfig;
  vika?: VikaConfig;
  plugins?: PluginConfig[];
}
```

### ExtractConfig

文本提取配置。

```typescript
interface ExtractConfig {
  /** 文件匹配模式 */
  patterns: string[];
  /** 排除模式 */
  exclude: string[];
  /** 翻译函数名称 */
  functions: string[];
  /** 支持的文件扩展名 */
  extensions: string[];
}
```

#### 示例

```typescript
{
  extract: {
    patterns: [
      'src/**/*.{vue,ts,js,tsx,jsx}',
      'components/**/*.vue'
    ],
    exclude: [
      'node_modules',
      'dist',
      '**/*.test.{ts,js}',
      '**/*.spec.{ts,js}'
    ],
    functions: ['t', '$tsl', 'i18n.t'],
    extensions: ['.vue', '.ts', '.js', '.tsx', '.jsx']
  }
}
```

### HashConfig

哈希生成配置。

```typescript
interface HashConfig {
  /** 哈希算法 */
  algorithm: 'md5' | 'sha1' | 'sha256';
  /** 哈希长度 */
  length: number;
  /** 是否包含上下文 */
  includeContext: boolean;
  /** 上下文字段 */
  contextFields: Array<'filePath' | 'componentName' | 'functionName'>;
}
```

#### 示例

```typescript
{
  hash: {
    algorithm: 'md5',
    length: 8,
    includeContext: true,
    contextFields: ['componentName', 'functionName']
  }
}
```

### LanguageConfig

语言配置。

```typescript
interface LanguageConfig {
  /** 默认语言 */
  default: string;
  /** 支持的语言列表 */
  supported: string[];
  /** 回退语言 */
  fallback: string;
}
```

#### 示例

```typescript
{
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
    fallback: 'en-US'
  }
}
```

### OutputConfig

输出配置。

```typescript
interface OutputConfig {
  /** 输出目录 */
  directory: string;
  /** 输出格式 */
  format: 'json' | 'js' | 'ts' | 'yaml';
  /** 是否按命名空间分割 */
  splitByNamespace: boolean;
  /** 是否扁平化键名 */
  flattenKeys: boolean;
}
```

#### 示例

```typescript
{
  output: {
    directory: 'src/locales',
    format: 'json',
    splitByNamespace: false,
    flattenKeys: false
  }
}
```

### VikaConfig

Vika 云端同步配置。

```typescript
interface VikaConfig {
  /** API 密钥 */
  apiKey: string;
  /** 数据表 ID */
  datasheetId: string;
  /** 自动同步 */
  autoSync: boolean;
  /** 同步间隔（毫秒） */
  syncInterval: number;
}
```

#### 示例

```typescript
{
  vika: {
    apiKey: process.env.VIKA_API_KEY!,
    datasheetId: 'dstXXXXXXXXXXXXXX',
    autoSync: false,
    syncInterval: 30 * 60 * 1000 // 30分钟
  }
}
```

## 🏗️ Core Classes

### ASTExtractor

AST 文本提取器，负责从源代码中提取翻译文本。

```typescript
class ASTExtractor {
  constructor(
    config: ExtractConfig,
    hashGenerator: HashGenerator
  );

  /** 从项目中提取文本 */
  extractFromProject(): Promise<ExtractionResult[]>;

  /** 从单个文件提取文本 */
  extractFromFile(filePath: string): Promise<ExtractionResult[]>;

  /** 从代码字符串提取文本 */
  extractFromCode(
    code: string, 
    filePath: string, 
    language: string
  ): ExtractionResult[];
}
```

#### ExtractionResult

```typescript
interface ExtractionResult {
  /** 提取的文本 */
  text: string;
  /** 生成的键 */
  key: string;
  /** 文件路径 */
  filePath: string;
  /** 行号 */
  line: number;
  /** 列号 */
  column: number;
  /** 上下文信息 */
  context?: ExtractionContext;
}
```

#### ExtractionContext

```typescript
interface ExtractionContext {
  /** 文件路径 */
  filePath?: string;
  /** 组件名称 */
  componentName?: string;
  /** 函数名称 */
  functionName?: string;
}
```

### HashGenerator

哈希生成器，为提取的文本生成唯一键。

```typescript
class HashGenerator {
  constructor(config: HashConfig);

  /** 生成哈希 */
  generate(
    content: string, 
    context?: ExtractionContext
  ): string;

  /** 验证哈希 */
  validate(hash: string): boolean;
}
```

### VikaClient

Vika 云端客户端，处理与 Vika 平台的数据同步。

```typescript
class VikaClient {
  constructor(config: VikaConfig);

  /** 推送翻译数据 */
  push(
    translations: Record<string, any>, 
    language: string
  ): Promise<void>;

  /** 拉取翻译数据 */
  pull(language: string): Promise<Record<string, any>>;

  /** 获取支持的语言列表 */
  getLanguages(): Promise<string[]>;

  /** 测试连接 */
  testConnection(): Promise<boolean>;
}
```

### ConfigManager

配置管理器，负责加载和验证配置文件。

```typescript
class ConfigManager {
  constructor(configPath: string);

  /** 加载配置 */
  load(): Promise<I18nConfig>;

  /** 验证配置 */
  validate(config: I18nConfig): ValidationResult;

  /** 保存配置 */
  save(config: I18nConfig): Promise<void>;
}
```

#### ValidationResult

```typescript
interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors: string[];
  /** 警告信息 */
  warnings: string[];
}
```

## 🔌 Plugin System

### PluginConfig

插件配置接口。

```typescript
interface PluginConfig {
  /** 插件名称 */
  name: string;
  /** 插件选项 */
  options?: Record<string, any>;
}
```

### Plugin

插件基类。

```typescript
abstract class Plugin {
  abstract name: string;

  /** 插件初始化 */
  abstract init(config: I18nConfig): Promise<void>;

  /** 处理提取结果 */
  processExtractionResults?(
    results: ExtractionResult[]
  ): Promise<ExtractionResult[]>;

  /** 处理构建输出 */
  processBuildOutput?(
    output: Record<string, any>
  ): Promise<Record<string, any>>;
}
```

### 内置插件

#### DeduplicationPlugin

去重插件，移除重复的翻译条目。

```typescript
class DeduplicationPlugin extends Plugin {
  name = 'deduplication';
  
  processExtractionResults(
    results: ExtractionResult[]
  ): Promise<ExtractionResult[]>;
}
```

#### ValidationPlugin

验证插件，检查翻译的完整性和一致性。

```typescript
class ValidationPlugin extends Plugin {
  name = 'validation';
  
  processBuildOutput(
    output: Record<string, any>
  ): Promise<Record<string, any>>;
}
```

## 📊 Error Handling

### CLIError

CLI 错误基类。

```typescript
class CLIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  );
}
```

### 错误代码

| 代码 | 描述 |
|------|------|
| `CONFIG_NOT_FOUND` | 配置文件未找到 |
| `CONFIG_INVALID` | 配置文件无效 |
| `EXTRACTION_FAILED` | 文本提取失败 |
| `BUILD_FAILED` | 构建失败 |
| `VIKA_CONNECTION_FAILED` | Vika 连接失败 |
| `VIKA_AUTH_FAILED` | Vika 认证失败 |

## 🧪 Testing

### MockExtractor

用于测试的模拟提取器。

```typescript
class MockExtractor extends ASTExtractor {
  setMockResults(results: ExtractionResult[]): void;
  clearMockResults(): void;
}
```

### TestUtils

测试工具函数。

```typescript
namespace TestUtils {
  /** 创建测试配置 */
  function createTestConfig(overrides?: Partial<I18nConfig>): I18nConfig;
  
  /** 创建测试提取结果 */
  function createTestExtractionResult(
    overrides?: Partial<ExtractionResult>
  ): ExtractionResult;
  
  /** 验证提取结果 */
  function validateExtractionResults(
    results: ExtractionResult[]
  ): boolean;
}
```

## 📝 Examples

### 基本配置示例

```typescript
// i18n.config.ts
import { defineConfig } from '@translink/i18n-cli';

export default defineConfig({
  extract: {
    patterns: ['src/**/*.{vue,ts,js}'],
    exclude: ['node_modules', 'dist'],
    functions: ['t', '$tsl'],
    extensions: ['.vue', '.ts', '.js']
  },
  hash: {
    algorithm: 'md5',
    length: 8,
    includeContext: false,
    contextFields: []
  },
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
    fallback: 'en-US'
  },
  output: {
    directory: 'src/locales',
    format: 'json',
    splitByNamespace: false,
    flattenKeys: false
  }
});
```

### 高级配置示例

```typescript
// i18n.config.ts
import { defineConfig } from '@translink/i18n-cli';

export default defineConfig({
  extract: {
    patterns: [
      'src/**/*.{vue,ts,js,tsx,jsx}',
      'components/**/*.vue',
      'pages/**/*.{vue,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
      '**/*.test.{ts,js}',
      '**/*.spec.{ts,js}',
      'src/vendor/**'
    ],
    functions: ['t', '$tsl', 'i18n.t', 'translate'],
    extensions: ['.vue', '.ts', '.js', '.tsx', '.jsx']
  },
  hash: {
    algorithm: 'sha256',
    length: 12,
    includeContext: true,
    contextFields: ['componentName', 'functionName']
  },
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'fr-FR'],
    fallback: 'en-US'
  },
  output: {
    directory: 'locales',
    format: 'json',
    splitByNamespace: true,
    flattenKeys: false
  },
  vika: {
    apiKey: process.env.VIKA_API_KEY!,
    datasheetId: process.env.VIKA_DATASHEET_ID!,
    autoSync: true,
    syncInterval: 15 * 60 * 1000 // 15分钟
  },
  plugins: [
    {
      name: 'deduplication',
      options: {
        strategy: 'merge'
      }
    },
    {
      name: 'validation',
      options: {
        strictMode: true,
        checkInterpolation: true
      }
    }
  ]
});
```

### 编程式使用示例

```typescript
import { 
  ASTExtractor, 
  HashGenerator, 
  ConfigManager,
  VikaClient 
} from '@translink/i18n-cli';

// 加载配置
const configManager = new ConfigManager('./i18n.config.ts');
const config = await configManager.load();

// 创建提取器
const hashGenerator = new HashGenerator(config.hash);
const extractor = new ASTExtractor(config.extract, hashGenerator);

// 提取文本
const results = await extractor.extractFromProject();
console.log(`提取到 ${results.length} 个文本`);

// 同步到云端
if (config.vika) {
  const vikaClient = new VikaClient(config.vika);
  await vikaClient.push(results, 'zh-CN');
}
```

## 🔗 相关链接

- [Runtime API](./runtime.md)
- [Vite Plugin API](./vite-plugin.md)
- [TypeScript 类型定义](./typescript.md)
- [使用指南](../guides/README.md)
- [示例项目](../../examples/README.md)
