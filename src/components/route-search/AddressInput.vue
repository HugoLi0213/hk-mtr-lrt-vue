<template>
  <div class="address-input">
    <input
      :placeholder="placeholder"
      v-model="inputValue"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      class="address-input-box"
    />
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions">
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="suggestion-item"
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref, watch } from 'vue'

export interface Address {
  name: string
  location: {
    lat: number
    lng: number
  }
}

const props = defineProps<{ 
  value: Address | null
  placeholder: string
  stopList: any
}>()

const emit = defineEmits<{
  change: [address: Address | null]
}>()

const inputValue = ref(props.value ? props.value.name : '')
const showSuggestions = ref(false)
const suggestions = ref<Address[]>([])

watch(() => props.value, (val) => {
  inputValue.value = val ? val.name : ''
})

// Generate suggestions from stopList
const generateSuggestions = (query: string): Address[] => {
  if (!query || !props.stopList || query.length < 2) return []
  
  const filtered: Address[] = []
  Object.entries(props.stopList).forEach(([stopId, stop]: [string, any]) => {
    if (stop.name && stop.name.toLowerCase().includes(query.toLowerCase())) {
      filtered.push({
        name: stop.name,
        location: stop.location || { lat: 0, lng: 0 }
      })
    }
  })
  
  return filtered.slice(0, 10) // Limit to 10 suggestions
}

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  const query = target.value
  inputValue.value = query
  
  if (query.length >= 2) {
    suggestions.value = generateSuggestions(query)
    showSuggestions.value = true
  } else {
    suggestions.value = []
    showSuggestions.value = false
  }
  
  // Emit change with null for now - user needs to select from suggestions
  emit('change', null)
}

function onFocus() {
  if (inputValue.value.length >= 2) {
    suggestions.value = generateSuggestions(inputValue.value)
    showSuggestions.value = true
  }
}

function onBlur() {
  // Delay hiding suggestions to allow for clicks
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

function selectSuggestion(suggestion: Address) {
  inputValue.value = suggestion.name
  showSuggestions.value = false
  emit('change', suggestion)
}
</script>

<style scoped>
.address-input {
  width: 100%;
  margin-bottom: 0.5em;
  position: relative;
}

.address-input-box {
  width: 100%;
  padding: 12px 16px;
  font-size: 1em;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}

.address-input-box:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-item:last-child {
  border-bottom: none;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .address-input-box {
    background: #333;
    color: white;
    border-color: #555;
  }
  
  .address-input-box:focus {
    border-color: #64b5f6;
    box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
  }
  
  .suggestions {
    background: #333;
    border-color: #555;
  }
  
  .suggestion-item {
    color: white;
    border-bottom-color: #555;
  }
  
  .suggestion-item:hover {
    background-color: #444;
  }
}
</style>
