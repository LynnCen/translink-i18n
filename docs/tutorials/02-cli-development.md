# 教程 2：CLI 工具开发

## 📚 本章目标

学习如何开发一个功能完整的命令行工具，包括文本提取、哈希生成、Excel 导入导出等核心功能。

**学完本章，你将掌握**：

- Commander.js 命令系统设计
- AST 文本提取原理和实现
- 哈希生成算法和冲突处理
- Excel/CSV 文件操作

**预计时间**：2-3 小时

---

## 1. CLI 架构设计

### 整体架构

```
@translink/i18n-cli/
├── src/
│   ├── index.ts              # 入口文件
│   ├── commands/             # 命令实现
│   │   ├── init.ts           # 初始化
│   │   ├── extract.ts        # 提取文本
│   │   ├── build.ts          # 构建
│   │   ├── export.ts         # 导出
│   │   ├── import.ts         # 导入
│   │   └── analyze.ts        # 分析
│   ├── extractors/           # 提取器
│   │   └── ast-extractor.ts  # AST 提取
│   ├── generators/           # 生成器
│   │   └── hash-generator.ts # 哈希生成
│   ├── plugins/              # 插件系统
│   │   ├── types.ts          # 插件接口
│   │   ├── loader.ts         # 插件加载
│   │   └── manager.ts        # 插件管理
│   ├── utils/                # 工具函数
│   │   ├── config.ts         # 配置管理
│   │   ├── logger.ts         # 日志输出
│   │   └── table.ts          # 表格显示
│   └── types/                # 类型定义
│       └── config.ts         # 配置类型
└── package.json
```

### 设计原则

1. **命令模式**：每个命令独立文件
2. **职责分离**：提取、生成、IO 分开
3. **插件化**：核心功能可扩展
4. **类型安全**：完整的 TypeScript 类型

---

## 2. Commander.js 命令系统

### 基础用法

**index.ts**:

```typescript
import { Command } from 'commander';
import { initCmd } from './commands/init.js';
import { extractCmd } from './commands/extract.js';
import { buildCmd } from './commands/build.js';

const program = new Command();

// 程序信息
program.name('translink').description('TransLink I18n CLI').version('1.0.0');

// 注册命令
program.addCommand(initCmd);
program.addCommand(extractCmd);
program.addCommand(buildCmd);

// 解析参数
program.parse(process.argv);
```

### 命令定义

**commands/extract.ts**:

```typescript
import { Command } from 'commander';

export const extractCmd = new Command('extract')
  .description('提取翻译文本')
  .option('-c, --config <path>', '配置文件路径')
  .option('-v, --verbose', '显示详细输出')
  .option('--dry-run', '模拟运行')
  .action(async options => {
    await extractCommand(options);
  });

interface ExtractOptions {
  config?: string;
  verbose?: boolean;
  dryRun?: boolean;
}

async function extractCommand(options: ExtractOptions) {
  // 命令实现
  logger.title('提取翻译文本');

  // 加载配置
  const config = await configManager.loadConfig(options.config);

  // 执行提取
  const results = await extractor.extractFromProject();

  // 输出结果
  logger.success(`✓ 提取了 ${results.length} 个文本`);
}
```

### 高级特性

#### 1. 命令分组

```typescript
program
  .addCommand(initCmd)
  .addCommand(extractCmd)
  .addCommand(buildCmd)
  .addHelpText(
    'after',
    `
Examples:
  $ translink init          初始化配置
  $ translink extract       提取翻译文本
  $ translink build         构建语言包
  `
  );
```

#### 2. 全局选项

```typescript
program
  .option('--debug', '启用调试模式')
  .option('--no-color', '禁用颜色输出')
  .hook('preAction', thisCommand => {
    const options = thisCommand.opts();
    if (options.debug) {
      logger.setLevel('debug');
    }
  });
```

#### 3. 命令别名

```typescript
export const extractCmd = new Command('extract')
  .alias('e') // translink e
  .description('提取翻译文本');
```

---

## 3. AST 文本提取

### 什么是 AST？

