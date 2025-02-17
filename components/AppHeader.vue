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
              :aria-label="`Ver datos de ${category.name}`"
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
              @input="handleSearch"
              @keydown.enter="handleEnterKey"
              @focus="showResults = true"
              @blur="handleBlur"
              class="w-64 px-4 py-2 pl-10 pr-4 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label="Buscar en DatosEnAbierto"
            />
            <Search 
              class="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
            
            <!-- Search Results -->
            <div 
              v-if="showResults" 
              class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-50"
              role="listbox"
            >
              <div v-if="isSearching" class="p-4 text-center text-gray-500">
                <Loader2 class="h-5 w-5 animate-spin mx-auto mb-2" />
                Buscando...
              </div>
              
              <div v-else-if="searchQuery.length < 2" class="p-4">
                <UiSearchHelp 
                  :suggestions="searchSuggestions"
                  :categories="searchCategories"
                  @select="handleSuggestionSelect"
                />
              </div>
              
              <div v-else-if="filteredResults.length === 0" class="p-4 text-center text-gray-500">
                <FolderSearch class="h-6 w-6 mx-auto mb-2" />
                No se encontraron resultados para "{{ searchQuery }}"
                <p class="text-sm mt-2">
                  Prueba con otros términos o consulta las sugerencias de búsqueda.
                </p>
              </div>
              
              <div v-else class="divide-y divide-gray-100">
                <div v-for="(group, category) in groupedResults" :key="category" class="p-2">
                  <h3 class="text-sm font-medium text-gray-500 px-3 py-2">{{ category }}</h3>
                  <div class="space-y-1">
                    <button
                      v-for="result in group"
                      :key="result.id"
                      @mousedown="handleResultClick(result)"
                      class="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-3"
                      role="option"
                    >
                      <component :is="result.icon" class="h-5 w-5 text-gray-400" />
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ result.title }}</p>
                        <p class="text-xs text-gray-500">{{ result.description }}</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  BarChart2, Activity, Bus, TreePine, GraduationCap, 
  Search, Loader2, FolderSearch 
} from 'lucide-vue-next'

const categories = [
  { name: 'Transparencia', icon: BarChart2, path: '/transparencia' },
  { name: 'Salud', icon: Activity, path: '/salud' },
  { name: 'Movilidad', icon: Bus, path: '/movilidad' },
  { name: 'Medio Ambiente', icon: TreePine, path: '/ambiente' },
  { name: 'Educación', icon: GraduationCap, path: '/educacion' }
]

const {
  searchQuery,
  showResults,
  isSearching,
  searchSuggestions,
  searchCategories,
  handleSearch,
  handleBlur,
  handleEnterKey,
  handleResultClick,
  handleSuggestionSelect
} = useSearch()

// Mock search results for demonstration
const searchResults = ref([
  {
    id: 1,
    category: 'Transparencia',
    title: 'Presupuesto Sanidad 2024',
    description: 'Distribución del presupuesto sanitario',
    icon: BarChart2,
    path: '/transparencia'
  },
  {
    id: 2,
    category: 'Salud',
    title: 'Hospitales Públicos',
    description: 'Red de hospitales del sistema nacional de salud',
    icon: Activity,
    path: '/salud'
  },
  {
    id: 3,
    category: 'Movilidad',
    title: 'Transporte Público',
    description: 'Datos de uso y rutas de transporte',
    icon: Bus,
    path: '/movilidad'
  }
])

const filteredResults = computed(() => {
  if (searchQuery.value.length < 2) return []
  
  const query = searchQuery.value.toLowerCase()
  return searchResults.value.filter(result => 
    result.title.toLowerCase().includes(query) ||
    result.description.toLowerCase().includes(query) ||
    result.category.toLowerCase().includes(query)
  )
})

const groupedResults = computed(() => {
  return filteredResults.value.reduce((groups, result) => {
    if (!groups[result.category]) {
      groups[result.category] = []
    }
    groups[result.category].push(result)
    return groups
  }, {} as Record<string, typeof searchResults.value>)
})
</script>