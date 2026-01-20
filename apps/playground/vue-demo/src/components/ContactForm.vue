<template>
  <div class="contact-form">
    <form @submit.prevent="handleSubmit">
      <!-- 最佳实践：使用 t() 而不是 $tsl()，支持参数和复数 -->
      <div class="form-group">
        <label for="name">{{ t('form.name') }}</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          :placeholder="t('form.namePlaceholder')"
          required
        />
      </div>

      <div class="form-group">
        <label for="email">{{ t('form.email') }}</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          :placeholder="t('form.emailPlaceholder')"
          required
        />
      </div>

      <div class="form-group">
        <label for="message">{{ t('form.message') }}</label>
        <textarea
          id="message"
          v-model="formData.message"
          :placeholder="t('form.messagePlaceholder')"
          rows="4"
          required
        />
      </div>

      <button type="submit" class="submit-btn">
        {{ t('form.submit') }}
      </button>
    </form>

    <!-- 最佳实践：使用参数插值 -->
    <div v-if="submitted" class="success-message">
      {{ t('form.successMessage', { name: formData.name }) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

/**
 * 最佳实践：使用 Composition API 的 useI18n
 * 提供更好的类型推断和树摇优化
 */
const { t } = useI18n();

// 表单数据
const formData = ref({
  name: '',
  email: '',
  message: '',
});

const submitted = ref(false);

/**
 * 最佳实践：在业务逻辑中使用翻译
 */
const handleSubmit = () => {
  submitted.value = true;

  setTimeout(() => {
    submitted.value = false;
    formData.value = { name: '', email: '', message: '' };
  }, 3000);
};
</script>

<style scoped>
.contact-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.success-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #d4edda;
  color: #155724;
  border-radius: 6px;
  border: 1px solid #c3e6cb;
}
</style>
