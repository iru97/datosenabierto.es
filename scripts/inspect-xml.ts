/**
 * Script para descargar y analizar XMLs del BOE
 *
 * Descarga XMLs y muestra su estructura real para debugging
 *
 * Usage:
 *   npm run inspect:xml BOE-A-2025-23386
 */

import 'dotenv/config'
import { writeFileSync } from 'fs'
import { ProxyAgent } from 'undici'

// BOE ID desde argumentos o default
const BOE_ID = process.argv[2] || 'BOE-A-2025-23386'

async function main() {
  console.log('🔍 ============================================')
  console.log('🔍 INSPECTOR DE XML DEL BOE')
  console.log('🔍 ============================================\n')

  const url = `https://www.boe.es/diario_boe/xml.php?id=${BOE_ID}`
  console.log(`📄 Descargando: ${BOE_ID}`)
  console.log(`   URL: ${url}\n`)

  try {
    // Descargar XML directamente (como hace test-processing.ts)
    const fetchOptions: any = {
      method: 'GET',
      headers: {
        'User-Agent': 'datosenabierto.es/1.0',
      },
    }

    // Configurar proxy si está disponible
    const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY ||
                     process.env.http_proxy || process.env.HTTP_PROXY

    if (proxyUrl) {
      const agent = new ProxyAgent(proxyUrl)
      fetchOptions.dispatcher = agent
    }

    const response = await fetch(url, fetchOptions)

    if (!response.ok) {
      console.error(`❌ Error HTTP ${response.status}: ${response.statusText}`)
      process.exit(1)
    }

    const xmlData = await response.text()

    if (!xmlData) {
      console.error('❌ No se pudo descargar el XML')
      process.exit(1)
    }

    console.log(`✅ XML descargado: ${xmlData.length.toLocaleString()} caracteres\n`)

    // Guardar XML completo
    const filename = `./debug_xml_${BOE_ID}.xml`
    writeFileSync(filename, xmlData, 'utf-8')
    console.log(`💾 Guardado en: ${filename}\n`)

    // Análisis de estructura
    console.log('📊 ANÁLISIS DE ESTRUCTURA:')
    console.log('=' .repeat(80))

    // Detectar tags principales
    const tags = [
      'texto',
      'articulo', 'article',
      'disposicion', 'disposicion_adicional', 'disposicion_final', 'disposicion_transitoria',
      'anexo',
      'preambulo',
      'parrafo', 'paragraph',
      'titulo', 'title',
      'apartado',
      'capitulo',
      'seccion_doc' // Evita confusión con metadata <seccion>
    ]

    const tagStats: Record<string, number> = {}

    for (const tag of tags) {
      const regex = new RegExp(`<${tag}[^>]*>`, 'gi')
      const matches = xmlData.match(regex)
      if (matches && matches.length > 0) {
        tagStats[tag] = matches.length
      }
    }

    if (Object.keys(tagStats).length > 0) {
      console.log('\n✅ Tags de contenido encontrados:')
      Object.entries(tagStats)
        .sort((a, b) => b[1] - a[1])
        .forEach(([tag, count]) => {
          console.log(`   - <${tag}>: ${count} veces`)
        })
    } else {
      console.log('\n⚠️  NO se encontraron tags conocidos de contenido')
    }

    // Buscar namespaces
    console.log('\n📋 Namespaces XML:')
    const nsMatches = xmlData.match(/xmlns[^=]*="[^"]+"/g)
    if (nsMatches) {
      nsMatches.forEach(ns => console.log(`   ${ns}`))
    } else {
      console.log('   (ninguno)')
    }

    // Mostrar primeros 100 caracteres de cada tag encontrado
    console.log('\n📝 MUESTRAS DE CONTENIDO:')
    console.log('=' .repeat(80))

    for (const [tag, count] of Object.entries(tagStats)) {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]{0,200})`, 'i')
      const match = xmlData.match(regex)
      if (match) {
        const sample = match[1].replace(/\s+/g, ' ').trim()
        console.log(`\n<${tag}> (${count} total):`)
        console.log(`   "${sample.substring(0, 150)}${sample.length > 150 ? '...' : ''}"`)
      }
    }

    // Estructura del documento (primeras líneas)
    console.log('\n📄 PRIMERAS 50 LÍNEAS DEL XML:')
    console.log('=' .repeat(80))
    const lines = xmlData.split('\n').slice(0, 50)
    lines.forEach((line, i) => {
      console.log(`${String(i + 1).padStart(3)}: ${line}`)
    })

    // Resumen
    console.log('\n' + '=' .repeat(80))
    console.log('✅ ANÁLISIS COMPLETADO')
    console.log('=' .repeat(80))
    console.log(`📄 Archivo guardado: ${filename}`)
    console.log(`📊 Tamaño: ${xmlData.length.toLocaleString()} caracteres`)
    console.log(`🏷️  Tags encontrados: ${Object.keys(tagStats).length}`)
    console.log('')
    console.log('💡 Puedes:')
    console.log(`   1. Ver el archivo completo: cat ${filename}`)
    console.log(`   2. Buscar un tag: grep -i "<articulo" ${filename}`)
    console.log(`   3. Pasar este output completo al asistente`)
    console.log('')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
