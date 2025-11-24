<template>
  <div class="filtros-inteligentes">
    <!-- Header -->
    <div class="mb-4">
      <div class="flex items-start justify-between gap-4 mb-2">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>🔍</span>
            <span>Filtros de búsqueda</span>
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            Organiza los documentos según lo que te interesa ver
          </p>
        </div>
        <button
          v-if="tienesFiltrosActivos"
          @click="limpiarFiltros"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium shrink-0"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Active filters summary -->
      <div v-if="tienesFiltrosActivos" class="flex flex-wrap gap-2 mt-3">
        <span
          v-for="filtro in filtrosActivosTexto"
          :key="filtro"
          class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
        >
          {{ filtro }}
          <button
            @click="quitarFiltro(filtro)"
            class="hover:text-blue-900"
          >
            ×
          </button>
        </span>
      </div>
    </div>

    <!-- Filters grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Categoría -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <label class="block text-sm font-semibold text-gray-900 mb-3">
          🗂️ Categoría
        </label>
        <select
          v-model="filtrosInternos.categoria"
          @change="aplicarFiltros"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">Todas las categorías</option>
          <option
            v-for="cat in categorias"
            :key="cat.value"
            :value="cat.value"
          >
            {{ cat.label }}
          </option>
        </select>
      </div>

      <!-- Fechas próximas -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <label class="block text-sm font-semibold text-gray-900 mb-3">
          📅 Fechas importantes
        </label>
        <select
          v-model="filtrosInternos.plazo"
          @change="aplicarFiltros"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">Cualquier fecha</option>
          <option value="7">Con plazo en 7 días o menos</option>
          <option value="15">Con plazo en 15 días o menos</option>
          <option value="30">Con plazo en 30 días o menos</option>
          <option value="60">Con plazo en 60 días o menos</option>
        </select>
        <p class="text-xs text-gray-500 mt-2">
          Muestra documentos con fechas límite próximas
        </p>
      </div>

      <!-- Publicación reciente -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <label class="block text-sm font-semibold text-gray-900 mb-3">
          ✨ Publicación reciente
        </label>
        <select
          v-model="filtrosInternos.publicacion"
          @change="aplicarFiltros"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">Cualquier fecha</option>
          <option value="7">Última semana</option>
          <option value="15">Últimos 15 días</option>
          <option value="30">Último mes</option>
          <option value="90">Últimos 3 meses</option>
        </select>
      </div>

      <!-- Organismo -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <label class="block text-sm font-semibold text-gray-900 mb-3">
          🏛️ Organismo
        </label>
        <input
          v-model="filtrosInternos.organismo"
          @input="aplicarFiltrosDebounced"
          type="text"
          placeholder="Ej: Ministerio de Educación"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <p class="text-xs text-gray-500 mt-2">
          Filtra por nombre del organismo emisor
        </p>
      </div>
    </div>

    <!-- Quick filters -->
    <div class="mt-4">
      <h4 class="text-sm font-semibold text-gray-900 mb-3">
        ⚡ Filtros rápidos
      </h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="quickFilter in filtrosRapidos"
          :key="quickFilter.id"
          @click="aplicarFiltroRapido(quickFilter)"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          :class="
            esFiltroRapidoActivo(quickFilter)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          "
        >
          <span class="mr-1">{{ quickFilter.icono }}</span>
          {{ quickFilter.label }}
        </button>
      </div>
    </div>

    <!-- Educational note -->
    <div class="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
      <p class="text-sm text-blue-800">
        <strong>💡 Nota:</strong> Los filtros te ayudan a organizar la información
        según tus intereses. No ocultan documentos oficiales, solo los organizan.
        Puedes ver todos los documentos en el
        <a
          href="https://www.boe.es"
          target="_blank"
          rel="noopener noreferrer"
          class="underline font-medium hover:text-blue-900"
        >
          BOE oficial
        </a>.
      </p>
    </div>

    <!-- Results count -->
    <div
      v-if="resultadosCount !== null"
      class="mt-4 text-sm text-gray-600 text-center"
    >
      {{ resultadosCount }} documento{{ resultadosCount !== 1 ? 's' : '' }} encontrado{{ resultadosCount !== 1 ? 's' : '' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Filtros {
  categoria: string
  plazo: string
  publicacion: string
  organismo: string
}

interface FiltroRapido {
  id: string
  label: string
  icono: string
  filtros: Partial<Filtros>
}

interface Props {
  categorias?: Array<{ value: string; label: string }>
  resultadosCount?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  categorias: () => [
    { value: 'oposiciones', label: 'Oposiciones y empleo público' },
    { value: 'subvenciones', label: 'Subvenciones y ayudas' },
    { value: 'educacion', label: 'Educación' },
    { value: 'sanidad', label: 'Sanidad' },
    { value: 'hacienda', label: 'Hacienda e impuestos' },
    { value: 'justicia', label: 'Justicia' },
    { value: 'vivienda', label: 'Vivienda' },
    { value: 'laboral', label: 'Legislación laboral' },
    { value: 'empresas', label: 'Empresas y autónomos' },
    { value: 'medioambiente', label: 'Medio ambiente' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'otros', label: 'Otros' },
  ],
  resultadosCount: null,
})

const emit = defineEmits<{
  'filtros-changed': [filtros: Filtros]
}>()

const filtrosInternos = ref<Filtros>({
  categoria: '',
  plazo: '',
  publicacion: '',
  organismo: '',
})

const filtrosRapidos: FiltroRapido[] = [
  {
    id: 'urgente',
    label: 'Urgente (< 7 días)',
    icono: '⏰',
    filtros: { plazo: '7' },
  },
  {
    id: 'nuevo',
    label: 'Nuevo (última semana)',
    icono: '✨',
    filtros: { publicacion: '7' },
  },
  {
    id: 'oposiciones-recientes',
    label: 'Oposiciones recientes',
    icono: '📚',
    filtros: { categoria: 'oposiciones', publicacion: '30' },
  },
  {
    id: 'subvenciones-abiertas',
    label: 'Subvenciones abiertas',
    icono: '💰',
    filtros: { categoria: 'subvenciones', plazo: '30' },
  },
]

const tienesFiltrosActivos = computed(() => {
  return Object.values(filtrosInternos.value).some((v) => v !== '')
})

const filtrosActivosTexto = computed(() => {
  const textos: string[] = []

  if (filtrosInternos.value.categoria) {
    const cat = props.categorias.find(
      (c) => c.value === filtrosInternos.value.categoria
    )
    if (cat) textos.push(cat.label)
  }

  if (filtrosInternos.value.plazo) {
    textos.push(`Plazo: ${filtrosInternos.value.plazo} días`)
  }

  if (filtrosInternos.value.publicacion) {
    textos.push(`Publicado: últimos ${filtrosInternos.value.publicacion} días`)
  }

  if (filtrosInternos.value.organismo) {
    textos.push(`Organismo: ${filtrosInternos.value.organismo}`)
  }

  return textos
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function aplicarFiltros() {
  emit('filtros-changed', { ...filtrosInternos.value })
}

function aplicarFiltrosDebounced() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    aplicarFiltros()
  }, 500)
}

