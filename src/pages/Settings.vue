<template>
  <div class="settings-page">
    <h1>設定</h1>
    <div class="setting-group">
      <label>
        <input type="checkbox" v-model="showBusEta" @change="saveSetting" />
        顯示巴士到站頁面（Bus ETA Page）
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// Use localStorage for persistence
const showBusEta = ref(localStorage.getItem('showBusEta') === 'true');

const saveSetting = () => {
  localStorage.setItem('showBusEta', showBusEta.value ? 'true' : 'false');
};

watch(showBusEta, saveSetting);
</script>

<style scoped>
.settings-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 16px;
}
.setting-group {
  margin-bottom: 20px;
  font-size: 1.1em;
}
</style>
