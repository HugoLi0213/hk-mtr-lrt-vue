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
      
      <!-- Peak Hour Indicator -->
      <!-- <PeakHourIndicator 
        v-if="!error && !loading"
        :lineCode="selectedLine"
        :showStats="true"
      /> -->
      
      <!-- Error State -->
      <div v-if="error" class="error">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <div class="error-title">{{ error.title }}</div>
          <div class="error-message">{{ error.message }}</div>
        </div>
        <button class="retry-btn" @click="fetchTrainData">
          <span class="retry-icon">🔄</span>
          <span>重試 Retry</span>
        </button>
      </div>

      <!-- Empty State (No Data) -->
      <div v-else-if="!loading && Object.keys(trainData).length === 0" class="empty-state">
        <div class="empty-icon">🚆</div>
        <h3 class="empty-title">沒有可用的班次資訊</h3>
        <p class="empty-message">No train schedule available</p>
        <button class="reload-btn" @click="fetchTrainData">
          <span class="reload-icon">⟳</span>
          <span>重新載入 Reload</span>
        </button>
      </div>

      <!-- Normal State: Direction Toggle and Table -->
      <div v-else>
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
              <!-- Loading Skeleton -->
              <tr v-if="loading && Object.keys(trainData).length === 0" v-for="n in 12" :key="`skeleton-${n}`">
                <td class="station-name">
                  <div class="skeleton skeleton-line"></div>
                </td>
                <td v-for="i in 4" :key="i">
                  <div class="skeleton skeleton-box"></div>
                </td>
              </tr>
              
              <!-- Actual Data -->
              <tr v-else v-for="([stationCode, stationName]) in stationRows" :key="stationCode">
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
      </div>
        <!-- Mini Settings Button -->
      <div class="mini-settings">
        <button 
          class="mini-settings-btn" 
          @click="toggleSettingsPanel"
          :class="{ expanded: showSettingsPanel }"
        >
          <span class="settings-icon">🎨</span>
          <span class="settings-text">外觀</span>
          <span class="expand-icon">{{ showSettingsPanel ? '▲' : '▼' }}</span>
        </button>
        
        <!-- Expandable Settings Panel -->
        <div v-if="showSettingsPanel" class="settings-panel">
          <div class="settings-item" @click="setTheme('light')">
            <span class="item-icon">☀️</span>
            <div class="item-content">
              <div class="item-title">淺色模式</div>
              <div class="item-status">{{ !isDarkMode ? '已選擇' : '點擊切換' }}</div>
            </div>
          </div>
          
          <div class="settings-item" @click="setTheme('dark')">
            <span class="item-icon">🌙</span>
            <div class="item-content">
              <div class="item-title">深色模式</div>
              <div class="item-status">{{ isDarkMode ? '已選擇' : '點擊切換' }}</div>          </div>        </div>
      </div>
      
      <!-- App Title Section - Outside Settings -->
      <div class="app-title-section">
        <div class="app-title-small">HKMTRVUE</div>
      </div>
    </div>
  </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useTheme } from '../../composables/useTheme';
import { MTR_LINES } from '../../constants/mtrLines';
import type { Direction, Language, LineConfig, MtrLineCode, StationConfig, StationData, TrainArrival } from '../../types/train';
// import PeakHourIndicator from '../../components/PeakHourIndicator.vue';
import { frequencyAnalyzer } from '../../utils/trainFrequencyAnalyzer';

// Initialize theme system
const { isDarkMode, setThemeMode } = useTheme();

