<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">08</span>
      {{ t('loadingStatesTitle') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('loadingStatesDesc') }}</p>
    </div>

    <div class="demo-content">
      <!-- 验证点 1: isReady 状态 -->
      <div class="test-case">
        <h4>✅ isReady - Initialization State</h4>
        <div class="result">
          <code>const { isReady } = useI18n()</code>
          <div :class="['output', 'status', { ready: isReady }]">
            <span class="status-indicator" />
            <strong>isReady.value:</strong> {{ isReady }}
          </div>
        </div>
      </div>

      <!-- 验证点 2: isLoading 状态 -->
      <div class="test-case">
        <h4>✅ isLoading - Language Switch Loading</h4>
        <div class="result">
          <code>const { isLoading } = useI18n()</code>
          <div :class="['output', 'status', { loading: isLoading }]">
            <span class="status-indicator" />
            <strong>isLoading.value:</strong> {{ isLoading }}
          </div>
        </div>
      </div>

      <!-- 验证点 3: 加载时禁用UI -->
      <div class="test-case">
        <h4>✅ Disable UI During Loading</h4>
        <div class="result">
          <button
            :disabled="isLoading"
            :class="['action-btn', { loading: isLoading }]"
            @click="switchLanguage"
          >
            <span v-if="isLoading" class="spinner" />
            {{ isLoading ? t('loading') : t('loadingStatesswitchBtn') }}
          </button>
        </div>
      </div>

      <!-- 验证点 4: 条件渲染 -->
      <div class="test-case">
        <h4>✅ Conditional Rendering</h4>
        <div class="result">
          <code>v-if="isReady" / v-else</code>
          <div class="output">
            <div v-if="isReady" class="ready-state">
              ✅ {{ t('loadingStatesready') }}
            </div>
            <div v-else class="loading-state">
              ⏳ {{ t('loadingStatesinitializing') }}
            </div>
          </div>
        </div>
      </div>

      <!-- 验证点 5: 加载指示器 -->
      <div class="test-case">
        <h4>✅ Loading Indicator</h4>
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner" />
          <p>{{ t('loadingStatesswitching') }}</p>
        </div>
        <div v-else class="result">
          <div class="output success">
            {{ t('loadingStatesnoLoading') }}
          </div>
        </div>
      </div>
    </div>

    <div class="demo-api">
      <h4>🎯 Runtime API Validated:</h4>
      <ul>
        <li><code>isReady</code> - I18n initialization state</li>
        <li><code>isLoading</code> - Language switching state</li>
        <li>Use for conditional rendering</li>
        <li>Use for disabling UI during operations</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';

/**
 * 场景 08: 加载状态
 *
 * 验证 Runtime API:
 * - isReady 初始化状态
 * - isLoading 加载状态
 * - 状态驱动的UI更新
 */
const { t, isReady, isLoading, setLocale, locale } = useI18n();

const switchLanguage = async () => {
  const newLang = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
  await setLocale(newLang);
};
</script>

<style scoped>
@import './demo-card-styles.css';

.status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff9800;
}

.status.ready .status-indicator {
  background: #4caf50;
}

.status.loading .status-indicator {
  background: #2196f3;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.ready-state,
.loading-state {
  padding: 0.75rem;
  border-radius: 4px;
  font-weight: 500;
}

.ready-state {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #81c784;
}

.loading-state {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffb74d;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background: #f5f7ff;
  border-radius: 8px;
  border: 2px dashed #667eea;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e7ff;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.output.success {
  background: #e8f5e9;
  border-color: #81c784;
  color: #2e7d32;
}
</style>
