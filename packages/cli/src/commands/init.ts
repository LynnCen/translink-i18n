import { Command } from 'commander';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import inquirer from 'inquirer';
import { logger } from '../utils/logger.js';

interface InitOptions {
  force?: boolean;
  typescript?: boolean;
}

const CONFIG_TEMPLATE_TS = `import type { I18nConfig } from '@translink/i18n-cli';

export default {
  // 扫描配置
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    functions: ['t', '$tsl', 'i18n.t'],
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js'],
  },
  
  // 哈希配置
  hash: {
    algorithm: 'sha256',
    length: 8,
    includeContext: true,
    contextFields: ['componentName', 'functionName'],
  },
  
  // 语言配置
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
    fallback: 'zh-CN',
  },
  
  // 输出配置
  output: {
    directory: 'src/locales',
    format: 'json',
    splitByNamespace: false,
    flattenKeys: false,
  },
  
  // 插件配置
  plugins: [],
} satisfies I18nConfig;
`;

const CONFIG_TEMPLATE_JS = `/** @type {import('@translink/i18n-cli').I18nConfig} */
export default {
  // 扫描配置
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    functions: ['t', '$tsl', 'i18n.t'],
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js'],
  },
  
  // 哈希配置
  hash: {
    algorithm: 'sha256',
    length: 8,
    includeContext: true,
    contextFields: ['componentName', 'functionName'],
  },
  
  // 语言配置
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
    fallback: 'zh-CN',
  },
  
  // 输出配置
  output: {
    directory: 'src/locales',
    format: 'json',
    splitByNamespace: false,
    flattenKeys: false,
  },
  
  // 插件配置
  plugins: [],
};
`;

async function initCommand(options: InitOptions) {
  logger.title('初始化 TransLink I18n 配置');

  const cwd = process.cwd();
  const useTypeScript = options.typescript ?? true;
  const configFileName = useTypeScript ? 'translink.config.ts' : 'translink.config.js';
  const configPath = resolve(cwd, configFileName);

  // 检查配置文件是否已存在
  if (existsSync(configPath) && !options.force) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `配置文件 ${configFileName} 已存在，是否覆盖？`,
        default: false,
      },
    ]);

    if (!overwrite) {
      logger.info('取消初始化');
      return;
    }
  }

  // 交互式配置
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'defaultLanguage',
      message: '默认语言:',
      default: 'zh-CN',
    },
    {
      type: 'checkbox',
      name: 'supportedLanguages',
      message: '支持的语言:',
      choices: [
        { name: '中文 (zh-CN)', value: 'zh-CN', checked: true },
        { name: '英文 (en-US)', value: 'en-US', checked: true },
        { name: '日文 (ja-JP)', value: 'ja-JP' },
        { name: '韩文 (ko-KR)', value: 'ko-KR' },
        { name: '法文 (fr-FR)', value: 'fr-FR' },
        { name: '德文 (de-DE)', value: 'de-DE' },
      ],
      validate: (input) => {
        return input.length > 0 ? true : '请至少选择一种语言';
      },
    },
    {
      type: 'input',
      name: 'outputDirectory',
      message: '语言文件输出目录:',
      default: 'src/locales',
    },
    {
      type: 'list',
      name: 'outputFormat',
      message: '语言文件格式:',
      choices: [
        { name: 'JSON', value: 'json' },
        { name: 'YAML', value: 'yaml' },
        { name: 'TypeScript', value: 'ts' },
        { name: 'JavaScript', value: 'js' },
      ],
      default: 'json',
    },
  ]);

  // 生成配置内容
  let configContent = useTypeScript ? CONFIG_TEMPLATE_TS : CONFIG_TEMPLATE_JS;
  
  // 替换配置值
  configContent = configContent
    .replace("default: 'zh-CN',", `default: '${answers.defaultLanguage}',`)
    .replace(
      "supported: ['zh-CN', 'en-US'],",
      `supported: [${answers.supportedLanguages.map((lang: string) => `'${lang}'`).join(', ')}],`
    )
    .replace("fallback: 'zh-CN',", `fallback: '${answers.defaultLanguage}',`)
    .replace("directory: 'src/locales',", `directory: '${answers.outputDirectory}',`)
    .replace("format: 'json',", `format: '${answers.outputFormat}',`);

  try {
    // 写入配置文件
    writeFileSync(configPath, configContent, 'utf-8');
    logger.success(`配置文件已创建: ${configFileName}`);

    // 创建输出目录
    const outputDir = resolve(cwd, answers.outputDirectory);
    if (!existsSync(outputDir)) {
      const { createDir } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createDir',
          message: `是否创建输出目录 ${answers.outputDirectory}？`,
          default: true,
        },
      ]);

      if (createDir) {
        const { mkdirSync } = await import('fs');
        mkdirSync(outputDir, { recursive: true });
        logger.success(`输出目录已创建: ${answers.outputDirectory}`);
      }
    }

    logger.br();
    logger.success('初始化完成！你可以运行以下命令开始使用:');
    logger.info('  translink extract  # 提取翻译文本');
    logger.info('  translink build    # 构建语言包');
    logger.info('  translink analyze # 分析翻译覆盖率');
  } catch (error) {
    logger.error(`创建配置文件失败: ${error}`);
    process.exit(1);
  }
}

export const init = new Command('init')
  .description('初始化 TransLink I18n 配置')
  .option('-f, --force', '强制覆盖已存在的配置文件')
  .option('--typescript', '使用 TypeScript 配置文件', true)
  .option('--javascript', '使用 JavaScript 配置文件')
  .action(async (options) => {
    if (options.javascript) {
      options.typescript = false;
    }
    await initCommand(options);
  });
