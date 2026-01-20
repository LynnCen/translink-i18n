<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">04</span>
      {{ t('pluralizationTitle') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('pluralizationDesc') }}</p>
    </div>

    <div class="demo-content">
      <!-- 验证点 1: 基础复数 -->
      <div class="test-case">
        <h4>✅ t(key, { count }) - Auto Pluralization</h4>
        <div class="counter">
          <button @click="count = Math.max(0, count - 1)">-</button>
          <span class="count-display">{{ count }}</span>
          <button @click="count++">+</button>
        </div>
        <div class="result">
          <code>t('items', { count })</code>
          <div class="output">
            {{ t('items', { count }) }}
          </div>
        </div>
      </div>

      <!-- 验证点 2: 多种复数形式 -->
      <div class="test-case">
        <h4>✅ Different Plural Forms</h4>
        <div class="plural-examples">
          <div
            v-for="num in [0, 1, 2, 5, 10, 21, 100]"
            :key="num"
            class="plural-item"
          >
            <strong>{{ num }}:</strong>
            {{ t('items', { count: num }) }}
          </div>
        </div>
      </div>

      <!-- 验证点 3: 语言特定规则 -->
      <div class="test-case">
        <h4>✅ Language-Specific Rules</h4>
        <div class="result">
          <code>Different languages have different plural rules</code>
          <div class="output">
            <div>
              English (1, other):
              {{ t('items', { count: 1 }) }} /
              {{ t('items', { count: 2 }) }}
            </div>
            <div>
              Chinese (other only):
              {{
                locale === 'zh-CN'
                  ? t('items', { count: 1 })
                  : 'Switch to Chinese to see'
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- 验证点 4: 复数与其他参数结合 -->
      <div class="test-case">
        <h4>✅ Pluralization + Other Parameters</h4>
        <div class="result">
          <code>t('itemsWithUser', { count, user: 'Alice' })</code>
          <div class="output">
            {{ t('itemsWithUser', { count, user: 'Alice' }) }}
          </div>
        </div>
      </div>
    </div>

    <div class="demo-api">
      <h4>🎯 Runtime API Validated:</h4>
      <ul>
        <li><code>t(key, { count })</code> - Automatic pluralization</li>
        <li>Plural forms: _zero, _one, _two, _few, _many, _other</li>
        <li>Language-specific CLDR rules</li>
        <li>Works with other parameters</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

/**
 * 场景 04: 复数支持
 *
 * 验证 Runtime API:
 * - t(key, { count }) 自动复数化
 * - 不同语言的复数规则
 * - 复数与参数结合
 */
const { t, locale } = useI18n();

const count = ref(0);
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

.counter button:active {
  transform: scale(0.95);
}

.count-display {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  min-width: 60px;
  text-align: center;
}

.plural-examples {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
}

.plural-item {
  background: #f5f7ff;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #e0e7ff;
  font-size: 0.875rem;
}

.plural-item strong {
  color: #667eea;
  margin-right: 0.5rem;
}
</style>
