/**
 * 用户管理模块
 * 演示在 JavaScript 模块中使用 TransLink I18n
 */

export function createUserManager(i18n) {
  const users = new Map();
  let currentUser = null;
  let nextId = 1;

  return {
    /**
     * 注册新用户
     */
    registerUser(userData) {
      const { name, email, password } = userData;
      
      // 验证输入
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // 检查邮箱是否已存在
      for (const user of users.values()) {
        if (user.email === email) {
          throw new Error(i18n.t('validation.email.exists', { email }));
        }
      }
      
      const user = {
        id: nextId++,
        name,
        email,
        password: this.hashPassword(password),
        createdAt: new Date(),
        lastLogin: null,
        isActive: true
      };
      
      users.set(user.id, user);
      
      console.log($tsl('用户注册成功: {{name}} ({{email}})'), { name, email });
      return user;
    },

    /**
     * 用户登录
     */
    login(email, password) {
      const user = Array.from(users.values()).find(u => u.email === email);
      
      if (!user) {
        return {
          success: false,
          error: i18n.t('user.error.notFound', { email })
        };
      }
      
      if (!user.isActive) {
        return {
          success: false,
          error: i18n.t('user.error.inactive')
        };
      }
      
      if (user.password !== this.hashPassword(password)) {
        return {
          success: false,
          error: i18n.t('user.error.invalidPassword')
        };
      }
      
      user.lastLogin = new Date();
      currentUser = user;
      
      return {
        success: true,
        user: { ...user, password: undefined }, // 不返回密码
        message: i18n.t('user.login.success', { name: user.name })
      };
    },

    /**
     * 用户登出
     */
    logout() {
      if (!currentUser) {
        return {
          success: false,
          error: i18n.t('user.error.notLoggedIn')
        };
      }
      
      const userName = currentUser.name;
      currentUser = null;
      
      return {
        success: true,
        message: i18n.t('user.logout.success', { name: userName })
      };
    },

    /**
     * 获取当前用户
     */
    getCurrentUser() {
      return currentUser ? { ...currentUser, password: undefined } : null;
    },

    /**
     * 更新用户资料
     */
    updateProfile(userId, updates) {
      const user = users.get(userId);
      if (!user) {
        throw new Error(i18n.t('user.error.notFound', { id: userId }));
      }
      
      // 验证更新数据
      const validation = this.validateUserData(updates, true);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // 更新用户信息
      Object.assign(user, updates, { updatedAt: new Date() });
      
      console.log($tsl('用户资料更新成功: {{name}}'), { name: user.name });
      return { ...user, password: undefined };
    },

    /**
     * 删除用户
     */
    deleteUser(userId) {
      const user = users.get(userId);
      if (!user) {
        throw new Error(i18n.t('user.error.notFound', { id: userId }));
      }
      
      users.delete(userId);
      
      if (currentUser && currentUser.id === userId) {
        currentUser = null;
      }
      
      console.log($tsl('用户已删除: {{name}}'), { name: user.name });
      return true;
    },

    /**
     * 列出所有用户
     */
    listUsers() {
      console.log('\n' + i18n.t('user.list.title'));
      console.log('-'.repeat(50));
      
      if (users.size === 0) {
        console.log(i18n.t('user.list.empty'));
        return;
      }
      
      for (const user of users.values()) {
        const status = user.isActive ? i18n.t('user.status.active') : i18n.t('user.status.inactive');
        const lastLogin = user.lastLogin 
          ? i18n.t('user.lastLogin', { date: user.lastLogin.toLocaleString() })
          : i18n.t('user.neverLoggedIn');
        
        console.log(`${user.id}. ${user.name} (${user.email})`);
        console.log(`   ${i18n.t('user.status')}: ${status}`);
        console.log(`   ${lastLogin}`);
        console.log('');
      }
    },

    /**
     * 搜索用户
     */
    searchUsers(query) {
      const results = Array.from(users.values()).filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      
      console.log(i18n.t('user.search.results', { query, count: results.length }));
      
      results.forEach(user => {
        console.log(`- ${user.name} (${user.email})`);
      });
      
      return results;
    },

    /**
     * 获取用户统计信息
     */
    getStatistics() {
      const total = users.size;
      const active = Array.from(users.values()).filter(u => u.isActive).length;
      const inactive = total - active;
      const loggedIn = Array.from(users.values()).filter(u => u.lastLogin).length;
      
      const stats = {
        total,
        active,
        inactive,
        loggedIn,
        neverLoggedIn: total - loggedIn
      };
      
      console.log('\n' + i18n.t('user.statistics.title'));
      console.log('-'.repeat(30));
      console.log(`${i18n.t('user.statistics.total')}: ${stats.total}`);
      console.log(`${i18n.t('user.statistics.active')}: ${stats.active}`);
      console.log(`${i18n.t('user.statistics.inactive')}: ${stats.inactive}`);
      console.log(`${i18n.t('user.statistics.loggedIn')}: ${stats.loggedIn}`);
      console.log(`${i18n.t('user.statistics.neverLoggedIn')}: ${stats.neverLoggedIn}`);
      
      return stats;
    },

    /**
     * 验证用户数据
     */
    validateUserData(data, isUpdate = false) {
      const errors = [];
      
      if (!isUpdate || data.name !== undefined) {
        if (!data.name || data.name.trim().length === 0) {
          errors.push(i18n.t('validation.required', { field: i18n.t('user.name') }));
        } else if (data.name.length < 2) {
          errors.push(i18n.t('validation.minLength', { field: i18n.t('user.name'), min: 2 }));
        } else if (data.name.length > 50) {
          errors.push(i18n.t('validation.maxLength', { field: i18n.t('user.name'), max: 50 }));
        }
      }
      
      if (!isUpdate || data.email !== undefined) {
        if (!data.email || data.email.trim().length === 0) {
          errors.push(i18n.t('validation.required', { field: i18n.t('user.email') }));
        } else if (!this.isValidEmail(data.email)) {
          errors.push(i18n.t('validation.email'));
        }
      }
      
      if (!isUpdate || data.password !== undefined) {
        if (!data.password || data.password.length === 0) {
          errors.push(i18n.t('validation.required', { field: i18n.t('user.password') }));
        } else if (data.password.length < 6) {
          errors.push(i18n.t('validation.minLength', { field: i18n.t('user.password'), min: 6 }));
        } else if (data.password.length > 100) {
          errors.push(i18n.t('validation.maxLength', { field: i18n.t('user.password'), max: 100 }));
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    },

    /**
     * 验证邮箱格式
     */
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    /**
     * 简单的密码哈希（实际项目中应使用更安全的方法）
     */
    hashPassword(password) {
      // 这里只是演示，实际项目中应使用 bcrypt 等安全的哈希算法
      return `hashed_${password}_${password.length}`;
    },

    /**
     * 重置所有数据
     */
    reset() {
      users.clear();
      currentUser = null;
      nextId = 1;
      console.log($tsl('用户管理器已重置'));
    }
  };
}
