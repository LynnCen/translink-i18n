/**
 * 复数规则解析器
 * 支持多语言的复数规则
 */

export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
export type PluralRule = (count: number) => PluralCategory;

export interface PluralResolverOptions {
  simplifyPluralSuffix?: boolean;
}

export class PluralResolver {
  private rules = new Map<string, PluralRule>();
  private options: PluralResolverOptions;

  constructor(options: PluralResolverOptions = {}) {
    this.options = {
      simplifyPluralSuffix: true,
      ...options,
    };

    // 注册默认的复数规则
    this.registerDefaultRules();
  }

  /**
   * 解析复数形式
   */
  resolve(language: string, count: number): PluralCategory {
    // 获取语言的基础代码（例如 'en-US' -> 'en'）
    const baseLanguage = language.split('-')[0];

    // 尝试获取精确匹配
    let rule = this.rules.get(language);

    // 如果没有精确匹配，尝试基础语言
    if (!rule) {
      rule = this.rules.get(baseLanguage);
    }

    // 如果仍然没有，使用默认规则
    if (!rule) {
      rule = this.rules.get('default');
    }

    return rule!(count);
  }

  /**
   * 注册复数规则
   */
  register(language: string, rule: PluralRule): void {
    this.rules.set(language, rule);
  }

  /**
   * 生成复数key
   * 例如：'item' + 'one' -> 'item_one' 或 'item'
   */
  generateKey(baseKey: string, category: PluralCategory): string {
    if (this.options.simplifyPluralSuffix && category === 'other') {
      return baseKey;
    }
    return `${baseKey}_${category}`;
  }

  /**
   * 注册默认的复数规则
   */
  private registerDefaultRules(): void {
    // 默认规则（英语类）
    this.register('default', (count: number) => {
      return count === 1 ? 'one' : 'other';
    });

    // 英语
    this.register('en', (count: number) => {
      return count === 1 ? 'one' : 'other';
    });

    // 中文（不区分单复数）
    this.register('zh', (_count: number) => {
      return 'other';
    });

    // 日语（不区分单复数）
    this.register('ja', (_count: number) => {
      return 'other';
    });

    // 韩语（不区分单复数）
    this.register('ko', (_count: number) => {
      return 'other';
    });

    // 法语
    this.register('fr', (count: number) => {
      return count === 0 || count === 1 ? 'one' : 'other';
    });

    // 俄语
    this.register('ru', (count: number) => {
      const mod10 = count % 10;
      const mod100 = count % 100;

      if (mod10 === 1 && mod100 !== 11) {
        return 'one';
      }

      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return 'few';
      }

      return 'many';
    });

    // 波兰语
    this.register('pl', (count: number) => {
      if (count === 1) {
        return 'one';
      }

      const mod10 = count % 10;
      const mod100 = count % 100;

      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return 'few';
      }

      return 'many';
    });

    // 阿拉伯语
    this.register('ar', (count: number) => {
      if (count === 0) {
        return 'zero';
      }

      if (count === 1) {
        return 'one';
      }

      if (count === 2) {
        return 'two';
      }

      const mod100 = count % 100;

      if (mod100 >= 3 && mod100 <= 10) {
        return 'few';
      }

      if (mod100 >= 11 && mod100 <= 99) {
        return 'many';
      }

      return 'other';
    });

    // 德语
    this.register('de', (count: number) => {
      return count === 1 ? 'one' : 'other';
    });

    // 西班牙语
    this.register('es', (count: number) => {
      return count === 1 ? 'one' : 'other';
    });

    // 意大利语
    this.register('it', (count: number) => {
      return count === 1 ? 'one' : 'other';
    });

    // 葡萄牙语（巴西）
    this.register('pt', (count: number) => {
      return count === 0 || count === 1 ? 'one' : 'other';
    });

    // 捷克语
    this.register('cs', (count: number) => {
      if (count === 1) {
        return 'one';
      }

      if (count >= 2 && count <= 4) {
        return 'few';
      }

      return 'other';
    });

    // 斯洛伐克语（与捷克语相同）
    this.register('sk', this.rules.get('cs')!);

    // 罗马尼亚语
    this.register('ro', (count: number) => {
      if (count === 1) {
        return 'one';
      }

      if (count === 0 || (count % 100 >= 2 && count % 100 <= 19)) {
        return 'few';
      }

      return 'other';
    });

    // 立陶宛语
    this.register('lt', (count: number) => {
      const mod10 = count % 10;
      const mod100 = count % 100;

      if (mod10 === 1 && (mod100 < 11 || mod100 > 19)) {
        return 'one';
      }

      if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) {
        return 'few';
      }

      return 'other';
    });

    // 拉脱维亚语
    this.register('lv', (count: number) => {
      if (count === 0) {
        return 'zero';
      }

      const mod10 = count % 10;
      const mod100 = count % 100;

      if (mod10 === 1 && mod100 !== 11) {
        return 'one';
      }

      return 'other';
    });

    // 爱尔兰语
    this.register('ga', (count: number) => {
      if (count === 1) {
        return 'one';
      }

      if (count === 2) {
        return 'two';
      }

      if (count >= 3 && count <= 6) {
        return 'few';
      }

      if (count >= 7 && count <= 10) {
        return 'many';
      }

      return 'other';
    });
  }

  /**
   * 获取所有支持的语言
   */
  getSupportedLanguages(): string[] {
    return Array.from(this.rules.keys()).filter(lang => lang !== 'default');
  }

  /**
   * 检查语言是否有自定义规则
   */
  hasRule(language: string): boolean {
    const baseLanguage = language.split('-')[0];
    return this.rules.has(language) || this.rules.has(baseLanguage);
  }
}
