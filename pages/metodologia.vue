<template>
  <main class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white">
      <div class="max-w-7xl mx-auto px-4 py-12">
        <h1 class="text-3xl md:text-4xl font-bold mb-4">
          Metodología
        </h1>
        <p class="text-indigo-100 max-w-2xl">
          Conoce cómo recopilamos, procesamos y presentamos los datos públicos
          para garantizar su calidad y transparencia.
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Proceso -->
      <section class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-bold mb-6">Proceso de Datos</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-indigo-50 rounded-lg p-6">
            <div class="flex items-center mb-4">
              <Database class="h-6 w-6 text-indigo-600 mr-2" />
              <h3 class="text-lg font-semibold">Recopilación</h3>
            </div>
            <p class="text-gray-600">
              Obtenemos datos de fuentes oficiales mediante APIs y web scraping
              automatizado. Cada fuente se verifica y valida.
            </p>
          </div>

          <div class="bg-indigo-50 rounded-lg p-6">
            <div class="flex items-center mb-4">
              <Settings class="h-6 w-6 text-indigo-600 mr-2" />
              <h3 class="text-lg font-semibold">Procesamiento</h3>
            </div>
            <p class="text-gray-600">
              Limpiamos y estructuramos los datos siguiendo estándares
              internacionales. Aplicamos validaciones y controles de calidad.
            </p>
          </div>

          <div class="bg-indigo-50 rounded-lg p-6">
            <div class="flex items-center mb-4">
              <BarChart2 class="h-6 w-6 text-indigo-600 mr-2" />
              <h3 class="text-lg font-semibold">Visualización</h3>
            </div>
            <p class="text-gray-600">
              Transformamos los datos en visualizaciones interactivas y
              comprensibles, facilitando su análisis e interpretación.
            </p>
          </div>
        </div>
      </section>

      <!-- Estándares -->
      <section class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-bold mb-6">Estándares y Calidad</h2>
        
        <div class="space-y-6">
          <div class="flex items-start">
            <CheckCircle class="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 class="text-lg font-semibold mb-2">Validación de Datos</h3>
              <p class="text-gray-600">
                Implementamos múltiples niveles de validación para garantizar
                la precisión y consistencia de los datos:
              </p>
              <ul class="list-disc list-inside mt-2 text-gray-600 ml-4">
                <li>Verificación de tipos y formatos</li>
                <li>Detección de valores atípicos</li>
                <li>Validación cruzada entre fuentes</li>
                <li>Auditoría periódica de calidad</li>
              </ul>
            </div>
          </div>

          <div class="flex items-start">
            <Shield class="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 class="text-lg font-semibold mb-2">Seguridad y Privacidad</h3>
              <p class="text-gray-600">
                Seguimos estrictos protocolos de seguridad y privacidad:
              </p>
              <ul class="list-disc list-inside mt-2 text-gray-600 ml-4">
                <li>Cifrado de datos sensibles</li>
                <li>Anonimización de información personal</li>
                <li>Control de acceso y auditoría</li>
                <li>Cumplimiento de RGPD</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Actualizaciones -->
      <section class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-6">Frecuencia de Actualización</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frecuencia
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuente
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Transparencia
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Diaria
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Portal de Contratación
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  API REST
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Salud
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Semanal
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Ministerio de Sanidad
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  API + Scraping
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Movilidad
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Tiempo real
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  APIs de Transporte
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  API REST
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { Database, Settings, BarChart2, CheckCircle, Shield } from 'lucide-vue-next'

useHead({
  title: 'Metodología',
  meta: [
    {
      name: 'description',
      content: 'Conoce nuestra metodología para la recopilación, procesamiento y visualización de datos públicos.'
    }
  ]
})
</script>