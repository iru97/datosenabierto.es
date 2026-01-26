/**
 * Sistema de Agentes LLM Especializados por Fase
 *
 * Cada fase tiene un objetivo claro y definido:
 * FASE 1: Extracción de datos estructurados
 * FASE 2: Resumen ejecutivo (3 líneas)
 * FASE 3: Explicaciones educativas ("¿Qué es?" y "¿Cómo me afecta?")
 * FASE 4: Detalles accionables (Requisitos, Pasos, Fechas)
 */

import 'dotenv/config'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

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
  contenido_raw?: string
  url_pdf?: string
}

export interface ResultadoFase1 {
  datos_estructurados: Record<string, any>
  fechas_importantes: FechaImportante[]
  keywords: string[]
}

export interface FechaImportante {
  fecha: string
  tipo: string  // 'plazo_inscripcion', 'examen', 'publicacion_resultado', etc
  descripcion: string
  urgencia: 'URGENTE' | 'PRÓXIMO' | 'NUEVO' | 'NORMAL'
  diasRestantes: number | null
}

export interface ResultadoFase2 {
  linea1: string
  linea2: string
  linea3: string
  detalles?: {
    paraQuien?: string
    queHacer?: string
    fechaLimite?: string
    diasRestantes?: number
  }
}

export interface ResultadoFase3 {
  queEs: string
  comoAfecta: string
}

export interface ResultadoFase4 {
  requisitos?: Requisito[]
  pasos?: Paso[]
}

export interface Requisito {
  titulo: string
  descripcion: string
  items?: string[]
}

export interface Paso {
  titulo: string
  descripcion: string
  plazo?: string
}

export interface ResultadoCompleto {
  fase1: ResultadoFase1
  fase2: ResultadoFase2
  fase3: ResultadoFase3
  fase4: ResultadoFase4
  metadata: {
    modelo: string
    tokens_usados: number
    tiempo_total_ms: number
    coste_estimado_usd: number
  }
}

// ============================================================================
// FASE 1: EXTRACCIÓN DE DATOS ESTRUCTURADOS
// ============================================================================
// Objetivo: Extraer datos clave del documento de forma estructurada
// Contexto: Esta fase NO usa LLM, solo regex y parsing
// Output: JSON con datos clave + fechas + keywords

export async function ejecutarFase1(
  documento: DocumentoBOE,
  categoria: string
): Promise<ResultadoFase1> {
  console.log(`📊 FASE 1: Extrayendo datos estructurados de ${documento.boe_id}`)

  const contenido = documento.contenido_raw || documento.titulo

  // Extraer datos específicos según categoría
  const datos_estructurados = extraerDatosPorCategoria(documento, categoria, contenido)

  // Extraer fechas importantes
  const fechas_importantes = extraerFechasImportantes(contenido, categoria)

  // Extraer keywords
  const keywords = extraerKeywords(documento.titulo, contenido)

  return {
    datos_estructurados,
    fechas_importantes,
    keywords,
  }
}

function extraerDatosPorCategoria(
  documento: DocumentoBOE,
  categoria: string,
  contenido: string
): Record<string, any> {
  const datos: Record<string, any> = {
    tipo_documento: documento.rango,
    organismo: documento.departamento,
    seccion: documento.seccion,
  }

  // Extracción específica por categoría (sin LLM)
  switch (categoria) {
    case 'oposiciones':
      datos.num_plazas = extraerNumeroPlazas(contenido)
      datos.tipo_convocatoria = extraerTipoConvocatoria(contenido)
      datos.cuerpo = extraerCuerpo(contenido)
      break

    case 'ayudas':
      datos.cuantia = extraerCuantia(contenido)
      datos.beneficiarios = extraerBeneficiarios(contenido)
      break

    case 'legislacion':
      datos.leyes_modificadas = extraerLeyesModificadas(contenido)
      datos.fecha_vigor = extraerFechaVigor(contenido)
      break

    // Más categorías...
  }

  return datos
}

