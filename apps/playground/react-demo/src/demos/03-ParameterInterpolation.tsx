import React, { useState } from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import './demo-card-styles.css';

/**
 * Scene 03: 参数插值
 * 测试: t() 函数的参数插值功能
 */
export default function ParameterInterpolation() {
  const { t } = useI18n();
  const [userName, setUserName] = useState('张三');
  const [itemCount, setItemCount] = useState(5);

  return (
    <div className="demo-card">
      <h3 className="demo-title">
        <span className="demo-number">03</span>
        {t('参数插值')}
      </h3>

      <div className="demo-description">
        <p>{t('演示如何在翻译文本中使用动态参数')}</p>
      </div>

      <div className="demo-content">
        {/* 测试 1: 单个参数 */}
        <div className="test-case">
          <h4>✅ 单个参数插值</h4>
          <div className="result">
            {/* <code>t('你好，{'{{name}}'}！', {'{ name }'})}</code> */}
            <div className="output">
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="输入名字"
              />
              <p>{t('你好，{{name}}！', { name: userName })}</p>
            </div>
          </div>
        </div>

        {/* 测试 2: 多个参数 */}
        <div className="test-case">
          <h4>✅ 多个参数插值</h4>
          <div className="result">
            <code>t('{'{{name}}'} 有 {'{{count}}'} 个项目', {'{ name, count }'})</code>
            <div className="output">
              <label>
                数量:
                <input
                  type="number"
                  value={itemCount}
                  onChange={e => setItemCount(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </label>
              <p>{t('{{name}} 有 {{count}} 个项目', { name: userName, count: itemCount })}</p>
            </div>
          </div>
        </div>

        {/* 测试 3: 数字格式化 */}
        <div className="test-case">
          <h4>✅ 数字显示</h4>
          <div className="result">
            <code>t('价格：${'{{price}}'}', {'{ price }'})</code>
            <div className="output">
              <p>{t('价格：${{price}}', { price: 99.99 })}</p>
              <p>{t('总计：¥{{amount}}', { amount: 1234.56 })}</p>
            </div>
          </div>
        </div>

        {/* 测试 4: HTML 转义 */}
        <div className="test-case">
          <h4>✅ HTML 转义（安全）</h4>
          <div className="result">
            <code>t('输入：{'{{input}}'}', {'{ input: "<script>" }'})</code>
            <div className="output">
              <p>{t('输入：{{input}}', { input: '<script>alert("xss")</script>' })}</p>
              <small className="note">{t('特殊字符已自动转义')}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
