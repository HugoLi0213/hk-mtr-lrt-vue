// 🕐 Peak Hour Indicator - Time-based patterns for Hong Kong MTR
// Provides immediate peak hour predictions based on time patterns

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
  confidence: number
}

/**
 * Get current peak status based on time patterns
 */
export function getCurrentPeakStatus(): PeakHourStatus {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const dayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday
  const timeInMinutes = hour * 60 + minute
  
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  // Weekend patterns (generally lighter)
  if (isWeekend) {
    // Weekend afternoon/evening (shopping and leisure time)
    if (timeInMinutes >= 720 && timeInMinutes < 1140) { // 12:00 PM - 7:00 PM
      return {
        level: 'medium',
        label: '週末繁忙時段',
        labelEn: 'Weekend Busy Hours',
        description: '購物和休閒人流',
        descriptionEn: 'Shopping and leisure crowds',
        icon: '🟡',
        color: '#FFA500',
        crowdPercentage: 58,
        dataSource: 'time-based',
        confidence: 70
      }
    }
    
    // Weekend off-peak
    return {
      level: 'low',
      label: '週末非繁忙',
      labelEn: 'Weekend Off-Peak',
      description: '人流較少',
      descriptionEn: 'Light crowds',
      icon: '🟢',
      color: '#22c55e',
      crowdPercentage: 32,
      dataSource: 'time-based',
      confidence: 70
    }
  }
  
  // Weekday patterns
  
  // Morning Peak (7:00 AM - 9:30 AM)
  if (timeInMinutes >= 420 && timeInMinutes < 570) { // 7:00 AM - 9:30 AM
    // Super peak (7:45 AM - 8:45 AM)
    if (timeInMinutes >= 465 && timeInMinutes < 525) {
      return {
        level: 'very-high',
        label: '早上繁忙高峰',
        labelEn: 'Morning Rush Peak',
        description: '非常擠迫，預計列車滿載',
        descriptionEn: 'Very crowded, expect full trains',
        icon: '🔴',
        color: '#ef4444',
        crowdPercentage: 95,
        dataSource: 'time-based',
        confidence: 85
      }
    }
    
    return {
      level: 'high',
      label: '早上繁忙時段',
      labelEn: 'Morning Peak Hours',
      description: '擠迫，車廂較滿',
      descriptionEn: 'Crowded, fuller trains',
      icon: '🟠',
      color: '#f97316',
      crowdPercentage: 78,
      dataSource: 'time-based',
      confidence: 80
    }
  }
  
  // Lunch time (12:00 PM - 1:30 PM)
  if (timeInMinutes >= 720 && timeInMinutes < 810) { // 12:00 PM - 1:30 PM
    return {
      level: 'medium',
      label: '午飯時段',
      labelEn: 'Lunch Hours',
      description: '中等人流',
      descriptionEn: 'Moderate traffic',
      icon: '🟡',
      color: '#FFA500',
      crowdPercentage: 52,
      dataSource: 'time-based',
      confidence: 75
    }
  }
  
  // Evening Peak (5:00 PM - 7:30 PM)
  if (timeInMinutes >= 1020 && timeInMinutes < 1170) { // 5:00 PM - 7:30 PM
    // Super peak (5:45 PM - 6:45 PM)
    if (timeInMinutes >= 1065 && timeInMinutes < 1125) {
      return {
        level: 'very-high',
        label: '傍晚繁忙高峰',
        labelEn: 'Evening Rush Peak',
        description: '非常擠迫，下班人潮',
        descriptionEn: 'Very crowded, rush hour traffic',
        icon: '🔴',
        color: '#ef4444',
        crowdPercentage: 92,
        dataSource: 'time-based',
        confidence: 85
      }
    }
    
    return {
      level: 'high',
      label: '傍晚繁忙時段',
      labelEn: 'Evening Peak Hours',
      description: '擠迫，下班時間',
      descriptionEn: 'Crowded, commute time',
      icon: '🟠',
      color: '#f97316',
      crowdPercentage: 76,
      dataSource: 'time-based',
      confidence: 80
    }
  }
  
  // Late evening (after 9:00 PM)
  if (timeInMinutes >= 1260) { // After 9:00 PM
    return {
      level: 'low',
      label: '晚間非繁忙',
      labelEn: 'Late Evening Off-Peak',
      description: '人流稀少',
      descriptionEn: 'Light crowds',
      icon: '🟢',
      color: '#22c55e',
      crowdPercentage: 22,
      dataSource: 'time-based',
      confidence: 75
    }
  }
  
  // Regular weekday off-peak
  return {
    level: 'low',
    label: '非繁忙時段',
    labelEn: 'Off-Peak Hours',
    description: '正常人流',
    descriptionEn: 'Normal traffic',
    icon: '🟢',
    color: '#22c55e',
    crowdPercentage: 38,
    dataSource: 'time-based',
    confidence: 70
  }
}

