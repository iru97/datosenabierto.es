import { ref, computed } from 'vue'
import type { EducationData } from '~/types'
import { useIntervalFn } from '@vueuse/core'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function useEducationData() {
  const { data, pending, error, refresh } = useFetch<EducationData>('/api/education')

  const isLoading = computed(() => pending.value)
  const isError = computed(() => !!error.value)

  // Computed statistics
  const stats = computed(() => {
    if (!data.value) return null
    
    const totalInstitutions = data.value.stats.publicSchools + 
                            data.value.stats.privateSchools + 
                            data.value.stats.universities + 
                            data.value.stats.vocationalCenters

    const distribution = [
      { label: 'Centros Públicos', value: data.value.stats.publicSchools },
      { label: 'Centros Privados', value: data.value.stats.privateSchools },
      { label: 'Universidades', value: data.value.stats.universities },
      { label: 'Centros de FP', value: data.value.stats.vocationalCenters }
    ]

    const lastUpdateFormatted = data.value.lastUpdate ? 
      format(new Date(data.value.lastUpdate), 'PPP', { locale: es }) :
      'No disponible'

    const percentages = {
      public: (data.value.stats.publicSchools / totalInstitutions) * 100,
      private: (data.value.stats.privateSchools / totalInstitutions) * 100,
      universities: (data.value.stats.universities / totalInstitutions) * 100,
      vocational: (data.value.stats.vocationalCenters / totalInstitutions) * 100
    }

    return {
      totalInstitutions,
      distribution,
      lastUpdateFormatted,
      percentages
    }
  })

  // Auto-refresh data every 5 minutes
  if (process.client) {
    useIntervalFn(() => {
      refresh()
    }, 5 * 60 * 1000)
  }

  // Error handling with retry
  const retryCount = ref(0)
  const maxRetries = 3

  const handleRetry = async () => {
    if (retryCount.value >= maxRetries) {
      console.error('Max retry attempts reached')
      return
    }

    retryCount.value++
    try {
      await refresh()
      retryCount.value = 0 // Reset on success
    } catch (err) {
      console.error(`Retry attempt ${retryCount.value} failed:`, err)
    }
  }

  return {
    data,
    stats,
    isLoading,
    isError,
    refresh,
    handleRetry,
    retryCount,
    maxRetries
  }
}