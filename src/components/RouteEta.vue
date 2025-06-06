<template>
  <div class="route-eta">
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
import { computed, inject, ref } from 'vue';
import RouteHeader from './route-eta/RouteHeader.vue';
import RouteMap from './route-eta/RouteMap.vue';
import RouteUpdateNotice from './route-eta/RouteUpdateNotice.vue';
import StopAccordionList from './route-eta/StopAccordionList.vue';
import StopDialog from './route-eta/StopDialog.vue';

// Props for navigation and route info
const props = defineProps<{
  routeId?: string;
  panel?: string;
  goBoard?: () => void;
  goSearch?: (props: any) => void;
}>();

// Inject dependencies
const busDb = inject<any>('busDb', {
  routeList: {},
  stopList: {},
  stopMap: {},
});

const energyMode = inject<boolean>('energyMode', false);
const isPrerendering = inject<boolean>('isPrerendering', false);

// State
const stopIdx = ref(0);
const isDialogOpen = ref(false);
const dialogStop = ref<Array<[string, string]>>([]);

// Extract route information from the database
const routeId = computed(() => props.routeId?.toUpperCase() || '');
const routeListEntry = computed(() => busDb.routeList[routeId.value] || {});
const route = computed(() => routeListEntry.value || {});
const co = computed(() => route.value.co || []);

// Get stop IDs for the route
const stopIds = computed(() => {
  const company = co.value[0];
  return route.value.stops?.[company] || [];
});

// Event handlers
function handleChange(idx: number) {
  stopIdx.value = idx;
}

function onMarkerClick(idx: number) {
  stopIdx.value = idx;
}

function handleStopInfo(stopId: string) {
  // Create an array of company and stopId for the StopRouteList component
  // The first element is the company and the second is the stop ID
  // We're using the first company from the route as a fallback
  const company = co.value[0] || 'kmb';
  dialogStop.value = [[company, stopId]];
  isDialogOpen.value = true;
}

function handleCloseDialog() {
  isDialogOpen.value = false;
}
</script>

<style scoped>
.route-eta {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background: var(--color-background-default, #fff);
}
</style>
