import { describe, it, expect } from 'vitest';
import { generateHash, HASH_VERSION, HASH_CONFIG } from '../src/index.js';
import { sha256 } from 'js-sha256';

/**
 * Hash 算法一致性测试
 *
 * ⚠️ 确保此包的算法与 CLI 和 Runtime 完全一致
 */
describe('@translink/hash', () => {
  // 模拟原始实现（用于对比）
  function nativeHash(text: string): string {
    const normalized = text
      .replace(/\s+/g, ' ')
      .replace(/\r\n|\r/g, '\n')
      .trim();

    const hexHash = sha256(normalized);

    // 转换为纯数字
    let numeric = '';
    for (let i = 0; i < hexHash.length && numeric.length < 8; i++) {
      const value = parseInt(hexHash[i], 16);
      numeric += value.toString();
    }
    return numeric.substring(0, 8);
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

  describe('基本功能测试', () => {
    testCases.forEach(({ input, description }) => {
      it(`应该为 "${description}" 生成正确的 hash`, () => {
        const hash = generateHash(input);
        const expected = nativeHash(input);

        expect(hash).toBe(expected);
        expect(hash).toHaveLength(8);
        expect(/^[0-9]{8}$/.test(hash)).toBe(true);
      });
    });

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
  });

  describe('标准化逻辑测试（关键）', () => {
    it('应该将多余空格标准化为单空格', () => {
      const text1 = '你好，  世界！';     // 两个空格
      const text2 = '你好，   世界！';    // 三个空格
      const text3 = '你好， 世界！';      // 一个空格

      const hash1 = generateHash(text1);
      const hash2 = generateHash(text2);
      const hash3 = generateHash(text3);

      // 应该生成相同的 hash
      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);

      // 与原生实现一致
      expect(hash1).toBe(nativeHash(text1));
    });

    it('应该统一不同类型的换行符', () => {
      const text1 = '你好，\n世界！';      // LF
      const text2 = '你好，\r\n世界！';    // CRLF
      const text3 = '你好，\r世界！';      // CR

      const hash1 = generateHash(text1);
      const hash2 = generateHash(text2);
      const hash3 = generateHash(text3);

      // 应该生成相同的 hash
      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);

      // 与原生实现一致
      expect(hash1).toBe(nativeHash(text1));
    });

    it('应该去除首尾空格', () => {
      const text1 = '  你好，世界！  ';
      const text2 = '你好，世界！';
      const text3 = '\t你好，世界！\n';

      const hash1 = generateHash(text1);
      const hash2 = generateHash(text2);
      const hash3 = generateHash(text3);

      // 应该生成相同的 hash
      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);

      // 与原生实现一致
      expect(hash1).toBe(nativeHash(text1));
    });

    it('应该正确处理复杂的空白字符组合', () => {
      const text1 = '  你好，\n\n世界！  ';
      const text2 = '你好， 世界！';       // 标准化后的预期结果

      const hash1 = generateHash(text1);
      const hash2 = generateHash(text2);

      // 标准化后应该生成相同的 hash
      expect(hash1).toBe(hash2);

      // 与原生实现一致
      expect(hash1).toBe(nativeHash(text1));
    });
  });

  describe('稳定性测试', () => {
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
        const hash = generateHash(text);
        const expected = nativeHash(text);

        expect(hash).toBe(expected);
      });
    });

    it('应该正确处理开发者可能输入的各种格式', () => {
      // 模拟开发者可能写的代码
      const messyInputs = [
        '你好，  世界！',              // 多余空格
        '  欢迎使用  ',                // 首尾空格
        '这是\n多行\n文本',            // 换行符
        '  混合\n\n  空格  和换行  ',   // 混合
      ];

      messyInputs.forEach(text => {
        const hash = generateHash(text);
        const expected = nativeHash(text);

        // 关键：即使格式混乱，hash 也必须一致
        expect(hash).toBe(expected);
      });
    });
  });

  describe('配置和版本', () => {
    it('应该导出正确的版本号', () => {
      expect(HASH_VERSION).toBeDefined();
      expect(typeof HASH_VERSION).toBe('string');
      expect(/^\d+\.\d+\.\d+$/.test(HASH_VERSION)).toBe(true);
    });

    it('应该导出正确的配置', () => {
      expect(HASH_CONFIG).toBeDefined();
      expect(HASH_CONFIG.algorithm).toBe('md5');
      expect(HASH_CONFIG.encoding).toBe('utf8');
      expect(HASH_CONFIG.format).toBe('hex');
      expect(HASH_CONFIG.length).toBe(8);
    });
  });
});
