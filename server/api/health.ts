import { defineEventHandler, createError } from 'h3'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const healthDataSchema = z.object({
  totalDatasets: z.number(),
  facilities: z.number(),
  lastUpdate: z.string(),
  stats: z.object({
    hospitals: z.number(),
    healthCenters: z.number(),
    specialists: z.number(),
    emergencyUnits: z.number()
  })
})

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Fetch data from health ministry API
    const response = await $fetch(`${config.public.datosGobApiUrl}/health/stats`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    // Transform and validate the data
    const validatedData = healthDataSchema.parse({
      totalDatasets: response.total_datasets,
      facilities: response.total_facilities,
      lastUpdate: format(new Date(response.last_update), 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
      stats: {
        hospitals: response.stats.hospitals,
        healthCenters: response.stats.health_centers,
        specialists: response.stats.medical_specialists,
        emergencyUnits: response.stats.emergency_units
      }
    })

    return validatedData
  } catch (error) {
    console.error('Error fetching health data:', error)
    
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || 'Error fetching health data',
      cause: error
    })
  }
})