/**
 * Get station-specific peak status
 * Some stations have different patterns (CBD, Shopping, Residential)
 */
export function getStationPeakStatus(stationCode: string): PeakHourStatus {
  const baseStatus = getCurrentPeakStatus()
  const now = new Date()
  const isWeekend = now.getDay() === 0 || now.getDay() === 6
  
  // Station type adjustments
  const stationAdjustments: Record<string, {
    type: 'cbd' | 'shopping' | 'residential' | 'tourist' | 'transport-hub'
    weekdayMultiplier: number
    weekendMultiplier: number
  }> = {
    // Central Business District - Very busy weekdays, quieter weekends
    'CEN': { type: 'cbd', weekdayMultiplier: 1.15, weekendMultiplier: 0.6 },
    'ADM': { type: 'cbd', weekdayMultiplier: 1.12, weekendMultiplier: 0.65 },
    'HKG': { type: 'cbd', weekdayMultiplier: 1.18, weekendMultiplier: 0.55 },
    'SHW': { type: 'cbd', weekdayMultiplier: 1.1, weekendMultiplier: 0.7 },
    
    // Shopping Districts - Busy both weekdays and weekends
    'TST': { type: 'shopping', weekdayMultiplier: 1.05, weekendMultiplier: 1.25 },
    'MKK': { type: 'shopping', weekdayMultiplier: 1.08, weekendMultiplier: 1.3 },
    'CWB': { type: 'shopping', weekdayMultiplier: 1.12, weekendMultiplier: 1.35 },
    'SSP': { type: 'shopping', weekdayMultiplier: 1.05, weekendMultiplier: 1.2 },
    
    // Residential Areas - Peak during commute hours only
    'TKO': { type: 'residential', weekdayMultiplier: 0.95, weekendMultiplier: 0.8 },
    'TIK': { type: 'residential', weekdayMultiplier: 0.95, weekendMultiplier: 0.75 },
    'TKW': { type: 'residential', weekdayMultiplier: 0.92, weekendMultiplier: 0.7 },
    
    // Tourist Areas - Busier on weekends
    'DIS': { type: 'tourist', weekdayMultiplier: 0.7, weekendMultiplier: 1.4 },
    'OCH': { type: 'tourist', weekdayMultiplier: 0.85, weekendMultiplier: 1.25 },
    
    // Transport Hubs - Consistent traffic
    'KOT': { type: 'transport-hub', weekdayMultiplier: 1.08, weekendMultiplier: 0.95 },
  }
  
  const adjustment = stationAdjustments[stationCode]
  if (!adjustment) {
    return baseStatus // No specific adjustment
  }
  
  const multiplier = isWeekend ? adjustment.weekendMultiplier : adjustment.weekdayMultiplier
  
  // Apply multiplier
  let adjustedCrowd = Math.round(baseStatus.crowdPercentage * multiplier)
  adjustedCrowd = Math.max(10, Math.min(98, adjustedCrowd)) // Clamp between 10-98
  
  // Adjust level based on new percentage
  let adjustedLevel = baseStatus.level
  if (adjustedCrowd >= 85) adjustedLevel = 'very-high'
  else if (adjustedCrowd >= 65) adjustedLevel = 'high'
  else if (adjustedCrowd >= 45) adjustedLevel = 'medium'
  else adjustedLevel = 'low'
  
  return {
    ...baseStatus,
    level: adjustedLevel,
    crowdPercentage: adjustedCrowd
  }
}

/**
 * Get next peak hours
 */
export function getNextPeakHours(): { start: string; end: string; label: string } | null {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
  
  if (!isWeekday) {
    return null // No strict peak on weekends
  }
  
  // Before morning peak
  if (hour < 7) {
    return {
      start: '07:00',
      end: '09:30',
      label: '早上繁忙時段 Morning Peak'
    }
  }
  
  // Between morning and evening peak
  if (hour >= 10 && hour < 17) {
    return {
      start: '17:00',
      end: '19:30',
      label: '傍晚繁忙時段 Evening Peak'
    }
  }
  
  // After evening peak - show tomorrow's morning peak
  if (hour >= 20) {
    return {
      start: '07:00 (明天 Tomorrow)',
      end: '09:30',
      label: '早上繁忙時段 Morning Peak'
    }
  }
  
  return null
}
