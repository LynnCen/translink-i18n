import { useState } from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import { Provider } from './i18n';
import './App.css';

// Import demo components
import BasicTranslation from './demos/01-BasicTranslation';
import LanguageSwitcher from './demos/02-LanguageSwitcher';
import ParameterInterpolation from './demos/03-ParameterInterpolation';
import PluralizationDemo from './demos/04-PluralizationDemo';
import TranslationComponentDemo from './demos/05-TranslationComponent';
import HooksDemo from './demos/06-HooksDemo';
import LoadingStates from './demos/07-LoadingStates';
import ErrorHandling from './demos/08-ErrorHandling';
import PerformanceDemo from './demos/09-PerformanceDemo';

// Scene configuration
const scenes = [
  { id: '01', nameKey: 'sceneBasicTranslation', icon: '📝', component: BasicTranslation },
  { id: '02', nameKey: 'sceneLanguageSwitcher', icon: '🌐', component: LanguageSwitcher },
  { id: '03', nameKey: 'sceneParameterInterpolation', icon: '🔤', component: ParameterInterpolation },
  { id: '04', nameKey: 'scenePluralization', icon: '🔢', component: PluralizationDemo },
  { id: '05', nameKey: 'sceneTranslationComponent', icon: '🧩', component: TranslationComponentDemo },
  { id: '06', nameKey: 'sceneHooks', icon: '🪝', component: HooksDemo },
  { id: '07', nameKey: 'sceneLoadingStates', icon: '⏳', component: LoadingStates },
  { id: '08', nameKey: 'sceneErrorHandling', icon: '🚨', component: ErrorHandling },
  { id: '09', nameKey: 'scenePerformance', icon: '⚡', component: PerformanceDemo },
];

/**
 * 主要内容组件
 *
 * ✅ 最佳实践：使用 useI18n() 获取所有 i18n 功能
 *
 * useI18n 返回：
 * - t: 翻译函数
 * - locale: 当前语言
 * - setLocale: 切换语言
 * - isReady: 初始化状态
 * - isLoading: 加载状态
 * - error: 错误信息
 */
function AppContent() {
  // ✅ 使用 useI18n 获取所有功能（推荐）
  const { t, locale, setLocale, isReady } = useI18n();
  console.log('t', t);
  console.log('locale', locale);
  console.log('setLocale', setLocale);
  console.log('isReady', isReady);

  const [currentScene, setCurrentScene] = useState('01');
  const [devToolsAvailable] = useState(
    typeof window !== 'undefined' && !!(window as any).__TRANSLINK_DEVTOOLS__
  );

  const CurrentComponent = scenes.find(s => s.id === currentScene)?.component;

  const switchLanguage = async () => {
    const newLang = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
    await setLocale(newLang);
  };

  const openDevTools = () => {
    if (typeof window !== 'undefined' && (window as any).__TRANSLINK_DEVTOOLS__) {
      (window as any).__TRANSLINK_DEVTOOLS__.help();
    } else {
      console.warn('DevTools not available');
    }
  };

  // 显示加载状态
  if (!isReady) {
    return (
      <div className="loading-screen">
        <div className="spinner-large" />
        <p>Loading translations...</p>
      </div>
    );
  }

  return (
    <div id="app">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>{t('appTitle')}</h1>
          <span className="version">v1.0</span>
        </div>
        <div className="nav-info">
          <span className="locale-info">
            {t('currentLocale')}: {locale}
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>{t('demoScenes')}</h3>
          </div>
          <nav className="scene-nav">
            {scenes.map(scene => (
              <button
                key={scene.id}
                className={`scene-btn ${currentScene === scene.id ? 'active' : ''}`}
                onClick={() => setCurrentScene(scene.id)}
              >
                <span className="scene-number">{scene.id}</span>
                <span className="scene-name">{t(scene.nameKey)}</span>
                <span className="scene-icon">{scene.icon}</span>
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="sidebar-actions">
            <h4>{t('quickActions')}</h4>
            <button onClick={switchLanguage} className="action-btn">
              🌐 {t('toggleLanguage')}
            </button>
            <button onClick={openDevTools} className="action-btn">
              🛠️ {t('openDevTools')}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          <div className="scene-container">
            {CurrentComponent && <CurrentComponent />}
          </div>

          {/* Footer Info */}
          <footer className="footer">
            <p>{t('footerInfo')}</p>
            <div className="footer-stats">
              <span>
                {t('footerLocale')}: {locale}
              </span>
              <span>•</span>
              <span>
                {t('footerScene')}: {currentScene}
              </span>
              <span>•</span>
              {devToolsAvailable && (
                <span>
                  {t('footerDevtools')}: {t('footerEnabled')}
                </span>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

/**
 * 根组件
 *
 * ✅ 最佳实践：使用 createI18n 创建的 Provider
 *
 * Provider 会自动处理：
 * - 引擎初始化
 * - 错误处理
 * - 加载状态
 */
function App() {
  return (
    <Provider>
      <AppContent />
    </Provider>
  );
}

export default App;
