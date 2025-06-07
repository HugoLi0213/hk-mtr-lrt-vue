<template>
  <div class="app-container">
    <MtrTrain v-if="currentPage === 'mtr'" />
    <LightRail v-else-if="currentPage === 'lrt'" />
    <MtrTrain v-else />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from './composables/useTheme'
import LightRail from './pages/LightRail/LightRail.vue'
import MtrTrain from './pages/MtrTrain/MtrTrain.vue'

// Initialize theme
useTheme()

const currentPage = ref('mtr')

// Simple routing based on hash
const handleHashChange = () => {
  const hash = window.location.hash
  if (hash === '#/light-rail') {
    currentPage.value = 'lrt'
  } else {
    currentPage.value = 'mtr'
  }
}

// Listen for navigation events
const handleNavigateToLrt = () => {
  currentPage.value = 'lrt'
  window.location.hash = '#/light-rail'
}

const handleNavigateToMtr = () => {
  currentPage.value = 'mtr'
  window.location.hash = '#/'
}

onMounted(() => {
  // Initial route check
  handleHashChange()
  
  // Listen for hash changes
  window.addEventListener('hashchange', handleHashChange)
  
  // Listen for custom navigation events
  window.addEventListener('navigate-to-lrt', handleNavigateToLrt)
  window.addEventListener('navigate-to-mtr', handleNavigateToMtr)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', handleHashChange)
  window.removeEventListener('navigate-to-lrt', handleNavigateToLrt)
  window.removeEventListener('navigate-to-mtr', handleNavigateToMtr)
})
</script>

<style>
/* CSS Custom Properties for theming */
:root {
  /* Default font sizes - much smaller and more reasonable */
  --font-size-base: 16px;
  --font-size-table: 16px;
  --font-size-title: 20px;
  --font-size-eta-dest: 14px;
  
  /* Default light theme colors */
  --color-primary: #667eea;
  --color-primary-container: #e6f3ff;
  --color-on-primary: #fff;
  --color-surface: #fff;
  --color-surface-variant: #f5f5f7;
  --color-background: #f5f5f7;
  --color-text: #18181b;
  --color-text-secondary: #71717a;
  --color-textSecondary: #71717a;
  --color-border: #e4e4e7;
  --color-cardBorder: #e4e4e7;
  --color-tableHeader: #f8f9fa;
  --color-stationName: #e4e4e7;
  --color-success: #22c55e;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--color-background);
  transition: background-color 0.3s, color 0.3s;
}

* {
  box-sizing: border-box;
}

/* Scrollbar styling for dark mode */
[data-theme="dark"] ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

[data-theme="dark"] ::-webkit-scrollbar-track {
  background: #1a1a1a;
}

[data-theme="dark"] ::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

[data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Focus styles */
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* App container */
.app-container {
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  background: var(--color-background);
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

/* Smooth transitions for theme changes */
*,
*::before,
*::after {
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}
</style>
