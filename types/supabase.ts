/**
 * Tipos generados automáticamente para Supabase
 *
 * NOTA: En producción, estos tipos se pueden generar automáticamente con:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
 *
 * Por ahora, los definimos manualmente basados en el schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: string
          slug: string
          nombre: string
          descripcion: string | null
          prioridad: number
          icono: string | null
          color: string | null
          activa: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          nombre: string
          descripcion?: string | null
          prioridad?: number
          icono?: string | null
          color?: string | null
          activa?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          nombre?: string
          descripcion?: string | null
          prioridad?: number
          icono?: string | null
          color?: string | null
          activa?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      documentos_boe: {
        Row: {
          id: string
          boe_id: string
          categoria_id: string | null
          fecha_publicacion: string
          titulo: string
          seccion: string | null
          departamento: string | null
          rango: string | null
          url_pdf: string | null
          url_xml: string | null
          datos_estructurados: Json
          fechas_importantes: Json
          keywords: string[]
          metadata: Json
          procesado: boolean
          procesado_at: string | null
          error_procesamiento: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          boe_id: string
          categoria_id?: string | null
          fecha_publicacion: string
          titulo: string
          seccion?: string | null
          departamento?: string | null
          rango?: string | null
          url_pdf?: string | null
          url_xml?: string | null
          datos_estructurados?: Json
          fechas_importantes?: Json
          keywords?: string[]
          metadata?: Json
          procesado?: boolean
          procesado_at?: string | null
          error_procesamiento?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          boe_id?: string
          categoria_id?: string | null
          fecha_publicacion?: string
          titulo?: string
          seccion?: string | null
          departamento?: string | null
          rango?: string | null
          url_pdf?: string | null
          url_xml?: string | null
          datos_estructurados?: Json
          fechas_importantes?: Json
          keywords?: string[]
          metadata?: Json
          procesado?: boolean
          procesado_at?: string | null
          error_procesamiento?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      explicaciones_llm: {
        Row: {
          id: string
          documento_id: string
          tipo: string
          contenido: string
          modelo_usado: string | null
          tokens_usados: number | null
          tokens_input: number | null
          tokens_output: number | null
          tiempo_generacion_ms: number | null
          calidad_score: number | null
          validado: boolean
          created_at: string
        }
        Insert: {
          id?: string
          documento_id: string
          tipo: string
          contenido: string
          modelo_usado?: string | null
          tokens_usados?: number | null
          tokens_input?: number | null
          tokens_output?: number | null
          tiempo_generacion_ms?: number | null
          calidad_score?: number | null
          validado?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          documento_id?: string
          tipo?: string
          contenido?: string
          modelo_usado?: string | null
          tokens_usados?: number | null
          tokens_input?: number | null
          tokens_output?: number | null
          tiempo_generacion_ms?: number | null
          calidad_score?: number | null
          validado?: boolean
          created_at?: string
        }
      }
      estadisticas_categorias: {
        Row: {
          id: string
          categoria_id: string
          semana_inicio: string
          semana_fin: string
          total_documentos: number
          documentos_importantes: number
          resumen_semanal: string | null
          tendencias: string | null
          insights: string | null
          documentos_destacados: Json
          modelo_usado: string | null
          tokens_usados: number | null
          created_at: string
        }
        Insert: {
          id?: string
          categoria_id: string
          semana_inicio: string
          semana_fin: string
          total_documentos?: number
          documentos_importantes?: number
          resumen_semanal?: string | null
          tendencias?: string | null
          insights?: string | null
          documentos_destacados?: Json
          modelo_usado?: string | null
          tokens_usados?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          categoria_id?: string
          semana_inicio?: string
          semana_fin?: string
          total_documentos?: number
          documentos_importantes?: number
          resumen_semanal?: string | null
          tendencias?: string | null
          insights?: string | null
          documentos_destacados?: Json
          modelo_usado?: string | null
          tokens_usados?: number | null
          created_at?: string
        }
      }
      faqs: {
        Row: {
          id: string
          categoria_id: string
          pregunta: string
          respuesta: string
          orden: number
          veces_vista: number
          util_count: number
          no_util_count: number
          activa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          categoria_id: string
          pregunta: string
          respuesta: string
          orden?: number
          veces_vista?: number
          util_count?: number
          no_util_count?: number
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          categoria_id?: string
          pregunta?: string
          respuesta?: string
          orden?: number
          veces_vista?: number
          util_count?: number
          no_util_count?: number
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      favoritos: {
        Row: {
          id: string
          user_id: string
          documento_id: string
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          documento_id: string
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          documento_id?: string
          notas?: string | null
          created_at?: string
        }
      }
      alertas_usuario: {
        Row: {
          id: string
          user_id: string
          categoria_id: string
          nombre: string
          keywords: string[]
          frecuencia: string
          activa: boolean
          ultima_ejecucion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          categoria_id: string
          nombre: string
          keywords?: string[]
          frecuencia?: string
          activa?: boolean
          ultima_ejecucion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          categoria_id?: string
          nombre?: string
          keywords?: string[]
          frecuencia?: string
          activa?: boolean
          ultima_ejecucion?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      procesamiento_log: {
        Row: {
          id: string
          fecha_inicio: string
          fecha_fin: string | null
          semana_procesada_inicio: string
          semana_procesada_fin: string
          total_documentos_procesados: number
          total_explicaciones_generadas: number
          total_tokens_usados: number
          total_costo_estimado: number | null
          estado: string
          error_mensaje: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          fecha_inicio: string
          fecha_fin?: string | null
          semana_procesada_inicio: string
          semana_procesada_fin: string
          total_documentos_procesados?: number
          total_explicaciones_generadas?: number
          total_tokens_usados?: number
          total_costo_estimado?: number | null
          estado?: string
          error_mensaje?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          fecha_inicio?: string
          fecha_fin?: string | null
          semana_procesada_inicio?: string
          semana_procesada_fin?: string
          total_documentos_procesados?: number
          total_explicaciones_generadas?: number
          total_tokens_usados?: number
          total_costo_estimado?: number | null
          estado?: string
          error_mensaje?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      feedback_usuarios: {
        Row: {
          id: string
          tipo: string
          referencia_id: string | null
          user_id: string | null
          rating: number | null
          comentario: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          tipo: string
          referencia_id?: string | null
          user_id?: string | null
          rating?: number | null
          comentario?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          tipo?: string
          referencia_id?: string | null
          user_id?: string | null
          rating?: number | null
          comentario?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ================================================================
// TIPOS DE DATOS ESTRUCTURADOS
// ================================================================

/**
 * Estructura de datos_estructurados para Oposiciones
 */
