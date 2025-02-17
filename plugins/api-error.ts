import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (error) => {
    console.error('Global error handler:', error)
    
    // Handle API errors
    if (error.statusCode === 429) {
      // Rate limit exceeded
      console.warn('Rate limit exceeded, implementing backoff...')
    }
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
    }
  })

  // Add global fetch interceptor
  const originalFetch = globalThis.$fetch
  globalThis.$fetch = async (request, opts) => {
    try {
      return await originalFetch(request, {
        ...opts,
        onRequest({ options }) {
          // Add common headers
          options.headers = {
            ...options.headers,
            'Accept': 'application/json',
            'Accept-Language': 'es'
          }
        },
        onRequestError({ error }) {
          console.error('Request error:', error)
          throw error
        },
        onResponse({ response }) {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        },
        onResponseError({ error }) {
          console.error('Response error:', error)
          throw error
        }
      })
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  }
})