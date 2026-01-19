import { Command } from 'commander';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, extname } from 'path';
import { configManager } from '../utils/config.js';
import { logger } from '../utils/logger.js';

interface ImportOptions {
  input: string;
  output?: string;
  merge?: boolean;
  force?: boolean;
  language?: string;
}

interface ImportedTranslation {
  key: string;
  translations: Record<string, string>;
  status?: string;
  context?: string;
  filePath?: string;
  line?: number;
}

/**
 * 从 Excel/CSV/JSON 导入翻译数据
 */
async function importCommand(options: ImportOptions) {
  logger.title('导入翻译数据');

  try {
    // 加载配置
    const config = await configManager.loadConfig();

    const outputDir = options.output || config.output.directory;
    const merge = options.merge ?? true;
    const force = options.force ?? false;

    // 解析输入文件路径
    // 如果是相对路径且不包含 / 或 \，则在配置目录中查找
    let inputPath: string;
    if (options.input.includes('/') || options.input.includes('\\')) {
      // 包含路径分隔符，直接使用
      inputPath = resolve(process.cwd(), options.input);
    } else {
      // 只是文件名，在配置目录中查找
      const importDir = config.importExport?.directory || 'translations';
      inputPath = resolve(process.cwd(), importDir, options.input);

      // 如果不存在，回退到当前目录
      if (!existsSync(inputPath)) {
        inputPath = resolve(process.cwd(), options.input);
      }
    }

    logger.info(`输入文件: ${inputPath}`);
    logger.info(`输出目录: ${outputDir}`);
    logger.info(
      `合并模式: ${merge ? '是（保留已有翻译）' : '否（覆盖已有翻译）'}`
    );
    logger.br();

    // 检查输入文件
    if (!existsSync(inputPath)) {
      logger.error(`输入文件不存在: ${inputPath}`);
      logger.info('💡 提示：');
      logger.info(`   1. 检查文件路径是否正确`);
      logger.info(
        `   2. 默认会在 ${config.importExport?.directory || 'translations'} 目录中查找`
      );
      logger.info(`   3. 可以使用绝对路径或相对路径`);
      process.exit(1);
    }

    // 根据文件扩展名确定格式
    const ext = extname(inputPath).toLowerCase();
    let translations: ImportedTranslation[] = [];

    switch (ext) {
      case '.xlsx':
      case '.xls':
        translations = await importFromExcel(inputPath);
        break;
      case '.csv':
        translations = await importFromCSV(inputPath);
        break;
      case '.json':
        translations = await importFromJSON(inputPath);
        break;
      default:
        logger.error(`不支持的文件格式: ${ext}`);
        logger.info('支持格式: .xlsx, .xls, .csv, .json');
        process.exit(1);
    }

    if (translations.length === 0) {
      logger.warn('未找到翻译数据');
      return;
    }

    logger.info(`成功导入 ${translations.length} 个翻译项`);

    // 合并到现有语言文件
    await mergeTranslations(translations, outputDir, config, merge, force);

    logger.br();
    logger.success('🎉 导入完成！');
    logger.info('翻译数据已更新到语言文件');
  } catch (error) {
    logger.error(`导入失败: ${error}`);
    process.exit(1);
  }
}

/**
 * 从 Excel 导入
 */
async function importFromExcel(
  filePath: string
): Promise<ImportedTranslation[]> {
  try {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet('Translations');
    if (!worksheet) {
      throw new Error('未找到 Translations 工作表');
    }

    const translations: ImportedTranslation[] = [];
    const headers: string[] = [];

    // 读取表头
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value?.toString() || '';
    });

    // 确定列索引
    const keyIndex = headers.indexOf('Key');
    const statusIndex = headers.indexOf('Status');
    const contextIndex = headers.indexOf('Context');
    const fileIndex = headers.indexOf('File');
    const lineIndex = headers.indexOf('Line');

    if (keyIndex === -1) {
      throw new Error('未找到 Key 列');
    }

    // 确定语言列
    const languageIndices: Record<string, number> = {};
    headers.forEach((header, index) => {
      if (
        header &&
        header !== 'Key' &&
        header !== 'Status' &&
        header !== 'Context' &&
        header !== 'File' &&
        header !== 'Line'
      ) {
        languageIndices[header] = index;
      }
    });

    // 读取数据行
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // 跳过表头

      const key = row.getCell(keyIndex).value?.toString();
      if (!key || !key.trim()) return;

      const translationValues: Record<string, string> = {};
      for (const [lang, index] of Object.entries(languageIndices)) {
        const cell = row.getCell(index);
        const value = cell.value?.toString() || '';
        if (value.trim()) {
          translationValues[lang] = value.trim();
        }
      }

      translations.push({
        key: key.trim(),
        translations: translationValues,
        status:
          statusIndex !== -1
            ? row.getCell(statusIndex).value?.toString()
            : undefined,
        context:
          contextIndex !== -1
            ? row.getCell(contextIndex).value?.toString()
            : undefined,
        filePath:
          fileIndex !== -1
            ? row.getCell(fileIndex).value?.toString()
            : undefined,
        line:
          lineIndex !== -1
            ? (row.getCell(lineIndex).value as number)
            : undefined,
      });
    });

    return translations;
  } catch (error) {
    if ((error as any).code === 'MODULE_NOT_FOUND') {
      logger.error('Excel 导入需要安装 exceljs 依赖');
      logger.info('请运行: npm install exceljs');
      throw error;
    } else {
      throw error;
    }
  }
}

/**
 * 从 CSV 导入
 */
