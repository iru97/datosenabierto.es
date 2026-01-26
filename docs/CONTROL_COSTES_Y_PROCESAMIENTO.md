# 💰 Sistema de Control de Costes y Procesamiento Resiliente

**Versión:** 1.0
**Fecha:** 24 Nov 2025
**Estado:** Arquitectura propuesta

---

## 🎯 OBJETIVO

Diseñar un sistema que:
1. ✅ **Controle el presupuesto** en tiempo real
2. ✅ **Pare automáticamente** si se acaba el dinero
3. ✅ **Reanude correctamente** donde se quedó
4. ✅ **No reprocese** documentos ya existentes
5. ✅ **Priorice** lo más importante primero

---

## 📊 ARQUITECTURA DE CONTROL DE COSTES

### 1. TABLA DE PRESUPUESTO

```sql
-- Nueva tabla en Supabase
CREATE TABLE presupuesto_control (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Límites configurables
  limite_diario DECIMAL(10,2) DEFAULT 10.00,    -- $10/día
  limite_semanal DECIMAL(10,2) DEFAULT 50.00,   -- $50/semana
  limite_mensual DECIMAL(10,2) DEFAULT 200.00,  -- $200/mes

  -- Gastos actuales
  gasto_dia_actual DECIMAL(10,2) DEFAULT 0.00,
  gasto_semana_actual DECIMAL(10,2) DEFAULT 0.00,
  gasto_mes_actual DECIMAL(10,2) DEFAULT 0.00,

  -- Control temporal
  fecha_dia DATE DEFAULT CURRENT_DATE,
  fecha_semana_inicio DATE,
  fecha_mes_inicio DATE,

  -- Estado
  procesamiento_activo BOOLEAN DEFAULT true,
  razon_pausa TEXT,

  -- Metadata
  ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_presupuesto_fecha_dia ON presupuesto_control(fecha_dia);
CREATE INDEX idx_presupuesto_activo ON presupuesto_control(procesamiento_activo);

-- Insertar configuración inicial
INSERT INTO presupuesto_control (
  limite_diario,
  limite_semanal,
  limite_mensual,
  fecha_semana_inicio,
  fecha_mes_inicio
) VALUES (
  10.00,
  50.00,
  200.00,
  DATE_TRUNC('week', CURRENT_DATE),
  DATE_TRUNC('month', CURRENT_DATE)
);
```

### 2. TABLA DE COLA DE PROCESAMIENTO

```sql
-- Cola de documentos pendientes
CREATE TABLE cola_procesamiento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Documento
  boe_id VARCHAR(100) NOT NULL,
  fecha_publicacion DATE NOT NULL,
  titulo TEXT NOT NULL,
  categoria_id UUID REFERENCES categorias(id),

  -- Estado
  estado VARCHAR(20) DEFAULT 'pendiente',
    -- 'pendiente', 'procesando', 'completado', 'error', 'pausado'
  nivel_procesamiento INTEGER DEFAULT 1,
    -- 1: Clasificación, 2: Extracción, 3: LLM

  -- Prioridad
  prioridad INTEGER DEFAULT 0,
    -- 0: Normal, 1: Alta (P3), 2: Urgente (demanda usuario)
  intentos INTEGER DEFAULT 0,
  max_intentos INTEGER DEFAULT 3,

  -- Costes
  costo_estimado DECIMAL(10,4) DEFAULT 0.0000,
  costo_real DECIMAL(10,4),

  -- Metadata
  error_mensaje TEXT,
  fecha_agregado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_inicio_proceso TIMESTAMP WITH TIME ZONE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  procesado_por VARCHAR(100),  -- Nombre de la función

  -- Constraints
  UNIQUE(boe_id, nivel_procesamiento)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_cola_estado ON cola_procesamiento(estado);
CREATE INDEX idx_cola_prioridad ON cola_procesamiento(prioridad DESC, fecha_agregado ASC);
CREATE INDEX idx_cola_boe_id ON cola_procesamiento(boe_id);
CREATE INDEX idx_cola_categoria ON cola_procesamiento(categoria_id);
```

