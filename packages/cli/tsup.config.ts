import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/index.ts',
  },
  format: ['esm'],
  target: 'node16',
  clean: true,
  dts: false, // 暂时禁用类型生成以快速测试
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