function limpiarFiltros() {
  filtrosInternos.value = {
    categoria: '',
    plazo: '',
    publicacion: '',
    organismo: '',
  }
  aplicarFiltros()
}

function quitarFiltro(texto: string) {
  // Match and clear specific filter
  if (texto.startsWith('Plazo:')) {
    filtrosInternos.value.plazo = ''
  } else if (texto.startsWith('Publicado:')) {
    filtrosInternos.value.publicacion = ''
  } else if (texto.startsWith('Organismo:')) {
    filtrosInternos.value.organismo = ''
  } else {
    // It's a category
    filtrosInternos.value.categoria = ''
  }
  aplicarFiltros()
}

function aplicarFiltroRapido(quickFilter: FiltroRapido) {
  // Toggle: if already active, clear; otherwise apply
  if (esFiltroRapidoActivo(quickFilter)) {
    limpiarFiltros()
  } else {
    filtrosInternos.value = {
      categoria: quickFilter.filtros.categoria || '',
      plazo: quickFilter.filtros.plazo || '',
      publicacion: quickFilter.filtros.publicacion || '',
      organismo: quickFilter.filtros.organismo || '',
    }
    aplicarFiltros()
  }
}

function esFiltroRapidoActivo(quickFilter: FiltroRapido): boolean {
  return (
    (!quickFilter.filtros.categoria ||
      filtrosInternos.value.categoria === quickFilter.filtros.categoria) &&
    (!quickFilter.filtros.plazo ||
      filtrosInternos.value.plazo === quickFilter.filtros.plazo) &&
    (!quickFilter.filtros.publicacion ||
      filtrosInternos.value.publicacion === quickFilter.filtros.publicacion) &&
    (!quickFilter.filtros.organismo ||
      filtrosInternos.value.organismo === quickFilter.filtros.organismo) &&
    tienesFiltrosActivos.value
  )
}
</script>

<style scoped>
.filtros-inteligentes {
  @apply w-full;
}
</style>
