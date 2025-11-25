/**
 * Función de Procesamiento Semanal del BOE con Agentes LLM por Fases
 *
 * Ejecuta automáticamente cada semana para:
 * 1. Descargar documentos BOE de la semana anterior
 * 2. Clasificarlos por categoría
 * 3. Procesarlos con agentes LLM en 4 FASES
 * 4. Guardar en Supabase
 * 5. Generar estadísticas semanales
 *
 * Sistema de presupuesto integrado para controlar costes LLM
 */

import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { procesarDocumentoCompleto, type DocumentoBOE } from '../../utils/agentes-llm'
import { checkBudget, recordCost } from '../../utils/budget-control'
import {
  addToQueue,
  getNextBatch,
  markAsProcessed,
  removeFromQueue,
} from '../../utils/processing-queue'
import {
  getOrCreateCheckpoint,
  updateCheckpoint,
  pauseCheckpoint,
  completeCheckpoint,
} from '../../utils/checkpoint-manager'

// ============================================================================
// SETUP
// ============================================================================

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Service key para permisos totales
)

const BOE_API_BASE = 'https://www.boe.es/diario_boe/json.php'

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const CONFIG = {
  BATCH_SIZE: 10, // Procesar de 10 en 10
  MAX_COST_PER_BATCH: 2.0, // Máximo $2 por lote
  CATEGORIAS_PRIORITARIAS: ['oposiciones', 'ayudas', 'legislacion'], // Procesar primero
}

// ============================================================================
// FUNCIÓN PRINCIPAL - Ejecuta cada domingo a las 7am UTC
// ============================================================================

