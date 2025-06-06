<template>
  <button
    class="key-button"
    :class="{ disabled }"
    :disabled="disabled"
    @click="$emit('click', k)"
  >
    <BackspaceIcon v-if="k === 'b'" />
    <ClearIcon v-else-if="k === 'c'" />
    <span v-else>{{ k }}</span>
  </button>
</template>

<script setup lang="ts">
import BackspaceIcon from '../icons/BackspaceIcon.vue';
import ClearIcon from '../icons/ClearIcon.vue';

// Props
const props = defineProps<{
  k: string
  disabled?: boolean
}>()

// Emits
defineEmits<{
  click: [k: string]
}>()
</script>

<style scoped>
.key-button {
  background: var(--color-background-paper, #f5f5f5);
  color: var(--color-text-primary, #000);
  width: 100%;
  font-size: 1.8em;
  border-radius: 0;
  border: 1px solid var(--color-border, #e0e0e0);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.key-button:not(.disabled):hover {
  background: var(--color-background-paper-hover, #eeeeee);
}

.key-button:not(.disabled):active {
  background: var(--color-background-paper-active, #e0e0e0);
}

.key-button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .key-button {
    background: var(--color-background-paper-dark, #424242);
    color: var(--color-text-primary-dark, #fff);
    border-color: var(--color-border-dark, #666);
  }

  .key-button:not(.disabled):hover {
    background: var(--color-background-paper-hover-dark, #515151);
  }

  .key-button:not(.disabled):active {
    background: var(--color-background-paper-active-dark, #616161);
  }
}
</style>
