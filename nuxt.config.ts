export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],

  app: {
    head: {
      title: "DatosEnAbierto - Visualización de Datos Públicos",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Plataforma de visualización de datos públicos que facilita el acceso a información compleja de manera clara y comprensible.",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  runtimeConfig: {
    // Private keys that are exposed to the server
    apiSecret: process.env.NUXT_API_SECRET || "default_secret",

    // Public keys that are exposed to the client
    public: {
      apiBase: "/api",
      apiUrl: process.env.NUXT_PUBLIC_API_URL || "http://localhost:3000",
      datosGobApiUrl:
        process.env.NUXT_PUBLIC_DATOS_GOB_API_URL ||
        "http://localhost:3000/api/mock/datos",
      contratacionApiUrl:
        process.env.NUXT_PUBLIC_CONTRATACION_API_URL ||
        "http://localhost:3000/api/mock/contratacion",
      transparencyApiUrl:
        process.env.NUXT_PUBLIC_TRANSPARENCY_API_URL ||
        "http://localhost:3000/api/mock/transparency",
      backupApiUrl:
        process.env.NUXT_PUBLIC_BACKUP_API_URL ||
        "http://localhost:3000/api/mock/backup",
    },
  },

  nitro: {
    preset: "netlify",
    routeRules: {
      "/api/**": {
        cors: true,
        headers: { "access-control-allow-methods": "GET" },
      },
      "/_nuxt/**": {
        headers: { "cache-control": "public,max-age=31536000,immutable" },
      },
    },
    output: {
      publicDir: ".output/public",
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  build: {
    transpile: ["chart.js", "vue-chartjs", "lucide-vue-next"],
  },

  vite: {
    optimizeDeps: {
      include: ["chart.js", "vue-chartjs", "lucide-vue-next"],
    },
    build: {
      rollupOptions: {
        external: ["chart.js"],
      },
    },
  },

  ssr: true,

  experimental: {
    payloadExtraction: false,
  },
});
