# 🚀 Deployment: Multi-Category Classification

Guía paso a paso para desplegar la nueva funcionalidad de multi-categorías.

---

## ✅ Pre-requisitos

- [ ] Acceso a Supabase Dashboard
- [ ] Variables de entorno configuradas:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY` (para clasificador LLM)
- [ ] Backup de base de datos realizado

---

## 📋 Paso 1: Backup de Base de Datos

### Opción A: Via Supabase Dashboard

1. Ve a tu proyecto en https://supabase.com/dashboard
2. Click en "Database" → "Backups"
3. Click "Create Manual Backup"
4. Espera confirmación (1-2 minutos)

### Opción B: Via pg_dump (local)

```bash
pg_dump -h <your-supabase-host> -U postgres -t documentos_boe -t categorias > backup_$(date +%Y%m%d).sql
```

---

## 🗄️ Paso 2: Ejecutar Migración de Base de Datos

### Via Supabase Dashboard (Recomendado)

1. Ve a "SQL Editor" en Supabase Dashboard
2. Abre el archivo: `supabase/migrations/20251125_phase1_multi_category.sql`
3. Copia todo el contenido
4. Pega en el SQL Editor
5. Click "Run" (botón inferior derecha)
6. Espera mensaje de éxito:
   ```
   Migration completed:
   Original records: 1523
   Migrated records: 1523
   ```

**Si hay error:** Revisa la sección "Troubleshooting" al final

---

## 🧪 Paso 3: Verificar Migración

Ejecuta el test suite:

```bash
cd /home/user/datosenabierto.es

# Configura variables de entorno
export SUPABASE_URL="your_url_here"
export SUPABASE_SERVICE_ROLE_KEY="your_key_here"

# Ejecuta tests
npx ts-node scripts/test-multi-category-migration.ts
```

**Resultado esperado:**
```
✅ Table: documento_categorias
✅ Table: classification_feedback
✅ Table: classification_metrics
✅ Migration count matches
✅ View: documentos_con_categoria_principal
✅ View: documentos_con_todas_categorias
... (10/10 tests passed)

📊 TEST SUMMARY
Total Tests: 10
✅ Passed: 10
❌ Failed: 0
Success Rate: 100.0%
```

**Si algún test falla:** Revisa logs detallados y consulta "Troubleshooting"

---

## 🎨 Paso 4: Actualizar Frontend

Los archivos ya están actualizados en el branch:
- ✅ `pages/index.vue` - Home page con multi-categorías
- ✅ `components/DocumentoCardEducativo.vue` - Usa MultiCategoryBadges
- ✅ `components/MultiCategoryBadges.vue` - Nuevo componente

### Deploy Frontend

```bash
# Build local para testing
npm run build
npm run preview

# Verificar en browser (localhost:3000)
```

### Verificar en Browser

1. Abre http://localhost:3000
2. Verifica que las cards muestran badges de categorías
3. Algunos documentos deberían tener 2-3 badges
4. El badge principal debería ser más grande
5. Debe haber indicador "+N más" si hay categorías ocultas

---

## 🤖 Paso 5: Probar Clasificador LLM (Nuevo)

Este paso prueba el nuevo clasificador LLM con documentos de ejemplo.

```bash
export OPENAI_API_KEY="your_key_here"
export SUPABASE_URL="your_url_here"
export SUPABASE_SERVICE_ROLE_KEY="your_key_here"

npm run test:clasificador
```

**Output esperado:**
```
🧪 TEST: Clasificador LLM Multi-Categoría
================================================================================

📄 DOCUMENTO: BOE-A-2025-1234
   Título: Resolución... convoca proceso selectivo para ingreso en el Cuerpo...
   Rango: Resolución

   ✅ Clasificado en 1 categorías:
      ⭐ oposiciones         - 98% - Convocatoria de proceso selectivo para empleo público

   💰 Coste: $0.00034
   🔢 Tokens: 287
   ⏱️  Duración: 823ms

📊 RESUMEN
Documentos procesados: 5
Categorías asignadas (total): 8
Promedio categorías/doc: 1.60

💰 Coste total: $0.00165
💰 Coste promedio/doc: $0.00033
```

**Nota:** El clasificador LLM se integra automáticamente en el procesamiento semanal. No requiere configuración adicional.

---

## 🔄 Paso 6: Reclasificar Documentos Existentes (Opcional)

Este paso asigna múltiples categorías a documentos existentes basándose en keywords.

### Dry Run (Ver qué pasaría sin hacer cambios)

```bash
export SUPABASE_URL="your_url_here"
export SUPABASE_SERVICE_ROLE_KEY="your_key_here"

