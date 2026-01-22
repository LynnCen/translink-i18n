import React from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 01: 基础翻译
 * 测试: t() 函数基本用法、默认值
 */
export default function BasicTranslation() {
  const { t } = useI18n();

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">01</span>
        {t('基础翻译')}
      </h3>

      <div className="demo-description">
        <p>{t('演示 t() 函数的基本用法和默认值功能')}</p>
      </div>

      <div className="demo-content">
        {/* 测试 1: 基础翻译 */}
        <div className="test-case">
          <h4>✅ 基础翻译</h4>
          <div className="result">
            <code>t('你好，世界！')</code>
            <div className="output">{t('你好，世界！')}</div>
          </div>
        </div>

        {/* 测试 2: 长文本 */}
        <div className="test-case">
          <h4>✅ 长文本翻译</h4>
          <div className="result">
            <code>t('欢迎使用 TransLink...')</code>
            <div className="output">{t('欢迎使用 TransLink 国际化解决方案')}</div>
          </div>
        </div>

        {/* 测试 3: 默认值（回退） */}
        <div className="test-case">
          <h4>✅ 默认值（Fallback）</h4>
          <div className="result">
            <code>
              t('不存在的文本', {'{}'}, {'{ defaultValue: "默认值" }'})
            </code>
            <div className="output">
              {t('不存在的文本', {}, { defaultValue: '默认值' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
