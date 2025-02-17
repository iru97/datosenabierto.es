import { defineEventHandler, createError, getRouterParam } from 'h3'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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

    const config = useRuntimeConfig()
    
    // Fetch data from transparency API
    const response = await $fetch(`${config.public.transparencyApiUrl}/budgets/${year}`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    // Transform and validate the data
    const validatedData = budgetSchema.parse({
      total: response.total_budget,
      departments: response.departments.map((dept: any) => ({
        name: dept.department_name,
        amount: dept.budget_amount,
        percentage: (dept.budget_amount / response.total_budget) * 100
      })),
      period: {
        year: parseInt(year)
      }
    })

    return validatedData
  } catch (error) {
    console.error('Error fetching budget data:', error)
    
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || 'Error fetching budget data',
      cause: error
    })
  }
})