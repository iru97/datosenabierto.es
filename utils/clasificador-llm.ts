/**
 * FASE 0: Agente Clasificador Multi-Categoría
 *
 * Clasifica documentos BOE en múltiples categorías usando LLM
 * Se ejecuta ANTES de las fases 1-4 de procesamiento educativo
 */

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// TIPOS
// ============================================================================

export interface DocumentoBOE {
  boe_id: string
  titulo: string
  fecha_publicacion: string
  seccion: string
  departamento?: string
  rango?: string
  epigrafe?: string
  resumen_boe?: string
}

export interface ClasificacionCategoria {
  categoria_slug: string
  categoria_id: string
  confidence: number
  razonamiento: string
}

export interface ResultadoClasificacion {
  categorias: ClasificacionCategoria[]
  metadata: {
    modelo: string
    tokens: number
    coste_usd: number
    duracion_ms: number
  }
}

// ============================================================================
// PROMPTS
// ============================================================================

const SYSTEM_PROMPT = `Eres un experto clasificador de documentos oficiales del BOE (Boletín Oficial del Estado) español.

Tu tarea es analizar un documento y asignarlo a una o más categorías relevantes.

IMPORTANTE:
- Un documento puede pertenecer a MÚLTIPLES categorías si es relevante para varias
- Asigna confidence score (0-1) según qué tan relevante es para cada categoría
- Ordena por relevancia (la más importante primero)
- Solo incluye categorías con confidence >= 0.6
- Máximo 4 categorías por documento
- Proporciona razonamiento breve y claro

CATEGORÍAS DISPONIBLES:

1. **oposiciones**: Convocatorias de empleo público, concursos, oposiciones, listas de admitidos/excluidos, nombramientos de tribunales, pruebas selectivas

2. **ayudas**: Subvenciones, becas, ayudas económicas, financiación, bonificaciones, incentivos, bases reguladoras

3. **legislacion**: Leyes, Reales Decretos, Decretos-ley, Órdenes Ministeriales, normativa general, reglamentos, modificaciones legales

4. **educacion**: Universidad, títulos académicos, homologaciones, planes de estudio, formación, enseñanza, currículos

5. **empleo**: Convenios colectivos, condiciones laborales, salarios, relaciones de trabajo, despidos, jornadas

6. **medio-ambiente**: Sostenibilidad, espacios protegidos, renovables, residuos, emisiones, cambio climático, parques naturales

7. **vivienda**: Vivienda protegida, alquiler, rehabilitación, VPO, acceso a vivienda, planes de vivienda

8. **salud**: Sanidad, medicamentos, farmacias, seguridad alimentaria, salud pública, asistencia sanitaria

9. **trafico**: Vehículos, permisos de conducir, circulación, seguridad vial, transporte, carreteras

10. **tecnologia**: Telecomunicaciones, protección de datos, RGPD, administración electrónica, firma digital, transformación digital

11. **nombramientos**: Ceses, designaciones de cargos, nombramientos de directores/embajadores/altos cargos

12. **licitaciones**: Contratos públicos, adjudicaciones, pliegos, concursos de obras/servicios, suministros

13. **otros**: Solo si no encaja bien en ninguna de las anteriores

NOTAS:
- "Convocatoria de ayudas para oposiciones" → ayudas (principal) + oposiciones (secundaria)
- "Real Decreto sobre educación ambiental" → legislacion (principal) + educacion + medio-ambiente
- "Convenio colectivo de profesores" → empleo (principal) + educacion (secundaria)
- Prioriza la INTENCIÓN principal del documento`

const USER_PROMPT = (doc: DocumentoBOE) => `Clasifica este documento del BOE:

METADATA:
- Sección: ${doc.seccion}
- Rango: ${doc.rango || 'N/A'}
- Departamento: ${doc.departamento || 'N/A'}
- Epígrafe: ${doc.epigrafe || 'N/A'}

TÍTULO:
${doc.titulo}

${doc.resumen_boe ? `RESUMEN BOE:\n${doc.resumen_boe}\n` : ''}

Proporciona la clasificación en formato JSON siguiendo el schema.`

// ============================================================================
// JSON SCHEMA
// ============================================================================

