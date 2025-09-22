import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/index.ts',  // 🔥 直接使用 index.ts 作为 CLI 入口
  },
  format: ['esm'],
  target: 'node16',
  clean: true,
  dts: true,  // 🔥 启用类型文件生成，替代 TypeScript 编译器
  sourcemap: true,
  splitting: false,
  minify: false,
  external: ['gogocode'],
  banner: {
    js: '#!/usr/bin/env node',  // 🔥 为 CLI 文件添加 shebang
  },
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
  },
});
