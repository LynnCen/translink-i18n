<template>
  <div class="data-display">
    <!-- 最佳实践：使用复数支持 -->
    <div class="stat-card">
      <div class="stat-number">
        {{ itemCount }}
      </div>
      <div class="stat-label">
        {{ t('stats.item', { count: itemCount }) }}
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-number">
        {{ userCount }}
      </div>
      <div class="stat-label">
        {{ t('stats.user', { count: userCount }) }}
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-number">
        {{ messageCount }}
      </div>
      <div class="stat-label">
        {{ t('stats.message', { count: messageCount }) }}
      </div>
    </div>

    <!-- 最佳实践：使用格式化参数 -->
    <div class="update-time">
      {{ t('stats.lastUpdate', { time: formattedTime }) }}
    </div>

    <button class="refresh-btn" @click="refreshData">
      {{ t('stats.refresh') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

const { t } = useI18n();

// 响应式数据
const itemCount = ref(5);
const userCount = ref(1);
const messageCount = ref(0);
const lastUpdate = ref(new Date());

/**
 * 最佳实践：使用 computed 缓存翻译结果
 * 避免在每次渲染时重新计算
 */
const formattedTime = computed(() => {
  return lastUpdate.value.toLocaleTimeString();
});

/**
 * 最佳实践：模拟数据更新
 */
const refreshData = () => {
  itemCount.value = Math.floor(Math.random() * 100);
  userCount.value = Math.floor(Math.random() * 50);
  messageCount.value = Math.floor(Math.random() * 200);
  lastUpdate.value = new Date();
};

// 定时器
let timer: number;

onMounted(() => {
  // 每5秒自动刷新
  timer = window.setInterval(() => {
    refreshData();
  }, 5000);
});

/**
 * 最佳实践：清理定时器防止内存泄漏
 */
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.data-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.update-time {
  text-align: center;
  color: #999;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #764ba2;
  transform: scale(1.05);
}
</style>
