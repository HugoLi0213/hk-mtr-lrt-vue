<template>
  <div class="mtr-app">
    <div class="mtr-container">
      <div class="mtr-header">
        <button class="back-btn" @click="goBack">←</button>
        <span class="mtr-title">{{ lineConfig.zh }}</span>
        <button class="refresh-btn" :disabled="loading" @click="fetchTrainData">
          <span v-if="loading">⟳</span>
          <span v-else>⟳</span>
        </button>
      </div>
      <div class="mtr-line-selector">
        <div class="chips">
          <button v-for="(config, code) in MTR_LINES" :key="code"
            :class="['chip', { selected: selectedLine === code }]"
            :style="{ background: selectedLine === code ? config.color : 'transparent', color: selectedLine === code ? 'white' : config.color, border: `1px solid ${config.color}` }"
            @click="handleLineChange(code as MtrLineCode)">
            {{ config.zh }}
          </button>
        </div>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <div class="direction-toggle">
        <button :class="{ active: direction === 'UP' }" @click="direction = 'UP'">{{ getTerminusNames.up }}</button>
        <button :class="{ active: direction === 'DOWN' }" @click="direction = 'DOWN'">{{ getTerminusNames.down }}</button>
      </div>
      <div class="mtr-table-wrapper">
        <table class="mtr-table">
          <thead>
            <tr>
              <th>班次</th>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="([stationCode, stationName]) in stationRows" :key="stationCode">
              <td class="station-name">{{ stationName[lang] }} ({{ stationCode }})</td>
              <td v-for="i in 4" :key="i">
                <template v-if="getEta(stationCode, i-1)">
                  <div class="eta-time">{{ formatTime(getEta(stationCode, i-1)?.time || '') }}</div>
                  <div class="eta-dest">({{ getDestName(getEta(stationCode, i-1)?.dest || '') }})</div>
                </template>
                <template v-else>-</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Mini Settings Button -->
      <div class="mini-settings">
        <button 
          class="mini-settings-btn" 
          @click="toggleSettingsPanel"
          :class="{ expanded: showSettingsPanel }"
        >
          <span class="settings-icon">⚙️</span>
          <span class="settings-text">設定</span>
          <span class="expand-icon">{{ showSettingsPanel ? '▲' : '▼' }}</span>
        </button>
        
        <!-- Expandable Settings Panel -->
        <div v-if="showSettingsPanel" class="settings-panel">
          <div class="settings-item" @click="toggleAutoDbRenew">
            <span class="item-icon">{{ autoRenew ? '🔁' : '⏸️' }}</span>
            <div class="item-content">
              <div class="item-title">自動更新路線資料</div>
              <div class="item-status">{{ autoRenew ? '開啟' : '關閉' }}</div>
            </div>
          </div>
          
          <div class="settings-item" @click="toggleGeo">
            <span class="item-icon">{{ geoPermission === 'granted' ? '📍' : '🚫' }}</span>
            <div class="item-content">
              <div class="item-title">地理位置定位功能</div>
              <div class="item-status">{{ geoPermission === 'granted' ? '開啟' : geoPermission === 'opening' ? '開啟中...' : '關閉' }}</div>
            </div>
          </div>
          
          <div class="settings-item" @click="openPersonalizeDialog">
            <span class="item-icon">😊</span>
            <div class="item-content">
              <div class="item-title">個性化設定</div>
              <div class="item-status">震動、資料管理等</div>
            </div>
          </div>
          
          <div v-if="showGeoPermissionDenied" class="settings-snackbar">無法獲得地理位置定位功能權限</div>
          <div v-if="updating" class="settings-snackbar">資料更新中...</div>
        </div>
      </div>

      
      <!-- Personalize Dialog -->
      <PersonalizeDialog :open="showPersonalizeDialog" @close="showPersonalizeDialog = false" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import PersonalizeDialog from '../../components/settings/PersonalizeDialog.vue';
import { useTheme } from '../../composables/useTheme';
import { MTR_LINES } from '../../constants/mtrLines';
import type { Direction, Language, LineConfig, MtrLineCode, StationConfig, StationData, TrainArrival } from '../../types/train';

// Initialize theme system
useTheme();

const lang = ref<Language>('zh'); // TODO: Replace with actual language logic
const selectedLine = ref<MtrLineCode>('TML');
const trainData = ref<Record<string, StationData>>({});
const currentTime = ref('');
const loading = ref(false);
const error = ref('');
const lastUpdate = ref<Date|null>(null);
const direction = ref<Direction>('UP');

const lineConfig = computed<LineConfig>(() => (MTR_LINES as Record<MtrLineCode, LineConfig>)[selectedLine.value]);



const goBack = () => window.history.back();

