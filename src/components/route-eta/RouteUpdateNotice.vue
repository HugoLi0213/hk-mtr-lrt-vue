<template>
  <div v-if="show" class="route-update-notice" @click="renewDb">
    {{ t('db-renew-text') }}
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watch } from 'vue';

const props = defineProps<{ route: any }>();
const t = inject('t', (x: string) => x);
const updateTime = inject('updateTime', 0);
const renewDb = inject('renewDb', () => {});
const fetchRouteUpdatedAt = inject('fetchRouteUpdatedAt', async () => 0);

const show = ref(false);

watch(
  () => props.route,
  async (route) => {
    const updatedAt = await fetchRouteUpdatedAt(route);
    show.value = updatedAt > updateTime;
  },
  { immediate: true }
);
</script>

<style scoped>
.route-update-notice {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 1em;
  margin: 1em 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  background: #f9f9f9;
  color: #333;
}
</style>
