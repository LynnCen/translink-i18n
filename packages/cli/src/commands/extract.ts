import { Command } from 'commander';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { configManager } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ASTExtractor } from '../extractors/ast-extractor.js';
import { HashGenerator } from '../generators/hash-generator.js';
import {
  displayChangesTable,
  displayStats,
  displayLocaleUpdates,
  type Change,
} from '../utils/table.js';
import type { ExtractResult, I18nConfig } from '../types/config.js';

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
    let config;
    try {
      config = await configManager.loadConfig();
    } catch {
      logger.error('无法加载配置文件');
      logger.info('请先运行 translink init 初始化配置');
      process.exit(1);
    }

    // 验证配置
    if (!config.extract.patterns || config.extract.patterns.length === 0) {
      logger.error('配置错误：未设置扫描模式');
      logger.info('请在配置文件中设置 extract.patterns');
      process.exit(1);
    }

    if (!config.extract.functions || config.extract.functions.length === 0) {
      logger.error('配置错误：未设置翻译函数');
      logger.info('请在配置文件中设置 extract.functions');
      process.exit(1);
    }

    if (
      !config.languages.supported ||
      config.languages.supported.length === 0
    ) {
      logger.error('配置错误：未设置支持的语言');
      logger.info('请在配置文件中设置 languages.supported');
      process.exit(1);
    }

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
    const hashGenerator = new HashGenerator();
    const extractor = new ASTExtractor(config.extract, hashGenerator);

    // 执行提取
    let results: ExtractResult[];
    try {
      results = await extractor.extractFromProject();
    } catch (error) {
      logger.error(`提取过程出错: ${error}`);
      const stats = extractor.getStats();
      if (stats.errors > 0) {
        logger.warn(`处理过程中遇到 ${stats.errors} 个错误`);
      }
      throw error;
    }

    // 获取统计信息
    const stats = extractor.getStats();
    const hashStats = hashGenerator.getCollisionStats();

    // 显示提取文件列表
    if (stats.filesWithExtractions.length > 0) {
      logger.br();
      logger.info('📄 提取到翻译文本的文件:');
      stats.filesWithExtractions.forEach((file, index) => {
        logger.info(`   ${index + 1}. ${file}`);
      });
    }

    if (results.length === 0) {
      logger.br();
      logger.warn('未发现需要翻译的文本');
      logger.info('请检查：');
      logger.info('  1. 扫描模式是否正确');
      logger.info('  2. 代码中是否使用了配置的翻译函数');
      logger.info('  3. 翻译函数是否包含有效的文本参数');
      return;
    }

    // 显示提取统计
    logger.br();
    logger.success('📊 提取统计:');
    logger.info(`  扫描文件: ${stats.totalFiles} 个`);
    logger.info(`  处理文件: ${stats.processedFiles} 个`);
    logger.info(`  包含翻译: ${stats.filesWithExtractions.length} 个`);
    logger.info(`  提取文本: ${stats.extractedTexts} 个`);
    logger.info(`  生成哈希: ${hashStats.totalHashes} 个`);

    if (hashStats.collisions > 0) {
      logger.warn(
        `  哈希冲突: ${hashStats.collisions} 个 (${(hashStats.collisionRate * 100).toFixed(2)}%)`
      );
    }

    if (options.verbose) {
      logger.br();
      logger.info('🔍 详细结果:');
      results.slice(0, 10).forEach((result, index) => {
        logger.info(
          `  ${index + 1}. ${result.key} -> "${result.text.substring(0, 30)}..."`
        );
        logger.info(
          `     文件: ${result.filePath}:${result.line}:${result.column}`
        );
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
    try {
      await generateLanguageFiles(results, config);
    } catch (error) {
      logger.error(`生成语言文件失败: ${error}`);
      throw error;
    }

    logger.br();
    logger.success('🎉 提取完成！');
    logger.info('下一步可以运行:');
    logger.info('  translink build   # 构建语言包');
    logger.info('  translink export  # 导出为 Excel/CSV 格式');
  } catch (error) {
    logger.error(`提取失败: ${error}`);
    if (error instanceof Error && error.stack && process.env.DEBUG) {
      logger.debug(error.stack);
    }
    process.exit(1);
  }
}

/**
 * 生成语言文件（增量更新模式）
 */
async function generateLanguageFiles(
  results: ExtractResult[],
  config: I18nConfig
) {
  const outputDir = resolve(process.cwd(), config.output.directory);

  // 确保输出目录存在
  if (!existsSync(outputDir)) {
    try {
      mkdirSync(outputDir, { recursive: true });
      logger.info(`创建输出目录: ${config.output.directory}`);
    } catch (error) {
      logger.error(`无法创建输出目录: ${error}`);
      throw error;
    }
  }

  // 构建新提取的数据映射
  const newTranslations: Record<string, string> = {};
  for (const result of results) {
    newTranslations[result.key] = result.text;
  }

  // 分析变更
  const changes: Change[] = [];
  const sourceLanguage = config.languages.source || config.languages.default;
  const sourceFilePath = resolve(
    outputDir,
    `${sourceLanguage}.${config.output.format}`
  );

  let existingSourceData: Record<string, string> = {};
  if (existsSync(sourceFilePath)) {
    try {
      const content = readFileSync(sourceFilePath, 'utf-8');
      existingSourceData = JSON.parse(content);
    } catch (error) {
      logger.warn(`读取现有源语言文件失败: ${error}`);
    }
  }

  // 比较变更
  const existingKeys = new Set(Object.keys(existingSourceData));
  const newKeys = new Set(Object.keys(newTranslations));

  for (const key of newKeys) {
    if (existingKeys.has(key)) {
      changes.push({
        key,
        text: newTranslations[key],
        type: 'kept',
        languages: config.languages.supported,
      });
    } else {
      changes.push({
        key,
        text: newTranslations[key],
        type: 'added',
        languages: config.languages.supported,
      });
    }
  }

  // 显示变更表格
  if (changes.length > 0 && config.cli?.table?.enabled) {
    displayChangesTable(changes, config);
  }

  // 统计信息
  const stats = {
    added: changes.filter(c => c.type === 'added').length,
    updated: 0,
    kept: changes.filter(c => c.type === 'kept').length,
    deleted: 0,
  };

  // 按语言更新文件
  const localeUpdates = [];

  for (const language of config.languages.supported) {
    try {
      const filePath = resolve(
        outputDir,
        `${language}.${config.output.format}`
      );

      // 读取现有数据
      let existingData: Record<string, string> = {};
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf-8');
          const rawData = JSON.parse(content);

          // ✅ 容错处理：过滤非字符串值
          for (const [key, value] of Object.entries(rawData)) {
            if (typeof value === 'string') {
              existingData[key] = value;
            } else {
              logger.warn(
                `[容错] 语言文件 ${language}.${config.output.format} 中的键 "${key}" 的值不是字符串，已跳过。原始值类型: ${typeof value}`
              );
            }
          }
        } catch (error) {
          logger.warn(`读取现有 ${language} 文件失败，将创建新文件`);
        }
      }

      // 合并数据（增量模式）
      const mergedData: Record<string, string> = {};

      // 保留已有的翻译
      for (const key of Object.keys(existingData)) {
        if (newKeys.has(key)) {
          // ✅ 已经过滤，existingData[key] 确保是字符串
          mergedData[key] = existingData[key];
        }
      }

      // 添加新的键
      for (const key of newKeys) {
        if (!(key in mergedData)) {
          if (language === sourceLanguage) {
            // ✅ newTranslations[key] 来自 AST 提取，确保是字符串
            mergedData[key] = newTranslations[key];
          } else {
            // ✅ 已经过滤，existingData[key] 确保是字符串或 undefined
            mergedData[key] = existingData[key] || '';
          }
        }
      }

      // 按 key 排序（如果配置启用）
      let finalData = mergedData;
      if (config.output.sortKeys) {
        const sortedKeys = Object.keys(mergedData).sort();
        finalData = {};
        for (const key of sortedKeys) {
          finalData[key] = mergedData[key];
        }
      }

      // 写入文件
      const content = formatLanguageFile(finalData, config);
      writeFileSync(filePath, content, 'utf-8');

      localeUpdates.push({
        language,
        file: `${language}.${config.output.format}`,
        added: stats.added,
        updated: 0,
        kept: stats.kept,
      });
    } catch (error) {
      logger.error(`更新 ${language} 语言文件失败: ${error}`);
      throw error;
    }
  }

  // 显示更新信息
  logger.br();
  displayLocaleUpdates(localeUpdates);

  // 显示统计
  displayStats(stats);

  // 生成映射文件（用于调试）
  if (config.importExport?.excel?.includeMetadata) {
    try {
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
    } catch (error) {
      logger.warn(`生成映射文件失败: ${error}`);
    }
  }
}

/**
 * 格式化语言文件内容
 */
function formatLanguageFile(data: any, config: I18nConfig): string {
  const format = config.output.format;
  const indent = config.output.indent || 2;

  switch (format) {
    case 'json':
      return JSON.stringify(data, null, indent); // 移除末尾换行符
    case 'js':
      return `export default ${JSON.stringify(data, null, indent)};`;
    case 'ts':
      return `export default ${JSON.stringify(data, null, indent)} as const;`;
    case 'yaml':
      // 简单的 YAML 生成（可以后续集成 yaml 库）
      return Object.entries(data)
        .map(([key, value]) => `${key}: "${value}"`)
        .join('\n');
    default:
      return JSON.stringify(data, null, indent);
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
