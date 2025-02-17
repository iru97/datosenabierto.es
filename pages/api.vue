<template>
  <main class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 py-12">
        <h1 class="text-3xl md:text-4xl font-bold mb-4">
          Documentación de la API
        </h1>
        <p class="text-gray-200 max-w-2xl">
          Accede a los datos de DatosEnAbierto a través de nuestra API RESTful.
          Documentación completa y ejemplos de uso.
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Introducción -->
      <section class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-bold mb-4">Introducción</h2>
        <p class="text-gray-600 mb-4">
          La API de DatosEnAbierto permite acceder programáticamente a todos los datos
          disponibles en la plataforma. Utiliza estándares REST y devuelve respuestas en
          formato JSON.
        </p>
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-2">URL Base</h3>
          <code class="bg-gray-800 text-white px-4 py-2 rounded">
            https://api.datosenabierto.es/v1
          </code>
        </div>
      </section>

      <!-- Autenticación -->
      <section class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-bold mb-4">Autenticación</h2>
        <p class="text-gray-600 mb-4">
          Todas las peticiones deben incluir un token de API en la cabecera de autorización.
        </p>
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-2">Ejemplo de Cabecera</h3>
          <code class="block bg-gray-800 text-white px-4 py-2 rounded">
            Authorization: Bearer tu_token_aquí
          </code>
        </div>
      </section>

      <!-- Endpoints -->
      <section class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-2xl font-bold mb-4">Endpoints</h2>
        
        <div class="space-y-6">
          <!-- Transparencia -->
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-xl font-semibold mb-4">Transparencia</h3>
            
            <div class="space-y-4">
              <div>
                <h4 class="text-lg font-medium text-gray-800 mb-2">
                  Obtener Presupuestos
                </h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  <code class="block text-sm mb-2">
                    GET /transparency/{year}
                  </code>
                  <p class="text-sm text-gray-600">
                    Devuelve la distribución presupuestaria para el año especificado.
                  </p>
                </div>
              </div>

              <div>
                <h4 class="text-lg font-medium text-gray-800 mb-2">
                  Listar Contratos
                </h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  <code class="block text-sm mb-2">
                    GET /contracts
                  </code>
                  <p class="text-sm text-gray-600">
                    Lista los contratos públicos con opciones de paginación y filtrado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Salud -->
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-xl font-semibold mb-4">Salud</h3>
            
            <div>
              <h4 class="text-lg font-medium text-gray-800 mb-2">
                Datos de Salud
              </h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <code class="block text-sm mb-2">
                  GET /health
                </code>
                <p class="text-sm text-gray-600">
                  Obtiene estadísticas y datos del sistema sanitario.
                </p>
              </div>
            </div>
          </div>

          <!-- Movilidad -->
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-xl font-semibold mb-4">Movilidad</h3>
            
            <div>
              <h4 class="text-lg font-medium text-gray-800 mb-2">
                Datos de Movilidad
              </h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <code class="block text-sm mb-2">
                  GET /mobility
                </code>
                <p class="text-sm text-gray-600">
                  Obtiene información sobre transporte y movilidad urbana.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Ejemplos -->
      <section class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Ejemplos de Uso</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold mb-2">Consultar Presupuestos</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <code class="block text-sm">
                curl -X GET \<br>
                &nbsp;&nbsp;https://api.datosenabierto.es/v1/transparency/2024 \<br>
                &nbsp;&nbsp;-H 'Authorization: Bearer tu_token'
              </code>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold mb-2">Filtrar Contratos</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <code class="block text-sm">
                curl -X GET \<br>
                &nbsp;&nbsp;'https://api.datosenabierto.es/v1/contracts?department=sanidad&limit=10' \<br>
                &nbsp;&nbsp;-H 'Authorization: Bearer tu_token'
              </code>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'Documentación de la API',
  meta: [
    {
      name: 'description',
      content: 'Documentación completa de la API de DatosEnAbierto. Accede a datos públicos a través de nuestra API RESTful.'
    }
  ]
})
</script>