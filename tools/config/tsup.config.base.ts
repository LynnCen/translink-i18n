import { defineConfig, type Options } from 'tsup';

/**
 * 共享的 tsup 基础配置
 * 所有包可以基于此配置进行扩展
 */
export const createBaseConfig = (options: Options = {}): Options => {
  return defineConfig({
    clean: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    target: 'node16',
    ...options,
  });
};
