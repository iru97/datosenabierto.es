<template>
  <div class="relative" role="img" :aria-label="`Gráfico de barras: ${label}`">
    <Bar
      v-if="chartData"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps<{
  data: number[]
  labels: string[]
  label: string
  color?: string
  stacked?: boolean
  horizontal?: boolean
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.label,
      data: props.data,
      backgroundColor: props.color || '#3b82f6',
      borderRadius: 4,
      maxBarThickness: 40,
      barPercentage: 0.8,
      categoryPercentage: 0.8
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: props.horizontal ? 'y' as const : 'x' as const,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#4b5563',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context: any) => {
          return `${context.dataset.label}: ${context.parsed[props.horizontal ? 'x' : 'y'].toLocaleString()}`
        }
      }
    }
  },
  scales: {
    y: {
      stacked: props.stacked,
      beginAtZero: true,
      grid: {
        display: !props.horizontal,
        color: '#e5e7eb'
      },
      ticks: {
        callback: (value: number) => value.toLocaleString(),
        font: {
          size: 11
        }
      }
    },
    x: {
      stacked: props.stacked,
      grid: {
        display: props.horizontal,
        color: '#e5e7eb'
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  }
}
</script>