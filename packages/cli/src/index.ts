import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { init } from './commands/init.js';
import { extract } from './commands/extract.js';
import { build } from './commands/build.js';
import { push } from './commands/push.js';
import { pull } from './commands/pull.js';
import { analyze } from './commands/analyze.js';
import { logger } from './utils/logger.js';

// 导出类型
export type {
  I18nConfig,
  ExtractResult,
  TranslationItem,
} from './types/config.js';

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

// 注册所有命令
program.addCommand(init);
program.addCommand(extract);
program.addCommand(build);
program.addCommand(push);
program.addCommand(pull);
program.addCommand(analyze);

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
