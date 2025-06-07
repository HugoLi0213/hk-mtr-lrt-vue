<template>
  <div class="light-rail-app">
    <!-- Header -->
    <header class="header">
      <button class="back-button" @click="goBack">
        <svg viewBox="0 0 24 24" class="back-icon">
          <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"/>
        </svg>
      </button>
      <h1 class="title">輕鐵 Light Rail</h1>
      <button class="refresh-button" @click="refreshData" :class="{ loading: loading }">
        <svg viewBox="0 0 24 24" class="refresh-icon">
          <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
        </svg>
      </button>
    </header>

    <!-- Region Selection -->
    <div class="region-section">
      <h2 class="section-title">選擇區域 Select Region</h2>
      <div class="region-grid">
        <button 
          v-for="region in regions" 
          :key="region.id"
          :class="{ active: selectedRegion === region.id }"
          @click="selectRegion(region.id)"
          class="region-button"
        >
          <div class="region-icon">{{ region.icon }}</div>
          <div class="region-name">
            <div class="zh">{{ region.name.zh }}</div>
            <div class="en">{{ region.name.en }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Station Selection -->
    <div v-if="selectedRegion" class="station-section">
      <h2 class="section-title">選擇車站 Select Station</h2>
      <div class="station-grid">
        <button 
          v-for="station in filteredStations" 
          :key="station.id"
          :class="{ active: selectedStation === station.id }"
          @click="selectStation(station.id)"
          class="station-button"
        >
          <div class="station-code">{{ station.id }}</div>
          <div class="station-name">
            <div class="zh">{{ station.name.zh }}</div>
            <div class="en">{{ station.name.en }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Station Selection Mini-Window -->
    <div v-if="selectedStation && platformData && showStationTimetable" class="station-mini-window">
      <div class="mini-window-overlay" @click="closeStationTimetable"></div>
      <div class="mini-window-content">
        <div class="mini-window-header">
          <div class="station-info">
            <div class="station-code">{{ selectedStation }}</div>
            <div class="station-name">
              <div class="zh">{{ getStationName(selectedStation) }}</div>
              <div class="en">{{ getStationEnglishName(selectedStation) }}</div>
            </div>
          </div>
          <div class="header-buttons">
            <button class="mini-home-button" @click="goHome" title="返回主頁 / Go Home">
              <svg viewBox="0 0 24 24" class="home-icon">
                <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
              </svg>
            </button>
            <button class="mini-close-button" @click="closeStationTimetable">
              <svg viewBox="0 0 24 24" class="close-icon">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="mini-window-body">
          <div class="platform-tabs">
            <button 
              v-for="platform in platformData" 
              :key="platform.platform_id"
              :class="{ active: selectedPlatform === platform.platform_id }"
              @click="selectPlatform(platform.platform_id)"
              class="platform-tab"
            >
              {{ getPlatformDestinations(platform) }}
            </button>
          </div>
          
          <div v-if="selectedPlatformData" class="platform-content">
            <div class="platform-status-bar">
              <div class="status-indicator" :class="getStatusClass(selectedPlatformData.route_list)"></div>
              <span class="status-text">{{ getPlatformStatus(selectedPlatformData.route_list) }}</span>
            </div>
            
            <div class="route-schedule">
              <div 
                v-for="(route, index) in selectedPlatformData.route_list.slice(0, 6)" 
                :key="`mini-${selectedPlatformData.platform_id}-${index}`"
                class="mini-route-item"
              >
                <div class="route-badge" :style="{ backgroundColor: getRouteColor(route.route_no) }">
                  {{ route.route_no }}
                </div>
                <div class="route-destination">
                  <div class="dest-text">往 {{ route.dest_ch }}</div>
                  <div class="train-info">
                    <span class="cars-indicator">
                      <span v-if="route.train_length === 2">🚋🚋</span>
                      <span v-else>🚋</span>
                    </span>                  </div>
                </div>                <div class="arrival-info">
                  <div class="arrival-time">{{ getFormattedArrivalTime(route) }}</div>
                </div>
              </div>
              
              <div v-if="selectedPlatformData.route_list.length === 0" class="no-service-mini">
                <div class="no-service-icon">⚠️</div>
                <div class="no-service-message">暫停服務 No Service</div>
              </div>
              
              <div v-if="selectedPlatformData.route_list.length > 6" class="more-trains">
                還有 {{ selectedPlatformData.route_list.length - 6 }} 班車...
              </div>
            </div>
          </div>
        </div>
        
        <div class="mini-window-footer">
          <div class="last-update-mini">
            最後更新: {{ lastUpdate ? formatLastUpdate(lastUpdate) : '-' }}
          </div>
          <button class="refresh-mini-button" @click="refreshData" :disabled="loading">
            <svg viewBox="0 0 24 24" class="refresh-mini-icon" :class="{ spinning: loading }">
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Route Info Toggle -->
    <div v-if="selectedStation" class="route-info-section">
      <button class="route-info-toggle" @click="showRouteInfo = !showRouteInfo">
        <svg viewBox="0 0 24 24" class="route-icon">
          <path d="M11,13H5V11H11V13M19,13H13V11H19V13M19,9H13V7H19V9M19,17H13V15H19V17M11,17H5V15H11V17M5,9V7H11V9H5Z"/>
        </svg>
        {{ showRouteInfo ? '隱藏路線資訊' : '顯示路線資訊' }}
      </button>
    </div>

    <!-- Route Info Window -->
    <div v-if="showRouteInfo && selectedStation" class="route-info-window">
      <div class="route-info-header">
        <h3>{{ getStationName(selectedStation) }} 路線資訊</h3>
        <button class="close-button" @click="showRouteInfo = false">×</button>
      </div>
      
      <div class="route-info-content">
        <div v-if="getStationRoutes(selectedStation).length > 0" class="routes-list">
          <div 
            v-for="route in getStationRoutes(selectedStation)" 
            :key="route.number"
            class="route-info-card"
          >
            <div class="route-header">
              <div class="route-badge" :style="{ backgroundColor: route.color }">
                {{ route.number }}
              </div>
              <div class="route-name">{{ route.name }}</div>
            </div>
            
            <div class="route-details">
              <div class="stations-count">
                共 {{ route.stationsCount }} 個車站
              </div>
              <div class="route-stations">
                <div class="stations-preview">
                  主要車站: {{ route.mainStations.join(' → ') }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-routes">
          <div class="no-routes-icon">🚋</div>
          <div class="no-routes-text">此車站暫無路線資訊</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && selectedStation" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在載入時刻表...</div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message">
      <div class="error-icon">❌</div>
      <div class="error-text">{{ error }}</div>
      <button class="retry-button" @click="refreshData">重試 Retry</button>
    </div>

    <!-- Last Update Info -->
    <div v-if="lastUpdate" class="update-info">
      <div class="update-text">
        最後更新 Last Updated: {{ formatLastUpdate(lastUpdate) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTheme } from '../../composables/useTheme'

// Theme setup
useTheme()

// Reactive data
const selectedRegion = ref<string>('')
const selectedStation = ref<string>('')
const platformData = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const lastUpdate = ref<Date | null>(null)
const showRouteInfo = ref(false)
const showStationTimetable = ref(false)
const selectedPlatform = ref<string>('')
const systemTime = ref<string>('')  // Store system time for calculations

// Route information for LRT lines
const lrtRoutes = {
  '505': { name: '兆康 - 三聖', color: '#ff6b35', stations: ['100', '110', '120', '130', '140', '150', '160', '170', '180', '190', '200', '212', '220', '230', '240', '250', '260', '265', '270', '275', '280', '290', '295', '300', '310', '320', '330', '340', '350', '360', '370', '380', '390', '400'] },
  '507': { name: '屯門碼頭 - 田景', color: '#00a650', stations: ['1', '10', '15', '20', '30', '40', '50', '60', '70', '75', '80', '90', '100', '110', '120', '130', '140'] },
  '610': { name: '屯門碼頭 - 元朗', color: '#8b4513', stations: ['1', '10', '15', '20', '30', '40', '50', '60', '70', '75', '80', '90', '100', '110', '120', '130', '140', '150', '160', '170', '180', '190', '200', '212', '220', '230', '240', '250', '260', '265', '270', '275', '280', '295', '300', '310', '320', '330', '340', '350', '360', '370', '380', '390', '400', '425', '430', '435', '445', '448', '450', '455', '460', '468', '480', '490', '500', '510'] },
  '614': { name: '屯門碼頭 - 元朗', color: '#ff1493', stations: ['1', '10', '15', '20', '30', '40', '50', '60', '70', '75', '80', '90', '100', '270', '275', '280', '295', '300', '310', '320', '330', '340', '350', '360', '370', '380', '390', '400', '425', '430', '435', '445', '448', '450', '455', '460', '468', '480', '490', '500', '510'] },
  '615': { name: '屯門碼頭 - 元朗', color: '#4169e1', stations: ['1', '10', '15', '20', '30', '40', '50', '60', '70', '75', '80', '90', '100', '110', '120', '130', '140', '150', '160', '170', '180', '190', '200', '212', '220', '230', '240', '250', '260', '265', '270', '275', '280', '295', '300', '310', '320', '330', '340', '350', '360', '370', '380', '390', '400', '510'] },
  '705': { name: '天水圍循環線', color: '#32cd32', stations: ['430', '435', '445', '448', '450', '455', '460', '468', '480', '490', '500', '501', '502', '503', '504', '505', '506'] },
  '706': { name: '天水圍循環線', color: '#ffa500', stations: ['430', '435', '445', '448', '450', '455', '460', '468', '480', '490', '500', '501', '502', '503', '504', '505', '506'] },
  '751': { name: '天逸 - 友愛', color: '#9370db', stations: ['505', '500', '490', '480', '468', '460', '455', '450', '448', '445', '435', '430', '275'] }
}

// Region definitions based on LRT geographical layout with corrected station listings
const regions = [
  {
    id: 'tuen-mun',
    name: { zh: '屯門區', en: 'Tuen Mun' },
    icon: '🏠',
    stations: ['1', '10', '15', '20', '30', '40', '50', '60', '70', '75', '80', '90', '100', '110', '120', '130', '140', '150', '160', '170', '180', '190', '200', '212', '220', '230', '240', '250', '260', '265', '270', '275', '280', '290', '295', '300', '310', '320', '330', '340', '350', '360', '370']
  },  {
    id: 'yuen-long-kam-tin',
    name: { zh: '元朗', en: 'Yuen Long' },
    icon: '🌾',
    stations: ['380', '390', '400', '550', '540', '520', '530', '510']
  },
  {
    id: 'tin-shui-wai',
    name: { zh: '天水圍', en: 'Tin Shui Wai' },
    icon: '🏢',
    stations: ['430', '435', '445', '448', '450', '455', '460', '468', '480', '490', '500', '501', '502', '503', '504', '505', '506']
  }
]

// Station data from the constants
const allStations = {
  '1': { zh: '屯門碼頭', en: 'Tuen Mun Ferry Pier' },
  '10': { zh: '美樂', en: 'Melody Garden' },
  '15': { zh: '蝴蝶', en: 'Butterfly' },
  '20': { zh: '輕鐵車廠', en: 'Light Rail Depot' },
  '30': { zh: '龍門', en: 'Lung Mun' },
  '40': { zh: '青山村', en: 'Tsing Shan Tsuen' },
  '50': { zh: '青雲', en: 'Tsing Wan' },
  '60': { zh: '建安', en: 'Kin On' },
  '70': { zh: '河田', en: 'Ho Tin' },
  '75': { zh: '蔡意橋', en: 'Choy Yee Bridge' },
  '80': { zh: '澤豐', en: 'Chaak Fung' },
  '90': { zh: '屯門醫院', en: 'Tuen Mun Hospital' },
  '100': { zh: '兆康', en: 'Siu Hong' },
  '110': { zh: '麒麟', en: 'Kei Lun' },
  '120': { zh: '青松', en: 'Ching Chung' },
  '130': { zh: '建生', en: 'Kin Sang' },
  '140': { zh: '田景', en: 'Tin King' },
  '150': { zh: '良景', en: 'Leung King' },
  '160': { zh: '新圍', en: 'San Wai' },
  '170': { zh: '石排', en: 'Shek Pai' },
  '180': { zh: '山景(北)', en: 'Shan King (North)' },
  '190': { zh: '山景(南)', en: 'Shan King (South)' },
  '200': { zh: '鳴琴', en: 'Ming Kum' },
  '212': { zh: '大興(北)', en: 'Tai Hing (North)' },
  '220': { zh: '大興(南)', en: 'Tai Hing (South)' },
  '230': { zh: '銀圍', en: 'Ngan Wai' },
  '240': { zh: '兆禧', en: 'Siu Hei' },
  '250': { zh: '屯門泳池', en: 'Tuen Mun Swimming Pool' },
  '260': { zh: '豐景園', en: 'Fung King Garden' },
  '265': { zh: '兆麟', en: 'Siu Lun' },
  '270': { zh: '安定', en: 'On Ting' },
  '275': { zh: '友愛', en: 'Yau Oi' },
  '280': { zh: '市中心', en: 'Town Centre' },
  '290': { zh: '三聖', en: 'Sam Shing' },
  '295': { zh: '屯門', en: 'Tuen Mun' },
  '300': { zh: '杯渡', en: 'Pui To' },
  '310': { zh: '何福堂', en: 'Ho Fuk Tong' },
  '320': { zh: '新墟', en: 'San Hui' },
  '330': { zh: '景峰', en: 'King Fung' },
  '340': { zh: '鳳地', en: 'Fung Tei' },
  '350': { zh: '藍地', en: 'Lam Tei' },
  '360': { zh: '泥圍', en: 'Nai Wai' },
  '370': { zh: '鍾屋村', en: 'Chung Uk Tsuen' },
  '380': { zh: '洪水橋', en: 'Hung Shui Kiu' },
  '390': { zh: '塘坊村', en: 'Tong Fong Tsuen' },
  '400': { zh: '屏山', en: 'Ping Shan' },
  '425': { zh: '坑尾村', en: 'Hang Mei Tsuen' },
  '430': { zh: '天水圍', en: 'Tin Shui Wai' },
  '435': { zh: '天榮', en: 'Tin Wing' },
  '445': { zh: '天富', en: 'Tin Fu' },
  '448': { zh: '頌富', en: 'Chung Fu' },
  '450': { zh: '天瑞', en: 'Tin Shui' },
  '455': { zh: '天湖', en: 'Tin Wu' },
  '460': { zh: '銀座', en: 'Ginza' },
  '468': { zh: '天慈', en: 'Tin Tsz' },
  '480': { zh: '濕地公園', en: 'Wetland Park' },
  '490': { zh: '天秀', en: 'Tin Sau' },
  '500': { zh: '天耀', en: 'Tin Yiu' },
  '501': { zh: '樂湖', en: 'Lok Wu' },
  '502': { zh: '翠湖', en: 'Chui Wu' },
  '503': { zh: '天悅', en: 'Tin Yuet' },
  '504': { zh: '天恒', en: 'Tin Heng' },
  '505': { zh: '天逸', en: 'Tin Yat' },
  '506': { zh: '天水圍北', en: 'Tin Shui Wai North' },
  '510': { zh: '元朗', en: 'Yuen Long' },
  '520': { zh: '康樂路', en: 'Hong Lok Road' },
  '530': { zh: '大棠路', en: 'Tai Tong Road' },
  '540': { zh: '豐年路', en: 'Fung Nin Road' },
  '550': { zh: '水邊圍', en: 'Shui Pin Wai' },
  '560': { zh: '頌富', en: 'Chung Fu' },
  '570': { zh: '元朗公園', en: 'Yuen Long Park' },
  '580': { zh: '聚星樓', en: 'Tsui Sing Lau' },
  '590': { zh: '十八鄉', en: 'Shap Pat Heung' },
  '600': { zh: '橫洲', en: 'Wang Chau' },
  '610': { zh: '耀安', en: 'Yiu On' }
}

// Computed properties
const filteredStations = computed(() => {
  if (!selectedRegion.value) return []
  
  const region = regions.find(r => r.id === selectedRegion.value)
  if (!region) return []
  
  return region.stations
    .filter(stationId => allStations[stationId as keyof typeof allStations])
    .map(stationId => ({
      id: stationId,
      name: allStations[stationId as keyof typeof allStations]
    }))
})

const selectedPlatformData = computed(() => {
  if (!selectedPlatform.value || !platformData.value) return null
  return platformData.value.find(p => p.platform_id === selectedPlatform.value)
})

// Get unique destination names for a platform
const getPlatformDestinations = (platform: any): string => {
  if (!platform || !platform.route_list || platform.route_list.length === 0) {
    return `月台 ${platform.platform_id}`
  }
  
  // Extract unique destination names from route_list
  const destinations = [...new Set(
    platform.route_list.map((route: any) => route.dest_ch).filter(Boolean)
  )]
  
  // If no destinations found, fallback to platform number
  if (destinations.length === 0) {
    return `月台 ${platform.platform_id}`
  }
  
  // For better display, limit to 2 destinations and add "等" if more
  if (destinations.length > 2) {
    return `${destinations.slice(0, 2).join(', ')}等`
  }
  
  // Join multiple destinations with comma
  return destinations.join(', ')
}

// Methods
const selectRegion = (regionId: string) => {
  selectedRegion.value = regionId
  selectedStation.value = ''
  platformData.value = []
}

const selectStation = async (stationId: string) => {
  selectedStation.value = stationId
  await fetchStationData(stationId)
  // 自動顯示迷你視窗
  showStationTimetable.value = true
}

const closeStationTimetable = () => {
  showStationTimetable.value = false
  selectedPlatform.value = ''
  selectedStation.value = ''
  platformData.value = []
}

const selectPlatform = (platformId: string) => {
  selectedPlatform.value = platformId
}

const fetchStationData = async (stationId: string) => {
  if (!stationId) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id=${stationId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
      const data = await response.json()
    if (data.platform_list) {
      platformData.value = data.platform_list
      lastUpdate.value = new Date()
      
      // Store system_time for calculating exact arrival times
      if (data.system_time) {
        systemTime.value = data.system_time
        console.log('LRT API system_time:', data.system_time)
      }
      
      // Debug: Log the actual API response structure
      console.log('LRT API Response:', JSON.stringify(data, null, 2))
      if (data.platform_list[0] && data.platform_list[0].route_list && data.platform_list[0].route_list[0]) {
        console.log('Sample route data:', data.platform_list[0].route_list[0])
      }
      
      // 自動選擇第一個月台
      if (data.platform_list.length > 0) {
        selectedPlatform.value = data.platform_list[0].platform_id
      }
    } else {
      platformData.value = []
      error.value = '沒有可用的班次資料 No schedule data available'
    }
  } catch (err) {
    console.error('Error fetching LRT data:', err)
    error.value = '載入失敗，請檢查網絡連接 Failed to load, please check network'
    platformData.value = []
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  if (selectedStation.value) {
    fetchStationData(selectedStation.value)
  }
}

const goBack = () => {
  window.history.back()
}

const goHome = () => {
  // Navigate back to home page (MTR Train page)
  window.location.hash = '#/'
  // Alternative: Use history back to root
  // window.history.go(-(window.history.length - 1))
}

// Helper function to calculate minutes between two times
const calculateMinutesDifference = (arrivalTime: Date): number => {
  const now = new Date();
  const diffMs = arrivalTime.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60));
}

// Utility functions for time formatting
const getFormattedArrivalTime = (route: any): string => {
  if (!route) return '-'
  
  try {
    console.log('=== DEBUG: Route data ===', JSON.stringify(route, null, 2))
    
    // Check if route has direct time fields
    const timeFields = ['time_ch', 'time_en', 'arrival_time', 'eta', 'time'];
    let timeValue = null;
    
    for (const field of timeFields) {
      if (route[field] !== undefined && route[field] !== null && route[field] !== '') {
        timeValue = route[field];
        console.log(`=== Found time in field '${field}':`, timeValue, typeof timeValue);
        break;
      }
    }
    
    if (!timeValue) {
      console.log('=== No time field found in route ===', Object.keys(route));
      return '-';
    }
    
    console.log('=== Processing timeValue ===', timeValue, typeof timeValue);
    
    // SPECIAL CHECK: If it's EXACTLY a relative time format like "5分鐘"
    if (typeof timeValue === 'string' && /^\d+分鐘$/.test(timeValue.trim())) {
      console.log('=== EXACT MATCH: Pure relative time ===', timeValue);
      const minutesMatch = timeValue.match(/(\d+)分鐘/);
      if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1]);
        console.log('=== Extracted minutes ===', minutes);
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + (minutes * 60 * 1000));
        const exactTime = arrivalTime.toLocaleTimeString('zh-HK', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
        const result = `${exactTime} (${timeValue})`;
        console.log(`=== EXACT MATCH Result ===`, result);
        return result;
      }
    }
    
    // Case 1: If it's already in HH:MM format (exact time) - calculate countdown
    if (typeof timeValue === 'string' && timeValue.match(/^\d{1,2}:\d{2}$/)) {
      console.log('Time is already in HH:MM format:', timeValue);
      // Calculate minutes until arrival
      const [hours, minutes] = timeValue.split(':').map(Number);
      const today = new Date();
      const arrivalTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
      
      // If arrival time is in the past, assume it's tomorrow
      if (arrivalTime < today) {
        arrivalTime.setDate(arrivalTime.getDate() + 1);
      }
      
      const minutesLeft = calculateMinutesDifference(arrivalTime);
      if (minutesLeft > 0) {
        return `${timeValue} (${minutesLeft}分鐘)`;
      } else {
        return `${timeValue} (即將到達)`;
      }
    }
    
    // Case 2: If it's in full datetime format "2025-06-07 14:30:00"
    if (typeof timeValue === 'string' && timeValue.includes('-') && timeValue.includes(' ')) {
      const arrivalTime = new Date(timeValue);
      if (!isNaN(arrivalTime.getTime())) {
        const exactTime = arrivalTime.toLocaleTimeString('zh-HK', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
        const minutesLeft = calculateMinutesDifference(arrivalTime);
        console.log('Parsed datetime to:', exactTime);
        if (minutesLeft > 0) {
          return `${exactTime} (${minutesLeft}分鐘)`;
        } else {
          return `${exactTime} (即將到達)`;
        }
      }
    }    
    // Case 3: If it's relative time like "6分鐘", calculate exact time
    if (typeof timeValue === 'string' && timeValue.includes('分鐘')) {
      console.log('=== Case 3: Relative time detected ===', timeValue);
      const minutesMatch = timeValue.match(/(\d+)分鐘/);
      if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1]);
        console.log('=== Extracted minutes ===', minutes);
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + (minutes * 60 * 1000));
        const exactTime = arrivalTime.toLocaleTimeString('zh-HK', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
        const result = `${exactTime} (${timeValue})`;
        console.log(`=== Case 3 Result ===`, result);
        return result;
      } else {
        console.log('=== Case 3: No minutes match found ===');
      }
    }
    
    // Case 4: If it's "即將到達" or similar
    if (typeof timeValue === 'string' && (timeValue.includes('即將') || timeValue.includes('Arriving'))) {
      const now = new Date();
      const exactTime = now.toLocaleTimeString('zh-HK', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      console.log('Immediate arrival:', exactTime);
      return `${exactTime} (即將到達)`;
    }
    
    // Case 5: If it's a timestamp (number)
    if (typeof timeValue === 'number') {
      const arrivalTime = new Date(timeValue * 1000); // Convert from Unix timestamp
      if (!isNaN(arrivalTime.getTime())) {
        const exactTime = arrivalTime.toLocaleTimeString('zh-HK', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
        const minutesLeft = calculateMinutesDifference(arrivalTime);
        console.log('Parsed timestamp to:', exactTime);
        if (minutesLeft > 0) {
          return `${exactTime} (${minutesLeft}分鐘)`;
        } else {
          return `${exactTime} (即將到達)`;
        }
      }
    }    
    // Final safety check: If we reach here and timeValue contains 分鐘, force the conversion
    if (typeof timeValue === 'string' && timeValue.includes('分鐘')) {
      console.log('=== SAFETY CHECK: Forcing time conversion for ===', timeValue);
      const minutesMatch = timeValue.match(/(\d+)/);
      if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1]);
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + (minutes * 60 * 1000));
        const exactTime = arrivalTime.toLocaleTimeString('zh-HK', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
        const result = `${exactTime} (${timeValue})`;
        console.log(`=== SAFETY CHECK Result ===`, result);
        return result;
      }
    }
    
    // Fallback: return the original value
    console.log('=== FALLBACK: Using original timeValue ===', timeValue);
    return String(timeValue);
    
  } catch (error) {
    console.error('=== ERROR in getFormattedArrivalTime ===', error);
    console.log('=== Route object ===', route);
    return route.time_ch || route.time_en || '-';
  }
}

