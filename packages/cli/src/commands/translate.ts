/**
 * AI 自动翻译命令
 */

import { Command } from 'commander';
import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { configManager } from '../utils/config.js';
import { AITranslationEngine } from '../ai/engine.js';
import { logger } from '../utils/logger.js';
import Table from 'cli-table3';

interface TranslateOptions {
  from?: string;
  to?: string;
  provider?: string;
  force?: boolean;
  keys?: string;
  dryRun?: boolean;
  estimateCost?: boolean;
  stream?: boolean; // 新增：是否使用流式响应
}

const translate = new Command('translate')
  .description('使用 AI 自动翻译多语言文件')
  .option('-f, --from <lang>', '源语言 (默认为 config.languages.source)')
  .option('-t, --to <langs>', '目标语言，逗号分隔 (默认为所有支持的语言)')
  .option(
    '-p, --provider <name>',
    'AI 提供商 (deepseek, gemini, openai, anthropic)'
  )
  .option('--force', '强制重新翻译已有的翻译')
  .option('--keys <keys>', '只翻译指定的键，逗号分隔')
  .option('--dry-run', '预览模式，不写入文件')
  .option('--stream', '使用流式响应（实时显示翻译进度）')
  .option('--estimate-cost', '估算翻译成本')
  .action(async (options: TranslateOptions) => {
    await translateCommand(options);
  });

export { translate };

async function translateCommand(options: TranslateOptions) {
  logger.title('AI 自动翻译');

  try {
    // 加载配置
    const config = await configManager.loadConfig();

    if (!config.aiTranslation) {
      logger.error(
        '未配置 AI 翻译。请在 translink.config.ts 中添加 aiTranslation 配置'
      );
      logger.br();
      logger.info('示例配置:');
      logger.info(`
aiTranslation: {
  defaultProvider: 'deepseek',
  providers: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: 'https://api.deepseek.com',
    },
  },
  options: {
    cache: true,
    batchSize: 20,
    concurrency: 3,
  },
  quality: {
    detectUntranslated: true,
    minLengthRatio: 0.3,
    maxLengthRatio: 3.0,
  },
}
      `);
      process.exit(1);
    }

    const sourceLang = options.from || config.languages.source;
    const targetLangs = options.to
      ? options.to.split(',').map(l => l.trim())
      : config.languages.supported.filter(l => l !== sourceLang);

    const provider =
      options.provider || config.aiTranslation.defaultProvider || 'deepseek';

    logger.info(`源语言: ${sourceLang}`);
    logger.info(`目标语言: ${targetLangs.join(', ')}`);
    logger.info(`AI 提供商: ${provider}`);
    logger.br();

    // 构建文件路径
    const outputDir = resolve(process.cwd(), config.output.directory);
    const sourceFile = resolve(outputDir, `${sourceLang}.json`);

    if (!existsSync(sourceFile)) {
      logger.error(`源语言文件不存在: ${sourceFile}`);
      logger.info('请先运行 `translink extract` 提取翻译文本');
      process.exit(1);
    }

    // 估算成本模式
    if (options.estimateCost) {
      await estimateCost(sourceFile, targetLangs, provider, config);
      return;
    }

    // 初始化翻译引擎
    const engine = new AITranslationEngine(config.aiTranslation);

    // 解析 keys 参数
    const keys = options.keys ? options.keys.split(',').map(k => k.trim()) : [];

    // 翻译每个目标语言
    const results = [];
    for (const targetLang of targetLangs) {
      logger.info(`\n正在翻译: ${sourceLang} → ${targetLang}`);
      logger.info('─'.repeat(50));

      if (options.dryRun) {
        logger.info('【预览模式】不会写入文件');
      }

      const targetFile = resolve(outputDir, `${targetLang}.json`);

      const report = await engine.translateLanguageFile({
        sourceFile,
        targetFile,
        sourceLang,
        targetLang,
        provider,
        force: options.force,
        keys,
        dryRun: options.dryRun,
        stream: options.stream,
        onProgress: options.stream
          ? progress => {
              // 流式进度显示
              logger.info(
                `[${progress.current}/${progress.total}] ${progress.currentKey}`
              );
            }
          : undefined,
      });

      results.push({
        lang: targetLang,
        ...report,
      });

      // 输出报告
      logger.br();
      displayReport(report, targetLang);
    }

    // 输出汇总
    if (results.length > 1) {
      logger.br();
      logger.info('翻译汇总');
      logger.info('═'.repeat(50));

      const table = new Table({
        head: ['语言', '总计', '已翻译', '已跳过', '失败', '耗时', '成本'],
        colWidths: [10, 10, 10, 10, 10, 12, 12],
      });

      let totalTranslated = 0;
      let totalCost = 0;
      let totalDuration = 0;

      for (const result of results) {
        table.push([
          result.lang,
          result.total,
          result.translated,
          result.skipped,
          result.failed,
          `${((result.duration || 0) / 1000).toFixed(1)}s`,
          `$${(result.cost || 0).toFixed(4)}`,
        ]);

        totalTranslated += result.translated;
        totalCost += result.cost || 0;
        totalDuration += result.duration || 0;
      }

      console.log(table.toString());

      logger.br();
      logger.success(
        `✓ 完成翻译 ${totalTranslated} 项，耗时 ${(totalDuration / 1000).toFixed(1)}s，成本 $${totalCost.toFixed(4)}`
      );
    }

    logger.br();
    logger.success('🎉 所有语言翻译完成！');
  } catch (error: any) {
    logger.error(`翻译失败: ${error.message}`);
    if (error.stack) {
      logger.debug(error.stack);
    }
    process.exit(1);
  }
}

