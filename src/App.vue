<template>
  <MtrTrain />
</template>

<script setup lang="ts">
import MtrTrain from './pages/MtrTrain/MtrTrain.vue';
</script>

<style>
/* CSS Custom Properties for theming */
:root {
  /* Default font sizes */
  --font-size-base: 16px;
  --font-size-table: 32px;
  --font-size-title: 48px;
  --font-size-eta-dest: 24px;
  
  /* Default light theme colors */
  --color-primary: #444;
  --color-background: #fedb00;
  --color-surface: #fff;
  --color-text: #000;
  --color-textSecondary: #666;
  --color-border: #ddd;
  --color-cardBorder: #e0e0e0;
  --color-tableHeader: #f0f0f0;
  --color-stationName: #e0e0e0;
  --color-success: #32b8c6;
  --color-error: #ff5459;
  --color-warning: #e68161;
  --color-info: #a7a9a9;
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

/* Smooth transitions for theme changes */
*,
*::before,
*::after {
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}
</style>
