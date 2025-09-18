import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  private static instance: Logger;
  private spinner: Ora | null = null;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🐛'), message);
    }
  }

  startSpinner(message: string): void {
    this.spinner = ora({
      text: message,
      color: 'blue',
    }).start();
  }

  stopSpinner(message?: string, success = true): void {
    if (this.spinner) {
      if (success) {
        this.spinner.succeed(message);
      } else {
        this.spinner.fail(message);
      }
      this.spinner = null;
    }
  }

  updateSpinner(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  br(): void {
    console.log();
  }

  title(message: string): void {
    console.log();
    console.log(chalk.bold.cyan('🔗 TransLink I18n'));
    console.log(chalk.gray(message));
    console.log();
  }
}

export const logger = Logger.getInstance();
