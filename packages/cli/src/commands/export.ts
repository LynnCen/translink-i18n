import { Command } from 'commander';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, extname } from 'path';
import { configManager } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import type { ExtractResult } from '../types/config.js';

interface ExportOptions {
  input?: string;
  output?: string;
  format?: 'excel' | 'csv' | 'json';
  languages?: string;
  includeMetadata?: boolean;
}

interface TranslationItem {
  key: string;
  text: string;
  translations: Record<string, string>;
  context?: string;
  filePath?: string;
  line?: number;
  status?: 'pending' | 'translated' | 'reviewed';
}

/**
 * 导出翻译数据为多种格式
 */
async function exportCommand(options: ExportOptions) {
  logger.title('导出翻译数据');

  try {
    // 加载配置
    const config = await configManager.loadConfig();

    const inputDir = options.input || config.output.directory;
    const outputFile =
      options.output || `translations.${options.format || 'excel'}`;
    const format = (options.format || 'excel') as 'excel' | 'csv' | 'json';
    const languages = options.languages
      ? options.languages.split(',').map(l => l.trim())
      : config.languages.supported;

    logger.info(`输入目录: ${inputDir}`);
    logger.info(`输出文件: ${outputFile}`);
    logger.info(`导出格式: ${format}`);
    logger.info(`目标语言: ${languages.join(', ')}`);
    logger.br();

    // 检查输入目录
    const inputPath = resolve(process.cwd(), inputDir);
    if (!existsSync(inputPath)) {
      logger.error(`输入目录不存在: ${inputDir}`);
      logger.info('请先运行 translink extract 生成语言文件');
      process.exit(1);
    }

    // 读取翻译数据
    const translations = await loadTranslations(
      inputPath,
      languages,
      config.languages.default
    );

    if (translations.length === 0) {
      logger.warn('未找到翻译数据');
      return;
    }

    logger.info(`发现 ${translations.length} 个翻译项`);

    // 根据格式导出
    switch (format) {
      case 'excel':
        await exportToExcel(
          translations,
          outputFile,
          languages,
          options.includeMetadata
        );
        break;
      case 'csv':
        await exportToCSV(translations, outputFile, languages);
        break;
      case 'json':
        await exportToJSON(translations, outputFile, languages);
        break;
      default:
        logger.error(`不支持的导出格式: ${format}`);
        process.exit(1);
    }

    logger.br();
    logger.success(`🎉 导出完成！文件已保存: ${outputFile}`);
  } catch (error) {
    logger.error(`导出失败: ${error}`);
    process.exit(1);
  }
}

/**
 * 加载翻译数据
 */
