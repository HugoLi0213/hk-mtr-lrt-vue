<template>
  <div class="settings-page">
    <h1>設定</h1>    <div class="setting-group">
      <label>
        <input type="checkbox" v-model="showBusEta" @change="saveSetting" />
        顯示巴士到站頁面（Bus ETA Page）
      </label>
    </div>
    
    <!-- App Title Section -->
    <div class="app-info">
      <h2 class="app-title">HKMTRVUE</h2>
      <h3 class="app-subtitle">香港鐵路實時資訊</h3>
      <p class="app-description">
        Real-time MTR & Light Rail arrivals for Hong Kong<br>
        香港港鐵及輕鐵實時到站時間查詢
      </p>
      <div class="app-version">
        Version 2.0 | Built with ❤️ for Hong Kong
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// Use localStorage for persistence
const showBusEta = ref(localStorage.getItem('showBusEta') === 'true');

const saveSetting = () => {
  localStorage.setItem('showBusEta', showBusEta.value ? 'true' : 'false');
};

watch(showBusEta, saveSetting);
</script>

<style scoped>
.settings-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 16px;
  background: var(--color-background);
  color: var(--color-text);
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
}

.settings-page h1 {
  color: var(--color-text);
  font-size: var(--font-size-title);
  margin-bottom: 24px;
  font-weight: 600;
}

.setting-group {
  margin-bottom: 20px;
  font-size: var(--font-size-base);
  background: var(--color-surface);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  transition: background-color 0.3s, border-color 0.3s;
}

.setting-group label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: var(--color-text);
  font-weight: 500;
}

.setting-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
}

/* App Info Section */
.app-info {
  margin-top: 40px;
  padding: 24px 16px;
  text-align: center;
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  transition: background-color 0.3s, border-color 0.3s;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, var(--color-primary), #0066cc);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-subtitle {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 16px 0;
  opacity: 0.9;
}

.app-description {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0 0 20px 0;
  line-height: 1.5;
  font-weight: 500;
}

.app-version {
  font-size: 14px;
  color: var(--color-text-tertiary);
  font-weight: 500;
  padding: 8px 16px;
  background: var(--color-background);
  border-radius: 8px;
  display: inline-block;
  border: 1px solid var(--color-border);
}

/* Dark mode support */
[data-theme="dark"] .settings-page {
  background: var(--color-background);
  color: var(--color-text);
}

[data-theme="dark"] .setting-group {
  background: var(--color-surface);
  border-color: var(--color-border);
}

[data-theme="dark"] .setting-group:hover {
  background: var(--color-surface-variant);
  border-color: var(--color-primary);
}

[data-theme="dark"] .app-info {
  background: var(--color-surface);
  border-color: var(--color-border);
}

[data-theme="dark"] .app-title {
  background: linear-gradient(135deg, var(--color-primary), #4dabf7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

[data-theme="dark"] .app-version {
  background: var(--color-background);
  border-color: var(--color-border);
}
</style>
