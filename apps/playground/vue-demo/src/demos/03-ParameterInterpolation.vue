<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">03</span>
      {{ t('parameterInterpolationTitle') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('parameterInterpolationDesc') }}</p>
    </div>

    <div class="demo-content">
      <!-- 验证点 1: 基础参数插值 -->
      <div class="test-case">
        <h4>✅ t(key, { param }) - Basic Parameters</h4>
        <div class="result">
          <code>t('greeting', { name: 'Alice' })</code>
          <div class="output">
            {{ t('greeting', { name: 'Alice' }) }}
          </div>
        </div>
      </div>

      <!-- 验证点 2: 多个参数 -->
      <div class="test-case">
        <h4>✅ Multiple Parameters</h4>
        <div class="controls">
          <input v-model="username" placeholder="Enter name" />
          <input v-model.number="age" type="number" placeholder="Enter age" />
        </div>
        <div class="result">
          <code>t('userInfo', { username, age })</code>
          <div class="output">
            {{ t('userInfo', { username, age }) }}
          </div>
        </div>
      </div>

      <!-- 验证点 3: 数字格式化 -->
      <div class="test-case">
        <h4>✅ Number Formatting</h4>
        <div class="result">
          <code>t('numbers', { count: 1234, price: 99.99 })</code>
          <div class="output">
            {{ t('numbers', { count: 1234, price: 99.99 }) }}
          </div>
        </div>
      </div>

      <!-- 验证点 4: 特殊字符转义 -->
      <div class="test-case">
        <h4>✅ Escape Special Characters</h4>
        <div class="result">
          <code>t('escapeHtml', { html: '&lt;script&gt;alert()&lt;/script&gt;' })</code>
          <div class="output">
            {{ t('escapeHtml', { html: '<script>alert()</script>' }) }}
          </div>
        </div>
      </div>
    </div>

    <div class="demo-api">
      <h4>🎯 Runtime API Validated:</h4>
      <ul>
        <li><code>t(key, params)</code> - Parameter interpolation</li>
        <li>Single parameter: <code>{ name }</code></li>
        <li>Multiple parameters: <code>{ name, age }</code></li>
        <li>Number/String handling</li>
        <li>HTML escape by default (secure)</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

/**
 * 场景 03: 参数插值
 *
 * 验证 Runtime API:
 * - t(key, params) 参数插值
 * - 多种参数类型处理
 * - 转义功能
 */
const { t } = useI18n();

const username = ref('John Doe');
const age = ref(28);
</script>

<style scoped>
@import './demo-card-styles.css';

.controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.controls input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.controls input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
</style>
