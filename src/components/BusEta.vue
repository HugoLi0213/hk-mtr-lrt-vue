<template>
  <div class="bus-eta-tab">
    <component :is="currentComponent" v-bind="currentProps" />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import RouteBoard from './RouteBoard.vue';
import RouteEta from './RouteEta.vue';
import RouteSearch from './RouteSearch.vue';

// Simple state for navigation (simulate hkbus.app router)
const page = ref<'board' | 'eta' | 'search'>('board');
const routeEtaProps = ref<any>({});
const routeSearchProps = ref<any>({});
const searchRoute = ref<string>('');
const routeSearchHistory = ref<string[]>([]);

// Navigation handlers (simulate tab/page switch)
function goBoard() {
  page.value = 'board';
}

function goEta(routeId: string) {
  routeEtaProps.value = { routeId };
  page.value = 'eta';
}

function goSearch(props: any) {
  routeSearchProps.value = props;
  page.value = 'search';
}

// Search route handling
function updateSearchRoute(route: string) {
  searchRoute.value = route;
}

function updateSearchRouteByButton(key: string) {
  if (key === 'c') {
    // Clear the search
    searchRoute.value = '';
  } else if (key === 'b') {
    // Backspace - remove last character
    searchRoute.value = searchRoute.value.slice(0, -1);
  } else {
    // Add the character to search
    searchRoute.value += key;
  }
}

function addSearchHistory(route: string) {
  if (!routeSearchHistory.value.includes(route)) {
    routeSearchHistory.value = [route, ...routeSearchHistory.value].slice(0, 20);
  }
}

function removeSearchHistoryByRouteId(routeId: string) {
  routeSearchHistory.value = routeSearchHistory.value.filter(r => r !== routeId);
}

// Transport search options for different board tabs
const transportSearchOptions = {
  recent: ['kmb', 'ctb', 'lrtfeeder', 'nlb', 'gmb', 'lightRail', 'mtr'],
  all: ['kmb', 'ctb', 'lrtfeeder', 'nlb', 'gmb', 'lightRail', 'mtr', 'sunferry', 'fortuneferry', 'hkkf'],
  bus: ['kmb', 'ctb', 'lrtfeeder', 'nlb'],
  minibus: ['gmb'],
  lightRail: ['lightRail'],
  mtr: ['mtr'],
  ferry: ['sunferry', 'fortuneferry', 'hkkf']
};

// Default numpad order for route input
const numPadOrder = '123456789b0c';

// Provide values for child components
provide('searchRoute', searchRoute); // This provides a ref object
provide('routeSearchHistory', routeSearchHistory);
provide('addSearchHistory', addSearchHistory);
provide('removeSearchHistoryByRouteId', removeSearchHistoryByRouteId);
provide('goEta', goEta);
provide('goSearch', goSearch);
provide('goBoard', goBoard);
provide('updateSearchRoute', updateSearchRoute);
provide('updateSearchRouteByButton', updateSearchRouteByButton);
provide('transportSearchOptions', transportSearchOptions);
provide('numPadOrder', numPadOrder);

// General navigation function for components that need URL-like navigation
provide('navigate', (path: string) => {
  // Parse the path and navigate accordingly
  // Expecting paths like: /zh/route/kmb-1234
  const parts = path.split('/');
  if (parts.length >= 3 && parts[2] === 'route' && parts.length >= 4) {
    // This is a route ETA path, navigate to the ETA page
    goEta(parts[3]);
  } else {
    // Default to board if path is unknown
    goBoard();
  }
});

const currentComponent = computed(() => {
  if (page.value === 'eta') return RouteEta;
  if (page.value === 'search') return RouteSearch;
  return RouteBoard;
});

const currentProps = computed(() => {
  if (page.value === 'eta') return { ...routeEtaProps.value, goBoard, goSearch };
  if (page.value === 'search') return { ...routeSearchProps.value, goBoard, goEta };
  return {
    // Optionally pass navigation handlers to RouteBoard
    goEta,
    goSearch,
    goBoard,
  };
});
</script>

<style scoped>
.bus-eta-tab {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 60vh;
  width: 100%;
  background: var(--color-background);
}
</style>