**AST (Abstract Syntax Tree)** - 抽象语法树，是源代码的树形表示。

**示例**：

```javascript
// 源代码
const text = $tsl('你好');

// AST 表示
{
  type: "VariableDeclaration",
  declarations: [{
    type: "VariableDeclarator",
    id: { type: "Identifier", name: "text" },
    init: {
      type: "CallExpression",
      callee: { type: "Identifier", name: "$tsl" },
      arguments: [{
        type: "StringLiteral",
        value: "你好"
      }]
    }
  }]
}
```

### 使用 GoGoCode

**为什么选择 GoGoCode？**

- 统一的 API（支持 JS/TS/Vue/JSX）
- 简单的选择器语法
- 良好的 TypeScript 支持

**基础用法**：

```typescript
import $ from 'gogocode';

const code = `
  const text = $tsl('你好');
  const msg = t('世界');
`;

// 解析代码
const ast = $(code);

// 查找函数调用
ast.find('CallExpression').each(node => {
  const callee = node.attr('callee.name');
  if (callee === '$tsl' || callee === 't') {
    const arg = node.attr('arguments.0.value');
    console.log('找到翻译文本:', arg);
  }
});
```

### AST Extractor 实现

**ast-extractor.ts**:

```typescript
import $ from 'gogocode';
import { readFileSync } from 'fs';
import { glob } from 'glob';

export class ASTExtractor {
  private config: ExtractConfig;
  private hashGenerator: HashGenerator;

  constructor(config: ExtractConfig, hashGenerator: HashGenerator) {
    this.config = config;
    this.hashGenerator = hashGenerator;
  }

  /**
   * 从项目中提取所有翻译文本
   */
  async extractFromProject(
    cwd: string = process.cwd()
  ): Promise<ExtractResult[]> {
    // 1. 扫描文件
    const files = await this.scanFiles(cwd);

    // 2. 提取文本
    const results: ExtractResult[] = [];
    for (const filePath of files) {
      const fileResults = await this.extractFromFile(filePath, cwd);
      results.push(...fileResults);
    }

    // 3. 去重
    return this.deduplicateResults(results);
  }

  /**
   * 从单个文件提取
   */
  private async extractFromFile(
    filePath: string,
    cwd: string
  ): Promise<ExtractResult[]> {
    const content = readFileSync(filePath, 'utf-8');
    const fileExtension = this.getFileExtension(filePath);

    // 根据文件类型选择解析策略
    switch (fileExtension) {
      case '.vue':
        return this.extractFromVueFile(content, filePath);
      case '.tsx':
      case '.jsx':
        return this.extractFromJSXFile(content, filePath);
      case '.ts':
      case '.js':
        return this.extractFromJSFile(content, filePath);
      default:
        return [];
    }
  }

  /**
   * 提取 Vue 文件
   */
  private extractFromVueFile(
    content: string,
    filePath: string
  ): ExtractResult[] {
    const results: ExtractResult[] = [];

    // 方法 1: 使用正则提取 <template> 内容
    const templateMatch = content.match(
      /<template[^>]*>([\s\S]*?)<\/template>/
    );
    if (templateMatch && templateMatch[1]) {
      const templateContent = templateMatch[1];
      const templateResults = this.extractFromTemplateContent(
        templateContent,
        filePath
      );
      results.push(...templateResults);
    }

    // 方法 2: 提取 <script> 内容
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (scriptMatch && scriptMatch[1]) {
      const scriptContent = scriptMatch[1];
      const scriptResults = this.extractFromJSContent(scriptContent, filePath);
      results.push(...scriptResults);
    }

    return results;
  }

  /**
   * 从模板内容提取（正则方式）
   */
  private extractFromTemplateContent(
    templateContent: string,
    filePath: string
  ): ExtractResult[] {
    const results: ExtractResult[] = [];

    // 正则表达式模式
    const patterns = [
      // {{ $tsl('文本') }}
      /\{\{[^}]*?\$tsl\s*\(\s*['"`]([^'"`]+)['"`]\s*\)[^}]*?\}\}/g,
      // :prop="$tsl('文本')"
      /[:@]\w+\s*=\s*["`]\s*\$tsl\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*["`]/g,
      // v-t="文本"
      /v-t\s*=\s*['"`]([^'"`]+)['"`]/g,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(templateContent)) !== null) {
        const text = match[1];
        if (this.isChineseText(text)) {
          const key = this.hashGenerator.generate(text, {
            filePath,
            componentName: this.extractComponentName(filePath),
            functionName: 'template',
          });

          results.push({
            key,
            text,
            filePath,
            line: this.getLineNumber(templateContent, match.index || 0),
            context: {
              componentName: this.extractComponentName(filePath),
              functionName: 'template',
            },
          });
        }
      }
    });

    return results;
  }

  /**
   * 从 JavaScript 内容提取（AST 方式）
   */
  private extractFromJSContent(
    content: string,
    filePath: string
  ): ExtractResult[] {
    try {
      const ast = $(content);
      return this.extractFromAST(ast, filePath);
    } catch (error) {
      logger.debug(`解析 JS 内容失败 ${filePath}: ${error}`);
      return [];
    }
  }

  /**
   * 从 AST 中提取翻译函数调用
   */
  private extractFromAST(ast: any, filePath: string): ExtractResult[] {
    const results: ExtractResult[] = [];

    // 查找所有函数调用
    ast.find('CallExpression').each((node: any) => {
      const callee = node.attr('callee');
      const functionName = this.getFunctionName(callee);

      // 检查是否是翻译函数
      if (this.config.functions.includes(functionName)) {
        const args = node.attr('arguments');
        const textArg = args?.[0];

        if (textArg && this.isStringLiteral(textArg)) {
          const text = textArg.value;

          if (this.isChineseText(text)) {
            const context = this.extractContext(node, filePath);
            const key = this.hashGenerator.generate(text, context);

            results.push({
              key,
              text,
              filePath,
              line: node.attr('loc.start.line') || 0,
              column: node.attr('loc.start.column') || 0,
              context: {
                componentName: context.componentName,
                functionName: context.functionName,
              },
            });
          }
        }
      }
    });

    return results;
  }

  /**
   * 判断是否包含中文
   */
  private isChineseText(text: string): boolean {
    return /[\u4e00-\u9fa5]/.test(text);
  }

  /**
   * 提取上下文信息
   */
  private extractContext(node: any, filePath: string): HashContext {
    return {
      filePath,
      componentName: this.extractComponentName(filePath),
      functionName: this.extractFunctionName(node),
    };
  }
}
```

### 关键技术点

#### 1. 文件扫描

```typescript
private async scanFiles(cwd: string): Promise<string[]> {
  const allFiles: string[] = [];

  for (const pattern of this.config.patterns) {
    const files = await glob(pattern, {
      cwd,
      ignore: this.config.exclude,
      absolute: true,
    });
    allFiles.push(...files);
  }

  // 去重并过滤扩展名
  const uniqueFiles = [...new Set(allFiles)];
  return uniqueFiles.filter(file =>
    this.config.extensions.some(ext => file.endsWith(ext))
  );
}
```

#### 2. Vue 文件处理

**两种策略**：

- **模板部分**：使用正则表达式（GoGoCode 对 Vue 模板支持有限）
- **脚本部分**：使用 AST 解析（精确、可靠）

#### 3. 去重处理

```typescript
private deduplicateResults(results: ExtractResult[]): ExtractResult[] {
  const seen = new Map<string, ExtractResult>();

  for (const result of results) {
    const existing = seen.get(result.key);
    if (!existing || result.text.length > existing.text.length) {
      seen.set(result.key, result);
    }
  }

  return Array.from(seen.values());
}
```

---

## 4. 哈希生成算法

### 为什么使用哈希？

**传统方案**：

```json
{
  "welcome_message": "欢迎使用",
  "login_button": "登录"
}
```

**问题**：

- ❌ Key 需要手动维护
- ❌ 重构时 Key 可能失效
- ❌ 多人协作容易冲突

**哈希方案**：

```json
{
  "12345678": "欢迎使用",
  "87654321": "登录"
}
```

**优势**：

- ✅ 自动生成，无需维护
- ✅ 基于内容，重构友好
- ✅ 冲突概率极低

### 哈希生成器实现

**hash-generator.ts**:

```typescript
import crypto from 'crypto';