const getPlatformStatus = (routeList: any[]): string => {
  if (!routeList || routeList.length === 0) return '暫停服務'
  return '正常服務'
}

const getStatusClass = (routeList: any[]): string => {
  if (!routeList || routeList.length === 0) return 'no-service'
  return 'normal'
}

const formatLastUpdate = (date: Date | null): string => {
  if (!date) return '-'
  return date.toLocaleTimeString('zh-HK', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

const getStationName = (stationId: string): string => {
  const station = allStations[stationId as keyof typeof allStations]
  return station ? station.zh : stationId
}

const getStationEnglishName = (stationId: string): string => {
  const station = allStations[stationId as keyof typeof allStations]
  return station ? station.en : stationId
}

const getRouteColor = (routeNo: string): string => {
  return lrtRoutes[routeNo as keyof typeof lrtRoutes]?.color || '#666666'
}

const getStationRoutes = (stationId: string) => {
  const routes = []
  
  for (const [routeNumber, routeInfo] of Object.entries(lrtRoutes)) {
    if (routeInfo.stations.includes(stationId)) {
      // Get key stations for preview
      const stationNames = routeInfo.stations
        .filter((_, index) => index === 0 || index === Math.floor(routeInfo.stations.length / 2) || index === routeInfo.stations.length - 1)
        .map(stationId => allStations[stationId as keyof typeof allStations]?.zh || stationId)
      
      routes.push({
        number: routeNumber,
        name: routeInfo.name,
        color: routeInfo.color,
        stationsCount: routeInfo.stations.length,
        mainStations: stationNames
      })
    }
  }
  
  return routes.sort((a, b) => a.number.localeCompare(b.number))
}

// Watch for station changes
watch(selectedStation, (newStation) => {
  if (newStation) {
    fetchStationData(newStation)
  }
})

// Auto-refresh every 10 seconds to match cache duration
let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Auto-refresh when a station is selected
  refreshInterval = setInterval(() => {
    if (selectedStation.value && !loading.value) {
      fetchStationData(selectedStation.value)
    }
  }, 10000) // 10 seconds to match cache duration
})