function extraerFechasImportantes(contenido: string, categoria: string): FechaImportante[] {
  const fechas: FechaImportante[] = []
  const ahora = new Date()

  // Regex para fechas en formato español
  const regexFechas = /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/gi

  let match
  while ((match = regexFechas.exec(contenido)) !== null) {
    const [, dia, mes, año] = match
    const fecha = parsearFechaEspañol(dia, mes, año)

    // Determinar tipo de fecha según contexto
    const contexto = contenido.substring(Math.max(0, match.index - 50), match.index + 100)
    const tipo = determinarTipoFecha(contexto, categoria)

    // Calcular días restantes
    const diasRestantes = Math.ceil((fecha.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))

    // Determinar urgencia
    let urgencia: 'URGENTE' | 'PRÓXIMO' | 'NUEVO' | 'NORMAL' = 'NORMAL'
    if (diasRestantes < 0) urgencia = 'NORMAL'
    else if (diasRestantes <= 7) urgencia = 'URGENTE'
    else if (diasRestantes <= 30) urgencia = 'PRÓXIMO'
    else if (diasRestantes <= 90) urgencia = 'NUEVO'

    fechas.push({
      fecha: fecha.toISOString(),
      tipo,
      descripcion: match[0],
      urgencia,
      diasRestantes: diasRestantes >= 0 ? diasRestantes : null,
    })
  }

  return fechas
}

function extraerKeywords(titulo: string, contenido: string): string[] {
  const texto = `${titulo} ${contenido}`.toLowerCase()
  const keywords = new Set<string>()

  // Keywords comunes importantes
  const palabrasClave = [
    'oposición', 'plaza', 'convocatoria', 'subvención', 'ayuda', 'beca',
    'requisito', 'plazo', 'inscripción', 'solicitud', 'concurso',
    'ley', 'real decreto', 'orden', 'resolución',
    // Más keywords...
  ]

  for (const palabra of palabrasClave) {
    if (texto.includes(palabra)) {
      keywords.add(palabra)
    }
  }

  return Array.from(keywords)
}

// Helpers de extracción
function extraerNumeroPlazas(contenido: string): number | null {
  const match = contenido.match(/(\d+)\s+plazas?/i)
  return match ? parseInt(match[1]) : null
}

function extraerTipoConvocatoria(contenido: string): string | null {
  if (/libre concurrencia/i.test(contenido)) return 'libre'
  if (/promoción interna/i.test(contenido)) return 'promocion_interna'
  if (/turno libre/i.test(contenido)) return 'libre'
  return null
}

function extraerCuerpo(contenido: string): string | null {
  const match = contenido.match(/Cuerpo\s+([A-Z][a-záéíóúñ\s]+)/i)
  return match ? match[1].trim() : null
}

function extraerCuantia(contenido: string): { min?: number; max?: number } | null {
  const match = contenido.match(/(\d+(?:\.\d{3})*(?:,\d{2})?)\s*euros?/gi)
  if (!match) return null

  const cantidades = match.map(m => parseFloat(m.replace(/\./g, '').replace(',', '.')))
  return {
    min: Math.min(...cantidades),
    max: Math.max(...cantidades),
  }
}

function extraerBeneficiarios(contenido: string): string[] {
  const beneficiarios: string[] = []

  if (/pymes?/i.test(contenido)) beneficiarios.push('PYME')
  if (/autónomos?/i.test(contenido)) beneficiarios.push('Autónomos')
  if (/estudiantes?/i.test(contenido)) beneficiarios.push('Estudiantes')
  if (/empresas?/i.test(contenido)) beneficiarios.push('Empresas')

  return beneficiarios
}

function extraerLeyesModificadas(contenido: string): string[] {
  const leyes: string[] = []
  const regex = /Ley\s+\d+\/\d{4}/gi
  let match

  while ((match = regex.exec(contenido)) !== null) {
    leyes.push(match[0])
  }

  return leyes
}

