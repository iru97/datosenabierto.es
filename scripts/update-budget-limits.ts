#!/usr/bin/env tsx
/**
 * Script para actualizar límites de presupuesto
 *
 * Uso:
 * npx tsx scripts/update-budget-limits.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env') })

import { updateBudgetLimits, getBudgetStatus } from '../utils/budget-control'

async function main() {
  console.log('🎯 Actualizando límites de presupuesto...\n')

  // Ver límites actuales
  console.log('📊 Límites actuales:')
  const currentStatus = await getBudgetStatus()
  console.log(`   - Diario:  $${currentStatus.limits.limite_diario}`)
  console.log(`   - Semanal: $${currentStatus.limits.limite_semanal}`)
  console.log(`   - Mensual: $${currentStatus.limits.limite_mensual}`)
  console.log('')

  // Actualizar límites
  // 💡 CAMBIA ESTOS VALORES SEGÚN TU PRESUPUESTO
  const newLimits = {
    limite_diario: 10.00,   // ← Cambia aquí
    limite_semanal: 50.00,  // ← Cambia aquí
    limite_mensual: 150.00, // ← Cambia aquí
  }

  await updateBudgetLimits(newLimits)

  // Verificar nuevos límites
  console.log('✅ Límites actualizados:')
  const newStatus = await getBudgetStatus()
  console.log(`   - Diario:  $${newStatus.limits.limite_diario}`)
  console.log(`   - Semanal: $${newStatus.limits.limite_semanal}`)
  console.log(`   - Mensual: $${newStatus.limits.limite_mensual}`)
  console.log('')

  console.log('🎉 Actualización completada!')
}

main().catch(console.error)
