<template>
  <div class="options-list">
    <!-- Theme Toggle -->
    <div class="theme-section">
      <h3 class="section-title">外觀</h3>
      <div class="theme-toggle-container">
        <div class="theme-selector">
          <button 
            v-for="mode in themeOptions" 
            :key="mode.value"
            :class="['theme-btn', { active: themeMode === mode.value }]"
            @click="setThemeMode(mode.value)"
          >
            <span class="theme-icon">{{ mode.icon }}</span>
            <span class="theme-label">{{ mode.label }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <!-- Settings -->
    <h3 class="section-title">功能設定</h3>
    
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
import type { ThemeMode } from '../../composables/useTheme';
import { useTheme } from '../../composables/useTheme';

// Theme management
const { themeMode, setThemeMode } = useTheme();

// Theme options
const themeOptions = [
  { value: 'light' as ThemeMode, icon: '☀️', label: '淺色' },
  { value: 'dark' as ThemeMode, icon: '🌙', label: '深色' },
  { value: 'system' as ThemeMode, icon: '⚙️', label: '跟隨系統' }
];

// Settings state
const autoRefresh = ref(true);
const vibrationEnabled = ref(true);

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

.section-title {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
  margin: 0 0 12px 0;
  padding: 0 4px;
}

.theme-section {
  margin-bottom: 20px;
}

.theme-toggle-container {
  padding: 4px;
}

.theme-selector {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.theme-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: var(--color-surface, white);
  border: 2px solid var(--color-cardBorder, #e0e0e0);
  border-radius: 12px;
  padding: 16px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
  position: relative;
  overflow: hidden;
  color: var(--color-text, #000);
}

.theme-btn:hover {
  background: var(--color-tableHeader, #f8f9fa);
  border-color: var(--color-primary, #1a73e8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.2);
}

.theme-btn.active {
  background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
  border-color: #1a73e8;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(26, 115, 232, 0.3);
}

.theme-btn.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.theme-icon {
  font-size: 1.8em;
  margin-bottom: 4px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.theme-label {
  font-weight: 500;
  font-size: 0.95em;
  text-align: center;
}

.theme-btn.active .theme-label {
  font-weight: 600;
}

.setting-btn {
  width: 100%;
  display: flex;
  align-items: center;
  background: var(--color-surface, white);
  border: 1px solid var(--color-cardBorder, #e0e0e0);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: var(--color-text, #000);
}

.setting-btn:hover {
  background: var(--color-tableHeader, #f8f9fa);
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
  color: var(--color-textSecondary, #666);
  background: var(--color-tableHeader, #f0f0f0);
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.divider {
  height: 1px;
  background: var(--color-border, #e0e0e0);
  margin: 16px 0;
  transition: background-color 0.3s ease;
}

/* Responsive design */
@media (max-width: 480px) {
  .theme-selector {
    gap: 6px;
  }
  
  .theme-btn {
    padding: 12px 8px;
    font-size: 0.85em;
  }
  
  .theme-icon {
    font-size: 1.5em;
  }
  
  .theme-label {
    font-size: 0.85em;
  }
  
  .setting-btn {
    padding: 12px;
    font-size: 0.95em;
  }
}
</style>
