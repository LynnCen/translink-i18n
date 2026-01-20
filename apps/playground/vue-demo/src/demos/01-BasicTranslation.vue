<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">01</span>
      {{ t('basicTranslationTitle') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('basicTranslationDesc') }}</p>
    </div>

    <div class="demo-content">
      <!-- 验证点 1: 基础翻译 -->
      <div class="test-case">
        <h4>✅ t('key') - Basic Translation</h4>
        <div class="result">
          <code>t('hello')</code>
          <div class="output">{{ t('hello') }}</div>
        </div>
      </div>

      <!-- 验证点 2: 嵌套键名 -->
      <div class="test-case">
        <h4>✅ Nested Keys</h4>
        <div class="result">
          <code>t('nested.level1.level2')</code>
          <div class="output">
            {{ t('nested.level1.level2') }}
          </div>
        </div>
      </div>

      <!-- 验证点 3: 数组访问 -->
      <div class="test-case">
        <h4>✅ Array Items</h4>
        <div class="result">
          <code>t('items[0]')</code>
          <ul class="output-list">
            <li v-for="i in 3" :key="i">
              {{ t(`items[${i - 1}]`) }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 验证点 4: 默认值 -->
      <div class="test-case">
        <h4>✅ Default Value (Fallback)</h4>
        <div class="result">
          <code>t('nonexistent.key', {}, { defaultValue: 'Fallback' })</code>
          <div class="output">
            {{ t('nonexistent.key', {}, { defaultValue: 'Fallback Text' }) }}
          </div>
        </div>
      </div>
    </div>

    <div class="demo-api">
      <h4>🎯 Runtime API Validated:</h4>
      <ul>
        <li><code>t(key)</code> - Basic translation</li>
        <li><code>t(key, {}, options)</code> - With options</li>
        <li>Nested key access</li>
        <li>Default value fallback</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';

/**
 * 场景 01: 基础翻译
 *
 * 验证 Runtime API:
 * - t(key) 基础翻译功能
 * - 嵌套键名访问
 * - 数组索引访问
 * - 默认值 fallback
 */
const { t } = useI18n();
</script>

<style scoped>
.demo-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.demo-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.demo-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
}

.demo-description {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.demo-description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.test-case {
  border-left: 3px solid #667eea;
  padding-left: 1rem;
}

.test-case h4 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.result {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result code {
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  color: #e83e8c;
}

.output {
  background: #e3f2fd;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #90caf9;
  color: #1565c0;
  font-weight: 500;
}

.output-list {
  background: #e3f2fd;
  padding: 0.75rem 0.75rem 0.75rem 2rem;
  border-radius: 4px;
  border: 1px solid #90caf9;
  margin: 0;
}

.output-list li {
  color: #1565c0;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.demo-api {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px dashed #e0e0e0;
}

.demo-api h4 {
  margin: 0 0 0.75rem 0;
  color: #667eea;
  font-size: 1rem;
}

.demo-api ul {
  margin: 0;
  padding-left: 1.5rem;
}

.demo-api li {
  color: #666;
  line-height: 1.8;
}

.demo-api li code {
  background: #f5f5f5;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  color: #e83e8c;
}
</style>
