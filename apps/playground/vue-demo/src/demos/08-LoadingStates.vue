<template>
  <div class="demo-card">
    <h3 class="demo-title">
      <span class="demo-number">08</span>
      {{ t('加载状态') }}
    </h3>

    <div class="demo-description">
      <p>{{ t('演示 isReady 和 isLoading 状态管理') }}</p>
    </div>

    <div class="demo-content">
      <!-- 测试 1: isReady 状态 -->
      <div class="test-case">
        <h4>✅ isReady 状态</h4>
        <div class="result">
          <code>const { isReady } = useI18n()</code>
          <div class="output">
            <div :class="`status-badge ${isReady ? 'ready' : 'not-ready'}`">
              {{ isReady ? t('✅ 已就绪') : t('⏳ 未就绪') }}
            </div>
            <p>
              {{ isReady
                  ? t('翻译引擎已初始化，可以正常使用')
                  : t('正在初始化翻译引擎...')
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- 测试 2: isLoading 状态 -->
      <div class="test-case">
        <h4>✅ isLoading 状态</h4>
        <div class="result">
          <code>const { isLoading } = useI18n()</code>
          <div class="output">
            <div :class="`status-badge ${isLoading ? 'loading' : 'idle'}`">
              {{ isLoading ? t('⏳ 加载中') : t('✅ 空闲') }}
            </div>
            <p>
              {{ isLoading
                  ? t('正在加载语言资源...')
                  : t('没有进行中的加载操作')
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- 测试 3: 切换时的加载状态 -->
      <div class="test-case">
        <h4>✅ 切换语言时的状态</h4>
        <div class="result">
          <div class="output">
            <button @click="handleLanguageSwitch" :disabled="isLoading">
              {{ isLoading ? t('切换中...') : t('切换语言') }}
            </button>
            <p class="note">
              {{ t('点击按钮观察 isLoading 状态变化') }}
            </p>
          </div>
        </div>
      </div>

      <!-- 测试 4: 状态组合 -->
      <div class="test-case">
        <h4>✅ 状态组合</h4>
        <div class="result">
          <div class="output info-grid">
            <div class="info-item">
              <strong>isReady:</strong> {{ isReady ? t('真') : t('假') }}
            </div>
            <div class="info-item">
              <strong>isLoading:</strong> {{ isLoading ? t('真') : t('假') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@translink/i18n-runtime/vue';

const { t, locale, setLocale, isReady, isLoading } = useI18n();

const handleLanguageSwitch = async () => {
  const newLang = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
  await setLocale(newLang);
};
</script>

<style scoped src="./demo-card-styles.css"></style>
