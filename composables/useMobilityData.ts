import { ref, computed } from 'vue'
import type { MobilityData } from '~/types'

export function useMobilityData() {
  const { data, pending, error, refresh } = useFetch<MobilityData>('/api/mobility')

  const isLoading = computed(() => pending.value)
  const isError = computed(() => !!error.value)

  return {
    data,
    isLoading,
    isError,
    refresh
  }
}