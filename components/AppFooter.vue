<template>
  <footer class="bg-gray-800 text-white">
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">DatosEnAbierto</h3>
          <p class="text-gray-300">
            Facilitando el acceso a datos públicos de manera clara y comprensible.
          </p>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-4">Categorías</h4>
          <ul class="space-y-2">
            <li v-for="category in categories" :key="category.path">
              <NuxtLink :to="category.path" class="text-gray-300 hover:text-white">
                {{ category.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-4">Recursos</h4>
          <ul class="space-y-2">
            <li><NuxtLink to="/metodologia" class="text-gray-300 hover:text-white">Metodología</NuxtLink></li>
            <li><NuxtLink to="/fuentes" class="text-gray-300 hover:text-white">Fuentes</NuxtLink></li>
          </ul>
        </div>
      </div>
      <div class="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
        <p>&copy; {{ new Date().getFullYear() }} DatosEnAbierto. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const categories = [
  { name: 'Transparencia', path: '/transparencia' },
  { name: 'Salud', path: '/salud' },
  { name: 'Movilidad', path: '/movilidad' },
  { name: 'Medio Ambiente', path: '/ambiente' },
  { name: 'Educación', path: '/educacion' }
]
</script>