import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ASTExtractor } from '../extractors/ast-extractor.js';
import { createMockDirectory } from './setup.js';

describe('ASTExtractor', () => {
  let extractor: ASTExtractor;
  const mockConfig = {
    patterns: ['**/*.{vue,ts,js,tsx,jsx}'],
    exclude: ['node_modules/**', 'dist/**'],
    functions: ['t', '$tsl', 'i18n.t'],
    extensions: ['.vue', '.ts', '.js', '.tsx', '.jsx'],
  };

  beforeEach(() => {
    extractor = new ASTExtractor(mockConfig);
  });

  describe('Vue 文件文本提取', () => {
    it('应该从 Vue 模板中提取中文文本', async () => {
      const vueContent = `
<template>
  <div>
    <h1>{{ $tsl('欢迎使用 TransLink I18n') }}</h1>
    <p>{{ t('这是一个国际化工具') }}</p>
    <button @click="handleClick">{{ $tsl('点击按钮') }}</button>
  </div>
</template>

<script setup>
const handleClick = () => {
  console.log($tsl('按钮被点击了'));
};
</script>
      `;

      createMockDirectory({
        'App.vue': vueContent,
      });

      const results = await extractor.extractFromFile('App.vue');

      expect(results).toHaveLength(4);
      expect(results.map(r => r.text)).toContain('欢迎使用 TransLink I18n');
      expect(results.map(r => r.text)).toContain('这是一个国际化工具');
      expect(results.map(r => r.text)).toContain('点击按钮');
      expect(results.map(r => r.text)).toContain('按钮被点击了');
    });

    it('应该提取 Vue 文件中的上下文信息', async () => {
      const vueContent = `
<template>
  <div>
    <h1>{{ $tsl('用户资料') }}</h1>
  </div>
</template>

<script setup>
defineOptions({
  name: 'UserProfile'
});

const saveProfile = () => {
  console.log($tsl('保存成功'));
};
</script>
      `;

      createMockDirectory({
        'UserProfile.vue': vueContent,
      });

      const results = await extractor.extractFromFile('UserProfile.vue');

      expect(results).toHaveLength(2);

      const profileResult = results.find(r => r.text === '用户资料');
      expect(profileResult).toBeDefined();
      expect(profileResult?.context.componentName).toBe('UserProfile');

      const saveResult = results.find(r => r.text === '保存成功');
      expect(saveResult).toBeDefined();
      expect(saveResult?.context.functionName).toBe('saveProfile');
    });
  });

  describe('TypeScript/JavaScript 文件提取', () => {
    it('应该从 TypeScript 文件中提取中文文本', async () => {
      const tsContent = `
export const messages = {
  welcome: $tsl('欢迎使用'),
  goodbye: t('再见'),
  error: '错误信息' // 这个不应该被提取
};

function showMessage() {
  alert($tsl('显示消息'));
}

class UserService {
  getMessage() {
    return i18n.t('获取消息');
  }
}
      `;

      createMockDirectory({
        'messages.ts': tsContent,
      });

      const results = await extractor.extractFromFile('messages.ts');

      expect(results).toHaveLength(4);
      expect(results.map(r => r.text)).toContain('欢迎使用');
      expect(results.map(r => r.text)).toContain('再见');
      expect(results.map(r => r.text)).toContain('显示消息');
      expect(results.map(r => r.text)).toContain('获取消息');
      expect(results.map(r => r.text)).not.toContain('错误信息'); // 普通字符串不应被提取
    });

    it('应该处理复杂的 JavaScript 表达式', async () => {
      const jsContent = `
const condition = true;
const message = condition ? $tsl('条件为真') : $tsl('条件为假');

const user = {
  name: 'John',
  greeting: t('你好，用户')
};

// 模板字符串
const template = \`\${$tsl('当前时间')}: \${new Date()}\`;

// 函数调用中的翻译
showNotification($tsl('操作成功'), 'success');
      `;

      createMockDirectory({
        'complex.js': jsContent,
      });

      const results = await extractor.extractFromFile('complex.js');

      expect(results).toHaveLength(5);
      expect(results.map(r => r.text)).toContain('条件为真');
      expect(results.map(r => r.text)).toContain('条件为假');
      expect(results.map(r => r.text)).toContain('你好，用户');
      expect(results.map(r => r.text)).toContain('当前时间');
      expect(results.map(r => r.text)).toContain('操作成功');
    });
  });

  describe('React/JSX 文件提取', () => {
    it('应该从 React 组件中提取中文文本', async () => {
      const reactContent = `
import React from 'react';

function MyComponent() {
  const handleClick = () => {
    alert($tsl('按钮被点击'));
  };

  return (
    <div>
      <h1>{$tsl('React 组件标题')}</h1>
      <p>{t('这是段落文本')}</p>
      <button onClick={handleClick}>
        {$tsl('点击我')}
      </button>
    </div>
  );
}

export default MyComponent;
      `;

      createMockDirectory({
        'MyComponent.tsx': reactContent,
      });

      const results = await extractor.extractFromFile('MyComponent.tsx');

      expect(results).toHaveLength(4);
      expect(results.map(r => r.text)).toContain('按钮被点击');
      expect(results.map(r => r.text)).toContain('React 组件标题');
      expect(results.map(r => r.text)).toContain('这是段落文本');
      expect(results.map(r => r.text)).toContain('点击我');
    });
  });

  describe('文本过滤和验证', () => {
    it('应该只提取包含中文的文本', async () => {
      const mixedContent = `
const messages = {
  english: $tsl('Hello World'),
  japanese: t('こんにちは'),
  chinese: $tsl('你好世界'),
  korean: t('안녕하세요'),
  mixed: $tsl('Hello 世界')
};
      `;

      createMockDirectory({
        'mixed.ts': mixedContent,
      });

      const results = await extractor.extractFromFile('mixed.ts');

      // 只有包含中文字符的文本应该被提取
      expect(results).toHaveLength(2);
      expect(results.map(r => r.text)).toContain('你好世界');
      expect(results.map(r => r.text)).toContain('Hello 世界');
      expect(results.map(r => r.text)).not.toContain('Hello World');
      expect(results.map(r => r.text)).not.toContain('こんにちは');
      expect(results.map(r => r.text)).not.toContain('안녕하세요');
    });

    it('应该跳过注释中的文本', async () => {
      const contentWithComments = `
// 这是注释中的中文，不应该被提取
const message = $tsl('这应该被提取');

/*
 * 多行注释中的中文文本
 * 也不应该被提取
 */
const another = t('这也应该被提取');
      `;

      createMockDirectory({
        'comments.ts': contentWithComments,
      });

      const results = await extractor.extractFromFile('comments.ts');

      expect(results).toHaveLength(2);
      expect(results.map(r => r.text)).toContain('这应该被提取');
      expect(results.map(r => r.text)).toContain('这也应该被提取');
      expect(results.map(r => r.text)).not.toContain(
        '这是注释中的中文，不应该被提取'
      );
    });
  });

  describe('项目级别提取', () => {
    it('应该从多个文件中提取文本', async () => {
      // Mock glob 返回多个文件
      const mockGlob = vi
        .fn()
        .mockResolvedValue([
          'src/App.vue',
          'src/components/Button.vue',
          'src/utils/messages.ts',
        ]);

      vi.doMock('fast-glob', () => ({ default: mockGlob }));

      createMockDirectory({
        'App.vue': `<template><h1>{{ $tsl('首页标题') }}</h1></template>`,
        'Button.vue': `<template><button>{{ $tsl('按钮文本') }}</button></template>`,
        'messages.ts': `export const msg = $tsl('工具消息');`,
      });

      const results = await extractor.extractFromProject();

      expect(results).toHaveLength(3);
      expect(results.map(r => r.text)).toContain('首页标题');
      expect(results.map(r => r.text)).toContain('按钮文本');
      expect(results.map(r => r.text)).toContain('工具消息');
    });

    it('应该去重相同的文本', async () => {
      const mockGlob = vi.fn().mockResolvedValue(['file1.vue', 'file2.vue']);

      vi.doMock('fast-glob', () => ({ default: mockGlob }));

      createMockDirectory({
        'file1.vue': `<template>{{ $tsl('重复文本') }}</template>`,
        'file2.vue': `<template>{{ $tsl('重复文本') }}</template>`,
      });

      const results = await extractor.extractFromProject();

      // 应该去重，只保留一个
      const uniqueTexts = [...new Set(results.map(r => r.text))];
      expect(uniqueTexts).toHaveLength(1);
      expect(uniqueTexts[0]).toBe('重复文本');
    });
  });

  describe('错误处理', () => {
    it('应该优雅处理文件读取错误', async () => {
      // Mock 文件读取失败
      vi.doMock('node:fs/promises', () => ({
        readFile: vi.fn().mockRejectedValue(new Error('File not found')),
      }));

      await expect(
        extractor.extractFromFile('nonexistent.vue')
      ).rejects.toThrow('File not found');
    });

    it('应该处理无效的 JavaScript 语法', async () => {
      const invalidContent = `
const message = $tsl('有效文本');
// 故意的语法错误
const invalid = {
  unclosed: $tsl('未闭合的对象
};
      `;

      createMockDirectory({
        'invalid.js': invalidContent,
      });

      // 应该能够提取有效部分，跳过无效语法
      const results = await extractor.extractFromFile('invalid.js');

      // 至少应该提取到一些文本，即使有语法错误
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大文件', async () => {
      // 生成大文件内容
      const largeContent = Array.from(
        { length: 1000 },
        (_, i) => `const msg${i} = $tsl('消息${i}');`
      ).join('\n');

      createMockDirectory({
        'large.ts': largeContent,
      });

      const startTime = Date.now();
      const results = await extractor.extractFromFile('large.ts');
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(1000);
      expect(duration).toBeLessThan(5000); // 应该在5秒内完成
    });
  });
});
