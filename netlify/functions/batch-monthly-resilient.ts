/**
 * FUNCIÓN NETLIFY: PROCESAMIENTO MENSUAL RESILIENTE
 *
 * Ejecuta procesamiento mensual de documentos BOE con:
 * - Control automático de presupuesto
 * - Pausa cuando se agota el presupuesto
 * - Reanudación desde checkpoint
 * - Sin reprocessing de documentos
 *
 * Configuración en netlify.toml:
 * [functions."batch-monthly-resilient"]
 * schedule = "0 2 1 * *"  # Primer día del mes a las 2 AM UTC
 */

import { schedule } from '@netlify/functions'
import {
  checkBudget,
  recordCost,
  pauseProcessing,
  formatCost,
} from '../../utils/budget-control'
import {
  addToQueue,
  getNextBatch,
  markAsProcessing,
  markAsCompleted,
  markAsError,
  resetStuckItems,
  type QueueItem,
} from '../../utils/processing-queue'
import {
  getOrCreateCheckpoint,
  updateCheckpoint,
  pauseCheckpoint,
  completeCheckpoint,
  errorCheckpoint,
  calculateProgress,
} from '../../utils/checkpoint-manager'
import { generateText, getCurrentModel } from '../../utils/llm'
import { createClient } from '@supabase/supabase-js'

// ================================================================
// CONFIGURACIÓN
// ================================================================

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const BATCH_SIZE = 10 // Procesar de 10 en 10
const CHECKPOINT_FREQUENCY = 10 // Guardar checkpoint cada 10 documentos
const MAX_EXECUTION_TIME_MS = 14 * 60 * 1000 // 14 minutos (Netlify timeout: 15 min)

// ================================================================
// FUNCIÓN PRINCIPAL
// ================================================================

