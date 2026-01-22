<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <div class="nav-brand">
        <h1>{{ t('TransLink Vue Demo') }}</h1>
        <span class="version">v1.0</span>
      </div>
      <div class="nav-info">
        <span class="locale-info">{{ t('当前语言') }}: {{ locale }}</span>
      </div>
    </nav>

    <!-- 加载状态 -->
    <div v-if="!isReady" class="loading-screen">
      <div class="spinner-large" />
      <p>{{ t('加载翻译资源...') }}</p>
    </div>

    <!-- 主内容 -->
    <div v-else class="container">
      <!-- 侧边栏导航 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>{{ t('演示场景') }}</h3>
        </div>
        <nav class="scene-nav">
          <button
            v-for="scene in scenes"
            :key="scene.id"
            :class="['scene-btn', { active: currentScene === scene.id }]"
            @click="currentScene = scene.id"
          >
            <span class="scene-number">{{ scene.id }}</span>
            <span class="scene-name">{{ t(scene.name) }}</span>
            <span class="scene-icon">{{ scene.icon }}</span>
          </button>
        </nav>

        <!-- 快捷操作 -->
        <div class="sidebar-actions">
          <h4>{{ t('快速操作') }}</h4>
          <button @click="switchLanguage" class="action-btn">
            🌐 {{ t('切换语言') }}
          </button>
          <button @click="openDevTools" class="action-btn">
            🛠️ {{ t('打开开发工具') }}
          </button>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="main-content">
        <div class="scene-container">
          <component :is="currentComponent" :key="currentScene" />
        </div>

        <!-- 页脚信息 -->
        <footer class="footer">
          <p>{{ t('TransLink 国际化解决方案 - Vue 演示') }}</p>
          <div class="footer-stats">
            <span>{{ t('语言') }}: {{ locale }}</span>
            <span>•</span>
            <span>{{ t('场景') }}: {{ currentScene }}</span>
            <span>•</span>
            <span v-if="devToolsAvailable">
              {{ t('开发工具') }}: {{ t('已启用') }}
            </span>
          </div>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

// 导入所有场景组件
import BasicTranslation from './demos/01-BasicTranslation.vue';
import LanguageSwitcher from './demos/02-LanguageSwitcher.vue';
import ParameterInterpolation from './demos/03-ParameterInterpolation.vue';
import PluralizationDemo from './demos/04-PluralizationDemo.vue';
import DirectiveDemo from './demos/05-DirectiveDemo.vue';
import TranslationComponent from './demos/06-TranslationComponent.vue';
import GlobalProperties from './demos/07-GlobalProperties.vue';
import LoadingStates from './demos/08-LoadingStates.vue';
import DevToolsDemo from './demos/09-DevToolsDemo.vue';

/**
 * TransLink I18n Vue 3 Demo
 * 系统化验证 Runtime 提供的所有 API
 */
const { t, locale, setLocale, isReady } = useI18n();

// 场景列表
const scenes = [
  { id: '01', name: '基础翻译', icon: '📝', component: BasicTranslation },
  { id: '02', name: '语言切换', icon: '🌐', component: LanguageSwitcher },
  { id: '03', name: '参数插值', icon: '🔤', component: ParameterInterpolation },
  { id: '04', name: '条件渲染', icon: '🔢', component: PluralizationDemo },
  { id: '05', name: '指令使用', icon: '⚡', component: DirectiveDemo },
  { id: '06', name: '组件化使用', icon: '🧩', component: TranslationComponent },
  { id: '07', name: '全局属性', icon: '🌍', component: GlobalProperties },
  { id: '08', name: '加载状态', icon: '⏳', component: LoadingStates },
  { id: '09', name: '开发工具', icon: '🛠️', component: DevToolsDemo },
];

// 当前场景
const currentScene = ref('01');

// 当前组件
const currentComponent = computed(() => {
  return scenes.find(s => s.id === currentScene.value)?.component;
});

// DevTools 可用性
const devToolsAvailable = ref(
  typeof window !== 'undefined' && !!(window as any).__TRANSLINK_DEVTOOLS__
);

// 切换语言
const switchLanguage = async () => {
  const newLang = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
  await setLocale(newLang);
};

// 打开 DevTools
const openDevTools = () => {
  if (typeof window !== 'undefined' && (window as any).__TRANSLINK_DEVTOOLS__) {
    (window as any).__TRANSLINK_DEVTOOLS__.help();
  } else {
    console.warn('DevTools not available');
  }
};
</script>

<style scoped>
/* 应用容器 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

/* 导航栏 */
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.version {
  font-size: 0.875rem;
  opacity: 0.9;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.locale-info {
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

/* 加载屏幕 */
.loading-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 容器 */
.container {
  flex: 1;
  display: flex;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text);
}

/* 场景导航 */
.scene-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.scene-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.scene-btn:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.scene-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  font-weight: 600;
}

.scene-number {
  font-weight: 700;
  font-size: 1.1rem;
  min-width: 28px;
}

.scene-name {
  flex: 1;
}

.scene-icon {
  font-size: 1.25rem;
}

/* 快捷操作 */
.sidebar-actions {
  padding-top: 1rem;
  border-top: 2px solid var(--color-border);
}

.sidebar-actions h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.action-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.scene-container {
  flex: 1;
  margin-bottom: 2rem;
}

/* 页脚 */
.footer {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  text-align: center;
}

.footer p {
  margin: 0 0 0.75rem 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.footer-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.footer-stats span:nth-child(even) {
  opacity: 0.5;
}
</style>
