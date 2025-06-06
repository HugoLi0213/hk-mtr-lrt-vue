<template>
  <div class="search-result-list" :class="{ expanded: expanded }">
    <div class="result-header" @click="$emit('route-click', idx)">
      <h3>路線組合 {{ idx + 1 }}</h3>
      <div class="route-summary">
        <span v-for="(route, i) in routes" :key="route.routeId" class="route-badge">
          {{ route.routeId }}
          <span v-if="i < routes.length - 1" class="connector">→</span>
        </span>
      </div>
      <div class="expand-icon" :class="{ rotated: expanded }">▼</div>
    </div>
    
    <div v-if="expanded" class="route-details">
      <div 
        v-for="(route, routeIndex) in routes" 
        :key="`${route.routeId}-${routeIndex}`"
        class="route-detail"
      >
        <div class="route-info">
          <h4>{{ route.routeId }}</h4>
          <p>從第 {{ route.on + 1 }} 站上車，第 {{ route.off + 1 }} 站下車</p>
          <p>共 {{ route.off - route.on }} 個站</p>
        </div>
        
        <!-- Stop indicators -->
        <div v-if="stopIdx && stopIdx[routeIndex] !== undefined" class="stop-indicator">
          目前顯示第 {{ stopIdx[routeIndex] + 1 }} 站
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ 
  routes: any[]
  idx: number
  expanded?: boolean
  stopIdx?: number[] | null
}>()

const emit = defineEmits<{
  'route-click': [idx: number]
}>()
</script>

<style scoped>
.search-result-list {
  width: 100%;
  margin-bottom: 1em;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.result-header {
  padding: 1em;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
}

.result-header:hover {
  background: #e9ecef;
}

.result-header h3 {
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
  color: #1976d2;
}

.route-summary {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex: 1;
  margin: 0 1em;
}

.route-badge {
  background: #1976d2;
  color: white;
  padding: 0.25em 0.5em;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25em;
}

.connector {
  color: #666;
  font-weight: normal;
  margin: 0 0.25em;
}

.expand-icon {
  transition: transform 0.2s;
  color: #666;
  font-size: 0.8em;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.route-details {
  border-top: 1px solid #e0e0e0;
  background: white;
}

.route-detail {
  padding: 1em;
  border-bottom: 1px solid #f0f0f0;
}

.route-detail:last-child {
  border-bottom: none;
}

.route-info h4 {
  margin: 0 0 0.5em 0;
  color: #1976d2;
  font-size: 1.1em;
}

.route-info p {
  margin: 0.25em 0;
  color: #666;
  font-size: 0.9em;
}

.stop-indicator {
  margin-top: 0.5em;
  padding: 0.5em;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 0.9em;
  color: #1565c0;
}

.expanded {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .search-result-list {
    background: #333;
    border-color: #555;
  }
  
  .result-header {
    background: #404040;
  }
  
  .result-header:hover {
    background: #4a4a4a;
  }
  
  .result-header h3 {
    color: #64b5f6;
  }
  
  .route-badge {
    background: #1565c0;
  }
  
  .route-details {
    background: #333;
    border-top-color: #555;
  }
  
  .route-detail {
    border-bottom-color: #555;
  }
  
  .route-info h4 {
    color: #64b5f6;
  }
  
  .route-info p {
    color: #ccc;
  }
  
  .stop-indicator {
    background: #1a237e;
    color: #90caf9;
  }
}
</style>
