<template>
  <main class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-4">
              Salud y Bienestar
            </h1>
            <p class="text-blue-100 max-w-2xl">
              Accede a información detallada sobre el sistema sanitario,
              recursos médicos y estadísticas de salud.
            </p>
          </div>
          <div class="mt-6 md:mt-0">
            <div class="flex space-x-4">
              <button class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50">
                <Download class="h-4 w-4 mr-2" />
                Descargar datos
              </button>
              <button class="inline-flex items-center px-4 py-2 border border-white rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
                <Filter class="h-4 w-4 mr-2" />
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <template v-if="isLoading">
        <UiLoadingSpinner />
      </template>

      <template v-else-if="isError">
        <UiErrorMessage 
          title="Error al cargar los datos"
          message="Ha ocurrido un error al obtener la información. Por favor, intenta de nuevo más tarde."
          :onRetry="handleRetry"
        />
      </template>

      <template v-else>
        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Centros Sanitarios</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ healthData?.facilities || 0 }}
                </p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <Activity class="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Personal Sanitario</p>
                <p class="text-2xl font-bold text-gray-900">13,450</p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <Users class="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Última Actualización</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ healthData?.lastUpdate ? new Date(healthData.lastUpdate).toLocaleDateString('es-ES') : '-' }}
                </p>
              </div>
              <div class="bg-purple-100 p-3 rounded-full">
                <Clock class="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Estado</p>
                <p class="text-2xl font-bold text-green-600">
                  Activo
                </p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <CheckCircle class="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold flex items-center">
                <Activity class="h-5 w-5 mr-2 text-blue-600" />
                Actividad Asistencial
              </h2>
              <select 
                v-model="timeRange"
                class="text-sm border border-gray-200 rounded-md px-2 py-1"
              >
                <option value="year">2024</option>
                <option value="quarter">Último Trimestre</option>
                <option value="month">Último Mes</option>
              </select>
            </div>
            <div class="h-80">
              <ChartsLineChart
                :data="healthTrendData"
                :labels="timeLabels"
                label="Pacientes Atendidos"
              />
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold flex items-center">
                <TrendingUp class="h-5 w-5 mr-2 text-green-600" />
                Distribución por Especialidad
              </h2>
            </div>
            <div class="h-80">
              <!-- Implement chart with vue-chartjs -->
            </div>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Activity, 
  Users, 
  Download, 
  Filter, 
  Clock, 
  CheckCircle, 
  TrendingUp 
} from 'lucide-vue-next'

const timeRange = ref('year')
const { data: healthData, isLoading, isError, refresh } = useHealthData()
const { generateTimeLabels, generateRandomData } = useChartData(timeRange)

const timeLabels = computed(() => generateTimeLabels.value)
const healthTrendData = computed(() => generateRandomData(timeLabels.value.length, {
  min: 5000,
  max: 50000,
  trend: 'up',
  volatility: 0.1
}))

const handleRetry = () => {
  refresh()
}

// SEO
useHead({
  title: 'Datos de Salud y Bienestar',
  meta: [
    {
      name: 'description',
      content: 'Explora estadísticas detalladas del sistema sanitario español: recursos, actividad asistencial y calidad del servicio.'
    }
  ]
})
</script>