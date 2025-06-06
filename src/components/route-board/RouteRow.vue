<template>
  <div class="route-card">
    <div class="route-card-content" @click="$emit('click', $event)">
      <div class="route-content">
        <RouteNoCompany :route="route" />
        <RouteTerminus :terminus="route[1]" />
      </div>
    </div>
    <button 
      v-if="showRemove"
      class="remove-button"
      @click.prevent="$emit('remove', $event)"
    >
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
import RouteNoCompany from './RouteNoCompany.vue'
import RouteTerminus from './RouteTerminus.vue'

interface RouteListEntry {
  route: string
  bound: string
  service_type: string
  stops: Record<string, string[]>
  co: string[]
  orig: { zh: string; en: string }
  dest: { zh: string; en: string }
  freq?: any
}

// Props
defineProps<{
  route: [string, RouteListEntry]
  showRemove?: boolean
}>()

// Emits
defineEmits<{
  click: [event: Event]
  remove: [event: Event]
}>()
</script>

<style scoped>
.route-card {
  border: none;
  display: flex;
  align-items: center;
  height: 100%;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  background: var(--color-background-default, #fff);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.route-card:hover {
  background: var(--color-background-hover, rgba(0, 0, 0, 0.04));
}

.route-card-content {
  flex: 1;
}

.route-content {
  display: grid;
  grid-template-columns: 25% 65%;
  padding: 4px 16px;
  align-items: center;
}

.remove-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary, #666);
  transition: color 0.2s ease;
}

.remove-button:hover {
  color: var(--color-text-primary, #000);
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .route-card {
    border-bottom-color: var(--color-border-dark, #424242);
    background: var(--color-background-default-dark, #121212);
  }

  .route-card:hover {
    background: var(--color-background-hover-dark, rgba(255, 255, 255, 0.08));
  }

  .remove-button {
    color: var(--color-text-secondary-dark, #aaa);
  }

  .remove-button:hover {
    color: var(--color-text-primary-dark, #fff);
  }
}
</style>
