<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">05</span>
      {{ t('指令使用') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('演示 v-t 指令的使用（如果支持）') }}</p>
    </div>

    <div class="demo-content">
      <!-- 测试 1: 基础指令 -->
      <div class="test-case">
        <h4>✅ 基础翻译（使用函数）</h4>
        <div class="result">
          <code>{{ "{{ t('你好，世界！') }}" }}</code>
          <div class="output">
            <p>{{ t('你好，世界！') }}</p>
          </div>
        </div>
      </div>

      <!-- 测试 2: 文本绑定 -->
      <div class="test-case">
        <h4>✅ 文本绑定</h4>
        <div class="result">
          <code>{{ "{{ t('欢迎使用') }}" }}</code>
          <div class="output">
            <p>{{ t('欢迎使用 TransLink') }}</p>
          </div>
        </div>
      </div>

      <!-- 测试 3: 动态内容 -->
      <div class="test-case">
        <h4>✅ 动态内容</h4>
        <div class="result">
          <div class="output">
            <p>{{ t('当前时间') }}: {{ currentTime }}</p>
          </div>
        </div>
      </div>

      <!-- 测试 4: 组合使用 -->
      <div class="test-case">
        <h4>✅ 组合使用</h4>
        <div class="result">
          <div class="output">
            <ul class="output-list">
              <li>{{ t('列表项') }} 1</li>
              <li>{{ t('列表项') }} 2</li>
              <li>{{ t('列表项') }} 3</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

const { t } = useI18n();

const currentTime = ref(new Date().toLocaleTimeString());
let timer: number;

onMounted(() => {
  timer = window.setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString();
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped src="./demo-card-styles.css"></style>
