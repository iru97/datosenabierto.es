import { computed } from 'vue'

export function useChartConfig() {
  const colors = {
    primary: {
      default: '#3b82f6',
      light: '#93c5fd',
      dark: '#2563eb'
    },
    success: {
      default: '#10b981',
      light: '#6ee7b7',
      dark: '#059669'
    },
    warning: {
      default: '#f59e0b',
      light: '#fcd34d',
      dark: '#d97706'
    },
    danger: {
      default: '#ef4444',
      light: '#fca5a5',
      dark: '#dc2626'
    },
    info: {
      default: '#8b5cf6',
      light: '#c4b5fd',
      dark: '#7c3aed'
    }
  }

  const gradients = computed(() => ({
    primary: (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, colors.primary.light)
      gradient.addColorStop(1, 'rgba(147, 197, 253, 0)')
      return gradient
    },
    success: (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, colors.success.light)
      gradient.addColorStop(1, 'rgba(110, 231, 183, 0)')
      return gradient
    }
  }))

  const defaultOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
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
            return `${context.dataset.label}: ${formatValue(context.parsed.y)}`
          }
        }
      },
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: '#e5e7eb',
          drawBorder: false
        },
        ticks: {
          callback: (value: number) => formatValue(value),
          font: {
            size: 11
          },
          padding: 8
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          padding: 8
        }
      }
    }
  }))

  const formatValue = (value: number, options: {
    style?: 'decimal' | 'currency' | 'percent'
    currency?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {}) => {
    const {
      style = 'decimal',
      currency = 'EUR',
      minimumFractionDigits = 0,
      maximumFractionDigits = 2
    } = options

    return new Intl.NumberFormat('es-ES', {
      style,
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(value)
  }

  const formatPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1) + '%'
  }

  return {
    colors,
    gradients,
    defaultOptions,
    formatValue,
    formatPercentage
  }
}