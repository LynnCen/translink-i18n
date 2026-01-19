import { Command } from 'commander';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import inquirer from 'inquirer';
import { logger } from '../utils/logger.js';

interface InitOptions {
  force?: boolean;
  typescript?: boolean;
}

const CONFIG_TEMPLATE_TS = `import { defineConfig } from '@translink/i18n-cli';

export default defineConfig({
  // Language Configuration
  languages: {
    default: '{{DEFAULT_LANGUAGE}}',
    supported: [{{SUPPORTED_LANGUAGES}}],
  },

  // Output Configuration
  output: {
    directory: '{{OUTPUT_DIRECTORY}}',
  },

  // Optional: Plugins
  plugins: [],
});
`;

const CONFIG_TEMPLATE_JS = `import { defineConfig } from '@translink/i18n-cli';

export default defineConfig({
  // Language Configuration
  languages: {
    default: '{{DEFAULT_LANGUAGE}}',
    supported: [{{SUPPORTED_LANGUAGES}}],
  },

  // Output Configuration
  output: {
    directory: '{{OUTPUT_DIRECTORY}}',
  },

  // Optional: Plugins
  plugins: [],
});
`;

async function initCommand(options: InitOptions) {
  logger.title('初始化 TransLink I18n 配置');

  const cwd = process.cwd();
  const useTypeScript = options.typescript ?? true;
  const configFileName = useTypeScript
    ? 'translink.config.ts'
    : 'translink.config.js';
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

  // 交互式配置 - 简化版，只询问核心配置
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'defaultLanguage',
      message: 'Default language (used in code and for users):',
      default: 'zh-CN',
    },
    {
      type: 'checkbox',
      name: 'supportedLanguages',
      message: 'Supported languages:',
      choices: [
        { name: 'Chinese (zh-CN)', value: 'zh-CN', checked: true },
        { name: 'English (en-US)', value: 'en-US', checked: true },
        { name: 'Japanese (ja-JP)', value: 'ja-JP' },
        { name: 'Korean (ko-KR)', value: 'ko-KR' },
        { name: 'French (fr-FR)', value: 'fr-FR' },
        { name: 'German (de-DE)', value: 'de-DE' },
      ],
      validate: input => {
        return input.length > 0 ? true : 'Please select at least one language';
      },
    },
    {
      type: 'input',
      name: 'outputDirectory',
      message: 'Output directory for locale files:',
      default: 'src/locales',
    },
  ]);

  // 生成配置内容
  let configContent = useTypeScript ? CONFIG_TEMPLATE_TS : CONFIG_TEMPLATE_JS;

  // 替换配置值
  const supportedLanguagesStr = answers.supportedLanguages
    .map((lang: string) => `'${lang}'`)
    .join(', ');

  configContent = configContent
    .replace('{{DEFAULT_LANGUAGE}}', answers.defaultLanguage)
    .replace('{{SUPPORTED_LANGUAGES}}', supportedLanguagesStr)
    .replace('{{OUTPUT_DIRECTORY}}', answers.outputDirectory);

  try {
    // 写入配置文件
    writeFileSync(configPath, configContent, 'utf-8');
    logger.success(`✓ 创建配置文件: ${configFileName}`);

    // 创建输出目录
    const outputDir = resolve(cwd, answers.outputDirectory);
    const { mkdirSync } = await import('fs');

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
      logger.success(`✓ 创建目录: ${answers.outputDirectory}/`);
    }

    // 创建初始语言文件
    for (const lang of answers.supportedLanguages) {
      const localeFilePath = resolve(outputDir, `${lang}.json`);
      if (!existsSync(localeFilePath)) {
        writeFileSync(localeFilePath, '{}\n', 'utf-8');
        logger.success(
          `✓ 创建语言文件: ${answers.outputDirectory}/${lang}.json`
        );
      }
    }

    logger.br();
    logger.success('🎉 初始化完成！你可以运行以下命令开始使用:');
    logger.info('');
    logger.info('  npx translink extract  # 提取代码中的翻译文本');
    logger.info('  npx translink export   # 导出翻译为 Excel/CSV');
    logger.info('  npx translink import   # 导入已翻译的文件');
    logger.info('  npx translink build    # 构建优化的语言包');
    logger.info('  npx translink analyze  # 分析翻译覆盖率');
    logger.info('');
  } catch (error) {
    logger.error(`初始化失败: ${error}`);
    process.exit(1);
  }
}

export const init = new Command('init')
  .description('初始化 TransLink I18n 配置')
  .option('-f, --force', '强制覆盖已存在的配置文件')
  .option('--typescript', '使用 TypeScript 配置文件', true)
  .option('--javascript', '使用 JavaScript 配置文件')
  .action(async options => {
    if (options.javascript) {
      options.typescript = false;
    }
    await initCommand(options);
  });
