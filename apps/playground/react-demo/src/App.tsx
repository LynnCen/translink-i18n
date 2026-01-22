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
  { id: '01', name: '基础翻译', icon: '📝', component: BasicTranslation },
  { id: '02', name: '语言切换', icon: '🌐', component: LanguageSwitcher },
  { id: '03', name: '参数插值', icon: '🔤', component: ParameterInterpolation },
  { id: '04', name: '条件渲染', icon: '🔢', component: PluralizationDemo },
  { id: '05', name: '组件化使用', icon: '🧩', component: TranslationComponentDemo },
  { id: '06', name: 'Hooks 示例', icon: '🪝', component: HooksDemo },
  { id: '07', name: '加载状态', icon: '⏳', component: LoadingStates },
  { id: '08', name: '错误处理', icon: '🚨', component: ErrorHandling },
  { id: '09', name: '性能测试', icon: '⚡', component: PerformanceDemo },
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
  const { t, locale, setLocale, isReady, availableLocales ,engine} = useI18n();

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

  console.log('基础翻译', t('基础翻译'));
  console.log('engine', engine);


  // 显示加载状态
  if (!isReady) {
    return (
      <div className="loading-screen">
        <div className="spinner-large" />
        <p>{t('加载翻译资源...')}</p>
      </div>
    );
  }

  return (
    <div id="app">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>{t('TransLink React Demo')}</h1>
          <span className="version">v1.0</span>
        </div>
        <div className="nav-info">
          <span className="locale-info">
            {t('当前语言')}: {locale}
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>{t('演示场景')}</h3>
          </div>
          <nav className="scene-nav">
            {scenes.map(scene => (
              <button
                key={scene.id}
                className={`scene-btn ${currentScene === scene.id ? 'active' : ''}`}
                onClick={() => setCurrentScene(scene.id)}
              >
                <span className="scene-number">{scene.id}</span>
                <span className="scene-name">{t(scene.name)}</span>
                <span className="scene-icon">{scene.icon}</span>
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="sidebar-actions">
            <h4>{t('快速操作')}</h4>
            <button onClick={switchLanguage} className="action-btn">
              🌐 {t('切换语言')}
            </button>
            <button onClick={openDevTools} className="action-btn">
              🛠️ {t('打开开发工具')}
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
            <p>{t('TransLink 国际化解决方案 - React 演示')}</p>
            <div className="footer-stats">
              <span>
                {t('语言')}: {locale}
              </span>
              <span>•</span>
              <span>
                {t('场景')}: {currentScene}
              </span>
              <span>•</span>
              {devToolsAvailable && (
                <span>
                  {t('开发工具')}: {t('已启用')}
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
