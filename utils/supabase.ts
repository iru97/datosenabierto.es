/**
 * Supabase Client Utility
 *
 * Cliente de Supabase para acceder a la base de datos desde:
 * - Server-side (Nitro API routes)
 * - Client-side (Composables)
 *
 * IMPORTANTE: Este cliente es para LECTURA desde el cliente.
 * Las ESCRITURAS deben hacerse desde Netlify Functions para seguridad.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

// ================================================================
// CONFIGURACIÓN
// ================================================================

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.')
}

// ================================================================
// CLIENTE SUPABASE
// ================================================================

/**
 * Cliente de Supabase con tipado completo
 *
 * @example
 * // En un composable
 * const { data: categorias } = await supabase
 *   .from('categorias')
 *   .select('*')
 *   .order('prioridad', { ascending: false })
 *
 * @example
 * // En una API route
 * const { data: documentos } = await supabase
 *   .from('documentos_boe')
 *   .select(`
 *     *,
 *     categoria:categorias(*),
 *     explicaciones:explicaciones_llm(*)
 *   `)
 *   .eq('categoria_id', categoriaId)
 *   .order('fecha_publicacion', { ascending: false })
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No persistir sesión en server-side
    autoRefreshToken: false,
  },
})

// ================================================================
// HELPERS DE CONSULTA
// ================================================================

/**
 * Obtiene todas las categorías ordenadas por prioridad
 */
export async function getCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('activa', true)
    .order('prioridad', { ascending: false })
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error fetching categorias:', error)
    return []
  }

  return data
}

/**
 * Obtiene una categoría por su slug
 */
export async function getCategoriaBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('slug', slug)
    .eq('activa', true)
    .single()

  if (error) {
    console.error(`Error fetching categoria ${slug}:`, error)
    return null
  }

  return data
}

/**
 * Obtiene documentos de una categoría con paginación
 */
export async function getDocumentosByCategoria(
  categoriaId: string,
  options: {
    limit?: number
    offset?: number
    desde?: Date
    hasta?: Date
  } = {}
) {
  const { limit = 20, offset = 0, desde, hasta } = options

  let query = supabase
    .from('documentos_boe')
    .select(`
      *,
      categoria:categorias(*),
      explicaciones:explicaciones_llm(*)
    `, { count: 'exact' })
    .eq('categoria_id', categoriaId)
    .eq('procesado', true)

  if (desde) {
    query = query.gte('fecha_publicacion', desde.toISOString().split('T')[0])
  }

  if (hasta) {
    query = query.lte('fecha_publicacion', hasta.toISOString().split('T')[0])
  }

  const { data, error, count } = await query
    .order('fecha_publicacion', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching documentos:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

/**
 * Obtiene un documento específico con todas sus relaciones
 */
export async function getDocumentoById(documentoId: string) {
  const { data, error } = await supabase
    .from('documentos_boe')
    .select(`
      *,
      categoria:categorias(*),
      explicaciones:explicaciones_llm(*)
    `)
    .eq('id', documentoId)
    .single()

  if (error) {
    console.error('Error fetching documento:', error)
    return null
  }

  return data
}

/**
 * Obtiene documentos por BOE ID oficial
 */
export async function getDocumentoByBoeId(boeId: string) {
  const { data, error } = await supabase
    .from('documentos_boe')
    .select(`
      *,
      categoria:categorias(*),
      explicaciones:explicaciones_llm(*)
    `)
    .eq('boe_id', boeId)
    .single()

  if (error) {
    console.error('Error fetching documento by BOE ID:', error)
    return null
  }

  return data
}

/**
 * Obtiene estadísticas semanales de una categoría
 */
export async function getEstadisticasSemanales(
  categoriaId: string,
  semanas: number = 4
) {
  const { data, error } = await supabase
    .from('estadisticas_categorias')
    .select('*')
    .eq('categoria_id', categoriaId)
    .order('semana_inicio', { ascending: false })
    .limit(semanas)

  if (error) {
    console.error('Error fetching estadisticas:', error)
    return []
  }

  return data
}

/**
 * Obtiene FAQs de una categoría
 */
export async function getFaqsByCategoria(categoriaId: string) {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('categoria_id', categoriaId)
    .eq('activa', true)
    .order('orden', { ascending: true })

  if (error) {
    console.error('Error fetching FAQs:', error)
    return []
  }

  return data
}

/**
 * Búsqueda de documentos por keywords
 */
export async function searchDocumentos(
  keywords: string[],
  options: {
    categoriaId?: string
    limit?: number
    offset?: number
  } = {}
) {
  const { categoriaId, limit = 20, offset = 0 } = options

  let query = supabase
    .from('documentos_boe')
    .select(`
      *,
      categoria:categorias(*),
      explicaciones:explicaciones_llm(*)
    `, { count: 'exact' })
    .eq('procesado', true)
    .overlaps('keywords', keywords)

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId)
  }

  const { data, error, count } = await query
    .order('fecha_publicacion', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error searching documentos:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

/**
 * Obtiene documentos recientes de todas las categorías
 */
export async function getDocumentosRecientes(limit: number = 50) {
  const { data, error } = await supabase
    .from('documentos_boe')
    .select(`
      *,
      categoria:categorias(*)
    `)
    .eq('procesado', true)
    .order('fecha_publicacion', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching documentos recientes:', error)
    return []
  }

  return data
}

/**
 * Obtiene documentos por rango de fechas
 */
export async function getDocumentosByDateRange(
  desde: Date,
  hasta: Date,
  categoriaId?: string
) {
  let query = supabase
    .from('documentos_boe')
    .select(`
      *,
      categoria:categorias(*)
    `)
    .eq('procesado', true)
    .gte('fecha_publicacion', desde.toISOString().split('T')[0])
    .lte('fecha_publicacion', hasta.toISOString().split('T')[0])

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId)
  }

  const { data, error } = await query
    .order('fecha_publicacion', { ascending: false })

  if (error) {
    console.error('Error fetching documentos by date range:', error)
    return []
  }

  return data
}

// ================================================================
// TIPOS HELPER
// ================================================================

export type Categoria = Awaited<ReturnType<typeof getCategorias>>[number]
export type Documento = Awaited<ReturnType<typeof getDocumentoById>>
export type Estadistica = Awaited<ReturnType<typeof getEstadisticasSemanales>>[number]
export type FAQ = Awaited<ReturnType<typeof getFaqsByCategoria>>[number]