### 3. TABLA DE CHECKPOINTS

```sql
-- Checkpoints de procesamiento batch
CREATE TABLE procesamiento_checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identificación del batch
  tipo_batch VARCHAR(20) NOT NULL,  -- 'mensual', 'semanal', 'on-demand'
  fecha_batch_inicio DATE NOT NULL,
  fecha_batch_fin DATE NOT NULL,

  -- Progreso
  total_documentos INTEGER NOT NULL,
  documentos_procesados INTEGER DEFAULT 0,
  documentos_fallidos INTEGER DEFAULT 0,
  documentos_saltados INTEGER DEFAULT 0,

  -- Estado
  estado VARCHAR(20) DEFAULT 'en_progreso',
    -- 'en_progreso', 'pausado', 'completado', 'cancelado'
  categoria_actual VARCHAR(100),
  ultimo_doc_procesado VARCHAR(100),

  -- Costes
  costo_acumulado DECIMAL(10,4) DEFAULT 0.0000,
  costo_estimado_restante DECIMAL(10,4),

  -- Control
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_pausa TIMESTAMP WITH TIME ZONE,
  fecha_reanudacion TIMESTAMP WITH TIME ZONE,
  fecha_completado TIMESTAMP WITH TIME ZONE,

  -- Metadata
  razon_pausa TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_checkpoint_tipo ON procesamiento_checkpoints(tipo_batch);
CREATE INDEX idx_checkpoint_estado ON procesamiento_checkpoints(estado);
CREATE INDEX idx_checkpoint_fecha ON procesamiento_checkpoints(fecha_inicio DESC);
```

---

## 🔄 FLUJO DE PROCESAMIENTO CON CONTROL DE COSTES

### PASO 1: Verificar Presupuesto Antes de Procesar

```typescript
// utils/budget-control.ts

interface BudgetStatus {
  canProcess: boolean
  reason?: string
  remainingDaily: number
  remainingWeekly: number
  remainingMonthly: number
}

export async function checkBudget(
  estimatedCost: number = 0
): Promise<BudgetStatus> {
  const { data: budget } = await supabase
    .from('presupuesto_control')
    .select('*')
    .single()

  if (!budget) {
    return {
      canProcess: false,
      reason: 'No budget configuration found',
      remainingDaily: 0,
      remainingWeekly: 0,
      remainingMonthly: 0,
    }
  }

  // Verificar si el procesamiento está activo
  if (!budget.procesamiento_activo) {
    return {
      canProcess: false,
      reason: budget.razon_pausa || 'Processing paused by admin',
      remainingDaily: 0,
      remainingWeekly: 0,
      remainingMonthly: 0,
    }
  }

  // Resetear contadores si cambió el período
  const hoy = new Date().toISOString().split('T')[0]

  if (budget.fecha_dia !== hoy) {
    // Nuevo día, resetear contador diario
    await supabase
      .from('presupuesto_control')
      .update({
        gasto_dia_actual: 0,
        fecha_dia: hoy,
      })
      .eq('id', budget.id)

    budget.gasto_dia_actual = 0
  }

  // Calcular presupuestos restantes
  const remainingDaily = budget.limite_diario - budget.gasto_dia_actual
  const remainingWeekly = budget.limite_semanal - budget.gasto_semana_actual
  const remainingMonthly = budget.limite_mensual - budget.gasto_mes_actual

  // Verificar si hay suficiente presupuesto
  const minRemaining = Math.min(remainingDaily, remainingWeekly, remainingMonthly)

  if (minRemaining <= 0) {
    const reason =
      remainingDaily <= 0 ? 'Daily budget exhausted' :
      remainingWeekly <= 0 ? 'Weekly budget exhausted' :
      'Monthly budget exhausted'

    // Pausar procesamiento automáticamente
    await supabase
      .from('presupuesto_control')
      .update({
        procesamiento_activo: false,
        razon_pausa: reason,
      })
      .eq('id', budget.id)

    return {
      canProcess: false,
      reason,
      remainingDaily,
      remainingWeekly,
      remainingMonthly,
    }
  }

  // Verificar si el costo estimado cabe en el presupuesto
  if (estimatedCost > minRemaining) {
    return {
      canProcess: false,
      reason: `Estimated cost ($${estimatedCost.toFixed(4)}) exceeds remaining budget ($${minRemaining.toFixed(4)})`,
      remainingDaily,
      remainingWeekly,
      remainingMonthly,
    }
  }

  return {
    canProcess: true,
    remainingDaily,
    remainingWeekly,
    remainingMonthly,
  }
}

/**
 * Registra el gasto de una operación LLM
 */
export async function recordCost(cost: number): Promise<void> {
  const { data: budget } = await supabase
    .from('presupuesto_control')
    .select('*')
    .single()

  if (!budget) return

  await supabase
    .from('presupuesto_control')
    .update({
      gasto_dia_actual: budget.gasto_dia_actual + cost,
      gasto_semana_actual: budget.gasto_semana_actual + cost,
      gasto_mes_actual: budget.gasto_mes_actual + cost,
      ultima_actualizacion: new Date().toISOString(),
    })
    .eq('id', budget.id)
}

/**
 * Resetea el presupuesto manualmente (para testing o nueva recarga)
 */
export async function resetBudget(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<void> {
  const updates: any = {
    procesamiento_activo: true,
    razon_pausa: null,
  }

  if (period === 'daily' || period === 'weekly' || period === 'monthly') {
    updates.gasto_dia_actual = 0
  }

  if (period === 'weekly' || period === 'monthly') {
    updates.gasto_semana_actual = 0
  }

  if (period === 'monthly') {
    updates.gasto_mes_actual = 0
  }

  await supabase
    .from('presupuesto_control')
    .update(updates)
    .eq('id', (await supabase.from('presupuesto_control').select('id').single()).data!.id)
}
```

