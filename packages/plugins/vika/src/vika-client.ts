/**
 * Vika API 客户端
 */

import type { TranslationItem } from '@translink/i18n-cli';

interface VikaRecord {
  recordId?: string;
  fields: Record<string, any>;
}

interface VikaResponse {
  code: number;
  message: string;
  data?: any;
}

interface VikaListResponse {
  records: VikaRecord[];
  total: number;
  pageNum: number;
  pageSize: number;
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
   * 推送翻译到 Vika
   */
  async pushTranslations(translations: TranslationItem[]): Promise<{
    created: number;
    updated: number;
    errors: number;
  }> {
    const batchSize = 100;
    let created = 0;
    let updated = 0;
    let errors = 0;

    // 获取所有现有记录
    const existingRecords = await this.getAllRecords();
    const existingMap = new Map<string, VikaRecord>();
    for (const record of existingRecords) {
      const key = record.fields.key || record.fields['翻译键'] || '';
      if (key) {
        existingMap.set(key, record);
      }
    }

    // 分批处理
    for (let i = 0; i < translations.length; i += batchSize) {
      const batch = translations.slice(i, i + batchSize);
      
      const recordsToCreate: VikaRecord[] = [];
      const recordsToUpdate: VikaRecord[] = [];

      for (const translation of batch) {
        const existing = existingMap.get(translation.key);
        const record: VikaRecord = {
          fields: {
            key: translation.key,
            text: translation.text,
            context: translation.context || '',
            filePath: translation.filePath || '',
            status: translation.status || 'pending',
          },
        };

        if (existing) {
          record.recordId = existing.recordId;
          recordsToUpdate.push(record);
        } else {
          recordsToCreate.push(record);
        }
      }

      // 创建新记录
      if (recordsToCreate.length > 0) {
        try {
          await this.createRecords(recordsToCreate);
          created += recordsToCreate.length;
        } catch (error) {
          errors += recordsToCreate.length;
        }
      }

      // 更新现有记录
      if (recordsToUpdate.length > 0) {
        try {
          await this.updateRecords(recordsToUpdate);
          updated += recordsToUpdate.length;
        } catch (error) {
          errors += recordsToUpdate.length;
        }
      }

      // 避免频率限制
      if (i + batchSize < translations.length) {
        await this.delay(100);
      }
    }

    return { created, updated, errors };
  }

  /**
   * 从 Vika 拉取翻译
   */
  async pullTranslations(language: string): Promise<Record<string, string>> {
    const records = await this.getAllRecords();
    const translations: Record<string, string> = {};

    for (const record of records) {
      const key = record.fields.key || record.fields['翻译键'] || '';
      const translation = record.fields[language] || record.fields[`${language}_翻译`] || '';
      
      if (key && translation) {
        translations[key] = translation;
      }
    }

    return translations;
  }

  /**
   * 获取翻译统计信息
   */
  async getTranslationStats(): Promise<{
    total: number;
    pending: number;
    translated: number;
    reviewed: number;
    languages: Record<string, number>;
  }> {
    const records = await this.getAllRecords();
    
    let pending = 0;
    let translated = 0;
    let reviewed = 0;
    const languages: Record<string, number> = {};

    for (const record of records) {
      const status = record.fields.status || record.fields['状态'] || 'pending';
      
      if (status === 'pending') pending++;
      else if (status === 'translated') translated++;
      else if (status === 'reviewed') reviewed++;

      // 统计语言
      for (const [field, value] of Object.entries(record.fields)) {
        if (field.includes('_翻译') || /^[a-z]{2}-[A-Z]{2}$/.test(field)) {
          if (value && typeof value === 'string' && value.trim()) {
            languages[field] = (languages[field] || 0) + 1;
          }
        }
      }
    }

    return {
      total: records.length,
      pending,
      translated,
      reviewed,
      languages,
    };
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/datasheets/${this.datasheetId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取所有记录
   */
  private async getAllRecords(): Promise<VikaRecord[]> {
    const allRecords: VikaRecord[] = [];
    let pageNum = 1;
    const pageSize = 100;

    while (true) {
      const response = await this.getRecords(pageNum, pageSize);
      allRecords.push(...response.records);

      if (response.records.length < pageSize) {
        break;
      }

      pageNum++;
    }

    return allRecords;
  }

  /**
   * 获取记录
   */
  private async getRecords(pageNum: number, pageSize: number): Promise<VikaListResponse> {
    const response = await fetch(
      `${this.baseURL}/datasheets/${this.datasheetId}/records?pageNum=${pageNum}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch records: ${response.statusText}`);
    }

    const data: VikaResponse = await response.json();
    return data.data as VikaListResponse;
  }

  /**
   * 创建记录
   */
  private async createRecords(records: VikaRecord[]): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/datasheets/${this.datasheetId}/records`,
      {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create records: ${response.statusText}`);
    }
  }

  /**
   * 更新记录
   */
  private async updateRecords(records: VikaRecord[]): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/datasheets/${this.datasheetId}/records`,
      {
        method: 'PATCH',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update records: ${response.statusText}`);
    }
  }

  /**
   * 获取请求头
   */
  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

