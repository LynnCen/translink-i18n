import { logger } from '../utils/logger.js';
import type { TranslationItem } from '../types/config.js';

export interface VikaRecord {
  recordId?: string;
  fields: {
    key: string;
    'zh-CN': string;
    'en-US'?: string;
    'ja-JP'?: string;
    'ko-KR'?: string;
    'fr-FR'?: string;
    'de-DE'?: string;
    status: 'pending' | 'translated' | 'reviewed';
    context?: string;
    file?: string;
    line?: number;
    updatedAt?: string;
  };
}

export interface VikaResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export interface VikaListResponse {
  records: VikaRecord[];
  pageNum: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export class VikaClient {
  private apiKey: string;
  private datasheetId: string;
  private baseURL = 'https://vika.cn/fusion/v1';

  constructor(apiKey: string, datasheetId: string) {
    this.apiKey = apiKey;
    this.datasheetId = datasheetId;
  }

  /**
   * 推送翻译项到 Vika
   */
  async pushTranslations(translations: TranslationItem[]): Promise<{
    created: number;
    updated: number;
    errors: number;
  }> {
    if (!this.validateConfig()) {
      throw new Error('Vika 配置无效，请检查 API Key 和 Datasheet ID');
    }

    logger.startSpinner('推送翻译到 Vika...');

    const stats = { created: 0, updated: 0, errors: 0 };
    const batchSize = 10; // Vika API 批量限制

    try {
      // 获取现有记录
      const existingRecords = await this.getAllRecords();
      const existingMap = new Map<string, VikaRecord>();
      
      existingRecords.forEach(record => {
        if (record.fields.key) {
          existingMap.set(record.fields.key, record);
        }
      });

      // 分批处理
      for (let i = 0; i < translations.length; i += batchSize) {
        const batch = translations.slice(i, i + batchSize);
        logger.updateSpinner(`推送进度: ${i + batch.length}/${translations.length}`);

        try {
          const batchStats = await this.processBatch(batch, existingMap);
          stats.created += batchStats.created;
          stats.updated += batchStats.updated;
          stats.errors += batchStats.errors;
        } catch (error) {
          logger.debug(`批次 ${i}-${i + batch.length} 处理失败: ${error}`);
          stats.errors += batch.length;
        }

        // 避免 API 限流
        if (i + batchSize < translations.length) {
          await this.delay(200);
        }
      }

      logger.stopSpinner(
        `✓ 推送完成: 新增 ${stats.created} 个，更新 ${stats.updated} 个` +
        (stats.errors > 0 ? `，失败 ${stats.errors} 个` : '')
      );

      return stats;
    } catch (error) {
      logger.stopSpinner('✗ 推送失败', false);
      throw error;
    }
  }

  /**
   * 从 Vika 拉取翻译
   */
  async pullTranslations(language: string): Promise<Record<string, string>> {
    if (!this.validateConfig()) {
      throw new Error('Vika 配置无效，请检查 API Key 和 Datasheet ID');
    }

    logger.startSpinner(`从 Vika 拉取 ${language} 翻译...`);

    try {
      const records = await this.getAllRecords();
      const translations: Record<string, string> = {};

      let translatedCount = 0;
      for (const record of records) {
        const { key } = record.fields;
        const translation = record.fields[language as keyof typeof record.fields] as string;

        if (key && translation && translation.trim()) {
          translations[key] = translation.trim();
          translatedCount++;
        }
      }

      logger.stopSpinner(`✓ 拉取完成: 获得 ${translatedCount} 个 ${language} 翻译`);
      return translations;
    } catch (error) {
      logger.stopSpinner('✗ 拉取失败', false);
      throw error;
    }
  }

  /**
   * 获取翻译状态统计
   */
  async getTranslationStats(): Promise<{
    total: number;
    pending: number;
    translated: number;
    reviewed: number;
    languages: Record<string, number>;
  }> {
    const records = await this.getAllRecords();
    const stats = {
      total: records.length,
      pending: 0,
      translated: 0,
      reviewed: 0,
      languages: {} as Record<string, number>,
    };

    const supportedLanguages = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'fr-FR', 'de-DE'];

    for (const record of records) {
      // 统计状态
      switch (record.fields.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'translated':
          stats.translated++;
          break;
        case 'reviewed':
          stats.reviewed++;
          break;
      }

      // 统计各语言完成情况
      for (const lang of supportedLanguages) {
        if (!stats.languages[lang]) {
          stats.languages[lang] = 0;
        }
        
        const translation = record.fields[lang as keyof typeof record.fields] as string;
        if (translation && translation.trim()) {
          stats.languages[lang]++;
        }
      }
    }

    return stats;
  }

