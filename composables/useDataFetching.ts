import { ref, computed } from 'vue'
import { useErrorHandler } from './useErrorHandler'

export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  options: {
    immediate?: boolean
    transform?: (data: T) => any
  } = {}
) {
  const { immediate = true, transform } = options
  const data = ref<T | null>(null)
  const { error, isLoading, handleError, clearError } = useErrorHandler()

  const fetch = async () => {
    if (isLoading.value) return

    try {
      isLoading.value = true
      clearError()
      const result = await fetchFn()
      data.value = transform ? transform(result) : result
    } catch (e) {
      handleError(e)
    } finally {
      isLoading.value = false
    }
  }

  if (immediate) {
    fetch()
  }

  return {
    data: computed(() => data.value),
    error: computed(() => error.value),
    isLoading: computed(() => isLoading.value),
    fetch,
    refresh: fetch
  }
}