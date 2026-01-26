/**
 * Script to Re-classify Existing Documents with Multi-Category Support
 *
 * This script finds documents that could belong to multiple categories
 * based on keywords in their title and metadata, and assigns them
 * multiple categories with confidence scores.
 *
 * Usage:
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npm run reclassify
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
// CATEGORY KEYWORD PATTERNS
// Based on phase-1-classification-redesign.md
// ============================================

const CATEGORY_KEYWORDS = {
  oposiciones: {
    id: null as string | null, // Will be filled from DB
    keywords: ['oposición', 'oposicion', 'convocatoria', 'plazas', 'concurso', 'prueba selectiva', 'funcionario'],
    weight: 1.0
  },
  ayudas: {
    id: null as string | null,
    keywords: ['ayuda', 'subvención', 'subvencion', 'beca', 'incentivo', 'bonificación', 'bonificacion'],
    weight: 1.0
  },
  legislacion: {
    id: null as string | null,
    keywords: ['ley', 'real decreto', 'decreto legislativo', 'norma', 'reglamento', 'modifica'],
    weight: 1.0
  },
  educacion: {
    id: null as string | null,
    keywords: ['educación', 'educacion', 'universidad', 'formación', 'formacion', 'enseñanza', 'enseñanza', 'profesor', 'alumno', 'estudiante'],
    weight: 0.8
  },
  empleo: {
    id: null as string | null,
    keywords: ['empleo', 'trabajo', 'convenio colectivo', 'salario', 'contrato', 'laboral', 'trabajador'],
    weight: 0.8
  },
  'medio-ambiente': {
    id: null as string | null,
    keywords: ['medio ambiente', 'medioambiental', 'sostenibilidad', 'renovable', 'energía', 'energia', 'ecológico', 'ecologico'],
    weight: 0.8
  },
  vivienda: {
    id: null as string | null,
    keywords: ['vivienda', 'alquiler', 'hipoteca', 'rehabilitación', 'rehabilitacion', 'edificación', 'edificacion'],
    weight: 0.8
  },
  salud: {
    id: null as string | null,
    keywords: ['salud', 'sanitario', 'médico', 'medico', 'hospital', 'farmacia', 'medicamento'],
    weight: 0.8
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function loadCategoryIds() {
  console.log('📋 Loading category IDs...')

  const { data: categorias, error } = await supabase
    .from('categorias')
    .select('id, slug')

  if (error || !categorias) {
    console.error('❌ Error loading categories:', error)
    return false
  }

  for (const cat of categorias) {
    if (CATEGORY_KEYWORDS[cat.slug as keyof typeof CATEGORY_KEYWORDS]) {
      CATEGORY_KEYWORDS[cat.slug as keyof typeof CATEGORY_KEYWORDS].id = cat.id
    }
  }

  console.log(`✅ Loaded ${categorias.length} categories`)
  return true
}

function calculateCategoryScore(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase()
  let matches = 0

  for (const keyword of keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matches++
    }
  }

  // Score is percentage of keywords matched
  return keywords.length > 0 ? matches / keywords.length : 0
}

async function analyzeDocument(doc: any) {
  const searchText = `${doc.titulo} ${doc.departamento || ''} ${doc.seccion || ''}`

  const scores: Array<{
    categoria_id: string
    slug: string
    score: number
    confidence: number
  }> = []

  // Calculate score for each category
  for (const [slug, config] of Object.entries(CATEGORY_KEYWORDS)) {
    if (!config.id) continue

    const score = calculateCategoryScore(searchText, config.keywords)

    if (score > 0) {
      scores.push({
        categoria_id: config.id,
        slug,
        score,
        confidence: Math.min(score * config.weight, 1.0)
      })
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score)

  return scores
}

async function assignMultipleCategories(documentId: string, categorias: Array<{
  categoria_id: string
  slug: string
  confidence: number
}>) {
  // First, check if there are existing assignments
  const { data: existing } = await supabase
    .from('documento_categorias')
    .select('categoria_id')
    .eq('documento_id', documentId)

  const existingCategoryIds = new Set((existing || []).map(e => e.categoria_id))

  // Insert new categories (skip if already exists)
  const newAssignments = categorias
    .filter(cat => !existingCategoryIds.has(cat.categoria_id))
    .map(cat => ({
      documento_id: documentId,
      categoria_id: cat.categoria_id,
      confidence: cat.confidence,
      clasificacion_metodo: 'keyword' as const,
      razonamiento: `Multi-category classification based on keyword matching (${cat.slug})`
    }))

  if (newAssignments.length === 0) {
    return { added: 0, skipped: existingCategoryIds.size }
  }

  const { error } = await supabase
    .from('documento_categorias')
    .insert(newAssignments)

  if (error) {
    console.error(`  ❌ Error assigning categories to ${documentId}:`, error.message)
    return { added: 0, skipped: existingCategoryIds.size }
  }

  return { added: newAssignments.length, skipped: existingCategoryIds.size }
}

// ============================================
// MAIN LOGIC
// ============================================

async function reclassifyDocuments(options: {
  limit?: number
  minConfidence?: number
  minCategories?: number
  dryRun?: boolean
}) {
  const {
    limit = 100,
    minConfidence = 0.3,
    minCategories = 2,
    dryRun = false
  } = options

  console.log('\n🔄 Re-classifying Documents with Multi-Category Support')
  console.log('=' .repeat(60))
  console.log(`Settings:`)
  console.log(`  - Limit: ${limit} documents`)
  console.log(`  - Min confidence: ${minConfidence}`)
  console.log(`  - Min categories: ${minCategories}`)
  console.log(`  - Dry run: ${dryRun ? 'YES (no changes)' : 'NO (will update DB)'}`)
  console.log('=' .repeat(60) + '\n')

  // Load category IDs
  const loaded = await loadCategoryIds()
  if (!loaded) {
    console.error('Failed to load category IDs')
    return
  }

  // Fetch documents
  console.log(`\n📥 Fetching ${limit} documents...`)
  const { data: documentos, error: fetchError } = await supabase
    .from('documentos_boe')
    .select('id, titulo, departamento, seccion, rango')
    .eq('procesado', true)
    .order('fecha_publicacion', { ascending: false })
    .limit(limit)

  if (fetchError || !documentos) {
    console.error('❌ Error fetching documents:', fetchError)
    return
  }

  console.log(`✅ Fetched ${documentos.length} documents\n`)

  // Analyze and classify
  let processed = 0
  let multiCategoryCount = 0
  let totalAdded = 0
  let totalSkipped = 0

  for (const doc of documentos) {
    const scores = await analyzeDocument(doc)

    // Filter by confidence and take top categories
    const validCategories = scores.filter(s => s.confidence >= minConfidence)

    if (validCategories.length >= minCategories) {
      processed++
      multiCategoryCount++

      console.log(`\n📄 Document ${processed}/${documentos.length}:`)
      console.log(`   Título: ${doc.titulo.substring(0, 80)}...`)
      console.log(`   Found ${validCategories.length} categories:`)

      for (const cat of validCategories) {
        console.log(`     - ${cat.slug} (confidence: ${(cat.confidence * 100).toFixed(0)}%)`)
      }

      if (!dryRun) {
        const result = await assignMultipleCategories(doc.id, validCategories)
        totalAdded += result.added
        totalSkipped += result.skipped

        if (result.added > 0) {
          console.log(`   ✅ Added ${result.added} new categories (${result.skipped} already existed)`)
        } else {
          console.log(`   ℹ️  All categories already assigned`)
        }
      } else {
        console.log(`   [DRY RUN - would add ${validCategories.length} categories]`)
      }
    } else if (validCategories.length > 0) {
      processed++
      console.log(`\n📄 Document ${processed}/${documentos.length}: Only ${validCategories.length} category (below min ${minCategories})`)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total documents analyzed: ${documentos.length}`)
  console.log(`Documents with ${minCategories}+ categories: ${multiCategoryCount}`)
  console.log(`Percentage: ${((multiCategoryCount / documentos.length) * 100).toFixed(1)}%`)

  if (!dryRun) {
    console.log(`\nDatabase changes:`)
    console.log(`  ✅ New assignments added: ${totalAdded}`)
    console.log(`  ℹ️  Already existed: ${totalSkipped}`)
  } else {
    console.log(`\n⚠️  DRY RUN - No changes made to database`)
    console.log(`   Run without --dry-run to apply changes`)
  }
  console.log('='.repeat(60) + '\n')
}

// ============================================
// CLI EXECUTION
// ============================================

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const limitArg = args.find(a => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 100

reclassifyDocuments({
  limit,
  minConfidence: 0.3,
  minCategories: 2,
  dryRun: isDryRun
}).catch(err => {
  console.error('💥 Fatal error:', err)
  process.exit(1)
})
