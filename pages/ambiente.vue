<template>
  <main class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-green-600 to-green-800 text-white">
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-4">
              Medio Ambiente
            </h1>
            <p class="text-green-100 max-w-2xl">
              Accede a información sobre calidad del aire, emisiones,
              áreas verdes y cambio climático.
            </p>
          </div>
          <div class="mt-6 md:mt-0">
            <div class="flex space-x-4">
              <button class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50">
                <Download class="h-4 w-4 mr-2" />
                Descargar datos
              </button>
              <button class="inline-flex items-center px-4 py-2 border border-white rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700">
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
                <p class="text-sm text-gray-500">Estaciones</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ environmentData?.stations || 0 }}
                </p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <Cloud class="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Conjuntos de Datos</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ environmentData?.totalDatasets || 0 }}
                </p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <Database class="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Última Actualización</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ environmentData?.lastUpdate ? new Date(environmentData.lastUpdate).toLocaleDateString('es-ES') : '-' }}
                </p>
              </div>
              <div class="bg-cyan-100 p-3 rounded-full">
                <Clock class="h-6 w-6 text-cyan-600" />
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
                <Cloud class="h-5 w-5 mr-2 text-blue-600" />
                Calidad del Aire
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
                :data="environmentTrendData"
                :labels="timeLabels"
                label="Calidad del Aire"
              />
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold flex items-center">
                <Wind class="h-5 w-5 mr-2 text-green-600" />
                Emisiones CO2
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
  TreePine, Cloud, Database, Clock, CheckCircle, Wind, Download, Filter
} from 'lucide-vue-next'

const timeRange = ref('year')
const { data: environmentData, isLoading, isError, refresh } = useEnvironmentData()
const { generateTimeLabels, generateRandomData } = useChartData(timeRange)

const timeLabels = computed(() => generateTimeLabels.value)
const environmentTrendData = computed(() => generateRandomData(timeLabels.value.length))

const handleRetry = () => {
  refresh()
}

// SEO
useHead({
  title: 'Medio Ambiente',
  meta: [
    {
      name: 'description',
      content: 'Monitorea la calidad del aire, emisiones y datos sobre cambio climático en tiempo real.'
    }
  ]
})
</script>