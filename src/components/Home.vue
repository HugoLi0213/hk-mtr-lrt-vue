<template>
  <div class="home-container" :data-theme="theme.mode">
    <!-- App Header -->
    <header class="app-header">
      <h1 class="app-title">{{ appTitle }}</h1>
      <div class="header-controls">
        <button class="settings-btn" @click="showSettings = true" aria-label="設定">
          ⚙️
        </button>
      </div>
    </header>

    <!-- Main content area -->
    <div class="main-content">
      <div class="welcome-card">
        <div class="welcome-icon">🚆</div>
        <h2 class="welcome-title">{{ t('Welcome to HK Transit') }}</h2>
        <p class="welcome-description">{{ t('Your one-stop app for MTR and Bus schedules in Hong Kong') }}</p>
        
        <div class="status-info">
          <div class="status-item" :class="{ 'offline': !isOnline }">
            <span class="status-icon">{{ isOnline ? '🟢' : '🔴' }}</span>
            <span class="status-text">{{ isOnline ? t('Online') : t('Offline') }}</span>
          </div>
          <div class="status-item">
            <span class="status-icon">⏱️</span>
            <span class="status-text">{{ currentTime }}</span>
          </div>
        </div>
      </div>

      <div class="feature-cards">
        <div class="feature-card" @click="handleMtrNavigation">
          <div class="feature-icon">🚇</div>
          <h3 class="feature-title">{{ t('MTR Train') }}</h3>
          <p class="feature-description">{{ t('View real-time MTR train schedules') }}</p>
        </div>

        <div class="feature-card" @click="handleBusNavigation">
          <div class="feature-icon">🚌</div>
          <h3 class="feature-title">{{ t('Bus Routes') }}</h3>
          <p class="feature-description">{{ t('Search and check bus arrival times') }}</p>
        </div>
      </div>
    </div>
    
    <!-- Footer with MTR and Bus navigation buttons -->
    <div class="footer">
      <button 
        class="nav-button mtr-button" 
        @click="handleMtrNavigation"
      >
        <span class="button-icon">🚇</span>
        <span class="button-text">{{ t('MTR') }}</span>
      </button>
      <button 
        class="nav-button bus-button" 
        @click="handleBusNavigation"
      >
        <span class="button-icon">🚌</span>
        <span class="button-text">{{ t('Bus') }}</span>
      </button>
    </div>

    <!-- Settings Modal -->
    <AppSettings v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue'
import { useNetworkStatus } from '../composables/useNetworkStatus'
import { useTheme } from '../composables/useTheme'
import AppSettings from './AppSettings.vue'

// Types
type HomeTabType = 'home' | 'search'

// Composables
const { theme } = useTheme()
const { isOnline } = useNetworkStatus()

// Injected dependencies
const appTitle = inject<string>('appTitle', 'HK Transit')
const t = inject<(key: string) => string>('t', (key: string) => key)
const navigate = inject<(path: string) => void>('navigate', () => {})

// Local state
const homeTab = ref<HomeTabType>('home')
const showSettings = ref(false)
const currentTime = ref('')
const timeInterval = ref<number | null>(null)

// Methods
const handleMtrNavigation = () => {
  navigate('/mtr')
}

const handleBusNavigation = () => {
  navigate('/route')
}

const handleTabChange = (v: HomeTabType) => {
  homeTab.value = v
  localStorage.setItem('homeTab', v)
}

const updateCurrentTime = () => {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('zh-HK', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
  currentTime.value = timeStr
}

// Initialize
onMounted(() => {
  const savedTab = localStorage.getItem('homeTab')
  if (savedTab && (savedTab === 'home' || savedTab === 'search')) {
    homeTab.value = savedTab as HomeTabType
  }
  
  // Update time
  updateCurrentTime()
  timeInterval.value = setInterval(updateCurrentTime, 1000) as unknown as number
})

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
})
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
}

/* App Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.app-title {
  font-size: var(--font-size-title);
  margin: 0;
  color: var(--color-text);
}

.header-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.settings-btn {
  background: var(--color-primary);
  border: none;
  color: var(--color-background);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: opacity 0.2s;
}

.settings-btn:hover {
  opacity: 0.8;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 1rem;
  gap: 1.5rem;
}

.welcome-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.welcome-title {
  font-size: 1.8rem;
  margin: 0 0 1rem 0;
  color: var(--color-text);
}

.welcome-description {
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
  color: var(--color-textSecondary);
}

.status-info {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-textSecondary);
}

.status-item.offline {
  color: #ff4444;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.feature-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.3rem;
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.feature-description {
  font-size: 0.95rem;
  color: var(--color-textSecondary);
  margin: 0;
}

.footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1rem;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  gap: 1rem;
}

.nav-button {
  flex: 1;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: none;
}

.button-icon {
  font-size: 2rem;
}

.button-text {
  font-size: 1rem;
}

.mtr-button {
  background: #1976d2;
  color: white;
}

.mtr-button:hover {
  background: #1565c0;
  transform: translateY(-2px);
}

.bus-button {
  background: #388e3c;
  color: white;
}

.bus-button:hover {
  background: #2e7d32;
  transform: translateY(-2px);
}

.nav-button:active {
  transform: translateY(0);
}

/* Dark theme styles */
[data-theme="dark"] {
  --color-primary: #fedb00;
  --color-background: #000;
  --color-surface: #1a1a1a;
  --color-text: #fedb00;
  --color-textSecondary: #ccc;
  --color-border: #333;
  --color-cardBorder: #444;
  --color-tableHeader: #2a2a2a;
  --color-stationName: #333;
  --color-warning: #ff9800;
}

[data-theme="dark"] .welcome-card,
[data-theme="dark"] .feature-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .feature-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

/* Responsive design */
@media (max-width: 768px) {
  .app-title {
    font-size: calc(var(--font-size-title) * 0.5);
  }
  
  .settings-btn {
    padding: 0.4rem 0.8rem;
    font-size: 1.2rem;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .welcome-description {
    font-size: 1rem;
  }
  
  .feature-cards {
    grid-template-columns: 1fr;
  }
  
  .footer {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .nav-button {
    max-width: none;
    width: 100%;
    flex-direction: row;
    justify-content: center;
  }
  
  .button-icon {
    font-size: 1.5rem;
  }
}
</style>