npx ts-node scripts/reclassify-multi-category.ts --dry-run --limit=50
```

**Output esperado:**
```
🔄 Re-classifying Documents with Multi-Category Support
========================================================
Settings:
  - Limit: 50 documents
  - Min confidence: 0.3
  - Min categories: 2
  - Dry run: YES (no changes)

📄 Document 1/50:
   Título: Convocatoria de oposiciones para profesor de medio ambiente...
   Found 3 categories:
     - oposiciones (confidence: 100%)
     - educacion (confidence: 80%)
     - medio-ambiente (confidence: 60%)
   [DRY RUN - would add 3 categories]

...

📊 SUMMARY
Total documents analyzed: 50
Documents with 2+ categories: 23
Percentage: 46.0%

⚠️  DRY RUN - No changes made to database
```

### Ejecutar Reclasificación Real

Si el dry run se ve bien:

```bash
npx ts-node scripts/reclassify-multi-category.ts --limit=100
```

**Esto:**
- Analiza últimos 100 documentos
- Asigna múltiples categorías basándose en keywords
- Calcula confidence scores (0.3 a 1.0)
- Salta documentos ya clasificados

**Recomendación:** Empezar con 50-100 documentos, verificar resultados, luego escalar.

---

## ✅ Paso 6: Verificación Final

### Checklist de Funcionalidad

- [ ] Home page carga sin errores
- [ ] Cards muestran MultiCategoryBadges
- [ ] Badge principal es más grande/prominente
- [ ] Badges secundarios más pequeños
- [ ] Indicador "+N más" aparece cuando hay >2 categorías
- [ ] Hover muestra confidence percentage (opcional)
- [ ] Mobile responsive (probar en 375px width)
- [ ] No hay errores en consola del browser

### Verificar en Database

```sql
-- Documentos con múltiples categorías
SELECT
  d.titulo,
  COUNT(dc.categoria_id) as num_categorias
FROM documentos_boe d
JOIN documento_categorias dc ON d.id = dc.documento_id
GROUP BY d.id, d.titulo
HAVING COUNT(dc.categoria_id) > 1
ORDER BY num_categorias DESC
LIMIT 10;

-- Distribución de métodos de clasificación
SELECT
  clasificacion_metodo,
  COUNT(*) as total
FROM documento_categorias
GROUP BY clasificacion_metodo
ORDER BY total DESC;
```

---

## 🐛 Troubleshooting

### Error: "Migration count mismatch"

**Síntoma:** Test muestra Original: 1523, Migrated: 0

**Solución:**
```sql
-- Re-ejecutar migración de datos
INSERT INTO documento_categorias (documento_id, categoria_id, confidence, clasificacion_metodo, razonamiento)
SELECT id, categoria_id, 1.0, 'legacy', 'Migrated from original categoria_id field'
FROM documentos_boe
WHERE categoria_id IS NOT NULL
ON CONFLICT (documento_id, categoria_id) DO NOTHING;
```

### Error: "No categories showing in frontend"

**Diagnóstico:**
1. Abre DevTools Console
2. Busca errores de red (400, 500)
3. Verifica que `categorias` prop tiene datos:
   ```javascript
   console.log('Categorías:', documento.categorias)
   ```

**Soluciones comunes:**
- RLS policies bloqueando lectura → Desactiva RLS en `documento_categorias` temporalmente
- Query no incluye JOIN → Verifica uso de `getCategoriasDelDocumento()`
- Migración no ejecutada → Verifica en Supabase que tabla existe

---

## ✅ Checklist Final

Antes de considerar deployment completo:

- [ ] Backup realizado
- [ ] Migración ejecutada (10/10 tests ✅)
- [ ] Frontend actualizado y desplegado
- [ ] Verificación en browser (no errores)
- [ ] Al menos 50 documentos reclasificados
- [ ] Performance aceptable (<2s page load)
- [ ] Mobile responsive verificado

**¡Deployment Completo!** 🎉

---

**Creado:** 2025-11-25
**Branch:** claude/analyze-project-workflow-01TfZCz7SicYGiLAxtHSk4Nz
**Next Steps:** Continuar con Phase 1.2 cuando estés listo
