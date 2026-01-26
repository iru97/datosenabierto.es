/**
 * Test del parser con XML de ejemplo (sin necesidad de descargar)
 */
import { parseBOEXML } from '../utils/boe-xml-parser'

// XML de ejemplo basado en la estructura real del BOE
const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<documento fecha_actualizacion="20251119082601">
  <metadatos>
    <identificador>BOE-A-2025-23386</identificador>
    <titulo>Resolución de prueba</titulo>
    <origen_legislativo>MINISTERIO</origen_legislativo>
  </metadatos>
  <texto>
    <p class="parrafo">De conformidad con lo establecido en el artículo 25.1 de la Ley 39/2015, de 1 de octubre, del Procedimiento Administrativo Común de las Administraciones Públicas, se hace pública la siguiente resolución.</p>
    <p class="articulo">Primero. Objeto y finalidad.</p>
    <p class="parrafo">Declarar aprobada la lista provisional de personas aspirantes admitidas y excluidas en el proceso selectivo para ingreso al Cuerpo de Profesores de Enseñanza Secundaria, especialidad de Matemáticas.</p>
    <p class="articulo">Segundo. Plazo de subsanación.</p>
    <p class="parrafo">Las personas aspirantes excluidas disponen de un plazo de diez días hábiles, contados a partir del día siguiente a la publicación de esta Resolución, para subsanar el defecto que haya motivado su exclusión.</p>
    <p class="articulo">Tercero. Publicación.</p>
    <p class="parrafo">Esta resolución se publicará en el Boletín Oficial del Estado y en la sede electrónica del Ministerio de Educación y Formación Profesional.</p>
    <p class="anexo_num">ANEXO I</p>
    <p class="anexo_tit">Relación provisional de personas excluidas en el proceso selectivo</p>
    <p class="parrafo">A continuación se relacionan las personas excluidas con indicación de la causa de exclusión:</p>
    <table class="tabla_ancha" data-omitir-repetir-tfoot="true">
      <thead>
        <tr>
          <th class="cabeza_tabla">NIF</th>
          <th class="cabeza_tabla">Apellidos y nombre</th>
          <th class="cabeza_tabla">Código de exclusión</th>
          <th class="cabeza_tabla">Descripción</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="cuerpo_tabla_centro">****0527**</td>
          <td class="cuerpo_tabla_izq">ALONSO MEZQUITA, CRISTINA</td>
          <td class="cuerpo_tabla_centro">E01</td>
          <td class="cuerpo_tabla_izq">No acredita titulación requerida</td>
        </tr>
        <tr>
          <td class="cuerpo_tabla_centro">****1234**</td>
          <td class="cuerpo_tabla_izq">GARCÍA LÓPEZ, JUAN</td>
          <td class="cuerpo_tabla_centro">E02</td>
          <td class="cuerpo_tabla_izq">Documentación incompleta</td>
        </tr>
        <tr>
          <td class="cuerpo_tabla_centro">****5678**</td>
          <td class="cuerpo_tabla_izq">MARTÍNEZ SÁNCHEZ, MARÍA</td>
          <td class="cuerpo_tabla_centro">E03</td>
          <td class="cuerpo_tabla_izq">Fuera de plazo de presentación</td>
        </tr>
      </tbody>
    </table>
    <p class="anexo_num">ANEXO II</p>
    <p class="anexo_tit">Códigos de exclusión</p>
    <p class="parrafo">Los códigos de exclusión utilizados en el Anexo I tienen el siguiente significado:</p>
    <table class="tabla_normal">
      <thead>
        <tr>
          <th class="cabeza_tabla">Código</th>
          <th class="cabeza_tabla">Descripción</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="cuerpo_tabla_centro">E01</td>
          <td class="cuerpo_tabla_izq">No se acredita la titulación académica requerida en la convocatoria</td>
        </tr>
        <tr>
          <td class="cuerpo_tabla_centro">E02</td>
          <td class="cuerpo_tabla_izq">La documentación presentada está incompleta o no se ajusta a lo solicitado</td>
        </tr>
        <tr>
          <td class="cuerpo_tabla_centro">E03</td>
          <td class="cuerpo_tabla_izq">La solicitud se ha presentado fuera del plazo establecido</td>
        </tr>
      </tbody>
    </table>
  </texto>
</documento>`

function main() {
  console.log('\n📊 TEST DEL PARSER BOE (XML LOCAL)\n')
  console.log('=' .repeat(80))

  // Parsear
  console.log('🔍 Parseando XML de ejemplo...\n')
  const resultado = parseBOEXML(SAMPLE_XML)

  // Mostrar resultados
  console.log('=' .repeat(80))
  console.log('📊 RESULTADOS DE EXTRACCIÓN')
  console.log('=' .repeat(80))
  console.log(`Tamaño original:     ${resultado.metadata.caracteres_originales.toLocaleString()} chars`)
  console.log(`Texto extraído:      ${resultado.metadata.caracteres_extraidos.toLocaleString()} chars`)
  console.log(`Ratio extracción:    ${((resultado.metadata.caracteres_extraidos / resultado.metadata.caracteres_originales) * 100).toFixed(1)}%`)
  console.log(`Elementos:           ${resultado.metadata.elementos_encontrados.join(', ')}`)
  console.log()

  // Verificar que se extrajo contenido relevante
  const textoCompleto = resultado.texto_completo
  const checks = [
    { nombre: 'Contiene artículos', test: textoCompleto.includes('Primero') && textoCompleto.includes('Segundo') },
    { nombre: 'Contiene anexos', test: textoCompleto.includes('ANEXO I') && textoCompleto.includes('ANEXO II') },
    { nombre: 'Contiene datos de tabla', test: textoCompleto.includes('ALONSO MEZQUITA') },
    { nombre: 'Contiene descripciones', test: textoCompleto.includes('No acredita titulación') },
    { nombre: 'Ratio > 40%', test: (resultado.metadata.caracteres_extraidos / resultado.metadata.caracteres_originales) > 0.4 },
  ]

  console.log('✅ VERIFICACIONES:')
  console.log('=' .repeat(80))
  let allPassed = true
  for (const check of checks) {
    const icon = check.test ? '✅' : '❌'
    console.log(`${icon} ${check.nombre}`)
    if (!check.test) allPassed = false
  }
  console.log()

  // Mostrar muestra del texto extraído
  console.log('📄 TEXTO EXTRAÍDO COMPLETO:')
  console.log('=' .repeat(80))
  console.log(resultado.texto_completo)
  console.log()
  console.log('=' .repeat(80))

  // Análisis de contenido
  const lineas = resultado.texto_completo.split('\n').filter(l => l.trim().length > 0)
  console.log(`📊 Líneas de texto: ${lineas.length.toLocaleString()}`)
  console.log()

  if (allPassed) {
    console.log('✅ TODAS LAS VERIFICACIONES PASARON')
  } else {
    console.log('❌ ALGUNAS VERIFICACIONES FALLARON')
    process.exit(1)
  }
}

main()