### PASO 2: Sistema de Cola con Prioridades

```typescript
// utils/processing-queue.ts

interface QueueItem {
  boe_id: string
  fecha_publicacion: string
  titulo: string
  categoria_id: string
  nivel_procesamiento: 1 | 2 | 3
  prioridad: 0 | 1 | 2
  costo_estimado: number
}

/**
 * Agrega documento a la cola si no existe
 */
export async function addToQueue(item: QueueItem): Promise<boolean> {
  // Verificar si ya existe en la cola
  const { data: existing } = await supabase
    .from('cola_procesamiento')
    .select('id')
    .eq('boe_id', item.boe_id)
    .eq('nivel_procesamiento', item.nivel_procesamiento)
    .single()

  if (existing) {
    console.log(`📋 Doc ${item.boe_id} nivel ${item.nivel_procesamiento} ya en cola`)
    return false
  }

  // Verificar si ya está procesado en documentos_boe
  if (item.nivel_procesamiento === 1) {
    const { data: processed } = await supabase
      .from('documentos_boe')
      .select('id')
      .eq('boe_id', item.boe_id)
      .single()

    if (processed) {
      console.log(`✅ Doc ${item.boe_id} ya procesado en nivel 1`)
      return false
    }
  }

  // Agregar a cola
  await supabase
    .from('cola_procesamiento')
    .insert({
      boe_id: item.boe_id,
      fecha_publicacion: item.fecha_publicacion,
      titulo: item.titulo,
      categoria_id: item.categoria_id,
      nivel_procesamiento: item.nivel_procesamiento,
      prioridad: item.prioridad,
      costo_estimado: item.costo_estimado,
      estado: 'pendiente',
    })

  console.log(`➕ Doc ${item.boe_id} agregado a cola nivel ${item.nivel_procesamiento}`)
  return true
}

/**
 * Obtiene siguiente lote de documentos a procesar
 */
export async function getNextBatch(
  batchSize: number = 10,
  maxCost: number = 1.0
): Promise<QueueItem[]> {
  // Obtener documentos pendientes ordenados por prioridad
  const { data: items } = await supabase
    .from('cola_procesamiento')
    .select('*')
    .eq('estado', 'pendiente')
    .order('prioridad', { ascending: false })
    .order('fecha_agregado', { ascending: true })
    .limit(batchSize * 2)  // Traer más para filtrar por costo

  if (!items || items.length === 0) return []

  // Filtrar por costo acumulado
  const batch: QueueItem[] = []
  let costAccumulated = 0

  for (const item of items) {
    if (batch.length >= batchSize) break
    if (costAccumulated + item.costo_estimado > maxCost) break

    batch.push(item)
    costAccumulated += item.costo_estimado
  }

  return batch
}

/**
 * Marca documento como en proceso
 */
export async function markAsProcessing(boeId: string, nivel: number, functionName: string): Promise<void> {
  await supabase
    .from('cola_procesamiento')
    .update({
      estado: 'procesando',
      fecha_inicio_proceso: new Date().toISOString(),
      procesado_por: functionName,
    })
    .eq('boe_id', boeId)
    .eq('nivel_procesamiento', nivel)
}

/**
 * Marca documento como completado
 */
export async function markAsCompleted(
  boeId: string,
  nivel: number,
  actualCost: number
): Promise<void> {
  await supabase
    .from('cola_procesamiento')
    .update({
      estado: 'completado',
      fecha_completado: new Date().toISOString(),
      costo_real: actualCost,
    })
    .eq('boe_id', boeId)
    .eq('nivel_procesamiento', nivel)

  // Registrar costo en presupuesto
  await recordCost(actualCost)
}

/**
 * Marca documento como error
 */
export async function markAsError(
  boeId: string,
  nivel: number,
  errorMessage: string
): Promise<void> {
  const { data: item } = await supabase
    .from('cola_procesamiento')
    .select('intentos, max_intentos')
    .eq('boe_id', boeId)
    .eq('nivel_procesamiento', nivel)
    .single()

  const intentos = (item?.intentos || 0) + 1
  const estado = intentos >= (item?.max_intentos || 3) ? 'error' : 'pendiente'

  await supabase
    .from('cola_procesamiento')
    .update({
      estado,
      intentos,
      error_mensaje: errorMessage,
      fecha_inicio_proceso: null,
    })
    .eq('boe_id', boeId)
    .eq('nivel_procesamiento', nivel)
}
```

