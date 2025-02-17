<template>
  <div class="relative inline-block">
    <div
      class="cursor-help"
      @mouseenter="show = true"
      @mouseleave="show = false"
    >
      <InfoIcon class="h-4 w-4 text-gray-400" />
    </div>
    <div
      v-if="show"
      class="absolute z-50 w-64 p-2 mt-1 text-sm text-gray-600 bg-white rounded-lg shadow-lg border border-gray-200"
      :class="position === 'right' ? 'left-full ml-2' : 'top-full'"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Info as InfoIcon } from 'lucide-vue-next'

defineProps<{
  position?: 'top' | 'right'
}>()

const show = ref(false)
</script>