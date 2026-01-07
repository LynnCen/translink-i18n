import { I18nEngine } from '@translink/i18n-runtime';
import { UserService } from './services/UserService';
import { MessageService } from './services/MessageService';
import { Logger } from './utils/Logger';

/**
 * TypeScript 示例：展示 TransLink I18n 在 TypeScript 项目中的使用
 */
class Application {
  private i18n: I18nEngine;
  private userService: UserService;
  private messageService: MessageService;
  private logger: Logger;

  constructor() {
    // 初始化 i18n 引擎
    this.i18n = new I18nEngine({
      defaultLanguage: 'zh-CN',
      supportedLanguages: ['zh-CN', 'en-US', 'ja-JP'],
      resources: {
        'zh-CN': {
          app: {
            title: '应用程序标题',
            welcome: '欢迎使用 TypeScript 示例',
            description:
              '这是一个展示 TransLink I18n 在 TypeScript 中使用的示例程序。',
          },
          user: {
            login: '用户登录',
            logout: '用户退出',
            profile: '用户资料',
            settings: '用户设置',
          },
          message: {
            success: '操作成功',
            error: '操作失败',
            warning: '警告信息',
            info: '提示信息',
          },
          validation: {
            required: '{{field}} 是必填项',
            email: '请输入有效的邮箱地址',
            minLength: '{{field}} 至少需要 {{min}} 个字符',
            maxLength: '{{field}} 不能超过 {{max}} 个字符',
          },
        },
        'en-US': {
          app: {
            title: 'Application Title',
            welcome: 'Welcome to TypeScript Demo',
            description:
              'This is a demo program showing how to use TransLink I18n in TypeScript.',
          },
          user: {
            login: 'User Login',
            logout: 'User Logout',
            profile: 'User Profile',
            settings: 'User Settings',
          },
          message: {
            success: 'Operation Successful',
            error: 'Operation Failed',
            warning: 'Warning Message',
            info: 'Information Message',
          },
          validation: {
            required: '{{field}} is required',
            email: 'Please enter a valid email address',
            minLength: '{{field}} must be at least {{min}} characters',
            maxLength: '{{field}} cannot exceed {{max}} characters',
          },
        },
      },
      cache: {
        enabled: true,
        maxSize: 1000,
        ttl: 5 * 60 * 1000,
        storage: 'memory',
      },
    });

    this.logger = new Logger(this.i18n);
    this.userService = new UserService(this.i18n);
    this.messageService = new MessageService(this.i18n);
  }

  /**
   * 初始化应用程序
   */
  async init(): Promise<void> {
    try {
      await this.i18n.init();
      this.logger.info($tsl('应用程序初始化成功'));

      // 设置事件监听器
      this.setupEventListeners();

      // 显示欢迎信息
      this.showWelcomeMessage();
    } catch (error) {
      this.logger.error($tsl('应用程序初始化失败'), error);
      throw error;
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.i18n.on('languageChanged', (language: string) => {
      this.logger.info($tsl('语言已切换到: {{language}}'), { language });
      this.showWelcomeMessage();
    });

    this.i18n.on('translationMissing', (key: string, language: string) => {
      this.logger.warn($tsl('缺失翻译: {{key}} ({{language}})'), {
        key,
        language,
      });
    });
  }

  /**
   * 显示欢迎信息
   */
  private showWelcomeMessage(): void {
    console.log('\n' + '='.repeat(50));
    console.log(this.i18n.t('app.title'));
    console.log('='.repeat(50));
    console.log(this.i18n.t('app.welcome'));
    console.log(this.i18n.t('app.description'));
    console.log('='.repeat(50) + '\n');
  }

  /**
   * 演示用户服务功能
   */
  async demoUserService(): Promise<void> {
    console.log('\n--- ' + $tsl('用户服务演示') + ' ---');

    // 创建用户
    const user = await this.userService.createUser({
      name: '张三',
      email: 'zhangsan@example.com',
      age: 25,
    });

    console.log($tsl('用户创建成功:'), user);

    // 验证用户数据
    const validationResult = this.userService.validateUser(user);
    if (validationResult.isValid) {
      console.log($tsl('用户数据验证通过'));
    } else {
      console.log($tsl('用户数据验证失败:'), validationResult.errors);
    }

    // 更新用户
    const updatedUser = await this.userService.updateUser(user.id, {
      name: '李四',
    });
    console.log($tsl('用户更新成功:'), updatedUser);
  }

  /**
   * 演示消息服务功能
   */
  demoMessageService(): void {
    console.log('\n--- ' + $tsl('消息服务演示') + ' ---');

    this.messageService.showSuccess($tsl('这是一条成功消息'));
    this.messageService.showError($tsl('这是一条错误消息'));
    this.messageService.showWarning($tsl('这是一条警告消息'));
    this.messageService.showInfo($tsl('这是一条信息消息'));
  }

  /**
   * 演示语言切换功能
   */
  async demoLanguageSwitching(): Promise<void> {
    console.log('\n--- ' + $tsl('语言切换演示') + ' ---');

    const languages = this.i18n.getSupportedLanguages();

    for (const lang of languages) {
      await this.i18n.changeLanguage(lang);
      console.log(`\n[${lang}] ${this.i18n.t('app.welcome')}`);

      // 演示插值功能
      const greeting = this.i18n.t('validation.required', {
        field: 'Username',
      });
      console.log(`[${lang}] ${greeting}`);
    }

    // 切换回中文
    await this.i18n.changeLanguage('zh-CN');
  }

  /**
   * 演示缓存功能
   */
  demoCaching(): void {
    console.log('\n--- ' + $tsl('缓存功能演示') + ' ---');

    // 执行一些翻译操作
    const keys = [
      'app.title',
      'user.login',
      'message.success',
      'validation.required',
    ];

    console.log($tsl('执行翻译操作...'));
    keys.forEach(key => {
      this.i18n.t(key, { field: 'test', min: 3, max: 20 });
    });

    // 显示缓存统计
    const stats = this.i18n.getCacheStats();
    console.log($tsl('缓存统计:'));
    console.log(`- ${$tsl('缓存大小')}: ${stats.size}`);
    console.log(`- ${$tsl('命中次数')}: ${stats.hits}`);
    console.log(`- ${$tsl('未命中次数')}: ${stats.misses}`);
    console.log(`- ${$tsl('命中率')}: ${(stats.hitRate * 100).toFixed(2)}%`);
  }

  /**
   * 运行完整演示
   */
  async run(): Promise<void> {
    try {
      await this.init();
      await this.demoUserService();
      this.demoMessageService();
      await this.demoLanguageSwitching();
      this.demoCaching();

      console.log('\n' + $tsl('演示完成！'));
    } catch (error) {
      this.logger.error($tsl('演示运行失败'), error);
    }
  }
}

// 运行应用程序
const app = new Application();
app.run().catch(console.error);
