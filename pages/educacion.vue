<template>
  <main class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-4">
              Educación y Empleo
            </h1>
            <p class="text-purple-100 max-w-2xl">
              Accede a información sobre el sistema educativo,
              rendimiento académico y mercado laboral.
            </p>
          </div>
          <div class="mt-6 md:mt-0">
            <div class="flex space-x-4">
              <button class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-purple-600 bg-white hover:bg-purple-50">
                <Download class="h-4 w-4 mr-2" />
                Descargar datos
              </button>
              <button class="inline-flex items-center px-4 py-2 border border-white rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700">
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
                <p class="text-sm text-gray-500">Instituciones</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ stats?.totalInstitutions.toLocaleString() || 0 }}
                </p>
              </div>
              <div class="bg-purple-100 p-3 rounded-full">
                <School class="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Conjuntos de Datos</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ educationData?.totalDatasets || 0 }}
                </p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <Database class="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Última Actualización</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ educationData?.lastUpdate ? new Date(educationData.lastUpdate).toLocaleDateString('es-ES') : '-' }}
                </p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <Clock class="h-6 w-6 text-green-600" />
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
              <div class="bg-orange-100 p-3 rounded-full">
                <CheckCircle class="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold flex items-center">
                <School class="h-5 w-5 mr-2 text-purple-600" />
                Distribución por Nivel
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
              <ChartsPieChart
                v-if="stats"
                :data="stats.distribution.map(d => d.value)"
                :labels="stats.distribution.map(d => d.label)"
              />
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold flex items-center">
                <TrendingUp class="h-5 w-5 mr-2 text-green-600" />
                Evolución Temporal
              </h2>
            </div>
            <div class="h-80">
              <ChartsLineChart
                :data="educationTrendData"
                :labels="timeLabels"
                label="Datos Educativos"
              />
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <GraduationCap class="h-5 w-5 mr-2 text-purple-600" />
              Indicadores Clave
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Ratio alumno/profesor</span>
                <span class="font-medium">12.5:1</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Tasa de graduación</span>
                <span class="font-medium">78.3%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Abandono escolar</span>
                <span class="font-medium">13.2%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Inversión por alumno</span>
                <span class="font-medium">6.842€</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp class="h-5 w-5 mr-2 text-green-600" />
              Tendencias Recientes
            </h3>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <ArrowUpRight class="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p class="font-medium">Aumento en matriculación FP</p>
                  <p class="text-sm text-gray-600">
                    Incremento del 15% en matriculaciones de Formación Profesional
                    respecto al año anterior.
                  </p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <ArrowUpRight class="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p class="font-medium">Mejora en digitalización</p>
                  <p class="text-sm text-gray-600">
                    El 92% de los centros han implementado nuevas herramientas
                    digitales en el último año.
                  </p>
                </div>
              </div>
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
  School, Database, Clock, CheckCircle, Download, Filter,
  TrendingUp, GraduationCap, ArrowUpRight
} from 'lucide-vue-next'

const timeRange = ref('year')
const { data: educationData, stats, isLoading, isError, refresh } = useEducationData()
const { generateTimeLabels, generateRandomData } = useChartData(timeRange)

const timeLabels = computed(() => generateTimeLabels.value)
const educationTrendData = computed(() => generateRandomData(timeLabels.value.length))

const handleRetry = () => {
  refresh()
}

// SEO
useHead({
  title: 'Educación y Empleo',
  meta: [
    {
      name: 'description',
      content: 'Analiza indicadores educativos, tasas de empleo y datos de formación en España.'
    }
  ]
})
</script>