export interface DatosOposicion {
  organismo: string
  plazas: number
  tipo: 'libre' | 'interno' | 'promocion' | 'consolidacion'
  cuerpo?: string
  grupo?: string
  requisitos?: {
    titulacion?: string
    experiencia?: string
    otros?: string[]
  }
  fechas?: {
    tipo: string
    fecha: string
    descripcion?: string
  }[]
  enlace_bases?: string
}

/**
 * Estructura de datos_estructurados para Ayudas
 */
export interface DatosAyuda {
  organismo: string
  tipo: 'subvencion' | 'beca' | 'ayuda' | 'credito' | 'bonificacion'
  ambito: 'estatal' | 'autonomico' | 'local'
  destinatarios: string[]
  cuantia?: {
    minima?: number
    maxima?: number
    tipo?: 'fija' | 'porcentaje' | 'variable'
  }
  requisitos?: string[]
  plazo_solicitud?: {
    inicio?: string
    fin?: string
    duracion_dias?: number
  }
  como_solicitar?: string
  enlace_solicitud?: string
}

/**
 * Estructura de datos_estructurados para Legislación
 */
export interface DatosLegislacion {
  tipo: 'ley' | 'real-decreto' | 'orden' | 'resolucion'
  numero?: string
  afecta_a: string[]
  entrada_vigor?: string
  modifica?: string[]
  deroga?: string[]
  resumen_cambios?: string[]
  sectores_afectados?: string[]
}

/**
 * Estructura de fechas_importantes
 */
export interface FechaImportante {
  tipo: 'plazo' | 'examen' | 'publicacion' | 'entrada_vigor' | 'vencimiento' | 'otro'
  fecha: string
  descripcion: string
  urgente?: boolean
}

/**
 * Helper type para metadata
 */
export interface DocumentoMetadata {
  fuente?: string
  version?: string
  idiomas?: string[]
  [key: string]: any
}

/**
 * Helper type para estadísticas destacadas
 */
export interface DocumentoDestacado {
  documento_id: string
  razon: string
  prioridad: number
}
