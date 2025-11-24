<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div class="container mx-auto px-4 py-16">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
          El BOE, Explicado para Todos 📚
        </h1>
        <p class="text-xl md:text-2xl text-blue-100 max-w-3xl mb-8">
          Información oficial del Boletín Oficial del Estado, organizada y explicada
          en lenguaje claro para que todos podamos entenderlo
        </p>
        <div class="flex flex-wrap gap-4">
          <NuxtLink
            to="/categorias"
            class="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg shadow-lg"
          >
            🗂️ Explorar por Categorías
          </NuxtLink>
          <button
            @click="scrollToViewer"
            class="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors text-lg"
          >
            📅 Buscar por Fecha
          </button>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="container mx-auto px-4 py-12">
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="bg-white rounded-xl p-8 shadow-md">
          <div class="text-5xl mb-4">🎯</div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">
            12 Categorías Organizadas
          </h3>
          <p class="text-gray-600">
            Oposiciones, Ayudas, Legislación, Empleo, Vivienda y más. Todo clasificado para que encuentres lo que necesitas rápidamente.
          </p>
          <NuxtLink
            to="/categorias"
            class="inline-flex items-center text-blue-600 font-semibold mt-4 hover:text-blue-700"
          >
            Ver categorías
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-md">
          <div class="text-5xl mb-4">💡</div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">
            Explicaciones Claras
          </h3>
          <p class="text-gray-600">
            Cada documento incluye resúmenes y explicaciones generadas con IA para que entiendas qué es y cómo te afecta.
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-md">
          <div class="text-5xl mb-4">🆓</div>
          <h3 class="text-xl font-bold text-gray-800 mb-3">
            100% Gratuito
          </h3>
          <p class="text-gray-600">
            Sin registro, sin pagos, sin límites. Acceso libre y gratuito a toda la información del BOE explicada.
          </p>
        </div>
      </div>

      <!-- Original Viewer Section -->
      <div ref="viewerSection" class="bg-white rounded-xl shadow-lg p-8">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">
            📅 Buscar BOE por Fecha
          </h2>
          <p class="text-gray-600">
            Si prefieres explorar los boletines oficiales día a día, puedes usar el visor tradicional:
          </p>
        </div>

        <BOEControls
          :loading="isLoading"
          @fetch="fetchBoletinData"
        />

        <BOEContent
          :loading="isLoading"
          :error="errorMessage"
          :progress="progress"
          :weekly-data="weeklyData"
        />
      </div>
    </div>

    <!-- About Section -->
    <div class="bg-gray-100 py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-6">
            ¿Por qué este proyecto?
          </h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            El BOE publica miles de documentos cada semana que afectan directamente a millones
            de españoles: oposiciones, ayudas, cambios legales, y mucho más. Pero encontrar
            y entender esta información puede ser complicado.
          </p>
          <p class="text-lg text-gray-700 leading-relaxed">
            <strong>Nuestra misión:</strong> hacer que la información oficial del Estado sea
            accesible y comprensible para todos, sin importar tu nivel de conocimiento legal.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO
useHead({
  title: 'BOE Explicado - El Boletín Oficial del Estado para Todos',
  meta: [
    {
      name: 'description',
      content: 'Explora el Boletín Oficial del Estado organizado por categorías y explicado en lenguaje claro. 100% gratis. Oposiciones, ayudas, legislación y más.',
    },
  ],
})

const {
  loading: isLoading,
  error: errorMessage,
  weeklyData,
  progress,
  fetchSumario
} = useBOE()

const viewerSection = ref<HTMLElement | null>(null)

const fetchBoletinData = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  fetchSumario({ startDate, endDate })
}

function scrollToViewer() {
  viewerSection.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>