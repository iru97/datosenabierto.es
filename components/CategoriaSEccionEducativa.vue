<template>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 md:p-8 mb-8 border border-blue-100">
    <div class="flex items-start gap-4 mb-6">
      <div class="text-5xl">{{ icono }}</div>
      <div class="flex-1">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          {{ titulo }}
        </h2>
        <p class="text-gray-700 text-lg">
          {{ descripcion }}
        </p>
      </div>
    </div>

    <!-- Sección: ¿Qué encontrarás aquí? -->
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-lg p-5 shadow-sm">
        <h3 class="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
          <span>🔍</span>
          <span>¿Qué encontrarás aquí?</span>
        </h3>
        <ul class="space-y-2 text-gray-700">
          <li v-for="item in queEncontraras" :key="item" class="flex items-start gap-2">
            <span class="text-blue-500 mt-1">✓</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <div class="bg-white rounded-lg p-5 shadow-sm">
        <h3 class="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
          <span>👥</span>
          <span>¿Para quién es útil?</span>
        </h3>
        <ul class="space-y-2 text-gray-700">
          <li v-for="perfil in paraQuien" :key="perfil" class="flex items-start gap-2">
            <span class="text-green-500 mt-1">→</span>
            <span>{{ perfil }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Consejos prácticos -->
    <div v-if="consejos && consejos.length > 0" class="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
      <h3 class="flex items-center gap-2 text-base font-bold text-amber-900 mb-2">
        <span>💡</span>
        <span>Consejos prácticos</span>
      </h3>
      <ul class="space-y-1 text-sm text-gray-700">
        <li v-for="consejo in consejos" :key="consejo">
          {{ consejo }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icono: string
  titulo: string
  descripcion: string
  queEncontraras: string[]
  paraQuien: string[]
  consejos?: string[]
}

withDefaults(defineProps<Props>(), {
  consejos: () => []
})
</script>
