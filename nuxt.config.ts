export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxtjs/robots",
    "@nuxtjs/sitemap",
    "@vueuse/nuxt",
  ],

  app: {
    head: {
      htmlAttrs: {
        lang: "es",
      },
      title: "DatosEnAbierto - Visualización de Datos Públicos",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Plataforma líder en visualización de datos públicos. Accede a información sobre transparencia, salud, movilidad, medio ambiente y educación de forma clara y comprensible.",
        },
        { name: "theme-color", content: "#3b82f6" },
        { name: "format-detection", content: "telephone=no" },
        { property: "og:type", content: "website" },
        {
          property: "og:title",
          content: "DatosEnAbierto - Visualización de Datos Públicos",
        },
        {
          property: "og:description",
          content:
            "Accede a datos públicos de forma clara y comprensible. Transparencia, salud, movilidad, medio ambiente y educación.",
        },
        { property: "og:image", content: "/og-image.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "DatosEnAbierto - Datos Públicos Visualizados",
        },
        {
          name: "twitter:description",
          content:
            "Explora datos públicos de forma interactiva y comprensible.",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "canonical", href: "https://datosenabierto.es" },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
      datosGobApiUrl: process.env.NUXT_PUBLIC_DATOS_GOB_API_URL,
      contratacionApiUrl: process.env.NUXT_PUBLIC_CONTRATACION_API_URL,
      transparencyApiUrl: process.env.NUXT_PUBLIC_TRANSPARENCY_API_URL,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://datosenabierto.es",
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
  },
  ssr: true,
  robots: {
    UserAgent: "*",
    Allow: "/",
    Sitemap: "https://datosenabierto.es/sitemap.xml",
  },

  sitemap: {
    hostname: "https://datosenabierto.es",
    gzip: true,
    exclude: ["/404", "/server-error"],
    defaults: {
      changefreq: "daily",
      priority: 0.8,
      lastmod: new Date().toISOString(),
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
      include: [
        "chart.js",
        "vue-chartjs",
        "lucide-vue-next",
        "date-fns",
        "numeral",
      ],
    },
    build: {
      rollupOptions: {
        external: ["chart.js"],
      },
    },
  },
});