export class HashGenerator {
  private config: HashConfig;
  private collisionMap: Map<string, string> = new Map();
  private stats = {
    totalHashes: 0,
    collisions: 0,
  };

  constructor(config: HashConfig) {
    this.config = config;
  }

  /**
   * 生成哈希键
   */
  generate(text: string, context?: HashContext): string {
    // 1. 构建输入内容
    const input = this.config.includeContext
      ? this.buildInputWithContext(text, context)
      : text;

    // 2. 生成哈希
    const hash = this.generateContentHash(
      input,
      this.config.algorithm,
      this.config.length,
      this.config.numericOnly
    );

    // 3. 检测冲突
    if (this.collisionMap.has(hash)) {
      const existing = this.collisionMap.get(hash)!;
      if (existing !== text) {
        this.stats.collisions++;
        logger.warn(`哈希冲突: ${hash}`);
        logger.warn(`  现有: ${existing}`);
        logger.warn(`  新增: ${text}`);

        // 冲突解决：增加长度重新生成
        return this.generate(text, context);
      }
    }

    // 4. 记录哈希
    this.collisionMap.set(hash, text);
    this.stats.totalHashes++;

    return hash;
  }

  /**
   * 生成内容哈希
   */
  private generateContentHash(
    content: string,
    algorithm: string,
    length: number,
    numericOnly: boolean
  ): string {
    // 1. 计算哈希值
    const hash = crypto
      .createHash(algorithm)
      .update(content, 'utf-8')
      .digest('hex')
      .substring(0, length * 2); // 预留空间

    // 2. 转换为纯数字（如果需要）
    if (numericOnly) {
      // 将十六进制转换为十进制数字
      let numericHash = parseInt(hash, 16).toString();

      // 确保长度
      if (numericHash.length > length) {
        numericHash = numericHash.substring(0, length);
      } else if (numericHash.length < length) {
        numericHash = numericHash.padStart(length, '0');
      }

      return numericHash;
    }

    return hash.substring(0, length);
  }

