<template>
  <div id="route-eta-header" class="route-eta-header">
    <RouteNo :route-no="translatedRoute" tag="h1" align="center" />
    <div class="caption">
      {{ t('往') }} {{ toProperCase(dest[language]) }}
      <template v-if="nlbId">
        {{ t('由') }} {{ toProperCase(orig[language]) }}
      </template>
    </div>
    <ReverseButton :route-id="routeId" :stop-id="stopId" />
    <div class="right-btn-group">
      <RouteStarButton :route-id="routeId" />
      <TimetableButton :route-id="routeId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import RouteNo from '../route-board/RouteNo';
import { toProperCase } from '../../utils';
import ReverseButton from './ReverseButton';
import TimetableButton from './TimeTableButton';
import RouteStarButton from './RouteStarButton';

const props = defineProps<{ routeId: string; stopId: string }>();
const db = inject('busDb', { routeList: {} });
const t = inject('t', (x: string) => x); // fallback translation
const language = inject('language', 'zh');

const routeListEntry = computed(() => db.routeList[props.routeId] || {});
const route = computed(() => routeListEntry.value.route || '');
const orig = computed(() => routeListEntry.value.orig || {});
const dest = computed(() => routeListEntry.value.dest || {});
const nlbId = computed(() => routeListEntry.value.nlbId);
const translatedRoute = computed(() => t(route.value));
</script>

<style scoped>
.route-eta-header {
  text-align: center;
  background: transparent;
  position: relative;
}
.right-btn-group {
  position: absolute;
  top: 0;
  right: 2%;
}
.caption {
  font-size: 0.9em;
  color: #888;
  margin-bottom: 0.5em;
}
</style>
