export interface AppTextLayer {
  id: string
  fontSize: {
    value: number
  }
  lineHeight: {
    value: number
    default: boolean
  }
}

export interface AppSettings {
  baseFontSize: number
  scaleFactor: number
  lineHeightUnit: number
  autoNormalizes: boolean
}

export type AppSettingsArgs = Partial<AppSettings>
