/**
 * GESTIÓN DE CHECKPOINTS PARA PROCESAMIENTO RESILIENTE
 *
 * Sistema de checkpoints que permite pausar y reanudar procesamiento por lotes
 * sin perder progreso. Guarda estado cada N documentos procesados.
 */

import { createClient } from '@supabase/supabase-js'

// ================================================================
// TIPOS
// ================================================================

export interface CheckpointData {
  tipo_batch: 'diario' | 'semanal' | 'mensual' | 'on-demand'
  fecha_batch_inicio: string // YYYY-MM-DD
  fecha_batch_fin: string // YYYY-MM-DD
  total_documentos?: number
  costo_estimado_total?: number
  metadata?: Record<string, any>
}

export interface CheckpointProgress {
  documentos_procesados: number
  documentos_fallidos?: number
  ultimo_doc_procesado?: string
  costo_acumulado: number
  metadata?: Record<string, any>
}

export interface Checkpoint {
  id: string
  tipo_batch: string
  fecha_batch_inicio: string
  fecha_batch_fin: string
  estado: 'en_progreso' | 'pausado' | 'completado' | 'error'
  total_documentos: number
  documentos_procesados: number
  documentos_fallidos: number
  ultimo_doc_procesado: string | null
  costo_estimado_total: number
  costo_acumulado: number
  fecha_inicio: string
  fecha_pausa: string | null
  fecha_completado: string | null
  razon_pausa: string | null
  puede_reanudar: boolean
  metadata: Record<string, any>
}

// ================================================================
// CONFIGURACIÓN
// ================================================================

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ================================================================
// FUNCIONES PRINCIPALES
// ================================================================

/**
 * Obtiene o crea un checkpoint para un batch
 * Si hay uno en progreso o pausado, lo retoma
 * Si no, crea uno nuevo
 *
 * @param data Datos del batch a procesar
 * @returns ID del checkpoint
 */
export async function getOrCreateCheckpoint(data: CheckpointData): Promise<string> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // 1. Buscar checkpoint existente en progreso o pausado
  const { data: existing, error: searchError } = await supabase
    .from('procesamiento_checkpoints')
    .select('*')
    .eq('tipo_batch', data.tipo_batch)
    .eq('fecha_batch_inicio', data.fecha_batch_inicio)
    .eq('fecha_batch_fin', data.fecha_batch_fin)
    .in('estado', ['en_progreso', 'pausado'])
    .order('fecha_inicio', { ascending: false })
    .limit(1)
    .single()

  if (existing && !searchError) {
    console.log(`♻️ Reanudando checkpoint existente: ${existing.id}`)
    console.log(`   - Progreso: ${existing.documentos_procesados}/${existing.total_documentos} documentos`)
    console.log(`   - Coste acumulado: $${existing.costo_acumulado.toFixed(4)}`)
    console.log(`   - Último documento: ${existing.ultimo_doc_procesado || 'N/A'}`)

    // Si estaba pausado, marcarlo como en progreso
    if (existing.estado === 'pausado') {
      await supabase
        .from('procesamiento_checkpoints')
        .update({ estado: 'en_progreso' })
        .eq('id', existing.id)
    }

    return existing.id
  }

  // 2. No existe checkpoint activo, crear uno nuevo
  const { data: newCheckpoint, error: createError } = await supabase
    .from('procesamiento_checkpoints')
    .insert({
      tipo_batch: data.tipo_batch,
      fecha_batch_inicio: data.fecha_batch_inicio,
      fecha_batch_fin: data.fecha_batch_fin,
      estado: 'en_progreso',
      total_documentos: data.total_documentos || 0,
      costo_estimado_total: data.costo_estimado_total || 0,
      metadata: data.metadata || {},
    })
    .select()
    .single()

  if (createError || !newCheckpoint) {
    throw new Error(`Error creating checkpoint: ${createError?.message}`)
  }

  console.log(`🆕 Nuevo checkpoint creado: ${newCheckpoint.id}`)
  console.log(`   - Tipo: ${data.tipo_batch}`)
  console.log(`   - Periodo: ${data.fecha_batch_inicio} → ${data.fecha_batch_fin}`)
  console.log(`   - Total documentos: ${data.total_documentos || 'desconocido'}`)

  return newCheckpoint.id
}

/**
 * Actualiza el progreso de un checkpoint
 * Llamar cada N documentos procesados
 *
 * @param checkpointId ID del checkpoint
 * @param progress Datos de progreso
 */
