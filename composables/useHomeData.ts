import { ref, computed } from 'vue'
import { BarChart2, Activity, Bus, TreePine, GraduationCap } from 'lucide-vue-next'

export function useHomeData() {
  const { data: transparencyData, pending: transparencyPending } = useFetch(`/api/transparency/${new Date().getFullYear()}`)
  const { data: healthData, pending: healthPending } = useFetch('/api/health')
  const { data: mobilityData, pending: mobilityPending } = useFetch('/api/mobility')
  const { data: environmentData, pending: environmentPending } = useFetch('/api/environment')
  const { data: educationData, pending: educationPending } = useFetch('/api/education')

  const isLoading = computed(() => 
    transparencyPending.value || 
    healthPending.value || 
    mobilityPending.value || 
    environmentPending.value || 
    educationPending.value
  )

  const categories = computed(() => [
    {
      title: 'Transparencia y Contrataciones',
      description: 'Información sobre presupuestos, contratos y gastos públicos',
      icon: BarChart2,
      path: '/transparencia',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000',
      stats: transparencyData.value ? {
        datasets: String((transparencyData.value as any)?.departments?.length || 0),
        updates: 'Diarias',
        budget: (transparencyData.value as any)?.total
      } : null
    },
    {
      title: 'Salud y Bienestar',
      description: 'Estadísticas de salud, informes epidemiológicos y recursos sanitarios',
      icon: Activity,
      path: '/salud',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000',
      stats: healthData.value ? {
        datasets: String((healthData.value as any)?.totalDatasets),
        updates: 'Semanales',
        facilities: (healthData.value as any)?.facilities
      } : null
    },
    {
      title: 'Movilidad y Transporte',
      description: 'Datos sobre tráfico, transporte público y movilidad urbana',
      icon: Bus,
      path: '/movilidad',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000',
      stats: mobilityData.value ? {
        datasets: String((mobilityData.value as any)?.totalDatasets),
        updates: 'Tiempo real',
        routes: (mobilityData.value as any)?.routes
      } : null
    },
    {
      title: 'Medio Ambiente',
      description: 'Calidad del aire, emisiones y datos sobre cambio climático',
      icon: TreePine,
      path: '/ambiente',
      image: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&q=80&w=1000',
      stats: environmentData.value ? {
        datasets: String((environmentData.value as any)?.totalDatasets),
        updates: 'Diarias',
        stations: (environmentData.value as any)?.stations
      } : null
    },
    {
      title: 'Educación y Empleo',
      description: 'Indicadores educativos, tasas de empleo y formación',
      icon: GraduationCap,
      path: '/educacion',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1000',
      stats: educationData.value ? {
        datasets: String((educationData.value as any)?.totalDatasets),
        updates: 'Mensuales',
        institutions: (educationData.value as any)?.institutions
      } : null
    }
  ])

  return {
    categories,
    isLoading,
    isError: false
  }
}