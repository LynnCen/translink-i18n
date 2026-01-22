import React, { useState, useEffect } from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 09: 性能测试
 * 测试: 缓存、大量翻译调用
 */
export default function PerformanceDemo() {
  const { t, locale } = useI18n();
  const [renderCount, setRenderCount] = useState(0);
  const [translationTime, setTranslationTime] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  const measureTranslationPerformance = () => {
    const iterations = 1000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      t('性能测试文本');
      t('另一个测试文本');
      t('第三个测试文本');
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    setTranslationTime(duration);

    console.log(`${iterations * 3} translations in ${duration.toFixed(2)}ms`);
    console.log(`Average: ${(duration / (iterations * 3)).toFixed(4)}ms per translation`);
  };

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">09</span>
        {t('性能测试')}
      </h3>

      <div className="demo-description">
        <p>{t('演示翻译缓存和性能优化')}</p>
      </div>

      <div className="demo-content">
        {/* 测试 1: 渲染统计 */}
        <div className="test-case">
          <h4>✅ 渲染统计</h4>
          <div className="result">
            <div className="output">
              <p>{t('组件渲染次数')}: <strong>{renderCount}</strong></p>
              <p>{t('当前语言')}: <strong>{locale}</strong></p>
            </div>
          </div>
        </div>

        {/* 测试 2: 翻译性能 */}
        <div className="test-case">
          <h4>✅ 翻译性能</h4>
          <div className="result">
            <div className="output">
              <button onClick={measureTranslationPerformance}>
                {t('运行性能测试')}
              </button>
              {translationTime > 0 && (
                <div className="perf-results">
                  <p>{t('3000 次翻译调用')}: {translationTime.toFixed(2)}ms</p>
                  <p>{t('平均每次')}: {(translationTime / 3000).toFixed(4)}ms</p>
                  <p className="note">{t('得益于缓存机制，性能非常快')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 测试 3: 缓存命中率 */}
        <div className="test-case">
          <h4>✅ 缓存机制</h4>
          <div className="result">
            <div className="output">
              <p>{t('✅ 翻译结果会被自动缓存')}</p>
              <p>{t('✅ 相同的翻译只计算一次')}</p>
              <p>{t('✅ 语言切换时缓存会更新')}</p>
            </div>
          </div>
        </div>

        {/* 测试 4: 大量翻译 */}
        <div className="test-case">
          <h4>✅ 大量翻译</h4>
          <div className="result">
            <div className="output">
              <div className="translation-list">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="translation-item">
                    {t('列表项')} {i + 1}
                  </div>
                ))}
              </div>
              <p className="note">{t('20 个翻译调用，渲染流畅')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
