<template>
  <div class="route-board">
    <div class="route-list-container">
      <BoardTabbar 
        :board-tab="boardTab" 
        @change-tab="handleTabChange" 
      />
      <SwipeableRoutesBoard 
        :board-tab="boardTab" 
        @change-tab="handleTabChange" 
      />
    </div>
    <RouteInputPad :board-tab="boardTab" />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import BoardTabbar from './route-board/BoardTabbar.vue'
import RouteInputPad from './route-board/RouteInputPad.vue'
import SwipeableRoutesBoard from './route-board/SwipeableRoutesBoard.vue'

// Define local interfaces
interface BoardTabType {
  recent: 'recent'
  all: 'all'
  bus: 'bus'
  minibus: 'minibus'
  lightRail: 'lightRail'
  mtr: 'mtr'
  ferry: 'ferry'
}

type BoardTab = 'recent' | 'all' | 'bus' | 'minibus' | 'lightRail' | 'mtr' | 'ferry'

// Props
const props = defineProps<{
  goEta?: (routeId: string) => void
  goSearch?: () => void
}>()

// Injected dependencies
const busDb = inject<any>('busDb', { AppTitle: 'HK Bus ETA' })
const t = inject<(key: string) => string>('t', (key: string) => key)
const language = inject<string>('language', 'zh')
const isRecentSearchShown = inject<boolean>('isRecentSearchShown', true)

// Local reactive data
const boardTab = ref<BoardTab>('all')

// Utility function to check if value is valid board tab
const isBoardTab = (input: unknown, isRecentSearchShown: boolean): input is BoardTab => {
  return (
    (isRecentSearchShown && input === 'recent') ||
    input === 'all' ||
    input === 'bus' ||
    input === 'minibus' ||
    input === 'lightRail' ||
    input === 'mtr' ||
    input === 'ferry'
  )
}

// Mock setSeoHeader function
const setSeoHeader = (options: any) => {
  if (typeof document !== 'undefined') {
    document.title = options.title
    // Additional SEO operations would go here
  }
}

// Event handlers
const handleTabChange = (tab: BoardTab) => {
  boardTab.value = tab
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('boardTab', tab)
  }
}

// Lifecycle
onMounted(() => {
  // Set SEO header
  setSeoHeader({
    title: t('搜尋') + ' - ' + t(busDb.AppTitle || 'HK Bus ETA'),
    description: t('route-board-page-description'),
    lang: language,
  })

  // Initialize board tab from localStorage
  if (typeof localStorage !== 'undefined') {
    const savedTab = localStorage.getItem('boardTab')
    if (isBoardTab(savedTab, isRecentSearchShown)) {
      boardTab.value = savedTab
    }
  }
})

// Silence the unused props warning
console.log('RouteBoard props:', props)
</script>

<style scoped>
.route-board {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.route-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
