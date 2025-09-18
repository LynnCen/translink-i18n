import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm'],
  target: 'node16',
  clean: true,
  dts: false,
  sourcemap: true,
  splitting: false,
  minify: false,
  external: ['gogocode'],
  banner: {
    js: '',
  },
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
  },
});