### PASO 3: Checkpoints en Batch Processing

```typescript
// utils/checkpoint-manager.ts

interface CheckpointData {
  tipo_batch: 'mensual' | 'semanal' | 'on-demand'
  fecha_batch_inicio: string
  fecha_batch_fin: string
  total_documentos: number
}

/**
 * Crea o recupera checkpoint existente
 */
export async function getOrCreateCheckpoint(
  data: CheckpointData
): Promise<string> {
  // Buscar checkpoint existente no completado
  const { data: existing } = await supabase
    .from('procesamiento_checkpoints')
    .select('*')
    .eq('tipo_batch', data.tipo_batch)
    .eq('fecha_batch_inicio', data.fecha_batch_inicio)
    .eq('fecha_batch_fin', data.fecha_batch_fin)
    .in('estado', ['en_progreso', 'pausado'])
    .order('fecha_inicio', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    console.log(`♻️ Reanudando checkpoint existente: ${existing.id}`)

    // Si estaba pausado, reanudar
    if (existing.estado === 'pausado') {
      await supabase
        .from('procesamiento_checkpoints')
        .update({
          estado: 'en_progreso',
          fecha_reanudacion: new Date().toISOString(),
        })
        .eq('id', existing.id)
    }

    return existing.id
  }

  // Crear nuevo checkpoint
  const { data: newCheckpoint } = await supabase
    .from('procesamiento_checkpoints')
    .insert({
      tipo_batch: data.tipo_batch,
      fecha_batch_inicio: data.fecha_batch_inicio,
      fecha_batch_fin: data.fecha_batch_fin,
      total_documentos: data.total_documentos,
      estado: 'en_progreso',
    })
    .select()
    .single()

  console.log(`✨ Nuevo checkpoint creado: ${newCheckpoint!.id}`)
  return newCheckpoint!.id
}

/**
 * Actualiza progreso del checkpoint
 */
export async function updateCheckpoint(
  checkpointId: string,
  updates: {
    documentos_procesados?: number
    documentos_fallidos?: number
    documentos_saltados?: number
    categoria_actual?: string
    ultimo_doc_procesado?: string
    costo_acumulado?: number
  }
): Promise<void> {
  await supabase
    .from('procesamiento_checkpoints')
    .update({
      ...updates,
      metadata: {
        ultima_actualizacion: new Date().toISOString(),
      },
    })
    .eq('id', checkpointId)
}

/**
 * Pausa checkpoint (cuando se acaba el presupuesto)
 */
export async function pauseCheckpoint(
  checkpointId: string,
  reason: string
): Promise<void> {
  await supabase
    .from('procesamiento_checkpoints')
    .update({
      estado: 'pausado',
      fecha_pausa: new Date().toISOString(),
      razon_pausa: reason,
    })
    .eq('id', checkpointId)

  console.log(`⏸️ Checkpoint ${checkpointId} pausado: ${reason}`)
}

/**
 * Completa checkpoint
 */
export async function completeCheckpoint(
  checkpointId: string
): Promise<void> {
  await supabase
    .from('procesamiento_checkpoints')
    .update({
      estado: 'completado',
      fecha_completado: new Date().toISOString(),
    })
    .eq('id', checkpointId)

  console.log(`✅ Checkpoint ${checkpointId} completado`)
}
```

