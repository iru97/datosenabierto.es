import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  // Global fetch interceptor
  const originalFetch = globalThis.$fetch;
  globalThis.$fetch = async (request, opts) => {
    try {
      // Add base URL if the request is to our API
      if (typeof request === "string" && request.startsWith("/api/")) {
        request = `${config.public.apiUrl}${request}`;
      }

      return await originalFetch(request, {
        ...opts,
        headers: {
          Accept: "application/json",
          "Accept-Language": "es",
          ...opts?.headers,
        },
        onRequest({ options }) {
          // Add any request interceptors
          console.log(`[API] Request to ${request}`);
        },
        onRequestError({ error }) {
          console.error(`[API] Request error for ${request}:`, error);
          throw error;
        },
        onResponse({ response }) {
          // Add any response interceptors
          console.log(`[API] Response from ${request}: ${response.status}`);
        },
        onResponseError({ error }) {
          console.error(`[API] Response error for ${request}:`, error);
          throw error;
        },
      });
    } catch (error) {
      console.error(`[API] Error fetching ${request}:`, error);
      throw error;
    }
  };
});
