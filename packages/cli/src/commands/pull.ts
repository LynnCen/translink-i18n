import { Command } from 'commander';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { configManager } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { VikaClient } from '../integrations/vika-client.js';

interface PullOptions {
  output?: string;
  language?: string[];
  force?: boolean;
  merge?: boolean;
  format?: 'json' | 'yaml' | 'js' | 'ts';
}

async function pullCommand(options: PullOptions) {
  logger.title('从云端拉取翻译');

  try {
    // 加载配置
    const config = await configManager.loadConfig();
    
    // 检查 Vika 配置
    if (!config.vika.apiKey || !config.vika.datasheetId) {
      logger.error('Vika 配置缺失');
      logger.info('请设置以下环境变量:');
      logger.info('  export VIKA_API_KEY="your_api_key"');
      logger.info('  export VIKA_DATASHEET_ID="your_datasheet_id"');
      process.exit(1);
    }

    const outputDir = options.output || config.output.directory;
    const outputPath = resolve(process.cwd(), outputDir);
    const targetLanguages = options.language || config.languages.supported;
    const outputFormat = options.format || config.output.format;

    logger.info(`输出目录: ${outputDir}`);
    logger.info(`目标语言: ${targetLanguages.join(', ')}`);
    logger.info(`输出格式: ${outputFormat}`);
    logger.info(`Vika 表格: ${config.vika.datasheetId}`);
    logger.br();

    // 确保输出目录存在
    if (!existsSync(outputPath)) {
      mkdirSync(outputPath, { recursive: true });
      logger.info(`创建输出目录: ${outputDir}`);
    }

    // 初始化 Vika 客户端
    const vikaClient = new VikaClient(config.vika.apiKey, config.vika.datasheetId);

    // 测试连接
    logger.startSpinner('测试 Vika 连接...');
    const isConnected = await vikaClient.testConnection();
    
    if (!isConnected) {
      logger.stopSpinner('✗ 连接失败', false);
      logger.error('无法连接到 Vika，请检查配置');
      process.exit(1);
    }
    
    logger.stopSpinner('✓ 连接成功');

    // 获取翻译统计
    const stats = await vikaClient.getTranslationStats();
    
    logger.info('📊 云端翻译统计:');
    logger.info(`  总翻译项: ${stats.total}`);
    logger.info(`  待翻译: ${stats.pending}`);
    logger.info(`  已翻译: ${stats.translated}`);
    logger.info(`  已审核: ${stats.reviewed}`);
    logger.br();

    // 显示各语言完成情况
    logger.info('🌐 各语言完成情况:');
    for (const lang of targetLanguages) {
      const completed = stats.languages[lang] || 0;
      const percentage = stats.total > 0 ? ((completed / stats.total) * 100).toFixed(1) : '0';
      logger.info(`  ${lang}: ${completed}/${stats.total} (${percentage}%)`);
    }
    logger.br();

    // 拉取各语言翻译
    const pullResults: Array<{
      language: string;
      translations: Record<string, string>;
      count: number;
    }> = [];

    for (const language of targetLanguages) {
      try {
        const translations = await vikaClient.pullTranslations(language);
        pullResults.push({
          language,
          translations,
          count: Object.keys(translations).length,
        });
      } catch (error) {
        logger.error(`拉取 ${language} 翻译失败: ${error}`);
      }
    }

    // 处理合并选项
    if (options.merge) {
      await mergeTranslations(pullResults, outputPath, outputFormat, config);
    } else {
      await saveTranslations(pullResults, outputPath, outputFormat, options.force);
    }

    // 显示拉取结果
    logger.br();
    logger.success('📊 拉取统计:');
    pullResults.forEach(result => {
      logger.info(`  ${result.language}: ${result.count} 个翻译`);
    });

    logger.br();
    logger.success('🎉 拉取完成！');
    logger.info('翻译文件已更新，可以运行 translink build 构建语言包');

  } catch (error) {
    logger.error(`拉取失败: ${error}`);
    process.exit(1);
  }
}

