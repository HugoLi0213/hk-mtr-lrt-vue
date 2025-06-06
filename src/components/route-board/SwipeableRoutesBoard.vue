<template>
  <div class="swipeable-routes-board">
    <!-- Route List -->
    <div class="route-list" v-if="currentRouteList.length > 0">
      <div
        v-for="(route, index) in currentRouteList"
        :key="`route-${route[0]}-${index}`"
        class="route-item"
        @click="handleRouteClick(route)"
      >
        <RouteRow 
          :route="route" 
          :show-remove="boardTab === 'recent'"
          @remove="handleRemoveRoute(route[0])"
        />
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="no-results">
      <div class="no-results-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="sad-icon">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        
        <div v-if="boardTab !== 'recent'">
          <div class="search-info">
            <span v-if="searchRouteDisplay">"{{ searchRouteDisplay }}"</span>
            <span>{{ t('route-search-no-result') }}</span>
          </div>
          <p>{{ t('suggest-update-database') }}</p>
        </div>
        
        <div v-else>
          <div class="search-info">
            <span v-if="searchRouteDisplay">"{{ searchRouteDisplay }}"</span>
            <span>{{ t('no-recent-search') }}</span>
          </div>
        </div>
      </div>
      
      <!-- Suggest search all routes -->
      <div v-if="boardTab !== 'all'" class="search-suggestion">
        <p>
          {{ t('tap-here-to-search-all-routes-prefix') }}
          <button class="link-button" @click="$emit('changeTab', 'all')">
            {{ t('tap-here-to-search-all-routes-link') }}
          </button>
          {{ t('tap-here-to-search-all-routes-suffix') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { getSearchValue } from '../../utils/index'
import RouteRow from './RouteRow.vue'

type BoardTab = 'recent' | 'all' | 'bus' | 'minibus' | 'lightRail' | 'mtr' | 'ferry'
type Company = string

interface RouteListEntry {
  route: string
  bound: string
  service_type: string
  stops: Record<string, string[]>
  co: Company[]
  orig: { zh: string; en: string }
  dest: { zh: string; en: string }
  freq?: any
}

// Props
const props = defineProps<{
  boardTab: BoardTab
}>()

// Emits
defineEmits<{
  changeTab: [tab: BoardTab]
}>()

// Injected dependencies
const busDb = inject<{ routeList: Record<string, RouteListEntry>, serviceDayMap: any, holidays: any[] }>('busDb', { 
  routeList: {}, 
  serviceDayMap: {}, 
  holidays: [] 
})
const t = inject<(key: string) => string>('t', (key: string) => key)
const searchRoute = inject<string>('searchRoute', '')
const isRouteFilter = inject<boolean>('isRouteFilter', false)
const busSortOrder = inject<'KMB first' | 'CTB first'>('busSortOrder', 'KMB first')
const routeSearchHistory = inject<string[]>('routeSearchHistory', [])
const vibrateDuration = inject<number>('vibrateDuration', 0)
const addSearchHistory = inject<(route: string) => void>('addSearchHistory', () => {})
const removeSearchHistoryByRouteId = inject<(route: string) => void>('removeSearchHistoryByRouteId', () => {})
const goEta = inject<(routeId: string) => void>('goEta', () => {})

// Transport search options
const TRANSPORT_SEARCH_OPTIONS = {
  recent: ['kmb', 'ctb', 'lrtfeeder', 'nlb', 'gmb', 'lightRail', 'mtr'],
  all: ['kmb', 'ctb', 'lrtfeeder', 'nlb', 'gmb', 'lightRail', 'mtr', 'sunferry', 'fortuneferry', 'hkkf'],
  bus: ['kmb', 'ctb', 'lrtfeeder', 'nlb'],
  minibus: ['gmb'],
  lightRail: ['lightRail'],
  mtr: ['mtr'],
  ferry: ['sunferry', 'fortuneferry', 'hkkf']
}

const TRANSPORT_ORDER = {
  'KMB first': ['kmb', 'ctb', 'lrtfeeder', 'nlb', 'gmb', 'lightRail', 'mtr'],
  'CTB first': ['ctb', 'kmb', 'lrtfeeder', 'nlb', 'gmb', 'lightRail', 'mtr']
}

// Utility functions
const vibrate = (duration: number) => {
  if (navigator.vibrate && duration > 0) {
    navigator.vibrate(duration)
  }
}

const isHoliday = (_holidays: any[], _date: Date): boolean => {
  // Mock implementation - replace with actual holiday logic
  return false
}

const isRouteAvailable = (_routeNo: string, _freq: any, _isHoliday: boolean, _serviceDayMap: any): boolean => {
  // Mock implementation - replace with actual availability logic
  return true
}

const routeSortFunc = (a: [string, RouteListEntry], b: [string, RouteListEntry], _order: string[]): number => {
  // Mock implementation - replace with actual sorting logic
  return a[0].localeCompare(b[0])
}

// Computed
const isTodayHoliday = computed(() => isHoliday(busDb.holidays || [], new Date()))

// Computed value for template display
const searchRouteDisplay = computed(() => getSearchValue(searchRoute))

const currentRouteList = computed(() => {
  const routeList = busDb.routeList || {}
  
  // Get the actual string value of searchRoute, handling both string and ref cases
  const searchRouteValue = getSearchValue(searchRoute);
  const searchRouteUpper = searchRouteValue.toUpperCase();
  
  if (props.boardTab === 'recent') {
    // Show recent search history
    return routeSearchHistory
      .filter(routeNo => routeNo.startsWith(searchRouteUpper))
      .filter(routeNo => routeList[routeNo])
      .map(routeNo => [routeNo, routeList[routeNo]] as [string, RouteListEntry])
  }
  
  // Filter routes by search term and transport type
  const searchOptions = TRANSPORT_SEARCH_OPTIONS[props.boardTab] || []
  
  return Object.entries(routeList)
    .filter(([routeNo, route]: [string, RouteListEntry]) => {
      // Filter by route number
      if (!routeNo.startsWith(searchRouteUpper)) return false
      
      // Filter by transport type
      if (!route.co.some(c => searchOptions.includes(c))) return false
      
      // Filter by availability if route filter is enabled
      if (isRouteFilter && !isRouteAvailable(routeNo, route.freq, isTodayHoliday.value, busDb.serviceDayMap)) {
        return false
      }
      
      // Check if route has stops
      const hasStops = route.stops[route.co[0]] == null || route.stops[route.co[0]].length > 0
      return hasStops
    })
    .sort((a, b) => routeSortFunc(a, b, TRANSPORT_ORDER[busSortOrder] || []))
    .slice(0, 100) // Limit results for performance
})

// Event handlers
const handleRouteClick = (route: [string, RouteListEntry]) => {
  vibrate(vibrateDuration)
  addSearchHistory(route[0])
  
  setTimeout(() => {
    goEta(route[0].toLowerCase())
  }, 0)
}

const handleRemoveRoute = (routeNo: string) => {
  vibrate(vibrateDuration)
  removeSearchHistoryByRouteId(routeNo)
}
</script>

<style scoped>
.swipeable-routes-board {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.route-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.route-item {
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.route-item:hover {
  background-color: var(--color-hover, rgba(0, 0, 0, 0.04));
}

.route-item:last-child {
  border-bottom: none;
}

.no-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 120px;
}

.no-results-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.sad-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-secondary, #666);
  margin-bottom: 0.5rem;
}

.search-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary, #333);
}

.search-suggestion {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-background-secondary, #f5f5f5);
  border-radius: 8px;
  max-width: 400px;
}

.link-button {
  background: none;
  border: none;
  color: var(--color-primary, #1976d2);
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
  padding: 0;
}

.link-button:hover {
  color: var(--color-primary-dark, #1565c0);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .route-item {
    border-bottom-color: #333;
  }
  
  .route-item:hover {
    background-color: var(--color-hover-dark, rgba(255, 255, 255, 0.08));
  }
  
  .sad-icon {
    color: var(--color-text-secondary-dark, #aaa);
  }
  
  .search-info {
    color: var(--color-text-primary-dark, #fff);
  }
  
  .search-suggestion {
    background: var(--color-background-secondary-dark, #333);
  }
  
  .link-button {
    color: var(--color-primary-dark, #64b5f6);
  }
  
  .link-button:hover {
    color: var(--color-primary-light, #90caf9);
  }
}
</style>
