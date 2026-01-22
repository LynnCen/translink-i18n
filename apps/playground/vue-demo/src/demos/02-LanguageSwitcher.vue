<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">02</span>
      {{ t('语言切换') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('演示语言切换功能和状态管理') }}</p>
    </div>

    <div class="demo-content">
      <!-- 测试 1: 语言选择器 -->
      <div class="test-case">
        <h4>✅ 语言选择</h4>
        <div class="result">
          <code>setLocale(newLanguage)</code>
          <div class="output">
            <select
              :value="locale"
              @change="handleLanguageChange"
              :disabled="isLoading"
              class="language-selector"
            >
              <option
                v-for="lang in availableLocales"
                :key="lang"
                :value="lang"
              >
                {{ getLanguageName(lang) }}
              </option>
            </select>
            <span v-if="isLoading" class="loading-indicator">
              ⏳ {{ t('加载中...') }}
            </span>
          </div>
        </div>
      </div>

      <!-- 测试 2: 当前语言状态 -->
      <div class="test-case">
        <h4>✅ 当前语言</h4>
        <div class="result">
          <code>const { locale } = useI18n()</code>
          <div class="output">
            {{ t('当前语言') }}: <strong>{{ getLanguageName(locale) }}</strong> ({{ locale }})
          </div>
        </div>
      </div>

      <!-- 测试 3: 支持的语言列表 -->
      <div class="test-case">
        <h4>✅ 支持的语言</h4>
        <div class="result">
          <code>const { availableLocales } = useI18n()</code>
          <div class="output">
            <ul class="output-list">
              <li v-for="lang in availableLocales" :key="lang">
                {{ getLanguageName(lang) }} ({{ lang }})
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 测试 4: 快速切换按钮 -->
      <div class="test-case">
        <h4>✅ 快速切换</h4>
        <div class="result">
          <div class="output button-group">
            <button
              v-for="lang in availableLocales"
              :key="lang"
              @click="() => setLocale(lang)"
              :disabled="locale === lang || isLoading"
              :class="{ active: locale === lang }"
            >
              {{ getLanguageName(lang) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale, setLocale, availableLocales, isLoading } = useI18n();

const getLanguageName = (langCode: string) => {
  switch (langCode) {
    case 'zh-CN':
      return t('简体中文');
    case 'en-US':
      return t('英语');
    default:
      return langCode;
  }
};

const handleLanguageChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newLanguage = target.value;
  if (newLanguage !== locale.value) {
    try {
      await setLocale(newLanguage);
      console.log(`✅ Language switched to: ${newLanguage}`);
    } catch (error) {
      console.error('Language switch failed:', error);
    }
  }
};
</script>

<style scoped src="./demo-card-styles.css"></style>
