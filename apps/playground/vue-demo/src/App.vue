<template>
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-brand">
        <h1>{{ $tsl('TransLink I18n 演示') }}</h1>
      </div>
      
      <div class="nav-controls">
        <LanguageSwitcher />
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="main-content">
      <!-- 欢迎区域 -->
      <section class="welcome-section">
        <h2>{{ $tsl('欢迎使用 TransLink I18n') }}</h2>
        <p>{{ $tsl('这是一个功能完整的国际化解决方案，支持 Vue 3、React 和原生 JavaScript。') }}</p>
        
        <div class="feature-grid">
          <FeatureCard 
            :title="$tsl('智能代码转换')"
            :description="$tsl('自动将 $tsl 函数转换为哈希键，提升运行时性能。')"
            icon="🔄"
          />
          <FeatureCard 
            :title="$tsl('热更新支持')"
            :description="$tsl('语言文件变更时实时更新界面，无需刷新页面。')"
            icon="⚡"
          />
          <FeatureCard 
            :title="$tsl('懒加载机制')"
            :description="$tsl('按需加载语言包，优化首屏加载性能。')"
            icon="📦"
          />
          <FeatureCard 
            :title="$tsl('多级缓存')"
            :description="$tsl('内存、本地存储、网络三级缓存策略。')"
            icon="💾"
          />
        </div>
      </section>

      <!-- 交互演示区域 -->
      <section class="demo-section">
        <h3>{{ $tsl('交互演示') }}</h3>
        
        <div class="demo-grid">
          <!-- 用户信息演示 -->
          <div class="demo-card">
            <h4>{{ $tsl('用户信息') }}</h4>
            <UserProfile />
          </div>

          <!-- 表单演示 -->
          <div class="demo-card">
            <h4>{{ $tsl('表单示例') }}</h4>
            <ContactForm />
          </div>

          <!-- 数据展示演示 -->
          <div class="demo-card">
            <h4>{{ $tsl('数据展示') }}</h4>
            <DataDisplay />
          </div>

          <!-- 消息通知演示 -->
          <div class="demo-card">
            <h4>{{ $tsl('消息通知') }}</h4>
            <NotificationDemo />
          </div>
        </div>
      </section>

      <!-- 技术特性展示 -->
      <section class="tech-section">
        <h3>{{ $tsl('技术特性') }}</h3>
        <TechFeatures />
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <p>{{ $tsl('© 2024 TransLink I18n. 保留所有权利。') }}</p>
      <p>
        {{ $tsl('当前语言') }}: {{ currentLanguage }} | 
        {{ $tsl('加载时间') }}: {{ loadTime }}ms |
        {{ $tsl('缓存命中率') }}: {{ cacheHitRate }}%
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';
import FeatureCard from './components/FeatureCard.vue';
import UserProfile from './components/UserProfile.vue';
import ContactForm from './components/ContactForm.vue';
import DataDisplay from './components/DataDisplay.vue';
import NotificationDemo from './components/NotificationDemo.vue';
import TechFeatures from './components/TechFeatures.vue';

// 使用 i18n
const { locale, isReady } = useI18n();

// 响应式数据
const loadTime = ref(0);
const cacheHitRate = ref(0);

// 计算属性
const currentLanguage = computed(() => {
  const langNames: Record<string, string> = {
    'zh-CN': '中文',
    'en-US': 'English',
    'ja-JP': '日本語'
  };
  return langNames[locale.value] || locale.value;
});

// 组件挂载
onMounted(() => {
  // 模拟加载时间
  loadTime.value = Math.floor(Math.random() * 100) + 50;
  
  // 模拟缓存命中率
  cacheHitRate.value = Math.floor(Math.random() * 20) + 80;
  
  // 定期更新统计信息
  setInterval(() => {
    cacheHitRate.value = Math.floor(Math.random() * 20) + 80;
  }, 5000);
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
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
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
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border: 1px solid #e1e8ed;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
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
