<template>
  <main class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-4">
              Transparencia y Contrataciones
            </h1>
            <p class="text-blue-100 max-w-2xl">
              Accede a información detallada sobre presupuestos, contratos y gastos públicos.
              Datos actualizados diariamente para garantizar la máxima transparencia.
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
        <!-- Alerts Section -->
        <section v-if="alerts.length > 0" class="mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="alert in alerts"
              :key="alert.id"
              :class="[
                'p-4 rounded-lg border flex items-start space-x-3',
                {
                  'bg-blue-50 border-blue-200': alert.type === 'info',
                  'bg-yellow-50 border-yellow-200': alert.type === 'warning',
                  'bg-red-50 border-red-200': alert.type === 'error',
                  'bg-green-50 border-green-200': alert.type === 'success'
                }
              ]"
            >
              <AlertCircle :class="[
                'h-5 w-5 mt-0.5',
                {
                  'text-blue-500': alert.type === 'info',
                  'text-yellow-500': alert.type === 'warning',
                  'text-red-500': alert.type === 'error',
                  'text-green-500': alert.type === 'success'
                }
              ]" />
              <div>
                <h3 class="font-medium text-gray-900">{{ alert.title }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ alert.message }}</p>
                <p class="text-xs text-gray-500 mt-2">
                  {{ new Date(alert.date).toLocaleDateString('es-ES') }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center mb-2">
                  <p class="text-sm text-gray-500">Presupuesto Total</p>
                  <InfoIcon 
                    class="h-4 w-4 text-gray-400 ml-1 cursor-help"
                    v-tooltip="'Presupuesto total aprobado para el año en curso, incluyendo todas las partidas y departamentos.'"
                  />
                </div>
                <p class="text-2xl font-bold text-gray-900">
                  {{ formatCurrency(budget?.total || 0) }}
                </p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <BarChart2 class="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div class="mt-4">
              <div class="flex items-center">
                <ArrowUpRight class="h-4 w-4 text-green-500 mr-1" />
                <span class="text-sm text-green-500">+8.2% vs año anterior</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center mb-2">
                  <p class="text-sm text-gray-500">Contratos Activos</p>
                  <InfoIcon 
                    class="h-4 w-4 text-gray-400 ml-1 cursor-help"
                    v-tooltip="'Número total de contratos públicos en vigor, incluyendo licitaciones en curso y adjudicaciones.'"
                  />
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ totalContracts }}</p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <TrendingUp class="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div class="mt-4">
              <div class="flex items-center">
                <Calendar class="h-4 w-4 text-gray-400 mr-1" />
                <span class="text-sm text-gray-500">Actualizado hoy</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center mb-2">
                  <p class="text-sm text-gray-500">Eficiencia del Gasto</p>
                  <InfoIcon 
                    class="h-4 w-4 text-gray-400 ml-1 cursor-help"
                    v-tooltip="'Porcentaje del presupuesto ejecutado correctamente según los objetivos establecidos.'"
                  />
                </div>
                <p class="text-2xl font-bold text-gray-900">94.5%</p>
              </div>
              <div class="bg-purple-100 p-3 rounded-full">
                <Info class="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div class="mt-4">
              <div class="flex items-center">
                <ArrowUpRight class="h-4 w-4 text-green-500 mr-1" />
                <span class="text-sm text-green-500">+2.3% este trimestre</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts and Data -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Budget Distribution -->
          <section class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-xl font-semibold flex items-center">
                <BarChart2 class="h-5 w-5 mr-2 text-blue-600" />
                Distribución Presupuestaria
              </h2>
              <div class="flex space-x-2">
                <select 
                  v-model="timeRange"
                  class="text-sm border border-gray-200 rounded-md px-2 py-1"
                >
                  <option value="year">2024</option>
                  <option value="quarter">Trimestre actual</option>
                  <option value="month">Mes actual</option>
                </select>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-4">
              Visualización de la distribución del presupuesto por departamentos y su evolución temporal. 
              El gráfico de líneas muestra la tendencia del gasto, mientras que el gráfico circular 
              representa la distribución porcentual entre departamentos.
            </p>
            <div v-if="budget" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Bar Chart -->
              <div class="h-80">
                <ChartsLineChart
                  :data="budgetData"
                  :labels="timeLabels"
                  label="Presupuesto"
                />
              </div>
              <!-- Pie Chart -->
              <div class="h-80">
                <ChartsPieChart
                  v-if="budget.departments"
                  :data="budget.departments.map(d => d.amount)"
                  :labels="budget.departments.map(d => d.name)"
                />
              </div>
            </div>
          </section>

          <!-- Contracts List -->
          <section class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-xl font-semibold flex items-center">
                <FileText class="h-5 w-5 mr-2 text-blue-600" />
                Contratos Recientes
              </h2>
              <div class="flex space-x-4">
                <div class="relative">
                  <input
                    type="text"
                    placeholder="Buscar contratos..."
                    v-model="searchQuery"
                    class="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <select 
                  v-model="selectedDepartment"
                  class="text-sm border border-gray-200 rounded-md px-3"
                >
                  <option value="all">Todos los departamentos</option>
                  <option v-for="dept in budget?.departments" :key="dept.name" :value="dept.name">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-4">
              Lista de los contratos públicos más recientes, incluyendo su estado, presupuesto y documentación 
              asociada. Utiliza los filtros para buscar por departamento o palabra clave.
            </p>
            <div class="space-y-4">
              <div
                v-for="contract in contracts"
                :key="contract.id"
                class="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-all cursor-pointer group"
              >
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {{ contract.title }}
                    </h3>
                    <p class="text-sm text-gray-500 mt-1">
                      {{ contract.department }} • Prioridad: {{ contract.priority }}
                    </p>
                  </div>
                  <span :class="[
                    'px-2 py-1 text-xs rounded-full',
                    {
                      'bg-yellow-100 text-yellow-800': contract.status === 'in_progress',
                      'bg-green-100 text-green-800': contract.status === 'awarded',
                      'bg-blue-100 text-blue-800': contract.status === 'published'
                    }
                  ]">
                    {{ contract.status }}
                  </span>
                </div>
                <div class="flex justify-between items-end">
                  <div class="text-sm">
                    <span class="text-gray-500">Presupuesto:</span>
                    <span class="ml-2 font-medium text-gray-900">
                      {{ formatCurrency(contract.amount) }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-400">
                    Publicado: {{ new Date(contract.publishedAt).toLocaleDateString('es-ES') }}
                  </div>
                </div>
                <!-- Documents -->
                <div class="mt-3 pt-3 border-t border-gray-100">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Documentos:</h4>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="doc in contract.documents"
                      :key="doc.id"
                      class="inline-flex items-center px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      <FileText class="h-3 w-3 mr-1" />
                      {{ doc.title }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="contracts.length < totalContracts" class="mt-6 text-center">
              <button 
                @click="page++"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Cargar más contratos
                <ChevronDown class="ml-2 h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  BarChart2, TrendingUp, Download, Filter, Search, Info, 
  Calendar, ArrowUpRight, ChevronDown, FileText, AlertCircle,
  InfoIcon
} from 'lucide-vue-next'

const searchQuery = ref('')
const selectedDepartment = ref('all')
const timeRange = ref('year')
const page = ref(1)
const limit = 10

const { 
  contracts, 
  totalContracts, 
  budget, 
  alerts, 
  isLoading, 
  isError 
} = useTransparencyData({
  page: page.value,
  limit,
  department: selectedDepartment.value === 'all' ? undefined : selectedDepartment.value,
  search: searchQuery.value,
  year: new Date().getFullYear()
})

const { generateTimeLabels, generateRandomData } = useChartData(timeRange)

const timeLabels = computed(() => generateTimeLabels.value)
const budgetData = computed(() => generateRandomData(timeLabels.value.length))

const handleRetry = () => {
  if (process.client) {
    window.location.reload()
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Directiva personalizada para tooltips
const vTooltip = {
  mounted: (el: HTMLElement, binding: any) => {
    el.title = binding.value
  }
}

// SEO
useHead({
  title: 'Transparencia y Contrataciones Públicas',
  meta: [
    {
      name: 'description',
      content: 'Explora datos actualizados sobre presupuestos públicos, contratos y gastos gubernamentales. Información transparente y accesible para todos.'
    }
  ]
})
</script>