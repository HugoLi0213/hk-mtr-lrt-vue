<template>
  <div class="board-tabbar">
    <div class="tabs-container">
      <button
        v-for="tab in availableTabs"
        :key="tab"
        :class="['tab', { active: boardTab === tab }]"
        @click="$emit('changeTab', tab)"
      >
        {{ t(tab) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';

type BoardTab = 'recent' | 'all' | 'bus' | 'minibus' | 'lightRail' | 'mtr' | 'ferry'

// Props
const props = defineProps<{
  boardTab: BoardTab
}>()

// Emits
defineEmits<{
  changeTab: [tab: BoardTab]
}>()

// Injected dependencies
const t = inject<(key: string) => string>('t', (key: string) => key)
const isRecentSearchShown = inject<boolean>('isRecentSearchShown', true)

// Transport search options mapping
const TRANSPORT_SEARCH_OPTIONS = {
  recent: ['kmb', 'ctb', 'lrtfeeder', 'nlb', 'gmb', 'lightRail', 'mtr'],
  all: ['kmb', 'ctb', 'lrtfeeder', 'nlb', 'gmb', 'lightRail', 'mtr', 'sunferry', 'fortuneferry', 'hkkf'],
  bus: ['kmb', 'ctb', 'lrtfeeder', 'nlb'],
  minibus: ['gmb'],
  lightRail: ['lightRail'],
  mtr: ['mtr'],
  ferry: ['sunferry', 'fortuneferry', 'hkkf']
}

// Computed
const availableTabs = computed(() => {
  return Object.keys(TRANSPORT_SEARCH_OPTIONS).filter(
    (option) => isRecentSearchShown || option !== 'recent'
  ) as BoardTab[]
})
</script>

<style scoped>
.board-tabbar {
  background: var(--color-background, white);
  border-bottom: 1px solid #e0e0e0;
}

.tabs-container {
  display: flex;
  overflow-x: auto;
  padding: 0;
  margin: 0;
}

.tab {
  background: none;
  border: none;
  padding: 8px 16px;
  min-width: 85px;
  min-height: 32px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #666);
  text-transform: none;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab:hover {
  background: var(--color-hover, rgba(0, 0, 0, 0.04));
}

.tab.active {
  color: var(--color-primary, #1976d2);
  border-bottom-color: var(--color-primary, #1976d2);
  font-weight: 500;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .board-tabbar {
    background: var(--color-background-dark, #121212);
    border-bottom-color: #333;
  }
  
  .tab {
    color: var(--color-text-secondary-dark, #aaa);
  }
  
  .tab:hover {
    background: var(--color-hover-dark, rgba(255, 255, 255, 0.08));
  }
  
  .tab.active {
    color: var(--color-primary-dark, #64b5f6);
    border-bottom-color: var(--color-primary-dark, #64b5f6);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .tab {
    min-width: 70px;
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>
