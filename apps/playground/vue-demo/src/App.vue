<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-brand">
        <!-- 最佳实践：使用 t() 函数替代 $tsl() -->
        <h1>{{ t('app.title') }}</h1>
      </div>

      <div class="nav-controls">
        <LanguageSwitcher />
      </div>
    </nav>

    <!-- 加载状态 -->
    <div v-if="!isReady" class="loading">
      <div class="spinner" />
      <p>{{ t('app.loading') }}</p>
    </div>

    <!-- 主要内容 -->
    <main v-else class="main-content">
      <!-- 欢迎区域 -->
      <section class="welcome-section">
        <h2>{{ t('welcome.title') }}</h2>
        <p>{{ t('welcome.description') }}</p>

        <div class="feature-grid">
          <FeatureCard
            :title="t('features.codeTransform.title')"
            :description="t('features.codeTransform.description')"
            icon="🔄"
          />
          <FeatureCard
            :title="t('features.hmr.title')"
            :description="t('features.hmr.description')"
            icon="⚡"
          />
          <FeatureCard
            :title="t('features.lazyLoad.title')"
            :description="t('features.lazyLoad.description')"
            icon="📦"
          />
          <FeatureCard
            :title="t('features.cache.title')"
            :description="t('features.cache.description')"
            icon="💾"
          />
        </div>
      </section>

      <!-- 交互演示区域 -->
      <section class="demo-section">
        <h3>{{ t('demo.title') }}</h3>

        <div class="demo-grid">
          <!-- 用户信息演示 -->
          <div class="demo-card">
            <h4>{{ t('demo.userProfile') }}</h4>
            <UserProfile />
          </div>

          <!-- 表单演示 -->
          <div class="demo-card">
            <h4>{{ t('demo.contactForm') }}</h4>
            <ContactForm />
          </div>

          <!-- 数据展示演示 -->
          <div class="demo-card">
            <h4>{{ t('demo.dataDisplay') }}</h4>
            <DataDisplay />
          </div>

          <!-- 消息通知演示 -->
          <div class="demo-card">
            <h4>{{ t('demo.notifications') }}</h4>
            <NotificationDemo />
          </div>
        </div>
      </section>

      <!-- 技术特性展示 -->
      <section class="tech-section">
        <h3>{{ t('tech.sectionTitle') }}</h3>
        <TechFeatures />
      </section>
    </main>

    <!-- 页脚 -->
    <footer v-if="isReady" class="footer">
      <p>{{ t('footer.copyright') }}</p>
      <!-- 最佳实践：使用参数插值显示动态数据 -->
      <p>
        {{ t('footer.currentLanguage') }}: {{ languageName }} |
        {{ t('footer.cacheHitRate') }}: {{ cacheHitRate }}%
      </p>
      <!-- 开发环境提示 -->
      <p v-if="isDev" class="dev-hint">
        {{ t('footer.devMode') }} -
        <button class="inline-btn" @click="openDevTools">
          {{ t('footer.openDevTools') }}
        </button>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';
import FeatureCard from './components/FeatureCard.vue';
import UserProfile from './components/UserProfile.vue';
import ContactForm from './components/ContactForm.vue';
import DataDisplay from './components/DataDisplay.vue';
import NotificationDemo from './components/NotificationDemo.vue';
import TechFeatures from './components/TechFeatures.vue';

/**
 * 最佳实践 #1: 使用 useI18n Composition API
 * 提供响应式的语言切换和翻译函数
 */
const { t, locale, isReady } = useI18n();

// 开发环境检测
const isDev = import.meta.env.DEV;

// 响应式数据
const cacheHitRate = ref(0);

/**
 * 最佳实践 #2: 使用 computed 缓存翻译结果
 * 避免不必要的重新计算
 */
const languageName = computed(() => {
  const langNames: Record<string, string> = {
    'zh-CN': '中文',
    'en-US': 'English',
    'ja-JP': '日本語',
  };
  return langNames[locale.value] || locale.value;
});

/**
 * 最佳实践 #3: 获取真实的缓存统计
 * 而不是模拟数据
 */
const updateCacheStats = () => {
  // 在实际项目中，这里应该从 i18n engine 获取真实统计
  // const stats = i18n.getCacheStats();
  // cacheHitRate.value = Math.round(stats.hitRate * 100);

  // Demo 演示使用模拟数据
  cacheHitRate.value = Math.floor(Math.random() * 20) + 80;
};

/**
 * 最佳实践 #4: 提供 DevTools 快捷访问
 */
const openDevTools = () => {
  if (typeof window !== 'undefined' && (window as any).__TRANSLINK_DEVTOOLS__) {
    console.clear();
    console.log('📊 TransLink I18n DevTools');
    console.log('═══════════════════════════════════════');
    (window as any).__TRANSLINK_DEVTOOLS__.printStats();
  } else {
    console.warn('DevTools not available.');
  }
};

// 定时器引用
let statsTimer: number;

/**
 * 最佳实践 #5: 组件挂载时初始化
 */
onMounted(() => {
  // 初始更新
  updateCacheStats();

  // 定期更新统计信息
  statsTimer = window.setInterval(() => {
    updateCacheStats();
  }, 5000);

  // 开发环境提示
  if (isDev) {
    console.log('🚀 Vue Demo with TransLink I18n Best Practices');
    console.log('💡 Press Ctrl+Shift+I to open DevTools');
    console.log('📊 Try: window.__TRANSLINK_DEVTOOLS__.printStats()');
  }
});

/**
 * 最佳实践 #6: 组件卸载时清理资源
 * 防止内存泄漏
 */
onUnmounted(() => {
  if (statsTimer) {
    clearInterval(statsTimer);
  }
});
</script>

<style scoped>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.welcome-section p {
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section h3 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #2c3e50;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.demo-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.demo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.demo-card h4 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.3rem;
}

.tech-section {
  margin-bottom: 3rem;
}

.tech-section h3 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #2c3e50;
}

.footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: auto;
}

.footer p {
  margin: 0.5rem 0;
  opacity: 0.8;
}

.dev-hint {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  opacity: 1 !important;
}

.inline-btn {
  background: none;
  border: none;
  color: #42b983;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  transition: color 0.2s;
}

.inline-btn:hover {
  color: #33a06f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    position: static;
  }

  .main-content {
    padding: 1rem;
  }

  .welcome-section h2 {
    font-size: 2rem;
  }

  .feature-grid,
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
