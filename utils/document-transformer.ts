/**
 * Transformadores de datos para documentos BOE
 *
 * Convierte documentos de Supabase con explicaciones LLM
 * al formato esperado por los componentes de UI
 */

import type { Documento } from '~/composables/useSupabase'

/**
 * Estructura de explicación LLM en Supabase
 */
interface ExplicacionLLM {
  id: string
  documento_id: string
  tipo: 'resumen' | 'que_es' | 'como_afecta' | 'pasos' | 'requisitos'
  contenido: string
  modelo_usado?: string
  tokens_usados?: number
  created_at?: string
}

/**
 * Interfaz de fecha importante extraída
 */
interface FechaImportante {
  tipo: string
  fecha: string
  descripcion?: string
  diasRestantes?: number
}

/**
 * Documento transformado para componentes de UI
 */
export interface DocumentoTransformado {
  // Campos originales
  id: string
  boe_id: string
  titulo: string
  fecha_publicacion: string
  seccion: string
  departamento: string
  organismo?: string
  rango?: string
  url_pdf?: string
  url_html?: string
  url_xml?: string
  keywords?: string[]
  procesado: boolean
  importante?: boolean

  // Campos transformados de explicaciones LLM
  explicacion?: string  // De tipo 'que_es'
  comoAfecta?: string   // De tipo 'como_afecta'
  resumen?: {
    linea1?: string
    linea2?: string
    linea3?: string
    completo?: string
  }
  pasos?: string        // De tipo 'pasos'
  requisitos?: string   // De tipo 'requisitos'

  // Campos procesados
  tipoDocumento?: string
  fechaImportante?: FechaImportante

  // Relaciones
  categoria?: any
  explicaciones?: ExplicacionLLM[]
}

/**
 * Transforma un documento de Supabase al formato para UI
 */
export function transformarDocumento(doc: any): DocumentoTransformado {
  if (!doc) return null as any

  const explicaciones = doc.explicaciones || []

  // Extraer explicaciones por tipo
  const explicacionQueEs = explicaciones.find((e: ExplicacionLLM) => e.tipo === 'que_es')
  const explicacionComoAfecta = explicaciones.find((e: ExplicacionLLM) => e.tipo === 'como_afecta')
  const explicacionResumen = explicaciones.find((e: ExplicacionLLM) => e.tipo === 'resumen')
  const explicacionPasos = explicaciones.find((e: ExplicacionLLM) => e.tipo === 'pasos')
  const explicacionRequisitos = explicaciones.find((e: ExplicacionLLM) => e.tipo === 'requisitos')

  // Parsear resumen si existe (formato: "1. ...\n2. ...\n3. ...")
  let resumen: DocumentoTransformado['resumen'] | undefined
  if (explicacionResumen?.contenido) {
    const lineas = explicacionResumen.contenido.split('\n').filter(l => l.trim())
    resumen = {
      linea1: lineas[0]?.replace(/^1\.\s*/, '').trim(),
      linea2: lineas[1]?.replace(/^2\.\s*/, '').trim(),
      linea3: lineas[2]?.replace(/^3\.\s*/, '').trim(),
      completo: explicacionResumen.contenido
    }
  }

  // Extraer fecha importante si existe en datos estructurados
  let fechaImportante: FechaImportante | undefined
  if (doc.datos_estructurados?.fechas_importantes?.length > 0) {
    const primeraFecha = doc.datos_estructurados.fechas_importantes[0]
    fechaImportante = {
      tipo: primeraFecha.tipo || 'Fecha importante',
      fecha: primeraFecha.fecha,
      descripcion: primeraFecha.descripcion,
      diasRestantes: calcularDiasRestantes(primeraFecha.fecha)
    }
  }

  return {
    // Campos originales
    id: doc.id,
    boe_id: doc.boe_id,
    titulo: doc.titulo,
    fecha_publicacion: doc.fecha_publicacion,
    seccion: doc.seccion,
    departamento: doc.departamento,
    organismo: doc.organismo,
    rango: doc.rango,
    url_pdf: doc.url_pdf,
    url_html: doc.url_html,
    url_xml: doc.url_xml,
    keywords: doc.keywords,
    procesado: doc.procesado,
    importante: doc.importante,

    // Campos transformados
    explicacion: explicacionQueEs?.contenido,
    comoAfecta: explicacionComoAfecta?.contenido,
    resumen,
    pasos: explicacionPasos?.contenido,
    requisitos: explicacionRequisitos?.contenido,

    // Campos procesados
    tipoDocumento: determinarTipoDocumento(doc),
    fechaImportante,

    // Relaciones
    categoria: doc.categoria,
    explicaciones: doc.explicaciones
  }
}

