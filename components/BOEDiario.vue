<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
    <div class="border-b border-gray-100 p-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <NewspaperIcon class="h-5 w-5 text-blue-600" />
          Diario {{ diario.numero }}
        </h2>
        <a 
          :href="diario.sumario_diario?.url_pdf" 
          target="_blank"
          class="text-blue-600 hover:text-blue-700"
          title="Ver PDF completo"
          rel="noopener noreferrer"
        >
          <DocumentIcon class="h-5 w-5" />
        </a>
      </div>
    </div>
    
    <div class="p-4 space-y-6">
      <div v-for="seccion in diario.secciones" :key="seccion.codigo">
        <div class="flex items-center gap-2 text-gray-700 mb-3">
          <FolderIcon class="h-5 w-5 text-amber-500" />
          <h3 class="font-medium">{{ seccion.nombre }}</h3>
        </div>
        
        <div v-for="departamento in seccion.departamentos" :key="departamento.codigo" class="ml-4 mb-4">
          <div class="flex items-center gap-2 text-gray-600 mb-2">
            <BuildingOfficeIcon class="h-5 w-5 text-gray-400" />
            <h4 class="font-medium text-sm">{{ departamento.nombre }}</h4>
          </div>
          
          <div v-for="epigrafe in departamento.epigrafes" :key="epigrafe.nombre" class="ml-4">
            <div class="flex items-center gap-2 text-gray-500 mb-2">
              <ChevronRightIcon class="h-4 w-4" />
              <h5 class="text-sm">{{ epigrafe.nombre }}</h5>
            </div>
            
            <ul class="space-y-3 ml-6">
              <BOEItem 
                v-for="item in epigrafe.items" 
                :key="item.identificador"
                :item="item"
              />
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NewspaperIcon,
  FolderIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  DocumentIcon,
} from '@heroicons/vue/24/outline'
import type { BOEDiario as BOEDiarioType } from '~/types/boe'

defineProps<{
  diario: BOEDiarioType
}>()
</script>