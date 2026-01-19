import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { configManager } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { ASTExtractor } from '../extractors/ast-extractor.js';
import { HashGenerator } from '../generators/hash-generator.js';

interface AnalyzeOptions {
  input?: string;
  output?: string;
  format?: 'json' | 'html' | 'markdown';
  verbose?: boolean;
}

interface AnalysisReport {
  summary: {
    totalFiles: number;
    processedFiles: number;
    totalTexts: number;
    chineseTexts: number;
    translationCoverage: Record<string, number>;
    hashCollisions: number;
  };
  fileAnalysis: Array<{
    filePath: string;
    textCount: number;
    chineseCount: number;
    functions: string[];
    coverage: number;
  }>;
  translationAnalysis: Array<{
    key: string;
    text: string;
    filePath: string;
    line: number;
    context: any;
    translations: Record<string, string>;
  }>;
  recommendations: string[];
}

async function analyzeCommand(options: AnalyzeOptions) {
  logger.title('分析翻译覆盖率');

  try {
    // 加载配置
    const config = await configManager.loadConfig();

    const inputDir = options.input || config.output.directory;
    const outputFile = options.output;
    const format = options.format || 'json';

    logger.info(`输入目录: ${inputDir}`);
    if (outputFile) {
      logger.info(`输出文件: ${outputFile}`);
    }
    logger.br();

    // 初始化分析器
    const hashGenerator = new HashGenerator(config.hash);
    const extractor = new ASTExtractor(config.extract, hashGenerator);

    // 执行代码扫描
    logger.startSpinner('扫描项目代码...');
    const extractResults = await extractor.extractFromProject();
    const extractStats = extractor.getStats();
    const hashStats = hashGenerator.getCollisionStats();
    logger.stopSpinner(`✓ 扫描完成，发现 ${extractResults.length} 个翻译文本`);

    // 分析本地翻译文件
    logger.startSpinner('分析本地翻译文件...');
    const localTranslations = await analyzeLocalTranslations(
      inputDir,
      config.languages.supported
    );
    logger.stopSpinner(
      `✓ 分析完成，发现 ${Object.keys(localTranslations).length} 个语言文件`
    );

    // 生成分析报告
    const report = generateAnalysisReport(
      extractResults,
      extractStats,
      hashStats,
      localTranslations,
      config
    );

    // 显示分析结果
    displayAnalysisResults(report, options.verbose!);

    // 保存报告文件
    if (outputFile) {
      await saveAnalysisReport(report, outputFile, format);
      logger.success(`分析报告已保存: ${outputFile}`);
    }

    // 显示建议
    if (report.recommendations.length > 0) {
      logger.br();
      logger.info('💡 优化建议:');
      report.recommendations.forEach((rec, index) => {
        logger.info(`  ${index + 1}. ${rec}`);
      });
    }
  } catch (error) {
    logger.error(`分析失败: ${error}`);
    process.exit(1);
  }
}

/**
 * 分析本地翻译文件
 */
async function analyzeLocalTranslations(
  inputDir: string,
  supportedLanguages: string[]
): Promise<Record<string, Record<string, string>>> {
  const inputPath = resolve(process.cwd(), inputDir);
  const translations: Record<string, Record<string, string>> = {};

  for (const language of supportedLanguages) {
    const filePath = resolve(inputPath, `${language}.json`);

    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const languageData = JSON.parse(content);
        translations[language] = languageData;
      } catch (error) {
        logger.debug(`解析 ${language} 翻译文件失败: ${error}`);
        translations[language] = {};
      }
    } else {
      translations[language] = {};
    }
  }

  return translations;
}

/**
 * 生成分析报告
 */
function generateAnalysisReport(
  extractResults: any[],
  extractStats: any,
  hashStats: any,
  localTranslations: Record<string, Record<string, string>>,
  config: any
): AnalysisReport {
  // 计算翻译覆盖率
  const translationCoverage: Record<string, number> = {};
  const totalKeys = extractResults.length;

  for (const language of config.languages.supported) {
    const languageTranslations = localTranslations[language] || {};
    const translatedCount = Object.keys(languageTranslations).filter(
      key => languageTranslations[key] && languageTranslations[key].trim()
    ).length;

    translationCoverage[language] =
      totalKeys > 0 ? (translatedCount / totalKeys) * 100 : 0;
  }

  // 文件级分析
  const fileAnalysis = analyzeByFile(extractResults);

  // 翻译项分析
  const translationAnalysis = extractResults.map(result => ({
    key: result.key,
    text: result.text,
    filePath: result.filePath,
    line: result.line,
    context: result.context,
    translations: Object.fromEntries(
      config.languages.supported.map((lang: string) => [
        lang,
        localTranslations[lang]?.[result.key] || '',
      ])
    ),
  }));

  // 生成建议
  const recommendations = generateRecommendations(
    extractStats,
    hashStats,
    translationCoverage
  );

  return {
    summary: {
      totalFiles: extractStats.totalFiles,
      processedFiles: extractStats.processedFiles,
      totalTexts: extractStats.totalExtractions,
      chineseTexts: extractStats.chineseTexts,
      translationCoverage,
      hashCollisions: hashStats.collisions,
    },
    fileAnalysis,
    translationAnalysis,
    recommendations,
  };
}

