<template>
  <div class="resumen-rapido">
    <!-- Compact view (default) -->
    <div
      v-if="!expandido"
      class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
    >
      <div class="flex items-start gap-3">
        <div class="shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <span class="text-xl">⚡</span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-900 mb-2">
            Resumen en 3 líneas
          </h4>
          <ul class="space-y-1 text-sm text-gray-700">
            <li class="flex items-start gap-2">
              <span class="text-blue-600 shrink-0 font-bold">•</span>
              <span>{{ linea1 }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-blue-600 shrink-0 font-bold">•</span>
              <span>{{ linea2 }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-blue-600 shrink-0 font-bold">•</span>
              <span>{{ linea3 }}</span>
            </li>
          </ul>
          <button
            v-if="mostrarExpandir"
            @click="expandido = true"
            class="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver más detalles →
          </button>
        </div>
      </div>
    </div>

    <!-- Expanded view -->
    <div
      v-else
      class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
    >
      <!-- Header with collapse button -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span class="text-xl">⚡</span>
          </div>
          <h4 class="text-base font-semibold text-gray-900">
            Resumen Ejecutivo
          </h4>
        </div>
        <button
          @click="expandido = false"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 3-line summary -->
      <div class="bg-white rounded-lg p-4 mb-4">
        <ul class="space-y-2 text-sm text-gray-700">
          <li class="flex items-start gap-2">
            <span class="text-blue-600 shrink-0 font-bold text-base">1.</span>
            <span class="font-medium">{{ linea1 }}</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 shrink-0 font-bold text-base">2.</span>
            <span class="font-medium">{{ linea2 }}</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 shrink-0 font-bold text-base">3.</span>
            <span class="font-medium">{{ linea3 }}</span>
          </li>
        </ul>
      </div>

      <!-- Additional details if provided -->
      <div v-if="detalles" class="space-y-3">
        <!-- Para quién es relevante -->
        <div
          v-if="detalles.paraQuien"
          class="bg-white rounded-lg p-4"
        >
          <h5 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>👥</span>
            <span>¿Para quién es relevante?</span>
          </h5>
          <p class="text-sm text-gray-700">{{ detalles.paraQuien }}</p>
        </div>

        <!-- Qué hacer -->
        <div
          v-if="detalles.queHacer"
          class="bg-white rounded-lg p-4"
        >
          <h5 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>✅</span>
            <span>¿Qué hacer?</span>
          </h5>
          <p class="text-sm text-gray-700">{{ detalles.queHacer }}</p>
        </div>

        <!-- Fecha límite -->
        <div
          v-if="detalles.fechaLimite"
          class="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4"
        >
          <h5 class="text-sm font-semibold text-amber-900 mb-1 flex items-center gap-2">
            <span>⏰</span>
            <span>Fecha importante</span>
          </h5>
          <p class="text-sm text-amber-800">
            {{ formatFecha(detalles.fechaLimite) }}
            <span v-if="detalles.diasRestantes !== undefined" class="font-semibold">
              ({{ getDiasTexto(detalles.diasRestantes) }})
            </span>
          </p>
        </div>
      </div>

      <!-- Educational disclaimer -->
      <div class="mt-4 p-3 bg-blue-100/50 rounded-lg">
        <p class="text-xs text-blue-800">
          <strong>💡 Nota:</strong> Este resumen es educativo y simplificado.
          Lee el documento completo en el
          <a
            href="https://www.boe.es"
            target="_blank"
            rel="noopener noreferrer"
            class="underline font-medium hover:text-blue-900"
          >
            BOE oficial
          </a>
          para información completa y precisa.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Detalles {
  paraQuien?: string
  queHacer?: string
  fechaLimite?: string
  diasRestantes?: number
}

interface Props {
  linea1: string
  linea2: string
  linea3: string
  detalles?: Detalles
  mostrarExpandir?: boolean
  inicialmenteExpandido?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mostrarExpandir: true,
  inicialmenteExpandido: false,
})

const expandido = ref(props.inicialmenteExpandido)

function formatFecha(fecha: string): string {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getDiasTexto(dias: number): string {
  if (dias < 0) return `Expiró hace ${Math.abs(dias)} días`
  if (dias === 0) return 'Expira hoy ⚠️'
  if (dias === 1) return 'Expira mañana ⚠️'
  if (dias <= 7) return `Quedan ${dias} días ⚠️`
  if (dias <= 30) return `Quedan ${dias} días`
  return `Quedan ${dias} días`
}
</script>

<style scoped>
.resumen-rapido {
  @apply w-full;
}
</style>
