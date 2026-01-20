<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">09</span>
      {{ t('devtoolsTitle') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('devtoolsDesc') }}</p>
    </div>

    <div class="demo-content">
      <!-- 验证点 1: DevTools 可用性 -->
      <div class="test-case">
        <h4>✅ DevTools Availability</h4>
        <div class="result">
          <code>window.__TRANSLINK_DEVTOOLS__</code>
          <div :class="['output', 'status', { available: devToolsAvailable }]">
            <span class="status-indicator" />
            {{
              devToolsAvailable
                ? t('devtoolsavailable')
                : t('devtoolsnotAvailable')
            }}
          </div>
        </div>
      </div>

      <!-- 验证点 2: 实时统计 -->
      <div v-if="devToolsAvailable" class="test-case">
        <h4>✅ Real-time Statistics</h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">{{ t('devtoolsstats.missing') }}</div>
            <div class="stat-value">{{ stats.missingKeys }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">{{ t('devtoolsstats.cacheHits') }}</div>
            <div class="stat-value">{{ stats.cacheHits }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">{{ t('devtoolsstats.cacheMisses') }}</div>
            <div class="stat-value">{{ stats.cacheMisses }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">{{ t('devtoolsstats.hitRate') }}</div>
            <div class="stat-value">{{ stats.hitRate }}%</div>
          </div>
        </div>
        <button class="refresh-btn" @click="refreshStats">
          🔄 {{ t('devtoolsrefresh') }}
        </button>
      </div>

      <!-- 验证点 3: DevTools API -->
      <div v-if="devToolsAvailable" class="test-case">
        <h4>✅ DevTools API Methods</h4>
        <div class="api-buttons">
          <button @click="printStats">
            📊 {{ t('devtoolsprintStats') }}
          </button>
          <button @click="exportJSON">
            📥 {{ t('devtoolsexportJSON') }}
          </button>
          <button @click="getMissingKeys">
            🔍 {{ t('devtoolsgetMissing') }}
          </button>
          <button @click="clearMissing">
            🗑️ {{ t('devtoolsclearMissing') }}
          </button>
        </div>
      </div>

      <!-- 验证点 4: 控制台提示 -->
      <div class="test-case">
        <h4>✅ Console Usage</h4>
        <div class="result">
          <div class="console-hint">
            <p>{{ t('devtoolsconsoleHint') }}:</p>
            <code>window.__TRANSLINK_DEVTOOLS__.help()</code>
            <code>window.__TRANSLINK_DEVTOOLS__.printStats()</code>
            <code>window.__TRANSLINK_DEVTOOLS__.getMissingKeys()</code>
            <code>window.__TRANSLINK_DEVTOOLS__.exportJSON()</code>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-api">
      <h4>🎯 Runtime API Validated:</h4>
      <ul>
        <li><code>window.__TRANSLINK_DEVTOOLS__</code> - Global DevTools</li>
        <li><code>getStats()</code> - Get statistics</li>
        <li><code>getMissingKeys()</code> - Get missing translation keys</li>
        <li><code>exportJSON()</code> - Export missing keys as JSON</li>
        <li><code>clear()</code> - Clear missing keys tracking</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

/**
 * 场景 09: DevTools 集成
 *
 * 验证 Runtime API:
 * - DevTools 实例访问
 * - 统计信息获取
 * - 缺失键追踪
 * - 导出功能
 */
const { t } = useI18n();

const devToolsAvailable = ref(false);
const stats = ref({
  missingKeys: 0,
  cacheHits: 0,
  cacheMisses: 0,
  hitRate: 0,
});

let statsInterval: ReturnType<typeof setInterval> | null = null;

const refreshStats = () => {
  if (window.__TRANSLINK_DEVTOOLS__) {
    const devStats = window.__TRANSLINK_DEVTOOLS__.getStats();
    const total = devStats.cache.hits + devStats.cache.misses;
    stats.value = {
      missingKeys: devStats.missingKeysCount,
      cacheHits: devStats.cache.hits,
      cacheMisses: devStats.cache.misses,
      hitRate: total > 0 ? Math.round((devStats.cache.hits / total) * 100) : 0,
    };
  }
};

const printStats = () => {
  window.__TRANSLINK_DEVTOOLS__?.printStats();
  console.log('✅ Stats printed to console');
};

const exportJSON = () => {
  window.__TRANSLINK_DEVTOOLS__?.exportJSON();
  console.log('✅ Missing keys exported as JSON');
};

const getMissingKeys = () => {
  const missing = window.__TRANSLINK_DEVTOOLS__?.getMissingKeys();
  console.log('Missing keys:', missing);
};

const clearMissing = () => {
  window.__TRANSLINK_DEVTOOLS__?.clear();
  refreshStats();
  console.log('✅ Missing keys cleared');
};

onMounted(() => {
  devToolsAvailable.value = !!window.__TRANSLINK_DEVTOOLS__;
  if (devToolsAvailable.value) {
    refreshStats();
    statsInterval = setInterval(refreshStats, 2000);
  }
});

onUnmounted(() => {
  if (statsInterval) {
    clearInterval(statsInterval);
  }
});
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
  background: #f44336;
}

.status.available .status-indicator {
  background: #4caf50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.25rem;
  border-radius: 8px;
  color: white;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.refresh-btn,
.api-buttons button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 6px;
  background: #667eea;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover,
.api-buttons button:hover {
  background: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.api-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.console-hint {
  background: #1e1e1e;
  padding: 1rem;
  border-radius: 6px;
  color: #d4d4d4;
  font-family: 'Monaco', 'Menlo', monospace;
}

.console-hint p {
  color: #9cdcfe;
  margin: 0 0 0.75rem 0;
}

.console-hint code {
  display: block;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: #2d2d2d;
  border-radius: 4px;
  color: #ce9178;
  font-size: 0.875rem;
}

.console-hint code:last-child {
  margin-bottom: 0;
}
</style>