export async function updateCheckpoint(
  checkpointId: string,
  progress: CheckpointProgress
): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Obtener checkpoint actual para merge de metadata
  const { data: current } = await supabase
    .from('procesamiento_checkpoints')
    .select('metadata')
    .eq('id', checkpointId)
    .single()

  const mergedMetadata = {
    ...(current?.metadata || {}),
    ...(progress.metadata || {}),
  }

  const { error } = await supabase
    .from('procesamiento_checkpoints')
    .update({
      documentos_procesados: progress.documentos_procesados,
      documentos_fallidos: progress.documentos_fallidos,
      ultimo_doc_procesado: progress.ultimo_doc_procesado,
      costo_acumulado: progress.costo_acumulado,
      metadata: mergedMetadata,
    })
    .eq('id', checkpointId)

  if (error) {
    console.error('Error updating checkpoint:', error)
  } else {
    console.log(`📊 Checkpoint actualizado: ${progress.documentos_procesados} documentos, $${progress.costo_acumulado.toFixed(4)}`)
  }
}

/**
 * Pausa un checkpoint con una razón específica
 *
 * @param checkpointId ID del checkpoint
 * @param reason Razón de la pausa
 * @param canResume Si se puede reanudar automáticamente
 */
export async function pauseCheckpoint(
  checkpointId: string,
  reason: string,
  canResume: boolean = true
): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { error } = await supabase
    .from('procesamiento_checkpoints')
    .update({
      estado: 'pausado',
      razon_pausa: reason,
      fecha_pausa: new Date().toISOString(),
      puede_reanudar: canResume,
    })
    .eq('id', checkpointId)

  if (error) {
    throw new Error(`Error pausing checkpoint: ${error.message}`)
  }

  console.log(`⏸️ Checkpoint pausado: ${checkpointId}`)
  console.log(`   - Razón: ${reason}`)
  console.log(`   - Puede reanudar: ${canResume ? 'Sí' : 'No'}`)
}

/**
 * Completa un checkpoint exitosamente
 *
 * @param checkpointId ID del checkpoint
 */
export async function completeCheckpoint(checkpointId: string): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { error } = await supabase
    .from('procesamiento_checkpoints')
    .update({
      estado: 'completado',
      fecha_completado: new Date().toISOString(),
    })
    .eq('id', checkpointId)

  if (error) {
    throw new Error(`Error completing checkpoint: ${error.message}`)
  }

  // Obtener datos finales para log
  const { data: checkpoint } = await supabase
    .from('procesamiento_checkpoints')
    .select('*')
    .eq('id', checkpointId)
    .single()

  if (checkpoint) {
    const duration = calculateDuration(checkpoint.fecha_inicio, checkpoint.fecha_completado!)
    console.log(`✅ Checkpoint completado: ${checkpointId}`)
    console.log(`   - Documentos procesados: ${checkpoint.documentos_procesados}/${checkpoint.total_documentos}`)
    console.log(`   - Documentos fallidos: ${checkpoint.documentos_fallidos}`)
    console.log(`   - Coste total: $${checkpoint.costo_acumulado.toFixed(4)}`)
    console.log(`   - Duración: ${duration}`)
  }
}

/**
 * Marca un checkpoint como error
 *
 * @param checkpointId ID del checkpoint
 * @param errorMessage Mensaje de error
 */
export async function errorCheckpoint(checkpointId: string, errorMessage: string): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { error } = await supabase
    .from('procesamiento_checkpoints')
    .update({
      estado: 'error',
      razon_pausa: errorMessage,
      fecha_pausa: new Date().toISOString(),
      puede_reanudar: false,
    })
    .eq('id', checkpointId)

  if (error) {
    console.error('Error marking checkpoint as error:', error)
  } else {
    console.log(`❌ Checkpoint marcado como error: ${checkpointId}`)
    console.log(`   - Error: ${errorMessage}`)
  }
}

/**
 * Obtiene un checkpoint por ID
 *
 * @param checkpointId ID del checkpoint
 * @returns Datos del checkpoint o null
 */
export async function getCheckpoint(checkpointId: string): Promise<Checkpoint | null> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data, error } = await supabase
    .from('procesamiento_checkpoints')
    .select('*')
    .eq('id', checkpointId)
    .single()

  if (error || !data) {
    console.error('Error fetching checkpoint:', error)
    return null
  }

  return data as Checkpoint
}

/**
 * Obtiene checkpoints activos (en progreso o pausados)
 *
 * @returns Array de checkpoints activos
 */
