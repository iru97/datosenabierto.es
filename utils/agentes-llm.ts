/**
 * Sistema de Agentes LLM Especializados por Fase
 *
 * Cada fase tiene un objetivo claro y definido:
 * FASE 1: Extracción de datos estructurados
 * FASE 2: Resumen ejecutivo (3 líneas)
 * FASE 3: Explicaciones educativas ("¿Qué es?" y "¿Cómo me afecta?")
 * FASE 4: Detalles accionables (Requisitos, Pasos, Fechas)
 */

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
// Objetivo: Generar resumen ultra-conciso para entender en 5 segundos
// Contexto: Ciudadano promedio sin conocimientos técnicos
// Output: 3 líneas claras + metadata opcional

export async function ejecutarFase2(
  documento: DocumentoBOE,
  categoria: string,
  datosFase1: ResultadoFase1
): Promise<ResultadoFase2> {
  console.log(`📝 FASE 2: Generando resumen ejecutivo de ${documento.boe_id}`)

  const systemPrompt = `Eres un comunicador experto que traduce documentos oficiales españoles a lenguaje simple.

Tu objetivo: Generar un resumen ultra-conciso de 3 líneas que cualquier persona entienda en 5 segundos.

Restricciones:
- EXACTAMENTE 3 líneas (no más, no menos)
- Máximo 30 palabras por línea
- Lenguaje de periódico, no legal
- Sin jerga técnica
- Enfocado en lo importante para el ciudadano`

  const userPrompt = `Documento BOE:
Título: ${documento.titulo}
Categoría: ${categoria}
Organismo: ${documento.departamento || 'N/A'}

Datos clave extraídos:
${JSON.stringify(datosFase1.datos_estructurados, null, 2)}

Fechas importantes:
${datosFase1.fechas_importantes.map(f => `- ${f.tipo}: ${f.descripcion}`).join('\n')}

Genera un resumen en EXACTAMENTE 3 líneas:
Línea 1: QUÉ es (qué se convoca/aprueba/modifica)
Línea 2: PARA QUIÉN es (quién puede/debe/le afecta)
Línea 3: CUÁNDO (plazos, fechas clave)

Responde solo con las 3 líneas, sin numeración ni prefijos.`

  const inicio = Date.now()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 300,
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
  })

  const tiempo = Date.now() - inicio
  const contenido = completion.choices[0]?.message?.content || ''

  // Parsear las 3 líneas
  const lineas = contenido.trim().split('\n').filter(l => l.trim())

  return {
    linea1: lineas[0] || contenido.substring(0, 150),
    linea2: lineas[1] || '',
    linea3: lineas[2] || '',
    detalles: {
      paraQuien: datosFase1.datos_estructurados.beneficiarios?.join(', '),
      fechaLimite: datosFase1.fechas_importantes[0]?.fecha,
      diasRestantes: datosFase1.fechas_importantes[0]?.diasRestantes || undefined,
    },
  }
}

// ============================================================================
// FASE 3: EXPLICACIONES EDUCATIVAS
// ============================================================================
// Objetivo: Responder "¿Qué es esto?" y "¿Cómo me afecta?"
// Contexto: Persona sin conocimientos previos del tema
// Output: 2 explicaciones claras y pedagógicas

export async function ejecutarFase3(
  documento: DocumentoBOE,
  categoria: string,
  datosFase1: ResultadoFase1,
  resumenFase2: ResultadoFase2
): Promise<ResultadoFase3> {
  console.log(`💡 FASE 3: Generando explicaciones educativas de ${documento.boe_id}`)

  const systemPrompt = `Eres un profesor que explica documentos oficiales españoles a ciudadanos.

Tu objetivo: Explicar de forma pedagógica qué es el documento y cómo afecta a las personas.

Estilo de comunicación:
- Como si explicaras a un familiar que no sabe del tema
- Usa ejemplos concretos del día a día
- Evita completamente la jerga legal
- Si usas un término técnico, explícalo inmediatamente
- Máximo 150 palabras por explicación`

  const userPrompt = `Documento:
${documento.titulo}

Resumen: ${resumenFase2.linea1}

Datos clave:
${JSON.stringify(datosFase1.datos_estructurados, null, 2)}

Responde EXACTAMENTE estas 2 preguntas:

1. ¿Qué es esto?
Explica en lenguaje simple qué tipo de documento es y qué significa. Usa analogías si ayuda.

2. ¿Cómo me afecta?
Explica quién debe prestar atención a esto y por qué les importa. Sé específico con perfiles de personas.

Formato de respuesta:
¿QUÉ ES ESTO?
[Tu explicación]

¿CÓMO ME AFECTA?
[Tu explicación]`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 600,
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
  })

  const contenido = completion.choices[0]?.message?.content || ''

  // Parsear las dos secciones
  const partes = contenido.split(/¿CÓMO ME AFECTA\?/i)
  const queEs = partes[0].replace(/¿QUÉ ES ESTO\?/i, '').trim()
  const comoAfecta = partes[1]?.trim() || ''

  return {
    queEs,
    comoAfecta,
  }
}