// Cleanup
onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.light-rail-app {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
  padding-bottom: 2rem;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  font-size: 1.1rem; /* 增大標題字體 */
}

.back-button,
.refresh-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--color-surface-variant);
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover,
.refresh-button:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
  transform: scale(1.05);
}

.back-icon,
.refresh-icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.refresh-button.loading .refresh-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.title {
  font-size: 1.4rem; /* 增大主標題字體從 1.25rem */
  font-weight: 600;
  margin: 0;
  text-align: center;
  flex: 1;
}

/* Section Titles */
.section-title {
  font-size: 1.1rem; /* 增大章節標題字體從 0.95rem */
  font-weight: 600;
  margin: 1rem 1rem 0.75rem 1rem;
  color: var(--color-text-secondary);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 0.3rem;
}

/* Region Selection */
.region-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); /* 適度減少最小寬度，更緊湊 */
  gap: 8px; /* 適度減少間距，節省空間 */
  padding: 0 1rem;
}

.region-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px; /* 適度減少內邊距，平衡美觀與緊湊 */
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 70px; /* 適度減少高度，但保持美觀 */
}

.region-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.region-button.active {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, var(--color-primary-container), var(--color-surface));
  box-shadow: 0 2px 6px rgba(156, 46, 0, 0.2);
}