export const handler = schedule('0 2 1 * *', async (event) => {
  const startTime = Date.now()

  console.log('🚀 Iniciando procesamiento mensual resiliente')
  console.log(`   - Fecha de ejecución: ${new Date().toISOString()}`)
  console.log(`   - Modelo LLM: ${getCurrentModel()}`)

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    // ================================================================
    // 1. CONFIGURAR PERIODO A PROCESAR
    // ================================================================

    const hoy = new Date()
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
    const inicioPeriodo = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth(), 1)
    const finPeriodo = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth() + 1, 0)

    const fechaInicio = inicioPeriodo.toISOString().split('T')[0]
    const fechaFin = finPeriodo.toISOString().split('T')[0]

    console.log(`📅 Periodo a procesar: ${fechaInicio} → ${fechaFin}`)

    // ================================================================
    // 2. RESETEAR ITEMS COLGADOS Y VERIFICAR PRESUPUESTO
    // ================================================================

    await resetStuckItems(30) // Resetear items en "procesando" por más de 30 min

    const budgetStatus = await checkBudget()
    console.log(`💰 Presupuesto disponible:`)
    console.log(`   - Diario: ${formatCost(budgetStatus.remainingDaily)}`)
    console.log(`   - Semanal: ${formatCost(budgetStatus.remainingWeekly)}`)
    console.log(`   - Mensual: ${formatCost(budgetStatus.remainingMonthly)}`)

    if (!budgetStatus.canProcess) {
      console.log(`⏸️ No se puede procesar: ${budgetStatus.reason}`)
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Procesamiento no iniciado',
          reason: budgetStatus.reason,
        }),
      }
    }

    // ================================================================
    // 3. OBTENER O CREAR CHECKPOINT
    // ================================================================

    // Contar documentos del periodo
    const { count } = await supabase
      .from('documentos_boe')
      .select('id', { count: 'exact', head: true })
      .gte('fecha_publicacion', fechaInicio)
      .lte('fecha_publicacion', fechaFin)

    const totalDocumentos = count || 0
    console.log(`📊 Total documentos en el periodo: ${totalDocumentos}`)

    const checkpointId = await getOrCreateCheckpoint({
      tipo_batch: 'mensual',
      fecha_batch_inicio: fechaInicio,
      fecha_batch_fin: fechaFin,
      total_documentos: totalDocumentos,
      costo_estimado_total: totalDocumentos * 0.005, // Estimación rough
    })

    // ================================================================
    // 4. LLENAR COLA DE PROCESAMIENTO
    // ================================================================

    // Obtener documentos del periodo que NO estén ya en la cola
    const { data: documentos } = await supabase
      .from('documentos_boe')
      .select('boe_id, categoria_id, categorias(prioridad)')
      .gte('fecha_publicacion', fechaInicio)
      .lte('fecha_publicacion', fechaFin)
      .order('fecha_publicacion', { ascending: false })

    if (!documentos || documentos.length === 0) {
      console.log('⚠️ No hay documentos para procesar en este periodo')
      await completeCheckpoint(checkpointId)
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No hay documentos para procesar' }),
      }
    }

    console.log(`📝 Añadiendo ${documentos.length} documentos a la cola...`)

    // Añadir a la cola con prioridad según categoría
    let added = 0
    for (const doc of documentos) {
      const prioridadCategoria = (doc as any).categorias?.prioridad || 0
      const prioridadCola = prioridadCategoria === 3 ? 1 : 0 // P3 = alta prioridad

      const item: QueueItem = {
        boe_id: doc.boe_id,
        nivel_procesamiento: 2, // Nivel 2: Extracción de datos
        prioridad: prioridadCola as 0 | 1 | 2,
      }

      const wasAdded = await addToQueue(item)
      if (wasAdded) added++
    }

    console.log(`✅ Añadidos a la cola: ${added}/${documentos.length} documentos`)

    // ================================================================
    // 5. PROCESAMIENTO POR LOTES CON CONTROL DE PRESUPUESTO
    // ================================================================

    let totalProcesados = 0
    let totalFallidos = 0
    let costoAcumulado = 0
    let shouldContinue = true

    while (shouldContinue) {
      // Verificar timeout de Netlify
      const elapsedTime = Date.now() - startTime
      if (elapsedTime > MAX_EXECUTION_TIME_MS) {
        console.log('⏱️ Timeout de Netlify alcanzado (14 min)')
        await pauseCheckpoint(checkpointId, 'Timeout de Netlify alcanzado')
        break
      }

      // Verificar presupuesto antes de cada lote
      const budget = await checkBudget()
      if (!budget.canProcess) {
        console.log(`💸 Presupuesto agotado: ${budget.reason}`)
        await pauseCheckpoint(checkpointId, budget.reason!)
        break
      }

      // Obtener siguiente lote
      const lote = await getNextBatch(BATCH_SIZE, budget.remainingTotal)
      if (lote.length === 0) {
        console.log('✅ No hay más documentos pendientes en la cola')
        shouldContinue = false
        break
      }

      console.log(`\n📦 Procesando lote de ${lote.length} documentos...`)

      // Procesar cada documento del lote
      for (const item of lote) {
        try {
          await markAsProcessing(item.boe_id, item.nivel_procesamiento)

          // Obtener documento de la base de datos
          const { data: documento } = await supabase
            .from('documentos_boe')
            .select('*')
            .eq('boe_id', item.boe_id)
            .single()

          if (!documento) {
            throw new Error('Documento no encontrado en base de datos')
          }

          // Procesar según nivel
          let costo = 0
          if (item.nivel_procesamiento === 2) {
            costo = await procesarNivel2(documento, supabase)
          } else if (item.nivel_procesamiento === 3) {
            costo = await procesarNivel3(documento, supabase)
          }

          // Registrar coste y marcar como completado
          await recordCost(costo)
          await markAsCompleted(item.boe_id, item.nivel_procesamiento, costo)

          costoAcumulado += costo
          totalProcesados++

          console.log(`   ✅ ${item.boe_id} | ${formatCost(costo)}`)
        } catch (error: any) {
          console.error(`   ❌ ${item.boe_id} | Error: ${error.message}`)
          await markAsError(item.boe_id, item.nivel_procesamiento, error.message)
          totalFallidos++
        }

        // Guardar checkpoint cada N documentos
        if (totalProcesados % CHECKPOINT_FREQUENCY === 0) {
          await updateCheckpoint(checkpointId, {
            documentos_procesados: totalProcesados,
            documentos_fallidos: totalFallidos,
            ultimo_doc_procesado: item.boe_id,
            costo_acumulado: costoAcumulado,
          })

          const progress = calculateProgress(totalProcesados, totalDocumentos)
          console.log(`📊 Checkpoint guardado: ${progress}% completado`)
        }
      }
    }

    // ================================================================
    // 6. FINALIZAR
    // ================================================================

    // Actualizar checkpoint final
    await updateCheckpoint(checkpointId, {
      documentos_procesados: totalProcesados,
      documentos_fallidos: totalFallidos,
      costo_acumulado: costoAcumulado,
    })

    if (shouldContinue) {
      await completeCheckpoint(checkpointId)
    }

    const duration = Math.round((Date.now() - startTime) / 1000)
    console.log(`\n🎉 Procesamiento finalizado`)
    console.log(`   - Documentos procesados: ${totalProcesados}`)
    console.log(`   - Documentos fallidos: ${totalFallidos}`)
    console.log(`   - Coste total: ${formatCost(costoAcumulado)}`)
    console.log(`   - Duración: ${duration}s`)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Procesamiento completado',
        documentos_procesados: totalProcesados,
        documentos_fallidos: totalFallidos,
        costo_total: costoAcumulado,
        duracion_segundos: duration,
      }),
    }
  } catch (error: any) {
    console.error('💥 Error fatal en procesamiento:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    }
  }
})

