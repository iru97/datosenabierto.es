import { defineEventHandler, createError } from 'h3'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const environmentDataSchema = z.object({
  totalDatasets: z.number(),
  stations: z.number(),
  lastUpdate: z.string(),
  stats: z.object({
    airQualityStations: z.number(),
    waterQualityStations: z.number(),
    protectedAreas: z.number(),
    recyclingCenters: z.number()
  })
})

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Fetch data from environment ministry API
    const response = await $fetch(`${config.public.datosGobApiUrl}/environment/stats`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    // Transform and validate the data
    const validatedData = environmentDataSchema.parse({
      totalDatasets: response.total_datasets,
      stations: response.total_stations,
      lastUpdate: format(new Date(response.last_update), 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
      stats: {
        airQualityStations: response.stats.air_quality_stations,
        waterQualityStations: response.stats.water_quality_stations,
        protectedAreas: response.stats.protected_areas,
        recyclingCenters: response.stats.recycling_centers
      }
    })

    return validatedData
  } catch (error) {
    console.error('Error fetching environment data:', error)
    
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || 'Error fetching environment data',
      cause: error
    })
  }
})