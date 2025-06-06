export interface TrainArrival {
    readonly time: string
    readonly dest: string
    readonly plat?: string
    readonly route?: string  // For LRT route number
    readonly train_length?: number  // For LRT train length
}

export interface StationData {
    readonly UP: readonly TrainArrival[]
    readonly DOWN: readonly TrainArrival[]
}

export interface StationConfig {
    readonly zh: string
    readonly en: string
}

export interface LineConfig {
    readonly zh: string
    readonly en: string
    readonly color: string
    readonly up_terminus: string
    readonly down_terminus: string
    readonly stations: Readonly<Record<string, StationConfig>>
}

export type MtrLineCode = 'AEL' | 'TCL' | 'TML' | 'TKL' | 'EAL' | 'SIL' | 'TWL' | 'ISL' | 'KTL' | 'LRT'
export type Direction = 'UP' | 'DOWN'
export type Language = 'zh' | 'en'
export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'

export interface EtaDisplayProps {
    time: string
    urgency: 'immediate' | 'soon' | 'normal'
}

export interface ApiError {
    readonly message: string
    readonly code?: number
    readonly timestamp: number
}
