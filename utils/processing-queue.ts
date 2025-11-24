/**
 * GESTIÓN DE COLA DE PROCESAMIENTO
 *
 * Sistema de cola con prioridades, deduplicación automática
 * y control de reintentos para procesamiento resiliente.
 */

import { createClient } from '@supabase/supabase-js'
import { estimateCost } from './llm'

// ================================================================
// TIPOS
// ================================================================

export interface QueueItem {
  id?: string
  boe_id: string
  nivel_procesamiento: 1 | 2 | 3 // 1=clasificar, 2=extraer, 3=explicar
  prioridad?: 0 | 1 | 2 // 0=normal, 1=alta (P3), 2=urgente (usuario)
  estado?: 'pendiente' | 'procesando' | 'completado' | 'error'
  costo_estimado?: number
  costo_real?: number
  intentos?: number
  max_intentos?: number
  ultimo_error?: string
  metadata?: Record<string, any>
}

export interface QueueStats {
  total: number
  pendientes: number
  procesando: number
  completados: number
  errores: number
  costoEstimadoTotal: number
  costoRealTotal: number
}

// ================================================================
// CONFIGURACIÓN
// ================================================================

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Estimaciones de tokens por nivel
const TOKENS_NIVEL_1 = { input: 500, output: 50 } // Clasificación simple
const TOKENS_NIVEL_2 = { input: 1500, output: 300 } // Extracción de datos
const TOKENS_NIVEL_3 = { input: 2000, output: 500 } // Explicación educativa

// ================================================================
// FUNCIONES PRINCIPALES
// ================================================================

/**
 * Añade un documento a la cola de procesamiento
 * Incluye deduplicación automática
 *
 * @param item Item a añadir a la cola
 * @returns true si se añadió, false si ya existía
 */
export async function addToQueue(item: QueueItem): Promise<boolean> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // 1. Verificar si ya está en la cola
  const { data: existingQueue } = await supabase
    .from('cola_procesamiento')
    .select('id, estado')
    .eq('boe_id', item.boe_id)
    .eq('nivel_procesamiento', item.nivel_procesamiento)
    .single()

  if (existingQueue) {
    // Si está completado, no hacer nada
    if (existingQueue.estado === 'completado') {
      console.log(`⏭️ Documento ${item.boe_id} nivel ${item.nivel_procesamiento} ya procesado`)
      return false
    }
    // Si está en error o pendiente, está bien (se puede reintentar)
    console.log(`⚠️ Documento ${item.boe_id} nivel ${item.nivel_procesamiento} ya en cola (estado: ${existingQueue.estado})`)
    return false
  }

  // 2. Verificar si ya está procesado en documentos_boe
  const { data: processed } = await supabase
    .from('documentos_boe')
    .select('id, procesado')
    .eq('boe_id', item.boe_id)
    .single()

  if (processed?.procesado && item.nivel_procesamiento <= 2) {
    console.log(`✅ Documento ${item.boe_id} ya está procesado en base de datos`)
    return false
  }

  // 3. Estimar coste si no viene especificado
  let costoEstimado = item.costo_estimado
  if (!costoEstimado) {
    costoEstimado = estimateCostForLevel(item.nivel_procesamiento)
  }

  // 4. Insertar en la cola
  const { error } = await supabase
    .from('cola_procesamiento')
    .insert({
      boe_id: item.boe_id,
      nivel_procesamiento: item.nivel_procesamiento,
      prioridad: item.prioridad || 0,
      estado: 'pendiente',
      costo_estimado: costoEstimado,
      max_intentos: item.max_intentos || 3,
      metadata: item.metadata || {},
    })

  if (error) {
    console.error('Error adding to queue:', error)
    return false
  }

  console.log(`➕ Añadido a cola: ${item.boe_id} (nivel ${item.nivel_procesamiento}, prioridad ${item.prioridad || 0})`)
  return true
}

/**
 * Añade múltiples documentos a la cola
 *
 * @param items Array de items a añadir
 * @returns Número de items añadidos realmente
 */
export async function addManyToQueue(items: QueueItem[]): Promise<number> {
  let added = 0
  for (const item of items) {
    const success = await addToQueue(item)
    if (success) added++
  }
  return added
}

