<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">03</span>
      {{ t('参数插值') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('演示如何在翻译文本中使用动态参数') }}</p>
    </div>

    <div class="demo-content">
      <!-- 测试 1: 单个参数 -->
      <div class="test-case">
        <h4>✅ 单个参数插值</h4>
        <div class="result">
          <code>t('你好，{{name}}！', { name })</code>
          <div class="output">
            <input
              v-model="userName"
              type="text"
              placeholder="输入名字"
            />
            <p>{{ t('你好，{{name}}！', { name: userName }) }}</p>
          </div>
        </div>
      </div>

      <!-- 测试 2: 多个参数 -->
      <div class="test-case">
        <h4>✅ 多个参数插值</h4>
        <div class="result">
          <code>t('{{name}} 有 {{count}} 个项目', { name, count })</code>
          <div class="output">
            <label>
              数量:
              <input
                v-model.number="itemCount"
                type="number"
                min="0"
              />
            </label>
            <p>{{ t('{{name}} 有 {{count}} 个项目', { name: userName, count: itemCount }) }}</p>
          </div>
        </div>
      </div>

      <!-- 测试 3: 数字格式化 -->
      <div class="test-case">
        <h4>✅ 数字显示</h4>
        <div class="result">
          <code>t('价格：${{price}}', { price })</code>
          <div class="output">
            <p>{{ t('价格：${{price}}', { price: 99.99 }) }}</p>
            <p>{{ t('总计：¥{{amount}}', { amount: 1234.56 }) }}</p>
          </div>
        </div>
      </div>

      <!-- 测试 4: HTML 转义 -->
      <div class="test-case">
        <h4>✅ HTML 转义（安全）</h4>
        <div class="result">
          <code>t('输入：{{input}}', { input: "<script>" })</code>
          <div class="output">
            <p>{{ t('输入：{{input}}', { input: '<script>alert("xss")</script>' }) }}</p>
            <small class="note">{{ t('特殊字符已自动转义') }}</small>
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

const userName = ref('张三');
const itemCount = ref(5);
</script>

<style scoped src="./demo-card-styles.css"></style>
