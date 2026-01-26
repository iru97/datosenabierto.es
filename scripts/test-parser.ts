/**
 * Test simple del parser mejorado
 *
 * Descarga un XML específico y verifica la extracción
 */
import 'dotenv/config'
import { ProxyAgent } from 'undici'
import { parseBOEXML } from '../utils/boe-xml-parser'

const BOE_ID = process.argv[2] || 'BOE-A-2025-23386'

async function main() {
  console.log(`\n📊 TEST DEL PARSER BOE - ${BOE_ID}\n`)
  console.log('=' .repeat(80))

  // Descargar XML
  const url = `https://www.boe.es/diario_boe/xml.php?id=${BOE_ID}`
  console.log(`📥 Descargando: ${url}`)

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

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    console.error(`❌ Error HTTP ${response.status}`)
    process.exit(1)
  }

  const xmlData = await response.text()
  console.log(`✅ XML descargado: ${xmlData.length.toLocaleString()} caracteres\n`)

  // Parsear
  console.log('🔍 Parseando XML...\n')
  const resultado = parseBOEXML(xmlData)

  // Mostrar resultados
  console.log('=' .repeat(80))
  console.log('📊 RESULTADOS DE EXTRACCIÓN')
  console.log('=' .repeat(80))
  console.log(`Tamaño original:     ${resultado.metadata.caracteres_originales.toLocaleString()} chars`)
  console.log(`Texto extraído:      ${resultado.metadata.caracteres_extraidos.toLocaleString()} chars`)
  console.log(`Ratio extracción:    ${((resultado.metadata.caracteres_extraidos / resultado.metadata.caracteres_originales) * 100).toFixed(1)}%`)
  console.log(`Elementos:           ${resultado.metadata.elementos_encontrados.join(', ')}`)
  console.log()

  // Mostrar muestra del texto extraído
  console.log('📄 MUESTRA DEL TEXTO EXTRAÍDO (primeros 1000 caracteres):')
  console.log('=' .repeat(80))
  console.log(resultado.texto_completo.substring(0, 1000))
  console.log('...\n')

  // Mostrar estadísticas de estructura
  console.log('📋 ESTRUCTURA:')
  console.log('=' .repeat(80))
  if (resultado.estructura.articulos.length > 0) {
    console.log(`   Artículos: ${resultado.estructura.articulos.length}`)
  }
  if (resultado.estructura.disposiciones.length > 0) {
    console.log(`   Disposiciones: ${resultado.estructura.disposiciones.length}`)
  }
  if (resultado.estructura.anexos.length > 0) {
    console.log(`   Anexos: ${resultado.estructura.anexos.length}`)
  }
  console.log()

  // Análisis de contenido
  const lineas = resultado.texto_completo.split('\n').filter(l => l.trim().length > 0)
  console.log(`📊 Líneas de texto: ${lineas.length.toLocaleString()}`)
  console.log()

  console.log('✅ TEST COMPLETADO')
}

main().catch(console.error)
