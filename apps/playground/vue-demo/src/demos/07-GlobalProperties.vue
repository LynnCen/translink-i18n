<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">07</span>
      {{ t('globalPropertiesTitle') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('globalPropertiesDesc') }}</p>
    </div>

    <div class="demo-content">
      <!-- 验证点 1: $t 全局翻译函数 -->
      <div class="test-case">
        <h4>✅ $t(key) - Global Translation Function</h4>
        <div class="result">
          <code>${{ '{' }} $t('globalPropertiesTestKey') {{ '}' }}</code>
          <div class="output">
            {{ $t('globalPropertiesTestKey') }}
          </div>
        </div>
      </div>

      <!-- 验证点 2: $i18n 全局实例 -->
      <div class="test-case">
        <h4>✅ $i18n - Global Instance</h4>
        <div class="result">
          <code>$i18n.locale.value</code>
          <div class="output">{{ $i18n.locale }}</div>
        </div>
        <div class="result">
          <code>$i18n.availableLocales.value</code>
          <div class="output">{{ $i18n.availableLocales.join(', ') }}</div>
        </div>
      </div>

      <!-- 验证点 3: $locale 快捷访问 -->
      <div class="test-case">
        <h4>✅ $locale - Current Language</h4>
        <div class="result">
          <code>$locale.value</code>
          <div class="output">{{ $locale }}</div>
        </div>
      </div>

      <!-- 验证点 4: Options API 中使用 -->
      <div class="test-case">
        <h4>✅ Used in Options API Component</h4>
        <div class="result">
          <OptionsAPIComponent />
        </div>
      </div>
    </div>

    <div class="demo-api">
      <h4>🎯 Runtime API Validated:</h4>
      <ul>
        <li><code>$t(key, params)</code> - Global translation method</li>
        <li><code>$i18n</code> - Global i18n instance</li>
        <li><code>$locale</code> - Current language accessor</li>
        <li>Available in both Composition API and Options API</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';
import { defineComponent, getCurrentInstance } from 'vue';

const { t } = useI18n();

// Get global properties
const instance = getCurrentInstance();
const $t = instance?.appContext.config.globalProperties.$t;
const $i18n = instance?.appContext.config.globalProperties.$i18n;
const $locale = instance?.appContext.config.globalProperties.$locale;

// Options API 组件示例
const OptionsAPIComponent = defineComponent({
  name: 'OptionsAPIExample',
  template: `
    <div class="options-api-demo">
      <p><strong>Options API Component:</strong></p>
      <p>{{ message }}</p>
      <p>Current Locale: {{ $locale }}</p>
    </div>
  `,
  data() {
    return {
      message: (this as any).$t('globalPropertiesOptionsApiMessage'),
    };
  },
});
</script>

<style scoped>
@import './demo-card-styles.css';

.options-api-demo {
  background: #f5f7ff;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e0e7ff;
}

.options-api-demo p {
  margin: 0.5rem 0;
}

.options-api-demo strong {
  color: #667eea;
}
</style>
