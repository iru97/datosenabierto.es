<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with Navigation -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo and Title -->
          <NuxtLink to="/" class="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <NewspaperIcon class="h-7 w-7" />
            <div>
              <h1 class="text-xl font-bold leading-tight">BOE Explicado</h1>
              <p class="text-xs text-gray-500">Para todos los ciudadanos</p>
            </div>
          </NuxtLink>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink
              to="/categorias"
              class="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              active-class="text-blue-600 font-semibold"
            >
              Categorías
            </NuxtLink>
            <NuxtLink
              to="/buscar"
              class="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              active-class="text-blue-600 font-semibold"
            >
              Buscar
            </NuxtLink>
          </nav>

          <!-- Mobile Menu Button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 text-gray-600 hover:text-blue-600"
            aria-label="Toggle menu"
          >
            <Bars3Icon v-if="!mobileMenuOpen" class="h-6 w-6" />
            <XMarkIcon v-else class="h-6 w-6" />
          </button>
        </div>

        <!-- Mobile Menu -->
        <div
          v-if="mobileMenuOpen"
          class="md:hidden mt-4 pt-4 border-t border-gray-200"
        >
          <nav class="flex flex-col gap-3">
            <NuxtLink
              to="/categorias"
              class="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
              active-class="text-blue-600 font-semibold"
              @click="mobileMenuOpen = false"
            >
              Categorías
            </NuxtLink>
            <NuxtLink
              to="/buscar"
              class="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
              active-class="text-blue-600 font-semibold"
              @click="mobileMenuOpen = false"
            >
              Buscar
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
        <p>
          Datos abiertos del
          <a
            href="https://www.boe.es"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:underline"
          >
            Boletín Oficial del Estado
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NewspaperIcon, Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const mobileMenuOpen = ref(false)
</script>
