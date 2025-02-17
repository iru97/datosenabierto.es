import { z } from 'zod'

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
    const mockData = {
      totalDatasets: 320,
      routes: 567,
      lastUpdate: new Date().toISOString(),
      stats: {
        busLines: 213,
        metroLines: 12,
        trainLines: 11,
        bikeStations: 331
      }
    }

    return mobilityDataSchema.parse(mockData)
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Error fetching mobility data'
    })
  }
})