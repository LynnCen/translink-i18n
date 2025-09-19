<template>
  <div class="user-profile">
    <div class="profile-header">
      <div class="avatar">
        <img :src="user.avatar" :alt="$tsl('用户头像')" />
      </div>
      <div class="profile-info">
        <h4>{{ user.name }}</h4>
        <p class="user-role">{{ $tsl('高级用户') }}</p>
      </div>
    </div>
    
    <div class="profile-stats">
      <div class="stat-item">
        <span class="stat-value">{{ user.posts }}</span>
        <span class="stat-label">{{ $tsl('发布文章') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ user.followers }}</span>
        <span class="stat-label">{{ $tsl('关注者') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ user.following }}</span>
        <span class="stat-label">{{ $tsl('正在关注') }}</span>
      </div>
    </div>
    
    <div class="profile-actions">
      <button class="btn btn-primary" @click="editProfile">
        {{ $tsl('编辑资料') }}
      </button>
      <button class="btn btn-secondary" @click="viewPosts">
        {{ $tsl('查看文章') }}
      </button>
    </div>
    
    <div class="profile-details">
      <div class="detail-item">
        <span class="detail-label">{{ $tsl('加入时间') }}:</span>
        <span class="detail-value">{{ formatDate(user.joinDate) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $tsl('最后活动') }}:</span>
        <span class="detail-value">{{ formatRelativeTime(user.lastActive) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $tsl('用户等级') }}:</span>
        <span class="detail-value level-badge">{{ $tsl('VIP 会员') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

const { t } = useI18n();

// 用户数据
const user = ref({
  name: '张小明',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  posts: 128,
  followers: 1234,
  following: 567,
  joinDate: new Date('2023-01-15'),
  lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前
});

// 格式化日期
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 格式化相对时间
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) {
    return t('刚刚');
  } else if (hours < 24) {
    return t('{{hours}} 小时前', { hours });
  } else {
    const days = Math.floor(hours / 24);
    return t('{{days}} 天前', { days });
  }
};

// 操作方法
const editProfile = () => {
  alert($tsl('编辑资料功能开发中...'));
};

const viewPosts = () => {
  alert($tsl('查看文章功能开发中...'));
};
</script>

<style scoped>
.user-profile {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  border: 3px solid #667eea;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.user-role {
  margin: 0;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
}

.profile-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.profile-details {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.detail-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.level-badge {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #744210;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .profile-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .profile-actions {
    flex-direction: column;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
