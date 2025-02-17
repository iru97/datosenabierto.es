<template>
  <div class="flex items-center justify-center p-8">
    <Loader2 class="h-8 w-8 text-primary-600 animate-spin" />
    <span class="ml-3 text-lg text-gray-600">{{ message || 'Cargando datos...' }}</span>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

defineProps<{
  message?: string
}>()
</script>