/**
 * Obtiene el siguiente lote de documentos a procesar
 * Respeta prioridades y límite de coste
 *
 * @param batchSize Número máximo de documentos
 * @param maxCost Coste máximo del lote en USD
 * @returns Array de items a procesar
 */
export async function getNextBatch(
  batchSize: number = 10,
  maxCost: number = Infinity
): Promise<QueueItem[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Obtener items pendientes ordenados por prioridad
  const { data: items, error } = await supabase
    .from('cola_procesamiento')
    .select('*')
    .eq('estado', 'pendiente')
    .lt('intentos', supabase.rpc('max_intentos')) // Solo items con intentos disponibles
    .order('prioridad', { ascending: false })
    .order('fecha_agregado', { ascending: true })
    .limit(batchSize * 2) // Obtener más para filtrar por coste

  if (error || !items) {
    console.error('Error fetching next batch:', error)
    return []
  }

  // Filtrar por coste acumulado
  const batch: QueueItem[] = []
  let accumulatedCost = 0

  for (const item of items) {
    if (batch.length >= batchSize) break

    const itemCost = item.costo_estimado || 0
    if (accumulatedCost + itemCost > maxCost) {
      console.log(`⚠️ Límite de coste alcanzado: $${accumulatedCost.toFixed(4)} (máximo: $${maxCost.toFixed(4)})`)
      break
    }

    batch.push(item)
    accumulatedCost += itemCost
  }

  console.log(`📦 Lote obtenido: ${batch.length} documentos (coste estimado: $${accumulatedCost.toFixed(4)})`)
  return batch
}

/**
 * Marca un item como "procesando"
 *
 * @param boeId ID del documento BOE
 * @param nivel Nivel de procesamiento
 */
export async function markAsProcessing(boeId: string, nivel: number): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { error } = await supabase
    .from('cola_procesamiento')
    .update({
      estado: 'procesando',
      ultimo_intento: new Date().toISOString(),
    })
    .eq('boe_id', boeId)
    .eq('nivel_procesamiento', nivel)

  if (error) {
    console.error('Error marking as processing:', error)
  }
}

/**
 * Marca un item como completado
 *
 * @param boeId ID del documento BOE
 * @param nivel Nivel de procesamiento
 * @param costoReal Coste real del procesamiento
 */
export async function markAsCompleted(
  boeId: string,
  nivel: number,
  costoReal?: number
): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { error } = await supabase
    .from('cola_procesamiento')
    .update({
      estado: 'completado',
      fecha_completado: new Date().toISOString(),
      costo_real: costoReal,
    })
    .eq('boe_id', boeId)
    .eq('nivel_procesamiento', nivel)

  if (error) {
    console.error('Error marking as completed:', error)
  } else {
    console.log(`✅ Completado: ${boeId} (nivel ${nivel})`)
  }
}

/**
 * Marca un item como error e incrementa intentos
 *
 * @param boeId ID del documento BOE
 * @param nivel Nivel de procesamiento
 * @param errorMessage Mensaje de error
 */
export async function markAsError(
  boeId: string,
  nivel: number,
  errorMessage: string
): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Obtener item actual para incrementar intentos
  const { data: item } = await supabase
    .from('cola_procesamiento')
    .select('intentos, max_intentos')
    .eq('boe_id', boeId)
    .eq('nivel_procesamiento', nivel)
    .single()

  if (!item) {
    console.error('Item not found in queue')
    return
  }

  const newIntentos = (item.intentos || 0) + 1
  const maxIntentos = item.max_intentos || 3

  // Si superó los intentos máximos, marcar como error permanente
  const nuevoEstado = newIntentos >= maxIntentos ? 'error' : 'pendiente'

  const { error } = await supabase
    .from('cola_procesamiento')
    .update({
      estado: nuevoEstado,
      intentos: newIntentos,
      ultimo_error: errorMessage,
      ultimo_intento: new Date().toISOString(),
    })
    .eq('boe_id', boeId)
    .eq('nivel_procesamiento', nivel)

  if (error) {
    console.error('Error marking as error:', error)
  } else {
    if (nuevoEstado === 'error') {
      console.log(`❌ Error permanente: ${boeId} (intentos: ${newIntentos}/${maxIntentos})`)
    } else {
      console.log(`⚠️ Error temporal: ${boeId} (intentos: ${newIntentos}/${maxIntentos}) - Se reintentará`)
    }
  }
}

