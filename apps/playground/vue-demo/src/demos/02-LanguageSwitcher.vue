<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">02</span>
      {{ t('languageSwitcherTitle') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('languageSwitcherDesc') }}</p>
    </div>

    <div class="demo-content">
      <!-- 验证点 1: setLocale() -->
      <div class="test-case">
        <h4>✅ setLocale(lang) - Switch Language</h4>
        <div class="language-selector">
          <button
            v-for="lang in formattedLanguages"
            :key="lang.code"
            :class="['lang-btn', { active: locale === lang.code }]"
            :disabled="isLoading"
            @click="handleSwitchLanguage(lang.code)"
          >
            <span class="flag">{{ lang.flag }}</span>
            <span class="name">{{ lang.name }}</span>
            <span v-if="locale === lang.code" class="check">✓</span>
          </button>
        </div>
      </div>

      <!-- 验证点 2: locale (reactive) -->
      <div class="test-case">
        <h4>✅ locale - Current Language (Reactive)</h4>
        <div class="result">
          <code>locale.value</code>
          <div class="output">{{ locale }}</div>
        </div>
      </div>

      <!-- 验证点 3: availableLocales -->
      <div class="test-case">
        <h4>✅ availableLocales - Supported Languages</h4>
        <div class="result">
          <code>availableLocales.value</code>
          <div class="output">{{ availableLocales.join(', ') }}</div>
        </div>
      </div>

      <!-- 验证点 4: isLoading -->
      <div class="test-case">
        <h4>✅ isLoading - Loading State</h4>
        <div class="result">
          <code>isLoading.value</code>
          <div :class="['output', 'status', { loading: isLoading }]">
            <span class="status-indicator" />
            {{ isLoading ? 'Loading...' : 'Ready' }}
          </div>
        </div>
      </div>
    </div>

    <div class="demo-api">
      <h4>🎯 Runtime API Validated:</h4>
      <ul>
        <li><code>setLocale(lang: string)</code> - Switch language</li>
        <li><code>locale</code> - Current language (ComputedRef)</li>
        <li><code>availableLocales</code> - List of supported languages</li>
        <li><code>isLoading</code> - Loading state during switch</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

/**
 * 场景 02: 语言切换
 *
 * 验证 Runtime API:
 * - setLocale() 切换语言
 * - locale 响应式当前语言
 * - availableLocales 可用语言列表
 * - isLoading 加载状态
 */
const { t, locale, setLocale, availableLocales, isLoading } = useI18n();

const languageOptions: Record<string, { flag: string }> = {
  'zh-CN': { flag: '🇨🇳' },
  'en-US': { flag: '🇺🇸' },
};

const formattedLanguages = computed(() => {
  return availableLocales.value.map(code => ({
    code,
    name: code === 'zh-CN' ? t('languageChinese') : t('languageEnglish'),
    flag: languageOptions[code]?.flag || '🌐',
  }));
});

const handleSwitchLanguage = async (lang: string) => {
  if (lang !== locale.value) {
    try {
      await setLocale(lang);
      console.log(`✅ Language switched to: ${lang}`);
    } catch (error) {
      console.error('❌ Failed to switch language:', error);
    }
  }
};
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

.language-selector {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  position: relative;
}

.lang-btn:hover:not(:disabled) {
  border-color: #667eea;
  background: #f5f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.15);
}

.lang-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.lang-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.flag {
  font-size: 1.5rem;
}

.name {
  font-weight: 500;
}

.check {
  font-size: 1.25rem;
  margin-left: 0.25rem;
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

.output.status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4caf50;
}

.status.loading .status-indicator {
  background: #ff9800;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
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
