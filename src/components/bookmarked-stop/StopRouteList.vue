<template>
  <div class="stop-route-list">
    <div v-if="loading" class="loading-container">
      <div class="circular-progress"></div>
    </div>
    <div v-else-if="stopEtas && stopEtas.length > 0" class="eta-list">
      <div v-for="(etaItem, index) in stopEtas" :key="index" class="eta-item">
        <div class="route-info" @click="navigateToRoute(etaItem[0])">
          <div class="route-header">
            <div class="route-no-container">
              <div class="route-no">{{ getRouteNo(etaItem[0]) }}</div>
              <div class="company">{{ getCompany(etaItem[0]) }}</div>
            </div>
            <div class="route-dest">
              <div class="to-label">{{ t('往') }}</div>
              <div class="dest-name">{{ getDestination(etaItem[0]) }}</div>
            </div>
          </div>
          <div class="stop-name">{{ getStopName(etaItem[0]) }}</div>
        </div>
        <div class="eta-times">
          <template v-if="etaItem[1] && etaItem[1].length > 0">
            <span v-for="(eta, etaIndex) in etaItem[1].slice(0, 2)" :key="etaIndex" class="eta-time">
              {{ formatEta(eta) }}
            </span>
          </template>
          <span v-else class="no-eta">{{ t('沒有班次') }}</span>
        </div>
      </div>
    </div>
    <div v-else class="no-routes">
      {{ t('No routes available') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';

// Props
const props = defineProps<{
  stops: Array<[string, string]>; // [company, stopId]
  'is-focus'?: boolean;
}>();

// For easier internal reference
const isFocus = computed(() => props['is-focus'] ?? false);

// Injected dependencies
const t = inject<(key: string) => string>('t', (key: string) => key);
const language = inject<string>('language', 'zh');
const busDb = inject<any>('busDb', { routeList: {}, stopList: {} });
const navigate = inject<(path: string) => void>('navigate', (path: string) => {
  // Fallback navigation if router is not provided
  console.log('Navigation not implemented, would navigate to:', path);
});

// State
const loading = ref(true);
const stopEtas = ref<Array<[string, any[]]>>([]);

// Methods
const fetchStopEtas = async () => {
  if (!props.stops || props.stops.length === 0 || !isFocus.value) {
    loading.value = false;
    return;
  }
  
  loading.value = true;
  
  try {
    // In a real implementation, this would fetch ETAs from the API
    // For now, we'll simulate the data with a timeout
    setTimeout(() => {
      // Mock data - this would be replaced with actual API calls
      const mockEtas: Array<[string, any[]]> = props.stops.map(([company, stopId]) => {
        const routeId = `${company}-${stopId}`;
        return [
          routeId,
          [
            { eta: new Date(Date.now() + 5 * 60 * 1000).toISOString(), remark: { zh: '正常班次', en: 'Normal Service' } },
            { eta: new Date(Date.now() + 15 * 60 * 1000).toISOString(), remark: { zh: '正常班次', en: 'Normal Service' } }
          ]
        ];
      });
      
      stopEtas.value = mockEtas;
      loading.value = false;
    }, 1000);
  } catch (error) {
    console.error('Error fetching ETAs:', error);
    loading.value = false;
  }
};

// Computed properties and utilities
const getRouteNo = (routeId: string) => {
  const [routeKey] = routeId.split('-');
  const routeInfo = busDb.routeList[routeKey];
  return routeInfo?.route || routeKey;
};

const getCompany = (routeId: string) => {
  const [routeKey] = routeId.split('-');
  const routeInfo = busDb.routeList[routeKey];
  return routeInfo?.co ? routeInfo.co.map((c: string) => t(c)).join('+') : '';
};

const getDestination = (routeId: string) => {
  const [routeKey] = routeId.split('-');
  const routeInfo = busDb.routeList[routeKey];
  return routeInfo?.dest?.[language] || '';
};

const getStopName = (routeId: string) => {
  const [_, stopId] = routeId.split('-');
  const stopInfo = busDb.stopList[stopId];
  return stopInfo?.name?.[language] || stopId;
};

const formatEta = (eta: any) => {
  if (!eta || !eta.eta) return '';
  
  const waitTime = Math.round(
    (new Date(eta.eta).getTime() - new Date().getTime()) / 60 / 1000
  );
  
  if (!Number.isInteger(waitTime) || waitTime < 0) {
    return eta.remark[language] || '';
  }
  
  if (waitTime === 0) {
    return t('即將抵達');
  }
  
  return `${waitTime} ${t('分鐘')}`;
};

const navigateToRoute = (routeId: string) => {
  if (!routeId) return;
  
  // Mock vibration effect
  // In real app, would call actual vibration API
  console.log('Vibrate effect');
  
  // Navigate to route
  navigate(`/${language}/route/${routeId.toLowerCase()}`);
};

// Lifecycle hooks
watch(() => isFocus.value, (newVal) => {
  if (newVal) {
    fetchStopEtas();
  }
}, { immediate: true });

watch(() => props.stops, () => {
  if (isFocus.value) {
    fetchStopEtas();
  }
}, { deep: true });

onMounted(() => {
  if (isFocus.value) {
    fetchStopEtas();
  }
});

</script>

<style scoped>
.stop-route-list {
  width: 100%;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 0;
}

.circular-progress {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.eta-list {
  width: 100%;
}

.eta-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  cursor: pointer;
}

.route-info {
  overflow: hidden;
}

.route-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 4px;
}

.route-no-container {
  display: flex;
  flex-direction: column;
  min-width: 45px;
}

.route-no {
  font-weight: 600;
  font-size: 1.1rem;
}

.company {
  font-size: 0.7rem;
  color: var(--color-text-secondary, #666);
}

.route-dest {
  display: flex;
  align-items: baseline;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.to-label {
  font-size: 0.85rem;
  margin-right: 4px;
}

.dest-name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stop-name {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eta-times {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  min-width: 75px;
  text-align: right;
}

.eta-time {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-primary, #1976d2);
  margin-bottom: 2px;
}

.eta-time:first-child {
  font-size: 1rem;
  font-weight: 600;
}

.no-eta {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
}

.no-routes {
  padding: 24px 16px;
  text-align: center;
  color: var(--color-text-secondary, #666);
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .circular-progress {
    border-color: #333;
    border-top-color: #65b5f6;
  }
  
  .eta-item {
    border-bottom-color: var(--color-border-dark, #424242);
  }
  
  .company, .stop-name, .no-eta {
    color: var(--color-text-secondary-dark, #aaa);
  }
  
  .eta-time {
    color: var(--color-primary-dark, #64b5f6);
  }
  
  .no-routes {
    color: var(--color-text-secondary-dark, #aaa);
  }
}
</style>
