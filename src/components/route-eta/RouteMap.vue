<template>
  <div class="route-map">
    <!-- This is a placeholder. In production, use vue-leaflet or similar for map rendering. -->
    <div class="map-placeholder">
      <span>地圖元件 (RouteMap) 需用 vue-leaflet 或其他 Vue 地圖元件實作</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: 實作完整地圖互動，參考 React 版 RouteMap.tsx
const props = defineProps<{
  routeId: string;
  stopIds: string[];
  stopIdx: number;
  route: string;
  companies: string[];
}>();
const emit = defineEmits(['marker-click']);
</script>

<style scoped>
.route-map {
  height: 35vh;
  filter: brightness(0.98);
}
.map-placeholder {
  height: 35vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #888;
  border: 1px dashed #ccc;
}
</style>
