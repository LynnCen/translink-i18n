import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, extname, basename } from 'path';
import { configManager } from '../utils/config.js';
import { logger } from '../utils/logger.js';

interface BuildOptions {
  input?: string;
  output?: string;
  minify?: boolean;
  split?: boolean;
  watch?: boolean;
}

interface LanguageData {
  [key: string]: string | LanguageData;
}

interface BuildStats {
  languages: number;
  keys: number;
  totalSize: number;
  files: string[];
}

async function buildCommand(options: BuildOptions) {
  logger.title('构建语言包');

  try {
    // 加载配置
    const config = await configManager.loadConfig();
    
    const inputDir = options.input || config.output.directory;
    const outputDir = options.output || resolve(inputDir, '../dist');
    
    logger.info(`输入目录: ${inputDir}`);
    logger.info(`输出目录: ${outputDir}`);
    logger.br();

    // 检查输入目录
    const inputPath = resolve(process.cwd(), inputDir);
    if (!existsSync(inputPath)) {
      logger.error(`输入目录不存在: ${inputDir}`);
      logger.info('请先运行 translink extract 生成语言文件');
      process.exit(1);
    }

    // 读取所有语言文件
    const languageFiles = await scanLanguageFiles(inputPath);
    
    if (languageFiles.length === 0) {
      logger.warn('未找到语言文件');
      logger.info('请先运行 translink extract 生成语言文件');
      return;
    }

    logger.info(`发现 ${languageFiles.length} 个语言文件:`);
    languageFiles.forEach(file => {
      logger.info(`  - ${file.language} (${file.path})`);
    });
    logger.br();

    // 构建语言包
    const buildStats = await buildLanguagePacks(languageFiles, outputDir, options);

    // 显示构建统计
    logger.success('📊 构建统计:');
    logger.info(`  语言数量: ${buildStats.languages}`);
    logger.info(`  翻译键数: ${buildStats.keys}`);
    logger.info(`  总大小: ${formatBytes(buildStats.totalSize)}`);
    logger.info(`  输出文件: ${buildStats.files.length} 个`);
    
    if (options.split) {
      logger.info('  ✓ 启用了按需分割');
    }
    if (options.minify) {
      logger.info('  ✓ 启用了代码压缩');
    }

    logger.br();
    logger.success('🎉 构建完成！');
    logger.info('语言包已准备就绪，可以在应用中使用');

  } catch (error) {
    logger.error(`构建失败: ${error}`);
    process.exit(1);
  }
}

/**
 * 扫描语言文件
 */
async function scanLanguageFiles(inputDir: string): Promise<Array<{
  language: string;
  path: string;
  format: string;
}>> {
  const files = readdirSync(inputDir);
  const languageFiles: Array<{ language: string; path: string; format: string }> = [];

  for (const file of files) {
    const filePath = resolve(inputDir, file);
    const ext = extname(file);
    const name = basename(file, ext);

    // 跳过映射文件和非语言文件
    if (file === 'extraction-mapping.json' || !isLanguageFile(ext)) {
      continue;
    }

    // 验证是否为有效的语言代码
    if (isValidLanguageCode(name)) {
      languageFiles.push({
        language: name,
        path: filePath,
        format: ext.slice(1), // 去掉点号
      });
    }
  }

  return languageFiles.sort((a, b) => a.language.localeCompare(b.language));
}

/**
 * 构建语言包
 */
async function buildLanguagePacks(
  languageFiles: Array<{ language: string; path: string; format: string }>,
  outputDir: string,
  options: BuildOptions
): Promise<BuildStats> {
  // 确保输出目录存在
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const stats: BuildStats = {
    languages: 0,
    keys: 0,
    totalSize: 0,
    files: [],
  };

  // 处理每个语言文件
  for (const languageFile of languageFiles) {
    logger.startSpinner(`构建 ${languageFile.language} 语言包...`);

    try {
      // 读取和解析语言文件
      const rawData = readFileSync(languageFile.path, 'utf-8');
      const languageData = parseLanguageFile(rawData, languageFile.format);

      // 验证和清理数据
      const cleanedData = cleanLanguageData(languageData);
      const keyCount = countKeys(cleanedData);

      if (keyCount === 0) {
        logger.stopSpinner(`⚠ ${languageFile.language} 语言包为空，跳过`);
        continue;
      }

      // 生成不同格式的输出文件
      const outputFiles = await generateOutputFiles(
        languageFile.language,
        cleanedData,
        outputDir,
        options
      );

      // 更新统计信息
      stats.languages++;
      stats.keys = Math.max(stats.keys, keyCount); // 使用最大键数
      stats.files.push(...outputFiles.map(f => f.name));
      stats.totalSize += outputFiles.reduce((sum, f) => sum + f.size, 0);

      logger.stopSpinner(`✓ ${languageFile.language} 构建完成 (${keyCount} 个键)`);

    } catch (error) {
      logger.stopSpinner(`✗ ${languageFile.language} 构建失败: ${error}`, false);
    }
  }

  // 生成元数据文件
  await generateMetadata(languageFiles, outputDir, stats);

  return stats;
}

/**
 * 解析语言文件
 */
