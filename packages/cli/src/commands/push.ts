import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { configManager } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { VikaClient } from '../integrations/vika-client.js';
import type { TranslationItem } from '../types/config.js';

interface PushOptions {
  input?: string;
  force?: boolean;
  dryRun?: boolean;
  language?: string;
}

async function pushCommand(options: PushOptions) {
  logger.title('推送翻译到云端');

  try {
    // 加载配置
    const config = await configManager.loadConfig();
    
    // 检查 Vika 配置
    if (!config.vika.apiKey || !config.vika.datasheetId) {
      logger.error('Vika 配置缺失');
      logger.info('请设置以下环境变量:');
      logger.info('  export VIKA_API_KEY="your_api_key"');
      logger.info('  export VIKA_DATASHEET_ID="your_datasheet_id"');
      logger.br();
      logger.info('或在配置文件中设置 vika.apiKey 和 vika.datasheetId');
      process.exit(1);
    }

    const inputDir = options.input || config.output.directory;
    const inputPath = resolve(process.cwd(), inputDir);

    // 检查输入目录
    if (!existsSync(inputPath)) {
      logger.error(`输入目录不存在: ${inputDir}`);
      logger.info('请先运行 translink extract 生成语言文件');
      process.exit(1);
    }

    // 读取提取映射文件
    const mappingPath = resolve(inputPath, 'extraction-mapping.json');
    if (!existsSync(mappingPath)) {
      logger.error('未找到提取映射文件');
      logger.info('请先运行 translink extract 生成映射文件');
      process.exit(1);
    }

    logger.info(`输入目录: ${inputDir}`);
    logger.info(`Vika 表格: ${config.vika.datasheetId}`);
    logger.br();

    // 读取翻译数据
    const mappingData = JSON.parse(readFileSync(mappingPath, 'utf-8'));
    const translations: TranslationItem[] = mappingData.map((item: any) => ({
      key: item.key,
      text: item.text,
      context: item.context ? JSON.stringify(item.context) : undefined,
      filePath: item.file,
      status: 'pending' as const,
    }));

    logger.info(`发现 ${translations.length} 个翻译项`);

    if (options.dryRun) {
      logger.info('🔍 试运行模式，显示前 10 个项目:');
      translations.slice(0, 10).forEach((item, index) => {
        logger.info(`  ${index + 1}. ${item.key} -> "${item.text.substring(0, 50)}..."`);
      });
      
      if (translations.length > 10) {
        logger.info(`  ... 还有 ${translations.length - 10} 个项目`);
      }
      return;
    }

    // 初始化 Vika 客户端
    const vikaClient = new VikaClient(config.vika.apiKey, config.vika.datasheetId);

    // 测试连接
    logger.startSpinner('测试 Vika 连接...');
    const isConnected = await vikaClient.testConnection();
    
    if (!isConnected) {
      logger.stopSpinner('✗ 连接失败', false);
      logger.error('无法连接到 Vika，请检查:');
      logger.info('  1. API Key 是否正确');
      logger.info('  2. Datasheet ID 是否正确');
      logger.info('  3. 网络连接是否正常');
      process.exit(1);
    }
    
    logger.stopSpinner('✓ 连接成功');

    // 推送翻译
    const stats = await vikaClient.pushTranslations(translations);

    // 显示结果
    logger.br();
    logger.success('📊 推送统计:');
    logger.info(`  新增翻译: ${stats.created} 个`);
    logger.info(`  更新翻译: ${stats.updated} 个`);
    
    if (stats.errors > 0) {
      logger.warn(`  推送失败: ${stats.errors} 个`);
    }

    logger.br();
    logger.success('🎉 推送完成！');
    logger.info('翻译人员现在可以在 Vika 中进行翻译工作');
    logger.info('完成翻译后，可以运行 translink pull 拉取翻译结果');

  } catch (error) {
    logger.error(`推送失败: ${error}`);
    process.exit(1);
  }
}

export const push = new Command('push')
  .description('推送翻译到 Vika 云端')
  .option('-i, --input <directory>', '输入目录')
  .option('-f, --force', '强制推送，覆盖云端修改')
  .option('--dry-run', '试运行，不实际推送')
  .option('-l, --language <language>', '指定推送的语言')
  .action(pushCommand);
