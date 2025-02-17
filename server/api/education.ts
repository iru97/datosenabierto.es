import { z } from 'zod'

const educationDataSchema = z.object({
  totalDatasets: z.number(),
  institutions: z.number(),
  lastUpdate: z.string(),
  stats: z.object({
    publicSchools: z.number(),
    privateSchools: z.number(),
    universities: z.number(),
    vocationalCenters: z.number()
  })
})

export default defineEventHandler(async (event) => {
  try {
    const mockData = {
      totalDatasets: 390,
      institutions: 678,
      lastUpdate: new Date().toISOString(),
      stats: {
        publicSchools: 5234,
        privateSchools: 2789,
        universities: 84,
        vocationalCenters: 967
      }
    }

    return educationDataSchema.parse(mockData)
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Error fetching education data'
    })
  }
})