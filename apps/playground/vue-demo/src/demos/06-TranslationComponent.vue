<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">06</span>
      {{ t('translationComponentTitle') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('translationComponentDesc') }}</p>
    </div>

    <div class="demo-content">
      <!-- 验证点 1: 基础组件用法 -->
      <div class="test-case">
        <h4>✅ &lt;Translation keypath="" /&gt; - Basic Component</h4>
        <div class="result">
          <code>&lt;Translation keypath="translationComponentBasic" /&gt;</code>
          <div class="output">
            <Translation keypath="translationComponentBasic" />
          </div>
        </div>
      </div>

      <!-- 验证点 2: 带参数 -->
      <div class="test-case">
        <h4>✅ With Parameters</h4>
        <div class="result">
          <code>&lt;Translation keypath="key" :params="{ name: 'Charlie' }" /&gt;</code>
          <div class="output">
            <Translation
              keypath="translationComponentWithParams"
              :params="{ name: 'Charlie', role: 'Developer' }"
            />
          </div>
        </div>
      </div>

      <!-- 验证点 3: 复数支持 -->
      <div class="test-case">
        <h4>✅ With Pluralization</h4>
        <div class="counter">
          <button @click="itemCount = Math.max(0, itemCount - 1)">-</button>
          <span class="count-display">{{ itemCount }}</span>
          <button @click="itemCount++">+</button>
        </div>
        <div class="result">
          <code>&lt;Translation keypath="key" :plural="itemCount" /&gt;</code>
          <div class="output">
            <Translation
              keypath="items"
              :plural="itemCount"
            />
          </div>
        </div>
      </div>

      <!-- 验证点 4: 自定义标签 -->
      <div class="test-case">
        <h4>✅ Custom Tag</h4>
        <div class="result">
          <code>&lt;Translation keypath="key" tag="h2" /&gt;</code>
          <div class="output">
            <Translation
              keypath="translationComponentCustomTag"
              tag="h2"
              class="custom-heading"
            />
          </div>
        </div>
      </div>

      <!-- 验证点 5: Render Prop -->
      <div class="test-case">
        <h4>✅ Render Prop (Slot)</h4>
        <div class="result">
          <code>&lt;Translation keypath="key"&gt;...&lt;/Translation&gt;</code>
          <div class="output">
            <Translation keypath="translationComponentBasic">
              <template #default="{ translation }">
                <div class="fancy-box">
                  <span class="icon">✨</span>
                  {{ translation }}
                  <span class="icon">✨</span>
                </div>
              </template>
            </Translation>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-api">
      <h4>🎯 Runtime API Validated:</h4>
      <ul>
        <li><code>&lt;Translation keypath="" /&gt;</code> - Basic usage</li>
        <li><code>:params</code> - Parameter support</li>
        <li><code>:plural</code> - Pluralization</li>
        <li><code>tag</code> - Custom HTML tag</li>
        <li>Slot/Render prop support</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n, Translation } from '@translink/i18n-runtime/vue';

/**
 * 场景 06: Translation 组件
 *
 * 验证 Runtime API:
 * - <Translation> 组件各种用法
 * - props: keypath, params, plural, tag
 * - slot 支持
 */
const { t } = useI18n();

const itemCount = ref(3);
</script>

<style scoped>
@import './demo-card-styles.css';

.counter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.counter button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.counter button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.count-display {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  min-width: 60px;
  text-align: center;
}

.custom-heading {
  color: #667eea;
  font-size: 1.5rem;
  margin: 0;
}

.fancy-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
}

.fancy-box .icon {
  font-size: 1.5rem;
}
</style>
