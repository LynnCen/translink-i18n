import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/index.ts',
  },
  format: ['esm'],
  target: 'node16',
  clean: true,
  dts: {
    resolve: true,
  },
  tsconfig: './tsconfig.build.json',
  sourcemap: true,
  splitting: false,
  minify: false,
  external: ['gogocode'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
  },
});
