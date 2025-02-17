<template>
  <div class="flex flex-col items-center justify-center p-8 text-center">
    <AlertOctagon class="h-12 w-12 text-red-500 mb-4" />
    <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-gray-500 max-w-sm mb-4">{{ message }}</p>
    <button
      v-if="onRetry"
      @click="onRetry"
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
    >
      Reintentar
    </button>
  </div>
</template>

<script setup lang="ts">
import { AlertOctagon } from 'lucide-vue-next'

defineProps<{
  title?: string
  message?: string
  onRetry?: () => void
}>()
</script>