import { vi } from 'vitest';
import type { ResolvedConfig, ViteDevServer } from 'vite';

// Mock Vite APIs
export const createMockResolvedConfig = (overrides: Partial<ResolvedConfig> = {}): ResolvedConfig => ({
  command: 'serve',
  mode: 'development',
  root: '/test/project',
  base: '/',
  publicDir: 'public',
  cacheDir: 'node_modules/.vite',
  resolve: {
    alias: [],
    dedupe: [],
    conditions: [],
    mainFields: [],
    extensions: ['.js', '.ts', '.vue']
  },
  plugins: [],
  css: {},
  esbuild: {},
  server: {},
  build: {
    target: 'modules',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {}
  },
  preview: {},
  env: {},
  define: {},
  ssr: {},
  optimizeDeps: {
    entries: [],
    include: [],
    exclude: []
  },
  worker: {},
  isProduction: false,
  envDir: '/test/project',
  envPrefix: 'VITE_',
  appType: 'spa',
  inlineConfig: {},
  rawConfig: {},
  configFile: undefined,
  configFileDependencies: [],
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    clearScreen: vi.fn(),
    hasErrorLogged: vi.fn(),
    hasWarned: false
  },
  createResolver: vi.fn(),
  ...overrides
} as ResolvedConfig);

export const createMockViteDevServer = (overrides: Partial<ViteDevServer> = {}): ViteDevServer => ({
  config: createMockResolvedConfig(),
  middlewares: {} as any,
  httpServer: {} as any,
  watcher: {
    add: vi.fn(),
    unwatch: vi.fn(),
    getWatched: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    close: vi.fn()
  } as any,
  ws: {
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  } as any,
  moduleGraph: {
    getModuleById: vi.fn(),
    getModulesByFile: vi.fn(),
    invalidateModule: vi.fn(),
    invalidateAll: vi.fn(),
    updateModuleInfo: vi.fn(),
    ensureEntryFromUrl: vi.fn(),
    createFileOnlyEntry: vi.fn(),
    resolveUrl: vi.fn(),
    updateModuleTransformResult: vi.fn(),
    onFileChange: vi.fn()
  } as any,
  ssrLoadModule: vi.fn(),
  ssrFixStacktrace: vi.fn(),
  ssrRewriteStacktrace: vi.fn(),
  ssrTransform: vi.fn(),
  transformRequest: vi.fn(),
  transformIndexHtml: vi.fn(),
  listen: vi.fn(),
  restart: vi.fn(),
  close: vi.fn(),
  printUrls: vi.fn(),
  bindCLIShortcuts: vi.fn(),
  ...overrides
} as ViteDevServer);

// Mock file system
export const createMockFileSystem = (files: Record<string, string>) => {
  const mockFs = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    access: vi.fn(),
    stat: vi.fn(),
    readdir: vi.fn()
  };

  mockFs.readFile.mockImplementation((filePath: string) => {
    const normalizedPath = filePath.replace(/\\/g, '/');
    for (const [path, content] of Object.entries(files)) {
      if (normalizedPath.endsWith(path) || normalizedPath.includes(path)) {
        return Promise.resolve(content);
      }
    }
    return Promise.reject(new Error(`File not found: ${filePath}`));
  });

  mockFs.writeFile.mockResolvedValue(undefined);
  mockFs.access.mockResolvedValue(undefined);
  mockFs.stat.mockResolvedValue({ isFile: () => true, isDirectory: () => false });
  mockFs.readdir.mockResolvedValue([]);

  return mockFs;
};

// Mock language files
export const createMockLanguageFiles = () => ({
  'src/locales/zh-CN.json': JSON.stringify({
    welcome: '欢迎使用',
    greeting: '你好，{{name}}！',
    user: {
      profile: '用户资料',
      settings: '设置'
    }
  }),
  'src/locales/en-US.json': JSON.stringify({
    welcome: 'Welcome',
    greeting: 'Hello, {{name}}!',
    user: {
      profile: 'User Profile',
      settings: 'Settings'
    }
  })
});

// Mock source files with i18n calls
export const createMockSourceFiles = () => ({
  'src/App.vue': `
<template>
  <div>
    <h1>{{ $tsl('欢迎使用 TransLink I18n') }}</h1>
    <p>{{ t('这是一个测试应用') }}</p>
  </div>
</template>

<script setup>
const message = $tsl('脚本中的消息');
</script>
  `,
  'src/components/Button.tsx': `
import React from 'react';

export function Button() {
  return (
    <button onClick={() => alert($tsl('按钮被点击'))}>
      {$tsl('点击我')}
    </button>
  );
}
  `,
  'src/utils/messages.ts': `
export const messages = {
  success: $tsl('操作成功'),
  error: t('操作失败'),
  warning: $tsl('警告信息')
};
  `
});

// Test utilities
export const expectTransformResult = (result: any, expectedTransforms: string[]) => {
  expect(result).toBeDefined();
  expect(result.code).toBeDefined();
  
  expectedTransforms.forEach(transform => {
    expect(result.code).toContain(transform);
  });
};

export const expectVirtualModuleId = (id: string, prefix = 'virtual:i18n-language-') => {
  expect(id).toMatch(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
};

beforeEach(() => {
  vi.clearAllMocks();
});
