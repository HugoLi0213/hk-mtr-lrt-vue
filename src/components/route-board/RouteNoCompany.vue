<template>
  <div class="route-no-company">
    <RouteNo
      :route-no="translatedRouteNo"
      :font-size="route[1].co[0] === 'mtr' ? '1.2rem' : undefined"
    />
    <span v-if="isSpecialTrip" class="special-trip">
      {{ t('特別班') }}
    </span>
    <div class="company">
      {{ companyNames }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import RouteNo from './RouteNo.vue'

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
  route: [string, RouteListEntry]
}>()

// Injected dependencies
const t = inject<(key: string) => string>('t', (key: string) => key)
const language = inject<string>('language', 'zh')

// Computed properties
const routeNo = computed(() => props.route[0].split('-').slice(0, 1)[0])
const serviceType = computed(() => props.route[0].split('-').slice(1, 2)[0] || '1')

const translatedRouteNo = computed(() => {
  return language === 'zh' ? t(routeNo.value) : routeNo.value
})

const isSpecialTrip = computed(() => {
  return parseInt(serviceType.value, 10) >= 2
})

const companyNames = computed(() => {
  return Object.keys(props.route[1].stops)
    .map((co) => t(co))
    .join('+')
})
</script>

<style scoped>
.route-no-company {
  overflow: hidden;
}

.special-trip {
  font-size: 0.6rem;
  margin-left: 8px;
}

.company {
  color: var(--color-text-secondary, #666);
  font-size: 0.75rem;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .company {
    color: var(--color-text-secondary-dark, #aaa);
  }
}
</style>
