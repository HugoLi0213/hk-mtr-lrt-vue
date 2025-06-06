<template>
  <div class="options-list">
    <button class="setting-btn" @click="$emit('go-to-manage')">
      <span class="btn-icon">📋</span>
      <span class="btn-text">管理收藏</span>
    </button>
    
    <button class="setting-btn" @click="toggleDarkMode">
      <span class="btn-icon">{{ isDarkMode ? '🌙' : '☀️' }}</span>
      <span class="btn-text">{{ isDarkMode ? '深色模式' : '淺色模式' }}</span>
    </button>
    
    <button class="setting-btn" @click="toggleAutoRefresh">
      <span class="btn-icon">{{ autoRefresh ? '🔄' : '⏸️' }}</span>
      <span class="btn-text">自動更新</span>
      <span class="btn-status">{{ autoRefresh ? '開啟' : '關閉' }}</span>
    </button>
    
    <button class="setting-btn" @click="toggleVibration">
      <span class="btn-icon">{{ vibrationEnabled ? '📳' : '🔇' }}</span>
      <span class="btn-text">按鍵震動</span>
      <span class="btn-status">{{ vibrationEnabled ? '開啟' : '關閉' }}</span>
    </button>
    
    <div class="divider"></div>
    
    <button class="setting-btn danger" @click="clearData">
      <span class="btn-icon">🗑️</span>
      <span class="btn-text">清除所有資料</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface Emits {
  (e: 'go-to-manage'): void;
}

defineEmits<Emits>();

// Simplified settings state
const isDarkMode = ref(false);
const autoRefresh = ref(true);
const vibrationEnabled = ref(true);

// Action functions
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  // Apply dark mode to document
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
};

const toggleVibration = () => {
  vibrationEnabled.value = !vibrationEnabled.value;
};

const clearData = () => {
  if (confirm('確定要清除所有資料嗎？此操作無法復原。')) {
    localStorage.clear();
    sessionStorage.clear();
    alert('所有資料已清除');
  }
};
</script>

<style scoped>
.options-list {
  max-height: 60vh;
  overflow-y: auto;
  padding: 8px;
}

.setting-btn {
  width: 100%;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.setting-btn:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.setting-btn:active {
  transform: translateY(0);
}

.setting-btn.danger {
  border-color: #ffcdd2;
  background: #fff5f5;
}

.setting-btn.danger:hover {
  background: #ffebee;
}

.btn-icon {
  font-size: 1.5em;
  margin-right: 12px;
  width: 32px;
  display: flex;
  justify-content: center;
}

.btn-text {
  flex: 1;
  text-align: left;
  font-weight: 500;
}

.btn-status {
  font-size: 0.9em;
  color: #666;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 6px;
}

.divider {
  height: 1px;
  background: #e0e0e0;
  margin: 16px 0;
}
</style>
