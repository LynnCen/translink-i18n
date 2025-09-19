import { I18nEngine } from '@translink/i18n-runtime';

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  age: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  age?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 用户服务类 - 展示在业务逻辑中使用国际化
 */
export class UserService {
  private users: Map<string, User> = new Map();
  private i18n: I18nEngine;

  constructor(i18n: I18nEngine) {
    this.i18n = i18n;
  }

  /**
   * 创建用户
   */
  async createUser(userData: CreateUserData): Promise<User> {
    // 验证输入数据
    const validation = this.validateCreateUserData(userData);
    if (!validation.isValid) {
      throw new Error($tsl('用户数据验证失败: {{errors}}', { 
        errors: validation.errors.join(', ') 
      }));
    }

    const user: User = {
      id: this.generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);
    
    console.log($tsl('用户 {{name}} 创建成功'), { name: user.name });
    return user;
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, updateData: UpdateUserData): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error($tsl('用户不存在: {{id}}'), { id });
    }

    // 验证更新数据
    if (updateData.email) {
      const emailValidation = this.validateEmail(updateData.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors.join(', '));
      }
    }

    const updatedUser: User = {
      ...user,
      ...updateData,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    
    console.log($tsl('用户 {{name}} 更新成功'), { name: updatedUser.name });
    return updatedUser;
  }

  /**
   * 获取用户
   */
  getUser(id: string): User | null {
    return this.users.get(id) || null;
  }

  /**
   * 获取所有用户
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * 删除用户
   */
  deleteUser(id: string): boolean {
    const user = this.users.get(id);
    if (!user) {
      console.warn($tsl('尝试删除不存在的用户: {{id}}'), { id });
      return false;
    }

    this.users.delete(id);
    console.log($tsl('用户 {{name}} 删除成功'), { name: user.name });
    return true;
  }

  /**
   * 验证用户数据
   */
  validateUser(user: User): ValidationResult {
    const errors: string[] = [];

    // 验证姓名
    if (!user.name || user.name.trim().length === 0) {
      errors.push(this.i18n.t('validation.required', { field: $tsl('姓名') }));
    } else if (user.name.length < 2) {
      errors.push(this.i18n.t('validation.minLength', { field: $tsl('姓名'), min: 2 }));
    } else if (user.name.length > 50) {
      errors.push(this.i18n.t('validation.maxLength', { field: $tsl('姓名'), max: 50 }));
    }

    // 验证邮箱
    const emailValidation = this.validateEmail(user.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }

    // 验证年龄
    if (user.age < 0 || user.age > 150) {
      errors.push($tsl('年龄必须在 0-150 之间'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证创建用户数据
   */
  private validateCreateUserData(userData: CreateUserData): ValidationResult {
    const errors: string[] = [];

    // 验证姓名
    if (!userData.name || userData.name.trim().length === 0) {
      errors.push(this.i18n.t('validation.required', { field: $tsl('姓名') }));
    }

    // 验证邮箱
    if (!userData.email || userData.email.trim().length === 0) {
      errors.push(this.i18n.t('validation.required', { field: $tsl('邮箱') }));
    } else {
      const emailValidation = this.validateEmail(userData.email);
      if (!emailValidation.isValid) {
        errors.push(...emailValidation.errors);
      }
    }

    // 验证年龄
    if (userData.age === undefined || userData.age === null) {
      errors.push(this.i18n.t('validation.required', { field: $tsl('年龄') }));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证邮箱格式
   */
  private validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        errors: [this.i18n.t('validation.email')]
      };
    }

    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * 生成用户ID
   */
  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 获取用户统计信息
   */
  getStatistics(): {
    total: number;
    averageAge: number;
    domains: Record<string, number>;
  } {
    const users = this.getAllUsers();
    const total = users.length;
    
    if (total === 0) {
      return {
        total: 0,
        averageAge: 0,
        domains: {}
      };
    }

    const averageAge = users.reduce((sum, user) => sum + user.age, 0) / total;
    
    const domains: Record<string, number> = {};
    users.forEach(user => {
      const domain = user.email.split('@')[1];
      domains[domain] = (domains[domain] || 0) + 1;
    });

    console.log($tsl('用户统计信息:'));
    console.log(`- ${$tsl('总用户数')}: ${total}`);
    console.log(`- ${$tsl('平均年龄')}: ${averageAge.toFixed(1)}`);
    console.log(`- ${$tsl('邮箱域名分布')}: ${JSON.stringify(domains, null, 2)}`);

    return {
      total,
      averageAge,
      domains
    };
  }
}
