<template>
  <button class="star-button" @click="handleStarClick">
    <span v-if="isStarred" class="star-icon filled">★</span>
    <span v-else class="star-icon outlined">☆</span>
  </button>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';

// Props
const props = defineProps<{
  routeId: string;
}>();

// Injected dependencies
const savedEtas = inject<string[]>('savedEtas', []);
const addSavedEta = inject<(routeId: string) => void>('addSavedEta', () => {});
const removeSavedEta = inject<(routeId: string) => void>('removeSavedEta', () => {});

// Computed properties
const isStarred = computed(() => {
  return savedEtas.includes(props.routeId);
});

// Methods
function handleStarClick() {
  const targetRouteId = props.routeId.toUpperCase();
  if (isStarred.value) {
    removeSavedEta(targetRouteId);
  } else {
    addSavedEta(targetRouteId);
  }
}
</script>

<style scoped>
.star-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: inherit;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 50%;
}

.star-button:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.star-icon {
  font-size: 24px;
}

.star-icon.filled {
  color: #f9a825; /* Golden yellow for filled star */
}

.star-icon.outlined {
  color: inherit;
}
</style>
