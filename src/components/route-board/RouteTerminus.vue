<template>
  <div class="route-terminus">
    <div class="from-to-wrapper">
      <span>{{ t('往') }} </span>
      <h3 class="destination">
        {{ toProperCase(terminus.dest[language]) }}
      </h3>
    </div>
    <div class="from-wrapper">
      <div class="origin">
        {{ toProperCase(terminus.orig[language]) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

interface RouteListEntry {
  route: string
  bound: string
  service_type: string
  stops: Record<string, string[]>
  co: string[]
  orig: { zh: string; en: string }
  dest: { zh: string; en: string }
}

// Props
const props = defineProps<{
  terminus: RouteListEntry
}>()

// Injected dependencies
const t = inject<(key: string) => string>('t', (key: string) => key)
const language = inject<string>('language', 'zh')

// Mock toProperCase function (you would implement this utility)
const toProperCase = (text: string) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
</script>

<style scoped>
.route-terminus {
  text-align: left;
}

.from-to-wrapper {
  display: flex;
  align-items: baseline;
  white-space: nowrap;
  overflow-x: hidden;
}

.from-to-wrapper > span {
  font-size: 0.95em;
  margin-right: 4px;
}

.from-wrapper {
  display: flex;
  align-items: baseline;
  white-space: nowrap;
  overflow-x: hidden;
}

.destination {
  font-weight: 700;
  font-size: 1.25rem;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.origin {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #666);
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .origin {
    color: var(--color-text-secondary-dark, #aaa);
  }
}
</style>
