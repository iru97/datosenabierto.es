import { computed } from 'vue'

export function useDataTransform() {
  const transformBudgetData = (data: any) => {
    if (!data) return null
    
    return {
      departments: data.departments.map((d: any) => ({
        name: d.name,
        amount: d.amount,
        percentage: d.percentage
      })),
      total: data.total,
      period: data.period
    }
  }

  const transformTimeSeriesData = (data: number[], timeLabels: string[]) => {
    return {
      labels: timeLabels,
      datasets: [{
        data,
        borderColor: '#3b82f6',
        backgroundColor: '#93c5fd',
        tension: 0.4
      }]
    }
  }

  const transformPieData = (data: any[]) => {
    return {
      labels: data.map(d => d.name),
      datasets: [{
        data: data.map(d => d.value),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6'
        ]
      }]
    }
  }

  return {
    transformBudgetData,
    transformTimeSeriesData,
    transformPieData
  }
}