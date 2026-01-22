import { defineConfig } from '@translink/i18n-cli';

export default defineConfig({
  // Language Configuration
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
  },

  // Extract Configuration
  extract: {
    patterns: ['src/**/*.{tsx,ts,jsx,js}'],
    functions: ['t', '$t', 'i18n.t'],
  },

  // Output Configuration
  output: {
    directory: 'src/locales',
    format: 'json',
  },
  hash: {
    algorithm: 'md5',
  },

  // Optional: Plugins
  plugins: [],
});