export const handler = schedule('0 7 * * 0', async (event, context) => {
  console.log('🚀 ============================================')
  console.log('🚀 INICIANDO PROCESAMIENTO SEMANAL DEL BOE')
  console.log('🚀 ============================================')

  const startTime = Date.now()

  // Fechas de la semana anterior (Lunes a Domingo)
  const { semana_inicio, semana_fin } = getSemanaAnterior()

  console.log(`📅 Procesando semana: ${semana_inicio} a ${semana_fin}`)

  // Crear log de procesamiento en Supabase
  const { data: logData } = await supabase
    .from('procesamiento_log')
    .insert({
      fecha_inicio: new Date().toISOString(),
      semana_procesada_inicio: semana_inicio,
      semana_procesada_fin: semana_fin,
      estado: 'iniciado',
    })
    .select()
    .single()

  if (!logData) {
    console.error('❌ Error creando log de procesamiento')
    return { statusCode: 500, body: 'Error creando log' }
  }

  const logId = logData.id

  try {
    // ========================================================================
    // PASO 1: Obtener o resumir checkpoint existente
    // ========================================================================

    const checkpointId = await getOrCreateCheckpoint({
      tipo: 'procesamiento_semanal',
      descripcion: `Procesamiento semana ${semana_inicio}`,
      total_items: 0, // Se actualizará después
      metadata: {
        semana_inicio,
        semana_fin,
        log_id: logId,
      },
    })

    console.log(`📍 Checkpoint ID: ${checkpointId}`)

    // ========================================================================
    // PASO 2: Descargar lista de documentos BOE de la semana
    // ========================================================================

    console.log('\n📥 Descargando lista de documentos BOE...')

    const documentos = await fetchDocumentosSemana(semana_inicio, semana_fin)

    console.log(`✅ Encontrados ${documentos.length} documentos`)

    await updateCheckpoint(checkpointId, {
      total_items: documentos.length,
    })

    // ========================================================================
    // PASO 3: Clasificar por categoría y añadir a cola de procesamiento
    // ========================================================================

    console.log('\n🗂️  Clasificando documentos por categoría...')

    const categorias = await getCategorias()
    const stats = {
      total: 0,
      por_categoria: {} as Record<string, number>,
    }

    for (const doc of documentos) {
      const categoria = clasificarDocumento(doc, categorias)

      if (categoria) {
        const agregado = await addToQueue({
          boe_id: doc.boe_id,
          categoria_id: categoria.id,
          prioridad: getPrioridad(categoria.slug),
          costo_estimado: 0.005, // ~$0.005 por documento
          metadata: {
            fecha_publicacion: doc.fecha_publicacion,
            titulo: doc.titulo.substring(0, 200),
          },
        })

        if (agregado) {
          stats.total++
          stats.por_categoria[categoria.slug] = (stats.por_categoria[categoria.slug] || 0) + 1
        }
      }
    }

    console.log(`✅ Añadidos ${stats.total} documentos a la cola`)
    console.log('📊 Por categoría:', stats.por_categoria)

    // ========================================================================
    // PASO 4: Procesar documentos con control de presupuesto
    // ========================================================================

    console.log('\n🤖 Iniciando procesamiento con LLM...')

    let procesados = 0
    let explicaciones_generadas = 0
    let tokens_total = 0
    let costo_total = 0

    while (true) {
      // Verificar presupuesto
      const budget = await checkBudget(CONFIG.MAX_COST_PER_BATCH)

      if (!budget.canProcess) {
        console.warn(`⏸️  Presupuesto agotado: ${budget.reason}`)
        await pauseCheckpoint(checkpointId, budget.reason || 'Presupuesto agotado')
        break
      }

      // Obtener siguiente lote de la cola (prioridad + FIFO)
      const lote = await getNextBatch(CONFIG.BATCH_SIZE, budget.remainingTotal)

      if (lote.length === 0) {
        console.log('✅ No hay más documentos en la cola')
        break
      }

      console.log(`\n📦 Procesando lote de ${lote.length} documentos...`)

      // Procesar cada documento del lote
      for (const item of lote) {
        try {
          // Obtener datos completos del documento
          const docCompleto = await fetchDocumentoCompleto(item.metadata.boe_id)

          if (!docCompleto) {
            console.warn(`⚠️  No se pudo obtener documento ${item.metadata.boe_id}`)
            await removeFromQueue(item.id)
            continue
          }

          // Obtener categoría
          const categoria = categorias.find(c => c.id === item.categoria_id)
          if (!categoria) {
            console.warn(`⚠️  Categoría no encontrada para ${item.metadata.boe_id}`)
            await removeFromQueue(item.id)
            continue
          }

          // ================================================================
          // PROCESAR CON AGENTES LLM (4 FASES)
          // ================================================================

          const resultado = await procesarDocumentoCompleto(docCompleto, categoria.slug)

          // ================================================================
          // GUARDAR EN SUPABASE
          // ================================================================

          // 1. Guardar documento en tabla documentos_boe
          const { data: docGuardado } = await supabase
            .from('documentos_boe')
            .insert({
              boe_id: docCompleto.boe_id,
              categoria_id: categoria.id,
              fecha_publicacion: docCompleto.fecha_publicacion,
              titulo: docCompleto.titulo,
              seccion: docCompleto.seccion,
              departamento: docCompleto.departamento,
              rango: docCompleto.rango,
              url_pdf: docCompleto.url_pdf,
              datos_estructurados: resultado.fase1.datos_estructurados,
              fechas_importantes: resultado.fase1.fechas_importantes,
              keywords: resultado.fase1.keywords,
              procesado: true,
              procesado_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (!docGuardado) {
            console.error(`❌ Error guardando documento ${docCompleto.boe_id}`)
            continue
          }

          // 2. Guardar explicaciones LLM
          const explicaciones = [
            {
              documento_id: docGuardado.id,
              tipo: 'resumen',
              contenido: JSON.stringify(resultado.fase2),
              modelo_usado: resultado.metadata.modelo,
              tokens_usados: Math.floor(resultado.metadata.tokens_usados * 0.3),
            },
            {
              documento_id: docGuardado.id,
              tipo: 'que_es',
              contenido: resultado.fase3.queEs,
              modelo_usado: resultado.metadata.modelo,
              tokens_usados: Math.floor(resultado.metadata.tokens_usados * 0.25),
            },
            {
              documento_id: docGuardado.id,
              tipo: 'como_afecta',
              contenido: resultado.fase3.comoAfecta,
              modelo_usado: resultado.metadata.modelo,
              tokens_usados: Math.floor(resultado.metadata.tokens_usados * 0.25),
            },
          ]

          // Añadir requisitos y pasos si existen
          if (resultado.fase4.requisitos) {
            explicaciones.push({
              documento_id: docGuardado.id,
              tipo: 'requisitos',
              contenido: JSON.stringify(resultado.fase4.requisitos),
              modelo_usado: resultado.metadata.modelo,
              tokens_usados: Math.floor(resultado.metadata.tokens_usados * 0.1),
            })
          }

          if (resultado.fase4.pasos) {
            explicaciones.push({
              documento_id: docGuardado.id,
              tipo: 'pasos',
              contenido: JSON.stringify(resultado.fase4.pasos),
              modelo_usado: resultado.metadata.modelo,
              tokens_usados: Math.floor(resultado.metadata.tokens_usados * 0.1),
            })
          }

          await supabase.from('explicaciones_llm').insert(explicaciones)

          // ================================================================
          // ACTUALIZAR MÉTRICAS
          // ================================================================

          procesados++
          explicaciones_generadas += explicaciones.length
          tokens_total += resultado.metadata.tokens_usados
          costo_total += resultado.metadata.coste_estimado_usd

          // Registrar coste en sistema de presupuesto
          await recordCost(resultado.metadata.coste_estimado_usd)

          // Marcar como procesado en la cola
          await markAsProcessed(item.id)

          // Actualizar checkpoint
          await updateCheckpoint(checkpointId, {
            items_procesados: procesados,
            metadata: {
              ultimo_procesado: docCompleto.boe_id,
              tokens_usados: tokens_total,
              costo_acumulado: costo_total,
            },
          })

          console.log(
            `✅ Procesado ${docCompleto.boe_id} (${procesados}/${stats.total}) - $${costo_total.toFixed(4)}`
          )
        } catch (error: any) {
          console.error(`❌ Error procesando ${item.metadata.boe_id}:`, error.message)

          // Marcar error pero continuar
          await supabase
            .from('documentos_boe')
            .upsert({
              boe_id: item.metadata.boe_id,
              categoria_id: item.categoria_id,
              fecha_publicacion: item.metadata.fecha_publicacion,
              titulo: item.metadata.titulo,
              procesado: false,
              error_procesamiento: error.message,
            })

          await removeFromQueue(item.id)
        }
      }
    }

    // ========================================================================
    // PASO 5: Generar estadísticas por categoría
    // ========================================================================

    console.log('\n📊 Generando estadísticas semanales...')

    for (const categoria of categorias) {
      await generarEstadisticasCategoria(categoria, semana_inicio, semana_fin)
    }

    // ========================================================================
    // PASO 6: Completar checkpoint y log
    // ========================================================================

    await completeCheckpoint(checkpointId)

    const tiempoTotal = Math.floor((Date.now() - startTime) / 1000)

    await supabase
      .from('procesamiento_log')
      .update({
        fecha_fin: new Date().toISOString(),
        estado: 'completado',
        total_documentos_procesados: procesados,
        total_explicaciones_generadas: explicaciones_generadas,
        total_tokens_usados: tokens_total,
        total_costo_estimado: costo_total,
        metadata: {
          tiempo_total_segundos: tiempoTotal,
          por_categoria: stats.por_categoria,
        },
      })
      .eq('id', logId)

    console.log('\n✅ ============================================')
    console.log(`✅ PROCESAMIENTO COMPLETADO`)
    console.log(`✅ Documentos procesados: ${procesados}`)
    console.log(`✅ Explicaciones generadas: ${explicaciones_generadas}`)
    console.log(`✅ Tokens usados: ${tokens_total.toLocaleString()}`)
    console.log(`✅ Coste total: $${costo_total.toFixed(4)}`)
    console.log(`✅ Tiempo total: ${tiempoTotal}s`)
    console.log('✅ ============================================\n')

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        procesados,
        explicaciones: explicaciones_generadas,
        tokens: tokens_total,
        coste: costo_total,
        tiempo_segundos: tiempoTotal,
      }),
    }
  } catch (error: any) {
    console.error('❌ ERROR FATAL:', error)

    await supabase
      .from('procesamiento_log')
      .update({
        fecha_fin: new Date().toISOString(),
        estado: 'error',
        error_mensaje: error.message,
      })
      .eq('id', logId)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
    }
  }
})

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function getSemanaAnterior(): { semana_inicio: string; semana_fin: string } {
  const hoy = new Date()

  // Obtener el domingo anterior (fin de semana pasada)
  const diasDesdeUltimiDomingo = hoy.getDay() === 0 ? 7 : hoy.getDay()
  const ultimoDomingo = new Date(hoy)
  ultimoDomingo.setDate(hoy.getDate() - diasDesdeUltimiDomingo)

  // Obtener el lunes de esa semana
  const ultimoLunes = new Date(ultimoDomingo)
  ultimoLunes.setDate(ultimoDomingo.getDate() - 6)

  return {
    semana_inicio: ultimoLunes.toISOString().split('T')[0],
    semana_fin: ultimoDomingo.toISOString().split('T')[0],
  }
}

