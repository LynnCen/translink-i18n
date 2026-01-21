import { useState, useEffect } from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 09: Performance & Optimization
 * Validates: Caching, lazy loading, batch updates
 */
export default function PerformanceDemo() {
  const { t, locale } = useI18n();
  const [renderCount, setRenderCount] = useState(0);
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  useEffect(() => {
    // Simulate cache stats retrieval
    if (typeof window !== 'undefined') {
      const devTools = (window as any).__TRANSLINK_DEVTOOLS__;
      if (devTools) {
        const stats = devTools.getStats();
        setCacheStats({
          hits: stats.cache?.hits || 0,
          misses: stats.cache?.misses || 0,
        });
      }
    }
  }, [locale]);

  const performBatchTranslations = () => {
    const start = performance.now();
    const keys = Array.from({ length: 100 }, (_, i) => `test.key.${i}`);
    keys.forEach(key => t(key));
    const end = performance.now();
    console.log(`Batch translation took: ${(end - start).toFixed(2)}ms`);
  };

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">09</span>
        {t('performanceTitle')}
      </h3>

      <div className="demo-description">
        <p>{t('performanceDesc')}</p>
      </div>

      <div className="demo-content">
        {/* Validation 1: Render Performance */}
        <div className="test-case">
          <h4>✅ Render Performance</h4>
          <div className="result">
            <code>Component Render Count</code>
            <div className="output">
              Renders: {renderCount}
              <p className="small-text">
                Efficient re-rendering with React hooks
              </p>
            </div>
          </div>
        </div>

        {/* Validation 2: Cache Statistics */}
        <div className="test-case">
          <h4>✅ Cache Statistics</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <strong>{t('performanceCacheHits')}:</strong> {cacheStats.hits}
            </div>
            <div className="stat-card">
              <strong>{t('performanceCacheMisses')}:</strong>{' '}
              {cacheStats.misses}
            </div>
            <div className="stat-card">
              <strong>{t('performanceHitRate')}:</strong>{' '}
              {cacheStats.hits + cacheStats.misses > 0
                ? (
                    (cacheStats.hits /
                      (cacheStats.hits + cacheStats.misses)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </div>
        </div>

        {/* Validation 3: Batch Operations */}
        <div className="test-case">
          <h4>✅ Batch Operations</h4>
          <div className="result">
            <button onClick={performBatchTranslations}>
              {t('performanceBatchTest')}
            </button>
            <p className="small-text">
              Check console for batch translation performance (100 keys)
            </p>
          </div>
        </div>

        {/* Validation 4: Lazy Loading */}
        <div className="test-case">
          <h4>✅ Lazy Loading</h4>
          <div className="result">
            <code>Dynamic Import Support</code>
            <div className="output">
              <div>{t('performanceLazyLoadingEnabled')}</div>
              <p className="small-text">
                Language resources are loaded on-demand when switching
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
