import { ref, computed } from 'vue'
import type { HealthData } from '~/types'

export function useHealthData() {
  const { data, pending, error, refresh } = useFetch<HealthData>('/api/health')

  const isLoading = computed(() => pending.value)
  const isError = computed(() => !!error.value)

  return {
    data,
    isLoading,
    isError,
    refresh
  }
}