const handleLineChange = (code: MtrLineCode) => {
  // Special handling for Light Rail - redirect to dedicated LRT page
  if (code === 'LRT') {
    // Create and navigate to the LRT page
    navigateToLightRail();
    return;
  }
  
  selectedLine.value = code;
  fetchTrainData();
};

const navigateToLightRail = () => {
  // For now, we'll replace the current content with LRT page
  // In a real router setup, this would be: router.push('/light-rail')
  window.location.hash = '#/light-rail';
  
  // Show a loading message and then navigate
  setTimeout(() => {
    showLightRailInterface();
  }, 500);
};

const showLightRailInterface = () => {
  // This is a simple way to switch to LRT without full routing
  // In practice, you'd use Vue Router
  const event = new CustomEvent('navigate-to-lrt');
  window.dispatchEvent(event);
};

const formatTime = (time: string) => time ? time.replace(/^[0-9-]* /, '').replace(/:[0-9]*$/, '') : '-';

const fetchTrainData = async () => {
  loading.value = true;
  error.value = '';
  try {
    const stations = Object.keys(lineConfig.value.stations);
    const promises = stations.map(station =>
      fetch(`https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${selectedLine.value}&sta=${station}`)
        .then(res => res.json())
    );
    const responses = await Promise.all(promises);
    const newTrainData: Record<string, StationData> = {};
    let currentTimeFromApi = '';
    responses.forEach((response, idx) => {
      const stationCode = stations[idx];
      const stationKey = `${selectedLine.value}-${stationCode}`;
      if (response.data && response.data[stationKey]) {
        newTrainData[stationCode] = response.data[stationKey];
      }
      if (!currentTimeFromApi && response.curr_time) {
        currentTimeFromApi = response.curr_time;
      }
    });
    trainData.value = newTrainData;
    currentTime.value = currentTimeFromApi;
    lastUpdate.value = new Date();
  } catch (e) {
    error.value = '無法載入港鐵數據';
  } finally {
    loading.value = false;
  }
};

// Settings logic
const autoRenew = ref(true);
const geoPermission = ref('closed');
const updating = ref(false);
const showGeoPermissionDenied = ref(false);
const showPersonalizeDialog = ref(false);
const showSettingsPanel = ref(false);

function toggleAutoDbRenew() {
  autoRenew.value = !autoRenew.value;
}

function toggleSettingsPanel() {
  showSettingsPanel.value = !showSettingsPanel.value;
}

function toggleGeo() {
  if (geoPermission.value === 'granted') {
    geoPermission.value = 'closed';
  } else {
    geoPermission.value = 'opening';
    setTimeout(() => {
      geoPermission.value = 'granted';
    }, 1000);
  }
}
function openPersonalizeDialog() {
  showPersonalizeDialog.value = true;
}

const getTerminusNames = computed(() => {
  const stations = Object.keys(lineConfig.value.stations);
  const first = stations[0];
  const last = stations[stations.length - 1];
  return {
    up: lineConfig.value.stations[first][lang.value],
    down: lineConfig.value.stations[last][lang.value]
  };
});

const stationRows = computed(() => {
  const entries = Object.entries(lineConfig.value.stations);
  return direction.value === 'UP' ? [...entries].reverse() : entries;
});

const getEta = (stationCode: string, idx: number): TrainArrival | undefined => {
  return trainData.value[stationCode]?.[direction.value]?.[idx];
};

const getDestName = (dest: string) => {
  return (lineConfig.value.stations as Record<string, StationConfig>)[dest]?.[lang.value] || dest;
};

// Auto-fetch data on mount
onMounted(() => {
  fetchTrainData();
});
</script>

