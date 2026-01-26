# Plan de Implementación Detallado
## Roadmap por Fases con Estimaciones y Priorización

**Fecha:** 24 de Noviembre, 2025
**Versión:** 1.0
**Duración Total Estimada:** 8-10 semanas
**Complejidad:** Media-Alta

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Fase 1: Fundamentos](#fase-1-fundamentos-semanas-1-2)
3. [Fase 2: Procesamiento Básico](#fase-2-procesamiento-básico-semanas-3-4)
4. [Fase 3: Inteligencia LLM](#fase-3-inteligencia-llm-semanas-5-6)
5. [Fase 4: UI/UX Avanzada](#fase-4-uiux-avanzada-semanas-7-8)
6. [Fase 5: Optimización](#fase-5-optimización-semanas-9-10)
7. [Métricas de Éxito](#métricas-de-éxito)
8. [Riesgos y Mitigación](#riesgos-y-mitigación)

---

## 🎯 VISIÓN GENERAL

### Objetivos del Proyecto

1. ✅ **Clasificación completa:** Todos los documentos BOE categorizados
2. ✅ **Procesamiento inteligente:** Extracción de datos estructurados
3. ✅ **Explicaciones educativas:** LLM para documentos prioritarios
4. ✅ **UI/UX útil:** Interfaces que realmente ayuden
5. ✅ **Sostenibilidad:** Costes controlados (~$50/mes)

### Filosofía de Implementación

```
ITERATIVA Y INCREMENTAL
├─ Entregar valor cada 2 semanas
├─ Testing continuo con usuarios reales
├─ Ajustar según feedback
└─ No esperar a "perfecto"
```

### Cronograma Visual

```
Semana 1-2  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Fase 1: Fundamentos
Semana 3-4  ░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░ Fase 2: Procesamiento
Semana 5-6  ░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░ Fase 3: LLM
Semana 7-8  ░░░░░░░░░░░░░░░░░░░░░░░░████████░░░░ Fase 4: UI/UX
Semana 9-10 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████ Fase 5: Optimización
```

---

## 🏗️ FASE 1: FUNDAMENTOS (Semanas 1-2)

**Objetivo:** Infraestructura sólida para todo lo demás

### Hitos Principales

✅ **Hito 1.1:** Supabase configurado y schema aplicado
✅ **Hito 1.2:** Categorías seedeadas con datos correctos
✅ **Hito 1.3:** Proxy API BOE funcionando con cache
✅ **Hito 1.4:** Sistema de clasificación básico funcionando

---

### Semana 1: Setup y Configuración

#### Día 1-2: Supabase Setup

**Tareas:**
```
□ Crear proyecto en Supabase
  ├─ Nombre: datosenabierto-prod
  ├─ Región: EU West (Frankfurt o Ireland)
  └─ Plan: Free tier inicialmente

□ Ejecutar schema.sql
  ├─ Copiar /supabase/schema.sql
  ├─ Ejecutar en SQL Editor
  ├─ Verificar tablas creadas
  └─ Verificar índices creados

□ Configurar credenciales
  ├─ Copiar SUPABASE_URL
  ├─ Copiar SUPABASE_ANON_KEY
  ├─ Copiar SUPABASE_SERVICE_KEY (para functions)
  ├─ Añadir a .env
  └─ Añadir a Netlify env variables

□ Poblar tabla de categorías
  ├─ Ejecutar INSERT del schema
  ├─ Verificar 12 categorías creadas
  └─ Verificar prioridades correctas
```

**Testing:**
```bash
# Test conexión desde local
npm run dev
# Visitar /categorias → Debe mostrar 12 categorías

# Test desde Netlify Function
netlify dev
# Verificar que functions pueden conectar
```

**Tiempo estimado:** 8 horas
**Complejidad:** Baja
**Bloquea:** Todo lo demás

---

#### Día 3-4: Proxy API BOE

**Tareas:**
```
□ Revisar /server/api/boe/sumario/[date].ts
  └─ Ya existe, solo verificar funcionamiento

□ Ajustar cache headers
  ├─ Sumarios BOE: cache 1 año (inmutables)
  ├─ 404s: cache 1 hora (festivos)
  └─ Errores: no cache

□ Testing exhaustivo
  ├─ Fecha válida: /api/boe/sumario/20251124
  ├─ Fin de semana: /api/boe/sumario/20251123 (sábado)
  ├─ Fecha futura: /api/boe/sumario/20261124
  └─ Fecha inválida: /api/boe/sumario/invalid
```

**Código a añadir:**
```typescript
// server/api/boe/sumario/[date].ts
// Añadir logging para debugging
console.log(`📥 Fetching BOE for date: ${date}`)

// Añadir mejor manejo de errores
if (response.status === 404) {
  console.log(`⚠️ No BOE available for ${date} (weekend/holiday)`)
}
```

**Tiempo estimado:** 6 horas
**Complejidad:** Baja

---

#### Día 5-7: Sistema de Clasificación

**Archivo:** `utils/clasificador.ts` (NUEVO)

**Tareas:**
```
□ Crear función clasificarDocumento()
  ├─ Input: BOEItem
  ├─ Output: categoria_id
  └─ Lógica de scoring

□ Mapeo sección → categorías
  ├─ Sección I → legislacion
  ├─ Sección II-A → nombramientos
  ├─ Sección II-B → oposiciones
  ├─ Sección III → ayudas, licitaciones
  └─ Sección V → licitaciones

□ Sistema de keywords
  ├─ Usar KEYWORDS_BY_CATEGORY de boe-api.ts
  ├─ Scoring por coincidencias
  └─ Threshold mínimo

□ Testing con casos reales
  ├─ Documento de oposiciones → debe clasificar correcto
  ├─ Documento de ayudas → debe clasificar correcto
  └─ Documento ambiguo → debe elegir el mejor match
```

**Código:**
```typescript
// utils/clasificador.ts
export function clasificarDocumento(
  doc: BOEItem,
  seccion: string,
  departamento: string,
  epigrafe?: string
): string {
  const scores: Record<string, number> = {}

  // Inicializar scores
  for (const categoria of CATEGORIAS) {
    scores[categoria.slug] = 0
  }

  // Puntos por sección
  const seccionMapping = {
    'I': ['legislacion'],
    'II': ['nombramientos', 'oposiciones'],
    'III': ['ayudas', 'licitaciones'],
    'V': ['licitaciones']
  }

  for (const cat of seccionMapping[seccion] || []) {
    scores[cat] += 10
  }

  // Puntos por epígrafe
  if (epigrafe) {
    if (epigrafe.toLowerCase().includes('oposicion')) {
      scores['oposiciones'] += 20
    }
    if (epigrafe.toLowerCase().includes('contratacion')) {
      scores['licitaciones'] += 20
    }
  }

  // Puntos por keywords en título
  const tituloLower = doc.titulo.toLowerCase()
  for (const [categoriaSlug, keywords] of Object.entries(KEYWORDS_BY_CATEGORY)) {
    for (const keyword of keywords) {
      if (tituloLower.includes(keyword)) {
        scores[categoriaSlug] += 5
      }
    }
  }

  // Retornar categoría con mayor score
  const maxScore = Math.max(...Object.values(scores))
  const ganador = Object.entries(scores).find(([_, score]) => score === maxScore)

  return ganador ? ganador[0] : 'legislacion' // fallback
}
```

**Testing:**
```typescript
// tests/clasificador.test.ts
describe('Clasificador', () => {
  test('clasifica oposición correctamente', () => {
    const doc = {
      titulo: 'Convocatoria de 100 plazas de Maestro',
      identificador: 'BOE-A-2025-12345'
    }
    const categoria = clasificarDocumento(doc, 'II', 'Ministerio Educación', 'Oposiciones')
    expect(categoria).toBe('oposiciones')
  })

  test('clasifica ayuda correctamente', () => {
    const doc = {
      titulo: 'Subvención para digitalización de PYMES',
      identificador: 'BOE-A-2025-12346'
    }
    const categoria = clasificarDocumento(doc, 'III', 'Ministerio Industria')
    expect(categoria).toBe('ayudas')
  })
})
```

**Tiempo estimado:** 12 horas
**Complejidad:** Media

---

### Semana 2: Procesamiento Nivel 1

#### Día 8-10: Función Batch Semanal (Estructura)

**Archivo:** `netlify/functions/scheduled-weekly.ts` (NUEVO)

**Tareas:**
```
□ Crear scheduled function básica
  ├─ Setup con @netlify/functions
  ├─ Schedule: 0 1 * * 0 (Domingo 1am)
  └─ Testing con netlify dev

□ Implementar Nivel 1
  ├─ Fetch sumarios de la semana (L-V)
  ├─ Normalizar estructura
  ├─ Clasificar documentos
  └─ Insertar en Supabase

□ Logging robusto
  ├─ Inicio/fin de procesamiento
  ├─ Documentos procesados por día
  ├─ Errores encontrados
  └─ Tiempo total

□ Manejo de errores
  ├─ Retry para API BOE (3 intentos)
  ├─ Continuar si un día falla
  └─ Log en procesamiento_log tabla
```

**Código estructura:**
```typescript
// netlify/functions/scheduled-weekly.ts
import { schedule } from '@netlify/functions'

export const handler = schedule('0 1 * * 0', async (event) => {
  console.log('🚀 Iniciando procesamiento semanal Nivel 1')

  const inicio = Date.now()
  const stats = {
    dias_procesados: 0,
    documentos_clasificados: 0,
    errores: []
  }

  try {
    // 1. Determinar fechas de la semana pasada
    const { lunes, viernes } = getLastWeekDates()
    console.log(`📅 Procesando semana: ${lunes} a ${viernes}`)

    // 2. Fetch sumarios
    const sumarios = await fetchSemanaCompleta(lunes, viernes)
    stats.dias_procesados = sumarios.length

    // 3. Procesar cada sumario
    for (const sumario of sumarios) {
      const documentos = normalizarSumario(sumario)

      for (const doc of documentos) {
        try {
          await procesarNivel1(doc)
          stats.documentos_clasificados++
        } catch (error) {
          console.error(`Error procesando ${doc.identificador}:`, error)
          stats.errores.push({
            doc: doc.identificador,
            error: error.message
          })
        }
      }
    }

    // 4. Log resultados
    console.log(`✅ Completado en ${Date.now() - inicio}ms`)
    console.log(`📊 Stats:`, stats)

    await guardarLogProcesamiento({
      semana_inicio: lunes,
      semana_fin: viernes,
      nivel: 1,
      stats,
      completado: true
    })

    return {
      statusCode: 200,
      body: JSON.stringify(stats)
    }

  } catch (error) {
    console.error('❌ Error fatal:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
})

async function procesarNivel1(doc: BOEItem) {
  // Clasificar
  const categoria = clasificarDocumento(doc, doc.seccion, doc.departamento)
  const categoriaId = await getCategoriaIdBySlug(categoria)

  // Extraer datos básicos con regex
  const datosBasicos = extraerDatosBasicos(doc)

  // Insertar en BD
  await supabase.from('documentos_boe').insert({
    boe_id: doc.identificador,
    categoria_id: categoriaId,
    fecha_publicacion: doc.fecha,
    titulo: doc.titulo,
    seccion: doc.seccion,
    departamento: doc.departamento,
    url_pdf: doc.url_pdf.texto,
    url_xml: doc.url_xml,
    url_html: doc.url_html,
    datos_estructurados: datosBasicos,
    keywords: extraerKeywords(doc.titulo),
    procesado: false
  })
}
```

**Tiempo estimado:** 16 horas
**Complejidad:** Alta

---

#### Día 11-14: Testing y Ajustes

**Tareas:**
```
□ Testing end-to-end Nivel 1
  ├─ Run function manualmente con fecha test
  ├─ Verificar documentos en Supabase
  ├─ Verificar clasificación correcta
  └─ Verificar datos_estructurados

□ Testing de categorías
  ├─ Revisar muestra de cada categoría
  ├─ Validar que la clasificación es correcta
  └─ Ajustar keywords si necesario

□ Performance
  ├─ Medir tiempo de ejecución
  ├─ Optimizar queries si es lento
  └─ Verificar que no excede timeout (10min Netlify)

□ Documentation
  ├─ Comentar código
  ├─ Añadir README con instrucciones
  └─ Documentar env variables necesarias
```

**Tiempo estimado:** 12 horas
**Complejidad:** Media

---

### Entregables Fase 1

✅ Supabase funcionando con schema completo
✅ 12 categorías seedeadas
✅ API Proxy BOE con cache
✅ Sistema de clasificación funcionando
✅ Función batch semanal Nivel 1 operativa
✅ ~2,500 documentos procesados en primera ejecución

**Tiempo total Fase 1:** 54 horas (~2 semanas)
**Riesgo:** Bajo-Medio

---

## ⚡ FASE 2: PROCESAMIENTO BÁSICO (Semanas 3-4)

**Objetivo:** Extracción de datos estructurados para categorías prioritarias

### Hitos Principales

✅ **Hito 2.1:** Extractores por categoría implementados
✅ **Hito 2.2:** Nivel 2 integrado en batch semanal
✅ **Hito 2.3:** Datos ricos disponibles para P3+P2
✅ **Hito 2.4:** API de búsqueda avanzada funcionando

---

### Semana 3: Extractores Especializados

#### Día 15-17: Extractor de Oposiciones

**Archivo:** `netlify/functions/lib/extractores/oposiciones.ts` (NUEVO)

**Tareas:**
```
□ Clase OposicionesExtractor
  ├─ extraerNumPlazas()
  ├─ extraerTipoConvocatoria()
  ├─ extraerRequisitos()
  ├─ extraerFechas()
  └─ extraerURLs()

□ Testing con documentos reales
  ├─ Descargar 5-10 XMLs reales
  ├─ Verificar extracción correcta
  └─ Ajustar regex según necesario

□ Manejo de casos edge
  ├─ XML sin plazas especificadas
  ├─ Fechas en diferentes formatos
  └─ Requisitos complejos
```

**Código ejemplo:**
```typescript
// lib/extractores/oposiciones.ts
export class OposicionesExtractor {
  async extraer(xml: string, doc: Documento) {
    const parsed = parseXML(xml)
    const texto = parsed.contenido

    return {
      // Plazas
      num_plazas: this.extraerNumPlazas(texto),
      distribucion_plazas: this.extraerDistribucion(texto),

      // Tipo
      tipo_convocatoria: this.extraerTipo(texto),
      sistema_seleccion: this.extraerSistema(texto),

      // Requisitos
      requisitos: {
        titulacion: this.extraerTitulacion(texto),
        edad_min: this.extraerEdadMin(texto),
        edad_max: this.extraerEdadMax(texto),
        nacionalidad: this.extraerNacionalidad(texto),
        otros: this.extraerOtrosRequisitos(texto)
      },

      // Fechas críticas
      fechas: {
        publicacion: doc.fecha_publicacion,
        inicio_inscripcion: this.extraerFechaInscripcion(texto),
        fin_inscripcion: this.extraerFechaFinInscripcion(texto),
        examen_previsto: this.extraerFechaExamen(texto),
        resolucion_prevista: this.extraerFechaResolucion(texto)
      },

      // Proceso
      fases_proceso: this.extraerFases(texto),
      puntuacion_maxima: this.extraerPuntuacion(texto),

      // URLs
      bases_url: this.extraerURLBases(texto),
      inscripcion_url: this.extraerURLInscripcion(texto),
      temario_url: this.extraerURLTemario(texto)
    }
  }

  private extraerNumPlazas(texto: string): number | null {
    const patterns = [
      /se\s+convocan?\s+(\d+)\s+plazas?/i,
      /(\d+)\s+plazas?\s+(?:para|de)/i,
      /total[es]*\s*:?\s*(\d+)/i,
      /número\s+de\s+plazas?\s*:?\s*(\d+)/i
    ]

    for (const pattern of patterns) {
      const match = texto.match(pattern)
      if (match) {
        return parseInt(match[1])
      }
    }

    return null
  }

  // ... más métodos
}
```

**Tiempo estimado:** 14 horas
**Complejidad:** Alta

---

#### Día 18-20: Extractores de Ayudas y Legislación

**Similar estructura para:**
- `extractores/ayudas.ts`
- `extractores/legislacion.ts`

**Tiempo estimado:** 16 horas por extractor = 32 horas total

---

#### Día 21: Integración Nivel 2

**Archivo:** Modificar `scheduled-weekly.ts`

**Tareas:**
```
□ Añadir paso Nivel 2 después de Nivel 1
  ├─ Filtrar docs que requieren Nivel 2
  ├─ Fetch XML en batches
  ├─ Ejecutar extractor correspondiente
  └─ Update datos_estructurados

□ Rate limiting para XML fetch
  ├─ Max 10 concurrentes
  ├─ Pausa 2s entre batches
  └─ Retry en caso de error

□ Testing con semana real
  └─ Verificar que procesa ~1,000 docs
```

**Tiempo estimado:** 8 horas

---

### Semana 4: APIs y Testing

#### Día 22-24: API de Búsqueda Avanzada

**Archivo:** `server/api/search.ts` (NUEVO)

**Tareas:**
```
□ Endpoint POST /api/search
  ├─ Filtros: categoria, fecha_desde, fecha_hasta
  ├─ Full-text search en título
  ├─ Filtros por datos_estructurados
  └─ Paginación

□ Queries optimizadas
  ├─ Usar índices GIN existentes
  ├─ EXPLAIN ANALYZE para verificar performance
  └─ Cache de queries frecuentes

□ Testing
  ├─ Búsqueda por keywords
  ├─ Filtros combinados
  └─ Performance con 10k+ documentos
```

**Código:**
```typescript
// server/api/search.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    query,
    categoria,
    fecha_desde,
    fecha_hasta,
    limit = 20,
    offset = 0
  } = body

  let dbQuery = supabase
    .from('documentos_boe')
    .select(`
      *,
      categoria:categorias(*)
    `, { count: 'exact' })
    .eq('procesado', true)

  // Filtro por texto
  if (query) {
    dbQuery = dbQuery.or(`titulo.ilike.%${query}%,keywords.cs.{${query}}`)
  }

  // Filtro por categoría
  if (categoria) {
    dbQuery = dbQuery.eq('categoria_id', categoria)
  }

  // Filtro por fecha
  if (fecha_desde) {
    dbQuery = dbQuery.gte('fecha_publicacion', fecha_desde)
  }
  if (fecha_hasta) {
    dbQuery = dbQuery.lte('fecha_publicacion', fecha_hasta)
  }

  const { data, error, count } = await dbQuery
    .order('fecha_publicacion', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  return {
    results: data,
    total: count,
    limit,
    offset
  }
})
```

**Tiempo estimado:** 14 horas

---

#### Día 25-28: Testing Exhaustivo Fase 2

**Tareas:**
```
□ Testing de extractores
  ├─ Verificar datos extraídos son correctos
  ├─ Probar con XMLs problemáticos
  └─ Ajustar regex según resultados

□ Testing de búsqueda
  ├─ Queries complejas
  ├─ Performance
  └─ Edge cases

□ Testing end-to-end
  ├─ Ejecutar batch completo (Nivel 1 + 2)
  ├─ Verificar BD poblada correctamente
  └─ Verificar API búsqueda retorna datos correctos

□ Documentation
  ├─ Documentar API de búsqueda
  ├─ Ejemplos de queries
  └─ Casos de uso
```

**Tiempo estimado:** 12 horas

---

### Entregables Fase 2

✅ 3 extractores especializados (Oposiciones, Ayudas, Legislación)
✅ Nivel 2 integrado en batch semanal
✅ ~1,000 documentos/semana con datos ricos
✅ API de búsqueda avanzada
✅ Performance optimizada

**Tiempo total Fase 2:** 80 horas (~2 semanas)
**Riesgo:** Medio

---

## 🤖 FASE 3: INTELIGENCIA LLM (Semanas 5-6)

**Objetivo:** Explicaciones educativas generadas por LLM

### Hitos Principales

✅ **Hito 3.1:** Sistema de agentes implementado
✅ **Hito 3.2:** Prompts optimizados por categoría
✅ **Hito 3.3:** Nivel 3 integrado con límites de coste
✅ **Hito 3.4:** Explicaciones disponibles en UI

---

### Semana 5: Sistema de Agentes

#### Día 29-31: Coordinador de Agentes

**Archivo:** `netlify/functions/lib/agentes/coordinador.ts` (NUEVO)

**Tareas:**
```
□ Clase AgenteCoordinador
  ├─ Decide qué agentes ejecutar según categoría
  ├─ Gestiona ejecución secuencial
  ├─ Combina resultados
  └─ Guarda en BD

□ Validación de explicaciones
  ├─ Check longitud apropiada
  ├─ Check estructura esperada
  └─ Retry si falla validación

□ Logging y métricas
  ├─ Tokens por documento
  ├─ Tiempo de generación
  └─ Coste acumulado
```

**Ver código completo en:** `ARQUITECTURA_PROPUESTA_V2.md`

**Tiempo estimado:** 14 horas
**Complejidad:** Alta

---

#### Día 32-34: Implementación de Prompts

**Archivos:**
- `lib/agentes/prompts/oposiciones.ts`
- `lib/agentes/prompts/ayudas.ts`
- `lib/agentes/prompts/legislacion.ts`

**Tareas:**
```
□ Implementar todos los prompts de AGENTES_LLM.md
  ├─ Templates con variables
  ├─ Validación de output
  └─ Ejemplos de testing

□ Testing con documentos reales
  ├─ Verificar que explicaciones tienen sentido
  ├─ Ajustar prompts según calidad
  └─ Optimizar tokens

□ Sistema de fallbacks
  └─ Si LLM falla, guardar error pero continuar
```

**Tiempo estimado:** 18 horas

---

#### Día 35: Integración Nivel 3

**Archivo:** Modificar `scheduled-weekly.ts`

**Tareas:**
```
□ Añadir paso Nivel 3 después de Nivel 2
  ├─ Filtrar docs high-value (~400)
  ├─ Para cada uno, ejecutar coordinador
  ├─ Rate limiting: 1 doc cada 500ms
  └─ Progress logging cada 50 docs

□ Control de costes
  ├─ Max $30 por ejecución
  ├─ Stop si se excede
  └─ Log warning

□ Testing
  └─ Ejecutar con 50 docs para validar
```

**Tiempo estimado:** 8 horas

---

### Semana 6: Testing y Ajustes

#### Día 36-40: Testing Exhaustivo LLM

**Tareas:**
```
□ Validación manual de explicaciones
  ├─ Revisar 50 explicaciones generadas
  ├─ Verificar que son útiles y claras
  ├─ Ajustar prompts según feedback
  └─ Iterar hasta calidad aceptable

□ Testing de costes
  ├─ Ejecutar batch completo
  ├─ Medir coste real vs estimado
  └─ Ajustar límites si necesario

□ Performance
  ├─ Verificar que no excede timeout
  ├─ Optimizar si es necesario
  └─ Considerar splitting en múltiples functions

□ Error handling
  ├─ Qué pasa si OpenAI API falla
  ├─ Qué pasa si rate limit
  └─ Retry logic
```

**Tiempo estimado:** 20 horas

---

#### Día 41-42: Documentación

**Tareas:**
```
□ Documentar sistema de agentes
  ├─ Cómo funciona
  ├─ Cómo añadir nuevos agentes
  └─ Troubleshooting

□ Guía de prompts
  ├─ Best practices
  ├─ Cómo ajustar según feedback
  └─ Ejemplos

□ Métricas y monitoring
  ├─ Dashboard en Supabase
  ├─ Queries útiles
  └─ Alertas (si coste > threshold)
```

**Tiempo estimado:** 8 horas

---

### Entregables Fase 3

✅ Sistema de agentes LLM funcionando
✅ Prompts optimizados para 3 categorías principales
✅ ~400 documentos/semana con explicaciones
✅ Control de costes implementado
✅ Calidad validada manualmente

**Tiempo total Fase 3:** 68 horas (~2 semanas)
**Riesgo:** Medio-Alto (depende de calidad LLM)

---

## 🎨 FASE 4: UI/UX AVANZADA (Semanas 7-8)

**Objetivo:** Interfaces que muestren el valor del procesamiento inteligente

*(Ver detalles completos en `UI_PROPUESTAS.md`)*

### Semana 7: Rediseño de Páginas Clave

#### Día 43-45: Página de Categoría Individual

**Archivo:** `pages/categorias/[slug].vue` (Ya existe, mejorar)

**Mejoras:**
```
□ Sección Hero con estadísticas dinámicas
  ├─ Total docs esta semana vs anterior
  ├─ Documentos destacados
  └─ Gráfico de tendencia

□ Resumen semanal LLM destacado
  ├─ Card grande con insights
  ├─ Tendencias identificadas
  └─ Documentos importantes

□ Lista de documentos mejorada
  ├─ Vista previa de explicación
  ├─ Tags de fechas importantes
  ├─ Iconos de estado (nuevo, urgente)
  └─ Filtros avanzados

□ Sidebar con utilidades
  ├─ Búsqueda rápida en categoría
  ├─ Filtros por fecha
  └─ FAQs de la categoría
```

**Tiempo estimado:** 16 horas

---

#### Día 46-48: Modal de Documento

**Componente:** `components/DocumentoDetailModal.vue` (Nuevo)

**Features:**
```
□ Tabs de información
  ├─ Resumen (explicación LLM)
  ├─ Requisitos (si aplica)
  ├─ Cómo actuar (pasos)
  └─ Documento original (link BOE)

□ Sidebar con metadata
  ├─ Fechas importantes destacadas
  ├─ Datos estructurados clave
  └─ Compartir/Guardar

□ Accesibilidad
  ├─ Keyboard navigation
  ├─ ARIA labels
  └─ Focus trap
```

**Tiempo estimado:** 14 horas

---

### Semana 8: Features Avanzadas

#### Día 49-51: Búsqueda Global

**Página:** `pages/buscar.vue` (Nueva)

**Features:**
```
□ Input de búsqueda con autocomplete
  ├─ Sugerencias basadas en keywords
  ├─ Búsqueda histórica
  └─ Highlighting de términos

□ Filtros laterales
  ├─ Por categoría (multi-select)
  ├─ Por rango de fechas
  ├─ Por tipo de documento
  └─ Filtros avanzados (plazas, cuantía, etc)

□ Resultados
  ├─ Cards con snippet
  ├─ Ordenación (relevancia, fecha)
  └─ Paginación
```

**Tiempo estimado:** 16 horas

---

#### Día 52-56: Visualizaciones y Analytics

**Componentes:**
- `components/TendenciaChart.vue`
- `components/EstadisticasSemana.vue`

**Features:**
```
□ Gráficos de tendencias
  ├─ Documentos por semana
  ├─ Documentos por categoría
  └─ Comparativa histórica

□ Heatmap de actividad
  └─ Qué días se publica más

□ Top documentos
  ├─ Más vistos
  ├─ Más guardados
  └─ Más urgentes
```

**Tiempo estimado:** 14 horas

---

### Entregables Fase 4

✅ Página de categoría rediseñada
✅ Modal de documento con explicaciones
✅ Búsqueda global funcional
✅ Visualizaciones de datos
✅ UI responsive y accesible

**Tiempo total Fase 4:** 60 horas (~2 semanas)
**Riesgo:** Bajo-Medio

---

## 🚀 FASE 5: OPTIMIZACIÓN (Semanas 9-10)

**Objetivo:** Pulir, optimizar y preparar para producción

### Semana 9: Performance y SEO

#### Tareas

```
□ Performance
  ├─ Lighthouse audit → Score > 90
  ├─ Core Web Vitals optimización
  ├─ Image optimization
  ├─ Code splitting
  └─ Lazy loading

□ SEO
  ├─ Meta tags por página
  ├─ Open Graph tags
  ├─ Structured data (JSON-LD)
  ├─ Sitemap dinámico
  └─ robots.txt

□ Caching
  ├─ Service Worker (opcional)
  ├─ CDN setup completo
  └─ Stale-while-revalidate strategy
```

**Tiempo estimado:** 20 horas

---

### Semana 10: Testing y Launch

#### Tareas

```
□ Testing exhaustivo
  ├─ User testing (5-10 usuarios)
  ├─ Bug fixing
  ├─ Edge cases
  └─ Cross-browser testing

□ Monitoring
  ├─ Setup Sentry (opcional)
  ├─ Analytics (Plausible/Google Analytics)
  ├─ Dashboards
  └─ Alertas

□ Documentation final
  ├─ User guide
  ├─ Admin guide
  ├─ API documentation
  └─ Contribution guidelines

□ Launch
  ├─ Deploy a producción
  ├─ Verificar scheduled functions
  ├─ Monitoreo 24h
  └─ Comunicación/marketing
```

**Tiempo estimado:** 20 horas

---

### Entregables Fase 5

✅ Performance optimizada (Lighthouse > 90)
✅ SEO completo
✅ Monitoring en producción
✅ Testing exhaustivo completado
✅ Documentación completa
✅ **LAUNCH** 🚀

**Tiempo total Fase 5:** 40 horas (~2 semanas)
**Riesgo:** Bajo

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs Técnicos

| Métrica | Target | Medición |
|---------|--------|----------|
| **Documentos procesados/semana** | 2,500+ | Supabase count |
| **Cobertura Nivel 2 (P3+P2)** | 1,000+ | docs con procesado=true |
| **Cobertura Nivel 3 (LLM)** | 400+ | count explicaciones_llm |
| **Coste mensual** | < $100 | Suma de facturas API |
| **Uptime scheduled functions** | > 99% | Netlify monitoring |
| **Lighthouse Performance** | > 90 | Lighthouse CI |
| **Tiempo batch semanal** | < 2h | procesamiento_log |

### KPIs de Negocio

| Métrica | Target | Medición |
|---------|--------|----------|
| **Usuarios únicos/mes** | 10,000+ | Analytics |
| **Páginas vistas/mes** | 50,000+ | Analytics |
| **Tiempo medio sesión** | > 3 min | Analytics |
| **Bounce rate** | < 60% | Analytics |
| **Búsquedas/día** | 500+ | DB logs |
| **Documentos guardados** | 100+/semana | favoritos tabla |

### KPIs de Calidad

| Métrica | Target | Medición |
|---------|--------|----------|
| **Clasificación correcta** | > 95% | Manual review |
| **Datos extraídos correctos** | > 90% | Manual review |
| **Explicaciones útiles** | > 80% | User feedback |
| **Bugs críticos** | 0 | Issue tracker |

---

## ⚠️ RIESGOS Y MITIGACIÓN

### Riesgo 1: API del BOE Inestable

**Probabilidad:** Media
**Impacto:** Alto

**Mitigación:**
```
□ Implementar retry logic robusto (3 intentos)
□ Timeout de 30s por request
□ Cache agresivo de respuestas exitosas
□ Monitoreo y alertas si falla
□ Plan B: Scraping HTML si API falla
```

---

### Riesgo 2: Costes LLM Más Altos de lo Esperado

**Probabilidad:** Media
**Impacto:** Medio

**Mitigación:**
```
□ Límite hard de $30 por ejecución batch
□ Prompts optimizados para mínimo tokens
□ Monitoreo en tiempo real de coste
□ Reducir número de docs procesados si necesario
□ Considerar modelo más barato si es viable
```

---

### Riesgo 3: Calidad de Explicaciones LLM Baja

**Probabilidad:** Media-Baja
**Impacto:** Alto

**Mitigación:**
```
□ Testing exhaustivo antes de automatizar
□ Validación automática de estructura
□ Manual review de muestra (50 docs)
□ Iteración de prompts según feedback
□ Regeneración automática si falla validación
```

---

### Riesgo 4: Performance Issues con Volumen

**Probabilidad:** Baja
**Impacto:** Medio

**Mitigación:**
```
□ Índices optimizados en Supabase
□ Queries analizadas con EXPLAIN
□ Paginación en todos los endpoints
□ CDN para assets estáticos
□ Monitoring de query performance
```

---

### Riesgo 5: Timeout en Netlify Functions

**Probabilidad:** Media
**Impacto:** Medio

**Mitigación:**
```
□ Límite: 10 minutos por function
□ Batch processing en chunks
□ Progress saving (reanudar si falla)
□ Split en múltiples functions si necesario
□ Background jobs para procesamiento largo
```

---

## 📅 CRONOGRAMA RESUMIDO

| Fase | Duración | Esfuerzo | Riesgo | Prioridad |
|------|----------|----------|---------|-----------|
| **Fase 1: Fundamentos** | 2 semanas | 54h | Bajo-Medio | 🔴 Crítica |
| **Fase 2: Procesamiento** | 2 semanas | 80h | Medio | 🔴 Crítica |
| **Fase 3: LLM** | 2 semanas | 68h | Medio-Alto | 🟡 Alta |
| **Fase 4: UI/UX** | 2 semanas | 60h | Bajo-Medio | 🟡 Alta |
| **Fase 5: Optimización** | 2 semanas | 40h | Bajo | 🟢 Media |
| **TOTAL** | **10 semanas** | **302h** | - | - |

**Equivalente a:**
- 1 desarrollador full-time: 10 semanas
- 2 desarrolladores: 5 semanas
- 1 desarrollador part-time (20h/semana): 15 semanas

---

## 🎯 RECOMENDACIONES FINALES

### Enfoque Iterativo

1. **No esperar a perfecto**
   - Lanzar Fase 1+2 aunque Fase 3 no esté lista
   - Recoger feedback temprano
   - Ajustar roadmap según uso real

2. **Priorizar valor**
   - Fase 1+2 ya dan MUCHO valor (BD completa + búsqueda)
   - Fase 3 es la guinda del pastel
   - Fase 4 mejora UX pero no es bloqueante

3. **Medir y ajustar**
   - Tracking de métricas desde día 1
   - Decisiones basadas en datos
   - Pivoting rápido si algo no funciona

### Quick Wins

**Semana 1-2 (Fase 1):**
- ✅ Ya tienes BD completa y buscable
- ✅ Valor inmediato: Encontrar documentos BOE
- ✅ SEO: Miles de páginas indexables

**Semana 3-4 (Fase 2):**
- ✅ Búsquedas avanzadas (por plazas, cuantías, fechas)
- ✅ Filtros precisos
- ✅ Datos ricos para mostrar

**Semana 5-6 (Fase 3):**
- ✅ Explicaciones que nadie más tiene
- ✅ Ventaja competitiva clara
- ✅ Usuario realmente ayudado

---

## 📚 PRÓXIMOS PASOS

1. ✅ Revisar este plan con el equipo
2. ✅ Aprobar presupuesto (~$50-100/mes)
3. ✅ Asignar recursos (desarrollador/es)
4. ⏭️ Empezar Fase 1: Día 1
5. ⏭️ Checkpoint cada 2 semanas
6. ⏭️ Launch target: Semana 10

---

**Siguiente documento:** `UI_PROPUESTAS.md` para wireframes y diseños detallados.