// ================================================================
// FUNCIONES DE PROCESAMIENTO POR NIVEL
// ================================================================

/**
 * Nivel 2: Extracción de datos estructurados
 */
async function procesarNivel2(documento: any, supabase: any): Promise<number> {
  const prompt = `Analiza este documento BOE y extrae:
- Fechas importantes (plazos, vencimientos)
- Keywords principales (3-5 palabras clave)
- Datos estructurados relevantes

Documento:
Título: ${documento.titulo}
Departamento: ${documento.departamento || 'N/A'}
Sección: ${documento.seccion || 'N/A'}
Rango: ${documento.rango || 'N/A'}

Responde en formato JSON:
{
  "fechas_importantes": [{"tipo": "plazo", "fecha": "2025-12-31", "descripcion": "..."}],
  "keywords": ["palabra1", "palabra2"],
  "datos_estructurados": {...}
}`

  const response = await generateText(prompt, { max_tokens: 500 })

  // Parsear respuesta JSON
  let datos: any
  try {
    datos = JSON.parse(response.contenido)
  } catch {
    datos = { fechas_importantes: [], keywords: [], datos_estructurados: {} }
  }

  // Actualizar documento en DB
  await supabase
    .from('documentos_boe')
    .update({
      fechas_importantes: datos.fechas_importantes || [],
      keywords: datos.keywords || [],
      datos_estructurados: datos.datos_estructurados || {},
      procesado: true,
      procesado_at: new Date().toISOString(),
    })
    .eq('boe_id', documento.boe_id)

  // Calcular coste
  const costo = (response.tokens_input / 1_000_000) * 0.15 +
                (response.tokens_output / 1_000_000) * 0.60

  return costo
}

/**
 * Nivel 3: Generación de explicaciones educativas
 */
async function procesarNivel3(documento: any, supabase: any): Promise<number> {
  const prompt = `Genera una explicación educativa de este documento BOE para ciudadanos:

Título: ${documento.titulo}
Departamento: ${documento.departamento || 'N/A'}

Responde en formato JSON:
{
  "resumen": "Resumen breve en 2-3 frases",
  "que_es": "Explicación de qué es este documento",
  "como_afecta": "Cómo afecta a los ciudadanos"
}`

  const response = await generateText(prompt, { max_tokens: 600 })

  // Parsear respuesta JSON
  let datos: any
  try {
    datos = JSON.parse(response.contenido)
  } catch {
    datos = { resumen: '', que_es: '', como_afecta: '' }
  }

  // Insertar explicaciones en DB
  const explicaciones = [
    { tipo: 'resumen', contenido: datos.resumen },
    { tipo: 'que_es', contenido: datos.que_es },
    { tipo: 'como_afecta', contenido: datos.como_afecta },
  ]

  for (const exp of explicaciones) {
    if (exp.contenido) {
      await supabase.from('explicaciones_llm').insert({
        documento_id: documento.id,
        tipo: exp.tipo,
        contenido: exp.contenido,
        modelo_usado: getCurrentModel(),
        tokens_usados: response.tokens_input + response.tokens_output,
      })
    }
  }

  // Calcular coste
  const costo = (response.tokens_input / 1_000_000) * 0.15 +
                (response.tokens_output / 1_000_000) * 0.60

  return costo
}
