/**
 * Test de conexión a Supabase
 *
 * Este script verifica que la conexión a Supabase funciona correctamente
 * y que las categorías se pueden leer desde la base de datos.
 *
 * Para ejecutar:
 * npx tsx test/supabase-test.ts
 */

// Load environment variables from .env file
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: resolve(__dirname, '../.env') })

// Import direct Supabase client for testing
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

async function testSupabase() {
  console.log('🧪 Testing Supabase connection...\n')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Supabase credentials not found in .env file')
    console.error('💡 Make sure your .env file contains:')
    console.error('   SUPABASE_URL=https://your-project.supabase.co')
    console.error('   SUPABASE_ANON_KEY=your-anon-key\n')
    process.exit(1)
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test connection by fetching categories
    const { data: categorias, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('activa', true)
      .order('prioridad', { ascending: false })

    if (error) {
      throw error
    }

    if (categorias && categorias.length === 12) {
      console.log('✅ Supabase connected successfully!')
      console.log(`📋 Categorías encontradas: ${categorias.length}\n`)

      categorias.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.icono} ${cat.nombre}`)
        console.log(`      - Prioridad: ${cat.prioridad}`)
        console.log(`      - Slug: ${cat.slug}`)
        console.log(`      - Color: ${cat.color}`)
        console.log('')
      })

      console.log('✨ Test completado exitosamente!\n')
      process.exit(0)
    } else {
      console.error(`❌ Error: Expected 12 categorias, got ${categorias?.length || 0}`)
      console.error('Verifica que ejecutaste el schema.sql correctamente\n')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error connecting to Supabase:')
    console.error(error)
    console.error('\n💡 Tips:')
    console.error('   1. Verifica que SUPABASE_URL está configurada en .env')
    console.error('   2. Verifica que SUPABASE_ANON_KEY está configurada en .env')
    console.error('   3. Verifica que ejecutaste el schema.sql en Supabase')
    console.error('   4. Verifica que el proyecto Supabase no está pausado\n')
    process.exit(1)
  }
}

// Ejecutar test
testSupabase()
