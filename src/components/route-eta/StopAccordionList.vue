<template>
  <div class="stop-accordion-list">
    <div
      v-for="(stopId, idx) in stopIds"
      :key="'stop-' + idx"
      class="stop-accordion"
      :class="{ 'active': stopIdx === idx }"
      ref="el => setAccordionRef(idx, el)"
    >
      <div class="stop-header" @click="handleChange(idx, true)">
        <div class="stop-info">
          <div class="stop-name">{{ getStopName(stopId) }}</div>
          <div class="stop-fare">{{ getStopFare(stopId, idx) }}</div>
        </div>
        <div class="stop-actions">
          <button class="info-button" @click.stop="onStopInfo(stopId)">
            Info
          </button>
        </div>
      </div>
      <div class="stop-details" v-if="stopIdx === idx">
        <div class="eta-container">
          <div class="eta-loading" v-if="loadingEta">Loading...</div>
          <div class="eta-times" v-else-if="etaTimes.length > 0">
            <div v-for="(eta, etaIdx) in etaTimes" :key="etaIdx" class="eta-time">
              {{ formatEta(eta) }}
            </div>
          </div>
          <div class="no-eta" v-else>No ETA available</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, nextTick, ref, watch } from 'vue';

const props = defineProps<{
  routeId: string;
  stopIdx: number;
  routeListEntry: any;
  stopIds: string[];
}>();
const emit = defineEmits(['change', 'stop-info']);

// State
const accordionRefs = ref<any[]>([]);
const loadingEta = ref(false);
const etaTimes = ref<any[]>([]);

// Injected dependencies
const busDb = inject<any>('busDb', { stopList: {} });
const language = inject<string>('language', 'zh');
const t = inject<(key: string) => string>('t', (key: string) => key);

// Helper functions
function getStopName(stopId: string) {
  const stop = busDb.stopList[stopId];
  return stop?.name?.[language] || stopId;
}

function getStopFare(stopId: string, idx: number) {
  const fares = props.routeListEntry?.fares;
  if (!fares || !fares[idx]) return '';
  return `$${fares[idx]}`;
}

function formatEta(eta: any) {
  if (!eta || !eta.eta) return '';
  
  const waitTime = Math.round(
    (new Date(eta.eta).getTime() - new Date().getTime()) / 60 / 1000
  );
  
  if (!Number.isInteger(waitTime) || waitTime < 0) {
    return eta.remark?.[language] || '';
  }
  
  if (waitTime === 0) {
    return t('即將抵達');
  }
  
  return `${waitTime} ${t('分鐘')}`;
}

// Methods
function setAccordionRef(idx: number, el: any) {
  accordionRefs.value[idx] = el;
}

function handleChange(idx: number, expanded: boolean) {
  emit('change', idx, expanded);
  if (expanded) {
    fetchEta(props.routeId, props.stopIds[idx]);
  }
}

function onStopInfo(stopId: string) {
  emit('stop-info', stopId);
}

// Simulate ETA fetching
function fetchEta(routeId: string, stopId: string) {
  loadingEta.value = true;
  
  // Mock fetching ETAs with a timeout
  setTimeout(() => {
    // Generate random ETA data for demonstration
    const now = new Date();
    etaTimes.value = [
      { 
        eta: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
        remark: { zh: '正常班次', en: 'Normal Service' }
      },
      {
        eta: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
        remark: { zh: '正常班次', en: 'Normal Service' }
      }
    ];
    loadingEta.value = false;
  }, 800);
}

watch(() => props.stopIdx, async (newIdx) => {
  await nextTick();
  const el = accordionRefs.value[newIdx];
  if (el && el.scrollIntoView) {
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }
  
  // Fetch ETA when stop index changes
  fetchEta(props.routeId, props.stopIds[newIdx]);
});
</script>

<style scoped>
.stop-accordion-list {
  overflow-y: auto;
  flex: 1;
}

.stop-accordion {
  margin: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.stop-accordion.active {
  background-color: rgba(0, 0, 0, 0.03);
}

.stop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
}

.stop-info {
  flex: 1;
}

.stop-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.stop-fare {
  font-size: 0.85rem;
  color: #666;
}

.stop-actions {
  display: flex;
}

.info-button {
  background: transparent;
  border: none;
  color: #1976d2;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 0.9rem;
}

.stop-details {
  padding: 0 16px 16px;
  animation: fadeIn 0.3s ease;
}

.eta-container {
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.eta-loading {
  text-align: center;
  padding: 12px;
  color: #666;
}

.eta-times {
  display: flex;
  flex-direction: column;
}

.eta-time {
  padding: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.eta-time:last-child {
  border-bottom: none;
}

.no-eta {
  padding: 12px;
  text-align: center;
  color: #666;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
