<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">04</span>
      {{ t('条件渲染') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('演示根据不同条件渲染不同文本（应用层逻辑）') }}</p>
    </div>

    <div class="demo-content">
      <!-- 测试 1: 数量显示 -->
      <div class="test-case">
        <h4>✅ 数量条件</h4>
        <div class="result">
          <div class="output">
            <label>
              数量:
              <input
                v-model.number="count"
                type="number"
                min="0"
              />
            </label>
            <p>{{ getPluralText(count) }}</p>
          </div>
        </div>
      </div>

      <!-- 测试 2: 条件文本 -->
      <div class="test-case">
        <h4>✅ 三元运算符</h4>
        <div class="result">
          <code>count > 0 ? t('有内容') : t('无内容')</code>
          <div class="output">
            <p>{{ count > 0 ? t('有内容') : t('无内容') }}</p>
          </div>
        </div>
      </div>

      <!-- 测试 3: 状态文本 -->
      <div class="test-case">
        <h4>✅ 状态描述</h4>
        <div class="result">
          <div class="output">
            <p>
              <template v-if="count === 0">{{ t('购物车是空的') }}</template>
              <template v-else-if="count > 0 && count < 5">{{ t('购物车有少量商品') }}</template>
              <template v-else-if="count >= 5 && count < 10">{{ t('购物车有一些商品') }}</template>
              <template v-else-if="count >= 10">{{ t('购物车有很多商品') }}</template>
            </p>
          </div>
        </div>
      </div>

      <!-- 测试 4: 语言相关 -->
      <div class="test-case">
        <h4>✅ 语言提示</h4>
        <div class="result">
          <div class="output">
            <p>{{ t('当前语言') }}: {{ locale === 'zh-CN' ? t('简体中文') : t('英语') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale } = useI18n();
const count = ref(0);

// 简单的复数处理逻辑（应用层实现）
const getPluralText = (count: number) => {
  if (count === 0) {
    return t('没有项目');
  } else if (count === 1) {
    return t('1 个项目');
  } else {
    return t('{{count}} 个项目').replace('{{count}}', String(count));
  }
};
</script>

<style scoped src="./demo-card-styles.css"></style>