  /**
   * 构建包含上下文的输入
   */
  private buildInputWithContext(text: string, context?: HashContext): string {
    if (!context) {
      return text;
    }

    const parts = [text];

    if (
      this.config.contextFields?.includes('componentName') &&
      context.componentName
    ) {
      parts.push(context.componentName);
    }

    if (
      this.config.contextFields?.includes('functionName') &&
      context.functionName
    ) {
      parts.push(context.functionName);
    }

    if (this.config.contextFields?.includes('filePath') && context.filePath) {
      parts.push(context.filePath);
    }

    return parts.join('|');
  }

  /**
   * 获取冲突统计
   */
  getCollisionStats() {
    return {
      ...this.stats,
      collisionRate:
        this.stats.totalHashes > 0
          ? (this.stats.collisions / this.stats.totalHashes) * 100
          : 0,
    };
  }
}
```

### 关键技术点

#### 1. 哈希算法选择

```typescript
// SHA-256: 安全性高，性能好
// MD5: 性能更好，但安全性较低（对i18n足够）
const hash = crypto.createHash('sha256');
```

#### 2. 纯数字哈希

```typescript
// 十六进制: "a3f4b2c8"
// 转换为十进制: "2751996616"

const numericHash = parseInt(hexHash, 16).toString();
```

**优势**：

- 更短的键长度
- 更好的可读性
- 兼容数字键场景

#### 3. 冲突处理

**策略 1：增加长度**

```typescript
if (collision) {
  this.config.length += 2;
  return this.generate(text, context);
}
```

**策略 2：添加后缀**

```typescript
if (collision) {
  return `${hash}_${Date.now()}`;
}
```

**策略 3：使用上下文**

```typescript
// 包含文件路径和组件名，降低冲突概率
const input = `${text}|${filePath}|${componentName}`;
```

---

## 5. Excel/CSV 操作

### ExcelJS 库

**安装**：

```bash
pnpm add exceljs
```

### 导出到 Excel

**export.ts**:

```typescript
import ExcelJS from 'exceljs';

