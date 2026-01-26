/**
 * Test de procesamiento con datos MOCK
 *
 * Este script usa datos de ejemplo en lugar de descargar del BOE
 * para demostrar que todo el pipeline de procesamiento funciona correctamente
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { procesarDocumentoCompleto, type DocumentoBOE } from '../utils/agentes-llm'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
)

// ============================================================================
// DATOS MOCK (simulan respuesta de BOE API)
// ============================================================================

const documentosMock: DocumentoBOE[] = [
  {
    boe_id: 'BOE-A-2024-19876',
    titulo: 'Convocatoria de 150 plazas de Técnico de Hacienda para el Ayuntamiento de Madrid',
    fecha_publicacion: '2024-11-18',
    seccion: 'II. Autoridades y personal',
    departamento: 'Ayuntamiento de Madrid',
    rango: 'Resolución',
    url_pdf: 'https://www.boe.es/boe/dias/2024/11/18/pdfs/BOE-A-2024-19876.pdf',
    contenido_texto: `
      El Ayuntamiento de Madrid convoca 150 plazas de Técnico de Hacienda, mediante sistema de oposición libre.

      REQUISITOS:
      - Titulación universitaria de Grado en Economía, ADE, Derecho o similar
      - Nacionalidad española o de país miembro de la UE
      - No haber sido separado mediante expediente disciplinario

      PLAZO DE PRESENTACIÓN:
      20 días hábiles desde la publicación en el BOE

      PRUEBAS:
      - Fase de oposición: dos ejercicios eliminatorios
      - Primer ejercicio: test de 100 preguntas sobre legislación tributaria
      - Segundo ejercicio: caso práctico sobre gestión tributaria municipal

      RETRIBUCIONES:
      Salario base: 28.000€ brutos anuales + complementos

      DOCUMENTACIÓN:
      - DNI o NIE
      - Título universitario
      - Declaración responsable de no incompatibilidades
    `
  },
  {
    boe_id: 'BOE-A-2024-19877',
    titulo: 'Subvención para la digitalización de PYMES en el sector turístico - Convocatoria 2024',
    fecha_publicacion: '2024-11-18',
    seccion: 'III. Otras disposiciones',
    departamento: 'Ministerio de Industria y Turismo',
    rango: 'Orden',
    url_pdf: 'https://www.boe.es/boe/dias/2024/11/18/pdfs/BOE-A-2024-19877.pdf',
    contenido_texto: `
      Se convocan ayudas para la digitalización de pequeñas y medianas empresas del sector turístico.

      OBJETO:
      Financiar proyectos de transformación digital: páginas web, sistemas de reservas online, CRM, etc.

      BENEFICIARIOS:
      - PYMES del sector turístico (hoteles, restaurantes, agencias de viaje, etc.)
      - Con domicilio fiscal en España
      - Al corriente de obligaciones tributarias y con la Seguridad Social

      CUANTÍA:
      - Hasta 10.000€ por empresa
      - 50% del coste total del proyecto
      - Presupuesto total: 5.000.000€

      PLAZO:
      - Presentación de solicitudes: hasta el 15 de enero de 2025
      - Ejecución del proyecto: hasta el 30 de junio de 2025

      GASTOS SUBVENCIONABLES:
      - Desarrollo web y apps móviles
      - Software de gestión (PMS, Channel Manager, CRM)
      - Hardware (tablets, TPV, etc.)
      - Formación en herramientas digitales

      DOCUMENTACIÓN:
      - Formulario de solicitud
      - Memoria del proyecto
      - Presupuestos de proveedores
      - Certificados de estar al corriente con Hacienda y SS
    `
  },
  {
    boe_id: 'BOE-A-2024-19878',
    titulo: 'Real Decreto-ley 8/2024 de medidas urgentes en materia de teletrabajo y conciliación familiar',
    fecha_publicacion: '2024-11-19',
    seccion: 'I. Disposiciones generales',
    departamento: 'Jefatura del Estado',
    rango: 'Real Decreto-ley',
    url_pdf: 'https://www.boe.es/boe/dias/2024/11/19/pdfs/BOE-A-2024-19878.pdf',
    contenido_texto: `
      Se aprueban medidas urgentes para regular el teletrabajo y mejorar la conciliación familiar.

      ARTÍCULO 1. Derecho al teletrabajo
      Los trabajadores con hijos menores de 12 años o personas dependientes a su cargo tienen derecho a solicitar teletrabajo
      al menos 2 días a la semana. La empresa solo podrá denegar la solicitud por causas organizativas justificadas.

      ARTÍCULO 2. Flexibilidad horaria
      Se establece el derecho a flexibilidad de entrada y salida de 1 hora para trabajadores con menores de 12 años.

      ARTÍCULO 3. Desconexión digital
      Derecho a la desconexión fuera del horario laboral. Las empresas deben establecer políticas claras al respecto.

      ARTÍCULO 4. Gastos de teletrabajo
      La empresa debe compensar o proporcionar los medios necesarios: ordenador, conexión a internet, mobiliario ergonómico.

      ARTÍCULO 5. Registro horario en teletrabajo
      Obligación de registro de jornada también en modalidad de teletrabajo.

      ENTRADA EN VIGOR:
      El presente Real Decreto-ley entra en vigor el 1 de enero de 2025.

      DISPOSICIONES TRANSITORIAS:
      Las empresas tienen hasta el 31 de marzo de 2025 para adaptar sus políticas internas.
    `
  }
]

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 ============================================')
  console.log('🚀 TEST CON DATOS MOCK')
  console.log('🚀 ============================================\n')

  const startTime = Date.now()

  console.log(`📊 ${documentosMock.length} documentos de ejemplo cargados\n`)

  // Obtener categorías de Supabase
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .eq('activa', true)

  if (!categorias || categorias.length === 0) {
    console.error('❌ No se encontraron categorías en Supabase')
    console.log('💡 Ejecuta primero el schema.sql para crear las categorías')
    return
  }

  console.log(`✅ ${categorias.length} categorías encontradas en Supabase\n`)

  // Procesar cada documento
  let procesados = 0
  let costoTotal = 0
  let tokensTotal = 0

  for (const doc of documentosMock) {
    console.log(`\n📄 Procesando: ${doc.titulo.substring(0, 60)}...`)
    console.log(`   BOE ID: ${doc.boe_id}`)
    console.log(`   Categoría detectada: ${doc.seccion}`)

    try {
      // Determinar categoría
      let categoriaSlug = 'otros'
      if (doc.titulo.toLowerCase().includes('convocatoria') || doc.titulo.toLowerCase().includes('plazas')) {
        categoriaSlug = 'oposiciones'
      } else if (doc.titulo.toLowerCase().includes('subvención') || doc.titulo.toLowerCase().includes('ayuda')) {
        categoriaSlug = 'ayudas'
      } else if (doc.rango.toLowerCase().includes('real decreto') || doc.rango.toLowerCase().includes('ley')) {
        categoriaSlug = 'legislacion'
      }

      const categoria = categorias.find(c => c.slug === categoriaSlug)
      if (!categoria) {
        console.log(`   ⚠️  Categoría ${categoriaSlug} no encontrada`)
        continue
      }

      console.log(`   🏷️  Clasificado como: ${categoria.nombre}`)
      console.log(`   🔄 Ejecutando 4 fases de procesamiento...`)

      // PROCESAR CON AGENTES LLM
      const resultado = await procesarDocumentoCompleto(doc, categoriaSlug)

      console.log(`   ✅ Procesado exitosamente`)
      console.log(`   📊 Tokens: ${resultado.metadata.tokens_usados}`)
      console.log(`   💰 Coste: $${resultado.metadata.coste_estimado_usd.toFixed(6)}`)

      // Guardar en Supabase
      console.log(`   💾 Guardando en Supabase...`)

      const { data: docGuardado, error: errorDoc } = await supabase
        .from('documentos_boe')
        .upsert({
          boe_id: doc.boe_id,
          categoria_id: categoria.id,
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

      if (errorDoc) {
        console.log(`   ⚠️  Error guardando documento: ${errorDoc.message}`)
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

      // Borrar explicaciones anteriores
      await supabase
        .from('explicaciones_llm')
        .delete()
        .eq('documento_id', docGuardado.id)

      // Insertar nuevas
      const { error: errorExplicaciones } = await supabase
        .from('explicaciones_llm')
        .insert(explicaciones)

      if (errorExplicaciones) {
        console.log(`   ⚠️  Error guardando explicaciones: ${errorExplicaciones.message}`)
      } else {
        console.log(`   ✅ Guardadas ${explicaciones.length} explicaciones`)
      }

      // Mostrar resultados
      console.log(`\n   📝 RESULTADO DEL PROCESAMIENTO:`)
      console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`\n   📌 RESUMEN (3 líneas):`)
      console.log(`   1. ${resultado.fase2.linea1}`)
      console.log(`   2. ${resultado.fase2.linea2}`)
      console.log(`   3. ${resultado.fase2.linea3}`)

      console.log(`\n   💡 ¿QUÉ ES?`)
      console.log(`   ${resultado.fase3.queEs}`)

      console.log(`\n   🎯 ¿CÓMO TE AFECTA?`)
      console.log(`   ${resultado.fase3.comoAfecta}`)

      if (resultado.fase1.fechas_importantes && resultado.fase1.fechas_importantes.length > 0) {
        console.log(`\n   📅 FECHAS IMPORTANTES:`)
        resultado.fase1.fechas_importantes.forEach((fecha: any) => {
          console.log(`   • ${fecha.tipo}: ${fecha.fecha} - ${fecha.descripcion}`)
        })
      }

      if (resultado.fase4.requisitos && resultado.fase4.requisitos.length > 0) {
        console.log(`\n   📋 REQUISITOS:`)
        resultado.fase4.requisitos.slice(0, 3).forEach((req: string) => {
          console.log(`   • ${req}`)
        })
      }

      if (resultado.fase4.pasos && resultado.fase4.pasos.length > 0) {
        console.log(`\n   🔢 PASOS A SEGUIR:`)
        resultado.fase4.pasos.slice(0, 3).forEach((paso: string, i: number) => {
          console.log(`   ${i + 1}. ${paso}`)
        })
      }

      console.log(`\n   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

      procesados++
      costoTotal += resultado.metadata.coste_estimado_usd
      tokensTotal += resultado.metadata.tokens_usados

    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }

  const tiempoTotal = Math.floor((Date.now() - startTime) / 1000)

  console.log('\n\n✅ ============================================')
  console.log('✅ TEST COMPLETADO')
  console.log('✅ ============================================')
  console.log(`📊 Documentos procesados: ${procesados}/${documentosMock.length}`)
  console.log(`📊 Tokens totales: ${tokensTotal.toLocaleString()}`)
  console.log(`💰 Coste total: $${costoTotal.toFixed(6)}`)
  console.log(`⏱️  Tiempo total: ${tiempoTotal}s`)
  console.log('✅ ============================================\n')

  console.log('✨ VERIFICA LOS DATOS EN SUPABASE:')
  console.log('   • Tabla documentos_boe')
  console.log('   • Tabla explicaciones_llm')
  console.log('\n🌐 O prueba el frontend:')
  console.log('   npm run dev\n')
}

main().catch(console.error)
