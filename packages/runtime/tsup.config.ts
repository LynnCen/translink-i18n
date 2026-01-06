import { defineConfig } from 'tsup';

export default defineConfig([
  // 主包构建
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: {
      resolve: true,
    },
    tsconfig: './tsconfig.build.json',
    sourcemap: true,
    clean: true,
    external: ['vue', 'react', 'react/jsx-runtime'],
    outDir: 'dist',
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.js' : '.esm.js',
      };
    },
  },
  // Vue 适配器构建
  {
    entry: ['src/vue.ts'],
    format: ['cjs', 'esm'],
    dts: {
      resolve: true,
      entry: ['src/vue.ts'],
    },
    tsconfig: './tsconfig.build.json',
    sourcemap: true,
    external: ['vue'],
    outDir: 'dist',
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.js' : '.esm.js',
      };
    },
  },
  // React 适配器构建
  {
    entry: ['src/react.ts'],
    format: ['cjs', 'esm'],
    dts: {
      resolve: true,
      entry: ['src/react.ts'],
    },
    tsconfig: './tsconfig.build.json',
    sourcemap: true,
    external: ['react', 'react/jsx-runtime'],
    outDir: 'dist',
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.js' : '.esm.js',
      };
    },
  },
]);

