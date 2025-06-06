<template>
  <div v-if="!isPrerendering" class="route-input-pad">
    <div class="num-pad-container">
      <RouteNumPad :possible-char="possibleChar" />
    </div>
    <div class="alphabet-pad-container">
      <RouteAlphabetPad :possible-char="possibleChar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { getSearchValue } from '../../utils/index'
import RouteAlphabetPad from './RouteAlphabetPad.vue'
import RouteNumPad from './RouteNumPad.vue'

type BoardTab = 'recent' | 'all' | 'bus' | 'minibus' | 'lightRail' | 'mtr' | 'ferry'

interface RouteListEntry {
  route: string
  bound: string
  service_type: string
  stops: Record<string, string[]>
  co: string[]
  orig: { zh: string; en: string }
  dest: { zh: string; en: string }
}

// Props
const props = defineProps<{
  boardTab: BoardTab
}>()

// Injected dependencies
const busDb = inject<any>('busDb', { routeList: {} })
const searchRoute = inject<string>('searchRoute', '')
const isPrerendering = inject<boolean>('isPrerendering', false)
const transportSearchOptions = inject<any>('transportSearchOptions', {})

// Compute possible characters based on current search and board tab
const possibleChar = computed(() => {
  const searchValue = getSearchValue(searchRoute);
  return getPossibleChar(searchValue, busDb.routeList, props.boardTab, transportSearchOptions)
})

// Utility function to get possible next characters
const getPossibleChar = (
  searchRouteValue: string,
  routeList: Record<string, RouteListEntry>,
  boardTab: BoardTab,
  transportSearchOptions: any
) => {
  if (routeList == null) return []
  
  const possibleChar: Record<string, number> = {}
  const searchOptions = transportSearchOptions[boardTab] || []
  const searchUpper = searchRouteValue.toUpperCase()
  
  Object.entries(routeList).forEach(([routeNo, meta]) => {
    if (
      routeNo.startsWith(searchUpper) &&
      meta.co.some((c: string) => searchOptions.includes(c))
    ) {
      const nextChar = routeNo.slice(searchRouteValue.length, searchRouteValue.length + 1)
      if (nextChar) {
        possibleChar[nextChar] = isNaN(possibleChar[nextChar]) ? 1 : possibleChar[nextChar] + 1
      }
    }
  })
  
  return Object.entries(possibleChar)
    .map((k) => k[0])
    .filter((k) => k !== "-")
}
</script>

<style scoped>
.route-input-pad {
  z-index: 0;
  background: var(--color-background-default, #fff);
  display: flex;
  flex-direction: row;
  height: 248px;
  justify-content: space-around;
}

.num-pad-container {
  width: 62%;
}

.alphabet-pad-container {
  width: 35%;
  height: 246px;
  overflow-x: hidden;
  overflow-y: scroll;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .route-input-pad {
    background: var(--color-background-default-dark, #121212);
  }
}
</style>
