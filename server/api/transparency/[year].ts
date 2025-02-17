import { z } from 'zod'

const budgetSchema = z.object({
  total: z.number(),
  departments: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    percentage: z.number()
  })),
  period: z.object({
    year: z.number(),
    quarter: z.number().optional(),
    month: z.number().optional()
  })
})

export default defineEventHandler(async (event) => {
  try {
    const year = getRouterParam(event, 'year')
    
    if (!year || !/^\d{4}$/.test(year)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid year parameter'
      })
    }

    // Datos más realistas basados en presupuestos reales
    const mockData = {
      total: 196091000000, // 196.091 millones € (Presupuesto 2024)
      departments: [
        { name: 'Seguridad Social', amount: 204470000000, percentage: 31.2 },
        { name: 'Sanidad', amount: 113220000000, percentage: 17.3 },
        { name: 'Educación', amount: 89650000000, percentage: 13.7 },
        { name: 'Defensa', amount: 75340000000, percentage: 11.5 },
        { name: 'Infraestructuras', amount: 68920000000, percentage: 10.5 },
        { name: 'Otros', amount: 103400000000, percentage: 15.8 }
      ],
      period: { year: parseInt(year) }
    }

    const validatedData = budgetSchema.parse(mockData)
    return validatedData
  } catch (error) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 500,
        message: 'Data validation error'
      })
    }
    throw error
  }
})