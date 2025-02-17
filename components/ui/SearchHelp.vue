<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-lg font-semibold mb-4">Ayuda para la búsqueda</h3>
    
    <div class="space-y-4">
      <!-- Popular Suggestions -->
      <div>
        <h4 class="font-medium text-gray-900 mb-2">Sugerencias populares</h4>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            @click="$emit('select', suggestion)"
            class="px-3 py-1 bg-gray-100 text-sm text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            :aria-label="`Buscar ${suggestion}`"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- Search Tips -->
      <div>
        <h4 class="font-medium text-gray-900 mb-2">Consejos de búsqueda</h4>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start">
            <Search class="h-4 w-4 mt-1 mr-2 text-gray-400" />
            <span>
              Utiliza términos específicos para obtener mejores resultados
              <br>
              <span class="text-xs text-gray-500">
                Ejemplo: "hospitales Madrid" en lugar de solo "hospitales"
              </span>
            </span>
          </li>
          <li class="flex items-start">
            <Calendar class="h-4 w-4 mt-1 mr-2 text-gray-400" />
            <span>
              Incluye años o fechas para datos históricos
              <br>
              <span class="text-xs text-gray-500">
                Ejemplo: "presupuesto educación 2024"
              </span>
            </span>
          </li>
          <li class="flex items-start">
            <Map class="h-4 w-4 mt-1 mr-2 text-gray-400" />
            <span>
              Especifica ubicaciones para datos locales
              <br>
              <span class="text-xs text-gray-500">
                Ejemplo: "calidad aire Barcelona"
              </span>
            </span>
          </li>
        </ul>
      </div>

      <!-- Available Categories -->
      <div>
        <h4 class="font-medium text-gray-900 mb-2">Categorías disponibles</h4>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="(items, category) in categories" :key="category">
            <h5 class="text-sm font-medium text-gray-700 mb-1">{{ category }}</h5>
            <ul class="text-sm text-gray-600 space-y-1">
              <li 
                v-for="item in items" 
                :key="item.id"
                class="hover:text-gray-900 cursor-pointer transition-colors"
                :title="item.description"
              >
                {{ item.title }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Calendar, Map } from 'lucide-vue-next'

defineProps<{
  suggestions: string[]
  categories: Record<string, Array<{ id: number; title: string; description: string }>>
}>()

defineEmits<{
  (e: 'select', suggestion: string): void
}>()
</script>