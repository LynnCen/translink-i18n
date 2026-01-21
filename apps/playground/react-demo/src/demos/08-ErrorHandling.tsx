import React, { useState } from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 08: Error Handling
 * Validates: Error boundaries, fallback handling, missing keys
 */
export default function ErrorHandling() {
  const { t } = useI18n();
  const [missingKeysLog, setMissingKeysLog] = useState<string[]>([]);

  const triggerMissingKey = () => {
    const missingKey = `missing.key.${Date.now()}`;
    const result = t(missingKey);
    setMissingKeysLog(prev => [...prev.slice(-4), `${missingKey} → ${result}`]);
  };

  const clearLog = () => {
    setMissingKeysLog([]);
  };

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">08</span>
        {t('errorHandlingTitle')}
      </h3>

      <div className="demo-description">
        <p>{t('errorHandlingDesc')}</p>
      </div>

      <div className="demo-content">
        {/* Validation 1: Missing Translation Keys */}
        <div className="test-case">
          <h4>✅ Missing Translation Keys</h4>
          <div className="result">
            <code>t('nonexistent.key')</code>
            <div className="output">{t('nonexistent.key')}</div>
            <p className="small-text">
              Returns the key itself when translation is missing
            </p>
          </div>
        </div>

        {/* Validation 2: Default Value Fallback */}
        <div className="test-case">
          <h4>✅ Default Value Fallback</h4>
          <div className="result">
            <code>
              t('missing.key', {'{}'}, {'{ defaultValue: "Fallback" }'})
            </code>
            <div className="output">
              {t('missing.key', {}, { defaultValue: 'Fallback Text' })}
            </div>
          </div>
        </div>

        {/* Validation 3: Interactive Missing Keys Test */}
        <div className="test-case">
          <h4>✅ Interactive Missing Keys Test</h4>
          <div className="result">
            <div className="button-group">
              <button onClick={triggerMissingKey}>
                {t('errorHandlingTriggerMissing')}
              </button>
              <button onClick={clearLog}>{t('errorHandlingClearLog')}</button>
            </div>
            {missingKeysLog.length > 0 && (
              <div className="log-output">
                <strong>Missing Keys Log:</strong>
                {missingKeysLog.map((log, index) => (
                  <div key={index} className="log-entry">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Validation 4: DevTools Integration */}
        <div className="test-case">
          <h4>✅ DevTools Integration</h4>
          <div className="result">
            <code>window.__TRANSLINK_DEVTOOLS__</code>
            <div className="output">
              {typeof window !== 'undefined' &&
              (window as any).__TRANSLINK_DEVTOOLS__
                ? t('errorHandlingDevtoolsAvailable')
                : t('errorHandlingDevtoolsNotAvailable')}
            </div>
            <p className="small-text">
              Open browser console to check DevTools for tracked missing keys
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
