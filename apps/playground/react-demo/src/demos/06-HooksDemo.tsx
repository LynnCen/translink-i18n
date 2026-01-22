import React from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 06: Hooks 示例
 * 测试: useI18n Hook 的所有返回值
 */
export default function HooksDemo() {
  const { t, locale, setLocale, isReady, isLoading } = useI18n();

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">06</span>
        {t('Hooks 示例')}
      </h3>

      <div className="demo-description">
        <p>{t('演示 useI18n Hook 的所有返回值')}</p>
      </div>

      <div className="demo-content">
        {/* 测试 1: useI18n 返回值 */}
        <div className="test-case">
          <h4>✅ useI18n() 返回值</h4>
          <div className="result">
            <code>const {'{ t, locale, setLocale, isReady, isLoading }'} = useI18n()</code>
            <div className="output info-grid">
              <div className="info-item">
                <strong>t:</strong> {t('翻译函数')}
              </div>
              <div className="info-item">
                <strong>locale:</strong> {locale}
              </div>
              <div className="info-item">
                <strong>isReady:</strong> {isReady ? t('已就绪') : t('未就绪')}
              </div>
              <div className="info-item">
                <strong>isLoading:</strong> {isLoading ? t('加载中') : t('未加载')}
              </div>
            </div>
          </div>
        </div>

        {/* 测试 2: setLocale 方法 */}
        <div className="test-case">
          <h4>✅ setLocale 方法</h4>
          <div className="result">
            <code>const {'{ setLocale }'} = useI18n()</code>
            <div className="output">
              <button
                onClick={() => setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN')}
                disabled={isLoading}
              >
                {t('切换语言')}
              </button>
            </div>
          </div>
        </div>

        {/* 测试 3: 响应式更新 */}
        <div className="test-case">
          <h4>✅ 响应式更新</h4>
          <div className="result">
            <div className="output">
              <p>{t('当语言切换时，所有使用 t() 的文本会自动更新')}</p>
              <p>{t('这是 React Hook 的响应式特性')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
