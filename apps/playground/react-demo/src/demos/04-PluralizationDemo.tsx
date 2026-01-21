import React, { useState } from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 04: Pluralization
 * Validates: t(key, { count }) with auto pluralization
 */
export default function PluralizationDemo() {
  const { t, locale } = useI18n();
  const [count, setCount] = useState(0);

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">04</span>
        {t('pluralizationTitle')}
      </h3>

      <div className="demo-description">
        <p>{t('pluralizationDesc')}</p>
      </div>

      <div className="demo-content">
        {/* Validation 1: Basic Pluralization */}
        <div className="test-case">
          <h4>✅ t(key, {'{ count }'}) - Auto Pluralization</h4>
          <div className="counter">
            <button onClick={() => setCount(Math.max(0, count - 1))}>-</button>
            <span className="count-display">{count}</span>
            <button onClick={() => setCount(count + 1)}>+</button>
          </div>
          <div className="result">
            <code>t('items', {'{ count }'})</code>
            <div className="output">{t('items', { count })}</div>
          </div>
        </div>

        {/* Validation 2: Different Plural Forms */}
        <div className="test-case">
          <h4>✅ Different Plural Forms</h4>
          <div className="plural-examples">
            {[0, 1, 2, 5, 10, 21, 100].map(num => (
              <div key={num} className="plural-item">
                <strong>{num}:</strong> {t('items', { count: num })}
              </div>
            ))}
          </div>
        </div>

        {/* Validation 3: Language-Specific Rules */}
        <div className="test-case">
          <h4>✅ Language-Specific Rules</h4>
          <div className="result">
            <code>Different languages have different plural rules</code>
            <div className="output">
              <div>
                English (1, other): {t('items', { count: 1 })} /{' '}
                {t('items', { count: 2 })}
              </div>
              <div>
                Chinese (other only):{' '}
                {locale === 'zh-CN'
                  ? t('items', { count: 1 })
                  : 'Switch to Chinese to see'}
              </div>
            </div>
          </div>
        </div>

        {/* Validation 4: Pluralization + Other Parameters */}
        <div className="test-case">
          <h4>✅ Pluralization + Other Parameters</h4>
          <div className="result">
            <code>t('key', {'{ count, user: "Alice" }'})</code>
            <div className="output">
              {t('itemsWithUser', {
                count,
                user: 'Alice',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
