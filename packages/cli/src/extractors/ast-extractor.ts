import $ from 'gogocode';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { relative } from 'path';
import type { I18nConfig, ExtractResult } from '../types/config.js';
import type { HashContext } from '../generators/hash-generator.js';
import { HashGenerator } from '../generators/hash-generator.js';
import { logger } from '../utils/logger.js';

export interface ExtractionStats {
  totalFiles: number;
  processedFiles: number;
  totalExtractions: number;
  chineseTexts: number;
  errors: number;
  processedFilesList: string[]; // 🆕 已处理的文件列表
  filesWithExtractions: string[]; // 🆕 包含提取结果的文件列表
}

export class ASTExtractor {
  private config: I18nConfig['extract'];
  private hashGenerator: HashGenerator;
  private stats: ExtractionStats = {
    totalFiles: 0,
    processedFiles: 0,
    totalExtractions: 0,
    chineseTexts: 0,
    errors: 0,
    processedFilesList: [],
    filesWithExtractions: [],
  };

  constructor(config: I18nConfig['extract'], hashGenerator: HashGenerator) {
    this.config = config;
    this.hashGenerator = hashGenerator;
  }

  /**
   * 从项目中提取所有翻译文本
   */
  async extractFromProject(
    cwd: string = process.cwd()
  ): Promise<ExtractResult[]> {
    logger.startSpinner('扫描项目文件...');

    try {
      const files = await this.scanFiles(cwd);
      this.stats.totalFiles = files.length;

      logger.updateSpinner(`发现 ${files.length} 个文件，开始提取翻译文本...`);

      const results: ExtractResult[] = [];

      for (const filePath of files) {
        try {
          const fileResults = await this.extractFromFile(filePath, cwd);
          results.push(...fileResults);
          this.stats.processedFiles++;
          this.stats.processedFilesList.push(relative(cwd, filePath));

          if (fileResults.length > 0) {
            this.stats.filesWithExtractions.push(relative(cwd, filePath));
            logger.updateSpinner(
              `已处理 ${this.stats.processedFiles}/${this.stats.totalFiles} 个文件，` +
                `提取 ${this.stats.totalExtractions} 个文本`
            );
          }
        } catch (error) {
          this.stats.errors++;
          logger.debug(`处理文件 ${filePath} 时出错: ${error}`);
        }
      }

      logger.stopSpinner(
        `✓ 提取完成！处理了 ${this.stats.processedFiles} 个文件，` +
          `提取了 ${this.stats.chineseTexts} 个中文文本`
      );

      return this.deduplicateResults(results);
    } catch (error) {
      logger.stopSpinner('✗ 文件扫描失败', false);
      throw error;
    }
  }

  /**
   * 获取提取统计信息
   */
  getStats(): ExtractionStats {
    return { ...this.stats };
  }

  /**
   * 扫描匹配的文件
   */
  private async scanFiles(cwd: string): Promise<string[]> {
    const allFiles: string[] = [];

    for (const pattern of this.config.patterns) {
      try {
        const files = await glob(pattern, {
          cwd,
          ignore: this.config.exclude,
          absolute: true,
        });
        allFiles.push(...files);
      } catch (error) {
        logger.warn(`扫描模式 "${pattern}" 失败: ${error}`);
      }
    }

    // 去重并过滤扩展名
    const uniqueFiles = [...new Set(allFiles)];
    return uniqueFiles.filter(file =>
      this.config.extensions.some(ext => file.endsWith(ext))
    );
  }

  /**
   * 从单个文件提取翻译文本
   */
  private async extractFromFile(
    filePath: string,
    cwd: string
  ): Promise<ExtractResult[]> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const relativePath = relative(cwd, filePath);

      // 根据文件类型选择不同的解析策略
      const fileExtension = this.getFileExtension(filePath);

