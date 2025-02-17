<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center mb-2">
          <p class="text-sm text-gray-500">{{ title }}</p>
          <InfoTooltip class="ml-1">
            {{ tooltip }}
          </InfoTooltip>
        </div>
        <p class="text-2xl font-bold" :class="valueColor">
          {{ formattedValue }}
        </p>
        <p v-if="trend" class="text-sm mt-1" :class="trendColor">
          <component :is="trendIcon" class="h-4 w-4 inline mr-1" />
          {{ trend }}
        </p>
      </div>
      <div :class="`bg-${color}-100 p-3 rounded-full`">
        <component :is="icon" :class="`h-6 w-6 text-${color}-600`" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'
import InfoTooltip from './InfoTooltip.vue'

const props = defineProps<{
  title: string
  value: number | string
  tooltip: string
  icon: Component
  color: string
  trend?: string
  trendDirection?: 'up' | 'down'
  format?: 'number' | 'currency' | 'percentage'
}>()

const formattedValue = computed(() => {
  if (props.format === 'currency') {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(Number(props.value))
  }
  if (props.format === 'percentage') {
    return `${props.value}%`
  }
  if (props.format === 'number') {
    return new Intl.NumberFormat('es-ES').format(Number(props.value))
  }
  return props.value
})

const valueColor = computed(() => {
  if (props.trendDirection === 'up') return 'text-green-600'
  if (props.trendDirection === 'down') return 'text-red-600'
  return 'text-gray-900'
})

const trendColor = computed(() => {
  if (props.trendDirection === 'up') return 'text-green-600'
  if (props.trendDirection === 'down') return 'text-red-600'
  return 'text-gray-500'
})

const trendIcon = computed(() => {
  return props.trendDirection === 'up' ? ArrowUpRight : ArrowDownRight
})
</script>