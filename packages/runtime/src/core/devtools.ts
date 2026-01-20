/**
 * I18n DevTools
 * 提供调试和开发时的辅助功能
 */

import type { I18nEngine } from './i18n-engine.js';

export interface MissingKeyInfo {
  key: string;
  language: string;
  namespace: string;
  timestamp: number;
  count: number;
}

export interface TranslationStats {
  totalKeys: number;
  missingKeys: number;
  languageCoverage: Record<string, number>;
  mostMissedKeys: MissingKeyInfo[];
}

export interface DevToolsOptions {
  enabled: boolean;
  trackMissingKeys: boolean;
  logMissingKeys: boolean;
  maxMissingKeys: number;
  exposeToWindow: boolean;
  windowKey: string;
}

export class I18nDevTools {
  private options: DevToolsOptions;
  private engine: I18nEngine;
  private missingKeys = new Map<string, MissingKeyInfo>();
  // 最佳实践：移除未使用的字段
  // private translationCount = new Map<string, number>();

  constructor(engine: I18nEngine, options: Partial<DevToolsOptions> = {}) {
    this.engine = engine;
    this.options = {
      enabled: false,
      trackMissingKeys: true,
      logMissingKeys: true,
      maxMissingKeys: 1000,
      exposeToWindow: true,
      windowKey: '__TRANSLINK_DEVTOOLS__',
      ...options,
    };

    if (this.options.enabled) {
      this.init();
    }
  }

  /**
   * 最佳实践：初始化 DevTools，使用类型安全的事件监听
   */
  private init(): void {
    // 监听翻译缺失事件
    if (this.options.trackMissingKeys) {
      this.engine.on<{ key: string; language: string }>('translationMissing', (data) => {
        this.trackMissingKey(data.key, data.language);
      });
    }

    // 暴露到 window 对象
    if (this.options.exposeToWindow && typeof window !== 'undefined') {
      (window as any)[this.options.windowKey] = this.getPublicAPI();
    }
  }

  /**
   * 追踪缺失的翻译key
   */
  private trackMissingKey(
    key: string,
    language: string,
    namespace = 'translation'
  ): void {
    const fullKey = `${language}:${namespace}:${key}`;

    const existing = this.missingKeys.get(fullKey);
    if (existing) {
      existing.count++;
      existing.timestamp = Date.now();
    } else {
      // 检查是否超过最大数量
      if (this.missingKeys.size >= this.options.maxMissingKeys) {
        // 删除最旧的记录
        const oldest = Array.from(this.missingKeys.entries()).sort(
          ([, a], [, b]) => a.timestamp - b.timestamp
        )[0];
        if (oldest) {
          this.missingKeys.delete(oldest[0]);
        }
      }

      this.missingKeys.set(fullKey, {
        key,
        language,
        namespace,
        timestamp: Date.now(),
        count: 1,
      });
    }

    // 控制台输出
    if (this.options.logMissingKeys) {
      console.warn(
        `[TransLink I18n] Missing translation: key="${key}", language="${language}", namespace="${namespace}"`
      );
    }
  }

  /**
   * 获取所有缺失的keys
   */
  getMissingKeys(): MissingKeyInfo[] {
    return Array.from(this.missingKeys.values()).sort(
      (a, b) => b.count - a.count
    );
  }

  /**
   * 获取特定语言的缺失keys
   */
  getMissingKeysByLanguage(language: string): MissingKeyInfo[] {
    return this.getMissingKeys().filter(info => info.language === language);
  }

  /**
   * 获取最常缺失的keys
   */
  getMostMissedKeys(limit = 10): MissingKeyInfo[] {
    return this.getMissingKeys().slice(0, limit);
  }

  /**
   * 清除缺失keys记录
   */
  clearMissingKeys(): void {
    this.missingKeys.clear();
  }

