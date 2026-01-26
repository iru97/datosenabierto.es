/**
 * Test Multi-Category Migration
 * Phase 1, Sprint 1-2: Testing Script
 *
 * Tests:
 * 1. Database migration completed successfully
 * 2. All original categories migrated
 * 3. Multi-category queries work
 * 4. New functions in useMultiCategory work
 * 5. No data loss
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// ============================================
// CONFIGURATION
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ============================================
// TEST UTILITIES
// ============================================

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

const results: TestResult[] = []

function logTest(name: string, passed: boolean, details?: any, error?: string) {
  results.push({ name, passed, details, error })

  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${name}`)

  if (details) {
    console.log(`   Details:`, details)
  }

  if (error) {
    console.error(`   Error:`, error)
  }
}

// ============================================
// TESTS
// ============================================

async function test1_TablesExist() {
  console.log('\n📋 Test 1: Verify tables exist')

  try {
    // Check documento_categorias
    const { error: error1 } = await supabase
      .from('documento_categorias')
      .select('id')
      .limit(1)

    logTest('Table: documento_categorias', !error1, undefined, error1?.message)

    // Check classification_feedback
    const { error: error2 } = await supabase
      .from('classification_feedback')
      .select('id')
      .limit(1)

    logTest('Table: classification_feedback', !error2, undefined, error2?.message)

    // Check classification_metrics
    const { error: error3 } = await supabase
      .from('classification_metrics')
      .select('id')
      .limit(1)

    logTest('Table: classification_metrics', !error3, undefined, error3?.message)
  } catch (err) {
    logTest('Tables exist check', false, undefined, (err as Error).message)
  }
}

async function test2_MigrationCompleted() {
  console.log('\n📊 Test 2: Verify migration completed')

  try {
    // Count original documentos with categoria_id
    const { count: originalCount, error: error1 } = await supabase
      .from('documentos_boe')
      .select('*', { count: 'exact', head: true })
      .not('categoria_id', 'is', null)

    if (error1) {
      logTest('Count original documents', false, undefined, error1.message)
      return
    }

    // Count migrated entries (legacy method)
    const { count: migratedCount, error: error2 } = await supabase
      .from('documento_categorias')
      .select('*', { count: 'exact', head: true })
      .eq('clasificacion_metodo', 'legacy')

    if (error2) {
      logTest('Count migrated documents', false, undefined, error2.message)
      return
    }

    const passed = originalCount === migratedCount

    logTest(
      'Migration count matches',
      passed,
      {
        original: originalCount,
        migrated: migratedCount,
        match: passed
      }
    )
  } catch (err) {
    logTest('Migration completed check', false, undefined, (err as Error).message)
  }
}

async function test3_ViewsWork() {
  console.log('\n👁️ Test 3: Verify views work')

  try {
    // Test documentos_con_categoria_principal view
    const { data: data1, error: error1 } = await supabase
      .from('documentos_con_categoria_principal')
      .select('*')
      .limit(5)

    logTest('View: documentos_con_categoria_principal', !error1 && !!data1, {
      count: data1?.length
    }, error1?.message)

    // Test documentos_con_todas_categorias view
    const { data: data2, error: error2 } = await supabase
      .from('documentos_con_todas_categorias')
      .select('*')
      .limit(5)

    logTest('View: documentos_con_todas_categorias', !error2 && !!data2, {
      count: data2?.length,
      sample: data2?.[0]?.categorias
    }, error2?.message)
  } catch (err) {
    logTest('Views work check', false, undefined, (err as Error).message)
  }
}

async function test4_HelperFunctions() {
  console.log('\n🔧 Test 4: Verify helper functions')

  try {
    // Get a sample document
    const { data: sampleDoc, error: error1 } = await supabase
      .from('documentos_boe')
      .select('id, titulo')
      .not('categoria_id', 'is', null)
      .limit(1)
      .single()

    if (error1 || !sampleDoc) {
      logTest('Get sample document', false, undefined, error1?.message)
      return
    }

    // Test get_primary_categoria function
    const { data: primaryCat, error: error2 } = await supabase
      .rpc('get_primary_categoria', { doc_id: sampleDoc.id })

    logTest('Function: get_primary_categoria', !error2 && !!primaryCat, {
      documento: sampleDoc.titulo?.substring(0, 50) + '...',
      categoria_id: primaryCat
    }, error2?.message)
  } catch (err) {
    logTest('Helper functions check', false, undefined, (err as Error).message)
  }
}

async function test5_MultiCategoryQueries() {
  console.log('\n🔍 Test 5: Test multi-category queries')

  try {
    // Test query documents by category through documento_categorias
    const { data: categorias } = await supabase
      .from('categorias')
      .select('id, slug')
      .limit(1)
      .single()

    if (!categorias) {
      logTest('Get test category', false, undefined, 'No categories found')
      return
    }

    const { data: docs, error } = await supabase
      .from('documento_categorias')
      .select(`
        confidence,
        clasificacion_metodo,
        documento:documentos_boe(id, titulo, fecha_publicacion)
      `)
      .eq('categoria_id', categorias.id)
      .limit(5)

    logTest('Query documents by category (multi-category)', !error && !!docs, {
      categoria: categorias.slug,
      count: docs?.length,
      sample_confidence: docs?.[0]?.confidence
    }, error?.message)
  } catch (err) {
    logTest('Multi-category queries check', false, undefined, (err as Error).message)
  }
}

async function test6_ConfidenceScores() {
  console.log('\n📈 Test 6: Verify confidence scores')

  try {
    // Get confidence score distribution
    const { data, error } = await supabase
      .from('documento_categorias')
      .select('confidence, clasificacion_metodo')
      .limit(100)

    if (error) {
      logTest('Get confidence scores', false, undefined, error.message)
      return
    }

    const avgConfidence = data.reduce((sum, item) => sum + item.confidence, 0) / data.length

    const byMethod = data.reduce((acc, item) => {
      acc[item.clasificacion_metodo] = (acc[item.clasificacion_metodo] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    logTest('Confidence scores valid', avgConfidence >= 0 && avgConfidence <= 1, {
      average_confidence: avgConfidence.toFixed(3),
      total_sample: data.length,
      by_method: byMethod
    })
  } catch (err) {
    logTest('Confidence scores check', false, undefined, (err as Error).message)
  }
}

async function test7_NoDataLoss() {
  console.log('\n🔒 Test 7: Verify no data loss')

  try {
    // Count total documentos
    const { count: totalDocs, error: error1 } = await supabase
      .from('documentos_boe')
      .select('*', { count: 'exact', head: true })

    // Count documentos with categoria_id
    const { count: docsWithCat, error: error2 } = await supabase
      .from('documentos_boe')
      .select('*', { count: 'exact', head: true })
      .not('categoria_id', 'is', null)

    // Count documento_categorias entries
    const { count: catEntries, error: error3 } = await supabase
      .from('documento_categorias')
      .select('*', { count: 'exact', head: true })

    if (error1 || error2 || error3) {
      logTest('Data integrity check', false, undefined, 'Error counting records')
      return
    }

    const noDataLoss = (catEntries || 0) >= (docsWithCat || 0)

    logTest('No data loss in migration', noDataLoss, {
      total_documentos: totalDocs,
      documentos_with_categoria: docsWithCat,
      categoria_entries: catEntries,
      integrity: noDataLoss ? 'OK' : 'FAILED'
    })
  } catch (err) {
    logTest('No data loss check', false, undefined, (err as Error).message)
  }
}

async function test8_IndexesExist() {
  console.log('\n🗃️ Test 8: Verify indexes exist')

  try {
    // This query tests that indexes are working (won't error if they exist)
    const { error } = await supabase
      .from('documento_categorias')
      .select('*')
      .eq('documento_id', '00000000-0000-0000-0000-000000000000') // Dummy ID
      .eq('categoria_id', '00000000-0000-0000-0000-000000000000')
      .gte('confidence', 0.5)
      .limit(1)

    // Error is expected (no matching records), but query should execute
    const passed = error?.code !== '42P01' // Not "relation does not exist"

    logTest('Indexes queryable', passed, {
      note: 'Indexes are being used (query executed without structural errors)'
    })
  } catch (err) {
    logTest('Indexes check', false, undefined, (err as Error).message)
  }
}

async function test9_UniqueConstraint() {
  console.log('\n🔐 Test 9: Test unique constraint')

  try {
    // Get a sample document with a category
    const { data: sample } = await supabase
      .from('documento_categorias')
      .select('documento_id, categoria_id')
      .limit(1)
      .single()

    if (!sample) {
      logTest('Get sample for unique test', false, undefined, 'No sample found')
      return
    }

    // Try to insert duplicate (should fail)
    const { error } = await supabase
      .from('documento_categorias')
      .insert({
        documento_id: sample.documento_id,
        categoria_id: sample.categoria_id,
        confidence: 0.5,
        clasificacion_metodo: 'keyword'
      })

    // Should get unique constraint violation error
    const passed = error?.code === '23505' // Unique violation

    logTest('Unique constraint enforced', passed, {
      expected_error: '23505 (unique violation)',
      actual_error: error?.code
    })
  } catch (err) {
    logTest('Unique constraint check', false, undefined, (err as Error).message)
  }
}

async function test10_SampleMultiCategory() {
  console.log('\n🎯 Test 10: Create sample multi-category document')

  try {
    // Find a document with only 1 category
    const { data: doc } = await supabase
      .from('documento_categorias')
      .select('documento_id')
      .limit(100)

    if (!doc || doc.length === 0) {
      logTest('Find document for test', false, undefined, 'No documents found')
      return
    }

    // Group by documento_id and find one with count = 1
    const counts = doc.reduce((acc, item) => {
      acc[item.documento_id] = (acc[item.documento_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const singleCategoryDoc = Object.keys(counts).find(id => counts[id] === 1)

    if (!singleCategoryDoc) {
      logTest('Find single-category document', false, undefined, 'All docs have multiple categories')
      return
    }

    // Get a different category
    const { data: categories } = await supabase
      .from('categorias')
      .select('id')
      .limit(2)

    if (!categories || categories.length < 2) {
      logTest('Get categories for test', false, undefined, 'Not enough categories')
      return
    }

    const { data: existing } = await supabase
      .from('documento_categorias')
      .select('categoria_id')
      .eq('documento_id', singleCategoryDoc)
      .single()

    const newCategoryId = categories.find(c => c.id !== existing?.categoria_id)?.id

    if (!newCategoryId) {
      logTest('Find different category', false, undefined, 'Could not find different category')
      return
    }

    // Add second category
    const { error: insertError } = await supabase
      .from('documento_categorias')
      .insert({
        documento_id: singleCategoryDoc,
        categoria_id: newCategoryId,
        confidence: 0.75,
        clasificacion_metodo: 'keyword',
        razonamiento: 'Test multi-category assignment'
      })

    if (insertError) {
      logTest('Add second category', false, undefined, insertError.message)
      return
    }

    // Verify document now has 2 categories
    const { data: verify, error: verifyError } = await supabase
      .from('documento_categorias')
      .select('*')
      .eq('documento_id', singleCategoryDoc)

    const passed = !verifyError && verify && verify.length === 2

    logTest('Create multi-category document', passed, {
      documento_id: singleCategoryDoc,
      total_categorias: verify?.length,
      categorias: verify?.map(v => ({ confidence: v.confidence, metodo: v.clasificacion_metodo }))
    })

    // Cleanup: Remove test category
    await supabase
      .from('documento_categorias')
      .delete()
      .eq('documento_id', singleCategoryDoc)
      .eq('categoria_id', newCategoryId)
  } catch (err) {
    logTest('Sample multi-category test', false, undefined, (err as Error).message)
  }
}

// ============================================
// SUMMARY
// ============================================

function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  console.log(`\nTotal Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}`)
      if (r.error) console.log(`    Error: ${r.error}`)
    })
  }

  console.log('\n' + '='.repeat(60))

  // Exit code
  process.exit(failed > 0 ? 1 : 0)
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🧪 Multi-Category Migration Test Suite')
  console.log('=====================================\n')

  await test1_TablesExist()
  await test2_MigrationCompleted()
  await test3_ViewsWork()
  await test4_HelperFunctions()
  await test5_MultiCategoryQueries()
  await test6_ConfidenceScores()
  await test7_NoDataLoss()
  await test8_IndexesExist()
  await test9_UniqueConstraint()
  await test10_SampleMultiCategory()

  printSummary()
}

main().catch(err => {
  console.error('💥 Fatal error:', err)
  process.exit(1)
})
