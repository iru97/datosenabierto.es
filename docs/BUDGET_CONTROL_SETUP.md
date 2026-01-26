# 💰 Sistema de Control de Presupuesto - Guía de Configuración

## 📋 Descripción General

El sistema de control de presupuesto permite:
- ✅ **Límites automáticos**: Diarios, semanales y mensuales configurables
- ✅ **Pausa automática**: Se detiene cuando se agota el presupuesto
- ✅ **Reanudación inteligente**: Continúa exactamente donde se quedó
- ✅ **Sin duplicados**: Nunca reprocesa documentos ya completados
- ✅ **Priorización**: Procesa primero los documentos más importantes
- ✅ **Checkpoints**: Guarda progreso cada 10 documentos

---

## 🚀 Instalación Rápida

### 1. Ejecutar Migración en Supabase

Ve a tu proyecto Supabase → SQL Editor → Ejecuta:

```bash
# Archivo a ejecutar
supabase/migration-budget-control.sql
```

Esto creará 3 nuevas tablas:
- `presupuesto_control` - Control de límites y gastos
- `cola_procesamiento` - Cola de documentos pendientes
- `procesamiento_checkpoints` - Checkpoints de procesamiento

### 2. Verificar Tablas Creadas

Ejecuta en SQL Editor:

```sql
SELECT * FROM presupuesto_control;
SELECT * FROM cola_procesamiento LIMIT 5;
SELECT * FROM procesamiento_checkpoints LIMIT 5;
```

Deberías ver:
- ✅ 1 registro en `presupuesto_control` con límites por defecto
- ✅ 0 registros en `cola_procesamiento` (vacía al inicio)
- ✅ 0 registros en `procesamiento_checkpoints` (vacía al inicio)

### 3. Configurar Límites de Presupuesto (Opcional)

Por defecto, los límites son:
- **Diario**: $10 USD
- **Semanal**: $50 USD
- **Mensual**: $150 USD

Para cambiarlos, ejecuta en SQL Editor:

```sql
UPDATE presupuesto_control SET
  limite_diario = 5.00,
  limite_semanal = 30.00,
  limite_mensual = 100.00;
```

---

## 📊 Uso Básico

### Ejemplo 1: Función Netlify con Control de Presupuesto

```typescript
import {
  checkBudget,
  recordCost,
  pauseProcessing,
} from '../../utils/budget-control'
import {
  getOrCreateCheckpoint,
  updateCheckpoint,
  pauseCheckpoint,
  completeCheckpoint,
} from '../../utils/checkpoint-manager'
import {
  addToQueue,
  getNextBatch,
  markAsCompleted,
} from '../../utils/processing-queue'

export const handler = async () => {
  // 1. Verificar presupuesto
  const budget = await checkBudget()
  if (!budget.canProcess) {
    console.log(`No se puede procesar: ${budget.reason}`)
    return
  }

  // 2. Crear o reanudar checkpoint
  const checkpointId = await getOrCreateCheckpoint({
    tipo_batch: 'mensual',
    fecha_batch_inicio: '2025-01-01',
    fecha_batch_fin: '2025-01-31',
  })

  // 3. Procesar documentos
  while (true) {
    // Verificar presupuesto antes de cada lote
    const budget = await checkBudget()
    if (!budget.canProcess) {
      await pauseCheckpoint(checkpointId, budget.reason!)
      break
    }

    // Obtener siguiente lote
    const lote = await getNextBatch(10, budget.remainingTotal)
    if (lote.length === 0) break

    // Procesar cada documento
    for (const item of lote) {
      const costo = await procesarDocumento(item)
      await recordCost(costo)
      await markAsCompleted(item.boe_id, item.nivel_procesamiento, costo)
    }

    // Guardar progreso
    await updateCheckpoint(checkpointId, {
      documentos_procesados: totalProcesados,
      costo_acumulado: costoAcumulado,
    })
  }

  // 4. Finalizar
  await completeCheckpoint(checkpointId)
}
```

---

## 🛠️ API Reference

### Budget Control (`utils/budget-control.ts`)

#### `checkBudget(estimatedCost?: number)`
Verifica si hay presupuesto disponible.

```typescript
const status = await checkBudget(0.05)
console.log(status.canProcess) // true/false
console.log(status.remainingDaily) // $9.95
console.log(status.reason) // "Límite diario alcanzado"
```

#### `recordCost(cost: number)`
Registra un gasto real.

```typescript
await recordCost(0.0123) // $0.0123 USD
```

