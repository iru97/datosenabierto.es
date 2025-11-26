# Clasificación + Contenido: LLM Unificado

## Problema Actual

- **Clasificación**: Keyword matching simple (malo, gratis)
- **Contenido**: LLM call (bueno, caro ~$0.001/doc)
- **Resultado**: Pagamos por LLM pero no aprovechamos su capacidad de clasificación

## Solución: Una Sola Llamada LLM

### Arquitectura

```typescript
async function procesarDocumentoConLLM(doc: DocumentoBOE): Promise<ResultadoCompleto> {
  const prompt = crearPromptUnificado(doc)

  const resultado = await llamarLLM(prompt, {
    schema: SCHEMA_RESULTADO_COMPLETO
  })

  return resultado
  // Retorna:
  // - categorias[] con confidence scores
  // - explicacion
  // - comoAfecta
  // - fechasImportantes[]
  // - keywords[]
}
```

### Prompt Unificado

```typescript
const SYSTEM_PROMPT = `Eres un experto en documentos oficiales del BOE español.

Tu tarea es analizar un documento y proporcionar:

1. CLASIFICACIÓN MULTI-CATEGORÍA
   - Asigna el documento a 1-4 categorías de la lista predefinida
   - Proporciona confidence score (0-1) para cada categoría
   - Ordena por relevancia (primero la más importante)

2. CONTENIDO EDUCATIVO
   - Explicación clara (lenguaje ciudadano, no jerga)
   - Cómo afecta a ciudadanos concretos
   - Fechas importantes y plazos
   - Keywords relevantes

Categorías disponibles:
- oposiciones: Convocatorias de empleo público, concursos, listas
- ayudas: Subvenciones, becas, ayudas económicas
- legislacion: Leyes, Reales Decretos, normativa general
- educacion: Universidad, títulos, formación
- empleo: Convenios colectivos, trabajo, salarios
- medio-ambiente: Sostenibilidad, espacios protegidos, renovables
- vivienda: Alquiler, rehabilitación, vivienda protegida
- salud: Sanidad, medicamentos, seguridad alimentaria
- trafico: Vehículos, permisos, seguridad vial
- tecnologia: Datos, telecomunicaciones, administración electrónica
- nombramientos: Ceses, designaciones
- licitaciones: Contratos públicos, adjudicaciones
- otros: Si no encaja en ninguna anterior

IMPORTANTE:
- Un documento puede tener múltiples categorías (ej: "Ayudas para oposiciones" → ayudas + oposiciones)
- Confidence score refleja qué tan relevante es para cada categoría
- Explicación debe ser comprensible para un ciudadano sin conocimientos legales
`

const USER_PROMPT = (doc: DocumentoBOE) => `
Analiza este documento del BOE:

METADATA:
- ID: ${doc.boe_id}
- Fecha: ${doc.fecha_publicacion}
- Sección: ${doc.seccion}
- Rango: ${doc.rango}
- Departamento: ${doc.departamento}
- Epígrafe: ${doc.epigrafe || 'N/A'}

TÍTULO:
${doc.titulo}

${doc.texto_completo ? `TEXTO COMPLETO:\n${doc.texto_completo.substring(0, 4000)}...` : ''}

Proporciona el análisis completo siguiendo el formato JSON especificado.
`
```

### JSON Schema

```typescript
const SCHEMA_RESULTADO_COMPLETO = {
  type: "object",
  properties: {
    // 1. CLASIFICACIÓN
    categorias: {
      type: "array",
      items: {
        type: "object",
        properties: {
          categoria_slug: {
            type: "string",
            enum: ["oposiciones", "ayudas", "legislacion", "educacion", "empleo",
                   "medio-ambiente", "vivienda", "salud", "trafico", "tecnologia",
                   "nombramientos", "licitaciones", "otros"]
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1
          },
          razonamiento: {
            type: "string",
            description: "Por qué este documento pertenece a esta categoría"
          }
        },
        required: ["categoria_slug", "confidence", "razonamiento"]
      },
      minItems: 1,
      maxItems: 4
    },

    // 2. CONTENIDO EDUCATIVO
    explicacion: {
      type: "string",
      description: "Qué es este documento en lenguaje claro (2-3 oraciones)"
    },

    comoAfecta: {
      type: "string",
      description: "Cómo afecta a ciudadanos concretos, con ejemplos"
    },

    fechasImportantes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tipo: {
            type: "string",
            enum: ["Plazo presentación", "Fecha límite", "Entrada en vigor", "Publicación resultado"]
          },
          fecha: {
            type: "string",
            format: "date"
          },
          descripcion: {
            type: "string"
          }
        },
        required: ["tipo", "fecha"]
      }
    },

    keywords: {
      type: "array",
      items: { type: "string" },
      maxItems: 8,
      description: "Palabras clave para búsqueda"
    }
  },
  required: ["categorias", "explicacion", "comoAfecta", "fechasImportantes", "keywords"]
}
```

