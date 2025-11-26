/**
 * Parser mejorado para extraer contenido completo de XMLs del BOE
 *
 * Los XMLs del BOE tienen estructura compleja:
 * - <texto> - Contenedor principal (no siempre existe)
 * - <articulo> - Artículos del documento
 * - <disposicion_adicional>, <disposicion_transitoria>, <disposicion_final>
 * - <anexo> - Anexos con tablas y datos
 * - <preambulo> - Preámbulo de leyes/decretos
 * - <parrafo> - Párrafos de texto
 */

export interface ContenidoExtraido {
  texto_completo: string
  estructura: {
    preambulo?: string
    articulos: string[]
    disposiciones: string[]
    anexos: string[]
  }
  metadata: {
    caracteres_originales: number
    caracteres_extraidos: number
    elementos_encontrados: string[]
  }
}

/**
 * Extrae texto de un tag XML removiendo otros tags HTML
 */
function extraerTextoDeTag(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi')
  const matches = xml.matchAll(regex)
  const textos: string[] = []

  for (const match of matches) {
    // Extraer contenido y limpiar tags HTML internos
    let contenido = match[1]

    // Preservar saltos entre párrafos
    contenido = contenido.replace(/<\/parrafo>/gi, '\n')
    contenido = contenido.replace(/<\/articulo>/gi, '\n\n')

    // Remover todos los tags HTML/XML
    contenido = contenido.replace(/<[^>]+>/g, ' ')

    // Decodificar entidades HTML
    contenido = contenido
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))

    // Limpiar espacios múltiples
    contenido = contenido.replace(/\s+/g, ' ').trim()

    if (contenido.length > 0) {
      textos.push(contenido)
    }
  }

  return textos
}

/**
 * Parser principal que extrae TODO el contenido del XML del BOE
 */
export function parseBOEXML(xmlContent: string): ContenidoExtraido {
  const elementosEncontrados: string[] = []

  // 1. Buscar preámbulo
  const preambulo = extraerTextoDeTag(xmlContent, 'preambulo')
  if (preambulo.length > 0) elementosEncontrados.push('preambulo')

  // 2. Buscar artículos
  const articulos = extraerTextoDeTag(xmlContent, 'articulo')
  if (articulos.length > 0) elementosEncontrados.push('articulos')

  // 3. Buscar disposiciones (varios tipos)
  const disposiciones: string[] = [
    ...extraerTextoDeTag(xmlContent, 'disposicion_adicional'),
    ...extraerTextoDeTag(xmlContent, 'disposicion_transitoria'),
    ...extraerTextoDeTag(xmlContent, 'disposicion_derogatoria'),
    ...extraerTextoDeTag(xmlContent, 'disposicion_final'),
    ...extraerTextoDeTag(xmlContent, 'disposicion'),
  ]
  if (disposiciones.length > 0) elementosEncontrados.push('disposiciones')

  // 4. Buscar anexos
  const anexos = extraerTextoDeTag(xmlContent, 'anexo')
  if (anexos.length > 0) elementosEncontrados.push('anexos')

  // 5. Fallback: buscar tag <texto> general
  let textoGeneral: string[] = []
  if (articulos.length === 0 && disposiciones.length === 0) {
    textoGeneral = extraerTextoDeTag(xmlContent, 'texto')
    if (textoGeneral.length > 0) elementosEncontrados.push('texto')
  }

  // 6. Si aún no hay nada, extraer todos los <parrafo>
  if (elementosEncontrados.length === 0) {
    textoGeneral = extraerTextoDeTag(xmlContent, 'parrafo')
    if (textoGeneral.length > 0) elementosEncontrados.push('parrafos')
  }

  // Combinar todo el contenido
  const estructura = {
    preambulo: preambulo.join('\n\n'),
    articulos,
    disposiciones,
    anexos
  }

  const todasLasPartes = [
    ...preambulo,
    ...articulos,
    ...disposiciones,
    ...anexos,
    ...textoGeneral
  ]

  const textoCompleto = todasLasPartes.join('\n\n')

  return {
    texto_completo: textoCompleto,
    estructura,
    metadata: {
      caracteres_originales: xmlContent.length,
      caracteres_extraidos: textoCompleto.length,
      elementos_encontrados: elementosEncontrados
    }
  }
}

/**
 * Extrae contenido completo de un documento BOE con logging
 */
export function extraerContenidoBOE(xmlContent: string): string {
  const resultado = parseBOEXML(xmlContent)

  console.log(`   📊 Extracción XML:`)
  console.log(`      - Tamaño original: ${resultado.metadata.caracteres_originales.toLocaleString()} chars`)
  console.log(`      - Texto extraído: ${resultado.metadata.caracteres_extraidos.toLocaleString()} chars`)
  console.log(`      - Elementos: ${resultado.metadata.elementos_encontrados.join(', ')}`)
  console.log(`      - Ratio: ${((resultado.metadata.caracteres_extraidos / resultado.metadata.caracteres_originales) * 100).toFixed(1)}%`)

  if (resultado.estructura.articulos.length > 0) {
    console.log(`      - Artículos: ${resultado.estructura.articulos.length}`)
  }
  if (resultado.estructura.disposiciones.length > 0) {
    console.log(`      - Disposiciones: ${resultado.estructura.disposiciones.length}`)
  }
  if (resultado.estructura.anexos.length > 0) {
    console.log(`      - Anexos: ${resultado.estructura.anexos.length}`)
  }

  return resultado.texto_completo
}
