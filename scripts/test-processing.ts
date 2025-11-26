/**
 * Script de prueba para verificar el procesamiento completo del BOE
 *
 * Este script:
 * 1. Descarga documentos BOE de los últimos 7 días
 * 2. Clasifica con keywords (paso previo)
 * 3. Procesa 3 documentos con TODO el flujo nuevo:
 *    - FASE 0: Clasificación multi-categoría con LLM
 *    - FASES 1-4: Generación de contenido educativo
 * 4. Guarda en Supabase (documento + clasificaciones múltiples)
 * 5. Muestra los resultados con costes desglosados
 *
 * Usage:
 *   OPENAI_API_KEY=xxx SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx \
 *   npm run test:processing
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
import { clasificarDocumentoConLLM, guardarClasificaciones } from '../utils/clasificador-llm'
import { extraerContenidoBOE } from '../utils/boe-xml-parser'
import { ProxyAgent } from 'undici'

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

async function fetchDocumentoCompleto(boe_id: string, url_xml?: string): Promise<{ contenido_texto: string } | null> {
  try {
    console.log(`   🔍 Descargando XML de ${boe_id}...`)

    // Si tenemos url_xml del sumario, usarlo directamente (es la URL completa)
    let data;
    if (url_xml) {
      console.log(`   📍 Usando URL del sumario: ${url_xml}`)

      // Configurar proxy si está disponible
      const fetchOptions: any = {
        method: 'GET',
        headers: {
          'User-Agent': 'datosenabierto.es/1.0',
        },
      }

      const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY ||
                       process.env.http_proxy || process.env.HTTP_PROXY

      if (proxyUrl) {
        const agent = new ProxyAgent(proxyUrl)
        fetchOptions.dispatcher = agent
      }

      const response = await fetch(url_xml, fetchOptions)
      if (!response.ok) {
        console.log(`   ⚠️  Error HTTP ${response.status}: ${response.statusText}`)
        return null
      }
      data = await response.text()
    } else {
      // Fallback: construir URL con API
      console.log(`   📍 Construyendo URL con API: /${boe_id}.xml`)
      data = await fetchBoeApiDirect(`/${boe_id}.xml`, 'xml')
    }

    if (!data) {
      console.log(`   ⚠️  fetchBoeApiDirect retornó null (posible 404)`)
      return null
    }

    console.log(`   ✓ XML descargado, tamaño: ${data.length.toLocaleString()} caracteres`)

    // Usar parser mejorado que extrae TODO el contenido
    const contenido = extraerContenidoBOE(data)

    if (contenido.length < 100) {
      console.log(`   ⚠️  Contenido muy corto: ${contenido.length} caracteres`)
      return null
    }

    return { contenido_texto: contenido }
  } catch (error: any) {
    console.error(`   ❌ Error obteniendo documento ${boe_id}:`, error.message)
    if (error.stack) console.error(`   Stack:`, error.stack.split('\n')[0])
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

  // Calcular última semana (5 días laborables)
  const hoy = new Date()
  const inicio = new Date(hoy)
  inicio.setDate(hoy.getDate() - 7) // Última semana

  const fechaInicio = inicio.toISOString().split('T')[0]
  const fechaFin = hoy.toISOString().split('T')[0]

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
        url_xml: doc.urlXml || '',
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
  // PASO 4: Procesar con LLM (Fase 0 + Fases 1-4)
  // ========================================================================

  console.log('🤖 Procesando con agentes LLM (Fase 0 + Fases 1-4)...\n')

  let procesados = 0
  let costoTotal = 0
  let tokensTotal = 0
  let costoClasificacion = 0
  let tokensClasificacion = 0
  const resultados_procesamiento: any[] = []

  for (const doc of docsParaProcesar) {
    console.log(`\n📄 Procesando: ${doc.titulo.substring(0, 60)}...`)
    console.log(`   BOE ID: ${doc.boe_id}`)

    try {
      // ======================================================================
      // FASE 0: CLASIFICACIÓN MULTI-CATEGORÍA CON LLM
      // ======================================================================

      console.log('   🤖 [FASE 0] Clasificando con LLM...')

      const clasificacion = await clasificarDocumentoConLLM({
        boe_id: doc.boe_id,
        titulo: doc.titulo,
        fecha_publicacion: doc.fecha_publicacion,
        seccion: doc.seccion,
        departamento: doc.departamento,
        rango: doc.rango,
        epigrafe: doc.epigrafe
      })

      if (!clasificacion.categorias || clasificacion.categorias.length === 0) {
        console.log('   ⚠️  No se pudo clasificar')
        continue
      }

      console.log(`   ✅ Clasificado en ${clasificacion.categorias.length} categorías:`)
      clasificacion.categorias.forEach((cat, idx) => {
        const icon = idx === 0 ? '⭐' : '  '
        console.log(`      ${icon} ${cat.categoria_slug} (${(cat.confidence * 100).toFixed(0)}%)`)
      })
      console.log(`   💰 Coste clasificación: $${clasificacion.metadata.coste_usd.toFixed(5)}`)

      costoClasificacion += clasificacion.metadata.coste_usd
      tokensClasificacion += clasificacion.metadata.tokens

      // Categoría principal = mayor confidence
      const categoriaPrincipal = clasificacion.categorias[0]

      // ======================================================================
      // OBTENER CONTENIDO COMPLETO
      // ======================================================================

      const contenido = await fetchDocumentoCompleto(doc.boe_id, doc.url_xml)

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

      // ======================================================================
      // FASES 1-4: PROCESAMIENTO EDUCATIVO
      // ======================================================================

      console.log(`   🔄 [FASES 1-4] Generando contenido educativo (categoría: ${categoriaPrincipal.categoria_slug})...`)
      const resultado = await procesarDocumentoCompleto(docCompleto, categoriaPrincipal.categoria_slug)

      console.log(`   ✅ Procesado exitosamente`)
      console.log(`   📊 Tokens: ${resultado.metadata.tokens_usados}`)
      console.log(`   💰 Coste: $${resultado.metadata.coste_estimado_usd.toFixed(6)}`)

      // ======================================================================
      // GUARDAR EN SUPABASE
      // ======================================================================

      console.log('   💾 Guardando en Supabase...')

      // 1. Guardar documento
      const { data: docGuardado, error: errorDoc } = await supabase
        .from('documentos_boe')
        .upsert({
          boe_id: doc.boe_id,
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
        }, {
          onConflict: 'boe_id'
        })
        .select()
        .single()

      if (errorDoc || !docGuardado) {
        console.log(`   ❌ Error guardando documento: ${errorDoc?.message}`)
        continue
      }

      // 2. Guardar clasificaciones múltiples en documento_categorias
      try {
        // Primero borrar clasificaciones anteriores si existen (para reprocesar)
        await supabase
          .from('documento_categorias')
          .delete()
          .eq('documento_id', docGuardado.id)

        await guardarClasificaciones(docGuardado.id, clasificacion.categorias)
        console.log(`   ✅ Guardadas ${clasificacion.categorias.length} clasificaciones`)
      } catch (error: any) {
        console.log(`   ⚠️  Error guardando clasificaciones: ${error.message}`)
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

      // Borrar explicaciones anteriores si existen (para poder reprocesar)
      await supabase
        .from('explicaciones_llm')
        .delete()
        .eq('documento_id', docGuardado.id)

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
        categorias: clasificacion.categorias,
        categoria_principal: categoriaPrincipal.categoria_slug,
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
  console.log('')
  console.log('💰 COSTES:')
  console.log(`   Clasificación (Fase 0): $${costoClasificacion.toFixed(6)} (${tokensClasificacion.toLocaleString()} tokens)`)
  console.log(`   Contenido (Fases 1-4):  $${costoTotal.toFixed(6)} (${tokensTotal.toLocaleString()} tokens)`)
  console.log(`   TOTAL:                  $${(costoClasificacion + costoTotal).toFixed(6)}`)
  console.log(`   Promedio/doc:           $${((costoClasificacion + costoTotal) / procesados).toFixed(6)}`)
  console.log('')
  console.log(`⏱️  Tiempo total: ${tiempoTotal}s`)
  console.log('✅ ============================================\n')

  if (resultados_procesamiento.length > 0) {
    console.log('📋 MUESTRA DE RESULTADOS:\n')

    for (const res of resultados_procesamiento) {
      console.log(`\n📄 ${res.titulo}`)
      console.log(`   BOE ID: ${res.boe_id}`)
      console.log(`   Categorías:`)
      res.categorias.forEach((cat: any, idx: number) => {
        const icon = idx === 0 ? '⭐' : '  '
        console.log(`      ${icon} ${cat.categoria_slug} (${(cat.confidence * 100).toFixed(0)}%) - ${cat.razonamiento}`)
      })
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