      switch (fileExtension) {
        case '.vue':
          return this.extractFromVueFile(content, relativePath);
        case '.tsx':
        case '.jsx':
          return this.extractFromJSXFile(content, relativePath);
        case '.ts':
        case '.js':
          return this.extractFromJSFile(content, relativePath);
        default:
          return this.extractFromJSFile(content, relativePath);
      }
    } catch (error) {
      logger.debug(`读取文件 ${filePath} 失败: ${error}`);
      return [];
    }
  }

  /**
   * 从 Vue 文件提取翻译文本
   */
  private extractFromVueFile(
    content: string,
    filePath: string
  ): ExtractResult[] {
    const results: ExtractResult[] = [];

    try {
      // 方法 1: 直接使用正则提取 <template> 内容（更可靠）
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

      // 方法 2: 使用正则提取 <script> 内容
      const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      if (scriptMatch && scriptMatch[1]) {
        const scriptContent = scriptMatch[1];
        const scriptResults = this.extractFromJSContent(
          scriptContent,
          filePath
        );
        results.push(...scriptResults);
      }
    } catch (error) {
      logger.debug(`解析 Vue 文件 ${filePath} 失败: ${error}`);
      // 降级：直接在整个文件内容中搜索
      return this.extractFromTemplateContent(content, filePath);
    }

    return results;
  }

  /**
   * 从 JSX/TSX 文件提取翻译文本
   */
  private extractFromJSXFile(
    content: string,
    filePath: string
  ): ExtractResult[] {
    try {
      const ast = $(content, {
        parseOptions: {
          language: 'typescript',
          plugins: ['jsx', 'typescript'],
        },
      });
      return this.extractFromAST(ast, filePath);
    } catch (error) {
      logger.debug(`解析 JSX 文件 ${filePath} 失败: ${error}`);
      // 降级到普通 JS 解析
      return this.extractFromJSContent(content, filePath);
    }
  }

  /**
   * 从 JS/TS 文件提取翻译文本
   */
  private extractFromJSFile(
    content: string,
    filePath: string
  ): ExtractResult[] {
    return this.extractFromJSContent(content, filePath);
  }

  /**
   * 从 JavaScript 内容提取翻译文本
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

    // 查找翻译函数调用
    ast.find('CallExpression').each((node: any) => {
      try {
        const callee = node.attr('callee');
        const functionName = this.getFunctionName(callee);

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
                  namespace: context.namespace,
                },
              });

              this.stats.totalExtractions++;
              this.stats.chineseTexts++;
            }
          }
        }
      } catch (error) {
        logger.debug(`处理 AST 节点时出错: ${error}`);
      }
    });

    return results;
  }

  /**
   * 从 Vue 模板提取翻译文本
   */
  private extractFromTemplateContent(
    templateContent: string,
    filePath: string
  ): ExtractResult[] {
    const results: ExtractResult[] = [];

    // 更强大的正则表达式匹配模板中的翻译调用
    const patterns = [
      // {{ $tsl('文本') }} - 花括号内调用
      /\{\{[^}]*?\$tsl\s*\(\s*['"`]([^'"`]+)['"`]\s*\)[^}]*?\}\}/g,
      // {{ t('文本') }} - 短函数名
      /\{\{[^}]*?([tT]|i18n\.t|\$t)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)[^}]*?\}\}/g,
      // :prop="$tsl('文本')" - 属性绑定
      /[:@]\w+\s*=\s*["`]\s*\$tsl\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*["`]/g,
      // :prop="t('文本')" - 属性绑定（短函数名）
      /[:@]\w+\s*=\s*["`]\s*([tT]|i18n\.t|\$t)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*["`]/g,
      // v-t="文本" - v-t 指令
      /v-t\s*=\s*['"`]([^'"`]+)['"`]/g,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(templateContent)) !== null) {
        // 获取文本内容（可能在不同的捕获组）
        const text = match[2] || match[1];
        if (text && this.isChineseText(text)) {
          const context: HashContext = {
            filePath,
            componentName: this.extractComponentName(filePath),
            functionName: 'template',
          };

          const key = this.hashGenerator.generate(text, context);

          results.push({
            key,
            text,
            filePath,
            line: this.getLineNumber(templateContent, match.index || 0),
            column: match.index || 0,
            context: {
              componentName: context.componentName,
              functionName: context.functionName,
            },
          });

          this.stats.totalExtractions++;
          this.stats.chineseTexts++;
        }
      }
    });

    return results;
  }

  /**
   * 获取函数名称
   */
  private getFunctionName(callee: any): string {
    if (!callee) return '';

    // 处理不同类型的函数调用
    if (callee.type === 'Identifier') {
      return callee.name || '';
    }

    if (callee.type === 'MemberExpression') {
      const property = callee.property;
      const object = callee.object;

      if (property && object) {
        return `${object.name || ''}.${property.name || ''}`;
      }
    }

    return '';
  }

  /**
   * 检查是否为字符串字面量
   */
  private isStringLiteral(node: any): boolean {
    return (
      node &&
      (node.type === 'StringLiteral' || node.type === 'Literal') &&
      typeof node.value === 'string'
    );
  }

  /**
   * 检查文本是否包含中文
   */
  private isChineseText(text: string): boolean {
    return /[\u4e00-\u9fa5]/.test(text);
  }

  /**
   * 提取上下文信息
   */
  private extractContext(node: any, filePath: string): HashContext {
    const context: HashContext = {
      filePath,
      componentName: this.extractComponentName(filePath),
    };

    // 向上查找函数或组件定义
    let parent = node.parent();
    while (parent) {
      const parentType = parent.attr('type');

      if (
        parentType === 'FunctionDeclaration' ||
        parentType === 'ArrowFunctionExpression'
      ) {
        const functionName = parent.attr('id.name') || 'anonymous';
        context.functionName = functionName;
        break;
      }

      if (parentType === 'MethodDefinition') {
        const methodName = parent.attr('key.name');
        context.functionName = methodName;
        break;
      }

      if (parentType === 'VariableDeclarator') {
        const varName = parent.attr('id.name');
        if (varName && /^[A-Z]/.test(varName)) {
          // 可能是组件定义
          context.componentName = varName;
        }
        context.functionName = varName;
        break;
      }

      parent = parent.parent();
    }

    return context;
  }

  /**
   * 从文件路径提取组件名
   */
  private extractComponentName(filePath: string): string {
    const fileName = filePath.split('/').pop() || '';
    const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');

    // 转换为 PascalCase
    return nameWithoutExt
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(filePath: string): string {
    const match = filePath.match(/\.[^.]+$/);
    return match ? match[0] : '';
  }

  /**
   * 获取文本在内容中的行号
   */
  private getLineNumber(content: string, index: number): number {
    const beforeText = content.substring(0, index);
    return beforeText.split('\n').length;
  }

  /**
   * 去重结果
   */
  private deduplicateResults(results: ExtractResult[]): ExtractResult[] {
    const seen = new Map<string, ExtractResult>();

    for (const result of results) {
      const key = `${result.key}-${result.text}`;
      if (!seen.has(key)) {
        seen.set(key, result);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalFiles: 0,
      processedFiles: 0,
      totalExtractions: 0,
      chineseTexts: 0,
      errors: 0,
    };
  }
}
