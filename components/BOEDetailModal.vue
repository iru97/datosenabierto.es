<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[100] overflow-hidden">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="close"></div>

      <!-- Modal Container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <!-- Header (Fixed) -->
            <div class="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">
                  Boletín Oficial del Estado
                </h2>
                <p class="text-sm text-gray-600 mt-1">
                  {{ format(boletin.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) }}
                </p>
              </div>
              <button 
                @click="close"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>

            <!-- Content (Scrollable) -->
            <div class="flex-1 overflow-y-auto">
              <div class="p-6 space-y-6">
                <div v-for="diario in boletin.data.response.data.sumario.diario" :key="diario.numero">
                  <!-- Información General -->
                  <div class="sticky top-0 bg-white z-20 border-b border-gray-100 mb-4">
                    <div class="flex items-center justify-between py-2">
                      <div class="flex items-center gap-3">
                        <div class="bg-blue-100 text-blue-800 text-lg font-semibold px-4 py-2 rounded-lg">
                          Nº {{ diario.numero }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ formatFileSize(diario.sumario_diario.url_pdf.szBytes) }}
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <a 
                          :href="diario.sumario_diario.url_pdf.texto" 
                          target="_blank"
                          class="btn btn-primary px-4 py-2"
                          rel="noopener noreferrer"
                        >
                          <DocumentArrowDownIcon class="h-5 w-5" />
                          Descargar PDF
                        </a>
                      </div>
                    </div>
                  </div>

                  <!-- Estadísticas -->
                  <div class="grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-gray-50 rounded-lg p-4">
                      <p class="text-sm text-gray-500">Total Secciones</p>
                      <p class="text-2xl font-semibold text-gray-900">{{ getSectionCount(diario) }}</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4">
                      <p class="text-sm text-gray-500">Total Departamentos</p>
                      <p class="text-2xl font-semibold text-gray-900">{{ getDepartmentCount(diario) }}</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4">
                      <p class="text-sm text-gray-500">Total Disposiciones</p>
                      <p class="text-2xl font-semibold text-gray-900">{{ getItemCount(diario) }}</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4">
                      <p class="text-sm text-gray-500">Páginas</p>
                      <p class="text-2xl font-semibold text-gray-900">{{ getPageCount(diario) }}</p>
                    </div>
                  </div>

                  <!-- Contenido Estructurado -->
                  <div class="space-y-6">
                    <div v-for="seccion in diario.seccion" :key="seccion.codigo" class="border border-gray-200 rounded-lg">
                      <div class="sticky top-16 bg-gray-50 px-4 py-3 border-b border-gray-200 z-10">
                        <div class="flex items-center gap-2">
                          <FolderIcon class="h-5 w-5 text-blue-600" />
                          <h3 class="font-medium text-gray-900">
                            {{ seccion.nombre }}
                          </h3>
                        </div>
                      </div>

                      <div class="p-4">
                        <div v-for="dept in normalizeDepartamentos(seccion.departamento)" :key="dept.codigo" class="mb-6 last:mb-0">
                          <div class="flex items-center gap-2 mb-3">
                            <BuildingOfficeIcon class="h-5 w-5 text-gray-500" />
                            <h4 class="font-medium text-gray-700">{{ dept.nombre }}</h4>
                          </div>

                          <!-- Epígrafes y Items -->
                          <div class="ml-6 space-y-4">
                            <template v-if="dept.epigrafe">
                              <div v-for="epi in normalizeEpigrafes(dept.epigrafe)" :key="epi.nombre" class="border-l-2 border-gray-100 pl-4">
                                <h5 class="text-sm font-medium text-gray-600 mb-2">{{ epi.nombre }}</h5>
                                <div class="space-y-2">
                                  <div 
                                    v-for="item in normalizeItems(epi.item)" 
                                    :key="item.identificador"
                                    class="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                                  >
                                    <p class="text-sm text-gray-700 mb-2">{{ item.titulo }}</p>
                                    <div class="flex gap-2">
                                      <a 
                                        v-for="(url, type) in getItemUrls(item)"
                                        :key="type"
                                        :href="url"
                                        target="_blank"
                                        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-white rounded border border-gray-200 hover:bg-gray-50"
                                        :title="`Ver ${type.toUpperCase()}`"
                                        rel="noopener noreferrer"
                                      >
                                        <component :is="getUrlIcon(type)" class="h-3 w-3" />
                                        {{ type.toUpperCase() }}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </template>
                            <template v-if="dept.item">
                              <div 
                                v-for="item in normalizeItems(dept.item)" 
                                :key="item.identificador"
                                class="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                              >
                                <p class="text-sm text-gray-700 mb-2">{{ item.titulo }}</p>
                                <div class="flex gap-2">
                                  <a 
                                    v-for="(url, type) in getItemUrls(item)"
                                    :key="type"
                                    :href="url"
                                    target="_blank"
                                    class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-white rounded border border-gray-200 hover:bg-gray-50"
                                    :title="`Ver ${type.toUpperCase()}`"
                                    rel="noopener noreferrer"
                                  >
                                    <component :is="getUrlIcon(type)" class="h-3 w-3" />
                                    {{ type.toUpperCase() }}
                                  </a>
                                </div>
                              </div>
                            </template>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  XMarkIcon,
  DocumentArrowDownIcon,
  FolderIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  CommandLineIcon
} from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { BOEDiario, BOEDepartamento, BOEEpigrafe, BOEItem } from '~/types/boe'

