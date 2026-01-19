import { defineConfig } from '@translink/i18n-cli';

export default defineConfig({
  // Language Configuration
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
  },

  // Output Configuration
  output: {
    directory: 'src/locales',
  },

  // Optional: Plugins
  plugins: [],
});
