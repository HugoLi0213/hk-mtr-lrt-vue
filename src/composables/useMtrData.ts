import { ref, type Ref } from 'vue'
import type { StationData } from '../types/train'

interface UseMtrDataReturn {
  trainData: Ref<Record<string, StationData>>
  loading: Ref<boolean>
  error: Ref<string | null>
  retryCount: Ref<number>
  refresh: () => Promise<void>
  fetchTrainData: (lineCode: string, lineConfig: any) => Promise<void>
}

// Cache configuration
const CACHE_DURATION = 30000 // 30 seconds
const MAX_RETRIES = 3
const dataCache = new Map<string, { data: Record<string, StationData>, timestamp: number }>()

export function useMtrData(): UseMtrDataReturn {
  const trainData = ref<Record<string, StationData>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const retryCount = ref(0)

  const isCacheValid = (cacheKey: string): boolean => {
    const cached = dataCache.get(cacheKey)
    if (!cached) return false
    return Date.now() - cached.timestamp < CACHE_DURATION
  }

  const getCachedData = (cacheKey: string): Record<string, StationData> | null => {
    const cached = dataCache.get(cacheKey)
    return cached ? cached.data : null
  }

  const setCachedData = (cacheKey: string, data: Record<string, StationData>) => {
    dataCache.set(cacheKey, { data, timestamp: Date.now() })
  }

  const fetchWithRetry = async (fetchFn: () => Promise<void>): Promise<void> => {
    try {
      await fetchFn()
      retryCount.value = 0
      error.value = null
    } catch (err) {
      console.error('Fetch error:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      
      if (retryCount.value < MAX_RETRIES) {
        retryCount.value += 1
        const delay = 2000 * retryCount.value // Exponential backoff
        setTimeout(() => fetchWithRetry(fetchFn), delay)
      } else {
        error.value = `Failed to fetch data after ${MAX_RETRIES} attempts. Please check your connection.`
      }
    }
  }

  const fetchMTRData = async (lineCode: string, stations: string[]): Promise<Record<string, StationData>> => {
    // Batch requests with Promise.allSettled for better error handling
    const promises = stations.map(station =>
      fetch(`https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${lineCode}&sta=${station}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          return res.json()
        })
        .catch(err => ({ error: err.message, stationCode: station }))
    )
    
    const responses = await Promise.allSettled(promises)
    const newTrainData: Record<string, StationData> = {}
    
    responses.forEach((response, idx) => {
      if (response.status === 'fulfilled' && response.value && !response.value.error) {
        const result = response.value
        if (result.data) {
          const stationCode = stations[idx]
          const stationKey = `${lineCode}-${stationCode}`
          if (result.data[stationKey]) {
            newTrainData[stationCode] = result.data[stationKey]
          }
        }
      }
    })
    
    return newTrainData
  }

  const fetchLRTData = async (stations: string[]): Promise<Record<string, StationData>> => {
    const promises = stations.map(stationId =>
      fetch(`https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id=${stationId}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          return res.json()
        })
        .catch(err => ({ error: err.message, stationId }))
    )
    
    const responses = await Promise.allSettled(promises)
    const newTrainData: Record<string, StationData> = {}
    
    responses.forEach((response, idx) => {
      if (response.status === 'fulfilled' && response.value && !response.value.error) {
        const result = response.value
        if (result.platform_list) {
          const stationId = stations[idx]
          const schedules: any[] = []
          
          result.platform_list.forEach((platform: any) => {
            platform.route_list.forEach((route: any) => {
              schedules.push({
                time: route.time_ch,
                dest: route.dest_ch,
                plat: platform.platform_id,
                route: route.route_no,
                train_length: route.train_length
              })
            })
          })
          
          newTrainData[stationId] = {
            UP: schedules.slice(0, 4),
            DOWN: schedules.slice(0, 4)
          }
        }
      }
    })
    
    return newTrainData
  }

  const fetchTrainData = async (lineCode: string, lineConfig: any): Promise<void> => {
    const cacheKey = `${lineCode}-${Date.now() - (Date.now() % CACHE_DURATION)}`
    
    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cached = getCachedData(cacheKey)
      if (cached) {
        trainData.value = cached
        return
      }
    }

    loading.value = true
    
    const fetchOperation = async () => {
      const stations = Object.keys(lineConfig.stations)
      let newTrainData: Record<string, StationData>
      
      if (lineCode === 'LRT') {
        newTrainData = await fetchLRTData(stations)
      } else {
        newTrainData = await fetchMTRData(lineCode, stations)
      }
      
      trainData.value = newTrainData
      setCachedData(cacheKey, newTrainData)
    }

    await fetchWithRetry(fetchOperation)
    loading.value = false
  }

  const refresh = async (): Promise<void> => {
    // Clear cache for immediate refresh
    dataCache.clear()
    // Refresh will be handled by the component calling fetchTrainData again
  }

  return {
    trainData,
    loading,
    error,
    retryCount,
    refresh,
    fetchTrainData
  }
}