const props = defineProps<{
  show: boolean
  boletin: {
    date: Date
    data: any
  }
}>()

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}

const formatFileSize = (bytes: string): string => {
  const size = parseInt(bytes)
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const getSectionCount = (diario: BOEDiario): number => {
  return diario.seccion?.length || 0
}

const getDepartmentCount = (diario: BOEDiario): number => {
  let count = 0
  diario.seccion?.forEach(seccion => {
    count += Array.isArray(seccion.departamento) 
      ? seccion.departamento.length 
      : 1
  })
  return count
}

const getItemCount = (diario: BOEDiario): number => {
  let count = 0
  diario.seccion?.forEach(seccion => {
    const departamentos = Array.isArray(seccion.departamento) 
      ? seccion.departamento 
      : [seccion.departamento]

    departamentos.forEach(dept => {
      if (dept.item) {
        count += Array.isArray(dept.item) ? dept.item.length : 1
      }
      if (dept.epigrafe) {
        const epigrafes = Array.isArray(dept.epigrafe) ? dept.epigrafe : [dept.epigrafe]
        epigrafes.forEach(epi => {
          count += Array.isArray(epi.item) ? epi.item.length : 1
        })
      }
    })
  })
  return count
}

const getPageCount = (diario: BOEDiario): number => {
  let firstPage = Number.MAX_SAFE_INTEGER
  let lastPage = 0

  const processItem = (item: BOEItem) => {
    const start = parseInt(item.url_pdf.pagina_inicial)
    const end = parseInt(item.url_pdf.pagina_final)
    if (!isNaN(start) && !isNaN(end)) {
      firstPage = Math.min(firstPage, start)
      lastPage = Math.max(lastPage, end)
    }
  }

  diario.seccion?.forEach(seccion => {
    const departamentos = Array.isArray(seccion.departamento) 
      ? seccion.departamento 
      : [seccion.departamento]

    departamentos.forEach(dept => {
      if (dept.item) {
        const items = Array.isArray(dept.item) ? dept.item : [dept.item]
        items.forEach(processItem)
      }
      if (dept.epigrafe) {
        const epigrafes = Array.isArray(dept.epigrafe) ? dept.epigrafe : [dept.epigrafe]
        epigrafes.forEach(epi => {
          const items = Array.isArray(epi.item) ? epi.item : [epi.item]
          items.forEach(processItem)
        })
      }
    })
  })

  return firstPage === Number.MAX_SAFE_INTEGER ? 0 : lastPage - firstPage + 1
}

const normalizeDepartamentos = (dept: BOEDepartamento | BOEDepartamento[]): BOEDepartamento[] => {
  return Array.isArray(dept) ? dept : [dept]
}

const normalizeEpigrafes = (epi: BOEEpigrafe | BOEEpigrafe[]): BOEEpigrafe[] => {
  return Array.isArray(epi) ? epi : [epi]
}

const normalizeItems = (items: BOEItem | BOEItem[]): BOEItem[] => {
  return Array.isArray(items) ? items : [items]
}

const getItemUrls = (item: BOEItem) => {
  const urls: Record<string, string> = {}
  if (item.url_pdf?.texto) urls.pdf = item.url_pdf.texto
  if (item.url_html) urls.html = item.url_html
  if (item.url_xml) urls.xml = item.url_xml
  return urls
}

const getUrlIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return DocumentArrowDownIcon
    case 'html':
      return CodeBracketIcon
    case 'xml':
      return CommandLineIcon
    default:
      return DocumentTextIcon
  }
}
</script>