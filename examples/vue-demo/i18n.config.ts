import type { I18nConfig } from '@translink/i18n-runtime';

const config: I18nConfig = {
  // 默认语言
  defaultLanguage: 'zh-CN',
  
  // 回退语言
  fallbackLanguage: 'zh-CN',
  
  // 支持的语言列表
  supportedLanguages: ['zh-CN', 'en-US', 'ja-JP'],
  
  // 语言文件路径模板
  loadPath: './src/locales/{{lng}}.json',
  
  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5 分钟
    storage: 'localStorage'
  },
  
  // 插值配置
  interpolation: {
    prefix: '{{',
    suffix: '}}',
    escapeValue: true,
    format: (value, format, lng) => {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      if (format === 'currency') {
        return new Intl.NumberFormat(lng, {
          style: 'currency',
          currency: lng === 'zh-CN' ? 'CNY' : 'USD'
        }).format(value);
      }
      return value;
    }
  },
  
  // 调试模式
  debug: true,
  
  // 预加载配置
  preload: {
    languages: ['zh-CN'],
    timing: 'immediate',
    namespaces: ['translation']
  }
};

export default config;
