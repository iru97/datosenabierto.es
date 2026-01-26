<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div class="container mx-auto px-4 py-16">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
          El BOE, Explicado 📚
        </h1>
        <p class="text-xl md:text-2xl text-blue-100 max-w-3xl mb-6">
          Te ayudamos a <strong>entender</strong> el Boletín Oficial del Estado.<br />
          Traducimos lenguaje legal a lenguaje claro.
        </p>

        <!-- Disclaimer Prominente -->
        <div class="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg p-4 max-w-3xl mb-8">
          <p class="text-sm text-white/90 flex items-start gap-2">
            <span class="text-xl">⚠️</span>
            <span>
              <strong>Información educativa:</strong> Esta web explica documentos del BOE en lenguaje sencillo.
              Verifica siempre en <a href="https://www.boe.es" target="_blank" rel="noopener" class="underline font-bold hover:text-blue-200">BOE.es oficial</a>
              antes de tomar decisiones. No somos fuente oficial ni damos asesoramiento legal.
            </span>
          </p>
        </div>

        <div class="flex flex-wrap gap-4">
          <NuxtLink
            to="/categorias"
            class="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg shadow-lg"
          >
            🗂️ Explorar por Categorías
          </NuxtLink>
          <a
            href="https://www.boe.es"
            target="_blank"
            rel="noopener noreferrer"
            class="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors text-lg border-2 border-white/20"
          >
            📄 Ir al BOE Oficial →
          </a>
        </div>
      </div>
    </div>

    <!-- Estadísticas de la semana -->
    <div v-if="stats" class="container mx-auto px-4 -mt-8 relative z-10">
      <div class="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
        <div class="grid grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-blue-600">{{ stats.documentosSemana }}</div>
            <div class="text-sm text-gray-600 mt-1">Documentos esta semana</div>
          </div>
          <div class="text-center border-l border-r border-gray-200">
            <div class="text-3xl md:text-4xl font-bold text-amber-600">{{ stats.documentosImportantes }}</div>
            <div class="text-sm text-gray-600 mt-1">Destacados</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-green-600">{{ stats.categoriasActivas }}</div>
            <div class="text-sm text-gray-600 mt-1">Categorías activas</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ¿Qué hacemos? -->
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          ¿Qué hacemos?
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          No sustituimos al BOE oficial. Te enseñamos a entenderlo.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="bg-white rounded-xl p-8 shadow-md border-2 border-transparent hover:border-blue-200 transition-all">
          <div class="text-5xl mb-4">📚</div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">
            Traducimos
          </h3>
          <p class="text-gray-600">
            Convertimos lenguaje legal y técnico en explicaciones claras que cualquiera puede entender.
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-md border-2 border-transparent hover:border-blue-200 transition-all">
          <div class="text-5xl mb-4">🗂️</div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">
            Organizamos
          </h3>
          <p class="text-gray-600">
            Clasificamos documentos en 12 categorías claras: Oposiciones, Ayudas, Legislación y más.
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-md border-2 border-transparent hover:border-blue-200 transition-all">
          <div class="text-5xl mb-4">🔗</div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">
            Enlazamos
          </h3>
          <p class="text-gray-600">
            Siempre te llevamos al documento oficial del BOE. Nosotros explicamos, el BOE es la fuente de verdad.
          </p>
        </div>
      </div>
    </div>

    <!-- Esta Semana en el BOE -->
    <div v-if="destacados.length > 0" class="bg-gradient-to-r from-amber-50 to-orange-50 py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <span>📰</span>
            <span>Esta Semana en el BOE</span>
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Los documentos más importantes publicados recientemente
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mb-8">
          <DocumentoCardEducativo
            v-for="doc in destacados.slice(0, 6)"
            :key="doc.id"
            :titulo="doc.titulo"
            :tipo-documento="doc.tipoDocumento"
            :explicacion="doc.explicacion"
            :como-afecta="doc.comoAfecta"
            :fecha-importante="doc.fechaImportante"
            :organismo="doc.organismo"
            :keywords="doc.keywords"
            :url-pdf="doc.url_pdf"
            :fecha-publicacion="doc.fecha_publicacion"
            :categorias="doc.categorias || []"
            @ver-detalle="abrirDetalle(doc)"
          />
        </div>

        <div class="text-center">
          <NuxtLink
            to="/categorias"
            class="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Ver todos los documentos
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Categorías más activas -->
    <div v-if="topCategorias.length > 0" class="container mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          🔥 Categorías más activas esta semana
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Donde hay más novedades y actualizaciones
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="estadistica in topCategorias"
          :key="estadistica.categoria.id"
          :to="`/categorias/${estadistica.categoria.slug}`"
          class="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-400 group"
        >
          <div class="flex items-center gap-4 mb-4">
            <span class="text-4xl">{{ estadistica.categoria.icono }}</span>
            <div class="flex-1">
              <h3 class="font-bold text-gray-800 group-hover:text-blue-600">
                {{ estadistica.categoria.nombre }}
              </h3>
              <p class="text-xs text-gray-500">{{ estadistica.categoria.descripcion }}</p>
            </div>
          </div>

          <div class="space-y-2 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Documentos</span>
              <span class="font-bold text-blue-600">{{ estadistica.total_documentos }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Destacados</span>
              <span class="font-bold text-amber-600">{{ estadistica.documentos_importantes }}</span>
            </div>
          </div>

          <!-- Resumen semanal si existe -->
          <div v-if="estadistica.resumen_semanal" class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-600 line-clamp-3">
              {{ estadistica.resumen_semanal }}
            </p>
          </div>

          <div class="mt-4 text-blue-600 group-hover:text-blue-700 text-sm font-semibold flex items-center">
            Ver detalles
            <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Explora por Categoría -->
    <div class="bg-blue-50 py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            🗂️ Todas las Categorías
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora qué tipo de información encontrarás en cada sección
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Categorías P3 (destacadas) -->
          <NuxtLink
            to="/categorias/oposiciones"
            class="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-400 text-center group"
          >
            <div class="text-4xl mb-2">📝</div>
            <h3 class="font-bold text-gray-800 group-hover:text-blue-600">Oposiciones</h3>
            <p class="text-xs text-gray-500 mt-1">Convocatorias, plazas, fechas</p>
          </NuxtLink>

          <NuxtLink
            to="/categorias/ayudas"
            class="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-400 text-center group"
          >
            <div class="text-4xl mb-2">💰</div>
            <h3 class="font-bold text-gray-800 group-hover:text-blue-600">Ayudas</h3>
            <p class="text-xs text-gray-500 mt-1">Subvenciones, becas, bonos</p>
          </NuxtLink>

          <NuxtLink
            to="/categorias/legislacion"
            class="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-400 text-center group"
          >
            <div class="text-4xl mb-2">⚖️</div>
            <h3 class="font-bold text-gray-800 group-hover:text-blue-600">Legislación</h3>
            <p class="text-xs text-gray-500 mt-1">Leyes, decretos, cambios</p>
          </NuxtLink>

          <NuxtLink
            to="/categorias/empleo"
            class="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-400 text-center group"
          >
            <div class="text-4xl mb-2">💼</div>
            <h3 class="font-bold text-gray-800 group-hover:text-blue-600">Empleo</h3>
            <p class="text-xs text-gray-500 mt-1">Convenios, salarios, derechos</p>
          </NuxtLink>
        </div>

        <div class="text-center">
          <NuxtLink
            to="/categorias"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ver las 12 categorías
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Lo más reciente -->
    <div v-if="recientes.length > 0" class="container mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
          <span>✨</span>
          <span>Lo Más Reciente</span>
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Últimas publicaciones de todas las categorías
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <DocumentoCardEducativo
          v-for="doc in recientes.slice(0, 6)"
          :key="doc.id"
          :titulo="doc.titulo"
          :tipo-documento="doc.tipoDocumento"
          :explicacion="doc.explicacion"
          :como-afecta="doc.comoAfecta"
          :fecha-importante="doc.fechaImportante"
          :organismo="doc.organismo"
          :keywords="doc.keywords"
          :url-pdf="doc.url_pdf"
          :fecha-publicacion="doc.fecha_publicacion"
          :categorias="doc.categorias || []"
          @ver-detalle="abrirDetalle(doc)"
        />
      </div>
    </div>

    <!-- Aprende a usar el BOE -->
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            🎓 Aprende a usar el BOE
          </h2>
          <p class="text-lg text-gray-600">
            El BOE es la fuente oficial. Te enseñamos a entenderlo.
          </p>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border-l-4 border-blue-500">
          <ol class="space-y-4">
            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
              <div>
                <h3 class="font-bold text-gray-800 mb-1">El BOE publica información oficial cada día</h3>
                <p class="text-gray-600 text-sm">
                  Es la fuente de verdad del Estado. Todo lo que afecta legalmente a España se publica aquí.
                </p>
              </div>
            </li>

            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
              <div>
                <h3 class="font-bold text-gray-800 mb-1">Explora por categoría lo que te interesa</h3>
                <p class="text-gray-600 text-sm">
                  Usa nuestras categorías para encontrar rápidamente: Oposiciones, Ayudas, Vivienda, etc.
                </p>
              </div>
            </li>

            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
              <div>
                <h3 class="font-bold text-gray-800 mb-1">Lee nuestra explicación para entender</h3>
                <p class="text-gray-600 text-sm">
                  Te explicamos qué es el documento, cómo te afecta, y qué términos legales significa.
                </p>
              </div>
            </li>

            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
              <div>
                <h3 class="font-bold text-gray-800 mb-1">SIEMPRE verifica en el documento oficial</h3>
                <p class="text-gray-600 text-sm">
                  Haz clic en "Ver BOE oficial" para leer el documento completo antes de tomar decisiones.
                </p>
              </div>
            </li>

            <li class="flex items-start gap-3">
              <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</span>
              <div>
                <h3 class="font-bold text-gray-800 mb-1">Si tienes dudas, consulta con un profesional</h3>
                <p class="text-gray-600 text-sm">
                  Nosotros educamos, no asesoramos. Para decisiones legales, consulta con abogados o gestores.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div class="mt-8 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-6">
          <h3 class="flex items-center gap-2 font-bold text-amber-900 mb-2">
            <span>⚠️</span>
            <span>Importante</span>
          </h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li>• Esta web NO sustituye al BOE oficial</li>
            <li>• NO somos asesoría legal ni administrativa</li>
            <li>• Verifica SIEMPRE en <a href="https://www.boe.es" target="_blank" class="text-blue-600 underline font-semibold">BOE.es</a> antes de actuar</li>
            <li>• Nuestras explicaciones son informativas, no vinculantes legalmente</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Por qué este proyecto -->
    <div class="bg-gray-100 py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-6">
            ¿Por qué este proyecto?
          </h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            El BOE publica miles de documentos cada semana que afectan directamente a millones
            de españoles: oposiciones, ayudas, cambios legales, y mucho más. Pero encontrar
            y <strong>entender</strong> esta información puede ser complicado.
          </p>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            <strong>Nuestra misión:</strong> hacer que la información oficial del Estado sea
            accesible y comprensible para todos, sin importar tu nivel de conocimiento legal.
          </p>
          <p class="text-base text-gray-600">
            100% gratis · Sin registro · Código abierto · Datos del <a href="https://www.boe.es" target="_blank" class="text-blue-600 underline">BOE oficial</a>
          </p>
        </div>
      </div>
    </div>

    <!-- Modal de detalle del documento -->
    <DocumentoDetalle
      v-if="modalAbierto && documentoSeleccionado"
      :documento="documentoSeleccionado"
      @cerrar="cerrarDetalle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getDocumentosDestacados,
  getDocumentosRecentesConExplicaciones,
  getEstadisticasHome,
  getTopCategoriasActivas,
} from '~/composables/useSupabase'
import { getCategoriasDelDocumento } from '~/composables/useMultiCategory'
import { transformarDocumentos, type DocumentoTransformado } from '~/utils/document-transformer'
import DocumentoCardEducativo from '~/components/DocumentoCardEducativo.vue'
import DocumentoDetalle from '~/components/DocumentoDetalle.vue'

