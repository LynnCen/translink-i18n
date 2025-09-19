/**
 * 任务管理模块
 * 演示在 JavaScript 模块中使用 TransLink I18n 进行任务管理
 */

export function createTaskManager(i18n) {
  const tasks = new Map();
  let nextId = 1;

  // 任务优先级配置
  const priorities = {
    low: { value: 1, color: '\x1b[32m', icon: '🟢' },
    medium: { value: 2, color: '\x1b[33m', icon: '🟡' },
    high: { value: 3, color: '\x1b[31m', icon: '🔴' },
    urgent: { value: 4, color: '\x1b[35m', icon: '🟣' }
  };

  const resetColor = '\x1b[0m';

  return {
    /**
     * 创建新任务
     */
    createTask(taskData) {
      const { title, description, priority = 'medium', dueDate, category = 'general' } = taskData;
      
      // 验证输入
      const validation = this.validateTaskData(taskData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const task = {
        id: nextId++,
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        category,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        tags: taskData.tags || [],
        assignee: taskData.assignee || null,
        estimatedHours: taskData.estimatedHours || null,
        actualHours: null,
        subtasks: [],
        comments: []
      };

      tasks.set(task.id, task);
      
      console.log($tsl('任务创建成功: {{title}}'), { title });
      return task;
    },

    /**
     * 更新任务
     */
    updateTask(taskId, updates) {
      const task = tasks.get(taskId);
      if (!task) {
        throw new Error(i18n.t('task.error.notFound', { id: taskId }));
      }

      // 验证更新数据
      const validation = this.validateTaskData(updates, true);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // 更新任务
      Object.assign(task, updates, { updatedAt: new Date() });
      
      console.log($tsl('任务更新成功: {{title}}'), { title: task.title });
      return task;
    },

    /**
     * 完成任务
     */
    completeTask(taskId) {
      const task = tasks.get(taskId);
      if (!task) {
        throw new Error(i18n.t('task.error.notFound', { id: taskId }));
      }

      if (task.status === 'completed') {
        console.log($tsl('任务已经完成: {{title}}'), { title: task.title });
        return task;
      }

      task.status = 'completed';
      task.completedAt = new Date();
      task.updatedAt = new Date();

      console.log($tsl('任务已完成: {{title}}'), { title: task.title });
      return task;
    },

    /**
     * 删除任务
     */
    deleteTask(taskId) {
      const task = tasks.get(taskId);
      if (!task) {
        throw new Error(i18n.t('task.error.notFound', { id: taskId }));
      }

      tasks.delete(taskId);
      console.log($tsl('任务已删除: {{title}}'), { title: task.title });
      return true;
    },

    /**
     * 获取任务
     */
    getTask(taskId) {
      return tasks.get(taskId) || null;
    },

    /**
     * 列出任务
     */
    listTasks(filter = {}) {
      const filteredTasks = this.filterTasks(filter);
      
      console.log('\n' + i18n.t('task.list.title'));
      console.log('='.repeat(80));
      
      if (filteredTasks.length === 0) {
        console.log(i18n.t('task.list.empty'));
        return;
      }

      // 按优先级和状态排序
      filteredTasks.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'pending' ? -1 : 1;
        }
        return priorities[b.priority].value - priorities[a.priority].value;
      });

      filteredTasks.forEach(task => {
        this.displayTask(task);
      });
    },

    /**
     * 显示单个任务
     */
    displayTask(task) {
      const priorityConfig = priorities[task.priority];
      const statusText = i18n.t(`task.status.${task.status}`);
      const dueDateText = task.dueDate ? 
        i18n.t('task.dueDate.value', { date: task.dueDate.toLocaleDateString() }) :
        i18n.t('task.dueDate.none');

      console.log(`${priorityConfig.color}${priorityConfig.icon} [${task.id}] ${task.title}${resetColor}`);
      console.log(`   ${i18n.t('task.status')}: ${statusText}`);
      console.log(`   ${i18n.t('task.priority')}: ${i18n.t(`task.priority.${task.priority}`)}`);
      console.log(`   ${i18n.t('task.category')}: ${task.category}`);
      console.log(`   ${dueDateText}`);
      
      if (task.description) {
        console.log(`   ${i18n.t('task.description')}: ${task.description}`);
      }
      
      if (task.assignee) {
        console.log(`   ${i18n.t('task.assignee')}: ${task.assignee}`);
      }
      
      if (task.tags.length > 0) {
        console.log(`   ${i18n.t('task.tags')}: ${task.tags.join(', ')}`);
      }
      
      if (task.estimatedHours) {
        console.log(`   ${i18n.t('task.estimatedHours')}: ${task.estimatedHours}h`);
      }
      
      if (task.actualHours) {
        console.log(`   ${i18n.t('task.actualHours')}: ${task.actualHours}h`);
      }
      
      console.log(`   ${i18n.t('task.createdAt')}: ${task.createdAt.toLocaleString()}`);
      
      if (task.completedAt) {
        console.log(`   ${i18n.t('task.completedAt')}: ${task.completedAt.toLocaleString()}`);
      }
      
      console.log('');
    },

    /**
     * 过滤任务
     */
    filterTasks(filter) {
      let result = Array.from(tasks.values());

      if (filter.status) {
        result = result.filter(task => task.status === filter.status);
      }

      if (filter.priority) {
        result = result.filter(task => task.priority === filter.priority);
      }

      if (filter.category) {
        result = result.filter(task => task.category === filter.category);
      }

      if (filter.assignee) {
        result = result.filter(task => task.assignee === filter.assignee);
      }

      if (filter.tag) {
        result = result.filter(task => task.tags.includes(filter.tag));
      }

      if (filter.dueBefore) {
        const date = new Date(filter.dueBefore);
        result = result.filter(task => task.dueDate && task.dueDate <= date);
      }

      if (filter.dueAfter) {
        const date = new Date(filter.dueAfter);
        result = result.filter(task => task.dueDate && task.dueDate >= date);
      }

      if (filter.search) {
        const query = filter.search.toLowerCase();
        result = result.filter(task => 
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
        );
      }

      return result;
    },

    /**
     * 搜索任务
     */
    searchTasks(query) {
      const results = this.filterTasks({ search: query });
      
      console.log(i18n.t('task.search.results', { query, count: results.length }));
      
      if (results.length > 0) {
        results.forEach(task => {
          console.log(`- [${task.id}] ${task.title} (${i18n.t(`task.status.${task.status}`)})`);
        });
      }
      
      return results;
    },

    /**
     * 获取任务统计信息
     */
    getStatistics() {
      const allTasks = Array.from(tasks.values());
      
      const stats = {
        total: allTasks.length,
        pending: allTasks.filter(t => t.status === 'pending').length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        overdue: allTasks.filter(t => 
          t.status === 'pending' && t.dueDate && t.dueDate < new Date()
        ).length,
        byPriority: {},
        byCategory: {},
        completionRate: 0,
        averageCompletionTime: 0
      };

      // 按优先级统计
      Object.keys(priorities).forEach(priority => {
        stats.byPriority[priority] = allTasks.filter(t => t.priority === priority).length;
      });

      // 按分类统计
      const categories = [...new Set(allTasks.map(t => t.category))];
      categories.forEach(category => {
        stats.byCategory[category] = allTasks.filter(t => t.category === category).length;
      });

      // 完成率
      if (stats.total > 0) {
        stats.completionRate = (stats.completed / stats.total * 100).toFixed(2);
      }

      // 平均完成时间
      const completedTasks = allTasks.filter(t => t.status === 'completed' && t.completedAt);
      if (completedTasks.length > 0) {
        const totalTime = completedTasks.reduce((sum, task) => {
          return sum + (task.completedAt.getTime() - task.createdAt.getTime());
        }, 0);
        stats.averageCompletionTime = Math.round(totalTime / completedTasks.length / (1000 * 60 * 60)); // 小时
      }

      return stats;
    },

    /**
     * 显示任务统计
     */
    showStatistics() {
      const stats = this.getStatistics();
      
      console.log('\n' + i18n.t('task.statistics.title'));
      console.log('='.repeat(50));
      console.log(`${i18n.t('task.statistics.total')}: ${stats.total}`);
      console.log(`${i18n.t('task.statistics.pending')}: ${stats.pending}`);
      console.log(`${i18n.t('task.statistics.completed')}: ${stats.completed}`);
      console.log(`${i18n.t('task.statistics.overdue')}: ${stats.overdue}`);
      console.log(`${i18n.t('task.statistics.completionRate')}: ${stats.completionRate}%`);
      
      if (stats.averageCompletionTime > 0) {
        console.log(`${i18n.t('task.statistics.averageCompletionTime')}: ${stats.averageCompletionTime}h`);
      }
      
      console.log('\n' + i18n.t('task.statistics.byPriority') + ':');
      Object.entries(stats.byPriority).forEach(([priority, count]) => {
        const config = priorities[priority];
        console.log(`  ${config.icon} ${i18n.t(`task.priority.${priority}`)}: ${count}`);
      });
      
      if (Object.keys(stats.byCategory).length > 0) {
        console.log('\n' + i18n.t('task.statistics.byCategory') + ':');
        Object.entries(stats.byCategory).forEach(([category, count]) => {
          console.log(`  📁 ${category}: ${count}`);
        });
      }
    },

    /**
     * 添加子任务
     */
    addSubtask(parentId, subtaskData) {
      const parentTask = tasks.get(parentId);
      if (!parentTask) {
        throw new Error(i18n.t('task.error.notFound', { id: parentId }));
      }

      const subtask = {
        id: `${parentId}-${parentTask.subtasks.length + 1}`,
        title: subtaskData.title,
        description: subtaskData.description || '',
        status: 'pending',
        createdAt: new Date(),
        completedAt: null
      };

      parentTask.subtasks.push(subtask);
      parentTask.updatedAt = new Date();

      console.log($tsl('子任务已添加: {{title}}'), { title: subtask.title });
      return subtask;
    },

    /**
     * 完成子任务
     */
    completeSubtask(parentId, subtaskId) {
      const parentTask = tasks.get(parentId);
      if (!parentTask) {
        throw new Error(i18n.t('task.error.notFound', { id: parentId }));
      }

      const subtask = parentTask.subtasks.find(st => st.id === subtaskId);
      if (!subtask) {
        throw new Error(i18n.t('task.subtask.error.notFound', { id: subtaskId }));
      }

      subtask.status = 'completed';
      subtask.completedAt = new Date();
      parentTask.updatedAt = new Date();

      console.log($tsl('子任务已完成: {{title}}'), { title: subtask.title });
      return subtask;
    },

    /**
     * 添加任务评论
     */
    addComment(taskId, comment) {
      const task = tasks.get(taskId);
      if (!task) {
        throw new Error(i18n.t('task.error.notFound', { id: taskId }));
      }

      const commentObj = {
        id: task.comments.length + 1,
        text: comment,
        createdAt: new Date(),
        author: 'current_user' // 在实际应用中应该是当前用户
      };

      task.comments.push(commentObj);
      task.updatedAt = new Date();

      console.log($tsl('评论已添加到任务: {{title}}'), { title: task.title });
      return commentObj;
    },

    /**
     * 验证任务数据
     */
    validateTaskData(data, isUpdate = false) {
      const errors = [];

      if (!isUpdate || data.title !== undefined) {
        if (!data.title || data.title.trim().length === 0) {
          errors.push(i18n.t('validation.required', { field: i18n.t('task.title') }));
        } else if (data.title.length > 200) {
          errors.push(i18n.t('validation.maxLength', { field: i18n.t('task.title'), max: 200 }));
        }
      }

      if (data.description && data.description.length > 1000) {
        errors.push(i18n.t('validation.maxLength', { field: i18n.t('task.description'), max: 1000 }));
      }

      if (data.priority && !Object.keys(priorities).includes(data.priority)) {
        errors.push(i18n.t('task.validation.invalidPriority', { priority: data.priority }));
      }

      if (data.dueDate) {
        const date = new Date(data.dueDate);
        if (isNaN(date.getTime())) {
          errors.push(i18n.t('task.validation.invalidDate'));
        } else if (date < new Date()) {
          errors.push(i18n.t('task.validation.pastDate'));
        }
      }

      if (data.estimatedHours && (data.estimatedHours < 0 || data.estimatedHours > 1000)) {
        errors.push(i18n.t('task.validation.invalidHours'));
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    },

    /**
     * 导出任务数据
     */
    exportTasks(format = 'json') {
      const allTasks = Array.from(tasks.values());
      
      if (format === 'json') {
        const data = JSON.stringify(allTasks, null, 2);
        console.log($tsl('任务数据已导出 (JSON 格式)'));
        return data;
      } else if (format === 'csv') {
        const headers = ['ID', 'Title', 'Status', 'Priority', 'Category', 'Due Date', 'Created At'];
        const rows = allTasks.map(task => [
          task.id,
          task.title,
          task.status,
          task.priority,
          task.category,
          task.dueDate ? task.dueDate.toISOString() : '',
          task.createdAt.toISOString()
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        console.log($tsl('任务数据已导出 (CSV 格式)'));
        return csv;
      }
      
      throw new Error(i18n.t('task.export.unsupportedFormat', { format }));
    },

    /**
     * 重置任务管理器
     */
    reset() {
      tasks.clear();
      nextId = 1;
      console.log($tsl('任务管理器已重置'));
    }
  };
}
