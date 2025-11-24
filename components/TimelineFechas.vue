<template>
  <div class="timeline-fechas">
    <!-- Header -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        📅 {{ titulo }}
      </h3>
      <p v-if="descripcion" class="text-sm text-gray-600">
        {{ descripcion }}
      </p>
    </div>

    <!-- Timeline -->
    <div class="relative">
      <!-- Vertical line -->
      <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <!-- Timeline items -->
      <div
        v-for="(item, index) in fechasOrdenadas"
        :key="index"
        class="relative pl-12 pb-8 last:pb-0"
      >
        <!-- Timeline dot -->
        <div
          class="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center z-10"
          :class="getColorClasses(item.urgencia).dotBg"
        >
          <span class="text-sm">{{ getIcono(item.urgencia) }}</span>
        </div>

        <!-- Content card -->
        <div
          class="bg-white rounded-lg border-l-4 shadow-sm p-4 hover:shadow-md transition-shadow"
          :class="getColorClasses(item.urgencia).borderColor"
        >
          <!-- Header with badge -->
          <div class="flex items-start justify-between gap-3 mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getColorClasses(item.urgencia).badgeBg"
                >
                  {{ item.urgencia }}
                </span>
                <span
                  v-if="item.diasRestantes !== null"
                  class="text-xs text-gray-500"
                >
                  {{ getDiasTexto(item.diasRestantes) }}
                </span>
              </div>
              <h4 class="font-semibold text-gray-900">
                {{ item.tipo }}
              </h4>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-gray-900">
                {{ formatFecha(item.fecha) }}
              </div>
              <div class="text-xs text-gray-500">
                {{ formatFechaRelativa(item.fecha) }}
              </div>
            </div>
          </div>

          <!-- Description -->
          <p v-if="item.descripcion" class="text-sm text-gray-600 mb-3">
            {{ item.descripcion }}
          </p>

          <!-- Document reference -->
          <div
            v-if="item.documentoTitulo"
            class="flex items-start gap-2 text-xs text-gray-500 mb-3"
          >
            <span class="shrink-0">📄</span>
            <span class="line-clamp-2">{{ item.documentoTitulo }}</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              v-if="item.documentoId"
              @click="$emit('ver-documento', item.documentoId)"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver documento →
            </button>
            <button
              v-if="item.urlPdf"
              @click="abrirPDF(item.urlPdf)"
              class="text-sm text-gray-600 hover:text-gray-800"
            >
              📄 PDF oficial
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="fechasOrdenadas.length === 0"
        class="text-center py-8 text-gray-500"
      >
        <p>No hay fechas importantes registradas</p>
      </div>
    </div>

    <!-- Educational disclaimer -->
    <div
      v-if="mostrarDisclaimer"
      class="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg"
    >
      <p class="text-sm text-amber-800">
        <strong>⚠️ Recuerda:</strong> Estas fechas son informativas. Verifica
        siempre los plazos en el
        <a
          href="https://www.boe.es"
          target="_blank"
          rel="noopener noreferrer"
          class="underline font-medium hover:text-amber-900"
        >
          BOE oficial
        </a>
        antes de tomar decisiones.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FechaImportante {
  fecha: string // ISO date string
  tipo: string // "Plazo de presentación", "Fecha de examen", etc.
  urgencia: 'URGENTE' | 'PRÓXIMO' | 'NUEVO' | 'NORMAL'
  descripcion?: string
  documentoId?: string
  documentoTitulo?: string
  urlPdf?: string
  diasRestantes?: number | null
}

interface Props {
  fechas: FechaImportante[]
  titulo?: string
  descripcion?: string
  mostrarDisclaimer?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  titulo: 'Fechas Importantes',
  descripcion: '',
  mostrarDisclaimer: true,
})

const emit = defineEmits<{
  'ver-documento': [documentoId: string]
}>()

// Ordenar fechas: URGENTE primero, luego por fecha más próxima
const fechasOrdenadas = computed(() => {
  return [...props.fechas].sort((a, b) => {
    // Orden de urgencia
    const urgenciaOrder = { URGENTE: 0, PRÓXIMO: 1, NUEVO: 2, NORMAL: 3 }
    const urgenciaCompare =
      urgenciaOrder[a.urgencia] - urgenciaOrder[b.urgencia]
    if (urgenciaCompare !== 0) return urgenciaCompare

    // Si misma urgencia, ordenar por fecha
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  })
})

function getColorClasses(urgencia: string) {
  switch (urgencia) {
    case 'URGENTE':
      return {
        dotBg: 'bg-red-500 text-white',
        borderColor: 'border-red-500',
        badgeBg: 'bg-red-100 text-red-800',
      }
    case 'PRÓXIMO':
      return {
        dotBg: 'bg-amber-500 text-white',
        borderColor: 'border-amber-500',
        badgeBg: 'bg-amber-100 text-amber-800',
      }
    case 'NUEVO':
      return {
        dotBg: 'bg-blue-500 text-white',
        borderColor: 'border-blue-500',
        badgeBg: 'bg-blue-100 text-blue-800',
      }
    default:
      return {
        dotBg: 'bg-gray-400 text-white',
        borderColor: 'border-gray-300',
        badgeBg: 'bg-gray-100 text-gray-800',
      }
  }
}

function getIcono(urgencia: string): string {
  switch (urgencia) {
    case 'URGENTE':
      return '⏰'
    case 'PRÓXIMO':
      return '📅'
    case 'NUEVO':
      return '✨'
    default:
      return '📌'
  }
}

function formatFecha(fecha: string): string {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatFechaRelativa(fecha: string): string {
  const date = new Date(fecha)
  const ahora = new Date()
  const diffMs = date.getTime() - ahora.getTime()
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDias < 0) {
    return `Hace ${Math.abs(diffDias)} días`
  } else if (diffDias === 0) {
    return 'Hoy'
  } else if (diffDias === 1) {
    return 'Mañana'
  } else if (diffDias <= 7) {
    return `En ${diffDias} días`
  } else if (diffDias <= 30) {
    const semanas = Math.floor(diffDias / 7)
    return `En ${semanas} semana${semanas > 1 ? 's' : ''}`
  } else {
    const meses = Math.floor(diffDias / 30)
    return `En ${meses} mes${meses > 1 ? 'es' : ''}`
  }
}

function getDiasTexto(dias: number | null): string {
  if (dias === null) return ''
  if (dias < 0) return `Expirado hace ${Math.abs(dias)} días`
  if (dias === 0) return 'Expira hoy'
  if (dias === 1) return 'Expira mañana'
  return `Quedan ${dias} días`
}

function abrirPDF(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.timeline-fechas {
  @apply w-full;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
