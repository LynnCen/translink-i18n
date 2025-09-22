import type { I18nConfig } from '@translink/i18n-cli';

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
  
  // 云端配置 (需要配置环境变量)
  vika: {
    apiKey: process.env.VIKA_API_KEY || '',
    datasheetId: process.env.VIKA_DATASHEET_ID || '',
    autoSync: false,
    syncInterval: 3600,
  },
  
  // 插件配置
  plugins: [],
} satisfies I18nConfig;
