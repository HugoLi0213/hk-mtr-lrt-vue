<template>
  <div class="alphabet-pad-grid">
    <KeyButton
      v-for="k in alphabetKeys"
      :key="`input-${k}`"
      :k="k"
      class="alphabet-key"
      @click="handleKeyClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import KeyButton from './KeyButton.vue';

// Props
const props = defineProps<{
  possibleChar: string[]
}>()

// Injected dependencies
const updateSearchRouteByButton = inject<Function>('updateSearchRouteByButton', () => {})

// Compute alphabet keys (non-numeric characters only)
const alphabetKeys = computed(() => {
  return props.possibleChar.filter((k) => isNaN(parseInt(k, 10)))
})

// Handle key click
const handleKeyClick = (k: string) => {
  updateSearchRouteByButton(k)
}
</script>

<style scoped>
.alphabet-pad-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.alphabet-key {
  height: 52px;
}
</style>
