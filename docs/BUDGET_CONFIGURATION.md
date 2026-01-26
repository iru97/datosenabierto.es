# 💰 Configuración de Presupuesto

Guía rápida para configurar los límites de presupuesto del sistema de procesamiento LLM.

---

## 🎯 Opción 1: SQL Directo en Supabase (MÁS RÁPIDO)

### Paso 1: Ver límites actuales

```sql
SELECT * FROM presupuesto_control;
```

### Paso 2: Actualizar límites

```sql
-- Ejemplo: Presupuesto conservador ($100/mes)
UPDATE presupuesto_control SET
  limite_diario = 5.00,
  limite_semanal = 30.00,
  limite_mensual = 100.00;

-- Ejemplo: Presupuesto moderado ($150/mes - DEFAULT)
UPDATE presupuesto_control SET
  limite_diario = 10.00,
  limite_semanal = 50.00,
  limite_mensual = 150.00;

-- Ejemplo: Presupuesto amplio ($300/mes)
UPDATE presupuesto_control SET
  limite_diario = 20.00,
  limite_semanal = 100.00,
  limite_mensual = 300.00;
```

### Paso 3: Verificar cambios

```sql
SELECT
  limite_diario,
  limite_semanal,
  limite_mensual,
  gasto_dia_actual,
  procesamiento_activo
FROM presupuesto_control;
```

---

## 🎯 Opción 2: Scripts TypeScript (RECOMENDADO)

### Ver estado actual del presupuesto

```bash
npx tsx scripts/check-budget-status.ts
```

**Output:**
```
💰 Estado del Presupuesto
==================================================

📊 LÍMITES CONFIGURADOS:
   Diario:  $10.00 USD
   Semanal: $50.00 USD
   Mensual: $150.00 USD

💸 GASTOS ACTUALES:
   Hoy:     $2.34 USD de $10.00 USD (23.4%)
   Semana:  $15.67 USD de $50.00 USD (31.3%)
   Mes:     $45.89 USD de $150.00 USD (30.6%)

✅ PRESUPUESTO RESTANTE:
   Hoy:     $7.66 USD
   Semana:  $34.33 USD
   Mes:     $104.11 USD

🚦 ESTADO:
   ✅ Procesamiento ACTIVO - Puede procesar
```

### Actualizar límites

```bash
# 1. Editar el archivo
nano scripts/update-budget-limits.ts

# 2. Cambiar estos valores:
const newLimits = {
  limite_diario: 10.00,   // ← Tu límite diario
  limite_semanal: 50.00,  // ← Tu límite semanal
  limite_mensual: 150.00, // ← Tu límite mensual
}

# 3. Ejecutar script
npx tsx scripts/update-budget-limits.ts
```

**Output:**
```
🎯 Actualizando límites de presupuesto...

📊 Límites actuales:
   - Diario:  $10.00
   - Semanal: $50.00
   - Mensual: $150.00

✅ Límites actualizados:
   - Diario:  $5.00
   - Semanal: $30.00
   - Mensual: $100.00

🎉 Actualización completada!
```

---

## 💡 Recomendaciones de Presupuesto

### Para Desarrollo/Testing
```sql
UPDATE presupuesto_control SET
  limite_diario = 2.00,   -- $2/día
  limite_semanal = 10.00, -- $10/semana
  limite_mensual = 30.00; -- $30/mes
```
- ✅ Seguro para pruebas
- ✅ Evita gastos accidentales
- ❌ Procesará pocos documentos

### Para Uso Moderado (RECOMENDADO)
```sql
UPDATE presupuesto_control SET
  limite_diario = 10.00,   -- $10/día
  limite_semanal = 50.00,  -- $50/semana
  limite_mensual = 150.00; -- $150/mes (DEFAULT)
```
- ✅ Equilibrio precio/rendimiento
- ✅ ~350 docs/día con GPT-4.1-nano (50% más que GPT-4o-mini)
- ✅ Procesamiento completo en ~7 días

### Para Producción Intensiva
```sql
UPDATE presupuesto_control SET
  limite_diario = 20.00,   -- $20/día
  limite_semanal = 100.00, -- $100/semana
  limite_mensual = 300.00; -- $300/mes
```
- ✅ Procesamiento rápido
- ✅ ~700 docs/día con GPT-4.1-nano
- ⚠️ Mayor gasto mensual

