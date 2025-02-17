<template>
  <main>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-800/90" />
        <div class="absolute inset-0 bg-grid" />
      </div>
      <div class="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
        <div class="text-center">
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Datos públicos al alcance de todos
          </h1>
          <p class="mt-6 text-xl max-w-2xl mx-auto mb-8">
            Descubre, analiza y comprende la información pública de manera sencilla y visual
          </p>
          <div class="max-w-xl mx-auto">
            <div class="relative mb-8">
              <input
                type="text"
                placeholder="Buscar datos, categorías o informes..."
                v-model="searchQuery"
                @input="handleSearch"
                @keydown.enter="handleEnterKey"
                @focus="showResults = true"
                @blur="handleBlur"
                class="w-full px-6 py-4 rounded-full text-gray-900 bg-white/95 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search class="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              
              <!-- Resultados de búsqueda -->
              <div 
                v-if="showResults" 
                class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-50"
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
      
      <!-- Sugerencias de búsqueda -->
      <div class="relative max-w-xl mx-auto mt-4">
        <div class="text-sm text-blue-100 text-center mb-2">
          Prueba a buscar:
          <span class="inline-flex gap-2 mt-1">
            <button 
              v-for="suggestion in searchSuggestions.slice(0, 4)" 
              :key="suggestion"
              @click="handleSuggestionSelect(suggestion)"
              class="px-2 py-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              {{ suggestion }}
            </button>
          </span>
        </div>
      </div>
    </section>

    <!-- Cómo usar la plataforma -->
    <section class="max-w-7xl mx-auto px-4 py-12 bg-white">
      <h2 class="text-2xl font-bold text-center mb-8">
        Cómo usar DatosEnAbierto
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <Search class="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">Explora Datos</h3>
          <p class="text-gray-600">
            Usa la barra de búsqueda para encontrar datos específicos o navega por categorías.
            Puedes buscar por tema, región o tipo de dato.
          </p>
        </div>
        
        <div class="text-center">
          <Filter class="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">Filtra y Analiza</h3>
          <p class="text-gray-600">
            Refina los resultados usando filtros. Compara datos entre períodos
            y descubre tendencias con nuestras herramientas de análisis.
          </p>
        </div>
        
        <div class="text-center">
          <Download class="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">Descarga y Comparte</h3>
          <p class="text-gray-600">
            Exporta los datos en múltiples formatos para su análisis posterior.
            Comparte visualizaciones y hallazgos fácilmente.
          </p>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section id="explorar" class="max-w-7xl mx-auto px-4 py-16">
      <h2 class="text-3xl font-bold text-center mb-4">
        Explora nuestras categorías de datos
      </h2>
      <p class="text-center text-gray-600 max-w-2xl mx-auto mb-12">
        Accede a información detallada y actualizada sobre diferentes áreas de la administración pública.
        Cada categoría ofrece datos verificados de fuentes oficiales.
      </p>
      
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <Loader2 class="h-8 w-8 text-blue-600 animate-spin" />
        <span class="ml-3 text-lg text-gray-600">Cargando datos...</span>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article
          v-for="category in categories"
          :key="category.path"
          class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
        >
          <NuxtLink :to="category.path">
            <div class="aspect-w-16 aspect-h-9 overflow-hidden">
              <img
                :src="category.image"
                :alt="`Visualización de datos de ${category.title}`"
                class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
            </div>
            <div class="absolute inset-0 p-6 flex flex-col justify-end">
              <div class="flex items-center text-white mb-2">
                <component :is="category.icon" class="w-6 h-6 mr-2" />
                <h3 class="text-xl font-semibold">{{ category.title }}</h3>
              </div>
              <p class="text-gray-200 text-sm mb-4">{{ category.description }}</p>
              <div v-if="category.stats" class="grid grid-cols-3 gap-2 text-white/90 text-sm">
                <div>
                  <div class="font-semibold">{{ category.stats.datasets }}</div>
                  <div class="text-white/70 text-xs">Conjuntos</div>
                </div>
                <div>
                  <div class="font-semibold">{{ category.stats.updates }}</div>
                  <div class="text-white/70 text-xs">Actualizaciones</div>
                </div>
                <div>
                  <div class="font-semibold">
                    {{ formatStatValue(category.stats) }}
                  </div>
                  <div class="text-white/70 text-xs">
                    {{ getStatLabel(category.stats) }}
                  </div>
                </div>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>
    </section>

    <!-- Datos Destacados -->
    <section class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">
          Datos Destacados
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-2">Presupuesto Público</h3>
            <p class="text-3xl font-bold text-blue-600">196.091M€</p>
            <p class="text-sm text-gray-500 mt-2">
              Presupuesto total para 2024, un 8.2% más que en 2023
            </p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-2">Centros Sanitarios</h3>
            <p class="text-3xl font-bold text-green-600">3.477</p>
            <p class="text-sm text-gray-500 mt-2">
              Entre hospitales y centros de atención primaria
            </p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-2">Calidad del Aire</h3>
            <p class="text-3xl font-bold text-purple-600">156</p>
            <p class="text-sm text-gray-500 mt-2">
              Estaciones de medición en todo el territorio
            </p>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-2">Centros Educativos</h3>
            <p class="text-3xl font-bold text-orange-600">8.023</p>
            <p class="text-sm text-gray-500 mt-2">
              Incluyendo públicos, concertados y privados
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Search, Filter, Download, ArrowRight, Loader2,
  BarChart2, Activity, Bus, TreePine, GraduationCap,
  FolderSearch
} from 'lucide-vue-next'

// Composables
const { categories, isLoading, isError } = useHomeData()
const { 
  searchQuery,
  showResults,
  isSearching,
  searchSuggestions,
  searchCategories,
  handleSearch,
  handleBlur,
  handleEnterKey
} = useSearch()

// Resultados de búsqueda
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

const handleResultClick = (result: any) => {
  navigateTo(result.path)
}

const handleSuggestionSelect = (suggestion: string) => {
  searchQuery.value = suggestion
  handleSearch()
}

// Formatting functions
const formatStatValue = (stats: any) => {
  if (!stats) return 'N/A'
  
  if (stats.budget) {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(stats.budget)
  }
  
  if (stats.facilities) return `${stats.facilities.toLocaleString()} centros`
  if (stats.routes) return `${stats.routes.toLocaleString()} rutas`
  if (stats.stations) return `${stats.stations.toLocaleString()} estaciones`
  if (stats.institutions) return `${stats.institutions.toLocaleString()} centros`
  
  return 'N/A'
}

const getStatLabel = (stats: any) => {
  if (!stats) return 'Datos'
  
  if (stats.budget) return 'Presupuesto'
  if (stats.facilities) return 'Centros'
  if (stats.routes) return 'Rutas'
  if (stats.stations) return 'Estaciones'
  if (stats.institutions) return 'Instituciones'
  
  return 'Datos'
}

// SEO
useHead({
  title: 'DatosEnAbierto - Visualización de Datos Públicos en España',
  meta: [
    {
      name: 'description',
      content: 'Plataforma líder en visualización de datos públicos. Accede a información sobre transparencia, salud, movilidad, medio ambiente y educación de forma clara y comprensible.'
    }
  ]
})
</script>