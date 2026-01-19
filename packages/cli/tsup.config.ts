import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/index.ts',
  },
  format: ['esm'],
  target: 'node16',
  clean: true,
  dts: true, // ✅ 启用类型声明生成
  tsconfig: './tsconfig.build.json',
  sourcemap: true,
  splitting: false,
  minify: false,
  treeshake: true, // ✅ 启用 tree-shaking
  external: [
    // 标记大型依赖为 external，减小包体积
    'gogocode',
    '@anthropic-ai/sdk',
    '@google/generative-ai',
    'openai',
  ],
  banner: {
    js: '#!/usr/bin/env node',
  },
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
  },
});
