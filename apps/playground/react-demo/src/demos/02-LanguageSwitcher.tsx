import React from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 02: Language Switcher
 * Validates: setLocale(), locale, availableLocales, isLoading
 */
export default function LanguageSwitcher() {
  const { t, locale, setLocale, availableLocales, isLoading } = useI18n();

  const getLanguageName = (langCode: string) => {
    switch (langCode) {
      case 'zh-CN':
        return t('languageChinese');
      case 'en-US':
        return t('languageEnglish');
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
        {t('languageSwitcherTitle')}
      </h3>

      <div className="demo-description">
        <p>{t('languageSwitcherDesc')}</p>
      </div>

      <div className="demo-content">
        {/* Validation 1: Language Selector */}
        <div className="test-case">
          <h4>✅ setLocale(lang) - Language Selector</h4>
          <div className="language-selector">
            <label htmlFor="language-select">{t('selectLanguage')}:</label>
            <select
              id="language-select"
              value={locale}
              disabled={isLoading}
              className="language-select"
              onChange={handleLanguageChange}
            >
              {availableLocales.map(lang => (
                <option key={lang} value={lang}>
                  {getLanguageName(lang)}
                </option>
              ))}
            </select>

            {isLoading && (
              <div className="loading-indicator">
                <span className="spinner" />
                {t('switchingLanguage')}
              </div>
            )}
          </div>
        </div>

        {/* Validation 2: Current Language */}
        <div className="test-case">
          <h4>✅ locale - Current Language</h4>
          <div className="result">
            <code>locale</code>
            <div className="output">Current Language: {locale}</div>
          </div>
        </div>

        {/* Validation 3: Available Languages */}
        <div className="test-case">
          <h4>✅ availableLocales - Supported Languages</h4>
          <div className="result">
            <code>availableLocales</code>
            <div className="output">
              Supported: {availableLocales.join(', ')}
            </div>
          </div>
        </div>

        {/* Validation 4: Loading State */}
        <div className="test-case">
          <h4>✅ isLoading - Language Loading State</h4>
          <div className="result">
            <code>isLoading</code>
            <div className="output">Is Loading: {String(isLoading)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
