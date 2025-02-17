import { ref } from 'vue'

export function useErrorHandler() {
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  const handleError = (e: unknown) => {
    if (e instanceof Error) {
      error.value = e
    } else if (typeof e === 'string') {
      error.value = new Error(e)
    } else {
      error.value = new Error('Ha ocurrido un error desconocido')
    }
    console.error('Error:', e)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    error,
    isLoading,
    handleError,
    clearError
  }
}