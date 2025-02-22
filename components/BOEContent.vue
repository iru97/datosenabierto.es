<template>
  <!-- Loading State -->
  <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
    <div class="flex flex-col items-center justify-center gap-3">
      <div class="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <p class="text-gray-600">Cargando datos del Boletín Oficial... ({{ progress }}%)</p>
    </div>
  </div>

  <!-- Error Message -->
  <div v-else-if="error" class="bg-white rounded-lg shadow-sm border border-red-200 p-6">
    <div class="flex items-start gap-4 text-red-700">
      <ExclamationTriangleIcon class="h-6 w-6 mt-0.5" />
      <div>
        <h3 class="font-semibold text-lg">Error al cargar los datos</h3>
        <p class="mt-1 text-red-600">{{ error }}</p>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else-if="!weeklyData?.length" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
    <div class="flex flex-col items-center justify-center gap-4 text-gray-500">
      <NewspaperIcon class="h-12 w-12" />
      <div class="text-center">
        <h2 class="text-xl font-medium text-gray-700">Consulta el Boletín Oficial del Estado</h2>
        <p class="mt-2">Selecciona un rango de fechas para ver los boletines del BOE</p>
      </div>
    </div>
  </div>

  <!-- Weekly Content -->
  <div v-else class="space-y-8">
    <div v-for="week in weeklyData" :key="week.weekNumber" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Week Header -->
      <div class="border-b border-gray-100 bg-gray-50 p-4">
        <h2 class="text-lg font-semibold text-gray-700">
          Semana del {{ format(week.startDate, "d 'de' MMMM", { locale: es }) }}
          al {{ format(week.endDate, "d 'de' MMMM 'de' yyyy", { locale: es }) }}
        </h2>
      </div>

      <!-- Boletines Grid -->
      <div class="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="boletin in week.boletines" 
          :key="boletin.data.response.data.sumario.metadatos.fecha_publicacion"
          class="border border-gray-100 rounded-lg hover:shadow-md transition-all duration-200"
        >
          <!-- Cabecera del Boletín -->
          <div class="bg-gray-50 border-b border-gray-100 p-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
                <CalendarIcon class="h-5 w-5 text-blue-600" />
                {{ format(boletin.date, 'EEEE, d MMMM yyyy', { locale: es }) }}
              </h3>
            </div>
          </div>

          <!-- Contenido del Boletín -->
          <div class="divide-y divide-gray-100">
            <div 
              v-for="diario in boletin.data.response.data.sumario.diario" 
              :key="diario.numero"
              class="p-4 space-y-4"
            >
              <!-- Información Principal -->
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-medium text-gray-900 flex items-center gap-2">
                    <DocumentTextIcon class="h-5 w-5 text-gray-500" />
                    Boletín Nº {{ diario.numero }}
                  </h4>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ formatFileSize(diario.sumario_diario.url_pdf.szBytes) }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="selectedBoletin = boletin"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    title="Ver detalles"
                  >
                    <MagnifyingGlassIcon class="h-4 w-4" />
                    Detalles
                  </button>
                  <a 
                    :href="diario.sumario_diario.url_pdf.texto" 
                    target="_blank"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    title="Descargar PDF completo"
                    rel="noopener noreferrer"
                  >
                    <DocumentArrowDownIcon class="h-4 w-4" />
                    PDF
                  </a>
                </div>
              </div>

              <!-- Resumen de Contenido -->
              <div class="bg-gray-50 rounded-lg p-3 space-y-2">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500">Secciones</p>
                    <p class="text-lg font-semibold text-gray-700">{{ getSectionCount(diario) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Disposiciones</p>
                    <p class="text-lg font-semibold text-gray-700">{{ getItemCount(diario) }}</p>
                  </div>
                </div>
                
                <!-- Secciones Principales -->
                <div class="space-y-1 mt-3">
                  <p class="text-xs font-medium text-gray-500">Secciones principales:</p>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li v-for="seccion in getMainSections(diario)" :key="seccion.codigo" class="flex items-center gap-2">
                      <FolderIcon class="h-4 w-4 text-gray-400" />
                      {{ seccion.nombre }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Detalle -->
  <BOEDetailModal
    v-if="selectedBoletin"
    :show="!!selectedBoletin"
    :boletin="selectedBoletin"
    @close="selectedBoletin = null"
  />
</template>

<script setup lang="ts">
import {
  NewspaperIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  FolderIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { BOEDiario, BOESeccion } from '~/types/boe'
import type { BOEWeekData } from '~/composables/useBOE'
import BOEDetailModal from './BOEDetailModal.vue'

const props = defineProps<{
  loading: boolean
  error: string | null
  progress: number
  weeklyData: BOEWeekData[]
}>()

const selectedBoletin = ref(null)

const formatFileSize = (bytes: string): string => {
  const size = parseInt(bytes)
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const getSectionCount = (diario: BOEDiario): number => {
  return diario.seccion?.length || 0
}

const getItemCount = (diario: BOEDiario): number => {
  let totalItems = 0

  diario.seccion?.forEach(seccion => {
    const departamentos = Array.isArray(seccion.departamento) 
      ? seccion.departamento 
      : [seccion.departamento]

    departamentos.forEach(dept => {
      if (dept.item) {
        const items = Array.isArray(dept.item) ? dept.item : [dept.item]
        totalItems += items.length
      }
      
      if (dept.epigrafe) {
        const epigrafes = Array.isArray(dept.epigrafe) ? dept.epigrafe : [dept.epigrafe]
        epigrafes.forEach(epi => {
          const items = Array.isArray(epi.item) ? epi.item : [epi.item]
          totalItems += items.length
        })
      }
    })
  })

  return totalItems
}

const getMainSections = (diario: BOEDiario): BOESeccion[] => {
  return (diario.seccion || []).slice(0, 3)
}
</script>