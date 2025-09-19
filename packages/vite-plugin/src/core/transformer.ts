import type { ResolvedConfig } from 'vite';
import MagicString from 'magic-string';
import $ from 'gogocode';
import { createHash } from 'node:crypto';
import type { 
  I18nPluginOptions, 
  TransformContext, 
  TransformResult,
  TransformRule 
} from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * 代码转换器 - 负责 AST 分析和代码转换
 */
export class I18nTransformer {
  private options: I18nPluginOptions;
  private config: ResolvedConfig;
  private keyMappings = new Map<string, string>();
  private extractedTexts = new Set<string>();

  constructor(options: I18nPluginOptions, config: ResolvedConfig) {
    this.options = options;
    this.config = config;
  }

  /**
   * 转换代码
   */
  async transform(code: string, context: TransformContext): Promise<TransformResult> {
    const { filename, isDev } = context;
    
    try {
      // 创建 MagicString 实例用于代码修改
      const s = new MagicString(code);
      let hasChanged = false;
      const extractedKeys: string[] = [];
      const stats = {
        tslCount: 0,
        transformedCount: 0,
        skippedCount: 0
      };

      // 检测文件类型
      const fileType = this.detectFileType(filename);
      
      if (fileType === 'unknown') {
        return {
          code,
          hasChanged: false,
          stats
        };
      }

      // 使用 gogocode 解析 AST
      let ast: any;
      
      try {
        if (fileType === 'vue') {
          ast = $(code, { parseOptions: { language: 'vue' } });
        } else {
          ast = $(code, { parseOptions: { language: 'typescript' } });
        }
      } catch (parseError) {
        logger.warn(`Failed to parse ${filename}:`, parseError);
        return { code, hasChanged: false, stats };
      }

      // 1. 处理 $tsl 函数调用
      if (this.options.transformTsl) {
        const tslResult = this.transformTslCalls(ast, s, isDev);
        hasChanged = hasChanged || tslResult.hasChanged;
        stats.tslCount += tslResult.count;
        stats.transformedCount += tslResult.transformed;
        extractedKeys.push(...tslResult.extractedKeys);
      }

      // 2. 处理 t() 函数调用中的中文文本
      const tResult = this.transformTCalls(ast, s, isDev);
      hasChanged = hasChanged || tResult.hasChanged;
      stats.transformedCount += tResult.transformed;
      extractedKeys.push(...tResult.extractedKeys);

      // 3. 应用自定义转换规则
      if (this.options.transformRules && this.options.transformRules.length > 0) {
        const customResult = this.applyCustomRules(code, s, context);
        hasChanged = hasChanged || customResult.hasChanged;
        stats.transformedCount += customResult.transformed;
      }

      // 4. 注入运行时导入（仅在有转换时）
      if (hasChanged && this.shouldInjectImports(code, fileType)) {
        this.injectRuntimeImports(s, fileType);
      }

      // 5. 添加懒加载支持
      if (this.options.lazyLoading && hasChanged) {
        this.injectLazyLoadingCode(s, extractedKeys, fileType);
      }

      return {
        code: hasChanged ? s.toString() : code,
        map: hasChanged ? s.generateMap({ hires: true }) : undefined,
        hasChanged,
        extractedKeys,
        stats
      };

    } catch (error) {
      logger.error(`Transform error in ${filename}:`, error);
      return {
        code,
        hasChanged: false,
        stats: { tslCount: 0, transformedCount: 0, skippedCount: 0 }
      };
    }
  }

  /**
   * 转换 $tsl 调用为 t(hash) 形式
   */
  private transformTslCalls(ast: any, s: MagicString, isDev: boolean) {
    let count = 0;
    let transformed = 0;
    const extractedKeys: string[] = [];

    try {
      // 查找所有 $tsl 调用
      ast.find('$_$($$$)').each((path: any) => {
        const node = path.node;
        
        // 检查是否为 $tsl 调用
        if (node.callee?.name === '$tsl' || 
            (node.callee?.type === 'MemberExpression' && 
             node.callee?.property?.name === '$tsl')) {
          
          count++;
          
          const firstArg = node.arguments?.[0];
          if (firstArg?.type === 'Literal' && typeof firstArg.value === 'string') {
            const text = firstArg.value;
            const hash = this.generateHash(text);
            
            // 记录映射关系
            this.keyMappings.set(hash, text);
            this.extractedTexts.add(text);
            extractedKeys.push(hash);
            
            // 替换为 t(hash) 形式
            const start = node.start;
            const end = node.end;
            
            if (isDev) {
              // 开发模式保留原文本作为默认值
              s.overwrite(start, end, `t('${hash}', undefined, { defaultValue: '${text}' })`);
            } else {
              // 生产模式只使用 hash
              s.overwrite(start, end, `t('${hash}')`);
            }
            
            transformed++;
          }
        }
      });
    } catch (error) {
      logger.warn('Error processing $tsl calls:', error);
    }

    return {
      hasChanged: transformed > 0,
      count,
      transformed,
      extractedKeys
    };
  }

