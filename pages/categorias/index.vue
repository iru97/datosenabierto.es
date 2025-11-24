<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- Hero Section -->
    <div class="bg-blue-600 text-white">
      <div class="container mx-auto px-4 py-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          📚 Explora el BOE por Categorías
        </h1>
        <p class="text-xl md:text-2xl text-blue-100 max-w-3xl">
          Información clara y útil del Boletín Oficial del Estado, organizada por temas que te interesan
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 12" :key="n" class="animate-pulse">
          <div class="bg-gray-200 h-48 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 py-12">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-800 text-lg">❌ Error cargando categorías: {{ error }}</p>
        <button
          @click="fetchCategorias"
          class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    </div>

    <!-- Categories Grid -->
    <div v-else class="container mx-auto px-4 py-12">
      <!-- Priority 3 Categories (Most Important) -->
      <section class="mb-12">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-3xl">⭐⭐⭐</span>
          <h2 class="text-2xl font-bold text-gray-800">
            Más Buscado
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="categoria in categoriasPrioridad3"
            :key="categoria.id"
            :to="`/categorias/${categoria.slug}`"
            class="group"
          >
            <div
              class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-500 h-full"
            >
              <div
                class="p-6"
                :style="{ backgroundColor: `${categoria.color}15` }"
              >
                <div class="text-5xl mb-4">{{ categoria.icono }}</div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {{ categoria.nombre }}
                </h3>
                <p class="text-gray-600 text-sm mb-4">
                  {{ categoria.descripcion }}
                </p>
                <div class="flex items-center text-blue-600 font-semibold text-sm">
                  <span>Explorar</span>
                  <svg class="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Priority 2 Categories (Important) -->
      <section class="mb-12">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-2xl">⭐⭐</span>
          <h2 class="text-2xl font-bold text-gray-800">
            También Importante
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="categoria in categoriasPrioridad2"
            :key="categoria.id"
            :to="`/categorias/${categoria.slug}`"
            class="group"
          >
            <div
              class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-400 h-full"
            >
              <div
                class="p-6"
                :style="{ backgroundColor: `${categoria.color}10` }"
              >
                <div class="text-4xl mb-3">{{ categoria.icono }}</div>
                <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {{ categoria.nombre }}
                </h3>
                <p class="text-gray-600 text-xs mb-3 line-clamp-2">
                  {{ categoria.descripcion }}
                </p>
                <div class="flex items-center text-blue-600 font-semibold text-xs">
                  <span>Ver más</span>
                  <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Priority 1 Categories (Niche) -->
      <section>
        <div class="flex items-center gap-3 mb-6">
          <span class="text-xl">⭐</span>
          <h2 class="text-2xl font-bold text-gray-800">
            Otras Categorías
          </h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <NuxtLink
            v-for="categoria in categoriasPrioridad1"
            :key="categoria.id"
            :to="`/categorias/${categoria.slug}`"
            class="group"
          >
            <div
              class="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 p-4 border-2 border-transparent hover:border-blue-300 text-center"
            >
              <div class="text-3xl mb-2">{{ categoria.icono }}</div>
              <h3 class="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {{ categoria.nombre }}
              </h3>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Info Section -->
      <section class="mt-16 bg-blue-50 rounded-xl p-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          💡 ¿Cómo funciona esto?
        </h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div>
            <div class="text-3xl mb-2">📋</div>
            <h3 class="font-semibold text-lg mb-2">1. Organizado</h3>
            <p class="text-gray-600">
              Hemos clasificado miles de documentos del BOE en 12 categorías claras
            </p>
          </div>
          <div>
            <div class="text-3xl mb-2">🤖</div>
            <h3 class="font-semibold text-lg mb-2">2. Explicado</h3>
            <p class="text-gray-600">
              Cada documento incluye explicaciones en lenguaje sencillo de qué es y cómo te afecta
            </p>
          </div>
          <div>
            <div class="text-3xl mb-2">⚡</div>
            <h3 class="font-semibold text-lg mb-2">3. Actualizado</h3>
            <p class="text-gray-600">
              Se actualiza automáticamente cada semana con los últimos documentos publicados
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCategorias, type Categoria } from '~/utils/supabase'

// SEO
useHead({
  title: 'Categorías - BOE Explicado',
  meta: [
    {
      name: 'description',
      content: 'Explora el Boletín Oficial del Estado organizado por categorías: Oposiciones, Ayudas, Legislación, y más. Información clara y útil para todos.',
    },
  ],
})

// State
const loading = ref(true)
const error = ref<string | null>(null)
const categorias = ref<Categoria[]>([])

// Computed
const categoriasPrioridad3 = computed(() =>
  categorias.value.filter((c) => c.prioridad === 3)
)

const categoriasPrioridad2 = computed(() =>
  categorias.value.filter((c) => c.prioridad === 2)
)

const categoriasPrioridad1 = computed(() =>
  categorias.value.filter((c) => c.prioridad === 1)
)

// Methods
async function fetchCategorias() {
  loading.value = true
  error.value = null

  try {
    categorias.value = await getCategorias()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error fetching categorias:', err)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchCategorias()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
