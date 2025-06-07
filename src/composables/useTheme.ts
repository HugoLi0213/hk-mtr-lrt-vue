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

// Theme colors optimized for MTR app
const theme = computed(() => ({
  mode: isDarkMode.value ? 'dark' : 'light',
  colors: {
    // Primary colors
    primary: isDarkMode.value ? '#7c92f7' : '#667eea',
    'primary-container': isDarkMode.value ? '#2d3748' : '#e6f3ff',
    'on-primary': isDarkMode.value ? '#ffffff' : '#ffffff',
    
    // Background colors
    background: isDarkMode.value ? '#0f0f0f' : '#f5f5f7',
    surface: isDarkMode.value ? '#1a1a1a' : '#ffffff',
    'surface-variant': isDarkMode.value ? '#2d2d2d' : '#f5f5f7',
    'surface-container': isDarkMode.value ? '#262626' : '#fafafa',
    
    // Text colors
    text: isDarkMode.value ? '#e4e4e7' : '#18181b',
    'text-secondary': isDarkMode.value ? '#a1a1aa' : '#71717a',
    'text-tertiary': isDarkMode.value ? '#71717a' : '#a1a1aa',
    'on-surface': isDarkMode.value ? '#e4e4e7' : '#18181b',
    
    // Border colors
    border: isDarkMode.value ? '#404040' : '#e4e4e7',
    'border-light': isDarkMode.value ? '#525252' : '#d4d4d8',
    'card-border': isDarkMode.value ? '#525252' : '#e4e4e7',
    
    // Component specific colors
    'table-header': isDarkMode.value ? '#262626' : '#f8f9fa',
    'station-name': isDarkMode.value ? '#404040' : '#e4e4e7',
    
    // Status colors
    success: isDarkMode.value ? '#34d399' : '#22c55e',
    error: isDarkMode.value ? '#f87171' : '#ef4444',
    warning: isDarkMode.value ? '#fbbf24' : '#f59e0b',
    info: isDarkMode.value ? '#60a5fa' : '#3b82f6',
    
    // Light Rail specific colors
    'route-badge-bg': isDarkMode.value ? '#374151' : '#f3f4f6',
    'platform-tab': isDarkMode.value ? '#1f2937' : '#ffffff',
    'overlay-bg': isDarkMode.value ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)',
    
    // Interactive states
    hover: isDarkMode.value ? '#374151' : '#f3f4f6',
    pressed: isDarkMode.value ? '#4b5563' : '#e5e7eb',
    focus: isDarkMode.value ? '#6366f1' : '#667eea'
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
  root.style.setProperty('--font-size-table', `${Math.min(currentTheme.fontSize * 1.2, 20)}px`)
  root.style.setProperty('--font-size-title', `${Math.min(currentTheme.fontSize * 1.8, 28)}px`)
  root.style.setProperty('--font-size-eta-dest', `${Math.min(currentTheme.fontSize * 1.1, 18)}px`)
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
