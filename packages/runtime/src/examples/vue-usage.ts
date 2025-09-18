/**
 * Vue 3 使用示例
 */

import { createApp } from 'vue';
import { createI18n, useI18n } from '../vue.js';
import { I18nEngine } from '../core/i18n-engine.js';

// 创建 i18n 引擎
const engine = new I18nEngine({
  defaultLanguage: 'zh-CN',
  fallbackLanguage: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  loadPath: './locales/{{lng}}.json',
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 5 * 60 * 1000,
    storage: 'localStorage'
  }
});

// 创建 Vue i18n 实例
const i18n = createI18n({
  ...engine.options,
  globalInjection: true,
  globalProperties: true
});

// Vue 组件示例
const ExampleComponent = {
  name: 'ExampleComponent',
  setup() {
    const { t, locale, setLocale, availableLocales, isReady } = useI18n();
    
    const handleLanguageChange = async (lang: string) => {
      await setLocale(lang);
    };
    
    return {
      t,
      locale,
      setLocale: handleLanguageChange,
      availableLocales,
      isReady
    };
  },
  template: `
    <div v-if="isReady">
      <h1>{{ t('welcome') }}</h1>
      <p>{{ t('greeting', { name: 'Vue 用户' }) }}</p>
      
      <div>
        <label>选择语言:</label>
        <select :value="locale" @change="setLocale($event.target.value)">
          <option v-for="lang in availableLocales" :key="lang" :value="lang">
            {{ lang }}
          </option>
        </select>
      </div>
      
      <!-- 使用翻译指令 -->
      <p v-t="'user.profile'"></p>
      
      <!-- 使用翻译组件 -->
      <Translation 
        keypath="itemCount" 
        :params="{ count: 5 }"
        tag="div"
      />
    </div>
    <div v-else>
      Loading...
    </div>
  `
};

// 创建 Vue 应用
const app = createApp(ExampleComponent);

// 安装 i18n 插件
app.use(i18n);

// 注册翻译指令
app.directive('t', vT);

// 挂载应用
// app.mount('#app');

export { app, i18n, ExampleComponent };
