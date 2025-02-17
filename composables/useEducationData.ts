import { ref, computed } from 'vue'
import type { EducationData } from '~/types'

export function useEducationData() {
  const { data, pending, error, refresh } = useFetch<EducationData>('/api/education')

  const isLoading = computed(() => pending.value)
  const isError = computed(() => !!error.value)

  return {
    data,
    isLoading,
    isError,
    refresh
  }
}