async function getCategorias() {
  const { data } = await supabase
    .from('categorias')
    .select('*')
    .eq('activa', true)
    .order('prioridad', { ascending: false })

  return data || []
}

function getPrioridad(categoria_slug: string): number {
  if (CONFIG.CATEGORIAS_PRIORITARIAS.includes(categoria_slug)) {
    return 2 // Alta prioridad
  }
  return 0 // Normal
}

async function fetchDocumentosSemana(desde: string, hasta: string): Promise<any[]> {
  // TODO: Implementar llamada real a API del BOE
  // Por ahora retornar array vacío
  // En producción, iterar día por día y obtener todos los documentos

  const documentos: any[] = []

  // Ejemplo: iterar cada día
  const inicio = new Date(desde)
  const fin = new Date(hasta)

  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    const fecha = d.toISOString().split('T')[0].replace(/-/g, '')

    // Llamar a API BOE
    // const url = `${BOE_API_BASE}?fecha=${fecha}`
    // const response = await fetch(url)
    // const data = await response.json()
    // documentos.push(...data.sumario.diario.seccion)
  }

  return documentos
}

async function fetchDocumentoCompleto(boe_id: string): Promise<DocumentoBOE | null> {
  // TODO: Implementar llamada a API BOE para obtener documento completo
  // Retornar null por ahora

  return null
}

