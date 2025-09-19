<template>
  <div class="app">
    <h1>{{ $tsl('欢迎使用 TransLink I18n') }}</h1>
    
    <div class="language-switcher">
      <label>{{ $tsl('选择语言') }}:</label>
      <select v-model="currentLanguage" @change="handleLanguageChange">
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
        <option value="ja-JP">日本語</option>
      </select>
    </div>

    <div class="content">
      <p>{{ $tsl('这是一个示例应用，展示了 Vite 插件的功能。') }}</p>
      
      <div class="user-info">
        <h3>{{ $tsl('用户信息') }}</h3>
        <p>{{ $tsl('用户名') }}: {{ userName }}</p>
        <p>{{ $tsl('当前时间') }}: {{ currentTime }}</p>
      </div>

      <div class="features">
        <h3>{{ $tsl('主要功能') }}</h3>
        <ul>
          <li>{{ $tsl('自动代码转换') }}</li>
          <li>{{ $tsl('热更新支持') }}</li>
          <li>{{ $tsl('懒加载机制') }}</li>
          <li>{{ $tsl('构建优化') }}</li>
        </ul>
      </div>

      <div class="demo-section">
        <h3>{{ $tsl('交互演示') }}</h3>
        <button @click="showMessage">
          {{ $tsl('点击显示消息') }}
        </button>
        
        <div v-if="message" class="message">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '@translink/i18n-runtime/vue';

// 使用 i18n
const { t, locale, setLocale } = useI18n();

// 响应式数据
const currentLanguage = ref('zh-CN');
const userName = ref('张三');
const currentTime = ref('');
const message = ref('');

// 更新时间
const updateTime = () => {
  currentTime.value = new Date().toLocaleString();
};

// 语言切换
const handleLanguageChange = async () => {
  await setLocale(currentLanguage.value);
  
  // 根据语言更新用户名
  if (currentLanguage.value === 'en-US') {
    userName.value = 'John Doe';
  } else if (currentLanguage.value === 'ja-JP') {
    userName.value = '田中太郎';
  } else {
    userName.value = '张三';
  }
};

// 显示消息
const showMessage = () => {
  // 这里的中文也会被插件自动转换
  message.value = $tsl('这是一个动态生成的消息！');
  
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

// 组件挂载
onMounted(() => {
  updateTime();
  setInterval(updateTime, 1000);
});
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.language-switcher {
  margin-bottom: 30px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.language-switcher label {
  margin-right: 10px;
  font-weight: bold;
}

.language-switcher select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.content {
  display: grid;
  gap: 20px;
}

.user-info,
.features,
.demo-section {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.features ul {
  list-style-type: none;
  padding: 0;
}

.features li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.features li:before {
  content: '✓';
  color: #4caf50;
  margin-right: 10px;
  font-weight: bold;
}

.demo-section button {
  background: #2196f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.demo-section button:hover {
  background: #1976d2;
}

.message {
  margin-top: 15px;
  padding: 10px;
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 4px;
  color: #2e7d32;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

h3 {
  color: #555;
  margin-bottom: 15px;
}
</style>