function parseLanguageFile(content: string, format: string): LanguageData {
  switch (format) {
    case 'json':
      return JSON.parse(content);
    case 'js':
    case 'ts':
      // 简单的 ES 模块解析（生产环境建议使用更健壮的解析器）
      const match = content.match(/export\s+default\s+(.+);?\s*$/s);
      if (match) {
        return JSON.parse(match[1].replace(/as\s+const/, ''));
      }
      throw new Error('无法解析 ES 模块格式');
    case 'yaml':
      // 简单的 YAML 解析（生产环境建议使用 yaml 库）
      const data: LanguageData = {};
      content.split('\n').forEach(line => {
        const match = line.match(/^([^:]+):\s*"?([^"]*)"?$/);
        if (match) {
          data[match[1].trim()] = match[2].trim();
        }
      });
      return data;
    default:
      throw new Error(`不支持的文件格式: ${format}`);
  }
}

/**
 * 清理语言数据
 */
function cleanLanguageData(data: LanguageData): LanguageData {
  const cleaned: LanguageData = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.trim()) {
      // 只保留非空字符串值
      cleaned[key] = value.trim();
    } else if (typeof value === 'object' && value !== null) {
      // 递归清理嵌套对象
      const cleanedNested = cleanLanguageData(value);
      if (Object.keys(cleanedNested).length > 0) {
        cleaned[key] = cleanedNested;
      }
    }
  }
  
  return cleaned;
}

/**
 * 计算键的数量
 */
function countKeys(data: LanguageData): number {
  let count = 0;
  
  for (const value of Object.values(data)) {
    if (typeof value === 'string') {
      count++;
    } else if (typeof value === 'object' && value !== null) {
      count += countKeys(value);
    }
  }
  
  return count;
}

/**
 * 生成输出文件
 */
async function generateOutputFiles(
  language: string,
  data: LanguageData,
  outputDir: string,
  options: BuildOptions
): Promise<Array<{ name: string; size: number }>> {
  const files: Array<{ name: string; size: number }> = [];

  // 生成 JSON 格式
  const jsonContent = options.minify 
    ? JSON.stringify(data)
    : JSON.stringify(data, null, 2);
  
  const jsonPath = resolve(outputDir, `${language}.json`);
  writeFileSync(jsonPath, jsonContent, 'utf-8');
  files.push({
    name: `${language}.json`,
    size: Buffer.byteLength(jsonContent, 'utf-8'),
  });

  // 生成 ES 模块格式
  const esContent = `export default ${options.minify ? JSON.stringify(data) : JSON.stringify(data, null, 2)};`;
  const esPath = resolve(outputDir, `${language}.js`);
  writeFileSync(esPath, esContent, 'utf-8');
  files.push({
    name: `${language}.js`,
    size: Buffer.byteLength(esContent, 'utf-8'),
  });

  // 如果启用分割，按命名空间分割
  if (options.split) {
    const splitFiles = await splitByNamespace(language, data, outputDir, options);
    files.push(...splitFiles);
  }

  return files;
}

/**
 * 按命名空间分割语言包
 */
async function splitByNamespace(
  language: string,
  data: LanguageData,
  outputDir: string,
  options: BuildOptions
): Promise<Array<{ name: string; size: number }>> {
  const files: Array<{ name: string; size: number }> = [];
  const splitDir = resolve(outputDir, 'split', language);
  
  if (!existsSync(splitDir)) {
    mkdirSync(splitDir, { recursive: true });
  }

  // 按第一级键分割
  for (const [namespace, namespaceData] of Object.entries(data)) {
    if (typeof namespaceData === 'object' && namespaceData !== null) {
      const content = options.minify 
        ? JSON.stringify(namespaceData)
        : JSON.stringify(namespaceData, null, 2);
      
      const filePath = resolve(splitDir, `${namespace}.json`);
      writeFileSync(filePath, content, 'utf-8');
      
      files.push({
        name: `split/${language}/${namespace}.json`,
        size: Buffer.byteLength(content, 'utf-8'),
      });
    }
  }

  return files;
}

/**
 * 生成元数据文件
 */
async function generateMetadata(
  languageFiles: Array<{ language: string; path: string; format: string }>,
  outputDir: string,
  stats: BuildStats
) {
  const metadata = {
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    languages: languageFiles.map(f => f.language),
    stats,
    files: stats.files.reduce((acc, file) => {
      acc[file] = {
        path: file,
        language: file.split('.')[0],
      };
      return acc;
    }, {} as Record<string, any>),
  };

  const metadataPath = resolve(outputDir, 'metadata.json');
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
}

/**
 * 检查是否为语言文件
 */
function isLanguageFile(ext: string): boolean {
  return ['.json', '.js', '.ts', '.yaml', '.yml'].includes(ext);
}

/**
 * 检查是否为有效的语言代码
 */
function isValidLanguageCode(code: string): boolean {
  // 简单的语言代码验证（可以扩展为更严格的验证）
  return /^[a-z]{2}(-[A-Z]{2})?$/.test(code);
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const build = new Command('build')
  .description('构建语言包文件')
  .option('-i, --input <directory>', '输入目录')
  .option('-o, --output <directory>', '输出目录')
  .option('-m, --minify', '压缩输出文件')
  .option('-s, --split', '按命名空间分割语言包')
  .option('-w, --watch', '监听文件变化（开发模式）')
  .action(buildCommand);
