import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // 暂时禁用 DTS 生成
  sourcemap: true,
  clean: true,
  external: ['vite', 'gogocode', 'fast-glob', 'chokidar', 'picocolors', 'magic-string'],
  banner: {
    js: '',
  },
  target: 'node16',
  splitting: false,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js'
    }
  }
});
