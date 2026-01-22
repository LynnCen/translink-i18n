<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">09</span>
      {{ t('开发工具') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('演示 DevTools 和错误处理功能') }}</p>
    </div>

    <div class="demo-content">
      <!-- 测试 1: 缺失的翻译 -->
      <div class="test-case">
        <h4>✅ 缺失的翻译</h4>
        <div class="result">
          <code>t('不存在的key')</code>
          <div class="output">
            <p>{{ t('这个key不存在') }}</p>
            <p class="note">{{ t('返回原始文本作为后备') }}</p>
          </div>
        </div>
      </div>

      <!-- 测试 2: 使用默认值 -->
      <div class="test-case">
        <h4>✅ 默认值</h4>
        <div class="result">
          <code>t('不存在', {}, { defaultValue: "默认值" })</code>
          <div class="output">
            <p>{{ t('这个也不存在', {}, { defaultValue: '这是默认值' }) }}</p>
          </div>
        </div>
      </div>

      <!-- 测试 3: DevTools -->
      <div class="test-case">
        <h4>✅ DevTools</h4>
        <div class="result">
          <div class="output">
            <button @click="triggerMissingKey" class="devtools-trigger">
              {{ t('触发缺失 Key') }}
            </button>
            <p class="note">
              {{ t('打开浏览器控制台查看 DevTools 日志') }}
            </p>
            <p v-if="devToolsAvailable" class="success">
              {{ t('✅ DevTools 已启用') }}
            </p>
          </div>
        </div>
      </div>

      <!-- 测试 4: 安全渲染 -->
      <div class="test-case">
        <h4>✅ 安全渲染</h4>
        <div class="result">
          <div class="output">
            <p>{{ t('即使翻译缺失，应用也不会崩溃') }}</p>
            <p>{{ t('始终返回可用的文本（原文或默认值）') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

const { t } = useI18n();

const devToolsAvailable = ref(
  typeof window !== 'undefined' && !!(window as any).__TRANSLINK_DEVTOOLS__
);

const triggerMissingKey = () => {
  // 触发一个不存在的 key
  const result = t('这个文本不存在于翻译文件中');
  console.log('Missing key result:', result);
};
</script>

<style scoped src="./demo-card-styles.css"></style>
