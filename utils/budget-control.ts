/**
 * CONTROL DE PRESUPUESTO PARA PROCESAMIENTO LLM
 *
 * Sistema de control de costes con límites diarios, semanales y mensuales.
 * Pausa automáticamente el procesamiento cuando se excede el presupuesto.
 */

import { createClient } from '@supabase/supabase-js'

// ================================================================
// TIPOS
// ================================================================

export interface BudgetStatus {
  canProcess: boolean
  remainingDaily: number
  remainingWeekly: number
  remainingMonthly: number
  remainingTotal: number // El mínimo de los tres
  percentUsedDaily: number
  percentUsedWeekly: number
  percentUsedMonthly: number
  processingActive: boolean
  reason?: string
  warning?: string
}

export interface BudgetLimits {
  limite_diario: number
  limite_semanal: number
  limite_mensual: number
}

export interface BudgetSpending {
  gasto_dia_actual: number
  gasto_semana_actual: number
  gasto_mes_actual: number
}

// ================================================================
// CONFIGURACIÓN
// ================================================================

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Warning thresholds
const WARNING_THRESHOLD_PERCENT = 80 // Advertir cuando se use el 80% del presupuesto

// ================================================================
// FUNCIONES PRINCIPALES
// ================================================================

/**
 * Verifica si hay presupuesto suficiente para procesar
 * y resetea automáticamente los contadores según el periodo
 *
 * @param estimatedCost Coste estimado de la operación en USD
 * @returns Estado del presupuesto y si se puede procesar
 */
export async function checkBudget(estimatedCost: number = 0): Promise<BudgetStatus> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // 1. Ejecutar función de reset automático
  await supabase.rpc('reset_budget_if_needed')

  // 2. Obtener estado actual del presupuesto
  const { data: budget, error } = await supabase
    .from('presupuesto_control')
    .select('*')
    .limit(1)
    .single()

  if (error || !budget) {
    throw new Error(`Error fetching budget: ${error?.message}`)
  }

  // 3. Calcular presupuesto restante
  const remainingDaily = Math.max(0, budget.limite_diario - budget.gasto_dia_actual)
  const remainingWeekly = Math.max(0, budget.limite_semanal - budget.gasto_semana_actual)
  const remainingMonthly = Math.max(0, budget.limite_mensual - budget.gasto_mes_actual)
  const remainingTotal = Math.min(remainingDaily, remainingWeekly, remainingMonthly)

  // 4. Calcular porcentajes de uso
  const percentUsedDaily = budget.limite_diario > 0
    ? (budget.gasto_dia_actual / budget.limite_diario) * 100
    : 0
  const percentUsedWeekly = budget.limite_semanal > 0
    ? (budget.gasto_semana_actual / budget.limite_semanal) * 100
    : 0
  const percentUsedMonthly = budget.limite_mensual > 0
    ? (budget.gasto_mes_actual / budget.limite_mensual) * 100
    : 0

  // 5. Determinar si se puede procesar
  let canProcess = budget.procesamiento_activo
  let reason: string | undefined
  let warning: string | undefined

  if (!budget.procesamiento_activo) {
    canProcess = false
    reason = budget.razon_pausa || 'Procesamiento pausado manualmente'
  } else if (remainingTotal <= 0) {
    canProcess = false
    // Identificar qué límite se excedió
    if (remainingDaily <= 0) reason = 'Límite diario alcanzado'
    else if (remainingWeekly <= 0) reason = 'Límite semanal alcanzado'
    else if (remainingMonthly <= 0) reason = 'Límite mensual alcanzado'
  } else if (estimatedCost > remainingTotal) {
    canProcess = false
    reason = `Coste estimado ($${estimatedCost.toFixed(4)}) excede presupuesto restante ($${remainingTotal.toFixed(4)})`
  }

  // 6. Advertencias si se acerca al límite
  const maxPercentUsed = Math.max(percentUsedDaily, percentUsedWeekly, percentUsedMonthly)
  if (canProcess && maxPercentUsed >= WARNING_THRESHOLD_PERCENT) {
    warning = `⚠️ Advertencia: Se ha usado el ${maxPercentUsed.toFixed(1)}% del presupuesto`
  }

  return {
    canProcess,
    remainingDaily,
    remainingWeekly,
    remainingMonthly,
    remainingTotal,
    percentUsedDaily,
    percentUsedWeekly,
    percentUsedMonthly,
    processingActive: budget.procesamiento_activo,
    reason,
    warning,
  }
}

/**
 * Registra un coste real de procesamiento
 * Actualiza los contadores diarios, semanales y mensuales
 *
 * @param cost Coste real en USD
 * @returns true si se registró correctamente
 */
