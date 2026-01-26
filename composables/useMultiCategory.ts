/**
 * Multi-Category Classification Composable
 * Phase 1: Sprint 1-2 Implementation
 *
 * Provides functions for multi-category document classification
 * with confidence scores and classification methods tracking
 */

import type { Database } from '~/types/supabase'

// ================================================================
// TYPES
// ================================================================

export type ClasificacionMetodo = 'rule' | 'keyword' | 'llm' | 'legacy'

export interface DocumentoCategoria {
  id: string
  documento_id: string
  categoria_id: string
  confidence: number
  clasificacion_metodo: ClasificacionMetodo
  razonamiento: string | null
  created_at: string
}

export interface DocumentoConCategorias {
  id: string
  titulo: string
  fecha_publicacion: string
  categorias: Array<{
    categoria_id: string
    categoria_slug: string
    categoria_nombre: string
    confidence: number
    metodo: ClasificacionMetodo
  }>
}

export interface ClassificationFeedback {
  documento_id: string
  clasificacion_id?: string
  correcto: boolean
  categoria_correcta?: string
  comentario?: string
  revisor_id?: string
}

// ================================================================
// CLASSIFICATION QUERIES
// ================================================================

/**
 * Get all categories for a document, sorted by confidence
 */
export async function getCategoriasDelDocumento(documentoId: string) {
  const { supabase } = useSupabase()

  const { data, error } = await supabase
    .from('documento_categorias')
    .select(`
      *,
      categoria:categorias(*)
    `)
    .eq('documento_id', documentoId)
    .order('confidence', { ascending: false })

  if (error) {
    console.error('Error fetching document categories:', error)
    return []
  }

  return data || []
}

/**
 * Get primary (highest confidence) category for a document
 */
export async function getCategoriaPrincipal(documentoId: string) {
  const categorias = await getCategoriasDelDocumento(documentoId)
  return categorias[0] || null
}

/**
 * Get documents by category using multi-category table
 * (replaces getDocumentosByCategoria from useSupabase.ts)
 */
export async function getDocumentosPorCategoria(
  categoriaId: string,
  options: {
    minConfidence?: number
    limit?: number
    offset?: number
    desde?: Date
    hasta?: Date
  } = {}
) {
  const { supabase } = useSupabase()
  const {
    minConfidence = 0.5,
    limit = 20,
    offset = 0,
    desde,
    hasta
  } = options

  // Query documento_categorias with JOIN to documentos_boe
  let query = supabase
    .from('documento_categorias')
    .select(`
      confidence,
      clasificacion_metodo,
      documento:documentos_boe!inner (
        *,
        explicaciones:explicaciones_llm(*)
      )
    `, { count: 'exact' })
    .eq('categoria_id', categoriaId)
    .gte('confidence', minConfidence)

  if (desde) {
    query = query.gte('documento.fecha_publicacion', desde.toISOString().split('T')[0])
  }

  if (hasta) {
    query = query.lte('documento.fecha_publicacion', hasta.toISOString().split('T')[0])
  }

  const { data, error, count } = await query
    .order('confidence', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching documentos por categoria:', error)
    return { data: [], count: 0 }
  }

  // Transform data to include confidence metadata
  const documentos = (data || []).map(item => ({
    ...item.documento,
    _clasificacion: {
      confidence: item.confidence,
      metodo: item.clasificacion_metodo
    }
  }))

  return { data: documentos, count: count || 0 }
}

/**
 * Get all documents with their categories (for admin/analytics)
 */
export async function getDocumentosConTodasCategorias(options: {
  limit?: number
  offset?: number
  minCategorias?: number // Filter by min number of categories
} = {}) {
  const { supabase } = useSupabase()
  const { limit = 50, offset = 0, minCategorias = 1 } = options

  const { data, error } = await supabase
    .from('documentos_con_todas_categorias')
    .select('*')
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching documentos con categorias:', error)
    return []
  }

  // Filter by min categories if specified
  if (minCategorias > 1) {
    return (data || []).filter(doc =>
      doc.categorias && doc.categorias.length >= minCategorias
    )
  }

  return data || []
}

/**
 * Search documents across multiple categories
 */