---

## 🔧 Operaciones Comunes

### Pausar procesamiento manualmente

```sql
UPDATE presupuesto_control SET
  procesamiento_activo = false,
  razon_pausa = 'Mantenimiento programado';
```

### Reanudar procesamiento

```sql
UPDATE presupuesto_control SET
  procesamiento_activo = true,
  razon_pausa = NULL;
```

### Resetear gastos manualmente (emergencia)

```sql
-- Resetear solo hoy
UPDATE presupuesto_control SET
  gasto_dia_actual = 0.00,
  ultimo_reset_diario = CURRENT_DATE;

-- Resetear toda la semana
UPDATE presupuesto_control SET
  gasto_semana_actual = 0.00,
  ultimo_reset_semanal = CURRENT_DATE;

-- Resetear todo el mes
UPDATE presupuesto_control SET
  gasto_mes_actual = 0.00,
  ultimo_reset_mensual = CURRENT_DATE;
```

---

## 📊 Monitoreo del Presupuesto

### Ver estado completo

```sql
SELECT * FROM v_estado_presupuesto;
```

### Ver histórico de gastos (desde procesamiento_log)

```sql
SELECT
  fecha_inicio::date as fecha,
  total_documentos_procesados,
  total_costo_estimado,
  estado
FROM procesamiento_log
ORDER BY fecha_inicio DESC
LIMIT 30;
```

### Ver gastos por día (estimado desde cola)

```sql
SELECT
  DATE(fecha_completado) as fecha,
  COUNT(*) as documentos,
  SUM(costo_real) as costo_total
FROM cola_procesamiento
WHERE estado = 'completado'
  AND fecha_completado > NOW() - INTERVAL '30 days'
GROUP BY DATE(fecha_completado)
ORDER BY fecha DESC;
```

---

## 🚨 Alertas y Límites

El sistema automáticamente:

✅ **Advertencias al 80%**: Muestra warning cuando usas el 80% del presupuesto
✅ **Pausa al 100%**: Se detiene automáticamente al alcanzar el límite
✅ **Reset automático**: Resetea contadores (diario/semanal/mensual) automáticamente
✅ **Reanudación**: Reanuda automáticamente cuando hay presupuesto disponible

### Ajustar umbral de advertencia

El umbral está en el código (80%), si quieres cambiarlo:

```typescript
// utils/budget-control.ts
const WARNING_THRESHOLD_PERCENT = 80 // ← Cambia aquí
```

---

## 📈 Calculadora de Presupuesto

**Con GPT-4.1-nano (33% más barato que GPT-4o-mini):**
- Input: $0.10 / 1M tokens
- Output: $0.40 / 1M tokens

**Costo estimado por documento:**
- Nivel 1 (Clasificación): ~$0.0002 (33% reducción)
- Nivel 2 (Extracción): ~$0.0028 (33% reducción)
- Nivel 3 (Explicación): ~$0.0037 (33% reducción)

**Documentos procesables según presupuesto:**

| Presupuesto Diario | Docs/día (Nivel 2) | Docs/mes (aprox) |
|--------------------|---------------------|------------------|
| $2.00              | ~714                | ~21,420          |
| $5.00              | ~1,785              | ~53,550          |
| $10.00 (default)   | ~3,571              | ~107,130         |
| $20.00             | ~7,142              | ~214,260         |

---

## 🔗 Archivos Relacionados

- `utils/budget-control.ts` - Lógica de control de presupuesto
- `supabase/migration-budget-control.sql` - Tabla de presupuesto
- `scripts/check-budget-status.ts` - Ver estado actual
- `scripts/update-budget-limits.ts` - Actualizar límites

---

## 💡 Ejemplo Completo

```bash
# 1. Ver estado actual
npx tsx scripts/check-budget-status.ts

# 2. Ajustar límites (editar archivo)
nano scripts/update-budget-limits.ts
# Cambiar: limite_diario = 15.00

# 3. Aplicar cambios
npx tsx scripts/update-budget-limits.ts

# 4. Verificar
npx tsx scripts/check-budget-status.ts
```

¡Listo! 🎉
