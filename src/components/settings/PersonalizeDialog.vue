<template>
  <div v-if="open" class="dialog-overlay" @click="handleClose">
    <div class="dialog" @click.stop>
      <div class="dialog-header">
        <div class="header-content">
          <button v-if="tab !== 'options'" class="back-btn" @click="tab = 'options'">
            ←
          </button>
          <h2>{{ getTitle }}</h2>
        </div>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>
      <div class="divider"></div>
      <OptionsList v-if="tab === 'options'" @go-to-manage="tab = 'manage'" />
      <UserContentManagement v-if="tab === 'manage'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import OptionsList from './OptionsList.vue';
import UserContentManagement from './UserContentManagement.vue';

interface Props {
  open: boolean;
}

interface Emits {
  (e: 'close'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const tab = ref<'options' | 'manage'>('options');

const getTitle = computed(() => {
  if (tab.value === 'options') return '個性化設定';
  if (tab.value === 'manage') return '管理收藏';
  return '';
});

const handleClose = () => {
  emit('close');
  tab.value = 'options';
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.dialog {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-content h2 {
  margin: 0;
  font-size: 1.2em;
  font-weight: bold;
}

.back-btn, .close-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.back-btn:hover, .close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.divider {
  height: 1px;
  background: #e0e0e0;
}
</style>
