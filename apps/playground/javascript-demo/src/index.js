import { I18nEngine } from '@translink/i18n-runtime';
import { createUserManager } from './modules/userManager.js';
import { createNotificationSystem } from './modules/notifications.js';
import { createTaskManager } from './modules/taskManager.js';

/**
 * JavaScript 示例：展示 TransLink I18n 在纯 JavaScript 项目中的使用
 */
class TodoApp {
  constructor() {
    // 初始化 i18n 引擎
    this.i18n = new I18nEngine({
      defaultLanguage: 'zh-CN',
      supportedLanguages: ['zh-CN', 'en-US', 'ja-JP'],
      resources: {
        'zh-CN': {
          app: {
            title: '待办事项管理器',
            subtitle: '使用 TransLink I18n 的 JavaScript 示例',
            version: '版本 1.0.0',
          },
          menu: {
            tasks: '任务管理',
            users: '用户管理',
            settings: '设置',
            help: '帮助',
            about: '关于',
          },
          task: {
            add: '添加任务',
            edit: '编辑任务',
            delete: '删除任务',
            complete: '完成任务',
            pending: '待完成',
            completed: '已完成',
            title: '任务标题',
            description: '任务描述',
            priority: '优先级',
            dueDate: '截止日期',
          },
          user: {
            login: '登录',
            logout: '退出',
            register: '注册',
            profile: '个人资料',
            name: '姓名',
            email: '邮箱',
            password: '密码',
          },
          message: {
            success: '操作成功！',
            error: '操作失败！',
            warning: '警告信息',
            info: '提示信息',
            confirm: '确认操作',
            cancel: '取消操作',
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
            title: 'Todo Manager',
            subtitle: 'JavaScript Example using TransLink I18n',
            version: 'Version 1.0.0',
          },
          menu: {
            tasks: 'Task Management',
            users: 'User Management',
            settings: 'Settings',
            help: 'Help',
            about: 'About',
          },
          task: {
            add: 'Add Task',
            edit: 'Edit Task',
            delete: 'Delete Task',
            complete: 'Complete Task',
            pending: 'Pending',
            completed: 'Completed',
            title: 'Task Title',
            description: 'Task Description',
            priority: 'Priority',
            dueDate: 'Due Date',
          },
          user: {
            login: 'Login',
            logout: 'Logout',
            register: 'Register',
            profile: 'Profile',
            name: 'Name',
            email: 'Email',
            password: 'Password',
          },
          message: {
            success: 'Operation Successful!',
            error: 'Operation Failed!',
            warning: 'Warning Message',
            info: 'Information Message',
            confirm: 'Confirm Operation',
            cancel: 'Cancel Operation',
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
        maxSize: 500,
        ttl: 10 * 60 * 1000, // 10分钟
        storage: 'memory',
      },
    });

    // 初始化模块
    this.userManager = null;
    this.notifications = null;
    this.taskManager = null;
  }

  /**
   * 初始化应用
   */
  async init() {
    try {
      console.log($tsl('正在初始化应用...'));

      // 初始化 i18n
      await this.i18n.init();

      // 设置事件监听
      this.setupEventListeners();

      // 初始化模块
      this.userManager = createUserManager(this.i18n);
      this.notifications = createNotificationSystem(this.i18n);
      this.taskManager = createTaskManager(this.i18n);

      console.log($tsl('应用初始化完成！'));

      // 显示欢迎信息
      this.showWelcome();
    } catch (error) {
      console.error($tsl('应用初始化失败:'), error);
      throw error;
    }
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    this.i18n.on('languageChanged', language => {
      console.log($tsl('语言已切换到: {{language}}'), { language });
      this.showWelcome();
    });

    this.i18n.on('translationMissing', (key, language) => {
      console.warn($tsl('缺失翻译: {{key}} ({{language}})'), { key, language });
    });

    this.i18n.on('error', error => {
      console.error($tsl('i18n 错误:'), error);
    });
  }

  /**
   * 显示欢迎信息
   */
  showWelcome() {
    console.log('\n' + '='.repeat(60));
    console.log(`🎉 ${this.i18n.t('app.title')}`);
    console.log(`📝 ${this.i18n.t('app.subtitle')}`);
    console.log(`🔖 ${this.i18n.t('app.version')}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * 显示主菜单
   */
  showMainMenu() {
    console.log($tsl('主菜单:'));
    console.log(`1. ${this.i18n.t('menu.tasks')}`);
    console.log(`2. ${this.i18n.t('menu.users')}`);
    console.log(`3. ${this.i18n.t('menu.settings')}`);
    console.log(`4. ${this.i18n.t('menu.help')}`);
    console.log(`5. ${this.i18n.t('menu.about')}`);
    console.log(`0. ${$tsl('退出')}`);
  }

  /**
   * 演示任务管理功能
   */
  async demoTaskManagement() {
    console.log('\n--- ' + $tsl('任务管理演示') + ' ---');

    // 创建任务
    const task1 = this.taskManager.createTask({
      title: $tsl('完成项目文档'),
      description: $tsl('编写 TransLink I18n 的使用文档'),
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
    });

    const task2 = this.taskManager.createTask({
      title: $tsl('代码审查'),
      description: $tsl('审查新功能的代码实现'),
      priority: 'medium',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3天后
    });

    console.log($tsl('已创建 {{count}} 个任务'), { count: 2 });

    // 显示任务列表
    this.taskManager.listTasks();

    // 完成一个任务
    this.taskManager.completeTask(task1.id);

    // 显示统计信息
    this.taskManager.showStatistics();
  }

  /**
   * 演示用户管理功能
   */
  async demoUserManagement() {
    console.log('\n--- ' + $tsl('用户管理演示') + ' ---');

    // 注册用户
    const user1 = this.userManager.registerUser({
      name: '张三',
      email: 'zhangsan@example.com',
      password: 'password123',
    });

    const user2 = this.userManager.registerUser({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securepass',
    });

    console.log($tsl('已注册 {{count}} 个用户'), { count: 2 });

    // 用户登录
    const loginResult = this.userManager.login(
      'zhangsan@example.com',
      'password123'
    );
    if (loginResult.success) {
      console.log($tsl('用户 {{name}} 登录成功'), {
        name: loginResult.user.name,
      });
    }

    // 显示用户列表
    this.userManager.listUsers();
  }

  /**
   * 演示通知系统
   */
  demoNotifications() {
    console.log('\n--- ' + $tsl('通知系统演示') + ' ---');

    this.notifications.success($tsl('任务创建成功！'));
    this.notifications.error($tsl('网络连接失败！'));
    this.notifications.warning($tsl('磁盘空间不足！'));
    this.notifications.info($tsl('系统将在5分钟后维护！'));

    // 显示通知历史
    this.notifications.showHistory();
  }

  /**
   * 演示语言切换
   */
  async demoLanguageSwitching() {
    console.log('\n--- ' + $tsl('语言切换演示') + ' ---');

    const languages = this.i18n.getSupportedLanguages();

    for (const lang of languages) {
      await this.i18n.changeLanguage(lang);

      console.log(`\n[${lang}]`);
      console.log(`${this.i18n.t('app.title')}`);
      console.log(
        `${this.i18n.t('task.add')} | ${this.i18n.t('user.login')} | ${this.i18n.t('message.success')}`
      );

      // 演示插值
      const validation = this.i18n.t('validation.required', {
        field: this.i18n.t('user.name'),
      });
      console.log(`${validation}`);
    }

    // 切换回中文
    await this.i18n.changeLanguage('zh-CN');
  }

  /**
   * 演示缓存和性能
   */
  demoPerformance() {
    console.log('\n--- ' + $tsl('性能和缓存演示') + ' ---');

    const keys = [
      'app.title',
      'menu.tasks',
      'task.add',
      'user.login',
      'message.success',
      'validation.required',
    ];

    // 执行大量翻译操作
    console.log($tsl('执行 1000 次翻译操作...'));
    const startTime = Date.now();

    for (let i = 0; i < 1000; i++) {
      const key = keys[i % keys.length];
      this.i18n.t(key, { field: 'test', min: 3, max: 20 });
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log($tsl('操作完成，耗时: {{duration}}ms'), { duration });

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
  async run() {
    try {
      await this.init();

      // 运行各种演示
      await this.demoTaskManagement();
      await this.demoUserManagement();
      this.demoNotifications();
      await this.demoLanguageSwitching();
      this.demoPerformance();

      console.log('\n🎉 ' + $tsl('所有演示完成！'));
      console.log($tsl('感谢使用 TransLink I18n JavaScript 示例！'));
    } catch (error) {
      console.error($tsl('演示运行失败:'), error);
    }
  }
}

// 运行应用
const app = new TodoApp();
app.run().catch(console.error);
