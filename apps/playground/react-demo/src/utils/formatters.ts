/**
 * 格式化工具函数示例
 *
 * ✅ 最佳实践：在纯函数中使用全局 t 函数
 *
 * 这些函数不是 React 组件，无法使用 Hooks，
 * 但可以使用从 i18n.ts 导出的全局 t 函数
 */

import { t } from '../i18n';

/**
 * 格式化价格
 *
 * ✅ 纯函数中使用翻译
 */
export function formatPrice(price: number): string {
  return `${price} ${t('currency')}`;
}

/**
 * 格式化日期
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 获取问候语
 *
 * ✅ 在条件判断中使用翻译
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 6) {
    return t('greetingLateNight'); // ✅ 使用全局 t
  } else if (hour < 12) {
    return t('greetingMorning');
  } else if (hour < 18) {
    return t('greetingAfternoon');
  } else {
    return t('greetingEvening');
  }
}

/**
 * 验证错误消息
 *
 * ✅ 在类方法中使用翻译
 */
export class Validator {
  static validateEmail(email: string): { valid: boolean; message: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      return {
        valid: false,
        message: t('validationEmailRequired'), // ✅ 使用全局 t
      };
    }

    if (!emailRegex.test(email)) {
      return {
        valid: false,
        message: t('validationEmailInvalid'),
      };
    }

    return {
      valid: true,
      message: t('validationEmailValid'),
    };
  }

  static validatePassword(password: string): { valid: boolean; message: string } {
    if (!password) {
      return {
        valid: false,
        message: t('validationPasswordRequired'),
      };
    }

    if (password.length < 8) {
      return {
        valid: false,
        message: t('validationPasswordTooShort'),
      };
    }

    return {
      valid: true,
      message: t('validationPasswordValid'),
    };
  }
}

/**
 * 异步函数中使用翻译
 *
 * ✅ 在异步函数中使用翻译
 */
export async function fetchUserData(userId: string): Promise<any> {
  try {
    const response = await fetch(`https://api.example.com/users/${userId}`);

    if (!response.ok) {
      throw new Error(t('errorNetworkFailed')); // ✅ 使用全局 t
    }

    return await response.json();
  } catch (error) {
    console.error(t('errorFetchingUser'), error);
    throw error;
  }
}

/**
 * 事件处理器中使用翻译
 */
export function handleError(error: Error): void {
  console.error(t('errorOccurred'), error.message);

  // 显示用户友好的错误消息
  alert(t('errorGenericMessage'));
}
