#!/usr/bin/env tsx
/**
 * Script para ver el estado actual del presupuesto
 *
 * Uso:
 * npx tsx scripts/check-budget-status.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env') })

import { getBudgetStatus, formatCost, formatPercent } from '../utils/budget-control'

async function main() {
  console.log('💰 Estado del Presupuesto\n')
  console.log('='.repeat(50))

  const { limits, spending, status } = await getBudgetStatus()

  // LÍMITES
  console.log('\n📊 LÍMITES CONFIGURADOS:')
  console.log(`   Diario:  ${formatCost(limits.limite_diario)}`)
  console.log(`   Semanal: ${formatCost(limits.limite_semanal)}`)
  console.log(`   Mensual: ${formatCost(limits.limite_mensual)}`)

  // GASTOS ACTUALES
  console.log('\n💸 GASTOS ACTUALES:')
  console.log(`   Hoy:     ${formatCost(spending.gasto_dia_actual)} de ${formatCost(limits.limite_diario)} (${formatPercent(status.percentUsedDaily)})`)
  console.log(`   Semana:  ${formatCost(spending.gasto_semana_actual)} de ${formatCost(limits.limite_semanal)} (${formatPercent(status.percentUsedWeekly)})`)
  console.log(`   Mes:     ${formatCost(spending.gasto_mes_actual)} de ${formatCost(limits.limite_mensual)} (${formatPercent(status.percentUsedMonthly)})`)

  // PRESUPUESTO RESTANTE
  console.log('\n✅ PRESUPUESTO RESTANTE:')
  console.log(`   Hoy:     ${formatCost(status.remainingDaily)}`)
  console.log(`   Semana:  ${formatCost(status.remainingWeekly)}`)
  console.log(`   Mes:     ${formatCost(status.remainingMonthly)}`)

  // ESTADO
  console.log('\n🚦 ESTADO:')
  if (status.canProcess) {
    console.log('   ✅ Procesamiento ACTIVO - Puede procesar')
    if (status.warning) {
      console.log(`   ${status.warning}`)
    }
  } else {
    console.log('   ⏸️ Procesamiento PAUSADO')
    console.log(`   Razón: ${status.reason}`)
  }

  console.log('\n' + '='.repeat(50))
}

main().catch(console.error)
