import { ref, computed } from 'vue'

export function useChartData(timeRange: Ref<string>) {
  const generateTimeLabels = computed(() => {
    const now = new Date()
    const locale = 'es-ES'

    switch (timeRange.value) {
      case 'year':
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date(now)
          date.setMonth(now.getMonth() - (11 - i))
          return date.toLocaleDateString(locale, { month: 'long' })
        })
      case 'quarter':
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date(now)
          date.setDate(now.getDate() - (11 - i) * 7)
          return date.toLocaleDateString(locale, { day: '2-digit', month: 'short' })
        })
      case 'month':
        return Array.from({ length: 30 }, (_, i) => {
          const date = new Date(now)
          date.setDate(now.getDate() - (29 - i))
          return date.toLocaleDateString(locale, { day: '2-digit', month: 'short' })
        })
      default:
        return []
    }
  })

  const generateRandomData = (length: number, options: {
    min?: number
    max?: number
    trend?: 'up' | 'down' | 'stable'
    volatility?: number
    startValue?: number
  } = {}) => {
    const {
      min = 1000,
      max = 10000,
      trend = 'up',
      volatility = 0.05,
      startValue = 5000
    } = options

    let value = startValue
    const trendFactor = trend === 'up' ? 1.02 : trend === 'down' ? 0.98 : 1
    
    return Array.from({ length }, () => {
      const randomVariation = 1 + (Math.random() - 0.5) * 2 * volatility
      value = Math.min(max, Math.max(min, value * trendFactor * randomVariation))
      return Math.round(value)
    })
  }

  const generateTrendingData = (length: number, trend: 'up' | 'down' | 'stable' = 'up') => {
    return generateRandomData(length, {
      min: 1000,
      max: 100000,
      trend,
      volatility: 0.03,
      startValue: 50000
    })
  }

  return {
    generateTimeLabels,
    generateRandomData,
    generateTrendingData
  }
}