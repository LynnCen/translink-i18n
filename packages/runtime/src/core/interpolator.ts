/**
 * 插值处理器（简化版）
 * 只支持基础变量替换和 HTML 转义
 */

import type { TranslationParams } from '../types/index.js';

export interface InterpolatorOptions {
  prefix?: string;
  suffix?: string;
  escapeValue?: boolean;
}

export class Interpolator {
  private prefix: string;
  private suffix: string;
  private escapeValue: boolean;

  constructor(options: InterpolatorOptions = {}) {
    this.prefix = options.prefix || '{{';
    this.suffix = options.suffix || '}}';
    this.escapeValue = options.escapeValue ?? true;
  }

  /**
   * 基础插值（仅支持简单变量替换）
   */
  interpolate(
    template: string,
    params: TranslationParams = {},
    _language?: string
  ): string {
    if (!template || typeof template !== 'string') {
      return template || '';
    }

    const regex = this.createInterpolationRegex();

    return template.replace(regex, (match, variable) => {
      const key = variable.trim();
      const value = params[key];

      if (value === undefined || value === null) {
        return match; // 保持原样
      }

      const result = String(value);
      return this.escapeValue ? this.escapeHtml(result) : result;
    });
  }

  /**
   * 创建插值正则表达式
   */
  private createInterpolationRegex(): RegExp {
    const prefix = this.escapeRegex(this.prefix);
    const suffix = this.escapeRegex(this.suffix);
    return new RegExp(`${prefix}([^${suffix}]+)${suffix}`, 'g');
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * HTML 转义
   */
  private escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return str.replace(/[&<>"']/g, match => htmlEscapes[match]);
  }
}