---

## 🔄 FUNCIÓN DE PROCESAMIENTO BATCH RESILIENTE

```typescript
// netlify/functions/batch-monthly-resilient.ts

import { schedule } from '@netlify/functions'
import {
  checkBudget,
  recordCost,
  addToQueue,
  getNextBatch,
  markAsProcessing,
  markAsCompleted,
  markAsError,
  getOrCreateCheckpoint,
  updateCheckpoint,
  pauseCheckpoint,
  completeCheckpoint,
} from '../../utils/budget-control'

/**
 * Procesamiento mensual resiliente con control de presupuesto
 * Se ejecuta el día 1 de cada mes a las 02:00 AM
 */
export const handler = schedule('0 2 1 * *', async (event) => {
  console.log('🗓️ Iniciando procesamiento mensual...')

  // 1. Calcular rango del mes anterior
  const hoy = new Date()
  const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
  const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0)

  const fechaInicio = format(primerDiaMesAnterior, 'yyyy-MM-dd')
  const fechaFin = format(ultimoDiaMesAnterior, 'yyyy-MM-dd')

  console.log(`📅 Procesando mes: ${fechaInicio} a ${fechaFin}`)

  // 2. Obtener o crear checkpoint
  const checkpointId = await getOrCreateCheckpoint({
    tipo_batch: 'mensual',
    fecha_batch_inicio: fechaInicio,
    fecha_batch_fin: fechaFin,
    total_documentos: 0,  // Lo actualizamos después
  })

  let documentosProcesados = 0
  let documentosFallidos = 0
  let costoAcumulado = 0

  try {
    // 3. Obtener sumarios del mes (si no están en cola ya)
    const sumarios = await fetchWeekSumarios(primerDiaMesAnterior, ultimoDiaMesAnterior)
    const todosDocs = sumarios.flatMap(s => extractAllDocuments(s.sumario))

    console.log(`📊 Total documentos del mes: ${todosDocs.length}`)

    // Actualizar total en checkpoint
    await updateCheckpoint(checkpointId, {
      documentos_procesados: 0,
    })

    // 4. Agregar a cola con prioridades
    for (const doc of todosDocs) {
      const categoria = clasificarDocumento(doc)  // Función de clasificación
      const prioridad = categoria?.prioridad === 3 ? 1 : 0

      await addToQueue({
        boe_id: doc.id,
        fecha_publicacion: doc.fecha_publicacion,
        titulo: doc.titulo,
        categoria_id: categoria?.id || null,
        nivel_procesamiento: 1,  // Empieza en nivel 1
        prioridad,
        costo_estimado: 0,  // Nivel 1 es gratis (regex)
      })
    }

    // 5. Procesar cola por lotes con control de presupuesto
    let continuar = true

    while (continuar) {
      // Verificar presupuesto antes de procesar
      const budgetStatus = await checkBudget(0.01)  // $0.01 mínimo

      if (!budgetStatus.canProcess) {
        console.log(`💰 Presupuesto agotado: ${budgetStatus.reason}`)
        await pauseCheckpoint(checkpointId, budgetStatus.reason!)
        break
      }

      // Obtener siguiente lote (ajustar tamaño según presupuesto)
      const maxCostPerBatch = Math.min(
        budgetStatus.remainingDaily,
        budgetStatus.remainingWeekly,
        budgetStatus.remainingMonthly,
        1.0  // Máximo $1 por batch
      )

      const batch = await getNextBatch(10, maxCostPerBatch)

      if (batch.length === 0) {
        console.log('✅ No hay más documentos pendientes')
        continuar = false
        break
      }

      console.log(`🔄 Procesando lote de ${batch.length} documentos...`)

      // Procesar cada documento del lote
      for (const item of batch) {
        try {
          await markAsProcessing(item.boe_id, item.nivel_procesamiento, 'batch-monthly')

          // Procesar según nivel
          let cost = 0
          if (item.nivel_procesamiento === 1) {
            // Nivel 1: Clasificación (gratis, ya hecho al agregar a cola)
            cost = 0
          } else if (item.nivel_procesamiento === 2) {
            // Nivel 2: Extracción con LLM
            cost = await procesarExtraccion(item)
          } else if (item.nivel_procesamiento === 3) {
            // Nivel 3: Explicaciones educativas
            cost = await procesarExplicaciones(item)
          }

          await markAsCompleted(item.boe_id, item.nivel_procesamiento, cost)

          documentosProcesados++
          costoAcumulado += cost

          // Actualizar checkpoint cada 10 documentos
          if (documentosProcesados % 10 === 0) {
            await updateCheckpoint(checkpointId, {
              documentos_procesados: documentosProcesados,
              ultimo_doc_procesado: item.boe_id,
              costo_acumulado: costoAcumulado,
            })
          }

          // Pequeña pausa entre documentos
          await sleep(100)

        } catch (error) {
          console.error(`❌ Error procesando ${item.boe_id}:`, error)
          await markAsError(item.boe_id, item.nivel_procesamiento, error.message)
          documentosFallidos++
        }
      }

      // Verificar si llegamos al límite de tiempo de Netlify (15 min)
      const tiempoTranscurrido = Date.now() - startTime
      if (tiempoTranscurrido > 14 * 60 * 1000) {  // 14 minutos
        console.log('⏱️ Límite de tiempo alcanzado, pausando...')
        await pauseCheckpoint(checkpointId, 'Timeout de función (15 min)')
        break
      }
    }

    // 6. Si terminó todo, completar checkpoint
    if (!continuar && batch.length === 0) {
      await completeCheckpoint(checkpointId)
      console.log('🎉 Procesamiento mensual completado!')
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        checkpoint_id: checkpointId,
        documentos_procesados: documentosProcesados,
        documentos_fallidos: documentosFallidos,
        costo_acumulado: costoAcumulado,
      }),
    }

  } catch (error) {
    console.error('❌ Error fatal:', error)
    await pauseCheckpoint(checkpointId, `Error fatal: ${error.message}`)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        checkpoint_id: checkpointId,
      }),
    }
  }
})
```

