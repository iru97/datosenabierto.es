/**
 * Script de Prueba: Clasificador LLM Multi-Categoría
 *
 * Prueba el clasificador con documentos reales del BOE
 * para validar la calidad de las clasificaciones
 *
 * Usage:
 *   OPENAI_API_KEY=xxx SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx \
 *   npx ts-node scripts/test-clasificador-llm.ts
 */

import 'dotenv/config'
import { clasificarDocumentoConLLM, type DocumentoBOE } from '../utils/clasificador-llm'

// ============================================
// DOCUMENTOS DE PRUEBA
// ============================================

const DOCUMENTOS_PRUEBA: DocumentoBOE[] = [
  {
    boe_id: 'BOE-A-2025-1234',
    titulo: 'Resolución de 15 de noviembre de 2025, de la Secretaría de Estado de Función Pública, por la que se convoca proceso selectivo para ingreso en el Cuerpo de Gestión de la Administración Civil del Estado',
    fecha_publicacion: '2025-11-16',
    seccion: 'II. Autoridades y personal',
    departamento: 'Ministerio de Hacienda y Función Pública',
    rango: 'Resolución',
    epigrafe: 'Oposiciones y concursos'
  },
  {
    boe_id: 'BOE-A-2025-5678',
    titulo: 'Real Decreto 789/2025, de 10 de noviembre, por el que se establecen las bases reguladoras para la concesión de subvenciones destinadas a la rehabilitación energética de edificios',
    fecha_publicacion: '2025-11-12',
    seccion: 'I. Disposiciones generales',
    departamento: 'Ministerio para la Transición Ecológica y el Reto Demográfico',
    rango: 'Real Decreto',
    epigrafe: 'Ayudas y subvenciones'
  },
  {
    boe_id: 'BOE-A-2025-9012',
    titulo: 'Orden EDU/1234/2025, de 8 de noviembre, por la que se convocan becas de formación en sostenibilidad ambiental para estudiantes de máster universitario',
    fecha_publicacion: '2025-11-10',
    seccion: 'III. Otras disposiciones',
    departamento: 'Ministerio de Universidades',
    rango: 'Orden',
    epigrafe: 'Becas y ayudas'
  },
  {
    boe_id: 'BOE-A-2025-3456',
    titulo: 'Ley 12/2025, de 5 de noviembre, de protección de datos personales en el ámbito educativo',
    fecha_publicacion: '2025-11-06',
    seccion: 'I. Disposiciones generales',
    departamento: 'Jefatura del Estado',
    rango: 'Ley',
    epigrafe: 'Leyes'
  },
  {
    boe_id: 'BOE-A-2025-7890',
    titulo: 'Resolución de 20 de octubre de 2025, de la Dirección General de Tráfico, por la que se establecen medidas excepcionales de circulación durante el periodo navideño',
    fecha_publicacion: '2025-10-22',
    seccion: 'III. Otras disposiciones',
    departamento: 'Ministerio del Interior',
    rango: 'Resolución',
    epigrafe: 'Seguridad vial'
  }
]

// ============================================
// MAIN TEST
// ============================================

async function main() {
  console.log('🧪 TEST: Clasificador LLM Multi-Categoría')
  console.log('=' .repeat(80))
  console.log()

  let totalCategorias = 0
  let totalCosteSusd = 0
  let totalTokens = 0

  for (const doc of DOCUMENTOS_PRUEBA) {
    console.log(`\n📄 DOCUMENTO: ${doc.boe_id}`)
    console.log(`   Título: ${doc.titulo.substring(0, 80)}...`)
    console.log(`   Rango: ${doc.rango}`)
    console.log(`   Departamento: ${doc.departamento}`)
    console.log()

    try {
      const resultado = await clasificarDocumentoConLLM(doc)

      console.log(`   ✅ Clasificado en ${resultado.categorias.length} categorías:`)
      resultado.categorias.forEach((cat, index) => {
        const isPrincipal = index === 0 ? '⭐' : '  '
        console.log(`      ${isPrincipal} ${cat.categoria_slug.padEnd(18)} - ${(cat.confidence * 100).toFixed(0)}% - ${cat.razonamiento}`)
      })

      console.log()
      console.log(`   💰 Coste: $${resultado.metadata.coste_usd.toFixed(5)}`)
      console.log(`   🔢 Tokens: ${resultado.metadata.tokens}`)
      console.log(`   ⏱️  Duración: ${resultado.metadata.duracion_ms}ms`)

      totalCategorias += resultado.categorias.length
      totalCosteSusd += resultado.metadata.coste_usd
      totalTokens += resultado.metadata.tokens

    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    console.log()
    console.log('-'.repeat(80))
  }

  // Summary
  console.log()
  console.log('=' .repeat(80))
  console.log('📊 RESUMEN')
  console.log('=' .repeat(80))
  console.log(`Documentos procesados: ${DOCUMENTOS_PRUEBA.length}`)
  console.log(`Categorías asignadas (total): ${totalCategorias}`)
  console.log(`Promedio categorías/doc: ${(totalCategorias / DOCUMENTOS_PRUEBA.length).toFixed(2)}`)
  console.log()
  console.log(`💰 Coste total: $${totalCosteSusd.toFixed(5)}`)
  console.log(`💰 Coste promedio/doc: $${(totalCosteSusd / DOCUMENTOS_PRUEBA.length).toFixed(5)}`)
  console.log()
  console.log(`🔢 Tokens totales: ${totalTokens}`)
  console.log(`🔢 Tokens promedio/doc: ${Math.round(totalTokens / DOCUMENTOS_PRUEBA.length)}`)
  console.log()
  console.log('✅ Test completado')
  console.log('=' .repeat(80))
}

main().catch(error => {
  console.error('💥 Error fatal:', error)
  process.exit(1)
})
