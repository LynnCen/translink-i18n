import pc from 'picocolors';

/**
 * 日志级别
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * 日志配置
 */
interface LoggerConfig {
  level: LogLevel;
  prefix: string;
  colors: boolean;
}

/**
 * 简单的日志工具
 */
class Logger {
  private config: LoggerConfig = {
    level: 'info',
    prefix: '[TransLink I18n]',
    colors: true
  };

  private levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * 设置前缀
   */
  setPrefix(prefix: string): void {
    this.config.prefix = prefix;
  }

  /**
   * 启用/禁用颜色
   */
  setColors(enabled: boolean): void {
    this.config.colors = enabled;
  }

  /**
   * 检查是否应该输出日志
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.config.level];
  }

  /**
   * 格式化消息
   */
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toLocaleTimeString();
    let formattedMessage = `${this.config.prefix} ${message}`;

    if (this.config.colors) {
      const prefix = this.colorizePrefix(level);
      formattedMessage = `${prefix} ${message}`;
    }

    if (data !== undefined) {
      if (typeof data === 'object') {
        formattedMessage += '\n' + JSON.stringify(data, null, 2);
      } else {
        formattedMessage += ` ${data}`;
      }
    }

    return formattedMessage;
  }

  /**
   * 给前缀添加颜色
   */
  private colorizePrefix(level: LogLevel): string {
    const prefix = this.config.prefix;
    
    switch (level) {
      case 'error':
        return pc.red(pc.bold(prefix));
      case 'warn':
        return pc.yellow(pc.bold(prefix));
      case 'info':
        return pc.blue(pc.bold(prefix));
      case 'debug':
        return pc.gray(pc.bold(prefix));
      default:
        return prefix;
    }
  }

  /**
   * 错误日志
   */
  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  /**
   * 警告日志
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  /**
   * 信息日志
   */
  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  /**
   * 调试日志
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  /**
   * 成功日志（特殊的 info）
   */
  success(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      const formattedMessage = this.config.colors 
        ? `${pc.green(pc.bold(this.config.prefix))} ${message}`
        : `${this.config.prefix} ${message}`;
      
      console.log(data !== undefined ? `${formattedMessage}\n${JSON.stringify(data, null, 2)}` : formattedMessage);
    }
  }

  /**
   * 创建子日志器
   */
  child(prefix: string): Logger {
    const childLogger = new Logger();
    childLogger.config = {
      ...this.config,
      prefix: `${this.config.prefix}:${prefix}`
    };
    return childLogger;
  }

  /**
   * 创建性能计时器
   */
  time(label: string): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      this.debug(`${label} took ${duration}ms`);
    };
  }

  /**
   * 创建进度日志器
   */
  progress(total: number, label: string = 'Progress'): (current: number) => void {
    let lastPercent = -1;
    
    return (current: number) => {
      const percent = Math.floor((current / total) * 100);
      
      if (percent !== lastPercent && percent % 10 === 0) {
        this.info(`${label}: ${percent}% (${current}/${total})`);
        lastPercent = percent;
      }
    };
  }

  /**
   * 分组日志
   */
  group(label: string, fn: () => void | Promise<void>): void | Promise<void> {
    this.info(`${label}:`);
    console.group();
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.finally(() => {
          console.groupEnd();
        });
      } else {
        console.groupEnd();
        return result;
      }
    } catch (error) {
      console.groupEnd();
      throw error;
    }
  }
}

// 创建默认日志器实例
export const logger = new Logger();

// 根据环境设置默认日志级别
if (process.env.NODE_ENV === 'development') {
  logger.setLevel('debug');
} else if (process.env.NODE_ENV === 'test') {
  logger.setLevel('warn');
} else {
  logger.setLevel('info');
}

export default logger;
