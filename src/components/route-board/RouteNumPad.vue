<template>
  <div class="num-pad-grid">
    <KeyButton
      v-for="k in numPadKeys"
      :key="`input-${k}`"
      :k="k"
      :disabled="isKeyDisabled(k)"
      class="number-key"
      @click="handleKeyClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { getSearchValue } from '../../utils/index';
import KeyButton from './KeyButton.vue';

// Props
const props = defineProps<{
  possibleChar: string[]
}>()

// Injected dependencies
const numPadOrder = inject<string>('numPadOrder', '123456789b0c')
const searchRoute = inject<string>('searchRoute', '')
const updateSearchRouteByButton = inject<Function>('updateSearchRouteByButton', () => {})

// Compute numpad keys from order string
const numPadKeys = computed(() => {
  return numPadOrder.split('')
})

// Check if a key should be disabled
const isKeyDisabled = (k: string) => {
  const searchValue = getSearchValue(searchRoute);
  if (k === 'b' && searchValue === '') return true
  if (k === 'c' && searchValue === '') return true
  if (!'bc'.includes(k) && !props.possibleChar.includes(k)) return true
  return false
}

// Handle key click
const handleKeyClick = (k: string) => {
  updateSearchRouteByButton(k)
}
</script>

<style scoped>
.num-pad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}

.number-key {
  height: 62px;
}
</style>
