import { defineEventHandler, createError, getQuery } from 'h3'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
    const config = useRuntimeConfig()
    
    // Build query parameters
    const params = new URLSearchParams()
    if (query.page) params.append('page', String(query.page))
    if (query.limit) params.append('limit', String(query.limit))
    if (query.department) params.append('department', String(query.department))
    if (query.search) params.append('q', String(query.search))

    // Fetch data from contracting API
    const response = await $fetch(`${config.public.contratacionApiUrl}/contracts?${params.toString()}`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    // Transform and validate the data
    const validatedData = contractsResponseSchema.parse({
      contracts: response.items.map((contract: any) => ({
        id: contract.contract_id,
        title: contract.title,
        description: contract.description,
        amount: contract.amount,
        department: contract.department,
        status: contract.status,
        priority: contract.priority,
        publishedAt: format(new Date(contract.published_at), 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
        updatedAt: format(new Date(contract.updated_at), 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
        documents: contract.documents.map((doc: any) => ({
          id: doc.document_id,
          type: doc.type,
          title: doc.title,
          url: doc.url,
          uploadedAt: format(new Date(doc.uploaded_at), 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
          size: doc.size,
          format: doc.format
        }))
      })),
      total: response.total
    })

    return validatedData
  } catch (error) {
    console.error('Error fetching contracts data:', error)
    
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || 'Error fetching contracts data',
      cause: error
    })
  }
})