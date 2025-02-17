<template>
  <div>
    <NuxtLayout>
      <NuxtLoadingIndicator color="#3b82f6" />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | DatosEnAbierto` : 'DatosEnAbierto'
  },
  htmlAttrs: {
    lang: 'es'
  }
})
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

.bg-grid {
  background-size: 40px 40px;
  background-image: 
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

html {
  scroll-behavior: smooth;
}

body {
  @apply text-gray-900 antialiased;
}

/* Transiciones de página */
.page-enter-active,
.page-leave-active {
  transition: all 0.15s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Loading indicator */
.nuxt-loading-indicator {
  @apply bg-primary-500;
}
</style>