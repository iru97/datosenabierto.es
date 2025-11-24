<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 py-12">
      <div class="animate-pulse">
        <div class="h-12 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div class="h-6 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div class="space-y-4">
          <div class="h-32 bg-gray-200 rounded"></div>
          <div class="h-32 bg-gray-200 rounded"></div>
          <div class="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 py-12">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-800 text-lg">❌ {{ error }}</p>
        <NuxtLink
          to="/categorias"
          class="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Volver a Categorías
        </NuxtLink>
      </div>
    </div>

    <!-- Category Content -->
    <div v-else-if="categoria">
      <!-- Breadcrumbs -->
      <div class="bg-white border-b border-gray-200">
        <div class="container mx-auto px-4 py-3">
          <Breadcrumbs
            :breadcrumbs="[
              { label: 'Categorías', to: '/categorias' },
              { label: categoria.nombre }
            ]"
          />
        </div>
      </div>

      <!-- Header -->
      <div
        class="text-white py-12"
        :style="{ backgroundColor: categoria.color }"
      >
        <div class="container mx-auto px-4">

          <div class="flex items-center gap-4 mb-4">
            <span class="text-6xl">{{ categoria.icono }}</span>
            <div>
              <h1 class="text-4xl md:text-5xl font-bold">
                {{ categoria.nombre }}
              </h1>
              <p class="text-xl text-white/90 mt-2">
                {{ categoria.descripcion }}
              </p>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div class="bg-white/10 backdrop-blur rounded-lg p-4">
              <div class="text-2xl font-bold">{{ totalDocumentos }}</div>
              <div class="text-sm text-white/80">Documentos esta semana</div>
            </div>
            <div class="bg-white/10 backdrop-blur rounded-lg p-4">
              <div class="text-2xl font-bold">{{ documentosImportantes }}</div>
              <div class="text-sm text-white/80">Destacados</div>
            </div>
            <div class="bg-white/10 backdrop-blur rounded-lg p-4">
              <div class="text-2xl font-bold">{{ ultimaActualizacion }}</div>
              <div class="text-sm text-white/80">Última actualización</div>
            </div>
            <div class="bg-white/10 backdrop-blur rounded-lg p-4">
              <div class="text-2xl font-bold">✅</div>
              <div class="text-sm text-white/80">100% Gratis</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección Educativa: ¿Qué es esta categoría? -->
      <div class="container mx-auto px-4 py-8">
        <CategoriaSEccionEducativa
          :icono="categoria.icono"
          :titulo="`¿Qué encontrarás en ${categoria.nombre}?`"
          :descripcion="`Te explicamos de forma clara y sencilla qué tipo de información publicará el BOE en esta categoría`"
          :que-encontraras="categoriaInfoData?.queEncontraras || []"
          :para-quien="categoriaInfoData?.paraQuien || []"
          :consejos="categoriaInfoData?.consejos || []"
        />
      </div>

      <!-- Weekly Summary (if available) -->
      <div v-if="estadisticaSemanal" class="container mx-auto px-4 py-8">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border-l-4" :style="{ borderLeftColor: categoria.color }">
          <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span class="text-3xl mr-3">📊</span>
            Resumen de la Semana
          </h2>

          <div v-if="estadisticaSemanal.resumen_semanal" class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-2">📋 ¿Qué ha pasado?</h3>
            <p class="text-gray-700 leading-relaxed">
              {{ estadisticaSemanal.resumen_semanal }}
            </p>
          </div>

          <div v-if="estadisticaSemanal.tendencias" class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-2">📈 Tendencias</h3>
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">
              {{ estadisticaSemanal.tendencias }}
            </p>
          </div>

          <div v-if="estadisticaSemanal.insights" class="bg-white/60 rounded-lg p-4">
            <h3 class="font-semibold text-gray-700 mb-2 flex items-center">
              <span class="text-xl mr-2">💡</span>
              Lo Más Importante
            </h3>
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">
              {{ estadisticaSemanal.insights }}
            </p>
          </div>
        </div>
      </div>

      <!-- Documents List -->
      <div class="container mx-auto px-4 py-8">
        <!-- No documents state -->
        <div v-if="documentos.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📭</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">
            No hay documentos esta semana
          </h3>
          <p class="text-gray-600">
            No se han publicado documentos en esta categoría durante la última semana.
            Vuelve a consultar próximamente.
          </p>
        </div>

        <!-- Documents Grid -->
        <div v-else class="space-y-6">
          <DocumentoCard
            v-for="documento in documentos"
            :key="documento.id"
            :documento="documento"
            :categoria="categoria"
          />
        </div>

        <!-- Load More -->
        <div v-if="hasMore" class="text-center mt-8">
          <button
            @click="loadMore"
            :disabled="loadingMore"
            class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loadingMore ? 'Cargando...' : 'Cargar Más' }}
          </button>
        </div>
      </div>

      <!-- Help Section -->
      <div class="container mx-auto px-4 py-12">
        <div class="bg-gray-100 rounded-xl p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">
            ❓ ¿Tienes dudas?
          </h2>
          <p class="text-gray-700 mb-4">
            Si no entiendes algo o necesitas más información, recuerda que puedes:
          </p>
          <ul class="space-y-2 text-gray-700">
            <li class="flex items-start">
              <span class="mr-2">📄</span>
              <span>Hacer clic en cualquier documento para ver sus explicaciones detalladas</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">🔗</span>
              <span>Acceder al PDF oficial del BOE para la información completa y legal</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">📊</span>
              <span>Revisar el resumen semanal arriba para entender el contexto general</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  getCategoriaBySlug,
  getDocumentosByCategoria,
  getEstadisticasSemanales,
  type Categoria,
  type Documento,
  type Estadistica,
} from '~/composables/useSupabase'
import { CATEGORIA_INFO } from '~/utils/categoria-info'

