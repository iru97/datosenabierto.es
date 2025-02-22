import { format, isAfter, eachDayOfInterval, getWeek, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import type { BOEResponse } from '~/types/boe'

export interface BOEWeekData {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  boletines: {
    date: Date;
    data: BOEResponse;
  }[];
}

export const useBOE = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const weeklyData = ref<BOEWeekData[]>([])
  const processedDates = ref(0)
  const totalDates = ref(0)
  const cache = new Map<string, BOEResponse>()

  const addBoletin = (date: Date, data: BOEResponse) => {
    if (!data?.response?.data?.sumario?.diario?.length) return

    const weekNumber = getWeek(date, { locale: es })
    const weekStart = startOfWeek(date, { locale: es })
    const weekEnd = endOfWeek(date, { locale: es })
    
    const weekIndex = weeklyData.value.findIndex(w => w.weekNumber === weekNumber)

    if (weekIndex === -1) {
      weeklyData.value.push({
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        boletines: [{
          date,
          data
        }]
      })
    } else {
      weeklyData.value[weekIndex].boletines.push({
        date,
        data
      })
    }

    // Ordenar las semanas de más reciente a más antigua
    weeklyData.value.sort((a, b) => b.weekNumber - a.weekNumber)
    
    // Ordenar los boletines dentro de cada semana por fecha
    weeklyData.value.forEach(week => {
      week.boletines.sort((a, b) => b.date.getTime() - a.date.getTime())
    })
  }

  const fetchSumario = async ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
    loading.value = true
    error.value = null
    weeklyData.value = []
    processedDates.value = 0
    
    try {
      const today = new Date()
      
      if (isAfter(startDate, today) || isAfter(endDate, today)) {
        throw new Error('No se pueden consultar fechas futuras')
      }

      const dates = eachDayOfInterval({ start: startDate, end: endDate })
      totalDates.value = dates.length

      const batchSize = 3
      for (let i = 0; i < dates.length; i += batchSize) {
        const batch = dates.slice(i, i + batchSize)
        
        const promises = batch.map(async (date) => {
          const formattedDate = format(date, 'yyyyMMdd', { locale: es })
          
          if (cache.has(formattedDate)) {
            const cachedData = cache.get(formattedDate)!
            addBoletin(date, cachedData)
            processedDates.value++
            return
          }

          try {
            const response = await $fetch<BOEResponse>(`/api/boe/sumario/${formattedDate}`)
            
            if (response?.response?.data?.sumario?.diario?.length > 0) {
              cache.set(formattedDate, response)
              addBoletin(date, response)
            }
          } catch (error: any) {
            if (error.response?.status !== 404) {
              console.error(`Error fetching data for date ${formattedDate}:`, error)
            }
          } finally {
            processedDates.value++
          }
        })

        await Promise.all(promises)
        
        if (i + batchSize < dates.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
    } catch (e: any) {
      console.error('Error in fetchSumario:', e)
      error.value = e instanceof Error ? e.message : 'Error desconocido al obtener los datos'
    } finally {
      loading.value = false
    }
  }

  const progress = computed(() => {
    if (totalDates.value === 0) return 0
    return Math.round((processedDates.value / totalDates.value) * 100)
  })

  return {
    loading,
    error,
    weeklyData,
    progress,
    fetchSumario
  }
}