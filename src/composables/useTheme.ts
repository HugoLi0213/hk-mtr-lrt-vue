import { computed, ref, watch } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'

// Reactive state
const themeMode = ref<ThemeMode>('system')
const fontSize = ref(16)

// Computed theme
const isDarkMode = computed(() => {
  if (themeMode.value === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return themeMode.value === 'dark'
})

// Theme colors based on hkbus.app design
const theme = computed(() => ({
  mode: isDarkMode.value ? 'dark' : 'light',
  colors: {
    primary: isDarkMode.value ? '#fedb00' : '#444',
    background: isDarkMode.value ? '#000' : '#fedb00',
    surface: isDarkMode.value ? '#1a1a1a' : '#fff',
    text: isDarkMode.value ? '#fedb00' : '#000',
    textSecondary: isDarkMode.value ? '#ccc' : '#666',
    border: isDarkMode.value ? '#333' : '#ddd',
    cardBorder: isDarkMode.value ? '#444' : '#e0e0e0',
    tableHeader: isDarkMode.value ? '#2a2a2a' : '#f0f0f0',
    stationName: isDarkMode.value ? '#333' : '#e0e0e0',
    success: '#32b8c6',
    error: '#ff5459',
    warning: '#e68161',
    info: '#a7a9a9'
  },
  fontSize: fontSize.value
}))

// Local storage keys
const THEME_STORAGE_KEY = 'mtr-app-theme'
const FONT_SIZE_STORAGE_KEY = 'mtr-app-font-size'

// Initialize from localStorage
function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode
  if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
    themeMode.value = savedTheme
  }

  const savedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY)
  if (savedFontSize) {
    const parsedSize = parseInt(savedFontSize, 10)
    if (parsedSize >= 12 && parsedSize <= 32) {
      fontSize.value = parsedSize
    }
  }
}

// Save to localStorage
function saveTheme() {
  localStorage.setItem(THEME_STORAGE_KEY, themeMode.value)
}

function saveFontSize() {
  localStorage.setItem(FONT_SIZE_STORAGE_KEY, fontSize.value.toString())
}

// Theme control functions
function setThemeMode(mode: ThemeMode) {
  themeMode.value = mode
  saveTheme()
}

function setFontSize(size: number) {
  if (size >= 12 && size <= 32) {
    fontSize.value = size
    saveFontSize()
  }
}

// Apply theme to document
function applyTheme() {
  const root = document.documentElement
  const currentTheme = theme.value
  
  // Set data attribute for CSS
  root.setAttribute('data-theme', currentTheme.mode)
  
  // Set CSS custom properties
  Object.entries(currentTheme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
  
  root.style.setProperty('--font-size-base', `${currentTheme.fontSize}px`)
  root.style.setProperty('--font-size-table', `${Math.max(currentTheme.fontSize * 2, 32)}px`)
  root.style.setProperty('--font-size-title', `${Math.max(currentTheme.fontSize * 3, 48)}px`)
  root.style.setProperty('--font-size-eta-dest', `${Math.max(currentTheme.fontSize * 1.5, 24)}px`)
}

// Watch for theme changes
watch([themeMode, fontSize], () => {
  applyTheme()
}, { immediate: true })

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeMode.value === 'system') {
      applyTheme()
    }
  })
}

export function useTheme() {
  // Initialize on first use
  if (typeof window !== 'undefined') {
    initializeTheme()
    applyTheme()
  }

  return {
    themeMode: computed(() => themeMode.value),
    fontSize: computed(() => fontSize.value),
    isDarkMode,
    theme,
    setThemeMode,
    setFontSize
  }
}
