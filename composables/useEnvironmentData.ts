import { ref, computed } from 'vue'
import type { EnvironmentData } from '~/types'

export function useEnvironmentData() {
  const { data, pending, error, refresh } = useFetch<EnvironmentData>('/api/environment')

  const isLoading = computed(() => pending.value)
  const isError = computed(() => !!error.value)

  return {
    data,
    isLoading,
    isError,
    refresh
  }
}