<template>
  <div class="bg-gray-50 rounded-lg p-4 mb-6">
    <h3 class="text-lg font-semibold mb-2 flex items-center">
      <component :is="icon" class="h-5 w-5 mr-2" :class="iconColor" />
      {{ title }}
    </h3>
    <p class="text-gray-600 text-sm">{{ description }}</p>
    <div v-if="details" class="mt-2">
      <ul class="list-disc list-inside text-sm text-gray-500 space-y-1">
        <li v-for="detail in details" :key="detail">{{ detail }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  title: string
  description: string
  details?: string[]
  iconColor?: string
}>()
</script>