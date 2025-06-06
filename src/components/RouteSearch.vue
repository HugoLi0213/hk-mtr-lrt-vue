<template>
  <div class="route-search" :class="{ 'energy-mode': energyMode }">
    <!-- Map Component (only shown when not in energy mode) -->
    <SearchMap
      v-if="!energyMode"
      :start="locations.start ? locations.start.location : geolocation"
      :end="locations.end ? locations.end.location : null"
      :routes="result[resultIdx.resultIdx] || []"
      :stop-idx="resultIdx.stopIdx"
      @marker-click="handleMarkerClick"
    />

    <!-- Input Container -->
    <div class="input-container">
      <div class="input-box">
        <AddressInput
          :value="locations.start"
          :placeholder="t('你的位置')"
          :stop-list="stopList"
          @change="handleStartChange"
        />
        <AddressInput
          :value="locations.end"
          :placeholder="t('目的地')"
          :stop-list="stopList"
          @change="handleEndChange"
        />
      </div>
      <button class="reverse-button" @click="handleReverseClick">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </button>
    </div>

    <!-- Results Area -->
    <div class="result-list" :class="{ 'energy-mode': energyMode }">
      <!-- No destination selected -->
      <div v-if="!locations.end" class="description">
        <h2>{{ t('Route Search header') }}</h2>
        <hr />
        <h3>{{ t('Route Search description') }}</h3>
        <br />
        <p>{{ t('Route Search constraint') }}</p>
        <p>1. {{ t('Route Search caption 1') }}</p>
        <p>2. {{ t('Route Search caption 2') }}</p>
        <p>3. {{ t('Route Search caption 3') }}</p>
      </div>

      <!-- Loading -->
      <div v-else-if="isWaitingOrRendering && result.length === 0" class="progress">
        <div class="linear-progress">
          <div class="linear-progress-bar"></div>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="hasResults">
        <SearchResultList
          v-for="(routes, resIdx) in result"
          :key="`search-result-${resIdx}`"
          :routes="routes"
          :idx="resIdx"
          :expanded="resIdx === resultIdx.resultIdx"
          :stop-idx="resIdx === resultIdx.resultIdx ? resultIdx.stopIdx : null"
          @route-click="handleRouteClick"
        />
      </div>

      <!-- No results -->
      <div v-else class="no-results">
        {{ t('找不到合適的巴士路線') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import AddressInput from './route-search/AddressInput.vue'
import SearchMap from './route-search/SearchMap.vue'
import SearchResultList from './route-search/SearchResultList.vue'

// Define interfaces locally since hk-bus-eta may not be available
interface Location {
  lat: number
  lng: number
}

interface Address {
  name: string
  location: Location
}

interface Company {
  [key: string]: any
}

interface Eta {
  eta: string | null
  [key: string]: any
}

export interface SearchRoute {
  routeId: string
  on: number
  off: number
}

// Props
const props = defineProps<{
  goEta?: (routeId: string, bound?: string, serviceType?: string, seq?: number) => void
  goBoard?: () => void
}>()

// Injected dependencies with default values
const busDb = inject<any>('busDb', { routeList: {}, stopList: {}, holidays: [], serviceDayMap: {} })
const t = inject<(key: string) => string>('t', (key: string) => key)
const language = inject<string>('language', 'zh')
const geolocation = inject<Location>('geolocation', { lat: 22.3964, lng: 114.1095 })
const energyMode = inject<boolean>('energyMode', false)
const vibrateDuration = inject<number>('vibrateDuration', 0)

// Reactive data
const locations = ref<{ start: Address | null; end: Address | null }>({
  start: null,
  end: null
})
const status = ref<'ready' | 'rendering' | 'waiting'>('ready')
const result = ref<Array<SearchRoute[]>>([])
const resultIdx = ref<{ resultIdx: number; stopIdx: number[] }>({
  resultIdx: 0,
  stopIdx: [0, 0]
})

// Computed properties
const isWaitingOrRendering = computed(() => 
  status.value === 'waiting' || status.value === 'rendering'
)
const hasResults = computed(() => 
  ['ready', 'waiting', 'rendering'].includes(status.value) && result.value.length > 0
)

// Get database references
const routeList = computed(() => busDb?.routeList || {})
const stopList = computed(() => busDb?.stopList || {})
const holidays = computed(() => busDb?.holidays || [])
const serviceDayMap = computed(() => busDb?.serviceDayMap || {})

// Worker reference
const worker = ref<Worker | null>(null)

// Utility functions
const getDistance = (loc1: Location, loc2: Location): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = loc1.lat * Math.PI/180
  const φ2 = loc2.lat * Math.PI/180
  const Δφ = (loc2.lat-loc1.lat) * Math.PI/180
  const Δλ = (loc2.lng-loc1.lng) * Math.PI/180
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  
  return R * c
}

const vibrate = (duration: number) => {
  if (navigator.vibrate && duration > 0) {
    navigator.vibrate(duration)
  }
}

const terminateWorker = () => {
  if (worker.value) {
    worker.value.terminate()
    worker.value = null
  }
}

// Mock fetchEtas function since external library may not be available
const fetchEtas = async (_params: any): Promise<Eta[]> => {
  // Return empty array for now - replace with actual implementation
  return []
}

// Route update function
const updateRoutes = (routeResults: Array<SearchRoute[]>, startLocation: Location) => {
  const uniqueRoutes = routeResults
    .reduce(
      (acc, routeArr) =>
        acc.concat(
          ...routeArr.map((r) => [
            `${r.routeId}/${r.on}`,
            `${r.routeId}/${r.off}`,
          ])
        ),
      [] as string[]
    )
    .filter((v, i, s) => s.indexOf(v) === i)

  // Check currently available routes by fetching ETA
  Promise.all(
    uniqueRoutes.map((routeIdSeq): Promise<Eta[]> => {
      const [routeId, seq] = routeIdSeq.split('/')
      return !navigator.onLine
        ? Promise.resolve([])
        : fetchEtas({
            ...routeList.value[routeId],
            seq: parseInt(seq, 10),
            co: Object.keys(routeList.value[routeId].stops) as Company[],
            language: language as 'en' | 'zh',
            stopList: stopList.value,
            serviceDayMap: serviceDayMap.value,
            holidays: holidays.value,
          }).then((p) => p.filter((e) => e.eta))
    })
  )
    .then((etas) =>
      // Filter out non available routes
      uniqueRoutes.filter(
        (_, idx) =>
          !navigator.onLine ||
          (etas[idx].length &&
            etas[idx].reduce((acc, eta) => Boolean(acc || eta.eta), false))
      )
    )
    .then((availableRoutes) => {
      result.value = [
        ...result.value,
        // Save current available route only
        ...routeResults
          .filter((routes) =>
            routes.reduce((ret, route) => {
              return (
                ret &&
                (availableRoutes.indexOf(`${route.routeId}/${route.on}`) !== -1 ||
                  availableRoutes.indexOf(`${route.routeId}/${route.off}`) !== -1)
              )
            }, true)
          )
          // Refine nearest start if available
          .map((routes) => {
            let start = startLocation
            return routes.map((route) => {
              const stops = Object.values(routeList.value[route.routeId].stops)
                .sort((a: any, b: any) => b.length - a.length)[0] as string[]
              let bestOn = -1
              let dist = 100000
              for (let i = route.on; i < route.off; ++i) {
                const stopLocation = stopList.value[stops[i]]?.location
                if (stopLocation) {
                  let _dist = getDistance(stopLocation, start)
                  if (_dist < dist) {
                    bestOn = i
                    dist = _dist
                  }
                }
              }
              const endStopLocation = stopList.value[stops[route.off]]?.location
              if (endStopLocation) {
                start = endStopLocation
              }
              return {
                ...route,
                on: bestOn,
              }
            })
          })
          // Sort route by number of stops
          .map((routes): [SearchRoute[], number] => [
            routes,
            routes.reduce((sum, route) => sum + route.off - route.on, 0),
          ])
          .sort((a, b) => a[1] - b[1])
          .map((v) => v[0])
      ]
    })
}

// Event handlers
const handleStartChange = (address: Address | null) => {
  locations.value.start = address
  status.value = 'waiting'
  resultIdx.value = { resultIdx: 0, stopIdx: [0, 0] }
  result.value = []
}

const handleEndChange = (address: Address | null) => {
  locations.value.end = address
  status.value = address ? 'waiting' : status.value
  resultIdx.value = { resultIdx: 0, stopIdx: [0, 0] }
  result.value = []
}

const handleRouteClick = (idx: number) => {
  vibrate(vibrateDuration || 0)
  setTimeout(() => {
    resultIdx.value = { resultIdx: idx, stopIdx: [0, 0] }
  }, 0)
}

const handleMarkerClick = (routeId: string, offset: number) => {
  const routeIdx = result.value[resultIdx.value.resultIdx]
    .map((route) => route.routeId)
    .indexOf(routeId)
  const _stopIdx = [...resultIdx.value.stopIdx]
  _stopIdx[routeIdx] = offset
  resultIdx.value = {
    ...resultIdx.value,
    stopIdx: _stopIdx,
  }
}

const handleReverseClick = () => {
  locations.value = {
    start: locations.value.end,
    end: locations.value.start,
  }
  status.value = 'waiting'
  resultIdx.value = { resultIdx: 0, stopIdx: [0, 0] }
  result.value = []
}

// Watchers
watch(
  () => [status.value, result.value],
  ([status]) => {
    // Update status if status is rendering
    if (status === 'rendering') {
      status.value = 'ready'
    }
  }
)

watch(
  () => [status.value, locations.value, geolocation],
  ([status, locations, geolocation]) => {
    if (status === 'waiting' && locations.end) {
      if (window.Worker) {
        terminateWorker()
        const startLocation = locations.start
          ? locations.start.location
          : geolocation
        worker.value = new Worker('/search-worker.js')
        worker.value.postMessage({
          routeList: routeList.value,
          stopList: stopList.value,
          start: startLocation,
          end: locations.end.location,
          maxDepth: 2,
        })
        worker.value.onmessage = (e) => {
          if (e.data.type === 'done') {
            terminateWorker()
            // Set status to rendering result if result not empty
            status.value = e.data.count ? 'rendering' : 'ready'
            return
          }
          updateRoutes(
            e.data.value.sort(
              (a: SearchRoute[], b: SearchRoute[]) => a.length - b.length
            ),
            startLocation
          )
        }
      }
    }
  },
  { deep: true }
)

// Lifecycle
onMounted(() => {
  // Set SEO header would go here if needed
})

onUnmounted(() => {
  terminateWorker()
})

// Silence the unused props warning - props is used for type checking
console.log('RouteSearch props:', props)
</script>

<style scoped>
.route-search {
  background: white;
  overflow-y: hidden;
  text-align: left;
  width: 100%;
  height: 100%;
}

.route-search.energy-mode {
  background: var(--color-background, white);
}

.input-container {
  display: flex;
  flex-direction: row;
  margin-top: 2%;
  padding: 0% 2%;
}

.input-box {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.reverse-button {
  min-width: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.reverse-button:hover {
  background: #f5f5f5;
}

.result-list {
  overflow-y: scroll;
  height: calc(100% - 30vh - 76px);
}

.result-list.energy-mode {
  height: calc(100% - 76px);
}

.description {
  text-align: left;
  margin-top: 5%;
  padding: 5%;
}

.description h2 {
  margin-bottom: 1em;
  font-size: 1.5em;
  font-weight: bold;
}

.description hr {
  margin: 1em 0;
  border: none;
  border-top: 1px solid #eee;
}

.description h3 {
  margin-bottom: 1em;
  font-size: 1.2em;
  font-weight: normal;
}

.description p {
  margin-bottom: 0.5em;
  line-height: 1.5;
}

.progress {
  padding: 1em;
}

.linear-progress {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.linear-progress-bar {
  height: 100%;
  background: #1976d2;
  animation: indeterminate 2s infinite linear;
  width: 100%;
}

@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.no-results {
  text-align: center;
  padding: 2em;
  color: #666;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .route-search {
    background: #121212;
    color: white;
  }
  
  .reverse-button:hover {
    background: #333;
  }
  
  .description hr {
    border-top-color: #333;
  }
  
  .linear-progress {
    background: #333;
  }
  
  .no-results {
    color: #aaa;
  }
}
</style>