async function importFromCSV(filePath: string): Promise<ImportedTranslation[]> {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV 文件为空');
  }

  const translations: ImportedTranslation[] = [];
  const headers = parseCSVLine(lines[0]);

  // 确定列索引
  const keyIndex = headers.indexOf('Key');
  if (keyIndex === -1) {
    throw new Error('未找到 Key 列');
  }

  const statusIndex = headers.indexOf('Status');
  const contextIndex = headers.indexOf('Context');
  const fileIndex = headers.indexOf('File');
  const lineIndex = headers.indexOf('Line');

  // 确定语言列
  const languageIndices: Record<string, number> = {};
  headers.forEach((header, index) => {
    if (
      header &&
      header !== 'Key' &&
      header !== 'Status' &&
      header !== 'Context' &&
      header !== 'File' &&
      header !== 'Line'
    ) {
      languageIndices[header] = index;
    }
  });

  // 读取数据行
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const key = values[keyIndex]?.trim();

    if (!key) continue;

    const translationValues: Record<string, string> = {};
    for (const [lang, index] of Object.entries(languageIndices)) {
      const value = values[index]?.trim() || '';
      if (value) {
        translationValues[lang] = value;
      }
    }

    translations.push({
      key,
      translations: translationValues,
      status: statusIndex !== -1 ? values[statusIndex] : undefined,
      context: contextIndex !== -1 ? values[contextIndex] : undefined,
      filePath: fileIndex !== -1 ? values[fileIndex] : undefined,
      line:
        lineIndex !== -1 ? parseInt(values[lineIndex] || '0', 10) : undefined,
    });
  }

  return translations;
}

/**
 * 从 JSON 导入
 */
async function importFromJSON(
  filePath: string
): Promise<ImportedTranslation[]> {
  const content = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  // 支持两种 JSON 格式
  if (Array.isArray(data)) {
    // 简单数组格式
    return data.map((item: any) => ({
      key: item.key,
      translations: item.translations || {},
      status: item.status,
      context: item.context,
      filePath: item.filePath,
      line: item.line,
    }));
  } else if (data.translations && Array.isArray(data.translations)) {
    // 带元数据的格式
    return data.translations.map((item: any) => ({
      key: item.key,
      translations: item.translations || {},
      status: item.status,
      context: item.context,
      filePath: item.filePath,
      line: item.line,
    }));
  } else {
    throw new Error('不支持的 JSON 格式');
  }
}

/**
 * 解析 CSV 行
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 转义的双引号
        current += '"';
        i++; // 跳过下一个引号
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // 添加最后一个字段
  values.push(current.trim());

  return values;
}

/**
 * 合并翻译到语言文件
 */
async function mergeTranslations(
  translations: ImportedTranslation[],
  outputDir: string,
  config: any,
  merge: boolean,
  force: boolean
) {
  const outputPath = resolve(process.cwd(), outputDir);

  // 确保输出目录存在
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
    logger.info(`创建输出目录: ${outputDir}`);
  }

  // 按语言分组
  const languageData: Record<string, Record<string, string>> = {};

  // 读取现有语言文件（如果启用合并）
  if (merge) {
    for (const language of config.languages.supported) {
      const languageFile = resolve(outputPath, `${language}.json`);
      if (existsSync(languageFile)) {
        try {
          const content = readFileSync(languageFile, 'utf-8');
          languageData[language] = JSON.parse(content);
        } catch (error) {
          logger.warn(`无法读取 ${language} 语言文件: ${error}`);
          languageData[language] = {};
        }
      } else {
        languageData[language] = {};
      }
    }
  } else {
    // 初始化空数据
    for (const language of config.languages.supported) {
      languageData[language] = {};
    }
  }

  // 合并翻译数据
  let updatedCount = 0;
  let newCount = 0;
  let skippedCount = 0;

  for (const item of translations) {
    for (const [language, translation] of Object.entries(item.translations)) {
      if (!languageData[language]) {
        languageData[language] = {};
      }

      const existing = languageData[language][item.key];
      const hasTranslation = translation && translation.trim();

      if (existing && hasTranslation && !force) {
        // 冲突处理：保留现有翻译
        skippedCount++;
        if (updatedCount + newCount + skippedCount <= 10) {
          logger.debug(`跳过 ${item.key} (${language}): 已存在翻译`);
        }
      } else if (hasTranslation) {
        // 更新或新增翻译
        if (existing) {
          updatedCount++;
        } else {
          newCount++;
        }
        languageData[language][item.key] = translation.trim();
      }
    }
  }

  // 写入语言文件
  for (const [language, data] of Object.entries(languageData)) {
    const languageFile = resolve(outputPath, `${language}.json`);
    const content = JSON.stringify(data, null, 2);
    writeFileSync(languageFile, content, 'utf-8');
    logger.success(
      `更新语言文件: ${language}.json (${Object.keys(data).length} 个键)`
    );
  }

  // 显示统计
  logger.br();
  logger.info('📊 合并统计:');
  logger.info(`  新增翻译: ${newCount} 个`);
  logger.info(`  更新翻译: ${updatedCount} 个`);
  if (skippedCount > 0) {
    logger.info(
      `  跳过翻译: ${skippedCount} 个（已存在，使用 --force 强制覆盖）`
    );
  }
}

export const importCmd = new Command('import')
  .description('从 Excel/CSV/JSON 导入翻译数据')
  .requiredOption('-i, --input <file>', '输入文件路径（Excel/CSV/JSON）')
  .option('-o, --output <directory>', '输出目录（语言文件所在目录）')
  .option('--merge', '合并模式：保留已有翻译（默认）', true)
  .option('--no-merge', '覆盖模式：完全覆盖已有翻译')
  .option('--force', '强制覆盖：即使已存在也覆盖')
  .option('-l, --language <language>', '只导入指定语言（可选）')
  .action(importCommand);
