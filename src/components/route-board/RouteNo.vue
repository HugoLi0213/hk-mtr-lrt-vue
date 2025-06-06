<template>
  <component 
    :is="component || 'h2'" 
    :class="['route-no', alignClass]"
    :style="routeNoStyle"
  >
    <span class="prefix">{{ prefix }}</span>
    <span class="suffix">{{ suffix }}</span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Props
const props = defineProps<{
  routeNo: string
  component?: string
  align?: 'right' | 'left' | 'inherit' | 'center' | 'justify'
  fontSize?: string
}>()

// Compute route number parts
const routeParts = computed(() => {
  const routeNo = props.routeNo
  // Suffix Examples: 962X=> X, 44A1 => A1, 25MS => MS, AEL => "", NA29 => ""
  let splitIdx = routeNo.length
  
  for (let i = 1; i < routeNo.length; ++i) {
    if (
      '0' <= routeNo[i - 1] &&
      routeNo[i - 1] <= '9' &&
      'A' <= routeNo[i] &&
      routeNo[i] <= 'Z'
    ) {
      splitIdx = i
      break
    }
  }
  
  return {
    prefix: routeNo.slice(0, splitIdx),
    suffix: routeNo.slice(splitIdx)
  }
})

const prefix = computed(() => routeParts.value.prefix)
const suffix = computed(() => routeParts.value.suffix)

const alignClass = computed(() => {
  if (props.align) {
    return `text-${props.align}`
  }
  return ''
})

const routeNoStyle = computed(() => {
  const fontSize = props.fontSize
  return {
    '--prefix-font-size': fontSize || '1.5rem',
    '--suffix-font-size': '1.2rem'
  }
})
</script>

<style scoped>
.route-no {
  line-height: normal;
  display: inline;
  white-space: nowrap;
  color: var(--color-text-primary, #000);
}

.prefix {
  font-size: var(--prefix-font-size, 1.5rem);
  font-family: 'Oswald', sans-serif;
}

.suffix {
  font-size: var(--suffix-font-size, 1.2rem);
  font-family: 'Oswald', sans-serif;
}

/* Text alignment classes */
.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.text-justify {
  text-align: justify;
}

.text-inherit {
  text-align: inherit;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .route-no {
    color: var(--color-text-primary-dark, #fff);
  }
}
</style>
