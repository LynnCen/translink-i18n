/**
 * 插值处理器
 * 支持变量替换、格式化函数、嵌套插值等
 */

import type {
  TranslationParams,
  FormatFunction,
  InterpolationOptions,
} from '../types/index.js';

export class Interpolator {
  private options: InterpolationOptions;
  private formatters = new Map<string, FormatFunction>();

  constructor(options: Partial<InterpolationOptions> = {}) {
    this.options = {
      prefix: '{{',
      suffix: '}}',
      escapeValue: true,
      format: this.defaultFormat.bind(this),
      defaultVariables: {},
      ...options,
    };

    // 注册默认格式化函数
    this.registerDefaultFormatters();
  }

  /**
   * 插值处理主函数
   */
  interpolate(
    template: string,
    params: TranslationParams = {},
    language: string = 'en'
  ): string {
    if (!template || typeof template !== 'string') {
      return template || '';
    }

    // 合并默认变量
    const allParams = { ...this.options.defaultVariables, ...params };

    // 递归处理嵌套插值
    let result = template;
    let maxIterations = 10; // 防止无限递归

    while (maxIterations > 0 && this.hasInterpolation(result)) {
      const newResult = this.processInterpolation(result, allParams, language);
      if (newResult === result) {
        break; // 没有变化，避免无限循环
      }
      result = newResult;
      maxIterations--;
    }

    return result;
  }

  /**
   * 注册格式化函数
   */
  registerFormatter(name: string, formatter: FormatFunction): void {
    this.formatters.set(name, formatter);
  }

  /**
   * 注销格式化函数
   */
  unregisterFormatter(name: string): void {
    this.formatters.delete(name);
  }

  /**
   * 检查字符串是否包含插值表达式
   */
  private hasInterpolation(str: string): boolean {
    const regex = this.createInterpolationRegex();
    return regex.test(str);
  }

  /**
   * 处理插值
   */
  private processInterpolation(
    template: string,
    params: TranslationParams,
    language: string
  ): string {
    const regex = this.createInterpolationRegex();

    return template.replace(regex, (match, expression) => {
      try {
        return this.evaluateExpression(expression.trim(), params, language);
      } catch (error) {
        console.warn(
          `Interpolation error in expression "${expression}":`,
          error
        );
        return match; // 返回原始匹配，避免丢失内容
      }
    });
  }

  /**
   * 评估插值表达式
   */
  private evaluateExpression(
    expression: string,
    params: TranslationParams,
    language: string
  ): string {
    // 解析表达式：变量名, 格式化函数, 参数
    const parts = this.parseExpression(expression);
    const { variable, formatter, formatArgs } = parts;

    // 获取变量值
    let value = this.getVariableValue(variable, params);

    // 如果值不存在，返回原始表达式
    if (value === undefined || value === null) {
      return `${this.options.prefix}${expression}${this.options.suffix}`;
    }

    // 应用格式化函数
    if (formatter) {
      const formatFunction =
        this.formatters.get(formatter) || this.options.format;
      value = formatFunction(value, formatter, language, formatArgs);
    }

    // 转换为字符串
    const result = String(value);

    // 转义处理
    return this.options.escapeValue ? this.escapeHtml(result) : result;
  }

  /**
   * 解析表达式
   */
  private parseExpression(expression: string): {
    variable: string;
    formatter?: string;
    formatArgs?: any;
  } {
    // 支持格式：variable, variable|formatter, variable|formatter:arg1:arg2
    const parts = expression.split('|');
    const variable = parts[0].trim();

    if (parts.length === 1) {
      return { variable };
    }

    const formatterPart = parts[1].trim();
    const formatterParts = formatterPart.split(':');
    const formatter = formatterParts[0];
    const formatArgs = formatterParts.slice(1);

    return { variable, formatter, formatArgs };
  }

