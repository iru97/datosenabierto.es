<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <Breadcrumbs
          :breadcrumbs="[{ label: 'Buscar por fechas' }]"
        />

        <div class="mt-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-3">
            📅 Buscar por fechas importantes
          </h1>
          <p class="text-lg text-gray-600 max-w-3xl">
            Encuentra documentos del BOE organizados por sus fechas límite y
            plazos. Te ayudamos a no perder ningún plazo importante.
          </p>
        </div>

        <!-- Educational disclaimer -->
        <div class="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <p class="text-sm text-blue-800">
            <strong>💡 Esta herramienta es educativa:</strong> Te mostramos
            fechas importantes de forma organizada, pero debes verificar siempre
            los plazos en el
            <a
              href="https://www.boe.es"
              target="_blank"
              rel="noopener noreferrer"
              class="underline font-medium hover:text-blue-900"
            >
              BOE oficial
            </a>
            antes de actuar. No somos fuente oficial ni sustituimos al BOE.
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-8">
        <FiltrosInteligentes
          :resultados-count="totalDocumentos"
          @filtros-changed="aplicarFiltros"
        />
      </div>

      <!-- Loading state -->
      <div v-if="cargando" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 mt-4">Cargando documentos...</p>
      </div>

      <!-- Content -->
      <div v-else class="space-y-8">
        <!-- URGENTE Section (< 7 días) -->
        <section v-if="documentosUrgentes.length > 0">
          <div class="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 text-white mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span class="text-2xl">⏰</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold">Atención: Plazos urgentes</h2>
                <p class="text-red-100 mt-1">
                  {{ documentosUrgentes.length }} documento{{ documentosUrgentes.length !== 1 ? 's' : '' }}
                  con plazo en menos de 7 días
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DocumentoCardEducativo
              v-for="doc in documentosUrgentes"
              :key="doc.id"
              :documento="doc"
              @ver-detalle="abrirDetalle(doc)"
            />
          </div>
        </section>

        <!-- PRÓXIMO Section (7-30 días) -->
        <section v-if="documentosProximos.length > 0">
          <div class="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span class="text-2xl">📅</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold">Próximos plazos</h2>
                <p class="text-amber-100 mt-1">
                  {{ documentosProximos.length }} documento{{ documentosProximos.length !== 1 ? 's' : '' }}
                  con plazo entre 7 y 30 días
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DocumentoCardEducativo
              v-for="doc in documentosProximos"
              :key="doc.id"
              :documento="doc"
              @ver-detalle="abrirDetalle(doc)"
            />
          </div>
        </section>

        <!-- MÁS ADELANTE Section (> 30 días) -->
        <section v-if="documentosPosteriores.length > 0">
          <div class="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-6 text-white mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span class="text-2xl">📆</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold">Plazos más adelante</h2>
                <p class="text-blue-100 mt-1">
                  {{ documentosPosteriores.length }} documento{{ documentosPosteriores.length !== 1 ? 's' : '' }}
                  con plazo en más de 30 días
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DocumentoCardEducativo
              v-for="doc in documentosPosteriores"
              :key="doc.id"
              :documento="doc"
              @ver-detalle="abrirDetalle(doc)"
            />
          </div>
        </section>

        <!-- RECIENTES SIN PLAZO Section -->
        <section v-if="documentosRecientesSinPlazo.length > 0">
          <div class="bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg p-6 text-white mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <span class="text-2xl">✨</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold">Recién publicados</h2>
                <p class="text-gray-100 mt-1">
                  {{ documentosRecientesSinPlazo.length }} documento{{ documentosRecientesSinPlazo.length !== 1 ? 's' : '' }}
                  sin plazo específico
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DocumentoCardEducativo
              v-for="doc in documentosRecientesSinPlazo"
              :key="doc.id"
              :documento="doc"
              @ver-detalle="abrirDetalle(doc)"
            />
          </div>
        </section>

        <!-- Empty state -->
        <div
          v-if="!cargando && totalDocumentos === 0"
          class="text-center py-16"
        >
          <div class="text-6xl mb-4">📅</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">
            No hay documentos con los filtros seleccionados
          </h3>
          <p class="text-gray-600 mb-6">
            Intenta cambiar los filtros o busca en el BOE oficial
          </p>
          <a
            href="https://www.boe.es"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ir al BOE oficial →
          </a>
        </div>
      </div>
    </div>

    <!-- Documento detalle modal -->
    <DocumentoDetalle
      v-model="modalAbierto"
      :documento="documentoSeleccionado"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Breadcrumbs from '~/components/Breadcrumbs.vue'
