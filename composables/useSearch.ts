import { ref, computed } from 'vue'

export function useSearch() {
  const searchQuery = ref('')
  const showResults = ref(false)
  const isSearching = ref(false)

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

  const handleSearch = () => {
    if (searchQuery.value.length < 2) {
      showResults.value = false
      return
    }

    isSearching.value = true
    setTimeout(() => {
      isSearching.value = false
      showResults.value = true
    }, 500)
  }

  const handleBlur = () => {
    setTimeout(() => {
      showResults.value = false
    }, 200)
  }

  const handleEnterKey = () => {
    if (searchQuery.value.length >= 2) {
      // Implementar búsqueda completa
      console.log('Búsqueda completa:', searchQuery.value)
    }
  }

  const handleResultClick = (result: any) => {
    console.log('Resultado seleccionado:', result)
    // Implementar navegación al resultado
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
    handleResultClick
  }
}