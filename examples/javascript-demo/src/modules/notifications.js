/**
 * 通知系统模块
 * 演示在 JavaScript 模块中使用 TransLink I18n 进行通知管理
 */

export function createNotificationSystem(i18n) {
  const notifications = [];
  let nextId = 1;

  // 通知类型配置
  const notificationTypes = {
    success: {
      icon: '✅',
      color: '\x1b[32m', // 绿色
      priority: 1
    },
    error: {
      icon: '❌',
      color: '\x1b[31m', // 红色
      priority: 4
    },
    warning: {
      icon: '⚠️',
      color: '\x1b[33m', // 黄色
      priority: 3
    },
    info: {
      icon: 'ℹ️',
      color: '\x1b[36m', // 青色
      priority: 2
    }
  };

  const resetColor = '\x1b[0m';

  return {
    /**
     * 发送成功通知
     */
    success(message, options = {}) {
      return this.notify('success', message, options);
    },

    /**
     * 发送错误通知
     */
    error(message, options = {}) {
      return this.notify('error', message, options);
    },

    /**
     * 发送警告通知
     */
    warning(message, options = {}) {
      return this.notify('warning', message, options);
    },

    /**
     * 发送信息通知
     */
    info(message, options = {}) {
      return this.notify('info', message, options);
    },

    /**
     * 发送通知的核心方法
     */
    notify(type, message, options = {}) {
      const notification = {
        id: nextId++,
        type,
        message,
        timestamp: new Date(),
        read: false,
        persistent: options.persistent || false,
        duration: options.duration || (type === 'error' ? 10000 : 5000),
        category: options.category || 'general',
        metadata: options.metadata || {}
      };

      notifications.push(notification);

      // 显示通知
      this.displayNotification(notification);

      // 如果不是持久化通知，设置自动清除
      if (!notification.persistent) {
        setTimeout(() => {
          this.removeNotification(notification.id);
        }, notification.duration);
      }

      return notification;
    },

    /**
     * 显示通知
     */
    displayNotification(notification) {
      const config = notificationTypes[notification.type];
      const timestamp = notification.timestamp.toLocaleTimeString();
      
      console.log(
        `${config.color}${config.icon} [${timestamp}] ${notification.message}${resetColor}`
      );

      // 如果有元数据，显示额外信息
      if (Object.keys(notification.metadata).length > 0) {
        console.log(`   ${$tsl('详细信息')}: ${JSON.stringify(notification.metadata)}`);
      }
    },

    /**
     * 移除通知
     */
    removeNotification(id) {
      const index = notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications.splice(index, 1);
      }
    },

    /**
     * 标记通知为已读
     */
    markAsRead(id) {
      const notification = notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        console.log($tsl('通知已标记为已读: {{id}}'), { id });
      }
    },

    /**
     * 标记所有通知为已读
     */
    markAllAsRead() {
      const unreadCount = notifications.filter(n => !n.read).length;
      notifications.forEach(n => n.read = true);
      console.log($tsl('已将 {{count}} 条通知标记为已读'), { count: unreadCount });
    },

    /**
     * 清除所有通知
     */
    clearAll() {
      const count = notifications.length;
      notifications.length = 0;
      console.log($tsl('已清除 {{count}} 条通知'), { count });
    },

    /**
     * 清除已读通知
     */
    clearRead() {
      const readNotifications = notifications.filter(n => n.read);
      const count = readNotifications.length;
      
      for (let i = notifications.length - 1; i >= 0; i--) {
        if (notifications[i].read) {
          notifications.splice(i, 1);
        }
      }
      
      console.log($tsl('已清除 {{count}} 条已读通知'), { count });
    },

    /**
     * 获取通知列表
     */
    getNotifications(filter = {}) {
      let result = [...notifications];

      // 按类型过滤
      if (filter.type) {
        result = result.filter(n => n.type === filter.type);
      }

      // 按已读状态过滤
      if (filter.read !== undefined) {
        result = result.filter(n => n.read === filter.read);
      }

      // 按分类过滤
      if (filter.category) {
        result = result.filter(n => n.category === filter.category);
      }

      // 按时间范围过滤
      if (filter.since) {
        result = result.filter(n => n.timestamp >= filter.since);
      }

      // 排序
      result.sort((a, b) => {
        if (filter.sortBy === 'priority') {
          const aPriority = notificationTypes[a.type].priority;
          const bPriority = notificationTypes[b.type].priority;
          return bPriority - aPriority;
        }
        return b.timestamp - a.timestamp; // 默认按时间倒序
      });

      return result;
    },

    /**
     * 显示通知历史
     */
    showHistory(filter = {}) {
      const filteredNotifications = this.getNotifications(filter);
      
      console.log('\n' + i18n.t('notification.history.title'));
      console.log('='.repeat(60));
      
      if (filteredNotifications.length === 0) {
        console.log(i18n.t('notification.history.empty'));
        return;
      }

      filteredNotifications.forEach((notification, index) => {
        const config = notificationTypes[notification.type];
        const timestamp = notification.timestamp.toLocaleString();
        const readStatus = notification.read ? 
          i18n.t('notification.status.read') : 
          i18n.t('notification.status.unread');
        
        console.log(`${index + 1}. ${config.icon} [${timestamp}] ${notification.message}`);
        console.log(`   ${i18n.t('notification.type')}: ${i18n.t(`notification.type.${notification.type}`)}`);
        console.log(`   ${i18n.t('notification.status')}: ${readStatus}`);
        console.log(`   ${i18n.t('notification.category')}: ${notification.category}`);
        
        if (notification.persistent) {
          console.log(`   ${i18n.t('notification.persistent')}: ${i18n.t('common.yes')}`);
        }
        
        console.log('');
      });
    },

    /**
     * 获取通知统计信息
     */
    getStatistics() {
      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        byType: {},
        byCategory: {},
        recent: notifications.filter(n => 
          Date.now() - n.timestamp.getTime() < 24 * 60 * 60 * 1000
        ).length
      };

      // 按类型统计
      Object.keys(notificationTypes).forEach(type => {
        stats.byType[type] = notifications.filter(n => n.type === type).length;
      });

      // 按分类统计
      const categories = [...new Set(notifications.map(n => n.category))];
      categories.forEach(category => {
        stats.byCategory[category] = notifications.filter(n => n.category === category).length;
      });

      return stats;
    },

    /**
     * 显示通知统计
     */
    showStatistics() {
      const stats = this.getStatistics();
      
      console.log('\n' + i18n.t('notification.statistics.title'));
      console.log('-'.repeat(40));
      console.log(`${i18n.t('notification.statistics.total')}: ${stats.total}`);
      console.log(`${i18n.t('notification.statistics.unread')}: ${stats.unread}`);
      console.log(`${i18n.t('notification.statistics.recent')}: ${stats.recent}`);
      
      console.log('\n' + i18n.t('notification.statistics.byType') + ':');
      Object.entries(stats.byType).forEach(([type, count]) => {
        const config = notificationTypes[type];
        console.log(`  ${config.icon} ${i18n.t(`notification.type.${type}`)}: ${count}`);
      });
      
      if (Object.keys(stats.byCategory).length > 0) {
        console.log('\n' + i18n.t('notification.statistics.byCategory') + ':');
        Object.entries(stats.byCategory).forEach(([category, count]) => {
          console.log(`  📁 ${category}: ${count}`);
        });
      }
    },

    /**
     * 批量发送通知
     */
    batch(notifications) {
      const results = [];
      
      notifications.forEach(({ type, message, options }) => {
        const result = this.notify(type, message, options);
        results.push(result);
      });
      
      console.log($tsl('批量发送了 {{count}} 条通知'), { count: results.length });
      return results;
    },

    /**
     * 创建通知模板
     */
    createTemplate(name, template) {
      if (!this.templates) {
        this.templates = new Map();
      }
      
      this.templates.set(name, template);
      console.log($tsl('通知模板已创建: {{name}}'), { name });
    },

    /**
     * 使用模板发送通知
     */
    notifyFromTemplate(templateName, data = {}) {
      if (!this.templates || !this.templates.has(templateName)) {
        throw new Error($tsl('通知模板不存在: {{name}}'), { name: templateName });
      }
      
      const template = this.templates.get(templateName);
      const message = this.interpolateTemplate(template.message, data);
      
      return this.notify(template.type, message, {
        ...template.options,
        metadata: { ...template.options?.metadata, templateName, data }
      });
    },

    /**
     * 模板插值
     */
    interpolateTemplate(template, data) {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
      });
    },

    /**
     * 设置通知过滤器
     */
    setFilter(filterFn) {
      this.filter = filterFn;
    },

    /**
     * 重置通知系统
     */
    reset() {
      notifications.length = 0;
      nextId = 1;
      if (this.templates) {
        this.templates.clear();
      }
      console.log($tsl('通知系统已重置'));
    }
  };
}
