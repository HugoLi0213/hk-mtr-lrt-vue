// 📊 Train Frequency Analyzer - Historical Pattern Learning
// This tracks train frequency over time to predict peak hours

export interface FrequencyRecord {
  timestamp: number
  stationCode: string
  lineCode: string
  trainCount: number
  avgGap: number // Average gap between trains in seconds
  direction: string
}

export interface PeakHourStatus {
  level: 'low' | 'medium' | 'high' | 'very-high'
  label: string
  labelEn: string
  description: string
  descriptionEn: string
  icon: string
  color: string
  crowdPercentage: number
  dataSource: 'historical' | 'time-based' | 'hybrid'
  confidence: number // 0-100
}

export interface FrequencyStats {
  avgTrainCount: number
  avgGap: number
  recordCount: number
  peakRatio: number
}

class TrainFrequencyAnalyzer {
  private records: FrequencyRecord[] = []
  private readonly STORAGE_KEY = 'mtr-frequency-history'
  private readonly MAX_RECORDS = 15000 // Keep last 15k records (~2 weeks of data)
  
  constructor() {
    this.loadFromStorage()
    this.cleanOldRecords()
  }
  
  /**
   * Record train frequency - call this every time you fetch train data
   */
  recordFrequency(
    stationCode: string,
    lineCode: string,
    direction: string,
    trains: any[]
  ): void {
    if (!trains || trains.length === 0) return
    
    const now = Date.now()
    
    // Calculate average gap between trains
    const trainTimes = trains
      .map(t => {
        // Handle different time formats
        const timeStr = t.time || t.ttnt || t.timestamp
        if (!timeStr) return null
        return new Date(timeStr).getTime()
      })
      .filter((t): t is number => t !== null && !isNaN(t))
      .sort((a, b) => a - b)
    
    if (trainTimes.length === 0) return
    
    // Calculate gaps
    const gaps: number[] = []
    for (let i = 1; i < trainTimes.length; i++) {
      const gap = (trainTimes[i] - trainTimes[i - 1]) / 1000 // seconds
      if (gap > 0 && gap < 3600) { // Ignore gaps > 1 hour (data issues)
        gaps.push(gap)
      }
    }
    
    const avgGap = gaps.length > 0
      ? gaps.reduce((a, b) => a + b, 0) / gaps.length
      : 300 // default 5 minutes
    
    const record: FrequencyRecord = {
      timestamp: now,
      stationCode,
      lineCode,
      direction,
      trainCount: trains.length,
      avgGap: Math.round(avgGap)
    }
    
    this.records.push(record)
    
    // Limit records to prevent excessive storage
    if (this.records.length > this.MAX_RECORDS) {
      this.records = this.records.slice(-this.MAX_RECORDS)
    }
    
    // Save to localStorage (throttled)
    this.saveToStorageThrottled()
  }
  
  /**
   * Get average frequency for specific day/hour
   */
  getAverageFrequency(
    stationCode: string,
    lineCode: string,
    dayOfWeek: number,
    hour: number
  ): FrequencyStats {
    const relevantRecords = this.records.filter(r => {
      const date = new Date(r.timestamp)
      return (
        r.stationCode === stationCode &&
        r.lineCode === lineCode &&
        date.getDay() === dayOfWeek &&
        date.getHours() === hour
      )
    })
    
    if (relevantRecords.length === 0) {
      return {
        avgTrainCount: 0,
        avgGap: 0,
        recordCount: 0,
        peakRatio: 0
      }
    }
    
    const avgTrainCount = relevantRecords.reduce((sum, r) => sum + r.trainCount, 0) / relevantRecords.length
    const avgGap = relevantRecords.reduce((sum, r) => sum + r.avgGap, 0) / relevantRecords.length
    
    // Calculate peak ratio (compare to daily average)
    const allDayRecords = this.records.filter(r => {
      const date = new Date(r.timestamp)
      return (
        r.stationCode === stationCode &&
        r.lineCode === lineCode &&
        date.getDay() === dayOfWeek
      )
    })
    
    const dailyAvg = allDayRecords.length > 0
      ? allDayRecords.reduce((sum, r) => sum + r.trainCount, 0) / allDayRecords.length
      : avgTrainCount
    
    const peakRatio = dailyAvg > 0 ? avgTrainCount / dailyAvg : 1
    
    return {
      avgTrainCount: Math.round(avgTrainCount * 10) / 10,
      avgGap: Math.round(avgGap),
      recordCount: relevantRecords.length,
      peakRatio: Math.round(peakRatio * 100) / 100
    }
  }
  