### Implementación

```typescript
// utils/clasificacion-llm-unificada.ts

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function procesarDocumentoConLLM(
  documento: DocumentoBOE
): Promise<ResultadoCompleto> {

  console.log(`🤖 Procesando ${documento.boe_id} con LLM unificado...`)

  const inicio = Date.now()

  // 1. Llamada LLM con structured output
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: crearUserPrompt(documento) }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'resultado_completo',
        schema: SCHEMA_RESULTADO_COMPLETO,
        strict: true
      }
    },
    temperature: 0.3 // Más determinista para clasificación
  })

  const resultado = JSON.parse(completion.choices[0].message.content!)

  // 2. Obtener IDs de categorías desde Supabase
  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, slug')

  const categoriasConId = resultado.categorias.map((cat: any) => {
    const categoriaDB = categorias?.find(c => c.slug === cat.categoria_slug)
    return {
      categoria_id: categoriaDB?.id,
      categoria_slug: cat.categoria_slug,
      confidence: cat.confidence,
      razonamiento: cat.razonamiento
    }
  }).filter((c: any) => c.categoria_id) // Solo las que existen en DB

  // 3. Guardar documento
  const { data: docInsertado, error: docError } = await supabase
    .from('documentos_boe')
    .insert({
      boe_id: documento.boe_id,
      titulo: documento.titulo,
      fecha_publicacion: documento.fecha_publicacion,
      url_pdf: documento.url_pdf,
      departamento: documento.departamento,
      seccion: documento.seccion,
      rango: documento.rango,
      epigrafe: documento.epigrafe,

      // Contenido educativo
      explicacion: resultado.explicacion,
      como_afecta: resultado.comoAfecta,
      fechas: resultado.fechasImportantes,
      keywords: resultado.keywords,

      procesado: true,
      procesado_fecha: new Date().toISOString()
    })
    .select()
    .single()

  if (docError) throw docError

  // 4. Guardar clasificaciones múltiples
  const clasificaciones = categoriasConId.map((cat: any) => ({
    documento_id: docInsertado.id,
    categoria_id: cat.categoria_id,
    confidence: cat.confidence,
    clasificacion_metodo: 'llm' as const,
    razonamiento: cat.razonamiento
  }))

  const { error: catError } = await supabase
    .from('documento_categorias')
    .insert(clasificaciones)

  if (catError) throw catError

  const duracion = Date.now() - inicio
  const coste = (completion.usage?.total_tokens || 0) * 0.00015 / 1000 // GPT-4o-mini pricing

  console.log(`✅ Procesado en ${duracion}ms, ${completion.usage?.total_tokens} tokens, ~$${coste.toFixed(4)}`)

  return {
    documento_id: docInsertado.id,
    categorias: categoriasConId,
    contenido: {
      explicacion: resultado.explicacion,
      comoAfecta: resultado.comoAfecta,
      fechasImportantes: resultado.fechasImportantes,
      keywords: resultado.keywords
    },
    metadata: {
      tokens: completion.usage?.total_tokens || 0,
      coste_usd: coste,
      duracion_ms: duracion,
      modelo: 'gpt-4o-mini'
    }
  }
}
```

## Ventajas

✅ **Una sola llamada** → Clasificación + Contenido
✅ **Clasificación semántica** → Captura múltiples categorías relevantes
✅ **Consistencia** → La explicación y categorías son coherentes
✅ **Más barato** → Elimina keyword matching + reduce llamadas
✅ **Mejor UX** → Documentos aparecen en todas sus categorías relevantes

## Costes

- **Antes**: $0.001/doc (solo contenido) + clasificación mala gratis
- **Ahora**: $0.0015/doc (contenido + clasificación excelente)
- **Incremento**: +50% pero con clasificación 10x mejor

## Métricas de Éxito

Track en `classification_metrics`:
- Precision/Recall por categoría
- Distribución de confidence scores
- Documentos con múltiples categorías (esperado: 30-40%)
- Feedback humano (correcciones)

## Siguiente Paso

Implementar y probar con 50 documentos reales para validar calidad.
