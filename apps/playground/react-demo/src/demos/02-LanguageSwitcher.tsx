import React from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 02: 语言切换
 * 测试: setLocale(), locale, availableLocales, isLoading
 */
export default function LanguageSwitcher() {
  const { t, locale, setLocale, availableLocales, isLoading } = useI18n();

  const getLanguageName = (langCode: string) => {
    switch (langCode) {
      case 'zh-CN':
        return t('简体中文');
      case 'en-US':
        return t('英语');
      default:
        return langCode;
    }
  };

  const handleLanguageChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLanguage = event.target.value;
    if (newLanguage !== locale) {
      try {
        await setLocale(newLanguage);
        console.log(`✅ Language switched to: ${newLanguage}`);
      } catch (error) {
        console.error('Language switch failed:', error);
      }
    }
  };

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">02</span>
        {t('语言切换')}
      </h3>

      <div className="demo-description">
        <p>{t('演示语言切换功能和状态管理')}</p>
      </div>

      <div className="demo-content">
        {/* 测试 1: 语言选择器 */}
        <div className="test-case">
          <h4>✅ 语言选择</h4>
          <div className="result">
            <code>setLocale(newLanguage)</code>
            <div className="output">
              <select
                value={locale}
                onChange={handleLanguageChange}
                disabled={isLoading}
                className="language-selector"
              >
                {availableLocales.map(lang => (
                  <option key={lang} value={lang}>
                    {getLanguageName(lang)}
                  </option>
                ))}
              </select>
              {isLoading && <span className="loading-indicator"> ⏳ {t('加载中...')}</span>}
            </div>
          </div>
        </div>

        {/* 测试 2: 当前语言状态 */}
        <div className="test-case">
          <h4>✅ 当前语言</h4>
          <div className="result">
            <code>const {'{ locale }'} = useI18n()</code>
            <div className="output">
              {t('当前语言')}: <strong>{getLanguageName(locale)}</strong> ({locale})
            </div>
          </div>
        </div>

        {/* 测试 3: 支持的语言列表 */}
        <div className="test-case">
          <h4>✅ 支持的语言</h4>
          <div className="result">
            <code>const {'{ availableLocales }'} = useI18n()</code>
            <div className="output">
              <ul className="output-list">
                {availableLocales.map(lang => (
                  <li key={lang}>
                    {getLanguageName(lang)} ({lang})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 测试 4: 快速切换按钮 */}
        <div className="test-case">
          <h4>✅ 快速切换</h4>
          <div className="result">
            <div className="output button-group">
              {availableLocales.map(lang => (
                <button
                  key={lang}
                  onClick={() => setLocale(lang)}
                  disabled={locale === lang || isLoading}
                  className={locale === lang ? 'active' : ''}
                >
                  {getLanguageName(lang)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
