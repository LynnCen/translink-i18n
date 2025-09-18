/**
 * React 使用示例
 */

import React, { useState } from 'react';
import { 
  I18nProvider, 
  useTranslation, 
  useI18n, 
  Translation,
  withTranslation 
} from '../react.js';
import { I18nEngine } from '../core/i18n-engine.js';

// 创建 i18n 引擎
const engine = new I18nEngine({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  loadPath: './locales/{{lng}}.json',
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000,
    storage: 'localStorage'
  },
  debug: true
});

// 语言切换组件
function LanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useI18n();
  
  return (
    <div>
      <label>选择语言: </label>
      <select 
        value={locale} 
        onChange={(e) => setLocale(e.target.value)}
      >
        {availableLocales.map(lang => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
}

// 使用 useTranslation Hook 的组件
function WelcomeComponent() {
  const { t } = useTranslation();
  const [userName, setUserName] = useState('React 用户');
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('greeting', { name: userName })}</p>
      
      <div>
        <input 
          type="text" 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder={t('user.profile')}
        />
      </div>
      
      {/* 使用 Translation 组件 */}
      <Translation 
        i18nKey="itemCount"
        values={{ count: 10 }}
      />
      
      {/* 使用 Translation 组件和 render prop */}
      <Translation i18nKey="user.settings">
        {(translation) => <button>{translation}</button>}
      </Translation>
      
      {/* 使用组件插值 */}
      <Translation 
        i18nKey="richText"
        values={{ name: userName }}
        components={{
          Link: ({ children }) => <a href="#" style={{ color: 'blue' }}>{children}</a>,
          Bold: ({ children }) => <strong>{children}</strong>
        }}
      />
    </div>
  );
}

// 使用 HOC 的组件
interface MyComponentProps {
  title: string;
  t: (key: string, params?: any) => string;
  i18n: any;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, t, i18n }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{t('welcome')}</p>
      <p>Current language: {i18n.locale}</p>
    </div>
  );
};

const EnhancedComponent = withTranslation(MyComponent);

// 主应用组件
function App() {
  return (
    <I18nProvider 
      i18n={engine}
      fallback={<div>Loading translations...</div>}
      errorFallback={({ error, retry }) => (
        <div>
          <p>Error loading translations: {error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
    >
      <div style={{ padding: '20px' }}>
        <LanguageSwitcher />
        <WelcomeComponent />
        <EnhancedComponent title="HOC Example" />
      </div>
    </I18nProvider>
  );
}

export { App, engine };
