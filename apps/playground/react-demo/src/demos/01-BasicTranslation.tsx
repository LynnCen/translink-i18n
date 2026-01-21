import React from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 01: Basic Translation
 * Validates: t() function, nested keys, array access, default values
 */
export default function BasicTranslation() {
  const { t } = useI18n();

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">01</span>
        {t('basicTranslationTitle')}
      </h3>

      <div className="demo-description">
        <p>{t('basicTranslationDesc')}</p>
      </div>

      <div className="demo-content">
        {/* Validation 1: Basic Translation */}
        <div className="test-case">
          <h4>✅ t('key') - Basic Translation</h4>
          <div className="result">
            <code>t('hello')</code>
            <div className="output">{t('hello')}</div>
          </div>
        </div>

        {/* Validation 2: Nested Keys (for demonstration) */}
        <div className="test-case">
          <h4>✅ Nested Keys (for demonstration)</h4>
          <div className="result">
            <code>t('nested.level1.level2')</code>
            <div className="output">{t('nested.level1.level2')}</div>
          </div>
        </div>

        {/* Validation 3: Array Access (for demonstration) */}
        <div className="test-case">
          <h4>✅ Array Items (for demonstration)</h4>
          <div className="result">
            <code>t('items[0]')</code>
            <ul className="output-list">
              {[0, 1, 2].map(i => (
                <li key={i}>{t(`items[${i}]`)}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Validation 4: Default Value (Fallback) */}
        <div className="test-case">
          <h4>✅ Default Value (Fallback)</h4>
          <div className="result">
            <code>
              t('nonexistentKey', {'{}'}, {'{ defaultValue: "Fallback Text" }'})
            </code>
            <div className="output">
              {t('nonexistentKey', {}, { defaultValue: 'Fallback Text' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