function extraerFechaVigor(contenido: string): string | null {
  const match = contenido.match(/entra(?:rá)?\s+en\s+vigor\s+(?:el\s+)?(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i)
  return match ? match[1] : null
}

function parsearFechaEspañol(dia: string, mes: string, año: string): Date {
  const meses: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
  }

  return new Date(parseInt(año), meses[mes.toLowerCase()], parseInt(dia))
}

function determinarTipoFecha(contexto: string, categoria: string): string {
  const ctx = contexto.toLowerCase()

  if (ctx.includes('plazo') || ctx.includes('hasta el')) return 'plazo_limite'
  if (ctx.includes('examen') || ctx.includes('prueba')) return 'fecha_examen'
  if (ctx.includes('inscripción') || ctx.includes('solicitud')) return 'plazo_inscripcion'
  if (ctx.includes('vigor')) return 'entrada_vigor'
  if (ctx.includes('publicación') || ctx.includes('resultado')) return 'publicacion_resultado'

  return 'fecha_importante'
}

// ============================================================================
// FASE 2: RESUMEN EJECUTIVO (3 LÍNEAS)
// ============================================================================
// Objetivo: Generar resumen accesible en lenguaje claro para ciudadanos
// Principios: Plain language (nivel 7-8 grado), Progressive disclosure, Cognitive load < 4 elementos
// Output: 3 líneas GARANTIZADAS con JSON Schema strict mode

const RESUMEN_SCHEMA = {
  type: "object",
  properties: {
    linea1_que_es: {
      type: "string",
      description: "QUÉ es: qué se convoca/aprueba/modifica. Lenguaje claro, sin jerga. 20-35 palabras."
    },
    linea2_para_quien: {
      type: "string",
      description: "PARA QUIÉN: perfiles específicos afectados. Concreto y directo. 15-30 palabras."
    },
    linea3_cuando: {
      type: "string",
      description: "CUÁNDO: plazos, fechas límite, urgencia. Incluir días restantes si aplica. 15-30 palabras."
    }
  },
  required: ["linea1_que_es", "linea2_para_quien", "linea3_cuando"],
  additionalProperties: false
}

