import { Command } from 'commander';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { configManager } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ASTExtractor } from '../extractors/ast-extractor.js';
import { HashGenerator } from '../generators/hash-generator.js';
import type { ExtractResult } from '../types/config.js';

interface ExtractOptions {
  pattern?: string[];
  output?: string;
  format?: 'json' | 'yaml' | 'js' | 'ts';
  dryRun?: boolean;
  verbose?: boolean;
}

async function extractCommand(options: ExtractOptions) {
  logger.title('提取翻译文本');

  try {
    // 加载配置
    const config = await configManager.loadConfig();
    
    // 应用命令行选项覆盖
    if (options.pattern) {
      config.extract.patterns = options.pattern;
    }
    if (options.output) {
      config.output.directory = options.output;
    }
    if (options.format) {
      config.output.format = options.format;
    }

    logger.info(`扫描模式: ${config.extract.patterns.join(', ')}`);
    logger.info(`翻译函数: ${config.extract.functions.join(', ')}`);
    logger.info(`输出目录: ${config.output.directory}`);
    logger.info(`输出格式: ${config.output.format}`);
    logger.br();

    // 初始化提取器
    const hashGenerator = new HashGenerator(config.hash);
    const extractor = new ASTExtractor(config.extract, hashGenerator);

    // 执行提取
    const results = await extractor.extractFromProject();
    
    if (results.length === 0) {
      logger.warn('未发现需要翻译的中文文本');
      return;
    }

    // 显示提取统计
    const stats = extractor.getStats();
    const hashStats = hashGenerator.getCollisionStats();
    
    logger.br();
    logger.success('📊 提取统计:');
    logger.info(`  扫描文件: ${stats.totalFiles} 个`);
    logger.info(`  处理文件: ${stats.processedFiles} 个`);
    logger.info(`  提取文本: ${stats.chineseTexts} 个`);
    logger.info(`  生成哈希: ${hashStats.totalHashes} 个`);
    
    if (hashStats.collisions > 0) {
      logger.warn(`  哈希冲突: ${hashStats.collisions} 个 (${(hashStats.collisionRate * 100).toFixed(2)}%)`);
    }

    if (options.verbose) {
      logger.br();
      logger.info('🔍 详细结果:');
      results.slice(0, 10).forEach((result, index) => {
        logger.info(`  ${index + 1}. ${result.key} -> "${result.text.substring(0, 30)}..."`);
        logger.info(`     文件: ${result.filePath}:${result.line}:${result.column}`);
      });
      
      if (results.length > 10) {
        logger.info(`  ... 还有 ${results.length - 10} 个结果`);
      }
    }

    if (options.dryRun) {
      logger.info('🔍 试运行模式，不会写入文件');
      return;
    }

    // 生成语言文件
    await generateLanguageFiles(results, config);
    
    logger.br();
    logger.success('🎉 提取完成！');
    logger.info('下一步可以运行:');
    logger.info('  translink build  # 构建语言包');
    logger.info('  translink push   # 推送到云端（如果已配置）');

  } catch (error) {
    logger.error(`提取失败: ${error}`);
    process.exit(1);
  }
}

/**
 * 生成语言文件
 */
async function generateLanguageFiles(results: ExtractResult[], config: any) {
  const outputDir = resolve(process.cwd(), config.output.directory);
  
  // 确保输出目录存在
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    logger.info(`创建输出目录: ${config.output.directory}`);
  }

  // 按语言生成文件
  for (const language of config.languages.supported) {
    const languageData: Record<string, any> = {};
    
    // 构建语言数据
    for (const result of results) {
      if (config.output.flattenKeys) {
        // 扁平化键值结构
        languageData[result.key] = language === config.languages.default ? result.text : '';
      } else {
        // 嵌套键值结构（如果需要支持命名空间）
        setNestedValue(languageData, result.key, language === config.languages.default ? result.text : '');
      }
    }

    // 写入文件
    const fileName = `${language}.${config.output.format}`;
    const filePath = resolve(outputDir, fileName);
    
    const content = formatLanguageFile(languageData, config.output.format);
    writeFileSync(filePath, content, 'utf-8');
    
    logger.success(`生成语言文件: ${fileName} (${Object.keys(languageData).length} 个键)`);
  }

  // 生成键值映射文件（用于开发调试）
  const mappingData = results.map(result => ({
    key: result.key,
    text: result.text,
    file: result.filePath,
    line: result.line,
    context: result.context,
  }));

  const mappingPath = resolve(outputDir, 'extraction-mapping.json');
  writeFileSync(mappingPath, JSON.stringify(mappingData, null, 2), 'utf-8');
  logger.info(`生成映射文件: extraction-mapping.json`);
}

/**
 * 设置嵌套对象值
 */
function setNestedValue(obj: any, key: string, value: any) {
  // 如果key包含点号，创建嵌套结构
  if (key.includes('.')) {
    const keys = key.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
  } else {
    obj[key] = value;
  }
}

/**
 * 格式化语言文件内容
 */
function formatLanguageFile(data: any, format: string): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'js':
      return `export default ${JSON.stringify(data, null, 2)};`;
    case 'ts':
      return `export default ${JSON.stringify(data, null, 2)} as const;`;
    case 'yaml':
      // 简单的 YAML 生成（可以后续集成 yaml 库）
      return Object.entries(data)
        .map(([key, value]) => `${key}: "${value}"`)
        .join('\n');
    default:
      return JSON.stringify(data, null, 2);
  }
}

export const extract = new Command('extract')
  .description('扫描代码并提取翻译文本')
  .option('-p, --pattern <patterns...>', '扫描文件模式')
  .option('-o, --output <directory>', '输出目录')
  .option('-f, --format <format>', '输出格式 (json|yaml|js|ts)', 'json')
  .option('--dry-run', '试运行，不写入文件')
  .option('-v, --verbose', '显示详细信息')
  .action(extractCommand);
