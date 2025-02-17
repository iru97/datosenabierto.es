import { z } from 'zod'

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
    const mockData = {
      totalDatasets: 450,
      facilities: 789,
      lastUpdate: new Date().toISOString(),
      stats: {
        hospitals: 465,
        healthCenters: 3012,
        specialists: 13450,
        emergencyUnits: 789
      }
    }

    return healthDataSchema.parse(mockData)
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Error fetching health data'
    })
  }
})