#### `pauseProcessing(reason: string)`
Pausa el procesamiento manualmente.

```typescript
await pauseProcessing('Mantenimiento programado')
```

#### `resumeProcessing()`
Reanuda el procesamiento.

```typescript
await resumeProcessing()
```

#### `getBudgetStatus()`
Obtiene estado completo del presupuesto.

```typescript
const { limits, spending, status } = await getBudgetStatus()
console.log(limits.limite_diario) // 10.00
console.log(spending.gasto_dia_actual) // 2.34
```

---

### Processing Queue (`utils/processing-queue.ts`)

#### `addToQueue(item: QueueItem)`
Añade documento a la cola (con deduplicación).

```typescript
const added = await addToQueue({
  boe_id: 'BOE-A-2025-12345',
  nivel_procesamiento: 2,
  prioridad: 1, // 0=normal, 1=alta, 2=urgente
})
console.log(added) // true si se añadió, false si ya existía
```

#### `getNextBatch(batchSize, maxCost)`
Obtiene siguiente lote respetando coste máximo.

```typescript
const lote = await getNextBatch(10, 5.00)
// Máximo 10 documentos, coste total ≤ $5.00
```

#### `markAsCompleted(boeId, nivel, costoReal)`
Marca documento como completado.

```typescript
await markAsCompleted('BOE-A-2025-12345', 2, 0.0234)
```

#### `getQueueStats()`
Obtiene estadísticas de la cola.

```typescript
const stats = await getQueueStats()
console.log(stats.pendientes) // 150
console.log(stats.completados) // 842
console.log(stats.costoRealTotal) // 45.67
```

---

### Checkpoint Manager (`utils/checkpoint-manager.ts`)

#### `getOrCreateCheckpoint(data: CheckpointData)`
Crea nuevo checkpoint o reanuda existente.

```typescript
const checkpointId = await getOrCreateCheckpoint({
  tipo_batch: 'mensual',
  fecha_batch_inicio: '2025-01-01',
  fecha_batch_fin: '2025-01-31',
  total_documentos: 2500,
})
// Si ya existe uno pausado, lo reanuda
// Si no, crea uno nuevo
```

#### `updateCheckpoint(checkpointId, progress)`
Actualiza progreso del checkpoint.

```typescript
await updateCheckpoint(checkpointId, {
  documentos_procesados: 150,
  ultimo_doc_procesado: 'BOE-A-2025-12345',
  costo_acumulado: 5.67,
})
```

#### `pauseCheckpoint(checkpointId, reason)`
Pausa checkpoint.

```typescript
await pauseCheckpoint(checkpointId, 'Presupuesto agotado')
```

#### `completeCheckpoint(checkpointId)`
Marca checkpoint como completado.

```typescript
await completeCheckpoint(checkpointId)
```

---

## 📈 Monitoreo

### Consultas SQL Útiles

**Estado actual del presupuesto:**
```sql
SELECT * FROM v_estado_presupuesto;
```

**Cola de procesamiento:**
```sql
SELECT * FROM v_resumen_cola;
```

**Checkpoints activos:**
```sql
SELECT * FROM v_checkpoints_activos;
```

**Documentos pendientes por prioridad:**
```sql
SELECT prioridad, COUNT(*) as total, SUM(costo_estimado) as costo_total
FROM cola_procesamiento
WHERE estado = 'pendiente'
GROUP BY prioridad
ORDER BY prioridad DESC;
```

**Últimos 10 checkpoints:**
```sql
SELECT
  tipo_batch,
  estado,
  documentos_procesados,
  costo_acumulado,
  fecha_inicio
FROM procesamiento_checkpoints
ORDER BY fecha_inicio DESC
LIMIT 10;
```

---

## 🎯 Casos de Uso

### Caso 1: Procesamiento Mensual Automático

```typescript
// netlify/functions/batch-monthly.ts
export const handler = schedule('0 2 1 * *', async () => {
  // Se ejecuta el 1 de cada mes a las 2 AM
  // Ver: netlify/functions/batch-monthly-resilient.ts
})
```

**Comportamiento:**
1. ✅ Si hay presupuesto → Procesa documentos
2. ⏸️ Si se agota → Pausa automáticamente
3. ♻️ Siguiente ejecución → Continúa donde se quedó
4. ✅ Cuando termina → Marca checkpoint como completado

### Caso 2: Procesamiento On-Demand (Usuario)