/**
 * 显示翻译报告
 */
function displayReport(report: any, targetLang: string): void {
  const table = new Table({
    colWidths: [20, 15],
  });

  table.push(
    ['总计', report.total],
    ['已翻译', report.translated],
    ['已跳过', report.skipped],
    ['失败', report.failed],
    ['耗时', `${((report.duration || 0) / 1000).toFixed(2)}s`]
  );

  if (report.tokensUsed) {
    table.push(['Tokens', report.tokensUsed.toLocaleString()]);
  }

  if (report.cost !== undefined) {
    table.push(['成本', `$${report.cost.toFixed(4)}`]);
  }

  console.log(table.toString());

  if (report.failed > 0) {
    logger.warn(`${report.failed} 项翻译失败`);
  } else if (report.translated > 0) {
    logger.success(`✓ ${targetLang} 翻译完成`);
  } else {
    logger.info(`无需翻译 ${targetLang}`);
  }
}

/**
 * 估算翻译成本
 */
async function estimateCost(
  sourceFile: string,
  targetLangs: string[],
  provider: string,
  config: any
): Promise<void> {
  const sourceData = JSON.parse(readFileSync(sourceFile, 'utf-8'));

  const itemCount = Object.keys(sourceData).length;
  const avgLength = Math.round(
    Object.values(sourceData).reduce(
      (sum: number, text: any) => sum + text.length,
      0
    ) / itemCount
  );

  // 估算 token 数
  const estimatedTokensPerItem = avgLength * 1.5; // 粗略估算
  const totalTokens = itemCount * estimatedTokensPerItem * targetLangs.length;

  // 成本
  const pricing: Record<string, number> = {
    deepseek: 0.14 / 1_000_000,
    gemini: 0,
    openai: 10.0 / 1_000_000,
  };

  const pricePerToken = pricing[provider] || 1.0 / 1_000_000;
  const estimatedCost = totalTokens * pricePerToken;

  logger.info('📊 成本估算');
  logger.info('─'.repeat(50));

  const table = new Table({
    colWidths: [25, 20],
  });

  table.push(
    ['待翻译项', `${itemCount} 个`],
    ['平均长度', `${avgLength} 字`],
    ['目标语言', targetLangs.join(', ')],
    ['估算 Tokens', totalTokens.toLocaleString()],
    ['AI 提供商', provider],
    ['预计费用', `$${estimatedCost.toFixed(4)}`]
  );

  console.log(table.toString());

  logger.br();
  logger.info('💡 提示：');
  logger.info('- 这是粗略估算，实际成本可能会有差异');
  logger.info('- 启用缓存可以减少重复翻译的成本');
  logger.info('- 使用批量处理可以降低 API 调用次数');
}