  /**
   * 转换 t() 调用中的中文文本
   */
  private transformTCalls(ast: any, s: MagicString, isDev: boolean) {
    let transformed = 0;
    const extractedKeys: string[] = [];

    try {
      // 查找 t() 函数调用
      ast.find('t($$$)').each((path: any) => {
        const node = path.node;
        const firstArg = node.arguments?.[0];
        
        if (firstArg?.type === 'Literal' && typeof firstArg.value === 'string') {
          const text = firstArg.value;
          
          // 检查是否包含中文
          if (this.containsChinese(text) && !this.isHashKey(text)) {
            const hash = this.generateHash(text);
            
            // 记录映射关系
            this.keyMappings.set(hash, text);
            this.extractedTexts.add(text);
            extractedKeys.push(hash);
            
            // 替换文本为 hash
            const start = firstArg.start;
            const end = firstArg.end;
            
            s.overwrite(start, end, `'${hash}'`);
            transformed++;
          }
        }
      });
    } catch (error) {
      logger.warn('Error processing t() calls:', error);
    }

    return {
      hasChanged: transformed > 0,
      transformed,
      extractedKeys
    };
  }

  /**
   * 应用自定义转换规则
   */
  private applyCustomRules(code: string, s: MagicString, context: TransformContext) {
    let transformed = 0;
    
    if (!this.options.transformRules) {
      return { hasChanged: false, transformed };
    }

    for (const rule of this.options.transformRules) {
      // 检查是否仅在生产环境应用
      if (rule.productionOnly && context.isDev) {
        continue;
      }

      let match;
      while ((match = rule.pattern.exec(code)) !== null) {
        try {
          const replacement = rule.transform(match[0], ...match.slice(1));
          const start = match.index;
          const end = start + match[0].length;
          
          s.overwrite(start, end, replacement);
          transformed++;
        } catch (error) {
          logger.warn('Error applying custom transform rule:', error);
        }
      }
    }

    return {
      hasChanged: transformed > 0,
      transformed
    };
  }

  /**
   * 注入运行时导入
   */
  private injectRuntimeImports(s: MagicString, fileType: string) {
    const imports = this.generateImportStatements(fileType);
    
    if (imports) {
      // 在文件开头添加导入
      s.prepend(imports + '\n');
    }
  }

  /**
   * 注入懒加载代码
   */
  private injectLazyLoadingCode(s: MagicString, extractedKeys: string[], fileType: string) {
    if (extractedKeys.length === 0) return;

    const lazyLoadCode = this.generateLazyLoadCode(extractedKeys, fileType);
    
    if (lazyLoadCode) {
      s.append('\n' + lazyLoadCode);
    }
  }

  /**
   * 生成导入语句
   */
  private generateImportStatements(fileType: string): string | null {
    switch (fileType) {
      case 'vue':
        return `import { useI18n } from '@translink/i18n-runtime/vue';\nconst { t } = useI18n();`;
      
      case 'react':
        return `import { useTranslation } from '@translink/i18n-runtime/react';\nconst { t } = useTranslation();`;
      
      case 'typescript':
      case 'javascript':
        return `import { createI18n } from '@translink/i18n-runtime';\nconst i18n = createI18n(); const t = i18n.t.bind(i18n);`;
      
      default:
        return null;
    }
  }

  /**
   * 生成懒加载代码
   */
  private generateLazyLoadCode(extractedKeys: string[], fileType: string): string | null {
    const languages = this.options.supportedLanguages || ['zh-CN', 'en-US'];
    
    const preloadCode = `
// Auto-generated lazy loading code
if (typeof window !== 'undefined') {
  const preloadLanguages = ${JSON.stringify(languages)};
  const requiredKeys = ${JSON.stringify(extractedKeys)};
  
  // 预加载当前页面需要的翻译
  preloadLanguages.forEach(lang => {
    import(\`virtual:i18n-language-\${lang}\`).catch(console.warn);
  });
}`;

    return preloadCode;
  }

  /**
   * 检测文件类型
   */
  private detectFileType(filename: string): string {
    if (filename.endsWith('.vue')) return 'vue';
    if (filename.endsWith('.tsx') || filename.endsWith('.jsx')) return 'react';
    if (filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.js')) return 'javascript';
    return 'unknown';
  }

  /**
   * 检查是否应该注入导入
   */
  private shouldInjectImports(code: string, fileType: string): boolean {
    // 检查是否已经有相关导入
    const hasI18nImport = /import.*from.*['"]@translink\/i18n-runtime/.test(code);
    const hasUseI18n = /useI18n|useTranslation/.test(code);
    
    return !hasI18nImport && !hasUseI18n;
  }

  /**
   * 生成文本的哈希值
   */
  private generateHash(text: string): string {
    return createHash('md5')
      .update(text)
      .digest('hex')
      .substring(0, 8);
  }

  /**
   * 检查文本是否包含中文
   */
  private containsChinese(text: string): boolean {
    return /[\u4e00-\u9fff]/.test(text);
  }

  /**
   * 检查是否为哈希键
   */
  private isHashKey(text: string): boolean {
    return /^[a-f0-9]{8}$/.test(text);
  }

  /**
   * 获取提取的文本映射
   */
  getExtractedTexts(): Map<string, string> {
    return new Map(this.keyMappings);
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.keyMappings.clear();
    this.extractedTexts.clear();
  }
}