/**
 * 按文件分析
 */
function analyzeByFile(extractResults: any[]): Array<{
  filePath: string;
  textCount: number;
  chineseCount: number;
  functions: string[];
  coverage: number;
}> {
  const fileMap = new Map<
    string,
    {
      textCount: number;
      chineseCount: number;
      functions: Set<string>;
    }
  >();

  // 统计每个文件的情况
  for (const result of extractResults) {
    if (!fileMap.has(result.filePath)) {
      fileMap.set(result.filePath, {
        textCount: 0,
        chineseCount: 0,
        functions: new Set(),
      });
    }

    const fileStats = fileMap.get(result.filePath)!;
    fileStats.textCount++;
    fileStats.chineseCount++;

    if (result.context?.functionName) {
      fileStats.functions.add(result.context.functionName);
    }
  }

  // 转换为数组格式
  return Array.from(fileMap.entries()).map(([filePath, stats]) => ({
    filePath,
    textCount: stats.textCount,
    chineseCount: stats.chineseCount,
    functions: Array.from(stats.functions),
    coverage: stats.chineseCount > 0 ? 100 : 0, // 简化的覆盖率计算
  }));
}

/**
 * 生成优化建议
 */
function generateRecommendations(
  extractStats: any,
  hashStats: any,
  translationCoverage: Record<string, number>
): string[] {
  const recommendations: string[] = [];

  // 扫描相关建议
  if (extractStats.errors > 0) {
    recommendations.push(
      `修复 ${extractStats.errors} 个文件扫描错误，提高提取准确性`
    );
  }

  // 哈希冲突建议
  if (hashStats.collisionRate > 0.1) {
    recommendations.push(
      '哈希冲突率较高，考虑增加哈希长度或启用更多上下文信息'
    );
  }

  // 翻译覆盖率建议
  for (const [language, coverage] of Object.entries(translationCoverage)) {
    if (coverage < 50) {
      recommendations.push(
        `${language} 翻译覆盖率较低 (${coverage.toFixed(1)}%)，建议完善翻译`
      );
    }
  }

  // 文件组织建议
  if (extractStats.processedFiles > 100) {
    recommendations.push(
      '项目文件较多，考虑使用更精确的扫描模式或排除不必要的文件'
    );
  }

  return recommendations;
}

/**
 * 显示分析结果
 */
function displayAnalysisResults(report: AnalysisReport, verbose: boolean) {
  logger.br();
  logger.success('📊 分析结果:');

  // 基础统计
  logger.info('基础统计:');
  logger.info(`  扫描文件: ${report.summary.totalFiles} 个`);
  logger.info(`  处理文件: ${report.summary.processedFiles} 个`);
  logger.info(`  中文文本: ${report.summary.chineseTexts} 个`);
  logger.info(`  哈希冲突: ${report.summary.hashCollisions} 个`);

  // 翻译覆盖率
  logger.br();
  logger.info('翻译覆盖率:');
  for (const [language, coverage] of Object.entries(
    report.summary.translationCoverage
  )) {
    const status = coverage >= 90 ? '🟢' : coverage >= 70 ? '🟡' : '🔴';
    logger.info(`  ${status} ${language}: ${coverage.toFixed(1)}%`);
  }

  // 详细信息
  if (verbose) {
    logger.br();
    logger.info('文件详情 (前 10 个):');
    report.fileAnalysis.slice(0, 10).forEach((file, index) => {
      logger.info(`  ${index + 1}. ${file.filePath}`);
      logger.info(`     中文文本: ${file.chineseCount} 个`);
      logger.info(`     使用函数: ${file.functions.join(', ')}`);
    });

    if (report.fileAnalysis.length > 10) {
      logger.info(`  ... 还有 ${report.fileAnalysis.length - 10} 个文件`);
    }
  }
}

