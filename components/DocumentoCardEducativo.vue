<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-400">
    <!-- Badge de estado -->
    <div v-if="esNuevo" class="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1">
      🆕 NUEVO
    </div>
    <div v-else-if="esUrgente" class="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1">
      ⏰ URGENTE - {{ diasRestantes }} días
    </div>

    <div class="p-5">
      <!-- Título y tipo -->
      <div class="mb-3">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {{ tipoDocumento }}
        </span>
        <h3 class="text-lg font-bold text-gray-900 mt-1 leading-tight hover:text-blue-600 cursor-pointer">
          {{ titulo }}
        </h3>
      </div>

      <!-- Explicación "¿Qué es esto?" -->
      <div v-if="explicacion" class="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded-r">
        <p class="text-sm font-medium text-blue-900 mb-1">💡 ¿Qué es esto?</p>
        <p class="text-sm text-gray-700 leading-relaxed">
          {{ explicacion }}
        </p>
      </div>

      <!-- Info clave -->
      <div class="space-y-2 mb-4">
        <!-- Fecha importante -->
        <div v-if="fechaImportante" class="flex items-center gap-2 text-sm">
          <span class="text-red-500">📅</span>
          <span class="font-semibold text-gray-700">{{ fechaImportante.tipo }}:</span>
          <span class="text-gray-900">{{ formatDate(fechaImportante.fecha) }}</span>
          <span v-if="fechaImportante.diasRestantes" :class="fechaImportante.diasRestantes <= 7 ? 'text-red-600 font-bold' : 'text-orange-600'">
            ({{ fechaImportante.diasRestantes }} días)
          </span>
        </div>

        <!-- Organismo -->
        <div v-if="organismo" class="flex items-center gap-2 text-sm">
          <span>🏛️</span>
          <span class="text-gray-600">{{ organismo }}</span>
        </div>
      </div>

      <!-- Sección "¿Cómo me afecta?" -->
      <div v-if="comoAfecta" class="bg-amber-50 border-l-4 border-amber-400 p-3 mb-4 rounded-r">
        <p class="text-sm font-medium text-amber-900 mb-1">👤 ¿Cómo me afecta?</p>
        <p class="text-sm text-gray-700 leading-relaxed">
          {{ comoAfecta }}
        </p>
      </div>

      <!-- Keywords -->
      <div v-if="keywords && keywords.length > 0" class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="keyword in keywords.slice(0, 3)"
          :key="keyword"
          class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
        >
          {{ keyword }}
        </span>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-2 pt-3 border-t border-gray-200">
        <button
          @click="$emit('ver-detalle')"
          class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          Ver completo
        </button>
        <button
          v-if="urlPdf"
          @click="abrirPDF"
          class="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          title="Abrir PDF oficial"
        >
          📄 PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FechaImportante {
  tipo: string
  fecha: string
  descripcion?: string
  diasRestantes?: number
}

interface Props {
  titulo: string
  tipoDocumento?: string
  explicacion?: string
  comoAfecta?: string
  fechaImportante?: FechaImportante
  organismo?: string
  keywords?: string[]
  urlPdf?: string
  fechaPublicacion: string
}

const props = withDefaults(defineProps<Props>(), {
  tipoDocumento: 'Documento BOE',
  keywords: () => []
})

defineEmits(['ver-detalle'])

// Computed
const esNuevo = computed(() => {
  const pubDate = new Date(props.fechaPublicacion)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 3
})

const esUrgente = computed(() => {
  if (!props.fechaImportante?.diasRestantes) return false
  return props.fechaImportante.diasRestantes <= 15
})

const diasRestantes = computed(() => props.fechaImportante?.diasRestantes || 0)

// Methods
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function abrirPDF() {
  if (props.urlPdf) {
    window.open(props.urlPdf, '_blank')
  }
}
</script>
