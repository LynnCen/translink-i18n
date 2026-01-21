import React from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 06: React Hooks
 * Validates: useI18n() hook
 */
export default function HooksDemo() {
  const { t, locale, setLocale, isReady, isLoading } = useI18n();

  const toggleLanguage = async () => {
    const newLang = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
    await setLocale(newLang);
  };

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">06</span>
        {t('hooksTitle')}
      </h3>

      <div className="demo-description">
        <p>{t('hooksDesc')}</p>
      </div>

      <div className="demo-content">
        {/* Validation 1: useI18n Hook - Get All Features */}
        <div className="test-case">
          <h4>✅ useI18n() - Get All I18n Features</h4>
          <div className="result">
            <code>const {'{ t, locale, setLocale, isReady, isLoading }'} = useI18n()</code>
            <div className="output">
              <div>Translation: {t('hooksUseTranslation')}</div>
              <div>Current Locale: {locale}</div>
              <div>Is Ready: {String(isReady)}</div>
              <div>Is Loading: {String(isLoading)}</div>
            </div>
          </div>
        </div>

        {/* Validation 2: useI18n Hook - Change Language */}
        <div className="test-case">
          <h4>✅ useI18n() - Change Language</h4>
          <div className="result">
            <code>const {'{ setLocale }'} = useI18n()</code>
            <div className="output">
              <button onClick={toggleLanguage}>
                {t('hooksToggleLanguage')} (Current: {locale})
              </button>
              <p className="small-text">
                (Using setLocale() from useI18n hook)
              </p>
            </div>
          </div>
        </div>

        {/* Validation 3: Best Practice - One Hook for Everything */}
        <div className="test-case">
          <h4>✅ Best Practice - Use One Hook</h4>
          <div className="result">
            <code>
              // ✅ Recommended: Get everything from useI18n
              <br />
              const {'{ t, locale, setLocale }'} = useI18n();
            </code>
            <div className="output">
              {t('hooksCombinedUsage', { locale })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