```typescript
// pages/api/process-document.ts
export default async function handler(req, res) {
  const { boeId } = req.query

  // Añadir a cola con prioridad URGENTE
  await addToQueue({
    boe_id: boeId,
    nivel_procesamiento: 2,
    prioridad: 2, // ⚡ Urgente (usuario esperando)
  })

  // Verificar presupuesto
  const budget = await checkBudget()
  if (!budget.canProcess) {
    return res.status(503).json({
      error: 'Presupuesto agotado temporalmente',
      reason: budget.reason,
    })
  }

  // Procesar inmediatamente
  const lote = await getNextBatch(1, budget.remainingTotal)
  // ... procesar documento

  res.json({ success: true })
}
```

### Caso 3: Resetear Presupuesto Manualmente

```typescript
// pages/api/admin/reset-budget.ts
import { resetBudget } from '../../../utils/budget-control'

export default async function handler(req, res) {
  // Requiere autenticación de admin

  await resetBudget('daily')
  // o 'weekly', 'monthly'

  res.json({ success: true })
}
```

---

## ⚠️ Troubleshooting

### Problema: El procesamiento no arranca

**Verificar:**
```sql
SELECT procesamiento_activo, razon_pausa FROM presupuesto_control;
```

**Solución:**
```sql
UPDATE presupuesto_control SET
  procesamiento_activo = true,
  razon_pausa = NULL;
```

### Problema: Documentos no se procesan

**Verificar cola:**
```sql
SELECT estado, COUNT(*) FROM cola_procesamiento GROUP BY estado;
```

**Resetear items colgados:**
```typescript
import { resetStuckItems } from './utils/processing-queue'
await resetStuckItems(30) // Items en "procesando" por >30min
```

### Problema: Presupuesto se consume muy rápido

**Analizar costes:**
```sql
SELECT
  DATE(created_at) as fecha,
  SUM(costo_real) as costo_total,
  COUNT(*) as documentos
FROM cola_procesamiento
WHERE estado = 'completado'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;
```

**Ajustar límites:**
```sql
UPDATE presupuesto_control SET
  limite_diario = 5.00;
```

### Problema: Checkpoints no se completan

**Ver checkpoints activos:**
```sql
SELECT * FROM v_checkpoints_activos;
```

**Completar manualmente:**
```typescript
import { completeCheckpoint } from './utils/checkpoint-manager'
await completeCheckpoint('checkpoint-id-aqui')
```

---

## 📝 Mejores Prácticas

1. **Establecer límites conservadores**: Empieza con $5-10 diarios y ajusta según necesidad
2. **Monitorear diariamente**: Revisa `v_estado_presupuesto` cada día
3. **Limpiar periódicamente**: Ejecuta `cleanupOldItems()` mensualmente
4. **Priorizar bien**: Usa prioridad 2 solo para requests de usuario
5. **Guardar checkpoints frecuentemente**: Cada 10 documentos es óptimo
6. **Resetear items colgados**: Al inicio de cada batch
7. **Alertas de uso**: Configura notificaciones al 80% del presupuesto

---

## 🔗 Archivos Relacionados

- `supabase/migration-budget-control.sql` - Migración de tablas
- `utils/budget-control.ts` - Control de presupuesto
- `utils/processing-queue.ts` - Gestión de cola
- `utils/checkpoint-manager.ts` - Sistema de checkpoints
- `netlify/functions/batch-monthly-resilient.ts` - Ejemplo completo
- `docs/CONTROL_COSTES_Y_PROCESAMIENTO.md` - Documentación técnica detallada

---

## 🎓 Ejemplo Completo End-to-End

Ver archivo: `netlify/functions/batch-monthly-resilient.ts`

Este archivo contiene una implementación completa y funcional que:
- ✅ Verifica presupuesto antes de cada lote
- ✅ Crea/reanuda checkpoints automáticamente
- ✅ Llena la cola con deduplicación
- ✅ Procesa por lotes respetando límites
- ✅ Guarda progreso cada 10 documentos
- ✅ Pausa automáticamente si se agota presupuesto
- ✅ Pausa antes del timeout de Netlify (15 min)
- ✅ Marca como completado cuando termina

---

## 💡 Próximos Pasos

1. ✅ Ejecutar migración en Supabase
2. ✅ Configurar límites según presupuesto
3. ✅ Implementar función de procesamiento
4. ✅ Probar con un lote pequeño
5. ✅ Monitorear y ajustar límites
6. 🔜 Crear dashboard de administración
7. 🔜 Configurar alertas automáticas