const CLASIFICACION_SCHEMA = {
  type: "object",
  properties: {
    categorias: {
      type: "array",
      items: {
        type: "object",
        properties: {
          categoria_slug: {
            type: "string",
            enum: [
              "oposiciones", "ayudas", "legislacion", "educacion", "empleo",
              "medio-ambiente", "vivienda", "salud", "trafico", "tecnologia",
              "nombramientos", "licitaciones", "otros"
            ]
          },
          confidence: {
            type: "number",
            minimum: 0.6,
            maximum: 1.0,
            description: "Qué tan relevante es este documento para esta categoría"
          },
          razonamiento: {
            type: "string",
            description: "Por qué este documento pertenece a esta categoría (máximo 50 palabras)"
          }
        },
        required: ["categoria_slug", "confidence", "razonamiento"],
        additionalProperties: false
      },
      minItems: 1,
      maxItems: 4,
      description: "Categorías ordenadas por relevancia (más importante primero)"
    }
  },
  required: ["categorias"],
  additionalProperties: false
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

export async function clasificarDocumentoConLLM(
  documento: DocumentoBOE
): Promise<ResultadoClasificacion> {

  console.log(`\n🤖 [FASE 0] Clasificando ${documento.boe_id}...`)

  const inicio = Date.now()

  // 1. Llamada a OpenAI con structured output
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: USER_PROMPT(documento) }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'clasificacion_documento',
        schema: CLASIFICACION_SCHEMA,
        strict: true
      }
    },
    temperature: 0.2, // Más determinista para clasificación
    max_tokens: 500
  })

  const resultado = JSON.parse(completion.choices[0].message.content!)

  // 2. Obtener IDs de categorías desde Supabase
  const { data: categoriasDB } = await supabase
    .from('categorias')
    .select('id, slug')

  if (!categoriasDB) {
    throw new Error('No se pudieron cargar las categorías de la base de datos')
  }

  // 3. Mapear slugs a IDs
  const categoriasConId = resultado.categorias
    .map((cat: any) => {
      const categoriaDB = categoriasDB.find(c => c.slug === cat.categoria_slug)

      if (!categoriaDB) {
        console.warn(`⚠️  Categoría no encontrada en DB: ${cat.categoria_slug}`)
        return null
      }

      return {
        categoria_slug: cat.categoria_slug,
        categoria_id: categoriaDB.id,
        confidence: cat.confidence,
        razonamiento: cat.razonamiento
      }
    })
    .filter((c): c is ClasificacionCategoria => c !== null)

  // 4. Calcular metadata
  const duracion = Date.now() - inicio
  const tokens = completion.usage?.total_tokens || 0

  // Pricing: GPT-4o-mini = $0.150/1M input, $0.600/1M output
  // Aproximación: 70% input, 30% output
  const coste = (tokens * 0.70 * 0.150 / 1_000_000) + (tokens * 0.30 * 0.600 / 1_000_000)

  console.log(`✅ [FASE 0] Clasificado en ${duracion}ms`)
  console.log(`   Categorías: ${categoriasConId.map(c => `${c.categoria_slug} (${(c.confidence * 100).toFixed(0)}%)`).join(', ')}`)
  console.log(`   Tokens: ${tokens}, Coste: $${coste.toFixed(5)}`)

  return {
    categorias: categoriasConId,
    metadata: {
      modelo: 'gpt-4o-mini',
      tokens,
      coste_usd: coste,
      duracion_ms: duracion
    }
  }
}

// ============================================================================
// GUARDAR EN BASE DE DATOS
// ============================================================================

export async function guardarClasificaciones(
  documentoId: string,
  clasificaciones: ClasificacionCategoria[]
): Promise<void> {

  const registros = clasificaciones.map(cat => ({
    documento_id: documentoId,
    categoria_id: cat.categoria_id,
    confidence: cat.confidence,
    clasificacion_metodo: 'llm' as const,
    razonamiento: cat.razonamiento
  }))

  const { error } = await supabase
    .from('documento_categorias')
    .insert(registros)

  if (error) {
    throw new Error(`Error guardando clasificaciones: ${error.message}`)
  }

  console.log(`💾 Guardadas ${registros.length} clasificaciones para documento ${documentoId}`)
}
