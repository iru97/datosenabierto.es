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
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
      datosGobApiUrl: process.env.NUXT_PUBLIC_DATOS_GOB_API_URL,
      contratacionApiUrl: process.env.NUXT_PUBLIC_CONTRATACION_API_URL,
      transparencyApiUrl: process.env.NUXT_PUBLIC_TRANSPARENCY_API_URL,
    },
  },

  nitro: {
    preset: "netlify",
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  build: {
    transpile: ["chart.js", "vue-chartjs", "lucide-vue-next"],
  },

  ssr: true,

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
});
