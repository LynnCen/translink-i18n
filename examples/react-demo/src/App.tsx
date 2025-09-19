import React, { useState, useEffect } from 'react';
import { I18nProvider } from '@translink/i18n-runtime/react';
import { I18nEngine } from '@translink/i18n-runtime';
import Header from './components/Header';
import FeatureShowcase from './components/FeatureShowcase';
import InteractiveDemo from './components/InteractiveDemo';
import TechSpecs from './components/TechSpecs';
import Footer from './components/Footer';
import './App.css';

// 创建 i18n 引擎
const i18nEngine = new I18nEngine({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US', 'ja-JP'],
  loadPath: './src/locales/{{lng}}.json',
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000,
    storage: 'localStorage'
  },
  debug: true
});

function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 初始化 i18n 引擎
    i18nEngine.init()
      .then(() => {
        setIsReady(true);
      })
      .catch((err) => {
        console.error('Failed to initialize i18n:', err);
        setError($tsl('国际化系统初始化失败'));
      });
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <h1>❌ {error}</h1>
        <p>{$tsl('请刷新页面重试')}</p>
        <button onClick={() => window.location.reload()}>
          {$tsl('刷新页面')}
        </button>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>{$tsl('正在加载国际化资源...')}</h2>
        <p>{$tsl('请稍候，系统正在初始化多语言支持。')}</p>
      </div>
    );
  }

  return (
    <I18nProvider 
      i18n={i18nEngine}
      fallback={
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{$tsl('加载中...')}</p>
        </div>
      }
      errorFallback={({ error, retry }) => (
        <div className="error-container">
          <h2>❌ {$tsl('翻译加载失败')}</h2>
          <p>{error.message}</p>
          <button onClick={retry}>{$tsl('重试')}</button>
        </div>
      )}
    >
      <div className="app">
        <Header />
        
        <main className="main-content">
          {/* 欢迎区域 */}
          <section className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">
                {$tsl('欢迎使用 TransLink I18n')}
              </h1>
              <p className="hero-subtitle">
                {$tsl('现代化的国际化解决方案，支持 React、Vue 和原生 JavaScript')}
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary">
                  {$tsl('开始使用')}
                </button>
                <button className="btn btn-secondary">
                  {$tsl('查看文档')}
                </button>
              </div>
            </div>
          </section>

          {/* 功能展示 */}
          <FeatureShowcase />

          {/* 交互演示 */}
          <InteractiveDemo />

          {/* 技术规格 */}
          <TechSpecs />
        </main>

        <Footer />
      </div>
    </I18nProvider>
  );
}

export default App;
