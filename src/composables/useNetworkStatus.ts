import { onMounted, onUnmounted, ref, type Ref } from 'vue'

interface UseNetworkStatusReturn {
  isOnline: Ref<boolean>
  connectionType: Ref<string>
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const isOnline = ref(navigator.onLine)
  const connectionType = ref('unknown')

  const updateConnectionInfo = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connectionType.value = connection?.effectiveType || 'unknown'
    }
  }

  const handleOnline = () => {
    isOnline.value = true
    updateConnectionInfo()
  }

  const handleOffline = () => {
    isOnline.value = false
  }

  const handleConnectionChange = () => {
    updateConnectionInfo()
  }

  onMounted(() => {
    updateConnectionInfo()
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.addEventListener('change', handleConnectionChange)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.removeEventListener('change', handleConnectionChange)
    }
  })

  return {
    isOnline,
    connectionType
  }
}
