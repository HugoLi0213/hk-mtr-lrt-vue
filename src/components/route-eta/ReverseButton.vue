<template>
  <div v-if="reverseRouteUrl" class="reverse-button-container">
    <div class="button-divider"></div>
    <button class="reverse-button" @click="handleReverseClick">
      <span class="button-icon">
        <svg viewBox="0 0 24 24" class="sync-icon">
          <path d="M7.5 21.5l1.5-1.5-3.5-3.5H16v-2H5.5l3.5-3.5-1.5-1.5L2 15l5.5 6.5zM16.5 2.5L15 4l3.5 3.5H8v2h10.5L15 13l1.5 1.5L22 9l-5.5-6.5z"></path>
        </svg>
      </span>
      <span class="button-text">{{ t('對頭線') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { getDistance } from '../../utils/index';

// Props
const props = defineProps<{
  routeId: string;
  stopId: string;
}>();

// Injected dependencies
const busDb = inject<any>('busDb', {
  routeList: {},
  stopList: {},
  holidays: [],
  serviceDayMap: {}
});
const t = inject<(key: string) => string>('t', (key: string) => key);
const language = inject<string>('language', 'zh');
const navigate = inject<(path: string) => void>('navigate', () => {});
const vibrateDuration = inject<number>('vibrateDuration', 0);

// Utility functions
const isHoliday = (holidays: any[], date: Date): boolean => {
  // Simplified implementation - in a real app, this would check if the date is a holiday
  return false;
};

const isRouteAvailable = (route: string, freq: any, isTodayHoliday: boolean, serviceDayMap: any): boolean => {
  // Simplified implementation - in a real app, this would check route availability
  return true;
};

// Computed properties
const isTodayHoliday = computed(() => isHoliday(busDb.holidays, new Date()));

const reverseRouteUrl = computed(() => {
  const { routeList, stopList, serviceDayMap } = busDb;
  const routeEntry = routeList[props.routeId] || { route: '', co: [], stops: {} };
  const { route, co, gtfsId, stops } = routeEntry;
  
  if (!route || !co.length || !stopList || !Object.keys(stops).length) {
    return null;
  }
  
  // Find potential reverse route candidates
  const reverseRoutes = Object.entries(routeList)
    .filter(([key, _routeEntry]: [string, any]) => {
      if (key === props.routeId) return false;
      const { co: _co, route: _route, gtfsId: _gtfsId } = _routeEntry;
      
      // Special case for GMB routes with GTFS IDs
      if (co[0] === "gmb" && gtfsId && gtfsId !== _gtfsId) {
        return false;
      }
      
      // Match route number and companies
      return _route === route && JSON.stringify(co) === JSON.stringify(_co);
    })
    .sort(([, a], [, b]) => {
      const aAvail = isRouteAvailable(a.route, a.freq, isTodayHoliday.value, serviceDayMap);
      const bAvail = isRouteAvailable(b.route, b.freq, isTodayHoliday.value, serviceDayMap);
      
      if (aAvail === bAvail) {
        try {
          // Calculate distances between endpoints to find the most likely reverse route
          const refOrig = stopList[Object.values(stops)[0][0]];
          const refDest = stopList[Object.values(stops)[0].slice(-1)[0]];
          
          const aOrig = stopList[Object.values(a.stops)[0][0]];
          const aDest = stopList[Object.values(a.stops)[0].slice(-1)[0]];
          const aDist = getDistance(aOrig.location, refDest.location) +
                        getDistance(refOrig.location, aDest.location);
          
          const bOrig = stopList[Object.values(b.stops)[0][0]];
          const bDest = stopList[Object.values(b.stops)[0].slice(-1)[0]];
          const bDist = getDistance(bOrig.location, refDest.location) +
                        getDistance(refOrig.location, bDest.location);
          
          // Pick the one with shorter distance
          return aDist < bDist ? -1 : 1;
        } catch (e) {
          return 0;
        }
      }
      
      // Available routes first
      return aAvail > bAvail ? -1 : 1;
    })
    .map(([key]) => key)
    .filter(key => key.toLowerCase() !== props.routeId.toLowerCase());
  
  if (!reverseRoutes.length) {
    return null;
  }
  
  // Find nearest stop on the reverse route to current stop
  try {
    const curStop = stopList[props.stopId].location;
    let stopIds = Object.values(routeList[reverseRoutes[0]].stops)[0];
    let stopIdx = 0;
    let minDist = Number.MAX_SAFE_INTEGER;
    
    for (let i = 0; i < stopIds.length; ++i) {
      let dist = getDistance(curStop, stopList[stopIds[i]].location);
      if (dist < minDist) {
        minDist = dist;
        stopIdx = i;
      }
    }
    
    return `/${language}/route/${reverseRoutes[0].toLowerCase()}/${stopIds[stopIdx]},${stopIdx}`;
  } catch (e) {
    return `/${language}/route/${reverseRoutes[0].toLowerCase()}`;
  }
});

// Methods
function handleReverseClick() {
  if (reverseRouteUrl.value) {
    // Vibrate if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(vibrateDuration);
    }
    
    // Navigate to the reverse route
    navigate(reverseRouteUrl.value);
  }
}
</script>

<style scoped>
.reverse-button-container {
  position: relative;
}

.button-divider {
  position: absolute;
  top: 0;
  left: calc(64px + 2%);
  width: 1px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.12);
}

.reverse-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: inherit;
  position: absolute;
  top: 0;
  left: 2%;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 0.8rem;
}

.button-icon {
  display: block;
  margin-bottom: 2px;
}

.sync-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.button-text {
  font-size: 0.75rem;
}
</style>