// Route
const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Información educativa de la categoría
const categoriaInfoData = computed(() => {
  return CATEGORIA_INFO[slug.value]
})

// State - DEBE estar ANTES de los computed que lo usan
const loading = ref(true)
const error = ref<string | null>(null)
const categoria = ref<Categoria | null>(null)
const documentos = ref<Documento[]>([])
const estadisticaSemanal = ref<Estadistica | null>(null)
const totalDocumentos = ref(0)
const documentosImportantes = ref(0)
const page = ref(0)
const limit = 20
const hasMore = ref(true)
const loadingMore = ref(false)

// SEO - Ahora categoria ya está declarado
const title = computed(() =>
  categoria.value ? `${categoria.value.nombre} - BOE Explicado` : 'Cargando...'
)

useHead({
  title,
  meta: [
    {
      name: 'description',
      content: computed(() =>
        categoria.value
          ? `${categoria.value.descripcion}. Información actualizada del BOE explicada de forma clara y sencilla.`
          : ''
      ),
    },
  ],
})

// Computed
const ultimaActualizacion = computed(() => {
  if (!documentos.value.length) return 'N/A'
  const ultimaFecha = documentos.value[0].fecha_publicacion
  return format(new Date(ultimaFecha), 'dd MMM', { locale: es })
})

// Methods
async function fetchCategoria() {
  loading.value = true
  error.value = null

  try {
    // Fetch categoria
    const cat = await getCategoriaBySlug(slug.value)
    if (!cat) {
      error.value = 'Categoría no encontrada'
      return
    }
    categoria.value = cat

    // Fetch estadísticas semanales
    const estadisticas = await getEstadisticasSemanales(cat.id, 1)
    if (estadisticas.length > 0) {
      estadisticaSemanal.value = estadisticas[0]
      totalDocumentos.value = estadisticas[0].total_documentos
      documentosImportantes.value = estadisticas[0].documentos_importantes
    }

    // Fetch documentos
    await fetchDocumentos()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching categoria:', err)
  } finally {
    loading.value = false
  }
}

async function fetchDocumentos() {
  if (!categoria.value) return

  const offset = page.value * limit

  // Get last 30 days
  const hasta = new Date()
  const desde = new Date()
  desde.setDate(desde.getDate() - 30)

  const result = await getDocumentosByCategoria(categoria.value.id, {
    limit,
    offset,
    desde,
    hasta,
  })

  if (page.value === 0) {
    documentos.value = result.data
  } else {
    documentos.value.push(...result.data)
  }

  hasMore.value = result.data.length === limit
}

async function loadMore() {
  loadingMore.value = true
  page.value++
  await fetchDocumentos()
  loadingMore.value = false
}

// Lifecycle
onMounted(() => {
  fetchCategoria()
})

// Watch slug changes
watch(slug, () => {
  page.value = 0
  documentos.value = []
  fetchCategoria()
})
</script>
