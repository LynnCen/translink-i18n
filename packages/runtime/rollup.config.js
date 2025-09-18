import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  'vue',
  'react',
  'react/jsx-runtime'
];

const baseConfig = {
  external,
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      exclude: ['**/*.test.*', '**/*.spec.*'],
    }),
  ],
};

export default [
  // 主包构建
  {
    ...baseConfig,
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
  },

  // Vue 适配器构建
  {
    ...baseConfig,
    input: 'src/vue.ts',
    output: [
      {
        file: 'dist/vue.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/vue.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
  },

  // React 适配器构建
  {
    ...baseConfig,
    input: 'src/react.ts',
    output: [
      {
        file: 'dist/react.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: 'dist/react.esm.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
  },

  // 暂时禁用类型定义生成，避免构建问题
  // TODO: 修复类型定义构建问题
];
