import type { I18nConfig } from '@translink/i18n-cli';

const config: I18nConfig = {
  // 项目信息
  project: {
    name: 'my-app',
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
    enabled: true,
    algorithm: 'sha256',
    length: 8,
    numericOnly: true,
    includeContext: false,
    contextFields: ['componentName', 'functionName'],
  },

  // 语言配置
  languages: {
    source: 'zh-CN',
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US', 'ja-JP'],
    fallback: 'zh-CN',
  },

  // 输出配置
  output: {
    directory: 'src/locales',
    format: 'json',
    indent: 2,
    sortKeys: true,
    splitByNamespace: false,
    flattenKeys: false,
  },

  // 导入导出配置
  importExport: {
    format: 'excel',
    excel: {
      sheetName: 'Translations',
      includeMetadata: false,
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
      context: false,
      file: false,
      line: false,
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
