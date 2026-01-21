import React from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 03: Parameter Interpolation
 * Validates: t(key, params) with various data types
 */
export default function ParameterInterpolation() {
  const { t } = useI18n();

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">03</span>
        {t('parameterInterpolationTitle')}
      </h3>

      <div className="demo-description">
        <p>{t('parameterInterpolationDesc')}</p>
      </div>

      <div className="demo-content">
        {/* Validation 1: Basic String Interpolation */}
        <div className="test-case">
          <h4>✅ t(key, {'{ name: "..." }'}) - Basic String Interpolation</h4>
          <div className="result">
            <code>t('greeting', {'{ name: "Alice" }'})</code>
            <div className="output">{t('greeting', { name: 'Alice' })}</div>
          </div>
        </div>

        {/* Validation 2: Number & Date Interpolation */}
        <div className="test-case">
          <h4>✅ Number & Date Interpolation</h4>
          <div className="result">
            <code>t('userInfo', {'{ age: 30, date: new Date() }'})</code>
            <div className="output">
              {t('userInfo', { age: 30, date: new Date().toLocaleDateString() })}
            </div>
          </div>
        </div>

        {/* Validation 3: HTML Escaping */}
        <div className="test-case">
          <h4>✅ HTML Escaping (Default)</h4>
          <div className="result">
            <code>
              t('escapeHtml', {'{ tag: "<strong>important</strong>" }'})
            </code>
            <div className="output">
              {t('escapeHtml', { tag: '<strong>important</strong>' })}
            </div>
          </div>
        </div>

        {/* Validation 4: Custom Formatters */}
        <div className="test-case">
          <h4>✅ Custom Formatters</h4>
          <div className="result">
            <code>t('numbers', {'{ value: 12345.67, currency: "USD" }'})</code>
            <div className="output">
              {t('numbers', { value: 12345.67, currency: 'USD' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
