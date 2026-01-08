/**
 * 配置文件转换工具
 * 将 TypeScript 配置文件转换为 JavaScript 配置文件
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { logger } from './logger.js';

/**
 * 将 TypeScript 配置文件转换为 JavaScript
 */
export function convertTsConfigToJs(tsConfigPath: string): string {
  const jsConfigPath = tsConfigPath.replace(/\.ts$/, '.js');
  
  if (!existsSync(tsConfigPath)) {
    throw new Error(`配置文件不存在: ${tsConfigPath}`);
  }
  
  let content = readFileSync(tsConfigPath, 'utf-8');
  
  // 1. 替换类型导入
  content = content.replace(
    /import\s+type\s+{\s*I18nConfig\s*}\s+from\s+['"]@translink\/i18n-cli['"];?/g,
    '/** @type {import(\'@translink/i18n-cli\').I18nConfig} */'
  );
  
  // 2. 移除类型注解
  content = content.replace(/:\s*I18nConfig/g, '');
  content = content.replace(/const\s+config:\s*I18nConfig\s*=/g, 'const config =');
  
  // 3. 移除 satisfies I18nConfig
  content = content.replace(/\s+satisfies\s+I18nConfig;?/g, ';');
  
  // 4. 确保有 export default
  if (!content.includes('export default')) {
    // 如果最后是 }，添加 export default
    content = content.replace(/^(\s*)(\})/m, '$1export default $2');
  }
  
  return content;
}

/**
 * 转换并保存配置文件
 */
export async function convertAndSaveConfig(tsConfigPath: string): Promise<string> {
  const jsConfigPath = tsConfigPath.replace(/\.ts$/, '.js');
  
  try {
    const jsContent = convertTsConfigToJs(tsConfigPath);
    writeFileSync(jsConfigPath, jsContent, 'utf-8');
    logger.success(`✓ 配置文件已转换: ${jsConfigPath}`);
    return jsConfigPath;
  } catch (error) {
    logger.error(`转换配置文件失败: ${error}`);
    throw error;
  }
}