export async function ejecutarFase2(
  documento: DocumentoBOE,
  categoria: string,
  datosFase1: ResultadoFase1
): Promise<{ resultado: ResultadoFase2; tokensUsados: number }> {
  console.log(`📝 FASE 2: Generando resumen ejecutivo de ${documento.boe_id}`)

  // Truncar contenido si es muy largo (primeros 6000 chars + últimos 2000 chars)
  const contenidoCompleto = documento.contenido_raw || documento.titulo
  const contenidoTruncado = contenidoCompleto.length > 8000
    ? contenidoCompleto.substring(0, 6000) + '\n\n[... contenido omitido ...]\n\n' + contenidoCompleto.substring(contenidoCompleto.length - 2000)
    : contenidoCompleto

  const systemPrompt = `Eres un comunicador de servicio público que traduce documentos oficiales a lenguaje accesible.

OBJETIVO: Generar resumen de 3 líneas que cualquier ciudadano entienda en 15 segundos.

PRINCIPIOS (basados en plain language research):
- Nivel de lectura: 7º-8º grado (12-14 años)
- Oraciones cortas: 15-20 palabras promedio
- Voz activa > voz pasiva (ratio 2:1)
- Explicar términos técnicos inmediatamente
- Enfoque en información relevante para ciudadanos

ESTRUCTURA OBLIGATORIA:
1. QUÉ es: Qué se convoca/aprueba/modifica (específico, no genérico)
2. PARA QUIÉN: Perfiles concretos afectados (no "los interesados")
3. CUÁNDO: Plazos/fechas con urgencia (incluir días restantes)

EJEMPLOS BUENOS:
✅ "El Ministerio de Educación convoca 500 plazas de profesor de secundaria en toda España"
✅ "Para titulados universitarios con máster de profesorado y nivel B2 de inglés"
✅ "Inscripción del 15 al 30 de enero (quedan 12 días)"

EJEMPLOS MALOS:
❌ "Publicación de convocatoria" (muy vago)
❌ "Para los interesados" (poco específico)
❌ "Ver BOE" (no accionable)`

  const userPrompt = `Documento BOE:
Título: ${documento.titulo}
Categoría: ${categoria}
Organismo: ${documento.departamento || 'N/A'}
Tipo: ${documento.rango || 'N/A'}

${contenidoTruncado ? `Contenido del documento:\n${contenidoTruncado.substring(0, 3000)}\n` : ''}

Datos estructurados extraídos:
${JSON.stringify(datosFase1.datos_estructurados, null, 2)}

Fechas importantes:
${datosFase1.fechas_importantes.length > 0
  ? datosFase1.fechas_importantes.map(f =>
      `- ${f.tipo}: ${f.descripcion}${f.diasRestantes !== null ? ` (${f.diasRestantes} días restantes)` : ''}`
    ).join('\n')
  : 'No se detectaron fechas específicas'}

Genera el resumen de 3 líneas siguiendo el schema JSON.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    max_tokens: 400,
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'resumen_ejecutivo',
        schema: RESUMEN_SCHEMA,
        strict: true
      }
    }
  })

  const resultado = JSON.parse(completion.choices[0].message.content!)
  const tokensUsados = completion.usage?.total_tokens || 0

  console.log(`  → Resumen generado: ${tokensUsados} tokens`)

  return {
    resultado: {
      linea1: resultado.linea1_que_es,
      linea2: resultado.linea2_para_quien,
      linea3: resultado.linea3_cuando,
      detalles: {
        paraQuien: datosFase1.datos_estructurados.beneficiarios?.join(', '),
        fechaLimite: datosFase1.fechas_importantes[0]?.fecha,
        diasRestantes: datosFase1.fechas_importantes[0]?.diasRestantes || undefined,
      },
    },
    tokensUsados,
  }
}

// ============================================================================
// FASE 3: EXPLICACIONES EDUCATIVAS
// ============================================================================
// Objetivo: Explicaciones claras que responden "¿Qué es?" y "¿Cómo me afecta?"
// Principios: Cognitive load 4±1 elementos, ejemplos concretos, plain language
// Output: 2 explicaciones GARANTIZADAS con JSON Schema strict mode

const EXPLICACIONES_SCHEMA = {
  type: "object",
  properties: {
    que_es: {
      type: "string",
      description: "Explicación pedagógica de qué es el documento. Lenguaje simple, ejemplos concretos. 100-200 palabras."
    },
    como_afecta: {
      type: "string",
      description: "Explicación de quién debe prestar atención y por qué. Perfiles específicos, consecuencias claras. 100-200 palabras."
    },
    ejemplo_concreto: {
      type: "string",
      description: "Ejemplo real del día a día que ilustra el impacto. 30-80 palabras."
    }
  },
  required: ["que_es", "como_afecta", "ejemplo_concreto"],
  additionalProperties: false
}

export async function ejecutarFase3(
  documento: DocumentoBOE,
  categoria: string,
  datosFase1: ResultadoFase1,
  resumenFase2: ResultadoFase2
): Promise<{ resultado: ResultadoFase3; tokensUsados: number }> {
  console.log(`💡 FASE 3: Generando explicaciones educativas de ${documento.boe_id}`)

  // Truncar contenido (primeros 5000 chars + últimos 2000)
  const contenidoCompleto = documento.contenido_raw || documento.titulo
  const contenidoTruncado = contenidoCompleto.length > 7000
    ? contenidoCompleto.substring(0, 5000) + '\n\n[... omitido ...]\n\n' + contenidoCompleto.substring(contenidoCompleto.length - 2000)
    : contenidoCompleto

  const systemPrompt = `Eres un educador de servicio público que hace accesible la información oficial.

OBJETIVO: Explicar el documento de forma que cualquier ciudadano (nivel lectura 7º-8º grado) lo entienda completamente.

PRINCIPIOS EDUCATIVOS:
1. **Plain Language**: Oraciones cortas (15-20 palabras), voz activa
2. **Cognitive Load**: Máximo 4±1 conceptos nuevos por explicación
3. **Ejemplos Concretos**: Situaciones reales del día a día, no abstracciones
4. **Progressive Disclosure**: Info básica → detalles → implicaciones

ESTRUCTURA:
1. **¿Qué es?**: Definir tipo de documento + propósito + contexto
2. **¿Cómo afecta?**: Perfiles concretos + consecuencias específicas + cuándo importa
3. **Ejemplo concreto**: Caso real que ilustre el impacto

REGLAS ESTRICTAS:
- NUNCA usar jerga legal sin explicar (ej: "BOE" → "Boletín Oficial del Estado, donde se publican leyes")
- Explicar términos técnicos inmediatamente (ej: "plazos hábiles" → "días laborables, sin contar fines de semana")
- Usar segunda persona cuando apropiado ("te afecta si...", "necesitas...")
- Incluir números específicos, no vagos ("50 plazas", no "varias plazas")`

  const userPrompt = `Documento BOE:
Título: ${documento.titulo}
Categoría: ${categoria}
Tipo: ${documento.rango || 'Documento oficial'}
Organismo: ${documento.departamento || 'N/A'}

Resumen generado:
1. ${resumenFase2.linea1}
2. ${resumenFase2.linea2}
3. ${resumenFase2.linea3}

${contenidoTruncado ? `Contenido del documento (extracto):\n${contenidoTruncado.substring(0, 2500)}\n` : ''}

Datos estructurados:
${JSON.stringify(datosFase1.datos_estructurados, null, 2)}

Genera explicaciones educativas siguiendo el schema JSON.

IMPORTANTE:
- "¿Qué es?" debe explicar el documento como si hablaras con alguien que nunca ha leído un BOE
- "¿Cómo afecta?" debe especificar perfiles concretos (ej: "estudiantes universitarios", "autónomos del sector tech")
- "Ejemplo concreto" debe ser una situación real y específica`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    max_tokens: 800,
    temperature: 0.8,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'explicaciones_educativas',
        schema: EXPLICACIONES_SCHEMA,
        strict: true
      }
    }
  })

  const resultado = JSON.parse(completion.choices[0].message.content!)
  const tokensUsados = completion.usage?.total_tokens || 0

  console.log(`  → Explicaciones generadas: ${tokensUsados} tokens`)

  return {
    resultado: {
      queEs: resultado.que_es,
      comoAfecta: `${resultado.como_afecta}\n\nEjemplo: ${resultado.ejemplo_concreto}`,
    },
    tokensUsados,
  }
}

// ============================================================================
// FASE 4: DETALLES ACCIONABLES
// ============================================================================
// Objetivo: Generar requisitos, pasos, instrucciones concretas
// Contexto: Usuario que ya decidió que le interesa y quiere actuar
// Output: Listas estructuradas de requisitos y pasos

// JSON Schema para requisitos (strict mode)
const REQUISITOS_SCHEMA = {
  type: "object",
  properties: {
    requisitos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          titulo: {
            type: "string",
            description: "Título claro del requisito (ej: 'Titulación académica', 'Edad'). Máx 10 palabras."
          },
          descripcion: {
            type: "string",
            description: "Qué significa en lenguaje simple (7º-8º grado). Explicar qué necesitas y por qué. 30-60 palabras."
          },
          items: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Lista de items específicos si aplica (documentos, condiciones). Cada item: 5-15 palabras."
          }
        },
        required: ["titulo", "descripcion", "items"],
        additionalProperties: false
      },
      description: "Lista de 3-5 requisitos principales. NO incluir requisitos triviales o implícitos."
    }
  },
  required: ["requisitos"],
  additionalProperties: false
}

// JSON Schema para pasos (strict mode)
const PASOS_SCHEMA = {
  type: "object",
  properties: {
    pasos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          titulo: {
            type: "string",
            description: "Título del paso con verbo de acción (ej: 'Descarga el formulario', 'Presenta la solicitud'). Máx 12 palabras."
          },
          descripcion: {
            type: "string",
            description: "QUÉ hacer exactamente + DÓNDE + CÓMO. Instrucciones concretas en lenguaje simple. 40-80 palabras."
          },
          plazo: {
            type: "string",
            description: "Fecha límite específica o ventana temporal si aplica. Si no hay plazo: cadena vacía."
          }
        },
        required: ["titulo", "descripcion", "plazo"],
        additionalProperties: false
      },
      description: "Lista de 3-6 pasos ordenados cronológicamente. Cada paso debe ser accionable."
    }
  },
  required: ["pasos"],
  additionalProperties: false
}

export async function ejecutarFase4(
  documento: DocumentoBOE,
  categoria: string,
  datosFase1: ResultadoFase1
): Promise<{ resultado: ResultadoFase4; tokensUsados: number }> {
  console.log(`🎯 FASE 4: Generando detalles accionables de ${documento.boe_id}`)

  // Esta fase varía mucho según categoría
  const resultado: ResultadoFase4 = {}
  let totalTokens = 0

  // Truncar contenido inteligentemente
  const contenidoCompleto = documento.contenido_raw || ''
  const contenidoTruncado = contenidoCompleto.length > 10000
    ? contenidoCompleto.substring(0, 7000) + '\n\n[... contenido intermedio omitido ...]\n\n'
      + contenidoCompleto.substring(contenidoCompleto.length - 3000)
    : contenidoCompleto

  // Para oposiciones y ayudas, generar requisitos + pasos
  if (categoria === 'oposiciones' || categoria === 'ayudas') {
    const requisitosResult = await generarRequisitos(documento, categoria, datosFase1, contenidoTruncado)
    resultado.requisitos = requisitosResult.requisitos
    totalTokens += requisitosResult.tokens

    const pasosResult = await generarPasos(documento, categoria, datosFase1, contenidoTruncado)
    resultado.pasos = pasosResult.pasos
    totalTokens += pasosResult.tokens
  }

  // Para legislación, generar cambios específicos
  if (categoria === 'legislacion') {
    const cambiosResult = await generarCambiosLegislativos(documento, datosFase1, contenidoTruncado)
    resultado.pasos = cambiosResult.pasos
    totalTokens += cambiosResult.tokens
  }

  return { resultado, tokensUsados: totalTokens }
}

async function generarRequisitos(
  documento: DocumentoBOE,
  categoria: string,
  datosFase1: ResultadoFase1,
  contenidoTruncado: string
): Promise<{ requisitos: Requisito[]; tokens: number }> {
  const systemPrompt = `Eres un asesor de servicio público que explica requisitos oficiales en lenguaje claro y accesible.

Tu misión: Ayudar a ciudadanos a entender QUÉ necesitan para participar o solicitar, de forma simple y práctica.

PRINCIPIOS (basados en plain language + accessibility):
- Nivel de lectura: 7º-8º grado (12-14 años)
- Oraciones cortas: 15-20 palabras promedio
- Voz activa > voz pasiva
- Explicar términos técnicos inmediatamente
- Ser específico: "graduado universitario en Derecho" > "titulación adecuada"
- Incluir ejemplos concretos cuando sea útil

GESTIÓN DE CARGA COGNITIVA:
- Máximo 3-5 requisitos principales (no abrumar)
- Agrupar requisitos relacionados
- Omitir requisitos triviales/obvios (ej: "rellenar el formulario")
- Priorizar: requisitos eliminatorios primero

ESTRUCTURA DE CADA REQUISITO:
1. **Título**: Directo y claro (ej: "Nacionalidad española", "Edad entre 18 y 40 años")
2. **Descripción**: Qué significa + por qué importa (30-60 palabras)
3. **Items**: Documentos específicos, condiciones concretas (si aplica)

Genera explicaciones siguiendo el schema JSON exactamente.`

  const userPrompt = `Analiza este documento del BOE y extrae los requisitos necesarios para ${categoria === 'oposiciones' ? 'presentarse a esta oposición' : 'solicitar esta ayuda'}.

**Título del documento:**
${documento.titulo}

**Contenido del documento (extracto):**
${contenidoTruncado}

**Instrucciones:**
1. Identifica los 3-5 requisitos MÁS IMPORTANTES
2. Explica cada uno en lenguaje simple (imagina que hablas con alguien que nunca ha leído un BOE)
3. Para cada requisito con documentación necesaria, lista los documentos específicos
4. Si un requisito es complejo (ej: compatibilidad), da contexto práctico

IMPORTANTE:
- NO incluir pasos de solicitud (eso va en otra sección)
- SÍ incluir requisitos personales (edad, nacionalidad, titulación)
- SÍ incluir requisitos documentales (qué papeles necesitas)
- SÍ incluir requisitos previos (afiliación, experiencia, etc.)`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    max_tokens: 1200,
    temperature: 0.6,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'requisitos_accesibles',
        schema: REQUISITOS_SCHEMA,
        strict: true
      }
    }
  })

  const resultado = JSON.parse(completion.choices[0].message.content!)
  const tokensUsados = completion.usage?.total_tokens || 0

  console.log(`  → Requisitos generados: ${resultado.requisitos.length} items, ${tokensUsados} tokens`)

  return { requisitos: resultado.requisitos, tokens: tokensUsados }
}

async function generarPasos(
  documento: DocumentoBOE,
  categoria: string,
  datosFase1: ResultadoFase1,
  contenidoTruncado: string
): Promise<{ pasos: Paso[]; tokens: number }> {
  const systemPrompt = `Eres un guía de servicio público que ayuda a ciudadanos a completar trámites oficiales.

Tu misión: Crear una guía paso a paso PRÁCTICA y ACCIONABLE, en lenguaje que cualquiera pueda seguir.

PRINCIPIOS (basados en instructional design + plain language):
- Nivel de lectura: 7º-8º grado (12-14 años)
- Verbos de acción al inicio: "Descarga", "Rellena", "Presenta", "Consulta"
- Oraciones cortas y directas (15-20 palabras)
- Instrucciones concretas: QUÉ + DÓNDE + CÓMO
- Incluir URLs o referencias específicas cuando sea posible

GESTIÓN DE CARGA COGNITIVA:
- Máximo 3-6 pasos (no abrumar con microtareas)
- Agrupar acciones relacionadas en un mismo paso
- Orden cronológico estricto
- Mencionar tiempo estimado si es relevante

ESTRUCTURA DE CADA PASO:
1. **Título**: Verbo de acción + objetivo (ej: "Descarga el formulario oficial", "Presenta tu solicitud")
2. **Descripción**: Instrucciones específicas (40-80 palabras)
   - QUÉ hacer exactamente
   - DÓNDE hacerlo (oficina, web, etc.)
   - CÓMO hacerlo (presencial, online, correo)
3. **Plazo**: Fecha límite específica o ventana temporal

Genera pasos siguiendo el schema JSON exactamente.`

  const userPrompt = `Analiza este documento del BOE y genera una guía paso a paso para ${categoria === 'oposiciones' ? 'inscribirse en esta oposición' : 'solicitar esta ayuda'}.

**Título del documento:**
${documento.titulo}

**Contenido del documento (extracto):**
${contenidoTruncado}

**Fechas importantes identificadas:**
${datosFase1.fechas_importantes.map(f => `- ${f.tipo}: ${f.descripcion}${f.fecha ? ` (${f.fecha})` : ''}`).join('\n')}

**Instrucciones:**
1. Crea 3-6 pasos ordenados cronológicamente
2. Cada paso debe ser ACCIONABLE (no teórico)
3. Usa verbos de acción al inicio de cada título
4. En la descripción, especifica:
   - QUÉ hacer (ej: "Descarga el formulario de solicitud")
   - DÓNDE hacerlo (ej: "En la sede electrónica: [URL]")
   - CÓMO hacerlo (ej: "Necesitarás certificado digital")
5. Si hay fechas límite, inclúyelas en el campo "plazo"

IMPORTANTE:
- Pasos deben ser SECUENCIALES (primero esto, luego aquello)
- NO repetir información de requisitos
- SÍ incluir consejos prácticos (ej: "Guarda el número de registro")
- Si no hay plazo para un paso: usa cadena vacía ""`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    max_tokens: 1400,
    temperature: 0.6,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'pasos_accionables',
        schema: PASOS_SCHEMA,
        strict: true
      }
    }
  })

  const resultado = JSON.parse(completion.choices[0].message.content!)
  const tokensUsados = completion.usage?.total_tokens || 0

  console.log(`  → Pasos generados: ${resultado.pasos.length} items, ${tokensUsados} tokens`)

  return { pasos: resultado.pasos, tokens: tokensUsados }
}

async function generarCambiosLegislativos(
  documento: DocumentoBOE,
  datosFase1: ResultadoFase1,
  contenidoTruncado: string
): Promise<{ pasos: Paso[]; tokens: number }> {
  // TODO: Similar a generarPasos pero enfocado en "qué cambia" y "qué hacer"
  // Por ahora retorna vacío, se implementará cuando sea necesario
  return { pasos: [], tokens: 0 }
}

// ============================================================================
// ORQUESTADOR: EJECUTAR TODAS LAS FASES
// ============================================================================

export async function procesarDocumentoCompleto(
  documento: DocumentoBOE,
  categoria: string
): Promise<ResultadoCompleto> {
  const inicio = Date.now()
  let tokens_usados = 0

  console.log(`\n🚀 Procesando documento ${documento.boe_id} (${categoria})`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  // FASE 1: Extracción (sin LLM)
  const fase1 = await ejecutarFase1(documento, categoria)

  // FASE 2: Resumen (LLM)
  const fase2Result = await ejecutarFase2(documento, categoria, fase1)
  tokens_usados += fase2Result.tokensUsados

  // FASE 3: Explicaciones (LLM)
  const fase3Result = await ejecutarFase3(documento, categoria, fase1, fase2Result.resultado)
  tokens_usados += fase3Result.tokensUsados

  // FASE 4: Detalles (LLM)
  const fase4Result = await ejecutarFase4(documento, categoria, fase1)
  tokens_usados += fase4Result.tokensUsados

  const tiempo_total_ms = Date.now() - inicio

  // Coste real calculado con tokens reales de la API
  // GPT-4.1-nano: $0.10/1M input tokens, $0.40/1M output tokens
  // Asumiendo ratio 60/40 input/output (más input que output en promedio)
  // Promedio: (0.10 * 0.6) + (0.40 * 0.4) = 0.06 + 0.16 = 0.22/1M tokens
  const coste_estimado_usd = (tokens_usados * 0.22) / 1_000_000

  console.log(`✅ Procesamiento completado en ${tiempo_total_ms}ms`)
  console.log(`💰 Tokens usados: ${tokens_usados} (real), Coste: ~$${coste_estimado_usd.toFixed(4)}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  return {
    fase1,
    fase2: fase2Result.resultado,
    fase3: fase3Result.resultado,
    fase4: fase4Result.resultado,
    metadata: {
      modelo: 'gpt-4.1-nano',
      tokens_usados,
      tiempo_total_ms,
      coste_estimado_usd,
    },
  }
}
