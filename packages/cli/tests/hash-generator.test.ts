import { describe, it, expect, beforeEach } from 'vitest';
import { HashGenerator } from '../utils/hash-generator.js';

describe('HashGenerator', () => {
  let hashGenerator: HashGenerator;

  beforeEach(() => {
    hashGenerator = new HashGenerator({
      algorithm: 'sha256',
      length: 8,
      includeContext: true
    });
  });

  describe('基础哈希生成', () => {
    it('应该为相同文本生成一致的哈希', () => {
      const text = '欢迎使用 TransLink I18n';
      const hash1 = hashGenerator.generate(text);
      const hash2 = hashGenerator.generate(text);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(8);
      expect(hash1).toMatch(/^[a-f0-9]{8}$/);
    });

    it('应该为不同文本生成不同哈希', () => {
      const text1 = '欢迎使用 TransLink I18n';
      const text2 = '感谢使用我们的产品';
      
      const hash1 = hashGenerator.generate(text1);
      const hash2 = hashGenerator.generate(text2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('应该处理空字符串', () => {
      const hash = hashGenerator.generate('');
      expect(hash).toHaveLength(8);
      expect(hash).toMatch(/^[a-f0-9]{8}$/);
    });

    it('应该处理特殊字符', () => {
      const text = '特殊字符：@#$%^&*()_+-={}[]|\\:";\'<>?,./ 中文';
      const hash = hashGenerator.generate(text);
      
      expect(hash).toHaveLength(8);
      expect(hash).toMatch(/^[a-f0-9]{8}$/);
    });

    it('应该处理 Unicode 字符', () => {
      const text = '🎉 欢迎使用 TransLink I18n 🚀';
      const hash = hashGenerator.generate(text);
      
      expect(hash).toHaveLength(8);
      expect(hash).toMatch(/^[a-f0-9]{8}$/);
    });
  });

  describe('上下文相关哈希', () => {
    it('应该为相同文本在不同上下文中生成不同哈希', () => {
      const text = '确定';
      const context1 = { 
        filePath: 'src/components/Button.vue',
        componentName: 'Button' 
      };
      const context2 = { 
        filePath: 'src/components/Modal.vue',
        componentName: 'Modal' 
      };
      
      const hash1 = hashGenerator.generateWithContext(text, context1);
      const hash2 = hashGenerator.generateWithContext(text, context2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('应该为相同文本和上下文生成相同哈希', () => {
      const text = '确定';
      const context = { 
        filePath: 'src/components/Button.vue',
        componentName: 'Button' 
      };
      
      const hash1 = hashGenerator.generateWithContext(text, context);
      const hash2 = hashGenerator.generateWithContext(text, context);
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('哈希冲突处理', () => {
    it('应该检测并处理哈希冲突', () => {
      // 模拟冲突场景
      const text1 = '测试文本1';
      const text2 = '测试文本2';
      
      const hash1 = hashGenerator.generate(text1);
      const hash2 = hashGenerator.generate(text2);
      
      // 记录映射关系
      expect(hashGenerator.getMapping(hash1)).toBe(text1);
      expect(hashGenerator.getMapping(hash2)).toBe(text2);
    });

    it('应该在冲突时使用上下文信息', () => {
      const conflictingTexts = ['A', 'B']; // 简短文本更容易冲突
      const contexts = [
        { filePath: 'file1.vue', componentName: 'Comp1' },
        { filePath: 'file2.vue', componentName: 'Comp2' }
      ];
      
      const hashes = conflictingTexts.map((text, index) => 
        hashGenerator.generateWithContext(text, contexts[index])
      );
      
      // 即使文本可能产生相同的基础哈希，上下文应该使它们不同
      expect(hashes[0]).not.toBe(hashes[1]);
    });
  });

  describe('哈希验证', () => {
    it('应该验证有效的哈希格式', () => {
      const validHash = 'a1b2c3d4';
      expect(hashGenerator.isValidHash(validHash)).toBe(true);
    });

    it('应该拒绝无效的哈希格式', () => {
      const invalidHashes = [
        'invalid',      // 非十六进制
        'a1b2c3d',      // 太短
        'a1b2c3d45',    // 太长
        'g1b2c3d4',     // 包含无效字符
        'A1B2C3D4',     // 大写字母
        ''              // 空字符串
      ];
      
      invalidHashes.forEach(hash => {
        expect(hashGenerator.isValidHash(hash)).toBe(false);
      });
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量哈希生成', () => {
      const startTime = Date.now();
      
      // 生成1000个哈希
      for (let i = 0; i < 1000; i++) {
        hashGenerator.generate(`测试文本 ${i}`);
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该正确管理内存使用', () => {
      // 生成大量哈希后检查映射表大小
      for (let i = 0; i < 100; i++) {
        hashGenerator.generate(`测试文本 ${i}`);
      }
      
      const mappingSize = hashGenerator.getMappingSize();
      expect(mappingSize).toBe(100);
      
      // 清理后应该为空
      hashGenerator.clearMappings();
      expect(hashGenerator.getMappingSize()).toBe(0);
    });
  });

  describe('配置选项', () => {
    it('应该支持不同的哈希算法', () => {
      const md5Generator = new HashGenerator({
        algorithm: 'md5',
        length: 8,
        includeContext: false
      });
      
      const sha1Generator = new HashGenerator({
        algorithm: 'sha1',
        length: 8,
        includeContext: false
      });
      
      const text = '测试文本';
      const md5Hash = md5Generator.generate(text);
      const sha1Hash = sha1Generator.generate(text);
      
      expect(md5Hash).not.toBe(sha1Hash);
      expect(md5Hash).toHaveLength(8);
      expect(sha1Hash).toHaveLength(8);
    });

    it('应该支持不同的哈希长度', () => {
      const shortGenerator = new HashGenerator({
        algorithm: 'sha256',
        length: 6,
        includeContext: false
      });
      
      const longGenerator = new HashGenerator({
        algorithm: 'sha256',
        length: 12,
        includeContext: false
      });
      
      const text = '测试文本';
      const shortHash = shortGenerator.generate(text);
      const longHash = longGenerator.generate(text);
      
      expect(shortHash).toHaveLength(6);
      expect(longHash).toHaveLength(12);
    });
  });
});
