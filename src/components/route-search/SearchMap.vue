<template>
  <div class="search-map">
    <!-- 請用 vue-leaflet 或其他地圖元件實作地圖顯示與互動 -->
    <div class="map-placeholder">地圖元件（SearchMap）</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  start: any;
  end: any;
  routes: any;
  stopIdx: any;
}>();
const emit = defineEmits(['marker-click']);
// TODO: 補上地圖渲染、標記、路線繪製、點擊事件等
</script>

<style scoped>
.search-map {
  min-height: 200px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ccc;
}
.map-placeholder {
  color: #888;
}
</style>
