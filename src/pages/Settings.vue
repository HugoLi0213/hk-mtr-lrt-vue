<template>
  <div class="settings-page">
    <h1>設定</h1>
    <div class="setting-group">
      <label>
        <input type="checkbox" v-model="showBusEta" @change="saveSetting" />
        顯示巴士到站頁面（Bus ETA Page）
      </label>
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
</style>
