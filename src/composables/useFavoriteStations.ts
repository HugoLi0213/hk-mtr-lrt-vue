import { computed, ref, watch, type Ref } from 'vue'

interface UseFavoriteStationsReturn {
  favorites: Ref<string[]>
  toggleFavorite: (stationCode: string) => void
  isFavorite: (stationCode: string) => boolean
  clearFavorites: () => void
}

const FAVORITES_STORAGE_KEY = 'mtr-favorite-stations'

export function useFavoriteStations(): UseFavoriteStationsReturn {
  const favorites = ref<string[]>([])

  // Initialize from localStorage
  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          favorites.value = parsed
        }
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
      favorites.value = []
    }
  }

  // Save to localStorage
  const saveFavorites = () => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites.value))
    } catch (error) {
      console.error('Failed to save favorites:', error)
    }
  }

  const toggleFavorite = (stationCode: string) => {
    const index = favorites.value.indexOf(stationCode)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(stationCode)
    }
  }

  const isFavorite = (stationCode: string): boolean => {
    return favorites.value.includes(stationCode)
  }

  const clearFavorites = () => {
    favorites.value = []
  }

  // Watch for changes and save to localStorage
  watch(favorites, saveFavorites, { deep: true })

  // Load favorites on initialization
  if (typeof window !== 'undefined') {
    loadFavorites()
  }

  return {
    favorites: computed(() => favorites.value),
    toggleFavorite,
    isFavorite,
    clearFavorites
  }
}
