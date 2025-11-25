/**
 * Script de prueba para verificar el procesamiento completo del BOE
 *
 * Este script:
 * 1. Descarga documentos BOE de los últimos 2 días
 * 2. Clasifica por categoría
 * 3. Procesa 3 documentos de muestra con LLM (para ahorrar costes)
 * 4. Guarda en Supabase
 * 5. Muestra los resultados
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { procesarDocumentoCompleto, type DocumentoBOE } from '../utils/agentes-llm'
import {
  fetchWeekSumarios,
  extractAllDocuments,
  fetchBoeApiDirect,
  KEYWORDS_BY_CATEGORY,
  type CategoriaSlug,
} from '../utils/boe-api'

// ============================================================================
// SETUP
// ============================================================================

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
)

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const CONFIG = {
  DIAS_ATRAS: 2, // Descargar últimos 2 días
  MAX_DOCUMENTOS_PROCESAR: 3, // Procesar solo 3 para prueba
  CATEGORIAS_PRIORITARIAS: ['oposiciones', 'ayudas', 'legislacion'],
}

// ============================================================================
// FUNCIONES
// ============================================================================

async function getCategorias() {
  const { data } = await supabase
    .from('categorias')
    .select('*')
    .eq('activa', true)
    .order('prioridad', { ascending: false })

  return data || []
}

function clasificarDocumento(doc: any, categorias: any[]): any | null {
  const titulo = doc.titulo?.toLowerCase() || ''
  const departamento = doc.departamento?.toLowerCase() || ''
  const seccion = doc.seccion?.toLowerCase() || ''
  const epigrafe = doc.epigrafe?.toLowerCase() || ''

  const textoCompleto = `${titulo} ${departamento} ${seccion} ${epigrafe}`.toLowerCase()

  const scores: Record<string, number> = {}
  const categoriasSlug = Object.keys(KEYWORDS_BY_CATEGORY) as CategoriaSlug[]

  for (const slug of categoriasSlug) {
    const keywords = KEYWORDS_BY_CATEGORY[slug]
    let score = 0

    for (const keyword of keywords) {
      if (textoCompleto.includes(keyword.toLowerCase())) {
        score++
      }
    }

    if (score > 0) {
      scores[slug] = score
    }
  }

  if (Object.keys(scores).length === 0) {
    if (seccion.includes('disposiciones generales')) {
      scores['legislacion'] = 1
    } else if (seccion.includes('autoridades') || seccion.includes('personal')) {
      scores['oposiciones'] = 1
    } else if (seccion.includes('otras disposiciones')) {
      scores['otros'] = 1
    }
  }

  if (Object.keys(scores).length === 0) {
    return null
  }

  const mejorSlug = Object.keys(scores).reduce((a, b) =>
    scores[a] > scores[b] ? a : b
  )

  return categorias.find(c => c.slug === mejorSlug) || null
}

async function fetchDocumentoCompleto(boe_id: string): Promise<{ contenido_texto: string } | null> {
  try {
    // URL correcta según server/api/boe/documento/[id].ts: /${id}.xml NO /documento/${id}
    const data = await fetchBoeApiDirect(`/${boe_id}.xml`, 'xml')

    if (!data) {
      return null
    }

    const textoMatch = data.match(/<texto[^>]*>([\s\S]*?)<\/texto>/i)
    const texto = textoMatch ? textoMatch[1].replace(/<[^>]+>/g, ' ').trim() : ''
    const contenido = texto || data.toString().substring(0, 5000)

    if (contenido.length < 50) {
      return null
    }

    return { contenido_texto: contenido }
  } catch (error: any) {
    console.error(`❌ Error obteniendo documento ${boe_id}:`, error.message)
    return null
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 ============================================')
  console.log('🚀 TEST DE PROCESAMIENTO BOE')
  console.log('🚀 ============================================\n')

  const startTime = Date.now()

  // Usar fechas fijas conocidas (semana del 18-22 de noviembre de 2024)
  // Evitamos problemas con fecha del sistema y aseguramos que hay datos
  const fechaInicio = '2024-11-18'
  const fechaFin = '2024-11-22'

  const inicio = new Date(fechaInicio)
  const hoy = new Date(fechaFin)

  console.log(`📅 Periodo: ${fechaInicio} a ${fechaFin}\n`)

  // ========================================================================
  // PASO 1: Descargar documentos
  // ========================================================================

  console.log('📥 Descargando documentos del BOE...')

  const resultados = await fetchWeekSumarios(inicio, hoy)
  const documentos: any[] = []

  for (const resultado of resultados) {
    if (resultado.disponible && resultado.sumario) {
      const docsDelDia = extractAllDocuments(resultado.sumario)
      documentos.push(...docsDelDia.map(doc => ({
        boe_id: doc.id,
        titulo: doc.titulo || 'Sin título',
        fecha_publicacion: resultado.fecha,
        seccion: doc.seccion || '',
        departamento: doc.departamento || '',
        rango: doc.rango || '',
        url_pdf: doc.urlPdf || '',
        epigrafe: doc.epigrafe || '',
      })))
    }
  }

  console.log(`✅ Descargados ${documentos.length} documentos\n`)

  if (documentos.length === 0) {
    console.log('❌ No se encontraron documentos. Abortando.')
    return
  }

  // ========================================================================
  // PASO 2: Clasificar
  // ========================================================================

  console.log('🗂️  Clasificando documentos...')

  const categorias = await getCategorias()
  const documentosClasificados: any[] = []

  for (const doc of documentos) {
    const categoria = clasificarDocumento(doc, categorias)
    if (categoria) {
      documentosClasificados.push({
        ...doc,
        categoria_id: categoria.id,
        categoria_slug: categoria.slug,
        categoria_nombre: categoria.nombre,
      })
    }
  }

  console.log(`✅ Clasificados ${documentosClasificados.length} documentos`)

  const stats = documentosClasificados.reduce((acc: any, doc) => {
    acc[doc.categoria_slug] = (acc[doc.categoria_slug] || 0) + 1
    return acc
  }, {})

  console.log('📊 Por categoría:', stats)
  console.log('')

  // ========================================================================
  // PASO 3: Seleccionar muestra para procesar
  // ========================================================================

  // Priorizar categorías importantes
  const docsParaProcesar = documentosClasificados
    .sort((a, b) => {
      const prioridadA = CONFIG.CATEGORIAS_PRIORITARIAS.includes(a.categoria_slug) ? 0 : 1
      const prioridadB = CONFIG.CATEGORIAS_PRIORITARIAS.includes(b.categoria_slug) ? 0 : 1
      return prioridadA - prioridadB
    })
    .slice(0, CONFIG.MAX_DOCUMENTOS_PROCESAR)

  console.log(`🎯 Seleccionados ${docsParaProcesar.length} documentos para procesar:\n`)

  docsParaProcesar.forEach((doc, i) => {
    console.log(`${i + 1}. [${doc.categoria_slug}] ${doc.titulo.substring(0, 80)}...`)
  })

  console.log('')

  // ========================================================================
  // PASO 4: Procesar con LLM
  // ========================================================================

  console.log('🤖 Procesando con agentes LLM...\n')

  let procesados = 0
  let costoTotal = 0
  let tokensTotal = 0
  const resultados_procesamiento: any[] = []

  for (const doc of docsParaProcesar) {
    console.log(`\n📄 Procesando: ${doc.titulo.substring(0, 60)}...`)
    console.log(`   BOE ID: ${doc.boe_id}`)
    console.log(`   Categoría: ${doc.categoria_nombre}`)

    try {
      // Obtener contenido completo
      const contenido = await fetchDocumentoCompleto(doc.boe_id)

      if (!contenido) {
        console.log('   ⚠️  No se pudo descargar el contenido completo')
        continue
      }

      // Crear documento completo
      const docCompleto: DocumentoBOE = {
        boe_id: doc.boe_id,
        titulo: doc.titulo,
        fecha_publicacion: doc.fecha_publicacion,
        seccion: doc.seccion,
        departamento: doc.departamento,
        rango: doc.rango,
        url_pdf: doc.url_pdf,
        contenido_texto: contenido.contenido_texto,
      }

      // Procesar con las 4 fases
      console.log('   🔄 Ejecutando 4 fases...')
      const resultado = await procesarDocumentoCompleto(docCompleto, doc.categoria_slug)

      console.log(`   ✅ Procesado exitosamente`)
      console.log(`   📊 Tokens: ${resultado.metadata.tokens_usados}`)
      console.log(`   💰 Coste: $${resultado.metadata.coste_estimado_usd.toFixed(6)}`)

      // Guardar en Supabase
      console.log('   💾 Guardando en Supabase...')

      const { data: docGuardado, error: errorDoc } = await supabase
        .from('documentos_boe')
        .insert({
          boe_id: doc.boe_id,
          categoria_id: doc.categoria_id,
          fecha_publicacion: doc.fecha_publicacion,
          titulo: doc.titulo,
          seccion: doc.seccion,
          departamento: doc.departamento,
          rango: doc.rango,
          url_pdf: doc.url_pdf,
          datos_estructurados: resultado.fase1.datos_estructurados,
          fechas_importantes: resultado.fase1.fechas_importantes,
          keywords: resultado.fase1.keywords,
          procesado: true,
          procesado_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (errorDoc || !docGuardado) {
        console.log(`   ❌ Error guardando documento: ${errorDoc?.message}`)
        continue
      }

      // Guardar explicaciones
      const explicaciones = [
        {
          documento_id: docGuardado.id,
          tipo: 'resumen',
          contenido: JSON.stringify(resultado.fase2),
          modelo_usado: resultado.metadata.modelo,
          tokens_usados: Math.floor(resultado.metadata.tokens_usados * 0.3),
        },
        {
          documento_id: docGuardado.id,
          tipo: 'que_es',
          contenido: resultado.fase3.queEs,
          modelo_usado: resultado.metadata.modelo,
          tokens_usados: Math.floor(resultado.metadata.tokens_usados * 0.25),
        },
        {
          documento_id: docGuardado.id,
          tipo: 'como_afecta',
          contenido: resultado.fase3.comoAfecta,
          modelo_usado: resultado.metadata.modelo,
          tokens_usados: Math.floor(resultado.metadata.tokens_usados * 0.25),
        },
      ]

      if (resultado.fase4.requisitos) {
        explicaciones.push({
          documento_id: docGuardado.id,
          tipo: 'requisitos',
          contenido: JSON.stringify(resultado.fase4.requisitos),
          modelo_usado: resultado.metadata.modelo,
          tokens_usados: Math.floor(resultado.metadata.tokens_usados * 0.1),
        })
      }

      if (resultado.fase4.pasos) {
        explicaciones.push({
          documento_id: docGuardado.id,
          tipo: 'pasos',
          contenido: JSON.stringify(resultado.fase4.pasos),
          modelo_usado: resultado.metadata.modelo,
          tokens_usados: Math.floor(resultado.metadata.tokens_usados * 0.1),
        })
      }

      const { error: errorExplicaciones } = await supabase
        .from('explicaciones_llm')
        .insert(explicaciones)

      if (errorExplicaciones) {
        console.log(`   ⚠️  Error guardando explicaciones: ${errorExplicaciones.message}`)
      } else {
        console.log(`   ✅ Guardadas ${explicaciones.length} explicaciones`)
      }

      procesados++
      costoTotal += resultado.metadata.coste_estimado_usd
      tokensTotal += resultado.metadata.tokens_usados

      resultados_procesamiento.push({
        boe_id: doc.boe_id,
        titulo: doc.titulo.substring(0, 80),
        categoria: doc.categoria_nombre,
        resultado,
      })
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }

  // ========================================================================
  // RESUMEN FINAL
  // ========================================================================

  const tiempoTotal = Math.floor((Date.now() - startTime) / 1000)

  console.log('\n\n✅ ============================================')
  console.log('✅ TEST COMPLETADO')
  console.log('✅ ============================================')
  console.log(`📊 Documentos descargados: ${documentos.length}`)
  console.log(`📊 Documentos clasificados: ${documentosClasificados.length}`)
  console.log(`📊 Documentos procesados con LLM: ${procesados}`)
  console.log(`📊 Tokens totales: ${tokensTotal.toLocaleString()}`)
  console.log(`💰 Coste total: $${costoTotal.toFixed(6)}`)
  console.log(`⏱️  Tiempo total: ${tiempoTotal}s`)
  console.log('✅ ============================================\n')

  if (resultados_procesamiento.length > 0) {
    console.log('📋 MUESTRA DE RESULTADOS:\n')

    for (const res of resultados_procesamiento) {
      console.log(`\n📄 ${res.titulo}`)
      console.log(`   Categoría: ${res.categoria}`)
      console.log(`   BOE ID: ${res.boe_id}`)
      console.log('\n   📝 RESUMEN (3 líneas):')
      console.log(`   1. ${res.resultado.fase2.linea1}`)
      console.log(`   2. ${res.resultado.fase2.linea2}`)
      console.log(`   3. ${res.resultado.fase2.linea3}`)
      console.log('\n   💡 ¿Qué es?')
      console.log(`   ${res.resultado.fase3.queEs.substring(0, 200)}...`)
      console.log('\n   🎯 ¿Cómo te afecta?')
      console.log(`   ${res.resultado.fase3.comoAfecta.substring(0, 200)}...`)

      if (res.resultado.fase1.datos_estructurados) {
        console.log('\n   📊 Datos estructurados:', JSON.stringify(res.resultado.fase1.datos_estructurados, null, 2))
      }

      if (res.resultado.fase1.fechas_importantes && res.resultado.fase1.fechas_importantes.length > 0) {
        console.log('\n   📅 Fechas importantes:')
        res.resultado.fase1.fechas_importantes.forEach((fecha: any) => {
          console.log(`      - ${fecha.tipo}: ${fecha.fecha} (${fecha.descripcion})`)
        })
      }

      console.log('\n   ' + '─'.repeat(80))
    }
  }

  console.log('\n✨ Puedes verificar los datos en Supabase o probar la interfaz web\n')
}

// ============================================================================
// EJECUTAR
// ============================================================================

main().catch(console.error)