---

## 🎛️ DASHBOARD DE CONTROL (UI)

```vue
<!-- pages/admin/budget.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">💰 Control de Presupuesto</h1>

    <!-- Presupuesto Actual -->
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm text-gray-600 mb-2">Diario</h3>
        <div class="flex items-baseline">
          <span class="text-3xl font-bold">${{ gastos.dia.toFixed(2) }}</span>
          <span class="text-gray-500 ml-2">/ ${{ limites.dia }}</span>
        </div>
        <div class="mt-2 bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full"
            :style="{ width: `${(gastos.dia / limites.dia) * 100}%` }"
          ></div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm text-gray-600 mb-2">Semanal</h3>
        <div class="flex items-baseline">
          <span class="text-3xl font-bold">${{ gastos.semana.toFixed(2) }}</span>
          <span class="text-gray-500 ml-2">/ ${{ limites.semana }}</span>
        </div>
        <div class="mt-2 bg-gray-200 rounded-full h-2">
          <div
            class="bg-green-600 h-2 rounded-full"
            :style="{ width: `${(gastos.semana / limites.semana) * 100}%` }"
          ></div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm text-gray-600 mb-2">Mensual</h3>
        <div class="flex items-baseline">
          <span class="text-3xl font-bold">${{ gastos.mes.toFixed(2) }}</span>
          <span class="text-gray-500 ml-2">/ ${{ limites.mes }}</span>
        </div>
        <div class="mt-2 bg-gray-200 rounded-full h-2">
          <div
            class="bg-purple-600 h-2 rounded-full"
            :style="{ width: `${(gastos.mes / limites.mes) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Estado del Procesamiento -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Estado del Procesamiento</h2>
        <span
          class="px-3 py-1 rounded-full text-sm font-semibold"
          :class="procesamientoActivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
        >
          {{ procesamientoActivo ? '🟢 Activo' : '🔴 Pausado' }}
        </span>
      </div>

      <div v-if="!procesamientoActivo && razonPausa" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <p class="text-yellow-800">⚠️ {{ razonPausa }}</p>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <button
          @click="reanudarProcesamiento"
          :disabled="procesamientoActivo"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          ▶️ Reanudar Procesamiento
        </button>

        <button
          @click="pausarProcesamiento"
          :disabled="!procesamientoActivo"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          ⏸️ Pausar Procesamiento
        </button>
      </div>
    </div>

    <!-- Cola de Procesamiento -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-bold mb-4">📋 Cola de Procesamiento</h2>

      <div class="grid grid-cols-4 gap-4 mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-600">{{ stats.pendientes }}</div>
          <div class="text-sm text-gray-500">Pendientes</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ stats.procesando }}</div>
          <div class="text-sm text-gray-500">Procesando</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.completados }}</div>
          <div class="text-sm text-gray-500">Completados</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">{{ stats.errores }}</div>
          <div class="text-sm text-gray-500">Errores</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Implementación del dashboard
