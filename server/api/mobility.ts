import { defineEventHandler, createError } from 'h3'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const mobilityDataSchema = z.object({
  totalDatasets: z.number(),
  routes: z.number(),
  lastUpdate: z.string(),
  stats: z.object({
    busLines: z.number(),
    metroLines: z.number(),
    trainLines: z.number(),
    bikeStations: z.number()
  })
})

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Fetch data from mobility API
    const response = await $fetch(`${config.public.datosGobApiUrl}/mobility/stats`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    // Transform and validate the data
    const validatedData = mobilityDataSchema.parse({
      totalDatasets: response.total_datasets,
      routes: response.total_routes,
      lastUpdate: format(new Date(response.last_update), 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
      stats: {
        busLines: response.stats.bus_lines,
        metroLines: response.stats.metro_lines,
        trainLines: response.stats.train_lines,
        bikeStations: response.stats.bike_stations
      }
    })

    return validatedData
  } catch (error) {
    console.error('Error fetching mobility data:', error)
    
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || 'Error fetching mobility data',
      cause: error
    })
  }
})