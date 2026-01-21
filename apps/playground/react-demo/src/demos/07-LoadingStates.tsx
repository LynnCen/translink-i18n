import React, { useState } from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 07: Loading States
 * Validates: isReady, isLoading states
 */
export default function LoadingStates() {
  const { t, isReady, isLoading, setLocale, locale } = useI18n();
  const [simulating, setSimulating] = useState(false);

  const simulateLoading = async () => {
    setSimulating(true);
    const targetLang = locale === 'zh-CN' ? 'en-US' : 'zh-CN';

    try {
      await setLocale(targetLang);
      console.log(`Simulated language switch to: ${targetLang}`);
    } catch (error) {
      console.error('Simulated loading failed:', error);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">07</span>
        {t('loadingStatesTitle')}
      </h3>

      <div className="demo-description">
        <p>{t('loadingStatesDesc')}</p>
      </div>

      <div className="demo-content">
        {/* Validation 1: isReady Status */}
        <div className="test-case">
          <h4>✅ isReady - I18n Engine Initialization Status</h4>
          <div className="result">
            <code>isReady</code>
            <div className="output">
              Status:{' '}
              <span className={isReady ? 'status-ready' : 'status-loading'}>
                {isReady
                  ? t('loadingStatesReady')
                  : t('loadingStatesInitializing')}
              </span>
            </div>
          </div>
        </div>

        {/* Validation 2: isLoading Status */}
        <div className="test-case">
          <h4>✅ isLoading - Language Resource Loading Status</h4>
          <div className="result">
            <code>isLoading</code>
            <div className="output">
              Status:{' '}
              <span className={isLoading ? 'status-loading' : 'status-ready'}>
                {isLoading
                  ? t('loadingStatesSwitching')
                  : t('loadingStatesIdle')}
              </span>
            </div>
          </div>
        </div>

        {/* Validation 3: Simulate Loading */}
        <div className="test-case">
          <h4>✅ Simulate Loading</h4>
          <div className="result">
            <button onClick={simulateLoading} disabled={isLoading}>
              {isLoading
                ? t('loadingStatesSimulating')
                : t('loadingStatesSimulate')}
            </button>
            {simulating && (
              <p className="loading-message">
                {t('loadingStatesSimulatingMessage')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