/**
 * Transforma un array de documentos
 */
export function transformarDocumentos(docs: any[]): DocumentoTransformado[] {
  if (!docs || !Array.isArray(docs)) return []
  return docs.map(transformarDocumento).filter(Boolean)
}

/**
 * Determina el tipo de documento basado en sección y rango
 */
function determinarTipoDocumento(doc: any): string {
  if (doc.rango) return doc.rango
  if (doc.seccion?.includes('Disposiciones generales')) return 'Disposición General'
  if (doc.seccion?.includes('Oposiciones')) return 'Convocatoria'
  if (doc.seccion?.includes('Autoridades')) return 'Nombramiento'
  return 'Documento BOE'
}

/**
 * Calcula días restantes desde hoy hasta una fecha
 */
function calcularDiasRestantes(fecha: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const fechaObjetivo = new Date(fecha)
  fechaObjetivo.setHours(0, 0, 0, 0)

  const diffTime = fechaObjetivo.getTime() - hoy.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Filtra documentos destacados/importantes
 */
export function filtrarDestacados(docs: DocumentoTransformado[]): DocumentoTransformado[] {
  return docs.filter(doc => {
    // Marcar como destacado si:
    // - Tiene flag importante
    // - Tiene fecha urgente (< 15 días)
    // - Es muy reciente (< 3 días)

    if (doc.importante) return true

    if (doc.fechaImportante?.diasRestantes && doc.fechaImportante.diasRestantes < 15) {
      return true
    }

    const diasDesdePublicacion = calcularDiasDesdePublicacion(doc.fecha_publicacion)
    if (diasDesdePublicacion <= 3) return true

    return false
  })
}

/**
 * Calcula días desde la publicación
 */
function calcularDiasDesdePublicacion(fechaPublicacion: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const fechaPub = new Date(fechaPublicacion)
  fechaPub.setHours(0, 0, 0, 0)

  const diffTime = hoy.getTime() - fechaPub.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Agrupa documentos por fecha de publicación
 */
export function agruparPorFecha(docs: DocumentoTransformado[]): Record<string, DocumentoTransformado[]> {
  const grupos: Record<string, DocumentoTransformado[]> = {}

  docs.forEach(doc => {
    const fecha = doc.fecha_publicacion
    if (!grupos[fecha]) {
      grupos[fecha] = []
    }
    grupos[fecha].push(doc)
  })

  return grupos
}

/**
 * Ordena documentos por relevancia
 * (urgentes > importantes > recientes > resto)
 */
export function ordenarPorRelevancia(docs: DocumentoTransformado[]): DocumentoTransformado[] {
  return [...docs].sort((a, b) => {
    // Primero urgentes (fecha cercana)
    const diasA = a.fechaImportante?.diasRestantes ?? 999
    const diasB = b.fechaImportante?.diasRestantes ?? 999

    if (diasA < 15 && diasB >= 15) return -1
    if (diasB < 15 && diasA >= 15) return 1
    if (diasA < 15 && diasB < 15) return diasA - diasB

    // Luego importantes
    if (a.importante && !b.importante) return -1
    if (b.importante && !a.importante) return 1

    // Luego por fecha de publicación (más reciente primero)
    return new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime()
  })
}
