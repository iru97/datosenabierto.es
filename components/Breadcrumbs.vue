<template>
  <nav class="flex items-center gap-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
    <NuxtLink
      to="/"
      class="hover:text-blue-600 transition-colors flex items-center gap-1"
    >
      <HomeIcon class="h-4 w-4" />
      <span>Inicio</span>
    </NuxtLink>

    <template v-for="(crumb, index) in breadcrumbs" :key="index">
      <ChevronRightIcon class="h-4 w-4 text-gray-400" />

      <NuxtLink
        v-if="crumb.to && index < breadcrumbs.length - 1"
        :to="crumb.to"
        class="hover:text-blue-600 transition-colors"
      >
        {{ crumb.label }}
      </NuxtLink>

      <span
        v-else
        class="font-medium text-gray-900"
      >
        {{ crumb.label }}
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { HomeIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface Breadcrumb {
  label: string
  to?: string
}

interface Props {
  breadcrumbs?: Breadcrumb[]
}

withDefaults(defineProps<Props>(), {
  breadcrumbs: () => []
})
</script>