  /**
   * 获取翻译统计信息
   */
  getStats(): TranslationStats {
    const languages = this.engine.getSupportedLanguages();
    const missingByLanguage = new Map<string, Set<string>>();

    // 统计每个语言的缺失keys
    for (const info of this.missingKeys.values()) {
      if (!missingByLanguage.has(info.language)) {
        missingByLanguage.set(info.language, new Set());
      }
      missingByLanguage.get(info.language)!.add(info.key);
    }

    // 计算每个语言的覆盖率（假设基于当前语言的总key数）
    const languageCoverage: Record<string, number> = {};
    const totalUniqueKeys = new Set(
      Array.from(this.missingKeys.values()).map(info => info.key)
    ).size;

    for (const lang of languages) {
      const missingCount = missingByLanguage.get(lang)?.size || 0;
      const coverage =
        totalUniqueKeys > 0
          ? ((totalUniqueKeys - missingCount) / totalUniqueKeys) * 100
          : 100;
      languageCoverage[lang] = Math.round(coverage * 100) / 100;
    }

    return {
      totalKeys: totalUniqueKeys,
      missingKeys: this.missingKeys.size,
      languageCoverage,
      mostMissedKeys: this.getMostMissedKeys(10),
    };
  }

  /**
   * 导出缺失keys为JSON
   */
  exportMissingKeys(): string {
    const data = {
      timestamp: new Date().toISOString(),
      totalMissing: this.missingKeys.size,
      keys: this.getMissingKeys(),
      stats: this.getStats(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * 导出缺失keys为CSV
   */
  exportMissingKeysCSV(): string {
    const headers = [
      'Key',
      'Language',
      'Namespace',
      'Count',
      'First Seen',
      'Last Seen',
    ];
    const rows = this.getMissingKeys().map(info => [
      info.key,
      info.language,
      info.namespace,
      info.count.toString(),
      new Date(info.timestamp - info.count * 1000).toISOString(),
      new Date(info.timestamp).toISOString(),
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * 打印统计信息到控制台
   */
  printStats(): void {
    const stats = this.getStats();

    console.group('[TransLink I18n] DevTools Statistics');
    console.log(`Total Unique Keys: ${stats.totalKeys}`);
    console.log(`Missing Keys: ${stats.missingKeys}`);
    console.log('\nLanguage Coverage:');
    Object.entries(stats.languageCoverage).forEach(([lang, coverage]) => {
      console.log(`  ${lang}: ${coverage}%`);
    });

    if (stats.mostMissedKeys.length > 0) {
      console.log('\nMost Missed Keys:');
      console.table(
        stats.mostMissedKeys.map(info => ({
          Key: info.key,
          Language: info.language,
          Count: info.count,
          'Last Seen': new Date(info.timestamp).toLocaleString(),
        }))
      );
    }
    console.groupEnd();
  }

  /**
   * 获取公开 API（暴露到 window）
   */
  private getPublicAPI() {
    return {
      getMissingKeys: () => this.getMissingKeys(),
      getMissingKeysByLanguage: (lang: string) =>
        this.getMissingKeysByLanguage(lang),
      getMostMissedKeys: (limit?: number) => this.getMostMissedKeys(limit),
      getStats: () => this.getStats(),
      printStats: () => this.printStats(),
      exportJSON: () => this.exportMissingKeys(),
      exportCSV: () => this.exportMissingKeysCSV(),
      clear: () => this.clearMissingKeys(),

      // 帮助信息
      help: () => {
        console.log(`
[TransLink I18n DevTools]

Available commands:
  - getMissingKeys()             Get all missing translation keys
  - getMissingKeysByLanguage(lang) Get missing keys for specific language
  - getMostMissedKeys(limit)     Get most frequently missed keys
  - getStats()                   Get translation statistics
  - printStats()                 Print statistics to console
  - exportJSON()                 Export missing keys as JSON
  - exportCSV()                  Export missing keys as CSV
  - clear()                      Clear missing keys records
  - help()                       Show this help message

Example:
  ${this.options.windowKey}.printStats()
  ${this.options.windowKey}.getMissingKeysByLanguage('en-US')
        `);
      },
    };
  }

  /**
   * 启用 DevTools
   */
  enable(): void {
    if (!this.options.enabled) {
      this.options.enabled = true;
      this.init();
    }
  }

  /**
   * 禁用 DevTools
   */
  disable(): void {
    this.options.enabled = false;

    // 从 window 移除
    if (typeof window !== 'undefined') {
      delete (window as any)[this.options.windowKey];
    }
  }
}