.region-icon {
  font-size: 1.5rem; /* 稍微增加圖標大小 */
  margin-bottom: 6px; /* 增加下邊距 */
}

.region-name .zh {
  font-weight: 600;
  font-size: 0.9rem; /* 增大中文字體從 0.8rem */
  line-height: 1.2;
}

.region-name .en {
  font-size: 0.75rem; /* 增大英文字體從 0.65rem */
  color: var(--color-text-secondary);
  margin-top: 2px;
  line-height: 1.1;
}

/* Mobile optimizations for region cards */
@media (max-width: 768px) {
  .region-grid {
    gap: 6px; /* 手機版適度間距 */
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); /* 手機版適度寬度 */
  }
  
  .region-button {
    padding: 8px 5px; /* 手機版適度內邊距 */
    min-height: 60px; /* 手機版適度高度 */
    border-radius: 8px; /* 手機版適度圓角 */
  }
  
  .region-icon {
    font-size: 1.2rem; /* 手機版適度圖標大小 */
    margin-bottom: 4px; /* 手機版適度下邊距 */
  }
  
  .region-name .zh {
    font-size: 0.75rem; /* 手機版增大中文字體從 0.65rem */
  }
  
  .region-name .en {
    font-size: 0.65rem; /* 手機版增大英文字體從 0.55rem */
    margin-top: 1px;
  }
}

