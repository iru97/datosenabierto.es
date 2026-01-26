export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  modules: ["@nuxtjs/tailwindcss"],

  // Runtime config - Variables de entorno disponibles en cliente y servidor
  runtimeConfig: {
    // Private keys - Solo disponibles en server-side
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,

    // Public keys - Disponibles en cliente y servidor
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },

  app: {
    head: {
      title: "BOE Viewer - Consulta el Boletín Oficial del Estado",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Consulta el Boletín Oficial del Estado (BOE) de forma interactiva y visual. Accede a sumarios, documentos oficiales y análisis estadísticos.",
        },
        { name: "format-detection", content: "telephone=no" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  nitro: {
    preset: "netlify",
    output: {
      dir: ".output",
      serverDir: ".output/server",
      publicDir: ".output/public",
    },
    rollupConfig: {
      output: {
        format: "esm", // Fuerza la salida en ESM
      },
    },
  },
  ssr: true,
});
