import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createI18nPlugin } from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    vue(),
    
    // TransLink I18n 插件配置
    createI18nPlugin({
      // 基础配置
      configFile: 'i18n.config.ts',
      defaultLanguage: 'zh-CN',
      supportedLanguages: ['zh-CN', 'en-US', 'ja-JP'],
      
      // 文件处理
      include: ['src/**/*.{vue,ts,js}'],
      exclude: ['node_modules/**', 'dist/**'],
      
      // 功能开关
      transformTsl: true,        // 转换 $tsl 为 t(hash)
      hmr: true,                 // 热更新
      lazyLoading: true,         // 懒加载
      debug: true,               // 调试模式
      
      // 语言文件路径
      loadPath: './src/locales/{{lng}}.json',
      
      // 预加载配置
      preload: {
        languages: ['zh-CN'],    // 预加载中文
        timing: 'immediate',     // 立即加载
        namespaces: ['translation', 'common']
      },
      
      // 自定义转换规则
      transformRules: [
        {
          // 转换 console.log 中的中文
          pattern: /console\.log\(['"`]([^'"`]*[\u4e00-\u9fff][^'"`]*)['"`]\)/g,
          transform: (match, text) => {
            const hash = require('crypto').createHash('md5').update(text).digest('hex').substring(0, 8);
            return `console.log(t('${hash}'))`;
          },
          productionOnly: false
        }
      ]
    })
  ],
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true
  },
  
  // 构建配置
  build: {
    rollupOptions: {
      output: {
        // 语言文件单独打包
        manualChunks: {
          'i18n-zh-CN': ['virtual:i18n-language-zh-CN'],
          'i18n-en-US': ['virtual:i18n-language-en-US'],
          'i18n-ja-JP': ['virtual:i18n-language-ja-JP']
        }
      }
    }
  }
});