/* Station Selection */
.station-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 6px;
  padding: 0 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.station-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 55px;
}

.station-button:hover {
  background: var(--color-surface-variant);
  border-color: var(--color-primary);
}

.station-button.active {
  background: var(--color-primary-container);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.station-code {
  font-weight: 700;
  font-size: 0.8rem; /* 增大車站代碼字體從 0.7rem */
  margin-bottom: 2px;
  color: var(--color-primary);
}

.station-name .zh {
  font-size: 1rem; /* 增大車站中文名字體從 0.65rem */
  font-weight: 500;
  text-align: center;
  line-height: 1.1;
}

.station-name .en {
  font-size: 0.65rem; /* 增大車站英文名字體從 0.55rem */
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 1px;
  line-height: 1.0;
}

/* Mobile optimizations for station cards */
@media (max-width: 768px) {
  .station-grid {
    gap: 4px;
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
  }
  
  .station-button {
    padding: 5px 3px;
    min-height: 45px;
    border-radius: 5px;
  }
  
  .station-code {
    font-size: 0.75rem; /* 手機版增大車站代碼字體從 0.65rem */
    margin-bottom: 1px;
  }
  
  .station-name .zh {
    font-size: 0.7rem; /* 手機版增大中文車站名字體從 0.6rem */
  }
  
  .station-name .en {
    font-size: 0.6rem; /* 手機版增大英文車站名字體從 0.5rem */
  }
}

/* Platform Timetable */
.platform-cards {
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.platform-card {
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.platform-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, var(--color-primary-container), var(--color-surface-variant));
  border-bottom: 1px solid var(--color-border);
}

.platform-number {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-primary);
}

