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

const config: I18nConfig = {
  // 项目信息
  project: {
    name: '{{PROJECT_NAME}}',
    version: '1.0.0',
  },

  // 扫描配置
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    functions: ['t', '$tsl', '$t', 'i18n.t'],
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js'],
    incremental: true,
    createEmptyTranslations: true,
  },

  // 哈希配置
  hash: {
    enabled: {{HASH_ENABLED}},
    algorithm: 'sha256',
    length: 8,
    numericOnly: {{NUMERIC_ONLY}},
    includeContext: false,
    contextFields: ['componentName', 'functionName'],
  },

  // 语言配置
  languages: {
    source: '{{SOURCE_LANGUAGE}}',
    default: '{{DEFAULT_LANGUAGE}}',
    supported: [{{SUPPORTED_LANGUAGES}}],
    fallback: '{{FALLBACK_LANGUAGE}}',
  },

  // 输出配置
  output: {
    directory: '{{OUTPUT_DIRECTORY}}',
    format: '{{OUTPUT_FORMAT}}',
    indent: 2,
    sortKeys: true,
    splitByNamespace: false,
    flattenKeys: false,
  },

  // 导入导出配置
  importExport: {
    format: '{{IMPORT_EXPORT_FORMAT}}',
    excel: {
      sheetName: 'Translations',
      includeMetadata: {{INCLUDE_METADATA}},
      freezeHeader: true,
      autoWidth: true,
    },
    csv: {
      delimiter: ',',
      encoding: 'utf-8',
      includeHeaders: true,
    },
    columns: {
      key: true,
      status: true,
      context: {{INCLUDE_METADATA}},
      file: {{INCLUDE_METADATA}},
      line: {{INCLUDE_METADATA}},
    },
  },

  // 构建配置
  build: {
    minify: true,
    sourcemap: false,
    outputDir: 'dist/locales',
  },

  // CLI 输出配置
  cli: {
    verbose: false,
    table: {
      enabled: true,
      maxRows: 20,
      showDiff: true,
    },
  },

  // 插件配置
  plugins: [],
};

export default config;
`;

const CONFIG_TEMPLATE_JS = `/** @type {import('@translink/i18n-cli').I18nConfig} */
export default {
  // 项目信息
  project: {
    name: '{{PROJECT_NAME}}',
    version: '1.0.0',
  },

  // 扫描配置
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    functions: ['t', '$tsl', '$t', 'i18n.t'],
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js'],
    incremental: true,
    createEmptyTranslations: true,
  },

  // 哈希配置
  hash: {
    enabled: {{HASH_ENABLED}},
    algorithm: 'sha256',
    length: 8,
    numericOnly: {{NUMERIC_ONLY}},
    includeContext: false,
    contextFields: ['componentName', 'functionName'],
  },

  // 语言配置
  languages: {
    source: '{{SOURCE_LANGUAGE}}',
    default: '{{DEFAULT_LANGUAGE}}',
    supported: [{{SUPPORTED_LANGUAGES}}],
    fallback: '{{FALLBACK_LANGUAGE}}',
  },

  // 输出配置
  output: {
    directory: '{{OUTPUT_DIRECTORY}}',
    format: '{{OUTPUT_FORMAT}}',
    indent: 2,
    sortKeys: true,
    splitByNamespace: false,
    flattenKeys: false,
  },

  // 导入导出配置
  importExport: {
    format: '{{IMPORT_EXPORT_FORMAT}}',
    excel: {
      sheetName: 'Translations',
      includeMetadata: {{INCLUDE_METADATA}},
      freezeHeader: true,
      autoWidth: true,
    },
    csv: {
      delimiter: ',',
      encoding: 'utf-8',
      includeHeaders: true,
    },
    columns: {
      key: true,
      status: true,
      context: {{INCLUDE_METADATA}},
      file: {{INCLUDE_METADATA}},
      line: {{INCLUDE_METADATA}},
    },
  },

  // 构建配置
  build: {
    minify: true,
    sourcemap: false,
    outputDir: 'dist/locales',
  },

  // CLI 输出配置
  cli: {
    verbose: false,
    table: {
      enabled: true,
      maxRows: 20,
      showDiff: true,
    },
  },

  // 插件配置
  plugins: [],
};
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

  // 交互式配置
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '项目名称:',
      default: 'my-app',
    },
    {
      type: 'input',
      name: 'sourceLanguage',
      message: '源语言（代码中使用的语言）:',
      default: 'zh-CN',
    },
    {
      type: 'input',
      name: 'defaultLanguage',
      message: '默认语言（用户首次访问时的语言）:',
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
      validate: input => {
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
    {
      type: 'confirm',
      name: 'useHash',
      message: '是否使用哈希作为 key（推荐）:',
      default: true,
    },
    {
      type: 'confirm',
      name: 'numericOnly',
      message: '是否只使用数字 key（推荐）:',
      default: true,
      when: answers => answers.useHash,
    },
    {
      type: 'list',
      name: 'importExportFormat',
      message: '导入导出默认格式:',
      choices: [
        { name: 'Excel', value: 'excel' },
        { name: 'CSV', value: 'csv' },
        { name: 'JSON', value: 'json' },
      ],
      default: 'excel',
    },
    {
      type: 'confirm',
      name: 'includeMetadata',
      message: '是否包含调试信息（Context, File, Line）:',
      default: false,
    },
  ]);

  // 生成配置内容
  let configContent = useTypeScript ? CONFIG_TEMPLATE_TS : CONFIG_TEMPLATE_JS;

  // 替换配置值
  const supportedLanguagesStr = answers.supportedLanguages
    .map((lang: string) => `'${lang}'`)
    .join(', ');

  configContent = configContent
    .replace('{{PROJECT_NAME}}', answers.projectName)
    .replace('{{SOURCE_LANGUAGE}}', answers.sourceLanguage)
    .replace('{{DEFAULT_LANGUAGE}}', answers.defaultLanguage)
    .replace('{{SUPPORTED_LANGUAGES}}', supportedLanguagesStr)
    .replace('{{FALLBACK_LANGUAGE}}', answers.defaultLanguage)
    .replace('{{OUTPUT_DIRECTORY}}', answers.outputDirectory)
    .replace('{{OUTPUT_FORMAT}}', answers.outputFormat)
    .replace('{{HASH_ENABLED}}', answers.useHash ? 'true' : 'false')
    .replace('{{NUMERIC_ONLY}}', answers.numericOnly ? 'true' : 'false')
    .replace('{{IMPORT_EXPORT_FORMAT}}', answers.importExportFormat)
    .replace(
      /{{INCLUDE_METADATA}}/g,
      answers.includeMetadata ? 'true' : 'false'
    );

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
        writeFileSync(localeFilePath, '{}\\n', 'utf-8');
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