/**
 * 保存分析报告
 */
async function saveAnalysisReport(
  report: AnalysisReport,
  outputFile: string,
  format: string
) {
  const outputPath = resolve(process.cwd(), outputFile);

  switch (format) {
    case 'json':
      writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
      break;
    case 'html': {
      const htmlContent = generateHTMLReport(report);
      writeFileSync(outputPath, htmlContent, 'utf-8');
      break;
    }
    case 'markdown': {
      const markdownContent = generateMarkdownReport(report);
      writeFileSync(outputPath, markdownContent, 'utf-8');
      break;
    }
    default:
      throw new Error(`不支持的输出格式: ${format}`);
  }
}

/**
 * 生成 HTML 报告
 */
function generateHTMLReport(report: AnalysisReport): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TransLink I18n 分析报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .coverage { display: flex; gap: 20px; flex-wrap: wrap; }
        .coverage-item { background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; }
        .high { border-left: 4px solid #4caf50; }
        .medium { border-left: 4px solid #ff9800; }
        .low { border-left: 4px solid #f44336; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔗 TransLink I18n 分析报告</h1>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        
        <div class="summary">
            <h2>📊 基础统计</h2>
            <p>扫描文件: <strong>${report.summary.totalFiles}</strong> 个</p>
            <p>处理文件: <strong>${report.summary.processedFiles}</strong> 个</p>
            <p>中文文本: <strong>${report.summary.chineseTexts}</strong> 个</p>
            <p>哈希冲突: <strong>${report.summary.hashCollisions}</strong> 个</p>
        </div>

        <h2>🌐 翻译覆盖率</h2>
        <div class="coverage">
            ${Object.entries(report.summary.translationCoverage)
              .map(([lang, coverage]) => {
                const level =
                  coverage >= 90 ? 'high' : coverage >= 70 ? 'medium' : 'low';
                return `<div class="coverage-item ${level}">
                <h3>${lang}</h3>
                <p><strong>${coverage.toFixed(1)}%</strong></p>
              </div>`;
              })
              .join('')}
        </div>

        <h2>📁 文件分析</h2>
        <table>
            <thead>
                <tr>
                    <th>文件路径</th>
                    <th>中文文本数</th>
                    <th>使用函数</th>
                </tr>
            </thead>
            <tbody>
                ${report.fileAnalysis
                  .slice(0, 20)
                  .map(
                    file => `
                    <tr>
                        <td>${file.filePath}</td>
                        <td>${file.chineseCount}</td>
                        <td>${file.functions.join(', ')}</td>
                    </tr>
                `
                  )
                  .join('')}
            </tbody>
        </table>

        ${
          report.recommendations.length > 0
            ? `
        <h2>💡 优化建议</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
        `
            : ''
        }
    </div>
</body>
</html>
  `.trim();
}

/**
 * 生成 Markdown 报告
 */
function generateMarkdownReport(report: AnalysisReport): string {
  return `
# 🔗 TransLink I18n 分析报告

生成时间: ${new Date().toLocaleString('zh-CN')}

## 📊 基础统计

- 扫描文件: **${report.summary.totalFiles}** 个
- 处理文件: **${report.summary.processedFiles}** 个
- 中文文本: **${report.summary.chineseTexts}** 个
- 哈希冲突: **${report.summary.hashCollisions}** 个

## 🌐 翻译覆盖率

${Object.entries(report.summary.translationCoverage)
  .map(([lang, coverage]) => {
    const status = coverage >= 90 ? '🟢' : coverage >= 70 ? '🟡' : '🔴';
    return `- ${status} **${lang}**: ${coverage.toFixed(1)}%`;
  })
  .join('\n')}

## 📁 文件分析

| 文件路径 | 中文文本数 | 使用函数 |
|---------|-----------|---------|
${report.fileAnalysis
  .slice(0, 20)
  .map(
    file =>
      `| ${file.filePath} | ${file.chineseCount} | ${file.functions.join(', ') || '-'} |`
  )
  .join('\n')}

${
  report.recommendations.length > 0
    ? `
## 💡 优化建议

${report.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}
`
    : ''
}
  `.trim();
}

export const analyze = new Command('analyze')
  .description('分析翻译覆盖率和质量')
  .option('-i, --input <directory>', '输入目录')
  .option('-o, --output <file>', '输出报告文件')
  .option('-f, --format <format>', '报告格式 (json|html|markdown)', 'json')
  .option('-v, --verbose', '显示详细信息')
  .action(analyzeCommand);