.platform-status {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.platform-status.normal {
  background: #e8f5e8;
  color: #2e7d32;
}

.platform-status.no-service {
  background: #ffebee;
  color: #c62828;
}

.route-list {
  padding: 1rem;
}

.route-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.route-item:last-child {
  border-bottom: none;
}

.route-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.route-number {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  min-width: 40px;
  text-align: center;
}

.route-dest {
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
}

.train-cars {
  font-size: 1.2rem;
}

.arrival-time {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.time {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-primary);
}

.relative-time {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.no-service {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.no-service-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.no-service-text {
  text-align: center;
  line-height: 1.4;
}

/* Route Info Section */
.route-info-section {
  padding: 1rem;
  text-align: center;
}

.route-info-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-primary);
  border-radius: 25px;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 1rem; /* 增大路線資訊按鈕字體 */
}

.route-info-toggle:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.route-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* Route Info Window */
.route-info-window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  border: 1px solid var(--color-border);
  z-index: 1000;
  max-width: 90vw;
  max-height: 80vh;
  width: 400px;
  overflow: hidden;
}

.route-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--color-primary-container), var(--color-surface-variant));
  border-bottom: 1px solid var(--color-border);
}

.route-info-header h3 {
  margin: 0;
  font-size: 1.2rem; /* 增大路線資訊標題字體從 1.1rem */
  font-weight: 600;
  color: var(--color-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--color-error);
  color: white;
}

.route-info-content {
  padding: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.routes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.route-info-card {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  background: var(--color-surface-variant);
  transition: all 0.2s ease;
}

.route-info-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.route-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.route-badge {
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 50px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.route-name {
  font-weight: 600;
  font-size: 1.1rem; /* 增大路線名稱字體從 1rem */
  color: var(--color-text);
}

.route-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stations-count {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.stations-preview {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.no-routes {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.no-routes-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-routes-text {
  text-align: center;
  font-size: 1rem;
}

/* Loading and Error States */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-surface);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: white;
  margin-top: 1rem;
  font-weight: 500;
  font-size: 1rem; /* 增大載入文字字體 */
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-error);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-text {
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 1rem; /* 增大錯誤文字字體 */
}

.retry-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-error);
  border-radius: 8px;
  background: transparent;
  color: var(--color-error);
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem; /* 增大重試按鈕字體 */
}

.retry-button:hover {
  background: var(--color-error);
  color: white;
}

/* Update Info */
.update-info {
  padding: 1rem;
  text-align: center;
}

.update-text {
  font-size: 0.9rem; /* 增大更新文字字體從 0.8rem */
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}

/* Station Mini-Window Styles */
.station-mini-window {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.mini-window-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.mini-window-content {
  position: relative;
  background: var(--color-surface);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.mini-window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--color-primary-container), var(--color-surface-variant));
  border-bottom: 1px solid var(--color-border);
}

