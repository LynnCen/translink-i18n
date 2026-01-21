import React, { useState } from 'react';
import { useI18n, Translation } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 05: Translation Component
 * Validates: <Translation> component with various props
 */
export default function TranslationComponentDemo() {
  const { t } = useI18n();
  const [count, setCount] = useState(0);

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">05</span>
        {t('translationComponentTitle')}
      </h3>

      <div className="demo-description">
        <p>{t('translationComponentDesc')}</p>
      </div>

      <div className="demo-content">
        {/* Validation 1: Basic Usage */}
        <div className="test-case">
          <h4>✅ &lt;Translation i18nKey="..." /&gt; - Basic Usage</h4>
          <div className="result">
            <code>&lt;Translation i18nKey="translationComponentBasic" /&gt;</code>
            <div className="output">
              <Translation i18nKey="translationComponentBasic" />
            </div>
          </div>
        </div>

        {/* Validation 2: With Parameters */}
        <div className="test-case">
          <h4>
            ✅ &lt;Translation values={'{...}'} /&gt; - With Parameters
          </h4>
          <div className="result">
            <code>
              &lt;Translation i18nKey="translationComponentWithParams"
              values={'{'}
              {'{ name: "Charlie", product: "TransLink" }'} /&gt;
            </code>
            <div className="output">
              <Translation
                i18nKey="translationComponentWithParams"
                values={{ name: 'Charlie', product: 'TransLink' }}
              />
            </div>
          </div>
        </div>

        {/* Validation 3: Pluralization Support */}
        <div className="test-case">
          <h4>✅ &lt;Translation values={'{'}{'{ count }'} /&gt; - Pluralization</h4>
          <div className="counter">
            <button onClick={() => setCount(Math.max(0, count - 1))}>-</button>
            <span className="count-display">{count}</span>
            <button onClick={() => setCount(count + 1)}>+</button>
          </div>
          <div className="result">
            <code>
              &lt;Translation i18nKey="translationComponentItems" values={'{'}
              {'{ count }'} /&gt;
            </code>
            <div className="output">
              <Translation
                i18nKey="translationComponentItems"
                values={{ count }}
              />
            </div>
          </div>
        </div>

        {/* Validation 4: Rich Text with Components */}
        <div className="test-case">
          <h4>✅ &lt;Translation components={'{...}'} /&gt; - Rich Text</h4>
          <div className="result">
            <code>
              &lt;Translation i18nKey="translationComponentRichText"
              components={'{'}
              {'{ bold: <strong /> }'} /&gt;
            </code>
            <div className="output html-content">
              <Translation
                i18nKey="translationComponentRichText"
                components={{ bold: <strong /> }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