async function loadTranslations(
  inputDir: string,
  languages: string[],
  defaultLanguage: string
): Promise<TranslationItem[]> {
  const translations: TranslationItem[] = [];
  const mappingPath = resolve(inputDir, 'extraction-mapping.json');

  // 读取映射文件
  let mappingData: ExtractResult[] = [];
  if (existsSync(mappingPath)) {
    try {
      const mappingContent = readFileSync(mappingPath, 'utf-8');
      mappingData = JSON.parse(mappingContent);
    } catch (error) {
      logger.warn(`无法读取映射文件: ${error}`);
    }
  }

  // 读取各语言文件
  const languageData: Record<string, Record<string, string>> = {};
  for (const language of languages) {
    const languageFile = resolve(inputDir, `${language}.json`);
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

  // 构建翻译项
  const keySet = new Set<string>();

  // 从映射文件获取所有键
  for (const item of mappingData) {
    keySet.add(item.key);
  }

  // 从语言文件获取所有键
  for (const langData of Object.values(languageData)) {
    for (const key of Object.keys(langData)) {
      keySet.add(key);
    }
  }

  // 构建翻译项
  for (const key of keySet) {
    const mappingItem = mappingData.find(m => m.key === key);
    const translationValues: Record<string, string> = {};

    for (const language of languages) {
      translationValues[language] = languageData[language]?.[key] || '';
    }

    translations.push({
      key,
      text: mappingItem?.text || translationValues[defaultLanguage] || '',
      translations: translationValues,
      context: mappingItem?.context
        ? JSON.stringify(mappingItem.context)
        : undefined,
      filePath: mappingItem?.filePath,
      line: mappingItem?.line,
      status: determineStatus(translationValues, defaultLanguage),
    });
  }

  return translations;
}

/**
 * 确定翻译状态
 */
function determineStatus(
  translations: Record<string, string>,
  defaultLanguage: string
): 'pending' | 'translated' | 'reviewed' {
  const defaultText = translations[defaultLanguage] || '';
  const otherLanguages = Object.entries(translations).filter(
    ([lang]) => lang !== defaultLanguage
  );

  if (otherLanguages.length === 0) {
    return 'pending';
  }

  const translatedCount = otherLanguages.filter(
    ([, text]) => text && text.trim()
  ).length;

  if (translatedCount === 0) {
    return 'pending';
  } else if (translatedCount === otherLanguages.length) {
    return 'reviewed';
  } else {
    return 'translated';
  }
}

/**
 * 导出为 Excel 格式
 */
async function exportToExcel(
  translations: TranslationItem[],
  outputFile: string,
  languages: string[],
  includeMetadata?: boolean
) {
  try {
    // 动态导入 exceljs
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Translations');

    // 设置表头
    const headers = ['Key', ...languages, 'Status', 'Context', 'File', 'Line'];
    worksheet.addRow(headers);

    // 设置表头样式
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // 添加数据行
    for (const item of translations) {
      const row = [
        item.key,
        ...languages.map(lang => item.translations[lang] || ''),
        item.status || 'pending',
        item.context || '',
        item.filePath || '',
        item.line || '',
      ];
      worksheet.addRow(row);
    }

    // 自动调整列宽
    worksheet.columns.forEach((column, index) => {
      if (index === 0) {
        // Key 列
        column.width = 20;
      } else if (index <= languages.length) {
        // 语言列
        column.width = 30;
      } else {
        // 其他列
        column.width = 15;
      }
    });

    // 冻结首行
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // 添加元数据工作表（如果启用）
    if (includeMetadata) {
      const metadataSheet = workbook.addWorksheet('Metadata');
      metadataSheet.addRow(['Field', 'Value']);
      metadataSheet.addRow(['Export Date', new Date().toISOString()]);
      metadataSheet.addRow(['Total Keys', translations.length]);
      metadataSheet.addRow(['Languages', languages.join(', ')]);
      metadataSheet.addRow(['Default Language', languages[0]]);
    }

    // 保存文件
    const outputPath = resolve(process.cwd(), outputFile);
    await workbook.xlsx.writeFile(outputPath);

    logger.success(`Excel 文件已生成: ${outputFile}`);
  } catch (error) {
    if ((error as any).code === 'MODULE_NOT_FOUND') {
      logger.error('Excel 导出需要安装 exceljs 依赖');
      logger.info('请运行: npm install exceljs');
      logger.info('或者使用 CSV 格式: translink export --format csv');
    } else {
      throw error;
    }
  }
}

/**
 * 导出为 CSV 格式
 */
async function exportToCSV(
  translations: TranslationItem[],
  outputFile: string,
  languages: string[]
) {
  const headers = ['Key', ...languages, 'Status', 'Context', 'File', 'Line'];
  const rows = [headers];

  for (const item of translations) {
    const row = [
      item.key,
      ...languages.map(lang => escapeCSV(item.translations[lang] || '')),
      item.status || 'pending',
      escapeCSV(item.context || ''),
      escapeCSV(item.filePath || ''),
      item.line?.toString() || '',
    ];
    rows.push(row);
  }

  const csvContent = rows.map(row => row.join(',')).join('\n');
  const outputPath = resolve(process.cwd(), outputFile);
  writeFileSync(outputPath, csvContent, 'utf-8');

  logger.success(`CSV 文件已生成: ${outputFile}`);
}

/**
 * 导出为 JSON 格式
 */
async function exportToJSON(
  translations: TranslationItem[],
  outputFile: string,
  languages: string[]
) {
  const jsonData = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalKeys: translations.length,
      languages,
    },
    translations: translations.map(item => ({
      key: item.key,
      text: item.text,
      translations: item.translations,
      context: item.context,
      filePath: item.filePath,
      line: item.line,
      status: item.status,
    })),
  };

  const outputPath = resolve(process.cwd(), outputFile);
  writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');

  logger.success(`JSON 文件已生成: ${outputFile}`);
}

/**
 * 转义 CSV 字段
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export const exportCmd = new Command('export')
  .description('导出翻译数据为 Excel/CSV/JSON 格式')
  .option('-i, --input <directory>', '输入目录（语言文件所在目录）')
  .option('-o, --output <file>', '输出文件路径')
  .option('-f, --format <format>', '导出格式 (excel|csv|json)', 'excel')
  .option('-l, --languages <languages>', '目标语言（逗号分隔）')
  .option('--include-metadata', '包含元数据工作表（仅 Excel）')
  .action(exportCommand);
