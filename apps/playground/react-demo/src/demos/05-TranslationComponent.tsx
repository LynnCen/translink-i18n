import React from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 05: 组件化使用
 * 测试: 在不同组件中使用 useI18n
 */

// 子组件 1
function ChildComponent1() {
  const { t } = useI18n();
  return (
    <div className="child-component">
      <h5>{t('子组件 1')}</h5>
      <p>{t('这是第一个子组件')}</p>
    </div>
  );
}

// 子组件 2
function ChildComponent2() {
  const { t, locale } = useI18n();
  return (
    <div className="child-component">
      <h5>{t('子组件 2')}</h5>
      <p>{t('当前语言')}: {locale}</p>
    </div>
  );
}

// 子组件 3（嵌套）
function NestedComponent() {
  const { t } = useI18n();
  return (
    <div className="nested-component">
      <p>{t('这是一个嵌套的组件')}</p>
    </div>
  );
}

function ChildComponent3() {
  const { t } = useI18n();
  return (
    <div className="child-component">
      <h5>{t('子组件 3（嵌套）')}</h5>
      <NestedComponent />
    </div>
  );
}

export default function TranslationComponent() {
  const { t } = useI18n();

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">05</span>
        {t('组件化使用')}
      </h3>

      <div className="demo-description">
        <p>{t('演示在多个组件中使用 useI18n Hook')}</p>
      </div>

      <div className="demo-content">
        {/* 测试 1: 多个子组件 */}
        <div className="test-case">
          <h4>✅ 多个子组件</h4>
          <div className="result">
            <code>每个组件独立调用 useI18n()</code>
            <div className="output components-grid">
              <ChildComponent1 />
              <ChildComponent2 />
              <ChildComponent3 />
            </div>
          </div>
        </div>

        {/* 测试 2: 共享状态 */}
        <div className="test-case">
          <h4>✅ 共享翻译状态</h4>
          <div className="result">
            <div className="output">
              <p>{t('所有组件共享同一个翻译引擎实例')}</p>
              <p>{t('语言切换会自动更新所有组件')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
