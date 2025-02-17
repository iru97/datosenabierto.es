import { z } from 'zod'

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
    const mockData = {
      totalDatasets: 280,
      stations: 345,
      lastUpdate: new Date().toISOString(),
      stats: {
        airQualityStations: 156,
        waterQualityStations: 189,
        protectedAreas: 234,
        recyclingCenters: 412
      }
    }

    return environmentDataSchema.parse(mockData)
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Error fetching environment data'
    })
  }
})