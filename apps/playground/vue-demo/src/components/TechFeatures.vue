<template>
  <div class="tech-features">
    <div class="feature-list">
      <!-- 最佳实践：使用 v-for 配合翻译 -->
      <div v-for="feature in features" :key="feature.key" class="tech-feature">
        <div class="feature-icon">
          {{ feature.icon }}
        </div>
        <div class="feature-content">
          <h4>{{ t(`tech.${feature.key}.title`) }}</h4>
          <p>{{ t(`tech.${feature.key}.description`) }}</p>
          <!-- 最佳实践：显示实时统计 -->
          <div v-if="feature.stat" class="feature-stat">
            {{ t(feature.stat.key, feature.stat.params) }}
          </div>
        </div>
      </div>
    </div>

    <!-- DevTools 使用提示 -->
    <div v-if="isDev" class="devtools-hint">
      <div class="hint-title">🔍 {{ t('devtools.title') }}</div>
      <div class="hint-content">
        <p>{{ t('devtools.description') }}</p>
        <pre class="code-block">{{ devToolsExample }}</pre>
        <button class="devtools-btn" @click="openDevTools">
          {{ t('devtools.openButton') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

const { t } = useI18n();

// 检测是否为开发环境
const isDev = import.meta.env.DEV;

// 技术特性列表
interface Feature {
  key: string;
  icon: string;
  stat?: {
    key: string;
    params: Record<string, any>;
  };
}

const features = ref<Feature[]>([
  {
    key: 'cache',
    icon: '⚡',
    stat: undefined,
  },
  {
    key: 'lazyLoad',
    icon: '📦',
    stat: undefined,
  },
  {
    key: 'hmr',
    icon: '🔥',
    stat: undefined,
  },
  {
    key: 'devtools',
    icon: '🛠️',
    stat: undefined,
  },
]);

// DevTools 示例代码
const devToolsExample = computed(() => {
  return `window.__TRANSLINK_DEVTOOLS__.printStats()
window.__TRANSLINK_DEVTOOLS__.getMissingKeys()`;
});

/**
 * 最佳实践：在开发环境提供便捷的 DevTools 访问
 */
const openDevTools = () => {
  if (typeof window !== 'undefined' && (window as any).__TRANSLINK_DEVTOOLS__) {
    console.clear();
    console.log('📊 TransLink I18n DevTools');
    console.log('═══════════════════════════════════════');
    (window as any).__TRANSLINK_DEVTOOLS__.printStats();
    console.log('\n💡 Available Commands:');
    console.log('  - __TRANSLINK_DEVTOOLS__.getMissingKeys()');
    console.log('  - __TRANSLINK_DEVTOOLS__.exportJSON()');
    console.log('  - __TRANSLINK_DEVTOOLS__.exportCSV()');
    console.log('  - __TRANSLINK_DEVTOOLS__.help()');
  } else {
    console.warn(
      'DevTools not available. Make sure devTools.enabled is true in your i18n config.'
    );
  }
};

/**
 * 最佳实践：动态更新统计信息
 */
onMounted(() => {
  // 模拟更新缓存命中率
  setInterval(() => {
    const cacheHitRate = Math.floor(Math.random() * 20) + 80;
    features.value[0].stat = {
      key: 'tech.cache.stat',
      params: { rate: cacheHitRate },
    };
  }, 3000);
});
</script>

<style scoped>
.tech-features {
  width: 100%;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.tech-feature {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.tech-feature:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.feature-content h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.feature-content p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
}

.feature-stat {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  border-radius: 6px;
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 500;
}

.devtools-hint {
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.hint-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.hint-content p {
  margin: 0 0 1rem 0;
  color: #666;
}

.code-block {
  background: #2c3e50;
  color: #42b983;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.devtools-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.devtools-btn:hover {
  background: #764ba2;
  transform: scale(1.05);
}
</style>
