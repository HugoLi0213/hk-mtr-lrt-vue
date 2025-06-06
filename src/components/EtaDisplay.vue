<template>
  <div class="eta-display" :class="[urgencyClass, sizeClass, { mobile: mobile }]" v-if="eta">
    <div class="eta-time">{{ displayTime }}</div>
    <div class="eta-info" v-if="eta.route || eta.dest">
      <span v-if="eta.route" class="route-number">{{ eta.route }}</span>
      <span class="destination">({{ getDestName(eta.dest) }})</span>
      <span v-if="isLRT && eta.train_length === 2" class="train-length">🚋🚋</span>
      <span v-else-if="isLRT" class="train-length">🚋</span>
    </div>
    <div class="urgency-indicator" :class="urgencyClass"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { TrainArrival } from '../types/train'

interface Props {
  eta: TrainArrival | null
  isLRT?: boolean
  getDestName: (dest?: string) => string
  size?: 'normal' | 'small'
  mobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLRT: false,
  size: 'normal',
  mobile: false
})

const displayTime = computed(() => {
  if (!props.eta?.time) return '-'
  return props.eta.time.replace(/^[0-9-]* /, '').replace(/:[0-9]*$/, '')
})

const sizeClass = computed(() => {
  return props.size === 'small' ? 'size-small' : 'size-normal'
})

const urgencyClass = computed(() => {
  if (!props.eta?.time) return 'no-eta'
  
  const timeStr = props.eta.time
  const match = timeStr.match(/(\d{2}):(\d{2})/)
  if (!match) return 'normal'
  
  const [, hours, minutes] = match
  const etaTime = new Date()
  etaTime.setHours(parseInt(hours), parseInt(minutes), 0)
  
  const now = new Date()
  const diffMinutes = Math.floor((etaTime.getTime() - now.getTime()) / (1000 * 60))
  
  if (diffMinutes <= 2) return 'immediate'
  if (diffMinutes <= 5) return 'soon'
  return 'normal'
})
</script>

<style scoped>
.eta-display {
  position: relative;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  min-height: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.eta-time {
  font-weight: bold;
  font-size: 1.1em;
  line-height: 1.2;
}

.eta-info {
  font-size: 0.85em;
  color: var(--color-textSecondary);
  margin-top: 0.2rem;
  line-height: 1.1;
}

.route-number {
  background: var(--color-primary);
  color: var(--color-background);
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
  font-size: 0.8em;
  font-weight: bold;
  margin-right: 0.3rem;
}

.destination {
  font-weight: 500;
}

.train-length {
  margin-left: 0.3rem;
}

.urgency-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 1px 1px 0;
}

/* Urgency-based styling */
.immediate {
  background: rgba(255, 84, 89, 0.1);
  border: 1px solid rgba(255, 84, 89, 0.3);
}

.immediate .urgency-indicator {
  background: #ff5459;
  animation: pulse 1s infinite;
}

.immediate .eta-time {
  color: #ff5459;
}

.soon {
  background: rgba(230, 129, 97, 0.1);
  border: 1px solid rgba(230, 129, 97, 0.3);
}

.soon .urgency-indicator {
  background: #e68161;
}

.soon .eta-time {
  color: #e68161;
}

.normal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.normal .urgency-indicator {
  background: var(--color-primary);
}

.no-eta {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  opacity: 0.6;
}

.no-eta .eta-time {
  color: var(--color-textSecondary);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Dark mode adjustments */
[data-theme="dark"] .immediate {
  background: rgba(255, 84, 89, 0.2);
}

[data-theme="dark"] .soon {
  background: rgba(230, 129, 97, 0.2);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .eta-display {
    padding: 0.3rem;
    min-height: 2rem;
  }
  
  .eta-time {
    font-size: 1em;
  }
  
  .eta-info {
    font-size: 0.75em;
  }
  
  .route-number {
    font-size: 0.7em;
    padding: 0.05rem 0.2rem;
  }
}
</style>