// ============================================================================
// FASE 4: DETALLES ACCIONABLES
// ============================================================================
// Objetivo: Generar requisitos, pasos, instrucciones concretas
// Contexto: Usuario que ya decidió que le interesa y quiere actuar
// Output: Listas estructuradas de requisitos y pasos

export async function ejecutarFase4(
  documento: DocumentoBOE,
  categoria: string,
  datosFase1: ResultadoFase1
): Promise<ResultadoFase4> {
  console.log(`🎯 FASE 4: Generando detalles accionables de ${documento.boe_id}`)

  // Esta fase varía mucho según categoría
  const resultado: ResultadoFase4 = {}

  // Para oposiciones y ayudas, generar requisitos + pasos
  if (categoria === 'oposiciones' || categoria === 'ayudas') {
    resultado.requisitos = await generarRequisitos(documento, categoria, datosFase1)
    resultado.pasos = await generarPasos(documento, categoria, datosFase1)
  }

  // Para legislación, generar cambios específicos
  if (categoria === 'legislacion') {
    resultado.pasos = await generarCambiosLegislativos(documento, datosFase1)
  }

  return resultado
}

async function generarRequisitos(
  documento: DocumentoBOE,
  categoria: string,
  datosFase1: ResultadoFase1
): Promise<Requisito[]> {
  const systemPrompt = `Eres un asesor que explica requisitos oficiales en lenguaje claro.

Tu objetivo: Extraer y explicar cada requisito de forma que cualquiera lo entienda.

Para cada requisito:
1. Título claro del requisito
2. Explicación simple de qué significa
3. Lista de ítems específicos si aplica (documentos, condiciones, etc)`

  const userPrompt = `Documento: ${documento.titulo}

Extrae TODOS los requisitos necesarios para ${categoria === 'oposiciones' ? 'presentarse a la oposición' : 'solicitar la ayuda'}.

Devuelve en formato JSON:
[
  {
    "titulo": "Título del requisito",
    "descripcion": "Qué significa en lenguaje simple",
    "items": ["Item 1", "Item 2"]
  }
]

Solo el JSON, sin explicaciones adicionales.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1000,
    temperature: 0.5,
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
  })

  const contenido = completion.choices[0]?.message?.content || '[]'

  try {
    return JSON.parse(contenido.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
  } catch {
    return []
  }
}

async function generarPasos(
  documento: DocumentoBOE,
  categoria: string,
  datosFase1: ResultadoFase1
): Promise<Paso[]> {
  const systemPrompt = `Eres un guía práctico que ayuda a ciudadanos con trámites.

Tu objetivo: Generar pasos CONCRETOS y ACCIONABLES para completar el trámite.

Cada paso debe:
- Ser específico y claro
- Indicar QUÉ hacer exactamente
- Mencionar plazos si los hay`

  const userPrompt = `Documento: ${documento.titulo}

Fechas importantes:
${datosFase1.fechas_importantes.map(f => `- ${f.tipo}: ${f.descripcion}`).join('\n')}

Genera una lista paso a paso de cómo ${categoria === 'oposiciones' ? 'inscribirse en la oposición' : 'solicitar la ayuda'}.

Devuelve en formato JSON:
[
  {
    "titulo": "Paso 1: Título del paso",
    "descripcion": "Qué hacer exactamente",
    "plazo": "Fecha límite si aplica"
  }
]

Solo el JSON, sin explicaciones adicionales.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1000,
    temperature: 0.5,
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
  })

  const contenido = completion.choices[0]?.message?.content || '[]'

  try {
    return JSON.parse(contenido.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
  } catch {
    return []
  }
}

async function generarCambiosLegislativos(
  documento: DocumentoBOE,
  datosFase1: ResultadoFase1
): Promise<Paso[]> {
  // Similar a generarPasos pero enfocado en "qué cambia" y "qué hacer"
  return []
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
  const fase2 = await ejecutarFase2(documento, categoria, fase1)
  tokens_usados += 500 // estimado

  // FASE 3: Explicaciones (LLM)
  const fase3 = await ejecutarFase3(documento, categoria, fase1, fase2)
  tokens_usados += 800 // estimado

  // FASE 4: Detalles (LLM)
  const fase4 = await ejecutarFase4(documento, categoria, fase1)
  tokens_usados += 1000 // estimado

  const tiempo_total_ms = Date.now() - inicio

  // Coste estimado (GPT-4o-mini: $0.15/1M input, $0.60/1M output)
  // Asumiendo ratio 50/50 input/output = promedio $0.375/1M tokens
  const coste_estimado_usd = (tokens_usados * 0.375) / 1_000_000

  console.log(`✅ Procesamiento completado en ${tiempo_total_ms}ms`)
  console.log(`💰 Tokens usados: ~${tokens_usados}, Coste: ~$${coste_estimado_usd.toFixed(4)}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  return {
    fase1,
    fase2,
    fase3,
    fase4,
    metadata: {
      modelo: 'gpt-4o-mini',
      tokens_usados,
      tiempo_total_ms,
      coste_estimado_usd,
    },
  }
}
