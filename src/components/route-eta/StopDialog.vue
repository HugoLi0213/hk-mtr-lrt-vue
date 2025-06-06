<template>
  <div>
    <dialog v-if="open" class="stop-dialog">
      <div class="dialog-title">
        <button @click="toggleBookmark">
          <span v-if="bookmarked">★</span>
          <span v-else>☆</span>
        </button>
        {{ stopName }}
        <button @click="handleClickDirection">導航</button>
        <button @click="handleClickLocation">地圖</button>
        <button @click="onClose">關閉</button>
      </div>
      <div class="dialog-content">
        <StopRouteList :stops="stops" :is-focus="true" />
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import StopRouteList from '../bookmarked-stop/StopRouteList.vue';

const props = defineProps<{ open: boolean; stops: Array<[string, string]> }>();
const emit = defineEmits(['close']);

// Define a proper type for the bus database
interface StopInfo {
  name: {
    zh: string;
    en: string;
  };
  location: [number, number];
}

interface BusDb {
  stopList: Record<string, StopInfo>;
  [key: string]: any;
}

const db = inject<BusDb>('busDb', { stopList: {} });
const language = inject<string>('language', 'zh');
const savedStops = inject<string[]>('savedStops', []);
const updateSavedStops = inject<(id: string) => void>('updateSavedStops', (id: string) => {});

const stopName = computed(() => {
  if (!props.stops || props.stops.length === 0) return '';
  const stopId = props.stops[0]?.[1];
  const stop = db.stopList[stopId];
  return stop?.name ? stop.name[language as keyof typeof stop.name] || '' : '';
});

const bookmarked = computed(() => {
  if (!props.stops || props.stops.length === 0) return false;
  return props.stops.some(s => savedStops.includes(s.join('|')));
});

function toggleBookmark() {
  if (!props.stops || props.stops.length === 0) return;
  updateSavedStops(props.stops[0].join('|'));
}

function handleClickDirection() {
  if (!props.stops || props.stops.length === 0) return;
  const stopId = props.stops[0]?.[1];
  const stop = db.stopList[stopId];
  if (stop?.location) {
    const lat = Array.isArray(stop.location) ? stop.location[0] : stop.location.lat;
    const lng = Array.isArray(stop.location) ? stop.location[1] : stop.location.lng;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`, '_blank');
  }
}
function handleClickLocation() {
  if (!props.stops || props.stops.length === 0) return;
  const stopId = props.stops[0]?.[1];
  const loc = db.stopList[stopId]?.location;
  if (loc) {
    window.open(`https://www.google.com/maps/?q=${loc[0]},${loc[1]}`, '_blank');
  }
}

function onClose() {
  emit('close');
}
</script>

<style scoped>
.stop-dialog {
  width: 100%;
  margin-top: 90px;
  height: calc(100vh - 100px);
}
.dialog-title {
  display: flex;
  justify-content: space-between;
  background: #f5f5f5;
  color: #333;
  padding: 0.5em;
}
.dialog-content {
  padding: 0;
}
</style>
