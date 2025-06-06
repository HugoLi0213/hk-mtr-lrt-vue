<template>
  <div class="timetable-button-container">
    <div class="button-divider"></div>
    <button class="timetable-button" @click="isOpen = true">
      <span class="button-icon">
        <svg viewBox="0 0 24 24" class="schedule-icon">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
          <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path>
        </svg>
      </span>
      <span class="button-text">{{ t('車程') }}</span>
    </button>
    <TimetableDrawer
      v-if="isOpen"
      :route-id="routeId"
      :open="isOpen"
      @close="isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import TimetableDrawer from './timetableDrawer/TimetableDrawer.vue';

// Props
const props = defineProps<{
  routeId: string;
}>();

// Injected dependencies
const t = inject<(key: string) => string>('t', (key: string) => key);

// State
const isOpen = ref(false);
</script>

<style scoped>
.timetable-button-container {
  position: relative;
}

.button-divider {
  position: absolute;
  top: 0;
  right: calc(64px + 2%);
  width: 1px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.12);
}

.timetable-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: inherit;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 0.8rem;
}

.button-icon {
  display: block;
  margin-bottom: 2px;
}

.schedule-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.button-text {
  font-size: 0.75rem;
}
</style>