.station-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.station-info .station-code {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
}

.station-info .station-name .zh {
  font-size: 1.2rem; /* 增大迷你窗口車站名字體從 1.1rem */
  font-weight: 600;
  color: var(--color-text);
}

.station-info .station-name .en {
  font-size: 0.95rem; /* 增大迷你窗口英文名字體從 0.85rem */
  color: var(--color-text-secondary);
  margin-top: 0.2rem;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mini-home-button,
.mini-close-button {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
}

.mini-home-button:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: scale(1.1);
}

.mini-close-button:hover {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
  transform: scale(1.1);
}

.home-icon,
.close-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.mini-window-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.platform-tabs {
  display: flex;
  background: var(--color-surface-variant);
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
}

.platform-tab {
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem; /* Adjusted for longer destination names */
  transition: all 0.2s ease;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  min-width: fit-content;
  text-align: center;
}

.platform-tab:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.platform-tab.active {
  background: var(--color-surface);
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

.platform-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.platform-status-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--color-surface-variant);
  border-radius: 8px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-success);
}

.status-indicator.no-service {
  background: #ffebee;
}

.status-text {
  font-weight: 500;
  font-size: 1rem; /* 增大狀態文字字體從 0.9rem */
}

.route-schedule {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mini-route-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mini-route-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.route-badge {
  color: white;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem; /* 增大路線徽章字體從 0.8rem */
  min-width: 40px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.route-destination {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.dest-text {
  font-size: 1rem; /* 增大目的地文字字體從 0.9rem */
  font-weight: 500;
  color: var(--color-text);
}

.train-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cars-indicator {
  font-size: 0.8rem;
}

.arrival-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.arrival-time {
  font-size: 1.1rem; /* 增大到達時間字體從 1rem */
  font-weight: 600;
  color: var(--color-primary);
}

.countdown {
  font-size: 0.9rem; /* 增大倒數計時字體從 0.8rem */
  color: var(--color-text-secondary);
}

.no-service-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.no-service-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.no-service-message {
  text-align: center;
  font-size: 1rem; /* 增大暫停服務訊息字體從 0.9rem */
}

.more-trains {
  text-align: center;
  padding: 0.75rem;
  font-size: 0.95rem; /* 增大更多班車字體從 0.85rem */
  color: var(--color-text-secondary);
  background: var(--color-surface-variant);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.mini-window-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--color-surface-variant);
  border-top: 1px solid var(--color-border);
}

.last-update-mini {
  font-size: 0.9rem; /* 增大最後更新字體從 0.8rem */
  color: var(--color-text-secondary);
}

.refresh-mini-button {
  background: var(--color-primary-container);
  border: 1px solid var(--color-primary);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-primary);
}

.refresh-mini-button:hover:not(:disabled) {
  background: var(--color-primary);
  color: var(--color-on-primary);
  transform: scale(1.1);
}

.refresh-mini-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-mini-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
  transition: transform 0.2s ease;
}

.refresh-mini-icon.spinning {
  animation: spin 1s linear infinite;
}

/* Timetable Header with Mini-View Button */
.timetable-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1.5rem 1rem 1rem 1rem;
}

.timetable-header .section-title {
  margin: 0;
  flex: 1;
}

.mini-view-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-primary);
  border-radius: 20px;
  background: var(--color-primary-container);
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mini-view-button:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mini-view-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* ============================================ */
/* ENHANCED DARK MODE STYLES */
/* ============================================ */

[data-theme="dark"] {
  color-scheme: dark;
}

/* Dark mode specific overrides */
[data-theme="dark"] .light-rail-app {
  background: var(--color-background);
  color: var(--color-text);
}