  /**
   * 处理单个批次
   */
  private async processBatch(
    batch: TranslationItem[],
    existingMap: Map<string, VikaRecord>
  ): Promise<{ created: number; updated: number; errors: number }> {
    const toCreate: VikaRecord[] = [];
    const toUpdate: Array<{ recordId: string; fields: Partial<VikaRecord['fields']> }> = [];

    // 分类新增和更新
    for (const item of batch) {
      const existing = existingMap.get(item.key);
      
      if (existing) {
        // 检查是否需要更新
        if (this.needsUpdate(existing, item)) {
          toUpdate.push({
            recordId: existing.recordId!,
            fields: {
              'zh-CN': item.text,
              context: item.context,
              file: item.filePath,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      } else {
        // 新记录
        toCreate.push({
          fields: {
            key: item.key,
            'zh-CN': item.text,
            status: item.status || 'pending',
            context: item.context,
            file: item.filePath,
            updatedAt: new Date().toISOString(),
          },
        });
      }
    }

    const stats = { created: 0, updated: 0, errors: 0 };

    // 创建新记录
    if (toCreate.length > 0) {
      try {
        await this.createRecords(toCreate);
        stats.created = toCreate.length;
      } catch (error) {
        logger.debug(`创建记录失败: ${error}`);
        stats.errors += toCreate.length;
      }
    }

    // 更新现有记录
    if (toUpdate.length > 0) {
      try {
        await this.updateRecords(toUpdate);
        stats.updated = toUpdate.length;
      } catch (error) {
        logger.debug(`更新记录失败: ${error}`);
        stats.errors += toUpdate.length;
      }
    }

    return stats;
  }

  /**
   * 检查记录是否需要更新
   */
  private needsUpdate(existing: VikaRecord, item: TranslationItem): boolean {
    return (
      existing.fields['zh-CN'] !== item.text ||
      existing.fields.context !== item.context ||
      existing.fields.file !== item.filePath
    );
  }

  /**
   * 获取所有记录
   */
  private async getAllRecords(): Promise<VikaRecord[]> {
    const allRecords: VikaRecord[] = [];
    let pageNum = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getRecords(pageNum);
      allRecords.push(...response.records);
      hasMore = response.hasMore;
      pageNum++;

      // 避免请求过快
      if (hasMore) {
        await this.delay(100);
      }
    }

    return allRecords;
  }

  /**
   * 获取记录（分页）
   */
  private async getRecords(pageNum: number = 1, pageSize: number = 100): Promise<VikaListResponse> {
    const url = `${this.baseURL}/datasheets/${this.datasheetId}/records`;
    const params = new URLSearchParams({
      pageNum: pageNum.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`获取记录失败: ${response.status} ${response.statusText}`);
    }

    const result: VikaResponse<VikaListResponse> = await response.json();
    
    if (!result.success) {
      throw new Error(`API 错误: ${result.message}`);
    }

    return result.data;
  }

  /**
   * 创建记录
   */
  private async createRecords(records: VikaRecord[]): Promise<void> {
    const url = `${this.baseURL}/datasheets/${this.datasheetId}/records`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ records }),
    });

    if (!response.ok) {
      throw new Error(`创建记录失败: ${response.status} ${response.statusText}`);
    }

    const result: VikaResponse = await response.json();
    
    if (!result.success) {
      throw new Error(`API 错误: ${result.message}`);
    }
  }

  /**
   * 更新记录
   */
  private async updateRecords(updates: Array<{ recordId: string; fields: Partial<VikaRecord['fields']> }>): Promise<void> {
    const url = `${this.baseURL}/datasheets/${this.datasheetId}/records`;

    const records = updates.map(update => ({
      recordId: update.recordId,
      fields: update.fields,
    }));

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ records }),
    });

    if (!response.ok) {
      throw new Error(`更新记录失败: ${response.status} ${response.statusText}`);
    }

    const result: VikaResponse = await response.json();
    
    if (!result.success) {
      throw new Error(`API 错误: ${result.message}`);
    }
  }

  /**
   * 获取请求头
   */
  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 验证配置
   */
  private validateConfig(): boolean {
    return !!(this.apiKey && this.datasheetId);
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getRecords(1, 1);
      return true;
    } catch (error) {
      logger.debug(`Vika 连接测试失败: ${error}`);
      return false;
    }
  }
}