// State
const stats = ref<any>(null)
const destacados = ref<DocumentoTransformado[]>([])
const recientes = ref<DocumentoTransformado[]>([])
const topCategorias = ref<any[]>([])

const modalAbierto = ref(false)
const documentoSeleccionado = ref<any>(null)

// Helper function to enrich documents with multi-category data
async function enrichDocumentosConCategorias(documentos: DocumentoTransformado[]) {
  return await Promise.all(
    documentos.map(async (doc) => {
      const categorias = await getCategoriasDelDocumento(doc.id)
      return {
        ...doc,
        categorias: categorias.map(cat => ({
          categoria_id: cat.categoria_id,
          categoria_slug: cat.categoria?.slug || '',
          categoria_nombre: cat.categoria?.nombre || '',
          confidence: cat.confidence,
          metodo: cat.clasificacion_metodo
        }))
      }
    })
  )
}

// Cargar datos
onMounted(async () => {
  try {
    // Cargar en paralelo todas las consultas
    const [statsData, destacadosData, recientesData, topCategoriasData] = await Promise.all([
      getEstadisticasHome(),
      getDocumentosDestacados(8),
      getDocumentosRecentesConExplicaciones(12, 3), // Últimos 3 días, hasta 12 docs
      getTopCategoriasActivas(4),
    ])

    stats.value = statsData

    // Transform and enrich with multi-category data
    const destacadosTransformados = transformarDocumentos(destacadosData)
    const recientesTransformados = transformarDocumentos(recientesData)

    // Enrich with categories in parallel
    const [destacadosEnriquecidos, recientesEnriquecidos] = await Promise.all([
      enrichDocumentosConCategorias(destacadosTransformados),
      enrichDocumentosConCategorias(recientesTransformados)
    ])

    destacados.value = destacadosEnriquecidos
    recientes.value = recientesEnriquecidos
    topCategorias.value = topCategoriasData
  } catch (error) {
    console.error('Error loading home data:', error)
  }
})

// Métodos
function abrirDetalle(documento: DocumentoTransformado) {
  documentoSeleccionado.value = documento
  modalAbierto.value = true
}

function cerrarDetalle() {
  modalAbierto.value = false
  documentoSeleccionado.value = null
}

// SEO
useHead({
  title: 'BOE Explicado - El Boletín Oficial del Estado para Todos',
  meta: [
    {
      name: 'description',
      content: 'Te ayudamos a entender el Boletín Oficial del Estado. Explicaciones claras de oposiciones, ayudas, legislación y más. 100% gratis. Verifica siempre en BOE.es oficial.',
    },
  ],
})
</script>
