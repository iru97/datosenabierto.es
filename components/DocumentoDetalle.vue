<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="cerrar"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div class="relative min-h-screen flex items-center justify-center p-4">
          <div
            class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-start justify-between p-6 border-b border-gray-200">
              <div class="flex-1 pr-8">
                <!-- Category badge -->
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ documento.categoria }}
                  </span>
                  <span
                    v-if="documento.urgencia"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    :class="getUrgenciaClasses(documento.urgencia)"
                  >
                    {{ documento.urgencia }}
                  </span>
                </div>

                <!-- Title -->
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                  {{ documento.titulo }}
                </h2>

                <!-- Metadata -->
                <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span class="flex items-center gap-1">
                    <span>📅</span>
                    {{ formatFecha(documento.fechaPublicacion) }}
                  </span>
                  <span v-if="documento.organismo" class="flex items-center gap-1">
                    <span>🏛️</span>
                    {{ documento.organismo }}
                  </span>
                  <span v-if="documento.identificador" class="flex items-center gap-1">
                    <span>🔖</span>
                    {{ documento.identificador }}
                  </span>
                </div>
              </div>

              <!-- Close button -->
              <button
                @click="cerrar"
                class="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-200 bg-gray-50">
              <div class="flex overflow-x-auto">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="tabActual = tab.id"
                  class="flex-1 min-w-[120px] px-6 py-3 text-sm font-medium transition-colors border-b-2"
                  :class="
                    tabActual === tab.id
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  "
                >
                  <span class="mr-2">{{ tab.icono }}</span>
                  {{ tab.label }}
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-6">
              <!-- Tab: Resumen -->
              <div v-show="tabActual === 'resumen'" class="space-y-6">
                <!-- 3-line summary -->
                <ResumenRapido
                  v-if="documento.resumen"
                  :linea1="documento.resumen.linea1"
                  :linea2="documento.resumen.linea2"
                  :linea3="documento.resumen.linea3"
                  :detalles="documento.resumen.detalles"
                  :inicialmente-expandido="true"
                />

                <!-- ¿Qué es esto? -->
                <div class="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4">
                  <h3 class="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>💡</span>
                    <span>¿Qué es esto?</span>
                  </h3>
                  <p class="text-sm text-blue-800">
                    {{ documento.explicacion || 'Explicación del documento...' }}
                  </p>
                </div>

                <!-- ¿Cómo me afecta? -->
                <div class="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
                  <h3 class="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <span>👤</span>
                    <span>¿Cómo me afecta?</span>
                  </h3>
                  <p class="text-sm text-amber-800">
                    {{ documento.comoAfecta || 'Información sobre a quién afecta...' }}
                  </p>
                </div>

                <!-- Link to official BOE -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h3 class="font-semibold text-gray-900 mb-3">
                    📄 Documento oficial
                  </h3>
                  <div class="flex gap-3">
                    <a
                      :href="documento.urlPdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      Ver PDF en BOE.es →
                    </a>
                    <a
                      :href="documento.urlHtml"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Ver HTML en BOE.es
                    </a>
                  </div>
                  <p class="text-xs text-gray-600 mt-3">
                    ⚠️ <strong>Importante:</strong> Verifica siempre en el BOE oficial antes de tomar decisiones.
                  </p>
                </div>
              </div>

              <!-- Tab: Fechas -->
              <div v-show="tabActual === 'fechas'">
                <TimelineFechas
                  v-if="documento.fechas && documento.fechas.length > 0"
                  :fechas="documento.fechas"
                  :titulo="'Fechas importantes de este documento'"
                  :descripcion="'Plazos, fechas de examen, y otras fechas relevantes'"
                />
                <div v-else class="text-center py-12 text-gray-500">
                  <p class="text-lg mb-2">📅</p>
                  <p>No hay fechas importantes registradas para este documento</p>
                </div>
              </div>

              <!-- Tab: Requisitos -->
              <div v-show="tabActual === 'requisitos'" class="space-y-6">
                <div
                  v-if="documento.requisitos && documento.requisitos.length > 0"
                  class="space-y-4"
                >
                  <div
                    v-for="(requisito, index) in documento.requisitos"
                    :key="index"
                    class="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <h4 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span class="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                        {{ index + 1 }}
                      </span>
                      {{ requisito.titulo }}
                    </h4>
                    <p class="text-sm text-gray-700 ml-8">
                      {{ requisito.descripcion }}
                    </p>
                    <div
                      v-if="requisito.items && requisito.items.length > 0"
                      class="mt-3 ml-8"
                    >
                      <ul class="space-y-1">
                        <li
                          v-for="(item, idx) in requisito.items"
                          :key="idx"
                          class="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <span class="text-blue-600">✓</span>
                          <span>{{ item }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-12 text-gray-500">
                  <p class="text-lg mb-2">📋</p>
                  <p>No hay requisitos específicos registrados</p>
                </div>

                <!-- Educational note -->
                <div class="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
                  <p class="text-sm text-amber-800">
                    <strong>💡 Consejo:</strong> Estos requisitos son informativos.
                    Consulta el documento oficial en BOE.es para información completa
                    y verifica con el organismo correspondiente si tienes dudas.
                  </p>
                </div>
              </div>

              <!-- Tab: Pasos -->
              <div v-show="tabActual === 'pasos'" class="space-y-6">
                <div class="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 mb-6">
                  <h3 class="font-semibold text-indigo-900 mb-2">
                    🎯 Guía paso a paso
                  </h3>
                  <p class="text-sm text-indigo-800">
                    Esta guía te ayuda a entender qué hacer. Siempre verifica
                    los detalles en el BOE oficial.
                  </p>
                </div>

                <div
                  v-if="documento.pasos && documento.pasos.length > 0"
                  class="relative"
                >
                  <!-- Vertical line -->
                  <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div
                    v-for="(paso, index) in documento.pasos"
                    :key="index"
                    class="relative pl-12 pb-8 last:pb-0"
                  >
                    <!-- Step number -->
                    <div class="absolute left-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                      {{ index + 1 }}
                    </div>

                    <!-- Step content -->
                    <div class="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 class="font-semibold text-gray-900 mb-2">
                        {{ paso.titulo }}
                      </h4>
                      <p class="text-sm text-gray-700 mb-3">
                        {{ paso.descripcion }}
                      </p>
                      <div
                        v-if="paso.plazo"
                        class="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 inline-flex"
                      >
                        <span>⏰</span>
                        <span>{{ paso.plazo }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-12 text-gray-500">
                  <p class="text-lg mb-2">📝</p>
                  <p>No hay pasos específicos registrados</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-200 p-6 bg-gray-50">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-600">
                  <strong>Recuerda:</strong> Esta es información educativa.
                  <a
                    href="https://www.boe.es"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Verifica en BOE.es
                  </a>
                </p>
                <button
                  @click="cerrar"
                  class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ResumenRapido from './ResumenRapido.vue'
import TimelineFechas from './TimelineFechas.vue'

interface Documento {
  id: string
  titulo: string
  categoria: string
  fechaPublicacion: string
  organismo?: string
  identificador?: string
  urgencia?: 'URGENTE' | 'PRÓXIMO' | 'NUEVO' | 'NORMAL'
  urlPdf: string
  urlHtml: string
  explicacion?: string
  comoAfecta?: string
  resumen?: {
    linea1: string
    linea2: string
    linea3: string
    detalles?: any
  }
  fechas?: any[]
  requisitos?: Array<{
    titulo: string
    descripcion: string
    items?: string[]
  }>
  pasos?: Array<{
    titulo: string
    descripcion: string
    plazo?: string
  }>
}

interface Props {
  modelValue: boolean
  documento: Documento
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const tabActual = ref<string>('resumen')

const tabs = [
  { id: 'resumen', label: 'Resumen', icono: '⚡' },
  { id: 'fechas', label: 'Fechas', icono: '📅' },
  { id: 'requisitos', label: 'Requisitos', icono: '📋' },
  { id: 'pasos', label: 'Pasos', icono: '🎯' },
]

function cerrar() {
  emit('update:modelValue', false)
  // Reset tab on close
  setTimeout(() => {
    tabActual.value = 'resumen'
  }, 300)
}

function formatFecha(fecha: string): string {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getUrgenciaClasses(urgencia: string): string {
  switch (urgencia) {
    case 'URGENTE':
      return 'bg-red-100 text-red-800'
    case 'PRÓXIMO':
      return 'bg-amber-100 text-amber-800'
    case 'NUEVO':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<style scoped>
/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
