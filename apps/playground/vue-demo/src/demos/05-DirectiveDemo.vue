<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">05</span>
      {{ t('directiveTitle') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('directiveDesc') }}</p>
    </div>

    <div class="demo-content">
      <!-- 验证点 1: 基础 v-t 指令 -->
      <div class="test-case">
        <h4>✅ v-t="'key'" - Basic Directive</h4>
        <div class="result">
          <code>v-t="'directiveBasic'"</code>
          <div class="output">
            <p v-t="'directiveBasic'" />
          </div>
        </div>
      </div>

      <!-- 验证点 2: 带参数的指令 -->
      <div class="test-case">
        <h4>✅ v-t with Parameters</h4>
        <div class="result">
          <code>v-t="{ key: 'directiveWithParams', params: { name: 'Bob' } }"</code>
          <div class="output">
            <p
              v-t="{
                key: 'directiveWithParams',
                params: { name: 'Bob', time: '10:30' },
              }"
            />
          </div>
        </div>
      </div>

      <!-- 验证点 3: HTML 模式 -->
      <div class="test-case">
        <h4>✅ v-t.html - HTML Mode</h4>
        <div class="result">
          <code>v-t.html="'directiveHtml'"</code>
          <div class="output html-content">
            <div v-t.html="'directiveHtml'" />
          </div>
        </div>
      </div>

      <!-- 验证点 4: 动态键名 -->
      <div class="test-case">
        <h4>✅ Dynamic Key</h4>
        <div class="controls">
          <select v-model="selectedKey">
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
        </div>
        <div class="result">
          <code>v-t="`directive${selectedKey}`"</code>
          <div class="output">
            <p v-t="`directive${selectedKey}`" />
          </div>
        </div>
      </div>

      <!-- 验证点 5: 响应式更新 -->
      <div class="test-case">
        <h4>✅ Reactive Update on Language Change</h4>
        <div class="result">
          <div class="output info">
            <p>{{ t('directiveReactiveHint') }}</p>
            <p v-t="'directiveBasic'" class="reactive-text" />
          </div>
        </div>
      </div>
    </div>

    <div class="demo-api">
      <h4>🎯 Runtime API Validated:</h4>
      <ul>
        <li><code>v-t="'key'"</code> - Basic directive</li>
        <li><code>v-t="{ key, params }"</code> - With parameters</li>
        <li><code>v-t.html</code> - HTML mode (render HTML)</li>
        <li>Auto-updates on language change</li>
        <li>Dynamic key support</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

/**
 * 场景 05: v-t 指令
 *
 * 验证 Runtime API:
 * - v-t 指令基本用法
 * - 参数支持
 * - HTML 模式
 * - 响应式更新
 */
const { t } = useI18n();

const selectedKey = ref('Morning');
</script>

<style scoped>
@import './demo-card-styles.css';

.controls select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
}

.controls select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.html-content {
  background: #fff3cd;
  border-color: #ffc107;
}

.html-content :deep(strong) {
  color: #ff6b6b;
  font-weight: 600;
}

.html-content :deep(em) {
  color: #667eea;
  font-style: italic;
}

.output.info {
  background: #e8f5e9;
  border-color: #81c784;
}

.reactive-text {
  font-weight: 600;
  color: #2e7d32;
  margin: 0.5rem 0 0 0;
}
</style>
