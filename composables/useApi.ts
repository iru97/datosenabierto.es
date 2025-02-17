import { ref } from 'vue'
import type { UseFetchOptions } from 'nuxt/app'

export function useApi<T>() {
  const config = useRuntimeConfig()
  
  const fetchWithRetry = async (
    url: string,
    options: UseFetchOptions<T> = {},
    retries = 3,
    backoff = 300
  ) => {
    try {
      const { data, error } = await useFetch<T>(url, {
        baseURL: config.public.apiBase,
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers
        }
      })

      if (error.value) {
        throw error.value
      }

      return { data, error: null }
    } catch (err) {
      if (retries > 0) {
        console.warn(`Retrying request to ${url}, ${retries} attempts left`)
        await new Promise(resolve => setTimeout(resolve, backoff))
        return fetchWithRetry(url, options, retries - 1, backoff * 2)
      }
      
      return { data: null, error: err }
    }
  }

  return {
    fetchWithRetry
  }
}