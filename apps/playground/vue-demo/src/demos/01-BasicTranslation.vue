<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">01</span>
      {{ t('基础翻译') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('演示 t() 函数的基本用法和默认值功能') }}</p>
    </div>

    <div class="demo-content">
      <!-- 测试 1: 基础翻译 -->
      <div class="test-case">
        <h4>✅ 基础翻译</h4>
        <div class="result">
          <code>t('你好，世界！')</code>
          <div class="output">{{ t('你好，世界！') }}</div>
        </div>
      </div>

      <!-- 测试 2: 长文本 -->
      <div class="test-case">
        <h4>✅ 长文本翻译</h4>
        <div class="result">
          <code>t('欢迎使用 TransLink...')</code>
          <div class="output">{{ t('欢迎使用 TransLink 国际化解决方案') }}</div>
        </div>
      </div>

      <!-- 测试 3: 默认值（回退） -->
      <div class="test-case">
        <h4>✅ 默认值（Fallback）</h4>
        <div class="result">
          <code>t('不存在的文本', {}, { defaultValue: '默认值' })</code>
          <div class="output">
            {{ t('不存在的文本', {}, { defaultValue: '默认值' }) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';

const { t } = useI18n();
</script>

<style scoped src="./demo-card-styles.css"></style>