// ...
</script>
```

---

## 📝 RESUMEN DE LA SOLUCIÓN

### ✅ Controles Implementados

1. **Límites de Presupuesto**
   - Diario: $10 (configurable)
   - Semanal: $50 (configurable)
   - Mensual: $200 (configurable)

2. **Pausado Automático**
   - Se detiene cuando se agota cualquier límite
   - Se detiene si se acerca al timeout de Netlify (15 min)
   - Se puede pausar manualmente

3. **Reanudación Inteligente**
   - Checkpoints cada 10 documentos
   - Continúa exactamente donde se quedó
   - No reprocesa documentos ya hechos

4. **Sistema de Cola**
   - Priorización (Urgente > Alta > Normal)
   - Deduplicación automática
   - Reintentos con límite (3 intentos max)

5. **Monitoreo en Tiempo Real**
   - Dashboard web con estado actual
   - Logs detallados en Supabase
   - Alertas cuando se pausa

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecutar migrations SQL** (presupuesto_control, cola_procesamiento, checkpoints)
2. **Implementar funciones de control** (budget-control.ts, queue.ts, checkpoint.ts)
3. **Adaptar batch functions** para usar el nuevo sistema
4. **Crear dashboard de admin** para monitoreo
5. **Configurar límites iniciales** según tu presupuesto real

---

**¿Te parece bien esta arquitectura? ¿Necesitas ajustar los límites o agregar algo más?** 💰