/**
 * 保存翻译文件
 */
async function saveTranslations(
  results: Array<{ language: string; translations: Record<string, string>; count: number }>,
  outputPath: string,
  format: string,
  force: boolean
) {
  for (const result of results) {
    const fileName = `${result.language}.${format}`;
    const filePath = resolve(outputPath, fileName);

    // 检查文件是否存在
    if (existsSync(filePath) && !force) {
      logger.warn(`文件 ${fileName} 已存在，使用 --force 覆盖`);
      continue;
    }

    // 格式化内容
    const content = formatTranslationFile(result.translations, format);
    writeFileSync(filePath, content, 'utf-8');
    
    logger.success(`保存 ${fileName} (${result.count} 个翻译)`);
  }
}

/**
 * 合并翻译文件
 */
async function mergeTranslations(
  results: Array<{ language: string; translations: Record<string, string>; count: number }>,
  outputPath: string,
  format: string,
  config: any
) {
  for (const result of results) {
    const fileName = `${result.language}.${format}`;
    const filePath = resolve(outputPath, fileName);

    let existingTranslations: Record<string, string> = {};

    // 读取现有翻译
    if (existsSync(filePath)) {
      try {
        const existingContent = readFileSync(filePath, 'utf-8');
        existingTranslations = parseTranslationFile(existingContent, format);
      } catch (error) {
        logger.warn(`解析现有文件 ${fileName} 失败: ${error}`);
      }
    }

    // 合并翻译
    const mergedTranslations = {
      ...existingTranslations,
      ...result.translations,
    };

    // 保存合并结果
    const content = formatTranslationFile(mergedTranslations, format);
    writeFileSync(filePath, content, 'utf-8');
    
    const newCount = Object.keys(result.translations).length;
    const totalCount = Object.keys(mergedTranslations).length;
    
    logger.success(`合并 ${fileName} (新增 ${newCount} 个，总计 ${totalCount} 个)`);
  }
}

/**
 * 格式化翻译文件
 */
function formatTranslationFile(translations: Record<string, string>, format: string): string {
  switch (format) {
    case 'json':
      return JSON.stringify(translations, null, 2);
    case 'js':
      return `export default ${JSON.stringify(translations, null, 2)};`;
    case 'ts':
      return `export default ${JSON.stringify(translations, null, 2)} as const;`;
    case 'yaml':
      // 简单的 YAML 生成
      return Object.entries(translations)
        .map(([key, value]) => `${key}: "${value.replace(/"/g, '\\"')}"`)
        .join('\n');
    default:
      return JSON.stringify(translations, null, 2);
  }
}

/**
 * 解析翻译文件
 */
function parseTranslationFile(content: string, format: string): Record<string, string> {
  switch (format) {
    case 'json':
      return JSON.parse(content);
    case 'js':
    case 'ts':
      // 简单的 ES 模块解析
      const match = content.match(/export\s+default\s+(.+);?\s*$/s);
      if (match) {
        return JSON.parse(match[1].replace(/as\s+const/, ''));
      }
      throw new Error('无法解析 ES 模块格式');
    case 'yaml':
      // 简单的 YAML 解析
      const translations: Record<string, string> = {};
      content.split('\n').forEach(line => {
        const match = line.match(/^([^:]+):\s*"?([^"]*)"?$/);
        if (match) {
          translations[match[1].trim()] = match[2].trim().replace(/\\"/g, '"');
        }
      });
      return translations;
    default:
      throw new Error(`不支持的文件格式: ${format}`);
  }
}

export const pull = new Command('pull')
  .description('从 Vika 云端拉取翻译')
  .option('-o, --output <directory>', '输出目录')
  .option('-l, --language <languages...>', '指定拉取的语言')
  .option('-f, --force', '强制覆盖本地文件')
  .option('-m, --merge', '合并到现有文件')
  .option('--format <format>', '输出格式 (json|yaml|js|ts)')
  .action(pullCommand);