/* Header dark mode */
[data-theme="dark"] .header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-bottom-color: var(--color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .title {
  color: var(--color-text);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .back-button,
[data-theme="dark"] .refresh-button {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

[data-theme="dark"] .back-button:hover,
[data-theme="dark"] .refresh-button:hover {
  background: var(--color-hover);
  border-color: var(--color-primary);
  transform: scale(1.05);
}

/* Region and station buttons dark mode */
[data-theme="dark"] .region-button {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .region-button:hover {
  background: var(--color-hover);
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .region-button.active {
  background: linear-gradient(135deg, var(--color-primary) 0%, #5a6fd8 100%);
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(124, 146, 247, 0.3);
}

[data-theme="dark"] .station-button {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .station-button:hover {
  background: var(--color-hover);
  border-color: var(--color-border-light);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .station-button.active {
  background: linear-gradient(135deg, var(--color-primary) 0%, #5a6fd8 100%);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: 0 2px 8px rgba(124, 146, 247, 0.4);
}

/* Mini window dark mode enhancements */
[data-theme="dark"] .mini-window-overlay {
  background: var(--color-overlay-bg);
  backdrop-filter: blur(8px);
}

[data-theme="dark"] .mini-window-content {
  background: var(--color-surface);
  border-color: var(--color-border-light);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

[data-theme="dark"] .mini-window-header {
  background: linear-gradient(135deg, var(--color-surface-container) 0%, var(--color-surface-variant) 100%);
  border-bottom-color: var(--color-border);
}

[data-theme="dark"] .station-info .station-code {
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: 0 2px 6px rgba(124, 146, 247, 0.3);
}

[data-theme="dark"] .mini-home-button,
[data-theme="dark"] .mini-close-button {
  background: var(--color-surface-variant);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

[data-theme="dark"] .mini-home-button:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

[data-theme="dark"] .mini-close-button:hover {
  background: var(--color-error);
  border-color: var(--color-error);
  color: white;
}

/* Platform tabs dark mode */
[data-theme="dark"] .platform-tabs {
  background: var(--color-surface-variant);
  border-bottom-color: var(--color-border);
}

[data-theme="dark"] .platform-tab {
  color: var(--color-text-secondary);
  background: transparent;
}

[data-theme="dark"] .platform-tab:hover {
  background: var(--color-hover);
  color: var(--color-text);
}

[data-theme="dark"] .platform-tab.active {
  background: var(--color-surface);
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

/* Platform content dark mode */
[data-theme="dark"] .platform-status-bar {
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

[data-theme="dark"] .mini-route-item {
  background: var(--color-surface);
  border-color: var(--color-border);
}

[data-theme="dark"] .mini-route-item:hover {
  background: var(--color-hover);
  border-color: var(--color-primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

/* Route badges enhanced colors for dark mode */
[data-theme="dark"] .route-badge {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Status indicators dark mode */
[data-theme="dark"] .status-indicator {
  box-shadow: 0 0 4px rgba(52, 211, 153, 0.4);
}

[data-theme="dark"] .status-indicator.no-service {
  box-shadow: 0 0 4px rgba(248, 113, 113, 0.4);
}

/* Footer and update info dark mode */
[data-theme="dark"] .mini-window-footer {
  background: var(--color-surface-variant);
  border-top-color: var(--color-border);
}

[data-theme="dark"] .refresh-mini-button {
  background: var(--color-primary-container);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

[data-theme="dark"] .refresh-mini-button:hover:not(:disabled) {
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: 0 2px 8px rgba(124, 146, 247, 0.3);
}

/* Error and loading states dark mode */
[data-theme="dark"] .loading-overlay {
  background: rgba(0, 0, 0, 0.8);
}

[data-theme="dark"] .loading-spinner {
  border-color: var(--color-surface-variant);
  border-top-color: var(--color-primary);
}

[data-theme="dark"] .error-message {
  color: var(--color-error);
}

[data-theme="dark"] .retry-button {
  border-color: var(--color-error);
  color: var(--color-error);
  background: transparent;
}

[data-theme="dark"] .retry-button:hover {
  background: var(--color-error);
  color: white;
}

/* No service states dark mode */
[data-theme="dark"] .no-service-mini,
[data-theme="dark"] .no-service {
  color: var(--color-text-secondary);
}

[data-theme="dark"] .no-routes {
  color: var(--color-text-tertiary);
}

/* Route info window dark mode */
[data-theme="dark"] .route-info-window {
  background: var(--color-surface);
  border-color: var(--color-border-light);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

[data-theme="dark"] .route-info-header {
  background: linear-gradient(135deg, var(--color-surface-container) 0%, var(--color-surface-variant) 100%);
  border-bottom-color: var(--color-border);
}

[data-theme="dark"] .route-info-card {
  background: var(--color-surface-variant);
  border-color: var(--color-border);
}

[data-theme="dark"] .route-info-card:hover {
  background: var(--color-hover);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

/* Scrollbar styling for dark mode */
[data-theme="dark"] .platform-content::-webkit-scrollbar,
[data-theme="dark"] .route-info-content::-webkit-scrollbar {
  width: 6px;
}

[data-theme="dark"] .platform-content::-webkit-scrollbar-track,
[data-theme="dark"] .route-info-content::-webkit-scrollbar-track {
  background: var(--color-surface-variant);
  border-radius: 3px;
}

[data-theme="dark"] .platform-content::-webkit-scrollbar-thumb,
[data-theme="dark"] .route-info-content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

[data-theme="dark"] .platform-content::-webkit-scrollbar-thumb:hover,
[data-theme="dark"] .route-info-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-light);
}

/* Text selection in dark mode */
[data-theme="dark"] ::selection {
  background: rgba(124, 146, 247, 0.3);
  color: var(--color-text);
}

/* Focus states for accessibility */
[data-theme="dark"] .region-button:focus,
[data-theme="dark"] .station-button:focus,
[data-theme="dark"] .platform-tab:focus,
[data-theme="dark"] .mini-close-button:focus,
[data-theme="dark"] .refresh-mini-button:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Enhanced contrast for better readability */
[data-theme="dark"] .arrival-time {
  color: var(--color-primary);
  font-weight: 700;
}

[data-theme="dark"] .countdown {
  color: var(--color-text-secondary);
  font-weight: 500;
}

[data-theme="dark"] .dest-text {
  color: var(--color-text);
  font-weight: 600;
}

[data-theme="dark"] .station-name .zh {
  color: var(--color-text);
  font-weight: 600;
}

[data-theme="dark"] .station-name .en {
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Additional visual enhancements */
[data-theme="dark"] .more-trains {
  background: var(--color-surface-container);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

[data-theme="dark"] .update-text {
  color: var(--color-text-tertiary);
  border-top-color: var(--color-border);
}

/* Section titles dark mode */
[data-theme="dark"] .section-title {
  color: var(--color-text);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Route toggle button dark mode */
[data-theme="dark"] .route-info-toggle {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: transparent;
}

[data-theme="dark"] .route-info-toggle:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: 0 2px 8px rgba(124, 146, 247, 0.3);
}

/* Mini view button dark mode */
[data-theme="dark"] .mini-view-button {
  background: var(--color-primary-container);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

[data-theme="dark"] .mini-view-button:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