  /**
   * Get peak status based on historical data
   */
  getPeakStatusFromHistory(
    stationCode: string,
    lineCode: string
  ): PeakHourStatus | null {
    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay()
    
    const stats = this.getAverageFrequency(stationCode, lineCode, currentDay, currentHour)
    
    // Not enough data yet
    if (stats.recordCount < 5) {
      return null
    }
    
    const confidence = Math.min(100, Math.round((stats.recordCount / 20) * 100))
    const ratio = stats.peakRatio
    
    // Determine peak level based on ratio
    if (ratio >= 1.5) {
      return {
        level: 'very-high',
        label: '極繁忙時段',
        labelEn: 'Very Busy Period',
        description: `車次比平均多 ${Math.round((ratio - 1) * 100)}%`,
        descriptionEn: `${Math.round((ratio - 1) * 100)}% more trains than average`,
        icon: '🔴',
        color: '#ef4444',
        crowdPercentage: Math.min(98, Math.round(50 + ratio * 25)),
        dataSource: 'historical',
        confidence
      }
    }
    
    if (ratio >= 1.25) {
      return {
        level: 'high',
        label: '繁忙時段',
        labelEn: 'Busy Period',
        description: `車次較頻密（${stats.avgTrainCount.toFixed(1)} 班/次）`,
        descriptionEn: `Frequent service (${stats.avgTrainCount.toFixed(1)} trains)`,
        icon: '🟠',
        color: '#f97316',
        crowdPercentage: Math.round(50 + ratio * 20),
        dataSource: 'historical',
        confidence
      }
    }
    
    if (ratio >= 1.1) {
      return {
        level: 'medium',
        label: '中等繁忙',
        labelEn: 'Moderately Busy',
        description: `車次略多於平均`,
        descriptionEn: `Slightly above average`,
        icon: '🟡',
        color: '#FFA500',
        crowdPercentage: Math.round(40 + ratio * 15),
        dataSource: 'historical',
        confidence
      }
    }
    
    // Off-peak
    return {
      level: 'low',
      label: '非繁忙時段',
      labelEn: 'Off-Peak Period',
      description: `車次正常（平均 ${stats.avgGap}秒一班）`,
      descriptionEn: `Normal service (avg ${stats.avgGap}s interval)`,
      icon: '🟢',
      color: '#22c55e',
      crowdPercentage: Math.round(25 + ratio * 10),
      dataSource: 'historical',
      confidence
    }
  }
  
  /**
   * Get hybrid peak status (combines historical + time-based)
   */
  getHybridPeakStatus(
    stationCode: string,
    lineCode: string,
    timeBasedStatus: PeakHourStatus
  ): PeakHourStatus {
    const historicalStatus = this.getPeakStatusFromHistory(stationCode, lineCode)
    
    // Not enough historical data - use time-based
    if (!historicalStatus || historicalStatus.confidence < 30) {
      return {
        ...timeBasedStatus,
        dataSource: 'time-based',
        confidence: 60
      }
    }
    
    // High confidence in historical data - use it
    if (historicalStatus.confidence >= 70) {
      return historicalStatus
    }
    
    // Medium confidence - blend both
    const historicalWeight = historicalStatus.confidence / 100
    const timeBasedWeight = 1 - historicalWeight
    
    const blendedCrowdPercentage = Math.round(
      historicalStatus.crowdPercentage * historicalWeight +
      timeBasedStatus.crowdPercentage * timeBasedWeight
    )
    
    // Use the higher severity level for safety
    const levels = ['low', 'medium', 'high', 'very-high']
    const historicalLevelIndex = levels.indexOf(historicalStatus.level)
    const timeBasedLevelIndex = levels.indexOf(timeBasedStatus.level)
    const blendedLevel = levels[Math.max(historicalLevelIndex, timeBasedLevelIndex)]
    
    return {
      level: blendedLevel as PeakHourStatus['level'],
      label: `${historicalStatus.label} (混合數據)`,
      labelEn: `${historicalStatus.labelEn} (Hybrid)`,
      description: historicalStatus.description,
      descriptionEn: historicalStatus.descriptionEn,
      icon: historicalStatus.icon,
      color: historicalStatus.color,
      crowdPercentage: blendedCrowdPercentage,
      dataSource: 'hybrid',
      confidence: Math.round((historicalStatus.confidence + 60) / 2)
    }
  }
  
