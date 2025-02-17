<template>
  <div class="relative" role="img" aria-label="Gráfico de anillo">
    <Doughnut
      v-if="chartData"
      :data="chartData"
      :options="chartOptions"
    />
    <div v-if="centerText" class="absolute inset-0 flex items-center justify-center">
      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900">{{ centerText }}</div>
        <div v-if="centerSubtext" class="text-sm text-gray-500">{{ centerSubtext }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

const props = defineProps<{
  data: number[]
  labels: string[]
  centerText?: string
  centerSubtext?: string
  colors?: string[]
}>()

const defaultColors = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899'
]

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.data,
      backgroundColor: props.colors || defaultColors,
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 4
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  radius: '90%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        },
        generateLabels: (chart: any) => {
          const data = chart.data
          return data.labels.map((label: string, index: number) => {
            const value = data.datasets[0].data[index]
            const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return {
              text: `${label} (${percentage}%)`,
              fillStyle: data.datasets[0].backgroundColor[index],
              strokeStyle: '#fff',
              lineWidth: 2,
              hidden: false,
              index
            }
          })
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#4b5563',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      callbacks: {
        label: (context: any) => {
          const value = context.raw
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${context.label}: ${value.toLocaleString()} (${percentage}%)`
        }
      }
    }
  }
}
</script>