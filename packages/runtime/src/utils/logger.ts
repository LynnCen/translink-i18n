/**
 * Logger 模块
 * 提供统一的日志记录接口
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogMessage {
  level: LogLevel;
  message: string;
  args: any[];
  timestamp: number;
}

export interface LogHandler {
  (message: LogMessage): void;
}

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  handlers?: LogHandler[];
  enabled?: boolean;
}

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private handlers: LogHandler[];
  private enabled: boolean;
  private levelPriority: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || 'warn';
    this.prefix = options.prefix || '[TransLink I18n]';
    this.handlers = options.handlers || [this.defaultHandler];
    this.enabled = options.enabled ?? true;
  }

  /**
   * 记录错误日志
   */
  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  /**
   * 记录警告日志
   */
  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  /**
   * 记录信息日志
   */
  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  /**
   * 记录调试日志
   */
  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  /**
   * 通用日志方法
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.enabled) {
      return;
    }

    if (!this.shouldLog(level)) {
      return;
    }

    const logMessage: LogMessage = {
      level,
      message,
      args,
      timestamp: Date.now(),
    };

    // 调用所有处理器
    this.handlers.forEach(handler => {
      try {
        handler(logMessage);
      } catch (error) {
        // 处理器错误不应该影响主流程
        console.error('Logger handler error:', error);
      }
    });
  }

  /**
   * 检查是否应该记录该级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    const currentPriority = this.levelPriority[this.level];
    const messagePriority = this.levelPriority[level];
    return messagePriority <= currentPriority;
  }

  /**
   * 默认日志处理器（输出到控制台）
   */
  private defaultHandler = (message: LogMessage): void => {
    const { level, message: msg, args } = message;
    const formattedMessage = `${this.prefix} ${msg}`;

    switch (level) {
      case 'error':
        console.error(formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(formattedMessage, ...args);
        break;
      case 'info':
        console.log(formattedMessage, ...args);
        break;
      case 'debug':
        console.debug(formattedMessage, ...args);
        break;
    }
  };

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * 添加日志处理器
   */
  addHandler(handler: LogHandler): void {
    this.handlers.push(handler);
  }

  /**
   * 移除日志处理器
   */
  removeHandler(handler: LogHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  /**
   * 清除所有处理器
   */
  clearHandlers(): void {
    this.handlers = [];
  }

  /**
   * 启用日志
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * 禁用日志
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 创建子 Logger
   */
  createChild(prefix: string, options?: Partial<LoggerOptions>): Logger {
    return new Logger({
      level: this.level,
      prefix: `${this.prefix} ${prefix}`,
      handlers: [...this.handlers],
      enabled: this.enabled,
      ...options,
    });
  }
}

/**
 * 创建自定义日志处理器
 */
export function createLogHandler(
  callback: (level: LogLevel, message: string, args: any[]) => void
): LogHandler {
  return (logMessage: LogMessage) => {
    callback(logMessage.level, logMessage.message, logMessage.args);
  };
}

/**
 * 创建文件日志处理器（仅 Node.js 环境）
 */
export function createFileHandler(filePath: string): LogHandler {
  // 注意：这需要在 Node.js 环境中使用
  return (logMessage: LogMessage) => {
    if (typeof require === 'undefined') {
      console.warn('File handler is only available in Node.js environment');
      return;
    }

    try {
      const fs = require('fs');
      const timestamp = new Date(logMessage.timestamp).toISOString();
      const line = `[${timestamp}] [${logMessage.level.toUpperCase()}] ${logMessage.message} ${JSON.stringify(logMessage.args)}\n`;
      fs.appendFileSync(filePath, line, 'utf-8');
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  };
}

/**
 * 创建内存日志处理器
 * 将日志存储在内存中，用于测试或调试
 */
export function createMemoryHandler(maxSize = 1000): {
  handler: LogHandler;
  getLogs: () => LogMessage[];
  clear: () => void;
} {
  const logs: LogMessage[] = [];

  return {
    handler: (logMessage: LogMessage) => {
      logs.push(logMessage);
      
      // 限制大小
      if (logs.length > maxSize) {
        logs.shift();
      }
    },
    getLogs: () => [...logs],
    clear: () => {
      logs.length = 0;
    },
  };
}

// 默认全局 Logger 实例
let defaultLogger: Logger | null = null;

/**
 * 获取默认 Logger 实例
 */
export function getDefaultLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = new Logger({
      level: 'warn',
      prefix: '[TransLink I18n]',
    });
  }
  return defaultLogger;
}

/**
 * 设置默认 Logger 实例
 */
export function setDefaultLogger(logger: Logger): void {
  defaultLogger = logger;
}
