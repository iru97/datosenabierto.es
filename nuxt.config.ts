export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  modules: ["@nuxtjs/tailwindcss"],
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