  /**
   * 获取变量值
   */
  private getVariableValue(path: string, params: TranslationParams): any {
    // 支持嵌套路径：user.name, user.profile.age
    const keys = path.split('.');
    let value: any = params;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * 创建插值正则表达式
   */
  private createInterpolationRegex(): RegExp {
    const prefix = this.escapeRegex(this.options.prefix);
    const suffix = this.escapeRegex(this.options.suffix);
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

  /**
   * 默认格式化函数
   */
  private defaultFormat(
    value: any,
    format: string,
    language: string,
    args?: any[]
  ): string {
    const formatter = this.formatters.get(format);
    if (formatter) {
      return formatter(value, format, language, args);
    }

    console.warn(`Unknown formatter: ${format}`);
    return String(value);
  }

  /**
   * 注册默认格式化函数
   */
  private registerDefaultFormatters(): void {
    // 数字格式化
    this.registerFormatter('number', (value, format, language, args) => {
      const num = Number(value);
      if (isNaN(num)) return String(value);

      const options: Intl.NumberFormatOptions = {};

      if (args && args.length > 0) {
        const [minimumFractionDigits, maximumFractionDigits] = args;
        if (minimumFractionDigits !== undefined) {
          options.minimumFractionDigits = Number(minimumFractionDigits);
        }
        if (maximumFractionDigits !== undefined) {
          options.maximumFractionDigits = Number(maximumFractionDigits);
        }
      }

      return new Intl.NumberFormat(language, options).format(num);
    });

    // 货币格式化
    this.registerFormatter('currency', (value, format, language, args) => {
      const num = Number(value);
      if (isNaN(num)) return String(value);

      const currency = (args && args[0]) || 'USD';
      return new Intl.NumberFormat(language, {
        style: 'currency',
        currency: currency,
      }).format(num);
    });

    // 日期格式化
    this.registerFormatter('date', (value, format, language, args) => {
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return String(value);

      const options: Intl.DateTimeFormatOptions = {};

      if (args && args.length > 0) {
        const style = args[0];
        switch (style) {
          case 'short':
            options.dateStyle = 'short';
            break;
          case 'medium':
            options.dateStyle = 'medium';
            break;
          case 'long':
            options.dateStyle = 'long';
            break;
          case 'full':
            options.dateStyle = 'full';
            break;
          default:
            // 自定义格式
            options.year = 'numeric';
            options.month = 'short';
            options.day = 'numeric';
        }
      }

      return new Intl.DateTimeFormat(language, options).format(date);
    });

    // 时间格式化
    this.registerFormatter('time', (value, format, language, args) => {
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return String(value);

      const options: Intl.DateTimeFormatOptions = {
        timeStyle: (args && args[0]) || 'short',
      };

      return new Intl.DateTimeFormat(language, options).format(date);
    });

    // 相对时间格式化
    this.registerFormatter('relative', (value, format, language, args) => {
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return String(value);

      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffSec = Math.round(diffMs / 1000);

      // 使用 Intl.RelativeTimeFormat（如果支持）
      if ('RelativeTimeFormat' in Intl) {
        const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });

        const absDiff = Math.abs(diffSec);
        if (absDiff < 60) {
          return rtf.format(diffSec, 'second');
        } else if (absDiff < 3600) {
          return rtf.format(Math.round(diffSec / 60), 'minute');
        } else if (absDiff < 86400) {
          return rtf.format(Math.round(diffSec / 3600), 'hour');
        } else {
          return rtf.format(Math.round(diffSec / 86400), 'day');
        }
      }

      // 降级处理
      return date.toLocaleDateString(language);
    });

    // 大小写转换
    this.registerFormatter('uppercase', value => String(value).toUpperCase());
    this.registerFormatter('lowercase', value => String(value).toLowerCase());
    this.registerFormatter('capitalize', value => {
      const str = String(value);
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });

    // 复数处理
    this.registerFormatter('plural', (value, format, language, args) => {
      const count = Number(value);
      if (isNaN(count)) return String(value);

      if (!args || args.length === 0) return String(value);

      // 简单的复数规则
      if (count === 0 && args[0]) return args[0]; // zero
      if (count === 1 && args[1]) return args[1]; // one
      if (args[2]) return args[2]; // other

      return String(value);
    });
  }
}