  /**
   * Get statistics overview
   */
  getStatistics(): {
    totalRecords: number
    dateRange: { start: Date | null; end: Date | null }
    stationsTracked: number
    linesTracked: number
    oldestRecord: Date | null
    newestRecord: Date | null
  } {
    if (this.records.length === 0) {
      return {
        totalRecords: 0,
        dateRange: { start: null, end: null },
        stationsTracked: 0,
        linesTracked: 0,
        oldestRecord: null,
        newestRecord: null
      }
    }
    
    const timestamps = this.records.map(r => r.timestamp)
    const stations = new Set(this.records.map(r => r.stationCode))
    const lines = new Set(this.records.map(r => r.lineCode))
    
    return {
      totalRecords: this.records.length,
      dateRange: {
        start: new Date(Math.min(...timestamps)),
        end: new Date(Math.max(...timestamps))
      },
      stationsTracked: stations.size,
      linesTracked: lines.size,
      oldestRecord: new Date(Math.min(...timestamps)),
      newestRecord: new Date(Math.max(...timestamps))
    }
  }
  
  /**
   * Get peak hours for a specific station/line (top 3 hours)
   */
  getPeakHoursForStation(
    stationCode: string,
    lineCode: string,
    dayOfWeek: number
  ): Array<{ hour: number; stats: FrequencyStats }> {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    const hourlyStats = hours.map(hour => ({
      hour,
      stats: this.getAverageFrequency(stationCode, lineCode, dayOfWeek, hour)
    }))
    
    // Filter out hours with no data
    const validStats = hourlyStats.filter(h => h.stats.recordCount > 0)
    
    // Sort by peak ratio (highest first)
    validStats.sort((a, b) => b.stats.peakRatio - a.stats.peakRatio)
    
    return validStats.slice(0, 3) // Top 3 peak hours
  }
  
  /**
   * Clean old records (older than 30 days)
   */
  private cleanOldRecords(): void {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const initialCount = this.records.length
    
    this.records = this.records.filter(r => r.timestamp > thirtyDaysAgo)
    
    if (this.records.length < initialCount) {
      console.log(`🗑️ Cleaned ${initialCount - this.records.length} old frequency records`)
      this.saveToStorage()
    }
  }
  
  /**
   * Export data for analysis
   */
  exportData(): string {
    return JSON.stringify(this.records, null, 2)
  }
  
  /**
   * Import data (for testing or migration)
   */
  importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData) as FrequencyRecord[]
      
      // Validate data structure
      if (!Array.isArray(imported)) return false
      
      const valid = imported.every(r =>
        typeof r.timestamp === 'number' &&
        typeof r.stationCode === 'string' &&
        typeof r.lineCode === 'string' &&
        typeof r.trainCount === 'number'
      )
      
      if (!valid) return false
      
      this.records = imported
      this.saveToStorage()
      return true
    } catch (e) {
      console.error('Failed to import data:', e)
      return false
    }
  }
  
  /**
   * Clear all records
   */
  clearAllData(): void {
    this.records = []
    this.saveToStorage()
    console.log('🗑️ All frequency data cleared')
  }
  
  // Throttled save to prevent excessive localStorage writes
  private saveTimeout: number | null = null
  private saveToStorageThrottled(): void {
    if (this.saveTimeout) return
    
    this.saveTimeout = window.setTimeout(() => {
      this.saveToStorage()
      this.saveTimeout = null
    }, 5000) // Save at most once per 5 seconds
  }
  
  private saveToStorage(): void {
    try {
      const data = JSON.stringify(this.records)
      localStorage.setItem(this.STORAGE_KEY, data)
      
      // Store metadata separately for quick access
      const stats = this.getStatistics()
      localStorage.setItem(this.STORAGE_KEY + '-meta', JSON.stringify({
        totalRecords: stats.totalRecords,
        lastUpdate: Date.now(),
        version: '1.0'
      }))
    } catch (e) {
      console.error('Failed to save frequency data:', e)
      
      // If storage is full, remove oldest 20% of records
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        const removeCount = Math.floor(this.records.length * 0.2)
        this.records = this.records.slice(removeCount)
        console.log(`🗑️ Removed ${removeCount} oldest records due to storage quota`)
        
        // Try saving again
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.records))
        } catch (e2) {
          console.error('Still failed after cleanup:', e2)
        }
      }
    }
  }
  
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (data) {
        this.records = JSON.parse(data) as FrequencyRecord[]
        console.log(`📊 Loaded ${this.records.length} frequency records from storage`)
      }
    } catch (e) {
      console.error('Failed to load frequency data:', e)
      this.records = []
    }
  }
}

// Singleton instance
export const frequencyAnalyzer = new TrainFrequencyAnalyzer()

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).__frequencyAnalyzer = frequencyAnalyzer
}
