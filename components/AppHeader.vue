<template>
  <nav class="bg-white shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex">
          <NuxtLink to="/" class="flex items-center">
            <BarChart2 class="h-8 w-8 text-primary-600 mr-2" />
            <span class="text-xl font-bold text-gray-800">DatosEnAbierto</span>
          </NuxtLink>
          <div class="hidden md:ml-6 md:flex md:space-x-8">
            <NuxtLink
              v-for="category in categories"
              :key="category.path"
              :to="category.path"
              class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-primary-500 transition-all"
            >
              <component :is="category.icon" class="w-4 h-4 mr-2" />
              {{ category.name }}
            </NuxtLink>
          </div>
        </div>
        
        <div class="flex items-center">
          <div class="relative hidden md:block">
            <input
              type="text"
              placeholder="Buscar datos..."
              v-model="searchQuery"
              class="w-64 px-4 py-2 pl-10 pr-4 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BarChart2, Activity, Bus, TreePine, GraduationCap, Search } from 'lucide-vue-next'

const searchQuery = ref('')

const categories = [
  { name: 'Transparencia', icon: BarChart2, path: '/transparencia' },
  { name: 'Salud', icon: Activity, path: '/salud' },
  { name: 'Movilidad', icon: Bus, path: '/movilidad' },
  { name: 'Medio Ambiente', icon: TreePine, path: '/ambiente' },
  { name: 'Educación', icon: GraduationCap, path: '/educacion' }
]
</script>