function clasificarDocumento(doc: any, categorias: any[]): any | null {
  const titulo = doc.titulo?.toLowerCase() || ''
  const texto = doc.texto?.toLowerCase() || ''

  // Clasificación por keywords y sección
  if (titulo.includes('oposición') || titulo.includes('convocatoria')) {
    return categorias.find(c => c.slug === 'oposiciones')
  }

  if (titulo.includes('subvención') || titulo.includes('ayuda') || titulo.includes('beca')) {
    return categorias.find(c => c.slug === 'ayudas')
  }

  if (titulo.includes('ley') || titulo.includes('real decreto')) {
    return categorias.find(c => c.slug === 'legislacion')
  }

  // Más lógica de clasificación...

  return null
}

async function generarEstadisticasCategoria(
  categoria: any,
  semana_inicio: string,
  semana_fin: string
) {
  // Contar documentos de esta categoría en esta semana
  const { data: docs, count } = await supabase
    .from('documentos_boe')
    .select('*', { count: 'exact' })
    .eq('categoria_id', categoria.id)
    .gte('fecha_publicacion', semana_inicio)
    .lte('fecha_publicacion', semana_fin)

  if (!count || count === 0) {
    return // No hay documentos esta semana para esta categoría
  }

  // TODO: Generar resumen con LLM de las tendencias de la semana
  const resumen_semanal = `Esta semana se publicaron ${count} documentos en ${categoria.nombre}.`

  await supabase.from('estadisticas_categorias').insert({
    categoria_id: categoria.id,
    semana_inicio,
    semana_fin,
    total_documentos: count,
    documentos_importantes: 0, // TODO: calcular
    resumen_semanal,
    tendencias: '',
    insights: '',
  })
}
