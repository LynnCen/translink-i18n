<template>
  <div class="notification-demo">
    <div class="button-group">
      <button class="btn btn-success" @click="showSuccess">
        {{ t('notification.showSuccess') }}
      </button>
      <button class="btn btn-warning" @click="showWarning">
        {{ t('notification.showWarning') }}
      </button>
      <button class="btn btn-error" @click="showError">
        {{ t('notification.showError') }}
      </button>
    </div>

    <!-- 最佳实践：使用 TransitionGroup 优化性能 -->
    <TransitionGroup name="notification-list" tag="div" class="notifications">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
      >
        <div class="notification-icon">
          {{ notification.icon }}
        </div>
        <div class="notification-content">
          <div class="notification-title">
            {{ t(`notification.${notification.type}Title`) }}
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
        </div>
        <button
          class="notification-close"
          @click="removeNotification(notification.id)"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

const { t } = useI18n();

interface Notification {
  id: number;
  type: 'success' | 'warning' | 'error';
  icon: string;
  message: string;
}

const notifications = ref<Notification[]>([]);
let notificationId = 0;

/**
 * 最佳实践：在业务逻辑中使用翻译函数
 * 支持动态内容翻译
 */
const addNotification = (
  type: 'success' | 'warning' | 'error',
  messageKey: string
) => {
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
  };

  const notification: Notification = {
    id: notificationId++,
    type,
    icon: icons[type],
    message: t(messageKey),
  };

  notifications.value.push(notification);

  // 3秒后自动移除
  setTimeout(() => {
    removeNotification(notification.id);
  }, 3000);
};

const removeNotification = (id: number) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

const showSuccess = () => {
  addNotification('success', 'notification.successMessage');
};

const showWarning = () => {
  addNotification('warning', 'notification.warningMessage');
};

const showError = () => {
  addNotification('error', 'notification.errorMessage');
};
</script>

<style scoped>
.notification-demo {
  width: 100%;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  min-width: 100px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-success {
  background: #28a745;
}

.btn-warning {
  background: #ffc107;
  color: #333;
}

.btn-error {
  background: #dc3545;
}

.notifications {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-success {
  background: #d4edda;
  border-left: 4px solid #28a745;
}

.notification-warning {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.notification-error {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
}

.notification-icon {
  font-size: 1.25rem;
  font-weight: bold;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.9rem;
  opacity: 0.8;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.notification-close:hover {
  opacity: 1;
}

/* 最佳实践：使用 TransitionGroup 动画优化体验 */
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.notification-list-move {
  transition: transform 0.3s ease;
}
</style>
