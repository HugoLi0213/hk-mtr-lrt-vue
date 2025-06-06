<template>
  <div id="app">
    <!-- Bus ETA App -->
    <BusEta />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import BusEta from './components/BusEta.vue'

// Create mock bus database
const createBusDb = () => {
  return {
    routeList: {
      // Mock route data - in a real app this would come from hk-bus-eta
      '1': {
        route: '1',
        bound: 'O',
        service_type: '1',
        co: ['kmb'],
        orig: { zh: '尖沙咀（麼地道）', en: 'Tsim Sha Tsui (Mody Road)' },
        dest: { zh: '竹園邨', en: 'Chuk Yuen Estate' },
        stops: { kmb: ['stop1', 'stop2', 'stop3'] }
      },
      '2': {
        route: '2',
        bound: 'O', 
        service_type: '1',
        co: ['kmb'],
        orig: { zh: '尖沙咀', en: 'Tsim Sha Tsui' },
        dest: { zh: '蘇屋邨', en: 'So Uk Estate' },
        stops: { kmb: ['stop4', 'stop5', 'stop6'] }
      }
    },
    stopList: {
      stop1: { name: { zh: '停站1', en: 'Stop 1' }, location: [22.3, 114.2] },
      stop2: { name: { zh: '停站2', en: 'Stop 2' }, location: [22.31, 114.21] },
      stop3: { name: { zh: '停站3', en: 'Stop 3' }, location: [22.32, 114.22] },
      stop4: { name: { zh: '停站4', en: 'Stop 4' }, location: [22.33, 114.23] },
      stop5: { name: { zh: '停站5', en: 'Stop 5' }, location: [22.34, 114.24] },
      stop6: { name: { zh: '停站6', en: 'Stop 6' }, location: [22.35, 114.25] }
    },
    stopMap: {},
    serviceDayMap: {},
    holidays: [],
    AppTitle: 'HK Bus ETA'
  }
}

// Mock translation function
const t = (key: string) => {
  const translations: Record<string, string> = {
    '搜尋': 'Search',
    'HK Bus ETA': 'HK Bus ETA',
    '往': 'To',
    '由': 'From',
    '特別班': 'Special',
    'route-board-page-description': 'Search and find bus routes in Hong Kong',
    'no-recent-search': 'No recent searches',
    'route-search-no-result': 'No routes found',
    'suggest-update-database': 'Please update the database',
    'tap-here-to-search-all-routes-prefix': 'Tap ',
    'tap-here-to-search-all-routes-link': 'here',
    'tap-here-to-search-all-routes-suffix': ' to search all routes',
    'recent': 'Recent',
    'all': 'All',
    'bus': 'Bus',
    'minibus': 'Minibus',
    'lightRail': 'Light Rail',
    'mtr': 'MTR',
    'ferry': 'Ferry',
    'kmb': 'KMB',
    'ctb': 'CTB',
    'nlb': 'NLB',
    'gmb': 'GMB'
  }
  return translations[key] || key
}

// Transport search options (matching hkbus.app constants)
const transportSearchOptions = {
  recent: ['kmb', 'ctb', 'nlb', 'gmb', 'mtr', 'lrt', 'ferry'],
  all: ['kmb', 'ctb', 'nlb', 'gmb', 'mtr', 'lrt', 'ferry'],
  bus: ['kmb', 'ctb', 'nlb'],
  minibus: ['gmb'],
  lightRail: ['lrt'],
  mtr: ['mtr'],
  ferry: ['ferry']
}

// Provide all the context that components need
const busDb = createBusDb()
provide('busDb', busDb)
provide('t', t)
provide('language', 'zh')
provide('searchRoute', '')
provide('isRouteFilter', false)
provide('busSortOrder', 'KMB first')
provide('routeSearchHistory', [])
provide('vibrateDuration', 0)
provide('isRecentSearchShown', true)
provide('numPadOrder', '123456789b0c')
provide('transportSearchOptions', transportSearchOptions)

// Saved stops for bookmark functionality
const savedStops = ref<string[]>([]);
provide('savedStops', savedStops);
provide('updateSavedStops', (stopId: string) => {
  const index = savedStops.value.indexOf(stopId);
  if (index >= 0) {
    savedStops.value.splice(index, 1);
  } else {
    savedStops.value.push(stopId);
  }
});

// Saved ETAs for route star functionality
const savedEtas = ref<string[]>([]);
provide('savedEtas', savedEtas);
provide('addSavedEta', (routeId: string) => {
  if (!savedEtas.value.includes(routeId)) {
    savedEtas.value.push(routeId);
  }
});
provide('removeSavedEta', (routeId: string) => {
  const index = savedEtas.value.indexOf(routeId);
  if (index >= 0) {
    savedEtas.value.splice(index, 1);
  }
});
provide('isPrerendering', false)
provide('energyMode', false)
provide('geoPermission', 'denied')
provide('geolocation', { lat: 22.3193, lng: 114.1694 }) // Hong Kong default

// Mock functions for updating search
provide('updateSearchRouteByButton', (key: string) => {
  console.log('Button pressed:', key)
  // In a real app, this would update the search route state
})
</script>

<style>
/* Import the bus ETA app styles */
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap');

/* CSS Custom Properties for theming */
:root {
  /* Colors for light theme */
  --color-background-default: #ffffff;
  --color-background-paper: #f5f5f5;
  --color-background-paper-hover: #eeeeee;
  --color-background-paper-active: #e0e0e0;
  --color-background-hover: rgba(0, 0, 0, 0.04);
  --color-text-primary: #000000;
  --color-text-secondary: #666666;
  --color-border: #e0e0e0;
  
  /* Colors for dark theme */
  --color-background-default-dark: #121212;
  --color-background-paper-dark: #424242;
  --color-background-paper-hover-dark: #515151;
  --color-background-paper-active-dark: #616161;
  --color-background-hover-dark: rgba(255, 255, 255, 0.08);
  --color-text-primary-dark: #ffffff;
  --color-text-secondary-dark: #aaaaaa;
  --color-border-dark: #424242;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--color-background-default);
  color: var(--color-text-primary);
  transition: background-color 0.3s, color 0.3s;
}

* {
  box-sizing: border-box;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Global link styles */
a {
  color: inherit;
  text-decoration: none;
}

/* Button reset */
button {
  font-family: inherit;
  font-size: inherit;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  body {
    background: var(--color-background-default-dark);
    color: var(--color-text-primary-dark);
  }
}
</style>
