import { describe, it, expect } from 'vitest';
import { generateHash } from '../src/utils/hash.js';
import { createHash } from 'crypto';

/**
 * Hash 算法一致性测试
 *
 * ⚠️ 确保 Runtime 的 hash 算法和 CLI 完全一致
 */
describe('Hash Generator', () => {
  // 模拟 CLI 的 hash 生成算法
  function cliGenerateHash(text: string): string {
    return createHash('md5')
      .update(text, 'utf8')
      .digest('hex')
      .substring(0, 8);
  }

  const testCases = [
    { input: '你好，世界', description: '简单中文' },
    { input: '你好，{{name}}', description: '带插值的中文' },
    { input: 'Hello, World!', description: '简单英文' },
    { input: 'Hello, {{name}}!', description: '带插值的英文' },
    { input: '欢迎来到 {{appName}}', description: '混合文本' },
    { input: '测试\n换行\r\n符号', description: '包含换行符' },
    { input: '  多个   空格  ', description: '包含多余空格' },
    { input: '', description: '空字符串' },
    { input: '1234567890', description: '纯数字' },
    { input: '🎉 Emoji 测试 🚀', description: '包含 Emoji' },
  ];

  describe('Hash 一致性测试（CLI vs Runtime）', () => {
    testCases.forEach(({ input, description }) => {
      it(`应该为 "${description}" 生成一致的 hash`, () => {
        const cliHash = cliGenerateHash(input);
        const runtimeHash = generateHash(input);

        expect(runtimeHash).toBe(cliHash);
        expect(runtimeHash).toHaveLength(8);
        expect(/^[0-9a-f]{8}$/.test(runtimeHash)).toBe(true);
      });
    });
  });

  describe('Hash 基本特性', () => {
    it('应该生成 8 位十六进制字符串', () => {
      const hash = generateHash('测试文本');

      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('相同内容应该生成相同的 hash', () => {
      const text = '你好，{{name}}';
      const hash1 = generateHash(text);
      const hash2 = generateHash(text);

      expect(hash1).toBe(hash2);
    });

    it('不同内容应该生成不同的 hash', () => {
      const hash1 = generateHash('文本1');
      const hash2 = generateHash('文本2');

      expect(hash1).not.toBe(hash2);
    });

    it('应该正确处理空字符串', () => {
      const hash = generateHash('');

      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('应该正确处理特殊字符', () => {
      const specialChars = ['!@#$%^&*()', '<script>', '中文 123 English'];

      specialChars.forEach(text => {
        const hash = generateHash(text);
        expect(hash).toHaveLength(8);
        expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
      });
    });
  });

  describe('Hash 稳定性测试', () => {
    it('多次生成应该保持一致', () => {
      const text = '稳定性测试文本';
      const hashes = Array.from({ length: 100 }, () => generateHash(text));

      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(1);
    });
  });

  describe('实际使用场景', () => {
    it('应该正确处理实际翻译文本', () => {
      const translations = [
        '欢迎来到 {{appName}}',
        '您有 {{count}} 条新消息',
        '点击 {{link}} 查看详情',
        '错误：{{errorMessage}}',
      ];

      translations.forEach(text => {
        const cliHash = cliGenerateHash(text);
        const runtimeHash = generateHash(text);

        expect(runtimeHash).toBe(cliHash);
      });
    });
  });
});