<style scoped>
.mtr-app {
  min-height: 100vh;
  background: var(--color-background, #f5f5f7);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background-color 0.3s ease;
}

.mtr-container {
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  background: var(--color-surface, #fff);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

[data-theme="dark"] .mtr-container {
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.mtr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn, .refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.2em;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover, .refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mtr-title {
  font-weight: 600;
  font-size: 1.1em;
  text-align: center;
  flex: 1;
}

.mtr-line-selector {
  padding: 6px 12px 10px 12px; /* 適度減少padding */
  background: var(--color-tableHeader, #f8f9fa);
  border-bottom: 1px solid var(--color-border, #e9ecef);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px; /* 適度間距，避免誤觸但不會太大 */
  margin-top: 6px; /* 適度上邊距 */
  justify-content: center;
}

.chip {
  border-radius: 14px; /* 適度圓角 */
  padding: 4px 10px; /* 適度padding，不會太大 */
  font-size: 0.55em; /* 適度字體大小 */
  font-weight: 600;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-width: 50px; /* 適度最小寬度 */
  text-align: center;
}

.chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chip.selected {
  font-weight: 700;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.direction-toggle {
  display: flex;
  justify-content: center;
  gap: 0;
  margin: 20px 20px;
  background: #f1f3f4;
  border-radius: 12px;
  padding: 4px;
}

.direction-toggle button {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1em;
  font-weight: 600;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #5f6368;
}

.direction-toggle button.active {
  background: #1a73e8;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
}

.mtr-table-wrapper {
  margin: 0 20px 20px 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.mtr-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-surface, white);
  font-size: 0.9em;
  transition: background-color 0.3s ease;
}

.mtr-table th {
  background: var(--color-tableHeader, #f8f9fa);
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  color: var(--color-text, #495057);
  border-bottom: 2px solid var(--color-border, #e9ecef);
  position: sticky;
  top: 0;
  z-index: 5;
}

.mtr-table td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid var(--color-border, #f1f3f4);
  vertical-align: middle;
  color: var(--color-text, #000);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.mtr-table tbody tr:hover {
  background: var(--color-tableHeader, #f8f9fa);
}

.station-name {
  font-weight: 600;
  text-align: left !important;
  color: var(--color-text, #495057);
  min-width: 100px;
  max-width: 120px;
  word-wrap: break-word;
}

.eta-time {
  font-weight: 700;
  font-size: 1em;
  color: #1a73e8;
  margin-bottom: 2px;
}

.eta-dest {
  font-size: 0.8em;
  color: #6c757d;
  font-weight: 500;
}

.error {
  color: var(--color-error, #dc3545);
  text-align: center;
  margin: 16px 20px;
  font-weight: 500;
  padding: 12px;
  background: rgba(248, 215, 218, 0.3);
  border-radius: 8px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.mtr-settings {
  margin: 0;
  padding: 20px;
  background: var(--color-surface, #fff);
  transition: background-color 0.3s ease;
}

.mtr-settings h2 {
  margin: 0 0 16px 0;
  font-size: 1.3em;
  font-weight: 700;
  color: #343a40;
  text-align: center;
}

.settings-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface, white);
  border: 2px solid var(--color-cardBorder, #e9ecef);
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  color: var(--color-text, #000);
}

.settings-btn:hover {
  background: var(--color-tableHeader, #f8f9fa);
  border-color: var(--color-primary, #1a73e8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.settings-btn .icon {
  margin-right: 12px;
  font-size: 1.3em;
  min-width: 24px;
}

.settings-btn .version, .settings-btn .desc {
  color: var(--color-textSecondary, #6c757d);
  font-size: 0.9em;
  font-weight: 500;
}

.snackbar {
  background: var(--color-text, #343a40);
  color: var(--color-surface, white);
  padding: 12px 20px;
  border-radius: 12px;
  margin-top: 16px;
  text-align: center;
  font-size: 0.95em;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Mini Settings Styles */
.mini-settings {
  position: relative;
  margin: 0 20px 20px 20px;
}

.mini-settings-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16px;
  padding: 16px 20px;
  color: white;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.mini-settings-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
}

.mini-settings-btn.expanded {
  border-radius: 16px 16px 0 0;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.settings-icon {
  font-size: 1.3em;
  margin-right: 12px;
}

.settings-text {
  flex: 1;
  text-align: left;
}

.expand-icon {
  font-size: 0.9em;
  transition: transform 0.3s ease;
}

.mini-settings-btn.expanded .expand-icon {
  transform: rotate(180deg);
}

.settings-panel {
  background: var(--color-surface, white);
  border: 2px solid #667eea;
  border-top: none;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.2);
  overflow: hidden;
  animation: slideDown 0.3s ease-out;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--color-border, #e9ecef);
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:hover {
  background: var(--color-tableHeader, #f8f9fa);
  transform: translateX(4px);
}

.item-icon {
  font-size: 1.3em;
  margin-right: 16px;
  min-width: 24px;
  text-align: center;
}

.item-content {
  flex: 1;
}

.item-title {
  font-weight: 600;
  color: var(--color-text, #343a40);
  font-size: 1em;
  margin-bottom: 2px;
  transition: color 0.3s ease;
}

.item-status {
  font-size: 0.9em;
  color: var(--color-textSecondary, #6c757d);
  font-weight: 500;
  transition: color 0.3s ease;
}

.settings-snackbar {
  background: var(--color-text, #343a40);
  color: var(--color-surface, white);
  padding: 12px 20px;
  text-align: center;
  font-size: 0.95em;
  font-weight: 500;
  margin: 0;
  animation: fadeIn 0.3s ease-out;
  transition: background-color 0.3s ease, color 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .mtr-app {
    padding: 4px;
  }
  
  .mtr-container {
    border-radius: 12px;
  }
  
  .mtr-header {
    padding: 12px 16px;
  }
  
  .mtr-title {
    font-size: 1em;
  }
  
  .chips {
    gap: 5px; /* 手機版適度間距 */
  }
  
  .chip {
    padding: 4px 8px; /* 手機版適度padding */
    font-size: 0.5em; /* 手機版適度字體大小 */
    min-width: 45px; /* 手機版適度最小寬度 */
    border-radius: 12px; /* 手機版適度圓角 */
  }
  
  .mtr-table-wrapper {
    margin: 0 12px 16px 12px;
  }
  
  .mtr-table th, .mtr-table td {
    padding: 8px 4px;
    font-size: 0.85em;
  }
  
  .station-name {
    font-size: 0.8em;
    min-width: 80px;
    max-width: 100px;
  }
  
  .mini-settings {
    margin: 0 12px 16px 12px;
  }
  
  .mini-settings-btn {
    padding: 12px 16px;
    font-size: 0.95em;
  }
  
  .settings-item {
    padding: 12px 16px;
  }
  
  .item-title {
    font-size: 0.95em;
  }
  
  .item-status {
    font-size: 0.85em;
  }
  
  .settings-btn {
    padding: 12px 16px;
    font-size: 0.95em;
  }
}

/* ============================================ */
/* DARK MODE SUPPORT FOR MTR TRAIN PAGE */
/* ============================================ */

[data-theme="dark"] .mtr-app {
  background: var(--color-background);
  color: var(--color-text);
}

[data-theme="dark"] .mtr-container {
  background: var(--color-surface);
  border-color: var(--color-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .mtr-header {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-variant) 100%);
  border-bottom-color: var(--color-border);
}

[data-theme="dark"] .mtr-title {
  color: var(--color-text);
}

[data-theme="dark"] .back-btn,
[data-theme="dark"] .refresh-btn {
  background: var(--color-surface-variant);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

[data-theme="dark"] .back-btn:hover,
[data-theme="dark"] .refresh-btn:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

[data-theme="dark"] .mtr-line-selector {
  background: var(--color-surface);
  border-color: var(--color-border);
}

[data-theme="dark"] .chip {
  background: var(--color-surface-variant) !important;
  color: var(--color-text) !important;
  border-color: var(--color-border) !important;
}

[data-theme="dark"] .chip.selected {
  background: var(--color-primary) !important;
  color: var(--color-on-primary) !important;
  border-color: var(--color-primary) !important;
}

[data-theme="dark"] .chip:hover {
  background: var(--color-primary-container) !important;
}

[data-theme="dark"] .direction-toggle {
  background: var(--color-surface);
}

[data-theme="dark"] .direction-toggle button {
  background: var(--color-surface-variant);
  color: var(--color-text);
  border-color: var(--color-border);
}

[data-theme="dark"] .direction-toggle button.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

[data-theme="dark"] .mtr-table-wrapper {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .mtr-table {
  background: var(--color-surface);
  color: var(--color-text);
}

[data-theme="dark"] .mtr-table th {
  background: var(--color-surface-variant);
  color: var(--color-text);
  border-bottom-color: var(--color-border);
}

[data-theme="dark"] .mtr-table td {
  color: var(--color-text);
  border-bottom-color: var(--color-border);
}

[data-theme="dark"] .mtr-table tbody tr:hover {
  background: var(--color-surface-variant);
}

[data-theme="dark"] .station-name {
  color: var(--color-text);
}

[data-theme="dark"] .eta-time {
  color: var(--color-primary);
}

[data-theme="dark"] .eta-dest {
  color: var(--color-text-secondary);
}

[data-theme="dark"] .error {
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

[data-theme="dark"] .mini-settings-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, #5a6fd8 100%);
  color: var(--color-on-primary);
  box-shadow: 0 4px 20px rgba(124, 146, 247, 0.3);
}

[data-theme="dark"] .mini-settings-btn:hover {
  box-shadow: 0 6px 25px rgba(124, 146, 247, 0.4);
}

[data-theme="dark"] .settings-panel {
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .settings-item {
  border-bottom-color: var(--color-border);
}

[data-theme="dark"] .settings-item:hover {
  background: var(--color-surface-variant);
}

[data-theme="dark"] .item-title {
  color: var(--color-text);
}

[data-theme="dark"] .item-status {
  color: var(--color-text-secondary);
}

[data-theme="dark"] .settings-snackbar {
  background: var(--color-surface-variant);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

[data-theme="dark"] .settings-btn {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

[data-theme="dark"] .settings-btn:hover {
  background: var(--color-surface-variant);
  border-color: var(--color-primary);
}

[data-theme="dark"] .settings-btn .version,
[data-theme="dark"] .settings-btn .desc {
  color: var(--color-text-secondary);
}

[data-theme="dark"] .snackbar {
  background: var(--color-surface-variant);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

/* Fix font sizes specifically */
[data-theme="dark"] .chip,
[data-theme="light"] .chip {
  font-size: var(--font-size-base) !important;
}

[data-theme="dark"] .mtr-table,
[data-theme="light"] .mtr-table {
  font-size: var(--font-size-table) !important;
}
</style>