export async function getActiveCheckpoints(): Promise<Checkpoint[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data, error } = await supabase
    .from('procesamiento_checkpoints')
    .select('*')
    .in('estado', ['en_progreso', 'pausado'])
    .order('fecha_inicio', { ascending: false })

  if (error || !data) {
    console.error('Error fetching active checkpoints:', error)
    return []
  }

  return data as Checkpoint[]
}

/**
 * Obtiene checkpoints completados recientemente
 *
 * @param limit Número máximo de checkpoints a devolver
 * @returns Array de checkpoints completados
 */
export async function getRecentCompletedCheckpoints(limit: number = 10): Promise<Checkpoint[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data, error } = await supabase
    .from('procesamiento_checkpoints')
    .select('*')
    .eq('estado', 'completado')
    .order('fecha_completado', { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('Error fetching recent checkpoints:', error)
    return []
  }

  return data as Checkpoint[]
}

/**
 * Calcula estadísticas agregadas de checkpoints completados
 *
 * @param desde Fecha de inicio (opcional)
 * @param hasta Fecha de fin (opcional)
 */
export async function getCheckpointStats(desde?: Date, hasta?: Date) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  let query = supabase
    .from('procesamiento_checkpoints')
    .select('*')
    .eq('estado', 'completado')

  if (desde) {
    query = query.gte('fecha_completado', desde.toISOString())
  }
  if (hasta) {
    query = query.lte('fecha_completado', hasta.toISOString())
  }

  const { data: checkpoints } = await query

  if (!checkpoints || checkpoints.length === 0) {
    return {
      total_checkpoints: 0,
      total_documentos: 0,
      total_fallidos: 0,
      coste_total: 0,
      duracion_promedio_minutos: 0,
    }
  }

  const stats = {
    total_checkpoints: checkpoints.length,
    total_documentos: checkpoints.reduce((sum, c) => sum + c.documentos_procesados, 0),
    total_fallidos: checkpoints.reduce((sum, c) => sum + (c.documentos_fallidos || 0), 0),
    coste_total: checkpoints.reduce((sum, c) => sum + c.costo_acumulado, 0),
    duracion_promedio_minutos: 0,
  }

  // Calcular duración promedio
  const duraciones = checkpoints
    .filter(c => c.fecha_inicio && c.fecha_completado)
    .map(c => {
      const inicio = new Date(c.fecha_inicio).getTime()
      const fin = new Date(c.fecha_completado!).getTime()
      return (fin - inicio) / 1000 / 60 // Minutos
    })

  if (duraciones.length > 0) {
    stats.duracion_promedio_minutos = duraciones.reduce((sum, d) => sum + d, 0) / duraciones.length
  }

  return stats
}

/**
 * Limpia checkpoints completados antiguos
 *
 * @param olderThanDays Checkpoints completados hace más de X días
 * @returns Número de checkpoints eliminados
 */
export async function cleanupOldCheckpoints(olderThanDays: number = 90): Promise<number> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  const { data, error } = await supabase
    .from('procesamiento_checkpoints')
    .delete()
    .eq('estado', 'completado')
    .lt('fecha_completado', cutoffDate.toISOString())
    .select('id')

  if (error) {
    console.error('Error cleaning up old checkpoints:', error)
    return 0
  }

  const deleted = data?.length || 0
  console.log(`🧹 Checkpoints antiguos eliminados: ${deleted} (más de ${olderThanDays} días)`)
  return deleted
}

// ================================================================
// HELPERS
// ================================================================

/**
 * Calcula duración legible entre dos fechas
 */
function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()

  const minutes = Math.floor(diffMs / 1000 / 60)
  const seconds = Math.floor((diffMs / 1000) % 60)

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return `${minutes}m ${seconds}s`
}

/**
 * Calcula porcentaje de progreso
 */
export function calculateProgress(procesados: number, total: number): number {
  if (total === 0) return 0
  return Math.round((procesados / total) * 100)
}

/**
 * Formatea un checkpoint para log/display
 */
export function formatCheckpoint(checkpoint: Checkpoint): string {
  const progress = calculateProgress(checkpoint.documentos_procesados, checkpoint.total_documentos)
  const estado = checkpoint.estado === 'en_progreso' ? '🔄' :
                 checkpoint.estado === 'pausado' ? '⏸️' :
                 checkpoint.estado === 'completado' ? '✅' : '❌'

  return `${estado} ${checkpoint.tipo_batch} | ${progress}% (${checkpoint.documentos_procesados}/${checkpoint.total_documentos}) | $${checkpoint.costo_acumulado.toFixed(4)}`
}