async function exportToExcel(
  translations: TranslationItem[],
  outputFile: string,
  languages: string[]
) {
  // 动态导入 exceljs
  const ExcelJS = await import('exceljs');

  // 创建工作簿
  const workbook = new ExcelJS.default.Workbook();
  const worksheet = workbook.addWorksheet('Translations');

  // 定义列
  const columns = [
    { header: 'Key', key: 'key', width: 15 },
    { header: 'Status', key: 'status', width: 10 },
  ];

  // 添加语言列
  languages.forEach(lang => {
    columns.push({
      header: lang,
      key: lang,
      width: 30,
    });
  });

  worksheet.columns = columns;

  // 添加数据行
  translations.forEach(item => {
    const row: any = {
      key: item.key,
      status: item.status || 'pending',
    };

    // 添加各语言翻译
    languages.forEach(lang => {
      row[lang] = item.translations[lang] || '';
    });

    worksheet.addRow(row);
  });

  // 样式设置
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // 冻结首行
  worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

  // 保存文件
  await workbook.xlsx.writeFile(outputFile);
  logger.success(`✓ Excel 文件已生成: ${outputFile}`);
}
```

### 从 Excel 导入

**import.ts**:

```typescript
async function importFromExcel(
  inputPath: string
): Promise<ImportedTranslation[]> {
  const ExcelJS = await import('exceljs');

  // 读取工作簿
  const workbook = new ExcelJS.default.Workbook();
  await workbook.xlsx.readFile(inputPath);

  // 获取第一个工作表
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Excel 文件为空');
  }

  // 读取表头
  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber - 1] = cell.value?.toString() || '';
  });

  // 找到语言列
  const keyIndex = headers.indexOf('Key');
  const statusIndex = headers.indexOf('Status');
  const languageIndices = headers
    .map((h, i) => ({ lang: h, index: i }))
    .filter(({ lang }) => !['Key', 'Status'].includes(lang));

  // 读取数据行
  const translations: ImportedTranslation[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // 跳过表头

    const key = row.getCell(keyIndex + 1).value?.toString();
    if (!key) return;

    const status = row.getCell(statusIndex + 1).value?.toString();
    const translationsMap: Record<string, string> = {};

    languageIndices.forEach(({ lang, index }) => {
      const value = row.getCell(index + 1).value?.toString() || '';
      translationsMap[lang] = value;
    });

    translations.push({
      key,
      status,
      translations: translationsMap,
    });
  });

  return translations;
}
```

### CSV 操作

```typescript
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// 导出 CSV
function exportToCSV(
  translations: TranslationItem[],
  outputFile: string,
  languages: string[]
) {
  const records = translations.map(item => ({
    key: item.key,
    status: item.status || 'pending',
    ...item.translations,
  }));

  const csv = stringify(records, {
    header: true,
    columns: ['key', 'status', ...languages],
  });

  writeFileSync(outputFile, csv, 'utf-8');
}

