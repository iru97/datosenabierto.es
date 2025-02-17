import { defineEventHandler, createError } from 'h3'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const educationDataSchema = z.object({
  totalDatasets: z.number(),
  institutions: z.number(),
  lastUpdate: z.string(),
  stats: z.object({
    publicSchools: z.number(),
    privateSchools: z.number(),
    universities: z.number(),
    vocationalCenters: z.number(),
    studentTeacherRatio: z.number(),
    graduationRate: z.number(),
    dropoutRate: z.number(),
    investmentPerStudent: z.number(),
    digitalAdoption: z.number(),
    internationalPrograms: z.number()
  }),
  trends: z.object({
    enrollmentChange: z.number(),
    budgetChange: z.number(),
    performanceIndex: z.number(),
    employabilityRate: z.number()
  }),
  qualityMetrics: z.object({
    averageClassSize: z.number(),
    teacherQualification: z.number(),
    infrastructureScore: z.number(),
    studentSatisfaction: z.number()
  })
})

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Fetch data from datos.gob.es API
    const response = await $fetch(`${config.public.datosGobApiUrl}/education/stats`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })

    // Add retry logic with exponential backoff
    const fetchWithRetry = async (retries = 3, delay = 1000) => {
      try {
        return await $fetch(`${config.public.datosGobApiUrl}/education/stats`, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        })
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay))
          return fetchWithRetry(retries - 1, delay * 2)
        }
        throw error
      }
    }

    // Transform and validate the data
    const validatedData = educationDataSchema.parse({
      totalDatasets: response.total_datasets,
      institutions: response.total_institutions,
      lastUpdate: format(new Date(response.last_update), 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
      stats: {
        publicSchools: response.stats.public_schools,
        privateSchools: response.stats.private_schools,
        universities: response.stats.universities,
        vocationalCenters: response.stats.vocational_centers,
        studentTeacherRatio: response.stats.student_teacher_ratio,
        graduationRate: response.stats.graduation_rate,
        dropoutRate: response.stats.dropout_rate,
        investmentPerStudent: response.stats.investment_per_student,
        digitalAdoption: response.stats.digital_adoption,
        internationalPrograms: response.stats.international_programs
      },
      trends: {
        enrollmentChange: response.trends.enrollment_change,
        budgetChange: response.trends.budget_change,
        performanceIndex: response.trends.performance_index,
        employabilityRate: response.trends.employability_rate
      },
      qualityMetrics: {
        averageClassSize: response.quality_metrics.average_class_size,
        teacherQualification: response.quality_metrics.teacher_qualification,
        infrastructureScore: response.quality_metrics.infrastructure_score,
        studentSatisfaction: response.quality_metrics.student_satisfaction
      }
    })

    return validatedData
  } catch (error) {
    console.error('Error fetching education data:', error)
    
    // Enhanced error handling with specific error types
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 422,
        message: 'Invalid data format received from education API',
        cause: error
      })
    }

    if (error.response?.status === 429) {
      throw createError({
        statusCode: 429,
        message: 'Rate limit exceeded. Please try again later.',
        cause: error
      })
    }

    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || 'Error fetching education data',
      cause: error
    })
  }
})