<template>
  <div>
    <RouteHeader :route-id="routeId" :stop-id="stopIds[stopIdx]" />
    <RouteUpdateNotice :route="routeListEntry" />
    <RouteMap
      v-if="!energyMode && !isPrerendering"
      :route-id="routeId"
      :stop-ids="stopIds"
      :stop-idx="stopIdx"
      :route="route"
      :companies="co"
      @marker-click="onMarkerClick"
    />
    <StopAccordionList
      :route-id="routeId"
      :stop-idx="stopIdx"
      :route-list-entry="routeListEntry"
      :stop-ids="stopIds"
      @change="handleChange"
      @stop-info="handleStopInfo"
    />
    <StopDialog
      :open="isDialogOpen"
      :stops="dialogStop"
      @close="handleCloseDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import RouteHeader from './route-eta/RouteHeader';
import StopAccordionList from './route-eta/StopAccordionList';
import StopDialog from './route-eta/StopDialog';
import RouteUpdateNotice from './route-eta/RouteUpdateNotice';
import RouteMap from './route-eta/RouteMap';
import StrSim from 'string-similarity';

// Props for navigation and route info
const props = defineProps<{
  routeId?: string;
  panel?: string;
  goBoard?: () => void;
  goSearch?: (props: any) => void;
}>();

// Inject bus db (routeList, stopList, stopMap) from parent or provide a mock for demo
const db = inject('busDb', {
  routeList: {},
  stopList: {},
  stopMap: {},
});
const energyMode = inject('energyMode', false);
const isPrerendering = inject('isPrerendering', false);
const geoPermission = inject('geoPermission', 'denied');
const geolocation = inject('geolocation', { current: { lat: 0, lng: 0 } });

const routeId = computed(() => {
  if (props.routeId && db.routeList[props.routeId]) return props.routeId;
  if (props.routeId) {
    const prefix = props.routeId.split('-')[0];
    return StrSim.findBestMatch(
      props.routeId.toUpperCase(),
      Object.keys(db.routeList).filter((v) => v.startsWith(prefix))
    ).bestMatch.target;
  }
  return Object.keys(db.routeList)[0];
});
const routeListEntry = computed(() => db.routeList[routeId.value] || {});
const route = computed(() => routeListEntry.value.route || '');
const stops = computed(() => routeListEntry.value.stops || {});
const co = computed(() => routeListEntry.value.co || []);
const stopIds = computed(() => {
  for (let i = 0; i < co.value.length; ++i) {
    if (co.value[i] in stops.value) {
      return stops.value[co.value[i]];
    }
  }
  return [];
});

const defaultStopIdx = computed(() => {
  if (geoPermission === 'granted') {
    let minIdx = 0;
    let minDist = Infinity;
    stopIds.value.forEach((stopId: string, idx: number) => {
      const dist = getDistance(geolocation.current, db.stopList[stopId]?.location || { lat: 0, lng: 0 });
      if (dist < minDist) {
        minIdx = idx;
        minDist = dist;
      }
    });
    return minIdx;
  }
  return 0;
});

const stopIdx = computed(() => {
  if (props.panel !== undefined) {
    const [id, indexStr] = props.panel.split(',');
    if (id === undefined || indexStr === undefined) {
      return parseInt(props.panel, 10);
    } else {
      const index = parseInt(indexStr, 10);
      let ret = 0;
      let currentDistance = 9999999;
      for (let stopCo in stops.value) {
        let coStopsIdxes = stops.value[stopCo].reduce(
          (acc: number[], companyStop: string, i: number) => {
            if (companyStop === id) acc.push(i);
            return acc;
          },
          []
        );
        for (let coStopsIdx of coStopsIdxes) {
          if (coStopsIdx >= 0) {
            let distanceToId = Math.abs(coStopsIdx - index);
            if (distanceToId < currentDistance) {
              ret = coStopsIdx;
              currentDistance = distanceToId;
            }
          }
        }
      }
      return ret;
    }
  }
  return defaultStopIdx.value;
});

const isDialogOpen = ref(false);
const dialogStop = computed(() => {
  for (let i = 0; i < co.value.length; ++i) {
    if (co.value[i] in stops.value)
      return [[co.value[i], stops.value[co.value[i]][stopIdx.value]]].concat(
        db.stopMap[stops.value[co.value[i]][stopIdx.value]] ?? []
      );
  }
  return [];
});

function handleChange(newStopIdx: number, expanded: boolean) {
  if (expanded && stopIdx.value !== newStopIdx) {
    // 可選擇觸發 goSearch/goBoard
    // if (props.goSearch) props.goSearch({ ... });
  }
  if (stopIdx.value === newStopIdx && !expanded) isDialogOpen.value = true;
}
function onMarkerClick(newStopIdx: number) {
  if (stopIdx.value === newStopIdx) {
    isDialogOpen.value = true;
  }
  // 可選擇觸發導航
}
function handleStopInfo() {
  isDialogOpen.value = true;
}
function handleCloseDialog() {
  isDialogOpen.value = false;
}

function getDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}
</script>