/**
 * Obtiene estadísticas de la cola
 */
export async function getQueueStats(): Promise<QueueStats> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data: items } = await supabase
    .from('cola_procesamiento')
    .select('estado, costo_estimado, costo_real')

  if (!items) {
    return {
      total: 0,
      pendientes: 0,
      procesando: 0,
      completados: 0,
      errores: 0,
      costoEstimadoTotal: 0,
      costoRealTotal: 0,
    }
  }

  const stats: QueueStats = {
    total: items.length,
    pendientes: items.filter(i => i.estado === 'pendiente').length,
    procesando: items.filter(i => i.estado === 'procesando').length,
    completados: items.filter(i => i.estado === 'completado').length,
    errores: items.filter(i => i.estado === 'error').length,
    costoEstimadoTotal: items.reduce((sum, i) => sum + (i.costo_estimado || 0), 0),
    costoRealTotal: items.filter(i => i.estado === 'completado')
      .reduce((sum, i) => sum + (i.costo_real || 0), 0),
  }

  return stats
}

/**
 * Limpia items completados antiguos de la cola
 *
 * @param olderThanDays Items completados hace más de X días
 * @returns Número de items eliminados
 */
export async function cleanupOldItems(olderThanDays: number = 30): Promise<number> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  const { data, error } = await supabase
    .from('cola_procesamiento')
    .delete()
    .eq('estado', 'completado')
    .lt('fecha_completado', cutoffDate.toISOString())
    .select('id')

  if (error) {
    console.error('Error cleaning up old items:', error)
    return 0
  }

  const deleted = data?.length || 0
  console.log(`🧹 Limpieza completada: ${deleted} items eliminados (más de ${olderThanDays} días)`)
  return deleted
}

/**
 * Resetea items "procesando" que se quedaron colgados
 * (por timeout o error de función)
 *
 * @param olderThanMinutes Items en "procesando" hace más de X minutos
 * @returns Número de items reseteados
 */
export async function resetStuckItems(olderThanMinutes: number = 30): Promise<number> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const cutoffDate = new Date()
  cutoffDate.setMinutes(cutoffDate.getMinutes() - olderThanMinutes)

  const { data, error } = await supabase
    .from('cola_procesamiento')
    .update({
      estado: 'pendiente',
      ultimo_error: 'Timeout o error de función (reseteado automáticamente)',
    })
    .eq('estado', 'procesando')
    .lt('ultimo_intento', cutoffDate.toISOString())
    .select('id')

  if (error) {
    console.error('Error resetting stuck items:', error)
    return 0
  }

  const reset = data?.length || 0
  if (reset > 0) {
    console.log(`🔄 Items reseteados: ${reset} (en "procesando" por más de ${olderThanMinutes} minutos)`)
  }
  return reset
}

// ================================================================
// HELPERS
// ================================================================

/**
 * Estima el coste de procesamiento según el nivel
 */
function estimateCostForLevel(nivel: number): number {
  let tokens_input = 0
  let tokens_output = 0

  switch (nivel) {
    case 1:
      tokens_input = TOKENS_NIVEL_1.input
      tokens_output = TOKENS_NIVEL_1.output
      break
    case 2:
      tokens_input = TOKENS_NIVEL_2.input
      tokens_output = TOKENS_NIVEL_2.output
      break
    case 3:
      tokens_input = TOKENS_NIVEL_3.input
      tokens_output = TOKENS_NIVEL_3.output
      break
    default:
      tokens_input = 1000
      tokens_output = 200
  }

  return estimateCost(tokens_input, tokens_output)
}

/**
 * Crea items de cola para un documento completo (nivel 1 → 2 → 3)
 *
 * @param boeId ID del documento BOE
 * @param prioridad Prioridad del documento
 * @returns Array de 3 items (uno por nivel)
 */
export function createFullProcessingItems(
  boeId: string,
  prioridad: 0 | 1 | 2 = 0
): QueueItem[] {
  return [
    {
      boe_id: boeId,
      nivel_procesamiento: 1,
      prioridad,
    },
    {
      boe_id: boeId,
      nivel_procesamiento: 2,
      prioridad,
    },
    {
      boe_id: boeId,
      nivel_procesamiento: 3,
      prioridad,
    },
  ]
}
