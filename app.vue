<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center gap-2 text-blue-700">
          <NewspaperIcon class="h-6 w-6" />
          <h1 class="text-xl font-bold">Boletín Oficial del Estado</h1>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
import { NewspaperIcon } from '@heroicons/vue/24/outline'
</script>