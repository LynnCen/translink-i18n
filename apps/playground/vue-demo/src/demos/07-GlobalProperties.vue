<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">07</span>
      {{ t('全局属性') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('演示 useI18n 的所有返回值') }}</p>
    </div>

    <div class="demo-content">
      <!-- 测试 1: useI18n 返回值 -->
      <div class="test-case">
        <h4>✅ useI18n() 返回值</h4>
        <div class="result">
          <code>const { t, locale, setLocale, isReady, isLoading } = useI18n()</code>
          <div class="output info-grid">
            <div class="info-item">
              <strong>t:</strong> {{ t('翻译函数') }}
            </div>
            <div class="info-item">
              <strong>locale:</strong> {{ locale }}
            </div>
            <div class="info-item">
              <strong>isReady:</strong> {{ isReady ? t('已就绪') : t('未就绪') }}
            </div>
            <div class="info-item">
              <strong>isLoading:</strong> {{ isLoading ? t('加载中') : t('未加载') }}
            </div>
          </div>
        </div>
      </div>

      <!-- 测试 2: setLocale 方法 -->
      <div class="test-case">
        <h4>✅ setLocale 方法</h4>
        <div class="result">
          <code>const { setLocale } = useI18n()</code>
          <div class="output">
            <button
              @click="() => setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN')"
              :disabled="isLoading"
            >
              {{ t('切换语言') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 测试 3: 响应式更新 -->
      <div class="test-case">
        <h4>✅ 响应式更新</h4>
        <div class="result">
          <div class="output">
            <p>{{ t('当语言切换时，所有使用 t() 的文本会自动更新') }}</p>
            <p>{{ t('这是 Vue3 响应式系统的特性') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale, setLocale, isReady, isLoading } = useI18n();
</script>

<style scoped src="./demo-card-styles.css"></style>
