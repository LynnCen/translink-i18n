import { defineConfig } from 'tsup';
import { createConfig } from '../../../tools/config/tsup.config.base.js';

export default createConfig({
  entry: ['src/index.ts'],
  external: ['@translink/i18n-cli'],
});

