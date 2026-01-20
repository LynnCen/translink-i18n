import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
  },
  tsconfig: './tsconfig.build.json',
  sourcemap: true,
  clean: true,
  external: [
    'vite',
    'gogocode',
    'fast-glob',
    'chokidar',
    'picocolors',
    'magic-string',
  ],
  banner: {
    js: '',
  },
  target: 'node16',
  splitting: false,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
});
