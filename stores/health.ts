import { defineStore } from 'pinia'
import type { HealthData } from '~/types'

export const useHealthStore = defineStore('health', {
  state: () => ({
    data: null as HealthData | null,
    loading: false,
    error: null as Error | null,
    timeRange: 'year' as 'year' | 'quarter' | 'month'
  }),

  actions: {
    async fetchData() {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await useFetch<HealthData>('/api/health')
        
        if (error.value) throw error.value
        this.data = data.value
      } catch (error) {
        this.error = error as Error
        console.error('Error fetching health data:', error)
      } finally {
        this.loading = false
      }
    },

    setTimeRange(range: typeof this.timeRange) {
      this.timeRange = range
    }
  }
})