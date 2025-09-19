import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createI18nPlugin } from '@translink/vite-plugin-i18n';

export default defineConfig({
  plugins: [
    vue(),
    createI18nPlugin({
      configFile: 'i18n.config.ts',
      transformTsl: true,
      hmr: true,
      lazyLoading: true,
      debug: true,
      include: ['src/**/*.{vue,ts,js}'],
      exclude: ['node_modules/**'],
      preload: {
        languages: ['zh-CN'],
        timing: 'immediate'
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  }
});