export async function recordCost(cost: number): Promise<boolean> {
  if (cost <= 0) return true // No registrar costes negativos o cero

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Obtener presupuesto actual
  const { data: budget, error: fetchError } = await supabase
    .from('presupuesto_control')
    .select('*')
    .limit(1)
    .single()

  if (fetchError || !budget) {
    console.error('Error fetching budget for cost recording:', fetchError)
    return false
  }

  // Actualizar gastos
  const { error: updateError } = await supabase
    .from('presupuesto_control')
    .update({
      gasto_dia_actual: budget.gasto_dia_actual + cost,
      gasto_semana_actual: budget.gasto_semana_actual + cost,
      gasto_mes_actual: budget.gasto_mes_actual + cost,
    })
    .eq('id', budget.id)

  if (updateError) {
    console.error('Error recording cost:', updateError)
    return false
  }

  console.log(`💵 Coste registrado: $${cost.toFixed(4)} USD`)

  // Verificar si se excedió el presupuesto después de registrar
  const status = await checkBudget()
  if (!status.canProcess && status.processingActive) {
    // Auto-pausar si se excedió el presupuesto
    await pauseProcessing(status.reason || 'Presupuesto excedido')
    console.log(`⏸️ Procesamiento pausado automáticamente: ${status.reason}`)
  }

  return true
}

/**
 * Pausa el procesamiento con una razón específica
 *
 * @param reason Razón de la pausa
 */
export async function pauseProcessing(reason: string): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { error } = await supabase
    .from('presupuesto_control')
    .update({
      procesamiento_activo: false,
      razon_pausa: reason,
      pausado_en: new Date().toISOString(),
    })
    .limit(1)

  if (error) {
    throw new Error(`Error pausing processing: ${error.message}`)
  }

  console.log(`⏸️ Procesamiento pausado: ${reason}`)
}

/**
 * Reanuda el procesamiento (manual)
 */
export async function resumeProcessing(): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Verificar que hay presupuesto disponible
  const status = await checkBudget()
  if (status.remainingTotal <= 0) {
    throw new Error('No se puede reanudar: presupuesto agotado')
  }

  const { error } = await supabase
    .from('presupuesto_control')
    .update({
      procesamiento_activo: true,
      razon_pausa: null,
      pausado_en: null,
    })
    .limit(1)

  if (error) {
    throw new Error(`Error resuming processing: ${error.message}`)
  }

  console.log('▶️ Procesamiento reanudado')
}

/**
 * Resetea manualmente un periodo específico
 *
 * @param period 'daily' | 'weekly' | 'monthly'
 */
export async function resetBudget(period: 'daily' | 'weekly' | 'monthly'): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const updates: any = {}
  const today = new Date().toISOString().split('T')[0]

  switch (period) {
    case 'daily':
      updates.gasto_dia_actual = 0
      updates.ultimo_reset_diario = today
      break
    case 'weekly':
      updates.gasto_semana_actual = 0
      updates.ultimo_reset_semanal = today
      break
    case 'monthly':
      updates.gasto_mes_actual = 0
      updates.ultimo_reset_mensual = today
      break
  }

  const { error } = await supabase
    .from('presupuesto_control')
    .update(updates)
    .limit(1)

  if (error) {
    throw new Error(`Error resetting budget: ${error.message}`)
  }

  console.log(`🔄 Presupuesto ${period} reseteado manualmente`)
}

/**
 * Actualiza los límites de presupuesto
 *
 * @param limits Nuevos límites en USD
 */
export async function updateBudgetLimits(limits: Partial<BudgetLimits>): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { error } = await supabase
    .from('presupuesto_control')
    .update(limits)
    .limit(1)

  if (error) {
    throw new Error(`Error updating budget limits: ${error.message}`)
  }

  console.log('✅ Límites de presupuesto actualizados:', limits)
}

/**
 * Obtiene el estado completo del presupuesto (para dashboard)
 */
export async function getBudgetStatus(): Promise<{
  limits: BudgetLimits
  spending: BudgetSpending
  status: BudgetStatus
}> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data: budget, error } = await supabase
    .from('presupuesto_control')
    .select('*')
    .limit(1)
    .single()

  if (error || !budget) {
    throw new Error(`Error fetching budget status: ${error?.message}`)
  }

  const status = await checkBudget()

  return {
    limits: {
      limite_diario: budget.limite_diario,
      limite_semanal: budget.limite_semanal,
      limite_mensual: budget.limite_mensual,
    },
    spending: {
      gasto_dia_actual: budget.gasto_dia_actual,
      gasto_semana_actual: budget.gasto_semana_actual,
      gasto_mes_actual: budget.gasto_mes_actual,
    },
    status,
  }
}

// ================================================================
// HELPERS
// ================================================================

/**
 * Formatea un coste en USD
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)} USD`
}

/**
 * Formatea un porcentaje
 */
export function formatPercent(percent: number): string {
  return `${percent.toFixed(1)}%`
}
