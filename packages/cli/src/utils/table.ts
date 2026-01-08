/**
 * 表格显示工具
 * 用于在终端中显示翻译变更信息
 */

import Table from 'cli-table3';
import chalk from 'chalk';
import type { I18nConfig } from '../types/config.js';

export interface Change {
  key: string;
  text: string;
  type: 'added' | 'updated' | 'kept' | 'deleted';
  languages: string[];
  filePath?: string;
  line?: number;
}

/**
 * 显示变更表格
 */
export function displayChangesTable(
  changes: Change[],
  config: I18nConfig
): void {
  if (!config.cli?.table?.enabled) {
    return;
  }

  const maxRows = config.cli?.table?.maxRows || 20;
  const displayChanges = changes.slice(0, maxRows);

  const table = new Table({
    head: [
      chalk.bold.cyan('Key'),
      chalk.bold.cyan('Text'),
      chalk.bold.cyan('Status'),
      chalk.bold.cyan('Languages'),
    ],
    colWidths: [15, 30, 12, 20],
    style: {
      head: [],
      border: ['grey'],
    },
  });

  for (const change of displayChanges) {
    const statusIcon = getStatusIcon(change.type);
    const truncatedText = truncate(change.text, 25);
    const languagesText = change.languages.join(', ');

    table.push([change.key, truncatedText, statusIcon, languagesText]);
  }

  console.log('\n📋 变更详情:');
  console.log(table.toString());

  if (changes.length > maxRows) {
    console.log(chalk.gray(`\n... 还有 ${changes.length - maxRows} 项未显示`));
  }
}

/**
 * 获取状态图标
 */
function getStatusIcon(type: Change['type']): string {
  switch (type) {
    case 'added':
      return chalk.green('🆕 新增');
    case 'updated':
      return chalk.yellow('📝 更新');
    case 'kept':
      return chalk.gray('✓ 保留');
    case 'deleted':
      return chalk.red('🗑 删除');
    default:
      return chalk.gray('- 未知');
  }
}

/**
 * 截断文本
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * 显示统计信息
 */
export function displayStats(stats: {
  added: number;
  updated: number;
  kept: number;
  deleted: number;
}): void {
  console.log('\n📊 统计:');

  if (stats.added > 0) {
    console.log(chalk.green(`  - 新增: ${stats.added} 个`));
  }

  if (stats.updated > 0) {
    console.log(chalk.yellow(`  - 更新: ${stats.updated} 个`));
  }

  if (stats.kept > 0) {
    console.log(chalk.gray(`  - 保留: ${stats.kept} 个`));
  }

  if (stats.deleted > 0) {
    console.log(chalk.red(`  - 删除: ${stats.deleted} 个`));
  }

  const total = stats.added + stats.updated + stats.kept + stats.deleted;
  console.log(chalk.bold(`  - 总计: ${total} 个\n`));
}

/**
 * 显示语言包更新信息
 */
export function displayLocaleUpdates(
  updates: Array<{
    language: string;
    file: string;
    added: number;
    updated: number;
    kept: number;
  }>
): void {
  console.log();
  for (const update of updates) {
    const parts: string[] = [];

    if (update.added > 0) {
      parts.push(chalk.green(`新增 ${update.added} 个`));
    }

    if (update.updated > 0) {
      parts.push(chalk.yellow(`更新 ${update.updated} 个`));
    }

    if (update.kept > 0) {
      parts.push(chalk.gray(`保留 ${update.kept} 个`));
    }

    const message = parts.length > 0 ? ` (${parts.join(', ')})` : '';
    console.log(chalk.green(`✓ 更新 ${update.file}${message}`));
  }
}
