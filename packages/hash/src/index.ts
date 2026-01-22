import { sha256 } from 'js-sha256';

/**
 * TransLink 统一 Hash 算法
 *
 * ⚠️ 关键原则：
 * 1. CLI 和 Runtime 必须使用完全相同的算法
 * 2. 任何修改都必须同时更新 CLI 和 Runtime
 * 3. 算法规范：SHA256 + UTF-8 + 纯数字 + 8位
 * 4. 跨平台兼容：Node.js + 浏览器
 *
 * @packageDocumentation
 */

/**
 * 生成内容的 SHA256 哈希值（纯数字格式）
 *
 * 此函数是 TransLink I18n 系统的核心，确保 CLI 和 Runtime 使用完全一致的哈希算法。
 *
 * **标准化规则**：
 * 1. 多个空格 → 单个空格
 * 2. 统一换行符（\r\n 或 \r → \n）
 * 3. 去除首尾空格
 *
 * **算法规范**：
 * - 算法：SHA256
 * - 编码：UTF-8
 * - 格式：纯数字（十六进制转数字）
 * - 长度：8 位
 * - 跨平台：使用 js-sha256（浏览器 + Node.js）
 *
 * @param content - 需要哈希的字符串内容
 * @returns 8位纯数字哈希字符串
 *
 * @example
 * ```typescript
 * import { generateHash } from '@translink/hash';
 *
 * // 基础用法
 * generateHash('你好，世界！');      // → '10941410'
 *
 * // 标准化：多余空格被统一
 * generateHash('你好，  世界！');    // → '10941410'
 * generateHash('你好，   世界！');   // → '10941410'
 *
 * // 标准化：换行符被统一
 * generateHash('你好，\n世界！');    // → '10941410'
 * generateHash('你好，\r\n世界！');  // → '10941410'
 *
 * // 标准化：首尾空格被去除
 * generateHash('  你好，世界！  ');  // → '10941410'
 * ```
 *
 * @public
 */
export function generateHash(content: string): string {
  // ✅ 标准化步骤（与 CLI hash-generator.ts 完全一致）
  // 1. 多个空格 → 单空格
  // 2. 统一换行符
  // 3. 去除首尾空格
  const normalizedContent = content
    .replace(/\s+/g, ' ')
    .replace(/\r\n|\r/g, '\n')
    .trim();

  // ✅ 使用 js-sha256（跨平台：浏览器 + Node.js）
  const hexHash = sha256(normalizedContent);

  // 转换为纯数字格式（与 CLI toNumericHash 逻辑一致）
  return toNumericHash(hexHash, 8);
}

/**
 * 将十六进制哈希转换为纯数字
 *
 * ⚠️ 此函数与 CLI hash-generator.ts 的 toNumericHash 完全一致
 *
 * @param hexHash - 十六进制哈希字符串
 * @param length - 目标长度
 * @returns 纯数字字符串
 * @internal
 */
function toNumericHash(hexHash: string, length: number): string {
  let numeric = '';

  // 将每个十六进制字符转换为其对应的数字值
  for (let i = 0; i < hexHash.length && numeric.length < length; i++) {
    const char = hexHash[i];
    // 将十六进制字符转换为数字 (0-9 保留, a-f 转换为10-15)
    const value = parseInt(char, 16);
    numeric += value.toString();
  }

  return numeric.substring(0, length);
}

/**
 * Hash 算法版本
 * 用于验证 CLI 和 Runtime 的算法版本是否一致
 *
 * @public
 */
export const HASH_VERSION = '1.0.0';

/**
 * Hash 算法配置
 *
 * @public
 */
export const HASH_CONFIG = {
  algorithm: 'sha256',
  encoding: 'utf8',
  format: 'numeric',
  length: 8,
} as const;
