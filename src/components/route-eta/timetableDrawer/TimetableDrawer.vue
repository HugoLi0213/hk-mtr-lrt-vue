<template>
  <div v-if="open" class="timetable-drawer">
    <div class="drawer-header">
      <h2>{{ t('時間表') }} - {{ routeId }}</h2>
      <button class="close-button" @click="onClose">×</button>
    </div>
    <div class="drawer-content">
      <!-- Timetable content would go here -->
      <p>{{ t('時間表功能開發中') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

// Props
const props = defineProps<{
  routeId: string;
  open: boolean;
}>();

// Emits
const emit = defineEmits(['close']);

// Injected dependencies
const t = inject<(key: string) => string>('t', (key: string) => key);

// Methods
function onClose() {
  emit('close');
}
</script>

<style scoped>
.timetable-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 300px;
  background-color: white;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.drawer-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
</style>