export async function searchDocumentosMultiCategoria(
  categoriaIds: string[],
  options: {
    minConfidence?: number
    limit?: number
    offset?: number
  } = {}
) {
  const { supabase } = useSupabase()
  const { minConfidence = 0.5, limit = 20, offset = 0 } = options

  const { data, error } = await supabase
    .from('documento_categorias')
    .select(`
      confidence,
      clasificacion_metodo,
      documento:documentos_boe!inner (
        *,
        categoria:categorias(*)
      )
    `)
    .in('categoria_id', categoriaIds)
    .gte('confidence', minConfidence)
    .order('documento.fecha_publicacion', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error searching multi-category documents:', error)
    return []
  }

  return data || []
}

// ================================================================
// CLASSIFICATION MUTATIONS
// ================================================================

/**
 * Add a category to a document
 */
export async function addCategoriaADocumento(
  documentoId: string,
  categoriaId: string,
  confidence: number,
  metodo: ClasificacionMetodo,
  razonamiento?: string
) {
  const { supabase } = useSupabase()

  const { data, error } = await supabase
    .from('documento_categorias')
    .insert({
      documento_id: documentoId,
      categoria_id: categoriaId,
      confidence,
      clasificacion_metodo: metodo,
      razonamiento: razonamiento || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding category to document:', error)
    return null
  }

  return data
}

/**
 * Update classification confidence
 */
export async function updateClasificacionConfidence(
  documentoId: string,
  categoriaId: string,
  newConfidence: number
) {
  const { supabase } = useSupabase()

  const { data, error } = await supabase
    .from('documento_categorias')
    .update({ confidence: newConfidence })
    .eq('documento_id', documentoId)
    .eq('categoria_id', categoriaId)
    .select()
    .single()

  if (error) {
    console.error('Error updating classification confidence:', error)
    return null
  }

  return data
}

/**
 * Remove a category from a document
 */
export async function removeCategoriaDeDocumento(
  documentoId: string,
  categoriaId: string
) {
  const { supabase } = useSupabase()

  const { error } = await supabase
    .from('documento_categorias')
    .delete()
    .eq('documento_id', documentoId)
    .eq('categoria_id', categoriaId)

  if (error) {
    console.error('Error removing category from document:', error)
    return false
  }

  return true
}

/**
 * Replace all categories for a document (bulk update)
 */
export async function replaceCategoriasDocumento(
  documentoId: string,
  categorias: Array<{
    categoria_id: string
    confidence: number
    metodo: ClasificacionMetodo
    razonamiento?: string
  }>
) {
  const { supabase } = useSupabase()

  // Transaction: Delete all existing, then insert new
  // Note: Supabase doesn't have native transactions, so this is best-effort

  // 1. Delete existing
  const { error: deleteError } = await supabase
    .from('documento_categorias')
    .delete()
    .eq('documento_id', documentoId)

  if (deleteError) {
    console.error('Error deleting existing categories:', deleteError)
    return false
  }

  // 2. Insert new
  const { error: insertError } = await supabase
    .from('documento_categorias')
    .insert(
      categorias.map(cat => ({
        documento_id: documentoId,
        categoria_id: cat.categoria_id,
        confidence: cat.confidence,
        clasificacion_metodo: cat.metodo,
        razonamiento: cat.razonamiento || null
      }))
    )

  if (insertError) {
    console.error('Error inserting new categories:', insertError)
    return false
  }

  return true
}

// ================================================================
// FEEDBACK & VALIDATION
// ================================================================

/**
 * Submit classification feedback (human validation)
 */
export async function submitClassificationFeedback(
  feedback: ClassificationFeedback
) {
  const { supabase } = useSupabase()

  const { data, error } = await supabase
    .from('classification_feedback')
    .insert({
      documento_id: feedback.documento_id,
      clasificacion_id: feedback.clasificacion_id || null,
      correcto: feedback.correcto,
      categoria_correcta: feedback.categoria_correcta || null,
      comentario: feedback.comentario || null,
      revisor_id: feedback.revisor_id || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting classification feedback:', error)
    return null
  }

  return data
}

/**
 * Get pending documents for validation (no feedback yet)
 */
export async function getDocumentosPendientesValidacion(
  limit: number = 50,
  metodo?: ClasificacionMetodo
) {
  const { supabase } = useSupabase()

  // Get clasificaciones without feedback
  let query = supabase
    .from('documento_categorias')
    .select(`
      *,
      documento:documentos_boe!inner(*),
      categoria:categorias!inner(*)
    `)
    .is('classification_feedback.id', null)

  if (metodo) {
    query = query.eq('clasificacion_metodo', metodo)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching pending validation documents:', error)
    return []
  }

  return data || []
}

/**
 * Get classification feedback for a document
 */
export async function getFeedbackDelDocumento(documentoId: string) {
  const { supabase } = useSupabase()

  const { data, error } = await supabase
    .from('classification_feedback')
    .select('*')
    .eq('documento_id', documentoId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching document feedback:', error)
    return []
  }

  return data || []
}

// ================================================================
// METRICS & ANALYTICS
// ================================================================

/**
 * Get classification metrics for a category and period
 */
export async function getMetricasClasificacion(
  categoriaId: string,
  periodo?: string // YYYY-WW format
) {
  const { supabase } = useSupabase()

  let query = supabase
    .from('classification_metrics')
    .select('*')
    .eq('categoria_id', categoriaId)

  if (periodo) {
    query = query.eq('periodo', periodo)
  }

  const { data, error } = await query.order('periodo', { ascending: false })

  if (error) {
    console.error('Error fetching classification metrics:', error)
    return []
  }

  return data || []
}

/**
 * Get classification method distribution
 */
export async function getDistribucionMetodos(
  categoriaId?: string,
  desde?: Date,
  hasta?: Date
) {
  const { supabase } = useSupabase()

  let query = supabase
    .from('documento_categorias')
    .select('clasificacion_metodo')

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId)
  }

  if (desde) {
    query = query.gte('created_at', desde.toISOString())
  }

  if (hasta) {
    query = query.lte('created_at', hasta.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching method distribution:', error)
    return {
      rule: 0,
      keyword: 0,
      llm: 0,
      legacy: 0
    }
  }

  // Count by method
  const distribution = (data || []).reduce((acc, item) => {
    acc[item.clasificacion_metodo] = (acc[item.clasificacion_metodo] || 0) + 1
    return acc
  }, {} as Record<ClasificacionMetodo, number>)

  return {
    rule: distribution.rule || 0,
    keyword: distribution.keyword || 0,
    llm: distribution.llm || 0,
    legacy: distribution.legacy || 0
  }
}

/**
 * Get average confidence by category
 */
export async function getPromedioConfianzaPorCategoria() {
  const { supabase } = useSupabase()

  const { data, error } = await supabase
    .from('documento_categorias')
    .select(`
      categoria_id,
      confidence,
      categoria:categorias(nombre, slug)
    `)

  if (error) {
    console.error('Error fetching confidence averages:', error)
    return []
  }

  // Group by category and calculate average
  const grouped = (data || []).reduce((acc, item) => {
    if (!acc[item.categoria_id]) {
      acc[item.categoria_id] = {
        categoria_id: item.categoria_id,
        categoria_nombre: item.categoria?.nombre,
        categoria_slug: item.categoria?.slug,
        total_confidence: 0,
        count: 0
      }
    }

    acc[item.categoria_id].total_confidence += item.confidence
    acc[item.categoria_id].count += 1

    return acc
  }, {} as Record<string, any>)

  return Object.values(grouped).map((item: any) => ({
    categoria_id: item.categoria_id,
    categoria_nombre: item.categoria_nombre,
    categoria_slug: item.categoria_slug,
    promedio_confidence: item.total_confidence / item.count,
    total_documentos: item.count
  }))
}

/**
 * Get multi-category statistics
 */
export async function getEstadisticasMultiCategoria() {
  const { supabase } = useSupabase()

  // Get count of documents by number of categories
  const { data, error } = await supabase
    .from('documentos_con_todas_categorias')
    .select('categorias')

  if (error) {
    console.error('Error fetching multi-category stats:', error)
    return {
      total_documentos: 0,
      con_1_categoria: 0,
      con_2_categorias: 0,
      con_3_mas_categorias: 0,
      promedio_categorias: 0
    }
  }

  const stats = (data || []).reduce((acc, doc) => {
    const numCategorias = doc.categorias?.length || 0

    acc.total_documentos++

    if (numCategorias === 1) acc.con_1_categoria++
    else if (numCategorias === 2) acc.con_2_categorias++
    else if (numCategorias >= 3) acc.con_3_mas_categorias++

    acc.total_categorias += numCategorias

    return acc
  }, {
    total_documentos: 0,
    con_1_categoria: 0,
    con_2_categorias: 0,
    con_3_mas_categorias: 0,
    total_categorias: 0
  })

  return {
    ...stats,
    promedio_categorias: stats.total_documentos > 0
      ? stats.total_categorias / stats.total_documentos
      : 0
  }
}
