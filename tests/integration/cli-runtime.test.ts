import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { I18nEngine } from '../../packages/runtime/src/core/i18n-engine.js';

describe('CLI 与 Runtime 集成测试', () => {
  const testProjectDir = join(process.cwd(), 'test-project');
  const localesDir = join(testProjectDir, 'src/locales');

  beforeEach(async () => {
    // 创建测试项目目录
    await fs.mkdir(testProjectDir, { recursive: true });
    await fs.mkdir(localesDir, { recursive: true });
  });

  afterEach(async () => {
    // 清理测试项目
    await fs.rm(testProjectDir, { recursive: true, force: true });
  });

  describe('完整工作流测试', () => {
    it('应该完成从提取到运行时使用的完整流程', async () => {
      // 1. 创建包含中文的源文件
      const sourceFile = join(testProjectDir, 'src/App.vue');
      await fs.mkdir(join(testProjectDir, 'src'), { recursive: true });
      await fs.writeFile(
        sourceFile,
        `
<template>
  <div>
    <h1>{{ $tsl('欢迎使用 TransLink I18n') }}</h1>
    <p>{{ t('这是一个集成测试') }}</p>
    <button @click="handleClick">{{ $tsl('点击按钮') }}</button>
  </div>
</template>

<script setup>
const handleClick = () => {
  alert($tsl('按钮被点击了'));
};
</script>
      `
      );

      // 2. 创建 i18n 配置文件
      const configFile = join(testProjectDir, 'i18n.config.ts');
      await fs.writeFile(
        configFile,
        `
export default {
  extract: {
    patterns: ['src/**/*.{vue,ts,js,tsx,jsx}'],
    exclude: ['node_modules/**'],
    functions: ['t', '$tsl']
  },
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US']
  },
  output: {
    directory: 'src/locales',
    format: 'json'
  }
};
      `
      );

      // 3. 运行 CLI 提取命令
      const extractResult = await runCLICommand('extract', testProjectDir);
      expect(extractResult.success).toBe(true);

      // 4. 验证生成的语言文件
      const zhCNFile = join(localesDir, 'zh-CN.json');
      expect(
        await fs
          .access(zhCNFile)
          .then(() => true)
          .catch(() => false)
      ).toBe(true);

      const zhCNContent = JSON.parse(await fs.readFile(zhCNFile, 'utf-8'));
      expect(Object.keys(zhCNContent)).toHaveLength(4);
      expect(Object.values(zhCNContent)).toContain('欢迎使用 TransLink I18n');
      expect(Object.values(zhCNContent)).toContain('这是一个集成测试');
      expect(Object.values(zhCNContent)).toContain('点击按钮');
      expect(Object.values(zhCNContent)).toContain('按钮被点击了');

      // 5. 创建英文翻译
      const enUSFile = join(localesDir, 'en-US.json');
      const enUSContent: Record<string, string> = {};
      for (const [key, value] of Object.entries(zhCNContent)) {
        // 简单的翻译映射
        const translations: Record<string, string> = {
          '欢迎使用 TransLink I18n': 'Welcome to TransLink I18n',
          这是一个集成测试: 'This is an integration test',
          点击按钮: 'Click Button',
          按钮被点击了: 'Button was clicked',
        };
        enUSContent[key] = translations[value as string] || (value as string);
      }
      await fs.writeFile(enUSFile, JSON.stringify(enUSContent, null, 2));

      // 6. 使用 Runtime 加载和测试翻译
      const i18nEngine = new I18nEngine({
        defaultLanguage: 'zh-CN',
        supportedLanguages: ['zh-CN', 'en-US'],
        resources: {
          'zh-CN': zhCNContent,
          'en-US': enUSContent,
        },
      });

      await i18nEngine.init();

      // 测试中文翻译
      const zhKeys = Object.keys(zhCNContent);
      expect(i18nEngine.t(zhKeys[0])).toBe('欢迎使用 TransLink I18n');

      // 测试英文翻译
      await i18nEngine.changeLanguage('en-US');
      expect(i18nEngine.t(zhKeys[0])).toBe('Welcome to TransLink I18n');
    }, 30000);

    it('应该处理增量更新', async () => {
      // 1. 初始文件
      const sourceFile = join(testProjectDir, 'src/App.vue');
      await fs.mkdir(join(testProjectDir, 'src'), { recursive: true });
      await fs.writeFile(
        sourceFile,
        `
<template>
  <h1>{{ $tsl('初始文本') }}</h1>
</template>
      `
      );

      // 2. 首次提取
      await runCLICommand('extract', testProjectDir);

      const zhCNFile = join(localesDir, 'zh-CN.json');
      const initialContent = JSON.parse(await fs.readFile(zhCNFile, 'utf-8'));
      expect(Object.keys(initialContent)).toHaveLength(1);

      // 3. 添加新文本
      await fs.writeFile(
        sourceFile,
        `
<template>
  <h1>{{ $tsl('初始文本') }}</h1>
  <p>{{ $tsl('新增文本') }}</p>
</template>
      `
      );

      // 4. 再次提取
      await runCLICommand('extract', testProjectDir);

      const updatedContent = JSON.parse(await fs.readFile(zhCNFile, 'utf-8'));
      expect(Object.keys(updatedContent)).toHaveLength(2);
      expect(Object.values(updatedContent)).toContain('初始文本');
      expect(Object.values(updatedContent)).toContain('新增文本');
    }, 20000);
  });

  describe('错误处理集成', () => {
    it('应该处理无效的源文件', async () => {
      // 创建语法错误的文件
      const invalidFile = join(testProjectDir, 'src/invalid.vue');
      await fs.mkdir(join(testProjectDir, 'src'), { recursive: true });
      await fs.writeFile(
        invalidFile,
        `
<template>
  <h1>{{ $tsl('有效文本') }}</h1>
  <p>{{ $tsl('未闭合的引号) }}</p>
</template>
      `
      );

      const result = await runCLICommand('extract', testProjectDir);

      // CLI 应该能够处理部分有效的内容
      expect(result.success).toBe(true);

      const zhCNFile = join(localesDir, 'zh-CN.json');
      const content = JSON.parse(await fs.readFile(zhCNFile, 'utf-8'));
      expect(Object.values(content)).toContain('有效文本');
    });

    it('应该处理缺失的配置文件', async () => {
      const sourceFile = join(testProjectDir, 'src/App.vue');
      await fs.mkdir(join(testProjectDir, 'src'), { recursive: true });
      await fs.writeFile(
        sourceFile,
        `
<template>
  <h1>{{ $tsl('测试文本') }}</h1>
</template>
      `
      );

      // 不创建配置文件，使用默认配置
      const result = await runCLICommand('extract', testProjectDir);

      expect(result.success).toBe(true);
    });
  });

  describe('性能集成测试', () => {
    it('应该高效处理大量文件', async () => {
      // 创建100个文件，每个包含多个翻译
      const srcDir = join(testProjectDir, 'src');
      await fs.mkdir(srcDir, { recursive: true });

      for (let i = 0; i < 100; i++) {
        const fileContent = `
<template>
  <div>
    <h1>{{ $tsl('标题${i}') }}</h1>
    <p>{{ $tsl('内容${i}') }}</p>
    <button>{{ $tsl('按钮${i}') }}</button>
  </div>
</template>
        `.replace(/\$\{i\}/g, i.toString());

        await fs.writeFile(join(srcDir, `Component${i}.vue`), fileContent);
      }

      const startTime = Date.now();
      const result = await runCLICommand('extract', testProjectDir);
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(30000); // 应该在30秒内完成

      // 验证提取结果
      const zhCNFile = join(localesDir, 'zh-CN.json');
      const content = JSON.parse(await fs.readFile(zhCNFile, 'utf-8'));
      expect(Object.keys(content)).toHaveLength(300); // 100个文件 × 3个翻译
    }, 60000);
  });

  describe('多语言支持集成', () => {
    it('应该支持多种文件类型', async () => {
      const srcDir = join(testProjectDir, 'src');
      await fs.mkdir(srcDir, { recursive: true });

      // Vue 文件
      await fs.writeFile(
        join(srcDir, 'App.vue'),
        `
<template>
  <h1>{{ $tsl('Vue 组件') }}</h1>
</template>
      `
      );

      // React TSX 文件
      await fs.writeFile(
        join(srcDir, 'Component.tsx'),
        `
import React from 'react';
export const Component = () => <h1>{$tsl('React 组件')}</h1>;
      `
      );

      // TypeScript 文件
      await fs.writeFile(
        join(srcDir, 'utils.ts'),
        `
export const message = $tsl('工具函数');
      `
      );

      // JavaScript 文件
      await fs.writeFile(
        join(srcDir, 'helper.js'),
        `
const helper = {
  message: $tsl('帮助信息')
};
      `
      );

      const result = await runCLICommand('extract', testProjectDir);
      expect(result.success).toBe(true);

      const zhCNFile = join(localesDir, 'zh-CN.json');
      const content = JSON.parse(await fs.readFile(zhCNFile, 'utf-8'));

      expect(Object.values(content)).toContain('Vue 组件');
      expect(Object.values(content)).toContain('React 组件');
      expect(Object.values(content)).toContain('工具函数');
      expect(Object.values(content)).toContain('帮助信息');
    });
  });
});

// 辅助函数：运行 CLI 命令
async function runCLICommand(
  command: string,
  cwd: string
): Promise<{ success: boolean; output: string; error: string }> {
  return new Promise(resolve => {
    const child = spawn(
      'node',
      [join(process.cwd(), 'packages/cli/dist/cli.js'), command],
      {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );

    let output = '';
    let error = '';

    child.stdout?.on('data', data => {
      output += data.toString();
    });

    child.stderr?.on('data', data => {
      error += data.toString();
    });

    child.on('close', code => {
      resolve({
        success: code === 0,
        output,
        error,
      });
    });

    child.on('error', err => {
      resolve({
        success: false,
        output,
        error: err.message,
      });
    });
  });
}
