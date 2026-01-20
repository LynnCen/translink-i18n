<template>
  <div class="language-switcher">
    <label for="language-select">{{ t('language.select') }}:</label>
    <select
      id="language-select"
      :value="currentLanguage"
      :disabled="isSwitching"
      class="language-select"
      @change="handleLanguageChange"
    >
      <option
        v-for="lang in availableLanguages"
        :key="lang.code"
        :value="lang.code"
      >
        {{ lang.flag }} {{ lang.name }}
      </option>
    </select>

    <div v-if="isSwitching" class="loading-indicator">
      <span class="spinner" />
      {{ t('language.switching') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

/**
 * 最佳实践：使用 useI18n Composition API
 */
const { t, locale } = useI18n();

// 切换状态
const isSwitching = ref(false);

// 语言选项配置
const languageOptions = {
  'zh-CN': { name: '中文', flag: '🇨🇳' },
  'en-US': { name: 'English', flag: '🇺🇸' },
};

/**
 * 最佳实践：使用 computed 属性
 */
const currentLanguage = computed(() => locale.value);

const availableLanguages = computed(() => {
  // 从配置中获取支持的语言
  const supportedLanguages = ['zh-CN', 'en-US'];

  return supportedLanguages.map(code => ({
    code,
    name: languageOptions[code as keyof typeof languageOptions]?.name || code,
    flag: languageOptions[code as keyof typeof languageOptions]?.flag || '🌐',
  }));
});

/**
 * 最佳实践：处理语言切换
 * 使用 i18n engine 的 changeLanguage 方法
 */
const handleLanguageChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newLanguage = target.value;

  if (newLanguage !== currentLanguage.value) {
    isSwitching.value = true;

    try {
      // 获取 i18n engine 实例
      const engine = (window as any).__i18n_engine__;

      if (engine && typeof engine.changeLanguage === 'function') {
        await engine.changeLanguage(newLanguage);
        console.log(`✅ Language switched to: ${newLanguage}`);
      } else {
        // Fallback: 直接设置 locale
        locale.value = newLanguage;
      }

      // 显示切换成功提示
      showNotification(
        newLanguage === 'zh-CN'
          ? '语言切换成功！'
          : 'Language switched successfully!'
      );
    } catch (error) {
      console.error('Language switch failed:', error);
      showNotification(
        currentLanguage.value === 'zh-CN'
          ? '语言切换失败，请重试。'
          : 'Failed to switch language, please try again.',
        'error'
      );
    } finally {
      isSwitching.value = false;
    }
  }
};

/**
 * 最佳实践：简单的通知实现
 */
const showNotification = (
  message: string,
  type: 'success' | 'error' = 'success'
) => {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '6px',
    color: 'white',
    backgroundColor: type === 'success' ? '#4CAF50' : '#f44336',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: '9999',
    fontSize: '14px',
    fontWeight: '500',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
  });

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);

  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
};
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.language-switcher label {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.language-select {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.language-select:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.language-select:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.language-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.language-select option {
  background: #2c3e50;
  color: white;
  padding: 0.5rem;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  white-space: nowrap;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .language-switcher {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .language-select {
    min-width: 100px;
    font-size: 0.8rem;
  }

  .loading-indicator {
    position: static;
    margin-top: 0;
  }
}
</style>