const lang = ref<Language>('zh'); // TODO: Replace with actual language logic
const selectedLine = ref<MtrLineCode>('TML');
const trainData = ref<Record<string, StationData>>({});
const currentTime = ref('');
const loading = ref(false);
const error = ref<{ title: string; message: string } | null>(null);
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
  error.value = null;
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
    
    // Record train frequency for peak hour analysis
    Object.keys(newTrainData).forEach(stationCode => {
      const upTrains = newTrainData[stationCode]?.UP || [];
      const downTrains = newTrainData[stationCode]?.DOWN || [];
      
      if (upTrains.length > 0) {
        frequencyAnalyzer.recordFrequency(stationCode, selectedLine.value, 'UP', [...upTrains]);
      }
      if (downTrains.length > 0) {
        frequencyAnalyzer.recordFrequency(stationCode, selectedLine.value, 'DOWN', [...downTrains]);
      }
    });
  } catch (e: any) {
    // Provide detailed, bilingual error messages
    if (!navigator.onLine) {
      error.value = {
        title: '網絡連接失敗 Network Error',
        message: '請檢查您的互聯網連接 Please check your internet connection'
      };
    } else if (e.message?.includes('fetch') || e.message?.includes('Failed to fetch')) {
      error.value = {
        title: '無法連接伺服器 Cannot Connect to Server',
        message: '政府數據伺服器暫時無法連接，請稍後再試 Government data server temporarily unavailable'
      };
    } else if (e.status === 404) {
      error.value = {
        title: '找不到資料 Data Not Found',
        message: '車站代碼可能有誤 Station code may be incorrect'
      };
    } else {
      error.value = {
        title: '載入失敗 Loading Failed',
        message: '無法載入港鐵數據，請重試 Unable to load MTR data, please retry'
      };
    }
  } finally {
    loading.value = false;
  }
};

// Settings logic - only theme switching
const showSettingsPanel = ref(false);

function toggleSettingsPanel() {
  showSettingsPanel.value = !showSettingsPanel.value;
}

function setTheme(mode: 'light' | 'dark') {
  setThemeMode(mode);
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
  // First try current line's stations
  const currentLineStation = (lineConfig.value.stations as Record<string, StationConfig>)[dest]?.[lang.value];
  if (currentLineStation) return currentLineStation;
  
  // If not found, search all MTR lines for this station code
  for (const lineCode of Object.keys(MTR_LINES)) {
    const line = (MTR_LINES as Record<string, LineConfig>)[lineCode];
    const stationName = (line.stations as Record<string, StationConfig>)[dest]?.[lang.value];
    if (stationName) return stationName;
  }
  
  // If still not found, return the code itself
  return dest;
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

/* Error State Styles */
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 32px 20px;
  padding: 24px;
  background: rgba(248, 215, 218, 0.3);
  border: 2px solid rgba(220, 53, 69, 0.3);
  border-radius: 12px;
  animation: fadeIn 0.3s ease;
}

.error-icon {
  font-size: 3rem;
  animation: shake 0.5s ease;
}

.error-content {
  text-align: center;
}

.error-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-error, #dc3545);
  margin-bottom: 8px;
}

.error-message {
  font-size: 0.95rem;
  color: var(--color-text-secondary, #6c757d);
  line-height: 1.5;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-error, #dc3545);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.retry-icon {
  font-size: 1.2rem;
}

/* Empty State Styles */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  margin: 20px;
  text-align: center;
  animation: fadeIn 0.5s ease;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text, #343a40);
  margin: 0 0 8px 0;
}

.empty-message {
  font-size: 1rem;
  color: var(--color-text-secondary, #6c757d);
  margin: 0 0 24px 0;
}

.reload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.reload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.reload-icon {
  font-size: 1.3rem;
}

/* Loading Skeleton Styles */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-line {
  height: 16px;
  width: 80%;
  margin: 0 auto;
}

.skeleton-box {
  height: 40px;
  width: 90%;
  margin: 0 auto;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Dark mode skeleton */
[data-theme="dark"] .skeleton {
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
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

/* App Title Section */
.app-title-section {
  margin: 8px 20px 16px 20px;
  padding: 6px 12px;
  text-align: center;
  background: var(--color-surface, #fff);
  border-radius: 8px;
  border: 1px solid var(--color-border, #e9ecef);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.app-title-small {
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-secondary, #6c757d);
}

.app-subtitle-small {
  font-size: 12px;
  color: var(--color-text-secondary, #6c757d);
  font-weight: 500;
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
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
}

[data-theme="dark"] .error-title {
  color: #ff6b6b;
}

[data-theme="dark"] .retry-btn {
  background: #c82333;
}

[data-theme="dark"] .retry-btn:hover {
  background: #bd2130;
}

[data-theme="dark"] .empty-state {
  color: var(--color-text);
}

[data-theme="dark"] .empty-title {
  color: var(--color-text);
}

[data-theme="dark"] .reload-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, #5a6fd8 100%);
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

[data-theme="dark"] .app-title-section {
  background: var(--color-surface);
  border-color: var(--color-border);
}

[data-theme="dark"] .app-title-small {
  color: var(--color-text-secondary);
}

[data-theme="dark"] .app-subtitle-small {
  color: var(--color-text-secondary);
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
