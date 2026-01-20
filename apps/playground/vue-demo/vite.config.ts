import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/**
 * 最佳实践：集成 Vite I18n 插件
 * 提供 HMR、懒加载、代码转换等功能
 *
 * 注意：Vite 插件当前处于开发阶段，暂不启用
 * 可以先使用 runtime 的完整功能进行开发
 */
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
  },
  // 最佳实践：优化构建
  build: {
    rollupOptions: {
      output: {
        // 按语言分割 chunk
        manualChunks: {
          'i18n-runtime': ['@translink/i18n-runtime'],
        },
      },
    },
  },
});
