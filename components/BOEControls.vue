<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
    <div class="flex flex-wrap gap-4 items-center">
      <div class="flex-1 min-w-[200px] flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
          <DatePicker
            v-model="startDate"
            :max-date="maxAllowedDate"
            :masks="masks"
            :attributes="attributes"
            class="w-full"
          >
            <template #default="{ inputValue, inputEvents }">
              <div class="relative">
                <input
                  :value="inputValue"
                  v-on="inputEvents"
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Fecha inicial"
                  aria-label="Fecha inicial"
                />
                <CalendarIcon class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </template>
          </DatePicker>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
          <DatePicker
            v-model="endDate"
            :max-date="maxAllowedDate"
            :min-date="startDate"
            :masks="masks"
            :attributes="attributes"
            class="w-full"
          >
            <template #default="{ inputValue, inputEvents }">
              <div class="relative">
                <input
                  :value="inputValue"
                  v-on="inputEvents"
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Fecha final"
                  aria-label="Fecha final"
                />
                <CalendarIcon class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </template>
          </DatePicker>
        </div>
      </div>
      <button
        @click="handleFetch"
        class="btn btn-primary flex items-center gap-2 py-2.5 px-6"
        :disabled="loading || !isValidDateRange"
        :aria-busy="loading"
      >
        <ArrowPathIcon v-if="loading" class="h-5 w-5 animate-spin" />
        <MagnifyingGlassIcon v-else class="h-5 w-5" />
        Consultar BOE
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'

const props = defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  'fetch': [{ startDate: Date, endDate: Date }]
}>()

const maxAllowedDate = new Date()
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)

const masks = {
  input: 'DD/MM/YYYY',
  data: 'YYYY-MM-DD'
}

const attributes = [
  {
    key: 'today',
    highlight: true,
    dates: new Date()
  }
]

const isValidDateRange = computed(() => {
  return startDate.value && endDate.value && startDate.value <= endDate.value
})

const handleFetch = () => {
  if (startDate.value && endDate.value && isValidDateRange.value) {
    emit('fetch', { 
      startDate: startDate.value, 
      endDate: endDate.value 
    })
  }
}
</script>