import FiltrosInteligentes from '~/components/FiltrosInteligentes.vue'
import DocumentoCardEducativo from '~/components/DocumentoCardEducativo.vue'
import DocumentoDetalle from '~/components/DocumentoDetalle.vue'

// State
const cargando = ref(true)
const documentos = ref<any[]>([])
const filtrosActivos = ref<any>({})
const modalAbierto = ref(false)
const documentoSeleccionado = ref<any>(null)

// Computed
const documentosFiltrados = computed(() => {
  let docs = [...documentos.value]

  // Apply filters
  if (filtrosActivos.value.categoria) {
    docs = docs.filter(
      (d) => d.categoria === filtrosActivos.value.categoria
    )
  }

  if (filtrosActivos.value.organismo) {
    docs = docs.filter((d) =>
      d.organismo
        ?.toLowerCase()
        .includes(filtrosActivos.value.organismo.toLowerCase())
    )
  }

  if (filtrosActivos.value.plazo) {
    const dias = parseInt(filtrosActivos.value.plazo)
    docs = docs.filter((d) => {
      if (!d.fechaImportante?.diasRestantes) return false
      return d.fechaImportante.diasRestantes <= dias
    })
  }

  if (filtrosActivos.value.publicacion) {
    const dias = parseInt(filtrosActivos.value.publicacion)
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - dias)
    docs = docs.filter((d) => {
      const fechaPub = new Date(d.fechaPublicacion)
      return fechaPub >= fechaLimite
    })
  }

  return docs
})

const documentosUrgentes = computed(() => {
  return documentosFiltrados.value
    .filter(
      (d) =>
        d.fechaImportante?.diasRestantes !== null &&
        d.fechaImportante?.diasRestantes < 7
    )
    .sort(
      (a, b) =>
        (a.fechaImportante?.diasRestantes ?? 999) -
        (b.fechaImportante?.diasRestantes ?? 999)
    )
})

const documentosProximos = computed(() => {
  return documentosFiltrados.value
    .filter(
      (d) =>
        d.fechaImportante?.diasRestantes !== null &&
        d.fechaImportante?.diasRestantes >= 7 &&
        d.fechaImportante?.diasRestantes <= 30
    )
    .sort(
      (a, b) =>
        (a.fechaImportante?.diasRestantes ?? 999) -
        (b.fechaImportante?.diasRestantes ?? 999)
    )
})

const documentosPosteriores = computed(() => {
  return documentosFiltrados.value
    .filter(
      (d) =>
        d.fechaImportante?.diasRestantes !== null &&
        d.fechaImportante?.diasRestantes > 30
    )
    .sort(
      (a, b) =>
        (a.fechaImportante?.diasRestantes ?? 999) -
        (b.fechaImportante?.diasRestantes ?? 999)
    )
})

const documentosRecientesSinPlazo = computed(() => {
  const fechaLimite = new Date()
  fechaLimite.setDate(fechaLimite.getDate() - 30)

  return documentosFiltrados.value
    .filter((d) => {
      const fechaPub = new Date(d.fechaPublicacion)
      return (
        !d.fechaImportante?.diasRestantes && fechaPub >= fechaLimite
      )
    })
    .sort(
      (a, b) =>
        new Date(b.fechaPublicacion).getTime() -
        new Date(a.fechaPublicacion).getTime()
    )
})

const totalDocumentos = computed(() => {
  return (
    documentosUrgentes.value.length +
    documentosProximos.value.length +
    documentosPosteriores.value.length +
    documentosRecientesSinPlazo.value.length
  )
})

// Methods
function aplicarFiltros(filtros: any) {
  filtrosActivos.value = filtros
}

function abrirDetalle(doc: any) {
  documentoSeleccionado.value = doc
  modalAbierto.value = true
}

async function cargarDocumentos() {
  cargando.value = true
  try {
    // TODO: Replace with actual Supabase query
    // const supabase = useSupabaseClient()
    // const { data } = await supabase
    //   .from('documentos_boe')
    //   .select('*')
    //   .order('fecha_publicacion', { ascending: false })
    //   .limit(100)

    // Mock data for now
    documentos.value = []

    // In production, this will fetch from Supabase with processed LLM data
  } catch (error) {
    console.error('Error cargando documentos:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarDocumentos()
})
</script>
