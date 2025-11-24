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

    <!-- Explora por Categoría -->
    <div class="bg-blue-50 py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            🗂️ Explora por Categoría
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Te explicamos qué tipo de información encontrarás en cada sección
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
  </div>
</template>

<script setup lang="ts">
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
