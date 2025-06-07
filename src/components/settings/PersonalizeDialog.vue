<template>
  <div v-if="open" class="dialog-overlay" @click="handleClose">
    <div class="dialog" @click.stop>
      <div class="dialog-header">
        <h2>個性化設定</h2>
        <button class="close-btn" @click="handleClose">✕</button>
      </div>
      <div class="divider"></div>
      <OptionsList />
    </div>
  </div>
</template>

<script lang="ts" setup>
import OptionsList from './OptionsList.vue';

interface Props {
  open: boolean;
}

interface Emits {
  (e: 'close'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleClose = () => {
  emit('close');
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
  background: var(--color-surface, white);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease;
}

.dialog-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-tableHeader, #f8f9fa);
  transition: background-color 0.3s ease;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.2em;
  font-weight: bold;
  color: var(--color-text, #000);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
  color: var(--color-text, #000);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.divider {
  height: 1px;
  background: #e0e0e0;
}
</style>
