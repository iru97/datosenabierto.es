import { z } from 'zod'

const contractSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  amount: z.number(),
  department: z.string(),
  status: z.enum(['draft', 'published', 'in_progress', 'awarded', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high']),
  publishedAt: z.string(),
  updatedAt: z.string(),
  documents: z.array(z.object({
    id: z.string(),
    type: z.enum(['specifications', 'technical_report', 'budget', 'contract', 'amendment', 'other']),
    title: z.string(),
    url: z.string(),
    uploadedAt: z.string(),
    size: z.number(),
    format: z.string()
  }))
})

const contractsResponseSchema = z.object({
  contracts: z.array(contractSchema),
  total: z.number()
})

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    // Mock data - En producción, esto vendría de una base de datos
    const mockData = {
      contracts: [
        {
          id: '1',
          title: 'Construcción de Hospital Universitario',
          description: 'Proyecto de construcción del nuevo hospital universitario',
          amount: 120000000,
          department: 'Sanidad',
          status: 'in_progress',
          priority: 'high',
          publishedAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-02-01T15:30:00Z',
          documents: [
            {
              id: 'doc1',
              type: 'specifications',
              title: 'Pliego de Condiciones',
              url: '#',
              uploadedAt: '2024-01-15T10:00:00Z',
              size: 2500000,
              format: 'pdf'
            }
          ]
        }
      ],
      total: 1
    }

    // Validar datos con Zod
    const validatedData = contractsResponseSchema.parse(mockData)

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