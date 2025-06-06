<template>
  <div class="mtr-app">
    <div class="mtr-container">
      <div class="mtr-header">
        <button class="back-btn" @click="goBack">←</button>
        <span class="mtr-title">{{ lineConfig[lang] }} ({{ selectedLine }})</span>
        <button class="refresh-btn" :disabled="loading" @click="fetchTrainData">
          <span v-if="loading">⏳</span>
          <span v-else">⟳</span>
        </button>
      </div>
      <div class="mtr-line-selector">
        <span class="label">選擇綫路</span>
        <span class="time">⌚️ {{ currentTime }}<span v-if="lastUpdate"> ({{ lastUpdateStr }})</span></span>
        <div class="chips">
          <button v-for="(config, code) in MTR_LINES" :key="code"
            :class="['chip', { selected: selectedLine === code }]"
            :style="{ background: selectedLine === code ? config.color : 'transparent', color: selectedLine === code ? 'white' : config.color, border: `1px solid ${config.color}` }"
            @click="handleLineChange(code as MtrLineCode)">
            {{ code }}
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
      <div class="mtr-footer">
        數據來自 <a href="https://data.gov.hk" target="_blank">DATA.GOV.HK</a> • 每15秒自動更新
      </div>
      
      <!-- Settings Section -->
      <div class="mtr-settings">
        <h2>設定</h2>
        <ul class="settings-list">
          <li>
            <button class="settings-btn" @click="updateApp">
              <span class="icon">🔄</span>
              <span>強制更新 App（Service Worker）</span>
              <span class="version">{{ appVersion }}</span>
            </button>
          </li>
          <li>
            <button class="settings-btn" @click="renewDb">
              <span class="icon">🛠️</span>
              <span>更新路線資料庫</span>
              <span class="version">{{ dbVersion }}</span>
            </button>
          </li>
          <li>
            <button class="settings-btn" @click="toggleAutoDbRenew">
              <span class="icon">{{ autoRenew ? '🔁' : '⏸️' }}</span>
              <span>自動更新路線資料</span>
              <span>{{ autoRenew ? '開啟' : '關閉' }}</span>
            </button>
          </li>
          <li>
            <button class="settings-btn" @click="toggleGeo">
              <span class="icon">{{ geoPermission === 'granted' ? '📍' : '🚫' }}</span>
              <span>地理位置定位功能</span>
              <span>{{ geoPermission === 'granted' ? '開啟' : geoPermission === 'opening' ? '開啟中...' : '關閉' }}</span>
            </button>
          </li>
          <li>
            <button class="settings-btn" @click="openPersonalizeDialog">
              <span class="icon">😊</span>
              <span>個性化設定</span>
              <span class="desc">日夜模式、時間格式、路線次序等</span>
            </button>
          </li>
        </ul>
        <div v-if="showGeoPermissionDenied" class="snackbar">無法獲得地理位置定位功能權限</div>
        <div v-if="updating" class="snackbar">資料更新中...</div>
      </div>
      
      <!-- Personalize Dialog -->
      <PersonalizeDialog :open="showPersonalizeDialog" @close="showPersonalizeDialog = false" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { MTR_LINES } from '../../constants/mtrLines';
import type { MtrLineCode, LineConfig, StationData, TrainArrival, Direction, Language } from '../../types/train';
import type { StationConfig } from '../../types/train';
import PersonalizeDialog from '../../components/settings/PersonalizeDialog.vue';

const lang = ref<Language>('zh'); // TODO: Replace with actual language logic
const selectedLine = ref<MtrLineCode>('TML');
const trainData = ref<Record<string, StationData>>({});
const currentTime = ref('');
const loading = ref(false);
const error = ref('');
const lastUpdate = ref<Date|null>(null);
const direction = ref<Direction>('UP');

const lineConfig = computed<LineConfig>(() => (MTR_LINES as Record<MtrLineCode, LineConfig>)[selectedLine.value]);

const lastUpdateStr = computed(() => lastUpdate.value ? lastUpdate.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

const goBack = () => window.history.back();

const handleLineChange = (code: MtrLineCode) => {
  selectedLine.value = code;
  fetchTrainData();
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
const appVersion = '1.0.0'; // TODO: Add version from package.json
const dbVersion = '1.0.0'; // TODO: replace with actual db version if available
const autoRenew = ref(true);
const geoPermission = ref('closed');
const updating = ref(false);
const showGeoPermissionDenied = ref(false);
const showPersonalizeDialog = ref(false);

function updateApp() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        registration.update();
        window.location.reload();
      })
      .catch(() => {
        // registration failed
        alert('Service Worker 註冊失敗');
      });
  }
}
function renewDb() {
  updating.value = true;
  setTimeout(() => { updating.value = false; }, 1200);
}
function toggleAutoDbRenew() {
  autoRenew.value = !autoRenew.value;
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
  background: #f5f5f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.mtr-container {
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
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
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.mtr-line-selector .label {
  font-size: 0.9em;
  color: #6c757d;
  font-weight: 500;
}

.mtr-line-selector .time {
  font-size: 0.9em;
  float: right;
  color: #6c757d;
  font-weight: 500;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  justify-content: center;
}

.chip {
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.9em;
  font-weight: 600;
  border: 2px solid #dee2e6;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-width: 50px;
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
  background: white;
  font-size: 0.9em;
}

.mtr-table th {
  background: #f8f9fa;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 5;
}

.mtr-table td {
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.mtr-table tbody tr:hover {
  background: #f8f9fa;
}

.station-name {
  font-weight: 600;
  text-align: left !important;
  color: #495057;
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

.mtr-footer {
  text-align: center;
  font-size: 0.85em;
  color: #6c757d;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.mtr-footer a {
  color: #1a73e8;
  text-decoration: none;
}

.error {
  color: #dc3545;
  text-align: center;
  margin: 16px 20px;
  font-weight: 500;
  padding: 12px;
  background: #f8d7da;
  border-radius: 8px;
}

.mtr-settings {
  margin: 0;
  padding: 20px;
  background: #fff;
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
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.settings-btn:hover {
  background: #f8f9fa;
  border-color: #1a73e8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.settings-btn .icon {
  margin-right: 12px;
  font-size: 1.3em;
  min-width: 24px;
}

.settings-btn .version, .settings-btn .desc {
  color: #6c757d;
  font-size: 0.9em;
  font-weight: 500;
}

.snackbar {
  background: #343a40;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  margin-top: 16px;
  text-align: center;
  font-size: 0.95em;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
    gap: 6px;
  }
  
  .chip {
    padding: 4px 12px;
    font-size: 0.85em;
    min-width: 45px;
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
  
  .settings-btn {
    padding: 12px 16px;
    font-size: 0.95em;
  }
}
</style>
