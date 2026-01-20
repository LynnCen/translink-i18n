<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <div class="nav-brand">
        <h1>{{ t('appTitle') }}</h1>
        <span class="version">v1.0</span>
      </div>
      <div class="nav-info">
        <span class="locale-info">{{ t('currentLocale') }}: {{ locale }}</span>
      </div>
    </nav>

    <!-- 加载状态 -->
    <div v-if="!isReady" class="loading-screen">
      <div class="spinner-large" />
      <p>{{ t('initializing') }}</p>
    </div>

    <!-- 主内容 -->
    <div v-else class="container">
      <!-- 侧边栏导航 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>{{ t('demoScenes') }}</h3>
        </div>
        <nav class="scene-nav">
          <button
            v-for="scene in scenes"
            :key="scene.id"
            :class="['scene-btn', { active: currentScene === scene.id }]"
            @click="currentScene = scene.id"
          >
            <span class="scene-number">{{ scene.id.padStart(2, '0') }}</span>
            <span class="scene-name">{{ t(scene.nameKey) }}</span>
            <span class="scene-icon">{{ scene.icon }}</span>
          </button>
        </nav>

        <!-- 快捷操作 -->
        <div class="sidebar-actions">
          <h4>{{ t('quickActions') }}</h4>
          <button @click="switchLanguage" class="action-btn">
            🌐 {{ t('toggleLanguage') }}
          </button>
          <button @click="openDevTools" class="action-btn">
            🛠️ {{ t('openDevTools') }}
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
          <p>{{ t('footerInfo') }}</p>
          <div class="footer-stats">
            <span>{{ t('footerLocale') }}: {{ locale }}</span>
            <span>•</span>
            <span>{{ t('footerScene') }}: {{ currentScene }}</span>
            <span>•</span>
            <span v-if="devToolsAvailable">
              {{ t('footerDevtools') }}: {{ t('footerEnabled') }}
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
  { id: '01', nameKey: 'sceneBasicTranslation', icon: '📝', component: BasicTranslation },
  { id: '02', nameKey: 'sceneLanguageSwitcher', icon: '🌐', component: LanguageSwitcher },
  { id: '03', nameKey: 'sceneParameterInterpolation', icon: '🔤', component: ParameterInterpolation },
  { id: '04', nameKey: 'scenePluralization', icon: '🔢', component: PluralizationDemo },
  { id: '05', nameKey: 'sceneDirective', icon: '🎯', component: DirectiveDemo },
  { id: '06', nameKey: 'sceneTranslationComponent', icon: '🧩', component: TranslationComponent },
  { id: '07', nameKey: 'sceneGlobalProperties', icon: '🌍', component: GlobalProperties },
  { id: '08', nameKey: 'sceneLoadingStates', icon: '⏳', component: LoadingStates },
  { id: '09', nameKey: 'sceneDevtools', icon: '🛠️', component: DevToolsDemo },
];

const currentScene = ref('01');
const devToolsAvailable = ref(!!window.__TRANSLINK_DEVTOOLS__);

// 当前组件
const currentComponent = computed(() => {
  const scene = scenes.find(s => s.id === currentScene.value);
  return scene?.component;
});

// 切换语言
const switchLanguage = async () => {
  const newLang = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
  await setLocale(newLang);
};

// 打开 DevTools
const openDevTools = () => {
  if (window.__TRANSLINK_DEVTOOLS__) {
    window.__TRANSLINK_DEVTOOLS__.help();
  } else {
    console.warn('DevTools not available');
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.version {
  padding: 0.25rem 0.5rem;
  background: #667eea;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.locale-info {
  color: #666;
  font-size: 0.9rem;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  color: white;
  gap: 1rem;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 0;
  max-width: 1400px;
  margin: 2rem auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  min-height: calc(100vh - 120px);
}

.sidebar {
  background: #f8f9fa;
  padding: 1.5rem;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.scene-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.scene-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  background: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.scene-btn:hover {
  background: #e8eaf6;
  transform: translateX(4px);
}

.scene-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.scene-number {
  font-weight: 600;
  font-size: 0.85rem;
  opacity: 0.8;
}

.scene-name {
  flex: 1;
}

.scene-icon {
  font-size: 1.2rem;
}

.sidebar-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e0e0e0;
}

.sidebar-actions h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #666;
}

.action-btn {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  text-align: left;
}

.action-btn:hover {
  background: #f5f7ff;
  border-color: #667eea;
}

.main-content {
  padding: 2rem;
  overflow-y: auto;
}

.scene-container {
  min-height: 600px;
}

.footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e0e0e0;
  text-align: center;
  color: #666;
}

.footer p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.footer-stats {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.85rem;
}

/* 响应式 */
@media (max-width: 1024px) {
  .container {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .scene-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .scene-btn {
    flex: 1 1 calc(50% - 0.25rem);
    min-width: 150px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }

  .nav-brand h1 {
    font-size: 1.2rem;
  }

  .container {
    margin: 1rem;
  }

  .main-content {
    padding: 1rem;
  }

  .scene-btn {
    flex: 1 1 100%;
  }
}
</style>
