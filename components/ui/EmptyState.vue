<template>
  <div class="flex flex-col items-center justify-center p-8 text-center">
    <div class="bg-gray-100 rounded-full p-4 mb-4">
      <component :is="icon || AlertCircle" class="h-8 w-8 text-gray-400" />
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-gray-500 max-w-sm">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import type { Component } from 'vue'

defineProps<{
  title: string
  message: string
  icon?: Component
}>()
</script>