import round from 'lodash/round'

export const roundDecimal = (value: number) => {
  return round(value, 2)
}

export const roundBy = (value: number, step: number) => {
  return Math.round(value / step) * step
}

export const clamp = (value: number, max: number, min: number) => {
  return Math.max(min, Math.min(value, max))
}
