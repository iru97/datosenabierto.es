<template>
  <div
    class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border-l-4"
    :style="{ borderLeftColor: categoria.color }"
  >
    <!-- Header -->
    <div class="p-6 pb-4">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span
              class="px-3 py-1 text-xs font-semibold rounded-full"
              :style="{
                backgroundColor: `${categoria.color}20`,
                color: categoria.color,
              }"
            >
              {{ documento.seccion }}
            </span>
            <span class="text-xs text-gray-500">
              {{ formatearFecha(documento.fecha_publicacion) }}
            </span>
          </div>

          <h3 class="text-lg font-bold text-gray-900 leading-tight mb-1">
            {{ documento.titulo }}
          </h3>

          <div v-if="documento.departamento" class="text-sm text-gray-600 mb-2">
            {{ documento.departamento }}
          </div>

          <div v-if="documento.rango" class="inline-flex items-center gap-1">
            <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {{ documento.rango }}
            </span>
          </div>
        </div>

        <button
          @click="toggleExpanded"
          class="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          :aria-label="isExpanded ? 'Ocultar detalles' : 'Ver detalles'"
        >
          <svg
            class="w-6 h-6 text-gray-500 transition-transform duration-300"
            :class="{ 'rotate-180': isExpanded }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <!-- Quick Summary (Always Visible) -->
      <div v-if="resumen" class="bg-blue-50 rounded-lg p-4 mb-4">
        <div class="flex items-start">
          <span class="text-2xl mr-3">📝</span>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-800 text-sm mb-1">Resumen Rápido</h4>
            <p class="text-gray-700 text-sm">{{ resumen.contenido }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Expanded Content -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[2000px] opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="max-h-[2000px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="isExpanded" class="border-t border-gray-100 bg-gray-50">
        <div class="p-6 space-y-6">
          <!-- What is it? -->
          <div v-if="queEs" class="bg-white rounded-lg p-5">
            <div class="flex items-start">
              <span class="text-3xl mr-3">❓</span>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-800 mb-2">¿Qué es esto?</h4>
                <p class="text-gray-700 leading-relaxed">{{ queEs.contenido }}</p>
              </div>
            </div>
          </div>

          <!-- How does it affect me? -->
          <div v-if="comoAfecta" class="bg-white rounded-lg p-5">
            <div class="flex items-start">
              <span class="text-3xl mr-3">👥</span>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-800 mb-2">¿Cómo me afecta?</h4>
                <p class="text-gray-700 leading-relaxed">{{ comoAfecta.contenido }}</p>
              </div>
            </div>
          </div>

          <!-- Structured Data (if available) -->
          <div v-if="hasDatosEstructurados" class="bg-white rounded-lg p-5">
            <div class="flex items-start">
              <span class="text-3xl mr-3">📊</span>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-800 mb-3">Datos Clave</h4>
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <template v-for="(value, key) in documento.datos_estructurados" :key="key">
                    <div v-if="value && key !== 'titulo_original'" class="bg-gray-50 rounded p-3">
                      <dt class="text-xs font-semibold text-gray-600 uppercase mb-1">
                        {{ formatKey(key) }}
                      </dt>
                      <dd class="text-sm text-gray-900">
                        {{ formatValue(value) }}
                      </dd>
                    </div>
                  </template>
                </dl>
              </div>
            </div>
          </div>

          <!-- Important Dates (if available) -->
          <div v-if="hasFechasImportantes" class="bg-white rounded-lg p-5">
            <div class="flex items-start">
              <span class="text-3xl mr-3">📅</span>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-800 mb-3">Fechas Importantes</h4>
                <ul class="space-y-2">
                  <li
                    v-for="(fecha, index) in documento.fechas_importantes"
                    :key="index"
                    class="flex items-center gap-3 text-sm"
                  >
                    <span
                      class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold"
                      v-if="fecha.urgente"
                    >
                      URGENTE
                    </span>
                    <span class="text-gray-700 font-medium">
                      {{ formatearFecha(fecha.fecha) }}:
                    </span>
                    <span class="text-gray-600">{{ fecha.descripcion }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <a
              v-if="documento.url_pdf"
              :href="documento.url_pdf"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                  clip-rule="evenodd"
                />
              </svg>
              Ver PDF Oficial
            </a>

            <button
              class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
              @click="copyLink"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {{ linkCopiado ? '¡Copiado!' : 'Copiar Enlace' }}
            </button>

            <div class="flex items-center text-xs text-gray-500 ml-auto">
              <span class="mr-1">ID:</span>
              <code class="bg-gray-100 px-2 py-1 rounded">{{ documento.boe_id }}</code>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Documento, Categoria } from '~/composables/useSupabase'

// Props
const props = defineProps<{
  documento: Documento
  categoria: Categoria
}>()

// State
const isExpanded = ref(false)
const linkCopiado = ref(false)

// Computed
const resumen = computed(() => {
  if (!props.documento.explicaciones) return null
  return props.documento.explicaciones.find((e: any) => e.tipo === 'resumen')
})

const queEs = computed(() => {
  if (!props.documento.explicaciones) return null
  return props.documento.explicaciones.find((e: any) => e.tipo === 'que_es')
})

const comoAfecta = computed(() => {
  if (!props.documento.explicaciones) return null
  return props.documento.explicaciones.find((e: any) => e.tipo === 'como_afecta')
})

const hasDatosEstructurados = computed(() => {
  return (
    props.documento.datos_estructurados &&
    Object.keys(props.documento.datos_estructurados).length > 1
  )
})

const hasFechasImportantes = computed(() => {
  return (
    Array.isArray(props.documento.fechas_importantes) &&
    props.documento.fechas_importantes.length > 0
  )
})

// Methods
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function formatearFecha(fecha: string): string {
  return format(new Date(fecha), 'dd MMM yyyy', { locale: es })
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

function formatValue(value: any): string {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

async function copyLink() {
  try {
    const url = `${window.location.origin}/categorias/${props.categoria.slug}#${props.documento.boe_id}`
    await navigator.clipboard.writeText(url)
    linkCopiado.value = true
    setTimeout(() => {
      linkCopiado.value = false
    }, 2000)
  } catch (err) {
    console.error('Error copiando enlace:', err)
  }
}
</script>

<style scoped>
/* Smooth max-height transitions */
.max-h-0 {
  max-height: 0;
}

.max-h-\[2000px\] {
  max-height: 2000px;
}
</style>
