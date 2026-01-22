import React from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 08: 错误处理
 * 测试: 缺失翻译、默认值、DevTools
 */
export default function ErrorHandling() {
  const { t } = useI18n();

  const triggerMissingKey = () => {
    // 触发一个不存在的 key
    const result = t('这个文本不存在于翻译文件中');
    console.log('Missing key result:', result);
  };

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">08</span>
        {t('错误处理')}
      </h3>

      <div className="demo-description">
        <p>{t('演示缺失翻译的处理和 DevTools 功能')}</p>
      </div>

      <div className="demo-content">
        {/* 测试 1: 缺失的翻译 */}
        <div className="test-case">
          <h4>✅ 缺失的翻译</h4>
          <div className="result">
            <code>t('不存在的key')</code>
            <div className="output">
              <p>{t('这个key不存在')}</p>
              <p className="note">{t('返回原始文本作为后备')}</p>
            </div>
          </div>
        </div>

        {/* 测试 2: 使用默认值 */}
        <div className="test-case">
          <h4>✅ 默认值</h4>
          <div className="result">
            <code>t('不存在', {'{}'}, {'{ defaultValue: "默认值" }'})</code>
            <div className="output">
              <p>
                {t('这个也不存在', {}, { defaultValue: '这是默认值' })}
              </p>
            </div>
          </div>
        </div>

        {/* 测试 3: DevTools */}
        <div className="test-case">
          <h4>✅ DevTools</h4>
          <div className="result">
            <div className="output">
              <button onClick={triggerMissingKey} className="devtools-trigger">
                {t('触发缺失 Key')}
              </button>
              <p className="note">
                {t('打开浏览器控制台查看 DevTools 日志')}
              </p>
              {typeof window !== 'undefined' &&
                (window as any).__TRANSLINK_DEVTOOLS__ && (
                  <p className="success">{t('✅ DevTools 已启用')}</p>
                )}
            </div>
          </div>
        </div>

        {/* 测试 4: 安全渲染 */}
        <div className="test-case">
          <h4>✅ 安全渲染</h4>
          <div className="result">
            <div className="output">
              <p>{t('即使翻译缺失，应用也不会崩溃')}</p>
              <p>{t('始终返回可用的文本（原文或默认值）')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
