<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">06</span>
      {{ t('组件化使用') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('演示在多个组件中使用 useI18n') }}</p>
    </div>

    <div class="demo-content">
      <!-- 测试 1: 多个子组件 -->
      <div class="test-case">
        <h4>✅ 多个子组件</h4>
        <div class="result">
          <code>每个组件独立调用 useI18n()</code>
          <div class="output components-grid">
            <ChildComponent1 />
            <ChildComponent2 />
            <ChildComponent3 />
          </div>
        </div>
      </div>

      <!-- 测试 2: 共享状态 -->
      <div class="test-case">
        <h4>✅ 共享翻译状态</h4>
        <div class="result">
          <div class="output">
            <p>{{ t('所有组件共享同一个翻译引擎实例') }}</p>
            <p>{{ t('语言切换会自动更新所有组件') }}</p>
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

<script lang="ts">
// 子组件 1
import { defineComponent } from 'vue';

const ChildComponent1 = defineComponent({
  name: 'ChildComponent1',
  setup() {
    const { t } = useI18n();
    return { t };
  },
  template: `
    <div class="child-component">
      <h5>{{ t('子组件 1') }}</h5>
      <p>{{ t('这是第一个子组件') }}</p>
    </div>
  `,
});

// 子组件 2
const ChildComponent2 = defineComponent({
  name: 'ChildComponent2',
  setup() {
    const { t, locale } = useI18n();
    return { t, locale };
  },
  template: `
    <div class="child-component">
      <h5>{{ t('子组件 2') }}</h5>
      <p>{{ t('当前语言') }}: {{ locale }}</p>
    </div>
  `,
});

// 嵌套组件
const NestedComponent = defineComponent({
  name: 'NestedComponent',
  setup() {
    const { t } = useI18n();
    return { t };
  },
  template: `
    <div class="nested-component">
      <p>{{ t('这是一个嵌套的组件') }}</p>
    </div>
  `,
});

// 子组件 3（包含嵌套）
const ChildComponent3 = defineComponent({
  name: 'ChildComponent3',
  components: { NestedComponent },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  template: `
    <div class="child-component">
      <h5>{{ t('子组件 3（嵌套）') }}</h5>
      <NestedComponent />
    </div>
  `,
});
</script>

<style scoped src="./demo-card-styles.css"></style>
