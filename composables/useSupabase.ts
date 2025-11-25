/**
 * Composable de Supabase para Nuxt
 *
 * Usa useRuntimeConfig para obtener las credenciales
 * y proporciona el cliente de Supabase con tipado completo
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

// ================================================================
// COMPOSABLE PRINCIPAL
// ================================================================

export const useSupabase = () => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured. Check your .env file and nuxt.config.ts')
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return { supabase }
}

// ================================================================
// HELPERS DE CONSULTA
// ================================================================

/**
 * Obtiene todas las categorías ordenadas por prioridad
 */
export async function getCategorias() {
  const { supabase } = useSupabase()

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
  const { supabase } = useSupabase()

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
  const { supabase } = useSupabase()
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
  const { supabase } = useSupabase()

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
  const { supabase } = useSupabase()

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
  const { supabase } = useSupabase()

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
  const { supabase } = useSupabase()

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
  const { supabase } = useSupabase()
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
  const { supabase } = useSupabase()

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
  const { supabase } = useSupabase()

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

/**
 * Obtiene documentos destacados de todas las categorías
 * con explicaciones LLM incluidas
 */
export async function getDocumentosDestacados(limit: number = 8) {
  const { supabase } = useSupabase()

  // Obtener últimos 7 días
  const hoy = new Date()
  const hace7Dias = new Date()
  hace7Dias.setDate(hoy.getDate() - 7)

  const { data, error } = await supabase
    .from('documentos_boe')
    .select(`
      *,
      categoria:categorias(*),
      explicaciones:explicaciones_llm(*)
    `)
    .eq('procesado', true)
    .eq('importante', true)
    .gte('fecha_publicacion', hace7Dias.toISOString().split('T')[0])
    .order('fecha_publicacion', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching documentos destacados:', error)
    return []
  }

  return data || []
}

/**
 * Obtiene documentos recientes con explicaciones LLM
 * para la home page
 */
export async function getDocumentosRecentesConExplicaciones(
  limit: number = 12,
  dias: number = 7
) {
  const { supabase } = useSupabase()

  const hoy = new Date()
  const desde = new Date()
  desde.setDate(hoy.getDate() - dias)

  const { data, error } = await supabase
    .from('documentos_boe')
    .select(`
      *,
      categoria:categorias(*),
      explicaciones:explicaciones_llm(*)
    `)
    .eq('procesado', true)
    .gte('fecha_publicacion', desde.toISOString().split('T')[0])
    .order('fecha_publicacion', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching documentos recientes con explicaciones:', error)
    return []
  }

  return data || []
}

/**
 * Obtiene estadísticas semanales agregadas de todas las categorías
 * para mostrar en la home
 */
export async function getEstadisticasSemanalesGlobal() {
  const { supabase } = useSupabase()

  // Obtener última semana de cada categoría
  const hoy = new Date()
  const hace7Dias = new Date()
  hace7Dias.setDate(hoy.getDate() - 7)

  const { data, error } = await supabase
    .from('estadisticas_categorias')
    .select(`
      *,
      categoria:categorias(*)
    `)
    .gte('semana_inicio', hace7Dias.toISOString().split('T')[0])
    .order('total_documentos', { ascending: false })

  if (error) {
    console.error('Error fetching estadisticas globales:', error)
    return []
  }

  return data || []
}

/**
 * Obtiene conteos rápidos para stats de la home
 */
export async function getEstadisticasHome() {
  const { supabase } = useSupabase()

  const hoy = new Date()
  const hace7Dias = new Date()
  hace7Dias.setDate(hoy.getDate() - 7)
  const fechaDesde = hace7Dias.toISOString().split('T')[0]

  // Documentos totales esta semana
  const { count: totalSemana, error: errorTotal } = await supabase
    .from('documentos_boe')
    .select('*', { count: 'exact', head: true })
    .eq('procesado', true)
    .gte('fecha_publicacion', fechaDesde)

  // Documentos importantes
  const { count: totalImportantes, error: errorImportantes } = await supabase
    .from('documentos_boe')
    .select('*', { count: 'exact', head: true })
    .eq('procesado', true)
    .eq('importante', true)
    .gte('fecha_publicacion', fechaDesde)

  // Categorías activas
  const { count: totalCategorias, error: errorCategorias } = await supabase
    .from('categorias')
    .select('*', { count: 'exact', head: true })
    .eq('activa', true)

  if (errorTotal || errorImportantes || errorCategorias) {
    console.error('Error fetching stats home:', { errorTotal, errorImportantes, errorCategorias })
  }

  return {
    documentosSemana: totalSemana || 0,
    documentosImportantes: totalImportantes || 0,
    categoriasActivas: totalCategorias || 0,
  }
}

/**
 * Obtiene las top 4 categorías más activas de la semana
 */
export async function getTopCategoriasActivas(limit: number = 4) {
  const { supabase } = useSupabase()

  const hoy = new Date()
  const hace7Dias = new Date()
  hace7Dias.setDate(hoy.getDate() - 7)

  const { data, error } = await supabase
    .from('estadisticas_categorias')
    .select(`
      *,
      categoria:categorias(*)
    `)
    .gte('semana_inicio', hace7Dias.toISOString().split('T')[0])
    .order('total_documentos', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top categorias:', error)
    return []
  }

  return data || []
}

// ================================================================
// TIPOS HELPER
// ================================================================

export type Categoria = Awaited<ReturnType<typeof getCategorias>>[number]
export type Documento = Awaited<ReturnType<typeof getDocumentoById>>
export type Estadistica = Awaited<ReturnType<typeof getEstadisticasSemanales>>[number]
export type FAQ = Awaited<ReturnType<typeof getFaqsByCategoria>>[number]
