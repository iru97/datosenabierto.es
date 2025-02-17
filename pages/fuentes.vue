<template>
  <main class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
      <div class="max-w-7xl mx-auto px-4 py-12">
        <h1 class="text-3xl md:text-4xl font-bold mb-4">
          Fuentes de Datos
        </h1>
        <p class="text-blue-100 max-w-2xl">
          Descubre las fuentes oficiales y bases de datos que utilizamos
          para proporcionar información precisa y actualizada.
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Fuentes Principales -->
      <section class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-bold mb-6">Fuentes Principales</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Transparencia -->
          <div class="border rounded-lg p-6">
            <div class="flex items-center mb-4">
              <BarChart2 class="h-6 w-6 text-blue-600 mr-2" />
              <h3 class="text-xl font-semibold">Transparencia</h3>
            </div>
            <ul class="space-y-4">
              <li>
                <h4 class="font-medium text-gray-900">Portal de Contratación del Estado</h4>
                <p class="text-sm text-gray-600">
                  Datos oficiales sobre contratos públicos y licitaciones.
                </p>
                <a href="https://contrataciondelestado.es" class="text-sm text-blue-600 hover:text-blue-800">
                  contrataciondelestado.es
                </a>
              </li>
              <li>
                <h4 class="font-medium text-gray-900">Portal de Transparencia</h4>
                <p class="text-sm text-gray-600">
                  Información sobre presupuestos y gastos públicos.
                </p>
                <a href="https://transparencia.gob.es" class="text-sm text-blue-600 hover:text-blue-800">
                  transparencia.gob.es
                </a>
              </li>
            </ul>
          </div>

          <!-- Salud -->
          <div class="border rounded-lg p-6">
            <div class="flex items-center mb-4">
              <Activity class="h-6 w-6 text-blue-600 mr-2" />
              <h3 class="text-xl font-semibold">Salud</h3>
            </div>
            <ul class="space-y-4">
              <li>
                <h4 class="font-medium text-gray-900">Ministerio de Sanidad</h4>
                <p class="text-sm text-gray-600">
                  Estadísticas sanitarias y datos epidemiológicos.
                </p>
                <a href="https://www.sanidad.gob.es" class="text-sm text-blue-600 hover:text-blue-800">
                  sanidad.gob.es
                </a>
              </li>
              <li>
                <h4 class="font-medium text-gray-900">Instituto de Salud Carlos III</h4>
                <p class="text-sm text-gray-600">
                  Investigación y vigilancia epidemiológica.
                </p>
                <a href="https://www.isciii.es" class="text-sm text-blue-600 hover:text-blue-800">
                  isciii.es
                </a>
              </li>
            </ul>
          </div>

          <!-- Movilidad -->
          <div class="border rounded-lg p-6">
            <div class="flex items-center mb-4">
              <Bus class="h-6 w-6 text-blue-600 mr-2" />
              <h3 class="text-xl font-semibold">Movilidad</h3>
            </div>
            <ul class="space-y-4">
              <li>
                <h4 class="font-medium text-gray-900">DGT</h4>
                <p class="text-sm text-gray-600">
                  Datos de tráfico y seguridad vial.
                </p>
                <a href="https://www.dgt.es" class="text-sm text-blue-600 hover:text-blue-800">
                  dgt.es
                </a>
              </li>
              <li>
                <h4 class="font-medium text-gray-900">EMT Madrid</h4>
                <p class="text-sm text-gray-600">
                  Información sobre transporte público urbano.
                </p>
                <a href="https://www.emtmadrid.es" class="text-sm text-blue-600 hover:text-blue-800">
                  emtmadrid.es
                </a>
              </li>
            </ul>
          </div>

          <!-- Medio Ambiente -->
          <div class="border rounded-lg p-6">
            <div class="flex items-center mb-4">
              <TreePine class="h-6 w-6 text-blue-600 mr-2" />
              <h3 class="text-xl font-semibold">Medio Ambiente</h3>
            </div>
            <ul class="space-y-4">
              <li>
                <h4 class="font-medium text-gray-900">AEMET</h4>
                <p class="text-sm text-gray-600">
                  Datos meteorológicos y climáticos.
                </p>
                <a href="https://www.aemet.es" class="text-sm text-blue-600 hover:text-blue-800">
                  aemet.es
                </a>
              </li>
              <li>
                <h4 class="font-medium text-gray-900">Ministerio para la Transición Ecológica</h4>
                <p class="text-sm text-gray-600">
                  Calidad del aire y emisiones.
                </p>
                <a href="https://www.miteco.gob.es" class="text-sm text-blue-600 hover:text-blue-800">
                  miteco.gob.es
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Licencias -->
      <section class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-bold mb-6">Licencias y Términos de Uso</h2>
        
        <div class="space-y-6">
          <div class="flex items-start">
            <FileText class="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 class="text-lg font-semibold mb-2">Datos Abiertos</h3>
              <p class="text-gray-600">
                Los datos se publican bajo licencias abiertas que permiten su
                reutilización:
              </p>
              <ul class="list-disc list-inside mt-2 text-gray-600 ml-4">
                <li>Creative Commons Attribution 4.0</li>
                <li>Open Government License</li>
                <li>Public Domain Dedication</li>
              </ul>
            </div>
          </div>

          <div class="flex items-start">
            <AlertCircle class="h-6 w-6 text-yellow-500 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 class="text-lg font-semibold mb-2">Restricciones</h3>
              <p class="text-gray-600">
                Algunas fuentes pueden tener restricciones específicas:
              </p>
              <ul class="list-disc list-inside mt-2 text-gray-600 ml-4">
                <li>Atribución obligatoria</li>
                <li>Uso no comercial</li>
                <li>Limitaciones de API</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Colaboración -->
      <section class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-6">Colaboración</h2>
        
        <div class="prose max-w-none">
          <p class="text-gray-600">
            Trabajamos en estrecha colaboración con instituciones públicas y
            privadas para mejorar la calidad y disponibilidad de los datos.
            Si representas a una organización y deseas colaborar, contáctanos.
          </p>
          
          <div class="mt-6">
            <a
              href="mailto:colaboracion@datosenabierto.es"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Mail class="h-4 w-4 mr-2" />
              Contactar para colaborar
            </a>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  BarChart2, Activity, Bus, TreePine,
  FileText, AlertCircle, Mail
} from 'lucide-vue-next'

useHead({
  title: 'Fuentes de Datos',
  meta: [
    {
      name: 'description',
      content: 'Conoce las fuentes oficiales y bases de datos que utilizamos para proporcionar información precisa y actualizada.'
    }
  ]
})
</script>