// 导入 CSV
function importFromCSV(inputPath: string): ImportedTranslation[] {
  const content = readFileSync(inputPath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.map((record: any) => {
    const { key, status, ...translations } = record;
    return {
      key,
      status,
      translations,
    };
  });
}
```

---

## 6. 配置管理

### 使用 jiti 加载 TypeScript 配置

```typescript
import { createJiti } from 'jiti';
import { pathToFileURL } from 'url';

export class ConfigManager {
  async loadConfig(cwd = process.cwd()): Promise<I18nConfig> {
    // 查找配置文件
    const configFiles = [
      'translink.config.ts',
      'translink.config.js',
      'i18n.config.ts',
      'i18n.config.js',
    ];

    for (const file of configFiles) {
      const configPath = resolve(cwd, file);
      if (existsSync(configPath)) {
        return this.loadConfigFile(configPath);
      }
    }

    // 使用默认配置
    return DEFAULT_CONFIG;
  }

  private async loadConfigFile(configPath: string): Promise<I18nConfig> {
    if (configPath.endsWith('.ts')) {
      // 使用 jiti 加载 TypeScript 配置
      const jiti = createJiti(process.cwd(), {
        interopDefault: true,
        esmResolve: true,
      });

      const config = jiti(configPath);
      return config?.default || config;
    } else {
      // JavaScript 配置
      const fileUrl = pathToFileURL(configPath).href;
      const module = await import(fileUrl);
      return module.default || module;
    }
  }
}
```

---

## 7. 日志系统

### Logger 实现

```typescript
import chalk from 'chalk';
import ora from 'ora';

export class Logger {
  private spinner: any;
  private verbose = false;

  setVerbose(verbose: boolean) {
    this.verbose = verbose;
  }

  title(text: string) {
    console.log();
    console.log(chalk.cyan.bold('🔗 TransLink I18n'));
    console.log(chalk.gray(text));
    console.log();
  }

  success(text: string) {
    console.log(chalk.green('✓'), text);
  }

  error(text: string) {
    console.log(chalk.red('✗'), text);
  }

  warn(text: string) {
    console.log(chalk.yellow('⚠'), text);
  }

  info(text: string) {
    console.log(chalk.blue('ℹ'), text);
  }

  debug(text: string) {
    if (this.verbose) {
      console.log(chalk.gray('🐛'), text);
    }
  }

  startSpinner(text: string) {
    this.spinner = ora(text).start();
  }

  stopSpinner(text: string, success = true) {
    if (success) {
      this.spinner.succeed(text);
    } else {
      this.spinner.fail(text);
    }
  }

  br() {
    console.log();
  }
}

export const logger = new Logger();
```

---

## 8. 实践：创建新命令

### 步骤 1：创建命令文件

**commands/validate.ts**:

```typescript
import { Command } from 'commander';

export const validateCmd = new Command('validate')
  .description('验证翻译文件')
  .option('-f, --fix', '自动修复问题')
  .action(async options => {
    await validateCommand(options);
  });

interface ValidateOptions {
  fix?: boolean;
}

async function validateCommand(options: ValidateOptions) {
  logger.title('验证翻译文件');

  const config = await configManager.loadConfig();
  const issues = await validateTranslations(config);

  if (issues.length === 0) {
    logger.success('✓ 所有翻译文件验证通过');
    return;
  }

  logger.error(`发现 ${issues.length} 个问题:`);
  issues.forEach((issue, i) => {
    logger.info(`  ${i + 1}. ${issue}`);
  });

  if (options.fix) {
    logger.info('正在修复...');
    await fixTranslations(config, issues);
    logger.success('✓ 修复完成');
  }
}
```

### 步骤 2：注册命令

**index.ts**:

```typescript
import { validateCmd } from './commands/validate.js';

program.addCommand(validateCmd);
```

---

## 9. 小结

本章学习了：

✅ **Commander.js** - 命令定义、选项处理、命令分组  
✅ **AST 提取** - GoGoCode 使用、Vue/JS/JSX 处理  
✅ **哈希生成** - SHA-256 算法、纯数字哈希、冲突处理  
✅ **Excel/CSV** - ExcelJS 库、数据导入导出  
✅ **配置管理** - jiti 加载、TypeScript 支持  
✅ **日志系统** - 美化输出、Spinner 动画

### 下一步

👉 [教程 3：Runtime 运行时实现](./03-runtime-implementation.md) - 学习翻译引擎核心

---

## 📚 扩展阅读

- [Commander.js 文档](https://github.com/tj/commander.js)
- [GoGoCode 文档](https://github.com/thx/gogocode)
- [ExcelJS 文档](https://github.com/exceljs/exceljs)
- [AST Explorer](https://astexplorer.net/) - 在线 AST 查看工具
