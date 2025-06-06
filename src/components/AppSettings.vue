<template>
  <div class="settings-overlay" v-if="isOpen" @click="closeSettings">
    <div class="settings-modal" @click.stop>
      <div class="settings-header">
        <h2>設定</h2>
        <button class="close-btn" @click="closeSettings">✕</button>
      </div>
      
      <div class="settings-content">
        <!-- Theme Settings -->
        <div class="setting-group">
          <h3>主題</h3>
          <div class="theme-options">
            <label class="theme-option">
              <input 
                type="radio" 
                name="theme" 
                value="system" 
                :checked="themeMode === 'system'"
                @change="handleThemeChange"
              >
              <span>🔧 跟隨系統</span>
            </label>
            <label class="theme-option">
              <input 
                type="radio" 
                name="theme" 
                value="light" 
                :checked="themeMode === 'light'"
                @change="handleThemeChange"
              >
              <span>☀️ 淺色模式</span>
            </label>
            <label class="theme-option">
              <input 
                type="radio" 
                name="theme" 
                value="dark" 
                :checked="themeMode === 'dark'"
                @change="handleThemeChange"
              >
              <span>🌙 深色模式</span>
            </label>
          </div>
        </div>

        <!-- Font Size Settings -->
        <div class="setting-group">
          <h3>字體大小</h3>
          <div class="font-size-control">
            <label for="font-size-slider">基礎字體大小: {{ fontSize }}px</label>
            <input 
              id="font-size-slider"
              type="range" 
              min="12" 
              max="32" 
              step="2"
              :value="fontSize"
              @input="handleFontSizeChange"
              class="font-size-slider"
            >
            <div class="font-size-preview">
              <span :style="{ fontSize: fontSize + 'px' }">預覽文字 ({{ fontSize }}px)</span>
            </div>
          </div>
        </div>

        <!-- App Info -->
        <div class="setting-group">
          <h3>關於</h3>
          <p class="app-info">
            港鐵列車即時班次 v1.0<br>
            支援所有港鐵線路及輕鐵<br>
            資料來源：港鐵公司開放數據
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useTheme, type ThemeMode } from '../composables/useTheme';

const { themeMode, fontSize, setThemeMode, setFontSize } = useTheme()

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function closeSettings() {
  emit('close')
}

function handleThemeChange(event: Event) {
  const target = event.target as HTMLInputElement
  setThemeMode(target.value as ThemeMode)
}

function handleFontSizeChange(event: Event) {
  const target = event.target as HTMLInputElement
  setFontSize(parseInt(target.value, 10))
}
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.settings-modal {
  background: var(--color-surface);
  border-radius: 1rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.settings-header h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: var(--color-border);
}

.settings-content {
  padding: 1.5rem;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group h3 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  font-size: 1.2rem;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  transition: all 0.2s;
  color: var(--color-text);
}

.theme-option:hover {
  background: var(--color-border);
}

.theme-option input[type="radio"] {
  margin: 0;
}

.font-size-control {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.font-size-control label {
  color: var(--color-text);
  font-weight: 500;
}

.font-size-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--color-border);
  outline: none;
  appearance: none;
}

.font-size-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

.font-size-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
}

.font-size-preview {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  text-align: center;
  background: var(--color-background);
}

.font-size-preview span {
  color: var(--color-text);
  transition: font-size 0.2s;
}

.app-info {
  color: var(--color-textSecondary);
  line-height: 1.5;
  margin: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .settings-modal {
    margin: 0;
    border-radius: 1rem 1rem 0 0;
    position: absolute;
    bottom: 0;
    max-height: 70vh;
  }
  
  .settings-overlay {
    align-items: flex-end;
    padding: 0;
  }
}

[data-theme="dark"] .settings-modal {
  background: #232323;
  border: 1px solid #444;
}
[data-theme="dark"] .settings-header h2,
[data-theme="dark"] .setting-group h3,
[data-theme="dark"] .font-size-control label,
[data-theme="dark"] .font-size-preview span {
  color: #ffe066;
}
[data-theme="dark"] .settings-header,
[data-theme="dark"] .settings-content {
  background: #232323;
}
[data-theme="dark"] .theme-option {
  background: #181818;
  border: 1px solid #444;
  color: #ffe066;
}
[data-theme="dark"] .theme-option:hover {
  background: #333;
}
[data-theme="dark"] .font-size-control {
  background: transparent;
}
[data-theme="dark"] .font-size-preview {
  background: #181818;
  border: 1px solid #444;
}
[data-theme="dark"] .close-btn {
  color: #ffe066;
}
[data-theme="dark"] .close-btn:hover {
  background: #333;
}
[data-theme="dark"] .app-info {
  color: #ccc;
}
</style>
