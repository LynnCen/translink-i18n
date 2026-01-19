import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { init } from './commands/init.js';
import { extract } from './commands/extract.js';
import { build } from './commands/build.js';
import { analyze } from './commands/analyze.js';
import { exportCmd } from './commands/export.js';
import { importCmd } from './commands/import.js';
import { translate } from './commands/translate.js';
import { logger } from './utils/logger.js';
import { PluginManager } from './plugins/manager.js';
import { configManager } from './utils/config.js';

// 导出类型
export type {
  I18nConfig,
  ExtractResult,
  TranslationItem,
} from './types/config.js';

// 导出配置辅助函数和默认配置
export { defineConfig, DEFAULT_CONFIG } from './utils/config.js';

// 导出插件类型
export type {
  I18nPlugin,
  PluginMetadata,
  PluginConfig,
  PluginContext,
  PushResult,
  PullResult,
  TranslationStats,
} from './plugins/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取 package.json 获取版本信息
const packageJsonPath = resolve(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const program = new Command();

program
  .name('translink')
  .description('TransLink I18n - 现代化的国际化工具集')
  .version(packageJson.version)
  .hook('preAction', () => {
    // 在每个命令执行前显示标题
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      return;
    }
    logger.title('连接不同语言的智能桥梁');
  });

// 初始化插件系统
const pluginManager = new PluginManager();

// 异步初始化插件（在命令执行前）
program.hook('preAction', async () => {
  try {
    const config = await configManager.loadConfig();
    await pluginManager.initialize(
      {
        config,
        logger,
        cwd: process.cwd(),
      },
      config.plugins || []
    );

    // 注册插件命令
    pluginManager.registerPluginCommands(program);
  } catch (error) {
    // 插件加载失败不影响主命令执行
    if (process.env.DEBUG) {
      logger.debug(`Plugin initialization failed: ${error}`);
    }
  }
});

// 注册所有命令
program.addCommand(init);
program.addCommand(extract);
program.addCommand(build);
program.addCommand(analyze);
program.addCommand(exportCmd);
program.addCommand(importCmd);
program.addCommand(translate);

// 添加全局选项
program
  .option('-d, --debug', '启用调试模式')
  .option('-q, --quiet', '静默模式')
  .hook('preAction', thisCommand => {
    const options = thisCommand.opts();
    if (options.debug) {
      process.env.DEBUG = '1';
    }
    if (options.quiet) {
      process.env.QUIET = '1';
    }
  });

// 错误处理
program.exitOverride(err => {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  logger.error(`命令执行失败: ${err.message}`);
  process.exit(1);
});

// 未知命令处理
program.on('command:*', operands => {
  logger.error(`未知命令: ${operands[0]}`);
  logger.info('运行 translink --help 查看可用命令');
  process.exit(1);
});

// 解析命令行参数
program.parse();

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
