<template>
  <div class="feature-card">
    <div class="feature-icon">
      {{ icon }}
    </div>
    <h3 class="feature-title">
      {{ title }}
    </h3>
    <p class="feature-description">
      {{ description }}
    </p>
    <div v-if="badge" class="feature-badge">
      <span class="badge">{{ badge }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

defineProps<Props>();
</script>

<style scoped>
.feature-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e8ed;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.feature-description {
  color: #7f8c8d;
  line-height: 1.6;
  text-align: center;
  margin: 0;
}

.feature-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feature-card {
    padding: 1.5rem;
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .feature-title {
    font-size: 1.25rem;
  }
}
</style>
