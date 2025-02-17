import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounce } from '@vueuse/core'

export function useSearch() {
  const router = useRouter()
  const searchQuery = ref('')
  const showResults = ref(false)
  const isSearching = ref(false)
  const debouncedQuery = useDebounce(searchQuery, 300)

  const searchSuggestions = [
    'Presupuesto sanidad 2024',
    'Calidad aire Madrid',
    'Contratos públicos',
    'Hospitales por provincia',
    'Emisiones CO2',
    'Centros educativos'
  ]

  const searchCategories = {
    'Transparencia': [
      { id: 1, title: 'Presupuestos', description: 'Distribución presupuestaria por departamentos' },
      { id: 2, title: 'Contratos', description: 'Licitaciones y adjudicaciones públicas' },
      { id: 3, title: 'Subvenciones', description: 'Ayudas y subvenciones otorgadas' }
    ],
    'Salud': [
      { id: 4, title: 'Hospitales', description: 'Red de hospitales públicos' },
      { id: 5, title: 'Listas de espera', description: 'Tiempos de espera por especialidad' },
      { id: 6, title: 'Personal sanitario', description: 'Distribución de profesionales' }
    ],
    'Medio Ambiente': [
      { id: 7, title: 'Calidad del aire', description: 'Mediciones de contaminantes' },
      { id: 8, title: 'Emisiones', description: 'Datos de emisiones por sector' },
      { id: 9, title: 'Zonas verdes', description: 'Áreas protegidas y parques' }
    ]
  }

  // Watch for changes in debounced query
  watch(debouncedQuery, async (newQuery) => {
    if (newQuery.length < 2) {
      showResults.value = false
      return
    }

    isSearching.value = true
    try {
      // Here you would typically make an API call
      // For now, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 300))
      showResults.value = true
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      isSearching.value = false
    }
  })

  const handleSearch = () => {
    if (searchQuery.value.length < 2) {
      showResults.value = false
      return
    }

    isSearching.value = true
    setTimeout(() => {
      isSearching.value = false
      showResults.value = true
    }, 300)
  }

  const handleBlur = () => {
    setTimeout(() => {
      showResults.value = false
    }, 200)
  }

  const handleEnterKey = () => {
    if (searchQuery.value.length >= 2) {
      router.push({
        path: '/buscar',
        query: { q: searchQuery.value }
      })
      showResults.value = false
    }
  }

  const handleResultClick = (result: any) => {
    searchQuery.value = ''
    showResults.value = false
    router.push(result.path)
  }

  const handleSuggestionSelect = (suggestion: string) => {
    searchQuery.value = suggestion
    handleSearch()
  }

  return {
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
  }
}