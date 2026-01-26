# Arquitectura Propuesta V2: Sistema Inteligente de Procesamiento BOE
## Diseño Completo con Agentes LLM Especializados

**Fecha:** 24 de Noviembre, 2025
**Versión:** 2.0
**Estado:** Propuesta - Pendiente Aprobación

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Arquitectura de 3 Niveles](#arquitectura-de-3-niveles)
3. [Sistema de Agentes LLM](#sistema-de-agentes-llm)
4. [Flujo de Datos Completo](#flujo-de-datos-completo)
5. [Estrategia de Procesamiento](#estrategia-de-procesamiento)
6. [Optimización de Costes](#optimización-de-costes)
7. [Infraestructura Técnica](#infraestructura-técnica)
8. [Comparativa de Opciones](#comparativa-de-opciones)

---

## 🎯 VISIÓN GENERAL

### Problema Actual

❌ **Lo que NO funciona:**
- Búsqueda por fecha muestra BOE crudo sin valor añadido
- Categorías existen pero no tienen contenido inteligente
- No hay sistema de procesamiento automático
- No hay estrategia clara de cuándo/qué procesar
- Sin explicaciones que ayuden realmente al usuario

### Solución Propuesta

✅ **Sistema de 3 Niveles + Agentes Especializados:**

```
┌─────────────────────────────────────────────────┐
│         NIVEL 1: CLASIFICACIÓN BÁSICA           │
│         (TODOS los documentos - GRATIS)         │
│                                                 │
│  • Sumario BOE diario                          │
│  • Clasificación por sección + keywords        │
│  • Extracción básica (fechas, cuantías)       │
│  • Guardar en Supabase                         │
│                                                 │
│  Coste: $0/mes                                 │
│  Procesamiento: 2,500 docs/semana              │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│      NIVEL 2: EXTRACCIÓN ESTRUCTURADA          │
│      (Solo categorías P3 y P2 - BARATO)        │
│                                                 │
│  • Fetch XML de documentos prioritarios        │
│  • Regex avanzado para datos estructurados     │
│  • Parseo específico por categoría             │
│  • Indexación completa                         │
│                                                 │
│  Coste: ~$30/mes (requests API)                │
│  Procesamiento: 1,000 docs/semana              │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│     NIVEL 3: AGENTES LLM ESPECIALIZADOS        │
│     (Solo docs high-value - MODERADO)          │
│                                                 │
│  • LLM por categoría con prompts únicos        │
│  • Explicaciones educativas                    │
│  • Guías prácticas                             │
│  • FAQs automáticas                            │
│                                                 │
│  Coste: ~$20/mes (GPT-4o-mini)                │
│  Procesamiento: 400 docs/semana                │
└─────────────────────────────────────────────────┘

Total Coste Estimado: ~$50/mes
```

---

## 🏗️ ARQUITECTURA DE 3 NIVELES

### NIVEL 1: Clasificación Universal (TODOS)

**Objetivo:** Base de datos completa y buscable de TODO el BOE

**Proceso:**
```typescript
async function procesarNivel1(fecha: Date) {
  // 1. Fetch sumario del día
  const sumario = await fetchSumarioBOE(fecha)

  // 2. Normalizar estructura (manejar arrays/objects)
  const documentos = normalizarSumario(sumario)

  // 3. Clasificar cada documento
  for (const doc of documentos) {
    const categoria = clasificarDocumento(doc)
    const datosBasicos = extraerDatosBasicos(doc)

    // 4. Guardar en Supabase
    await supabase.from('documentos_boe').insert({
      boe_id: doc.identificador,
      categoria_id: categoria.id,
      fecha_publicacion: fecha,
      titulo: doc.titulo,
      seccion: doc.seccion,
      departamento: doc.departamento,
      url_pdf: doc.url_pdf,
      url_xml: doc.url_xml,
      url_html: doc.url_html,
      // Datos extraídos con regex
      datos_estructurados: datosBasicos,
      keywords: extraerKeywords(doc.titulo),
      procesado: false // Nivel 1 no es procesamiento completo
    })
  }
}

function clasificarDocumento(doc: BOEItem): Categoria {
  // Sistema de puntuación por keywords
  const scores = {}

  for (const categoria of CATEGORIAS) {
    let score = 0

    // 1. Puntos por sección
    if (categoria.seccionesPreferidas.includes(doc.seccion)) {
      score += 10
    }

    // 2. Puntos por keywords en título
    const tituloLower = doc.titulo.toLowerCase()
    for (const keyword of categoria.keywords) {
      if (tituloLower.includes(keyword)) {
        score += 5
      }
    }

    // 3. Puntos por departamento
    if (categoria.departamentos?.includes(doc.departamento)) {
      score += 8
    }

    // 4. Puntos por epígrafe
    if (doc.epigrafe && categoria.epigrafes?.includes(doc.epigrafe)) {
      score += 15
    }

    scores[categoria.slug] = score
  }

  // Retornar categoría con mayor score
  return getCategoriaBySlug(getMaxScore(scores))
}
```

**Datos Extraídos (Regex):**
```typescript
function extraerDatosBasicos(doc: BOEItem) {
  const titulo = doc.titulo
  const datos: any = {}

  // Fechas
  const fechaRegex = /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/g
  datos.fechas_mencionadas = extraerTodasLasFechas(titulo)

  // Plazos
  const plazoRegex = /plazo\s+de\s+(\d+)\s+(días?|meses?)/gi
  datos.plazos = [...titulo.matchAll(plazoRegex)].map(m => ({
    cantidad: m[1],
    unidad: m[2]
  }))

  // Cuantías (euros)
  const cuantiaRegex = /(\d+(?:\.\d+)?(?:\.\d+)?)\s*(?:euros?|€)/gi
  datos.cuantias = [...titulo.matchAll(cuantiaRegex)].map(m => m[1])

  // Número de plazas
  const plazasRegex = /(\d+)\s+plazas?/gi
  const matchPlazas = titulo.match(plazasRegex)
  if (matchPlazas) {
    datos.num_plazas = parseInt(matchPlazas[0])
  }

  // Rango del documento
  const rangos = ['Ley Orgánica', 'Ley', 'Real Decreto-ley', 'Real Decreto',
                  'Orden', 'Resolución', 'Anuncio', 'Corrección']
  for (const rango of rangos) {
    if (titulo.includes(rango)) {
      datos.rango = rango
      break
    }
  }

  return datos
}
```

**Resultado:**
- ✅ Base de datos completa: ~2,500 docs/semana
- ✅ Clasificados por categoría
- ✅ Datos básicos extraídos
- ✅ Buscables por keywords
- ✅ Coste: $0

---

### NIVEL 2: Extracción Estructurada (P3 + P2)

**Objetivo:** Datos ricos para documentos importantes

**Criterios de Selección:**
```typescript
function requiereNivel2(doc: Documento): boolean {
  // Solo categorías prioritarias
  if (doc.categoria.prioridad < 2) return false

  // Filtros adicionales
  const filtrosExclusion = [
    'lista de admitidos',
    'lista de excluidos',
    'corrección de errores',
    'fe de erratas'
  ]

  const tituloLower = doc.titulo.toLowerCase()
  for (const filtro of filtrosExclusion) {
    if (tituloLower.includes(filtro)) return false
  }

  return true
}
```

**Proceso:**
```typescript
async function procesarNivel2(doc: Documento) {
  // 1. Fetch XML del documento
  const xml = await fetch(doc.url_xml).then(r => r.text())
  const parsedXML = parseXML(xml)

  // 2. Extracción específica por categoría
  const extractor = getExtractorByCategoria(doc.categoria.slug)
  const datosEstructurados = await extractor.extraer(parsedXML)

  // 3. Actualizar en BD
  await supabase
    .from('documentos_boe')
    .update({
      datos_estructurados: datosEstructurados,
      fechas_importantes: datosEstructurados.fechas,
      procesado: true
    })
    .eq('id', doc.id)
}
```

**Extractores por Categoría:**

```typescript
// Ejemplo: Extractor de Oposiciones
class OposicionesExtractor {
  async extraer(xml: ParsedXML) {
    const texto = xml.contenido

    return {
      // Plazas
      num_plazas: this.extraerNumPlazas(texto),
      tipo_convocatoria: this.extraerTipo(texto), // libre, promocion

      // Organismo
      organismo_completo: this.extraerOrganismo(texto),

      // Requisitos
      requisitos: {
        titulacion: this.extraerTitulacion(texto),
        edad_min: this.extraerEdadMin(texto),
        edad_max: this.extraerEdadMax(texto),
        otros: this.extraerOtrosRequisitos(texto)
      },

      // Fechas críticas
      fechas: {
        publicacion: xml.metadatos.fecha_publicacion,
        inicio_inscripcion: this.extraerFechaInscripcion(texto),
        fin_inscripcion: this.extraerFechaFinInscripcion(texto),
        examen_previsto: this.extraerFechaExamen(texto)
      },

      // URLs útiles
      bases_url: this.extraerURLBases(texto),
      inscripcion_url: this.extraerURLInscripcion(texto),

      // Metadata
      temario_disponible: this.tieneTemario(texto),
      proceso_completo: this.esProcesoCompleto(texto)
    }
  }

  private extraerNumPlazas(texto: string): number | null {
    const patterns = [
      /se convocan\s+(\d+)\s+plazas?/i,
      /(\d+)\s+plazas?\s+para/i,
      /total(?:es)?\s*:\s*(\d+)\s+plazas?/i
    ]

    for (const pattern of patterns) {
      const match = texto.match(pattern)
      if (match) return parseInt(match[1])
    }

    return null
  }

  // ... más métodos de extracción
}

// Ejemplo: Extractor de Ayudas
class AyudasExtractor {
  async extraer(xml: ParsedXML) {
    const texto = xml.contenido

    return {
      // Económico
      cuantia_min: this.extraerCuantiaMin(texto),
      cuantia_max: this.extraerCuantiaMax(texto),
      porcentaje_subvencionable: this.extraerPorcentaje(texto),
      presupuesto_total: this.extraerPresupuestoTotal(texto),

      // Requisitos
      requisitos: {
        persona_juridica: this.esPersonaJuridica(texto),
        persona_fisica: this.esPersonaFisica(texto),
        renta_maxima: this.extraerRentaMaxima(texto),
        sector: this.extraerSector(texto),
        ubicacion: this.extraerUbicacion(texto)
      },

      // Fechas
      fechas: {
        apertura_solicitudes: this.extraerFechaApertura(texto),
        cierre_solicitudes: this.extraerFechaCierre(texto),
        resolucion_prevista: this.extraerFechaResolucion(texto)
      },

      // Gastos
      gastos_elegibles: this.extraerGastosElegibles(texto),
      gastos_excluidos: this.extraerGastosExcluidos(texto),

      // URLs
      solicitud_url: this.extraerURLSolicitud(texto),
      bases_url: this.extraerURLBases(texto)
    }
  }
}
```

**Resultado:**
- ✅ ~1,000 docs/semana con datos ricos
- ✅ Búsquedas avanzadas posibles
- ✅ Filtros precisos (por cuantía, plazas, fecha límite)
- ✅ Coste: ~$30/mes (bandwidth + processing)

---

### NIVEL 3: Agentes LLM Especializados (High-Value)

**Objetivo:** Explicaciones educativas que transformen datos en conocimiento

**Criterios de Selección:**
```typescript
function requiereNivel3(doc: Documento): boolean {
  // Solo P3 (máxima prioridad)
  if (doc.categoria.prioridad !== 3) return false

  // Solo convocatorias nuevas (no listas, no correcciones)
  const esConvocatoriaNueva =
    doc.titulo.toLowerCase().includes('convoca') &&
    !doc.titulo.toLowerCase().includes('lista de') &&
    !doc.titulo.toLowerCase().includes('corrección')

  // O cambios legislativos importantes
  const esLegislacionImportante =
    doc.categoria.slug === 'legislacion' &&
    ['Ley', 'Real Decreto-ley', 'Real Decreto'].some(r =>
      doc.datos_estructurados?.rango === r
    )

  return esConvocatoriaNueva || esLegislacionImportante
}
```

**Arquitectura de Agentes:**

```
┌─────────────────────────────────────────────────┐
│         COORDINADOR DE AGENTES                  │
│                                                 │
│  • Decide qué agentes llamar                   │
│  • Gestiona orden de ejecución                 │
│  • Combina resultados                          │
└─────────────────────────────────────────────────┘
                     ↓
        ┌────────────┴────────────┐
        ↓                         ↓
┌──────────────┐          ┌──────────────┐
│   AGENTE     │          │   AGENTE     │
│  RESUMIDOR   │          │  EXPLICADOR  │
│              │          │              │
│  Genera      │          │  Traduce     │
│  resumen     │          │  jerga legal │
│  ejecutivo   │          │  a lenguaje  │
│              │          │  simple      │
└──────────────┘          └──────────────┘
        ↓                         ↓
┌──────────────┐          ┌──────────────┐
│   AGENTE     │          │   AGENTE     │
│   GUÍA       │          │   ANALISTA   │
│              │          │              │
│  Crea pasos  │          │  Analiza     │
│  prácticos   │          │  impacto     │
│              │          │              │
└──────────────┘          └──────────────┘
```

**Implementación:**

```typescript
class AgenteCoordinador {
  constructor(
    private llmClient: LLMClient, // OpenAI o Anthropic
    private categoria: Categoria
  ) {}

  async procesar(documento: Documento): Promise<Explicacion[]> {
    const explicaciones: Explicacion[] = []

    // 1. Determinar qué agentes usar según categoría
    const agentes = this.getAgentesPorCategoria(this.categoria.slug)

    // 2. Ejecutar cada agente
    for (const agenteConfig of agentes) {
      const agente = new Agente(this.llmClient, agenteConfig)
      const explicacion = await agente.ejecutar(documento)

      explicaciones.push({
        tipo: agenteConfig.tipo,
        contenido: explicacion.texto,
        tokens_usados: explicacion.tokens
      })

      // 3. Guardar en BD
      await this.guardarExplicacion(documento.id, explicacion)
    }

    // 4. Generar estadísticas
    await this.actualizarEstadisticas(documento, explicaciones)

    return explicaciones
  }

  private getAgentesPorCategoria(slug: string): AgenteConfig[] {
    const configs = {
      'oposiciones': [
        { tipo: 'resumen', prompt: PROMPTS.oposiciones.resumen },
        { tipo: 'que_hace_puesto', prompt: PROMPTS.oposiciones.puesto },
        { tipo: 'requisitos_explicados', prompt: PROMPTS.oposiciones.requisitos },
        { tipo: 'como_inscribirme', prompt: PROMPTS.oposiciones.inscripcion },
        { tipo: 'como_preparar', prompt: PROMPTS.oposiciones.preparacion }
      ],
      'ayudas': [
        { tipo: 'resumen', prompt: PROMPTS.ayudas.resumen },
        { tipo: 'quien_puede_pedirla', prompt: PROMPTS.ayudas.requisitos },
        { tipo: 'como_solicitarla', prompt: PROMPTS.ayudas.solicitud },
        { tipo: 'gastos_permitidos', prompt: PROMPTS.ayudas.gastos },
        { tipo: 'ejemplo_calculo', prompt: PROMPTS.ayudas.ejemplo }
      ],
      'legislacion': [
        { tipo: 'resumen', prompt: PROMPTS.legislacion.resumen },
        { tipo: 'que_cambia', prompt: PROMPTS.legislacion.cambios },
        { tipo: 'antes_vs_ahora', prompt: PROMPTS.legislacion.comparacion },
        { tipo: 'como_me_afecta', prompt: PROMPTS.legislacion.impacto },
        { tipo: 'ejemplo_practico', prompt: PROMPTS.legislacion.ejemplo }
      ]
    }

    return configs[slug] || [{ tipo: 'resumen', prompt: PROMPTS.generico.resumen }]
  }
}

class Agente {
  constructor(
    private llmClient: LLMClient,
    private config: AgenteConfig
  ) {}

  async ejecutar(documento: Documento): Promise<ResultadoAgente> {
    // 1. Construir prompt contextualizado
    const prompt = this.construirPrompt(documento)

    // 2. Llamar al LLM
    const inicio = Date.now()
    const respuesta = await this.llmClient.generate(prompt, {
      model: 'gpt-4o-mini', // Modelo económico
      max_tokens: 800,
      temperature: 0.7
    })
    const tiempo = Date.now() - inicio

    // 3. Post-procesar respuesta
    const textoLimpio = this.limpiarRespuesta(respuesta.contenido)

    return {
      texto: textoLimpio,
      tokens: respuesta.tokens_usados,
      modelo: respuesta.modelo_usado,
      tiempo_ms: tiempo
    }
  }

  private construirPrompt(doc: Documento): string {
    // Template del prompt + datos del documento
    const template = this.config.prompt

    const variables = {
      titulo: doc.titulo,
      fecha: doc.fecha_publicacion,
      departamento: doc.departamento,
      categoria: doc.categoria.nombre,
      datos: JSON.stringify(doc.datos_estructurados, null, 2),
      // Si hay contenido XML, incluir extracto
      contenido: doc.contenido_raw?.substring(0, 3000) || ''
    }

    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '')
  }

  private limpiarRespuesta(texto: string): string {
    // Eliminar markdown innecesario, formatear, etc
    return texto
      .trim()
      .replace(/^#+\s*/gm, '') // Quitar headers markdown
      .replace(/\*\*/g, '') // Quitar bold markdown si queremos texto plano
  }
}
```

**Resultado:**
- ✅ ~400 docs/semana con explicaciones completas
- ✅ Contenido educativo de alto valor
- ✅ Usuarios empoderados con información clara
- ✅ Coste: ~$20/mes con GPT-4o-mini

---

## 🔄 FLUJO DE DATOS COMPLETO

### Flujo Semanal (Batch Processing)

```
DOMINGO 1:00 AM (Netlify Scheduled Function)
│
├─ PASO 1: Fetch Semana Completa (5 minutos)
│  └─ Llamadas a BOE API: sumario de L-V
│     • Lunes: /sumario/20251117
│     • Martes: /sumario/20251118
│     • ...
│     • Viernes: /sumario/20251121
│
├─ PASO 2: Nivel 1 - Clasificación (10 minutos)
│  └─ Para cada documento (~2,500):
│     • Clasificar por categoría
│     • Extraer datos básicos (regex)
│     • Insertar en Supabase
│
├─ PASO 3: Nivel 2 - Extracción (30 minutos)
│  └─ Para documentos P3+P2 (~1,000):
│     • Fetch XML (batch de 10 concurrentes)
│     • Extraer datos estructurados
│     • Update en Supabase
│
├─ PASO 4: Nivel 3 - LLM (60 minutos)
│  └─ Para documentos high-value (~400):
│     • Para cada documento:
│       ├─ Coordinador decide agentes
│       ├─ Ejecuta 3-5 agentes
│       ├─ Guarda explicaciones
│       └─ Pausa 500ms entre docs (rate limiting)
│
└─ PASO 5: Estadísticas y Resúmenes (15 minutos)
   └─ Por cada categoría:
      • Calcular métricas semanales
      • LLM: Generar resumen de tendencias
      • LLM: Generar insights
      • Guardar en estadisticas_categorias

TOTAL TIEMPO: ~2 horas
TOTAL COSTE: ~$12 por ejecución
```

### Flujo On-Demand (Lazy Loading)

```
USUARIO busca "oposiciones maestro 2024"
│
├─ PASO 1: Búsqueda en Supabase (100ms)
│  └─ Query con keywords + filtros
│     SELECT * FROM documentos_boe
│     WHERE keywords @> ARRAY['oposiciones', 'maestro']
│     AND EXTRACT(YEAR FROM fecha_publicacion) = 2024
│
├─ PASO 2: Verificar Procesamiento
│  ├─ ¿Tiene explicaciones LLM? → SÍ: Devolver
│  └─ ¿Tiene explicaciones LLM? → NO: ↓
│
├─ PASO 3: Procesamiento Express (20 segundos)
│  └─ En background o real-time según prioridad
│     • Fetch XML si falta
│     • Nivel 2: Extracción
│     • Nivel 3: Solo agentes básicos (resumen + requisitos)
│     • Guardar explicaciones
│
└─ PASO 4: Devolver Resultado
   └─ Documento + Explicaciones

TOTAL TIEMPO: 100ms (cached) o 20s (primera vez)
```

### Flujo Mensual (Resúmenes y Analytics)

```
DÍA 1 DE CADA MES 2:00 AM
│
├─ PASO 1: Recopilar Datos del Mes (5 minutos)
│  └─ Por cada categoría:
│     • Total documentos
│     • Documentos por subcategoría
│     • Tendencias (crecimiento/decrecimiento)
│
├─ PASO 2: Análisis LLM del Mes (30 minutos)
│  └─ Para cada categoría P3:
│     • Prompt: "Resume las tendencias del mes"
│     • Prompt: "¿Qué ha sido más importante?"
│     • Prompt: "¿Qué debe saber la gente?"
│
├─ PASO 3: Generar Reportes (10 minutos)
│  └─ Email a usuarios suscritos (si implementamos)
│     • Resumen mensual personalizado
│     • Alertas de su interés
│
└─ PASO 4: Limpieza y Mantenimiento (15 minutos)
   └─ • Eliminar logs antiguos
      • Optimizar índices
      • Archivar datos viejos (>1 año)

TOTAL TIEMPO: ~1 hora
TOTAL COSTE: ~$5
```

---

## 💰 OPTIMIZACIÓN DE COSTES

### Estrategia Multi-Nivel

**Modelo de Costes por Nivel:**

| Nivel | Documentos | Coste/Doc | Coste Semanal | Coste Mensual |
|-------|-----------|-----------|---------------|---------------|
| Nivel 1 (Todos) | 2,500 | $0 | $0 | $0 |
| Nivel 2 (P3+P2) | 1,000 | $0.007 | $7 | $30 |
| Nivel 3 (High-Value) | 400 | $0.05 | $20 | $80 |
| **TOTAL** | **3,900** | - | **$27** | **~$110** |

### Optimizaciones Aplicadas

#### 1. Cache Inteligente

```typescript
// Cache en Supabase (PostgreSQL)
CREATE INDEX idx_documentos_cache ON documentos_boe(boe_id, procesado);

// Cache en Netlify CDN
setResponseHeaders(event, {
  'Cache-Control': 'public, max-age=31536000', // 1 año
  'CDN-Cache-Control': 'max-age=31536000'
})

// Cache en cliente (Service Worker - futuro)
// Documentos procesados = inmutables = cache forever
```

#### 2. Rate Limiting Inteligente

```typescript
class RateLimiter {
  private queue: Promise<any>[] = []
  private requestsPerSecond = 5
  private delay = 1000 / this.requestsPerSecond

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Esperar a que haya hueco
    while (this.queue.length >= this.requestsPerSecond) {
      await Promise.race(this.queue)
    }

    // Ejecutar con delay
    const promise = this.delayedExecute(fn)
    this.queue.push(promise)

    // Limpiar completados
    promise.finally(() => {
      const index = this.queue.indexOf(promise)
      if (index > -1) this.queue.splice(index, 1)
    })

    return promise
  }

  private async delayedExecute<T>(fn: () => Promise<T>): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.delay))
    return fn()
  }
}
```

#### 3. Batching de Requests

```typescript
async function fetchDocumentosXML(boeIds: string[]): Promise<XMLDocument[]> {
  const BATCH_SIZE = 10
  const results: XMLDocument[] = []

  for (let i = 0; i < boeIds.length; i += BATCH_SIZE) {
    const batch = boeIds.slice(i, i + BATCH_SIZE)

    // Fetch paralelo dentro del batch
    const batchResults = await Promise.all(
      batch.map(id => rateLimiter.execute(() => fetchXML(id)))
    )

    results.push(...batchResults)

    // Pausa entre batches
    if (i + BATCH_SIZE < boeIds.length) {
      await sleep(2000) // 2 segundos entre batches
    }
  }

  return results
}
```

#### 4. Prompts Optimizados (Token Reduction)

```typescript
// ❌ MALO: Prompt largo y genérico (2000 tokens)
const promptMalo = `
Eres un experto en legislación española y comunicación clara...
[500 palabras de contexto]

Aquí está el documento completo del BOE:
${documentoCompleto} // 10,000 palabras

Por favor, analiza...
[500 palabras de instrucciones detalladas]
`

// ✅ BUENO: Prompt corto y específico (500 tokens)
const promptBueno = `
Resume esta convocatoria de oposiciones en 3-4 líneas que cualquiera entienda.

Título: ${doc.titulo}
Plazas: ${doc.datos_estructurados.num_plazas}
Requisitos: ${doc.datos_estructurados.requisitos.titulacion}
Plazo: ${doc.datos_estructurados.fechas.fin_inscripcion}

Formato:
- Qué es
- Quién puede
- Hasta cuándo
`

// Reducción: 75% menos tokens = 75% menos coste
```

#### 5. Modelo LLM Económico pero Efectivo

**Comparativa de Modelos:**

| Modelo | Coste Input | Coste Output | Calidad | Recomendación |
|--------|-------------|--------------|---------|---------------|
| GPT-4o | $2.50/1M | $10/1M | ⭐⭐⭐⭐⭐ | ❌ Demasiado caro |
| GPT-4o-mini | $0.15/1M | $0.60/1M | ⭐⭐⭐⭐ | ✅ **ÓPTIMO** |
| Claude Sonnet | $3/1M | $15/1M | ⭐⭐⭐⭐⭐ | ❌ Caro |
| Claude Haiku | $1/1M | $5/1M | ⭐⭐⭐⭐ | ✅ Alternativa |

**Recomendación:** GPT-4o-mini para MVP
- ~$0.15 por 1M tokens input
- ~$0.60 por 1M tokens output
- Calidad suficiente para explicaciones educativas
- **4x más barato que Claude Haiku**
- **16x más barato que GPT-4o**

#### 6. Procesamiento Progresivo

```typescript
// No procesar todo de golpe - priorizar dinámicamente
async function procesarPrioritario(documentos: Documento[]) {
  // 1. Ordenar por prioridad
  const ordenados = documentos.sort((a, b) => {
    let scoreA = calcularScore(a)
    let scoreB = calcularScore(b)
    return scoreB - scoreA
  })

  function calcularScore(doc: Documento): number {
    let score = 0

    // Categoría
    score += doc.categoria.prioridad * 100

    // Novedad (documentos recientes más importantes)
    const diasDesdePublicacion = daysSince(doc.fecha_publicacion)
    score += Math.max(0, 30 - diasDesdePublicacion)

    // Popularidad (si rastreamos visitas)
    score += doc.vistas_ultimos_7_dias || 0

    // Tipo de documento
    if (isConvocatoriaNueva(doc)) score += 50
    if (isLegislacionImportante(doc)) score += 40

    return score
  }

  // 2. Procesar solo top 400
  const top400 = ordenados.slice(0, 400)

  for (const doc of top400) {
    await procesarConLLM(doc)
  }
}
```

### Resultado de Optimizaciones

**Sin optimizaciones:**
- Procesar todo con LLM: 2,500 docs × $0.10 = **$250/semana**
- Prompts largos: 2,000 tokens avg = **$400/mes**
- Modelo caro (GPT-4o): **$800/mes**
- **TOTAL: ~$1,600/mes** ❌

**Con optimizaciones:**
- Solo high-value con LLM: 400 docs × $0.05 = **$20/semana**
- Prompts cortos: 500 tokens avg = **$80/mes**
- Modelo económico (GPT-4o-mini): **$110/mes**
- **TOTAL: ~$50/mes** ✅

**Reducción de costes: 97%** 🎉

---

## 🏛️ INFRAESTRUCTURA TÉCNICA

### Stack Tecnológico

```yaml
Frontend:
  Framework: Nuxt 3 (SSR)
  Styling: TailwindCSS
  Components: Vue 3 Composition API
  State: Pinia (si necesario)
  Charts: Chart.js / Vue-ChartJS

Backend:
  Serverless: Netlify Functions
  Runtime: Node.js 18+
  API: H3 (Nuxt server)

Database:
  Primary: Supabase (PostgreSQL)
  Free Tier: 500MB DB, 5GB bandwidth/mes
  Paid Tier: $25/mes (2GB DB, 50GB bandwidth)

LLM Provider:
  Primary: OpenAI (GPT-4o-mini)
  Alternative: Anthropic (Claude Haiku)
  Abstraction: utils/llm.ts (ya implementado)

Scheduled Jobs:
  Platform: Netlify Scheduled Functions
  Frequency:
    - Weekly: Domingo 1:00 AM
    - Monthly: Día 1 2:00 AM

Cache:
  CDN: Netlify Edge
  Database: PostgreSQL indexes
  Browser: Service Worker (futuro)

Monitoring:
  Logs: Netlify Functions logs
  Errors: Sentry (opcional)
  Metrics: Supabase dashboard
```

### Netlify Functions Structure

```
netlify/functions/
├── scheduled-weekly.ts         # Procesamiento semanal batch
├── scheduled-monthly.ts        # Resúmenes mensuales
├── process-on-demand.ts        # Procesamiento lazy bajo demanda
└── lib/
    ├── boe-fetcher.ts          # Fetch BOE API
    ├── clasificador.ts         # Nivel 1: Clasificación
    ├── extractores/
    │   ├── oposiciones.ts      # Nivel 2: Extractor oposiciones
    │   ├── ayudas.ts           # Nivel 2: Extractor ayudas
    │   └── legislacion.ts      # Nivel 2: Extractor legislación
    ├── agentes/
    │   ├── coordinador.ts      # Nivel 3: Coordinador de agentes
    │   ├── agente.ts           # Nivel 3: Agente base
    │   └── prompts.ts          # Nivel 3: Prompts por categoría
    └── supabase.ts             # Cliente Supabase
```

### Configuración de Scheduled Functions

```toml
# netlify.toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build]
  command = "npm run build"
  publish = ".output/public"

# Scheduled Functions
[functions."scheduled-weekly"]
  schedule = "0 1 * * 0"  # Domingo 1:00 AM UTC

[functions."scheduled-monthly"]
  schedule = "0 2 1 * *"  # Día 1 de cada mes 2:00 AM UTC
```

---

## 🔀 COMPARATIVA DE OPCIONES

### Opción A: Procesamiento Solo Bajo Demanda (Lazy)

**Cómo funciona:**
- Solo procesar cuando usuario busca/visita
- Procesamiento en tiempo real o background job
- No hay batch semanal

**Pros:**
- ✅ Costo inicial: $0
- ✅ Solo pagar por lo que se usa
- ✅ Implementación más simple

**Contras:**
- ❌ Primera carga lenta (20-30 segundos)
- ❌ Experiencia inconsistente
- ❌ No hay "descubrimiento" proactivo
- ❌ Difícil hacer análisis de tendencias

**Veredicto:** ❌ No recomendado

---

### Opción B: Procesamiento Batch Completo (Todo con LLM)

**Cómo funciona:**
- Procesar TODOS los documentos semanalmente
- LLM para cada documento
- Base de datos completa desde día 1

**Pros:**
- ✅ Experiencia perfecta (todo cached)
- ✅ Datos completos para analytics
- ✅ Descubrimiento proactivo

**Contras:**
- ❌ Coste alto: ~$400-800/mes
- ❌ Mucho procesamiento innecesario
- ❌ Desperdicio en docs poco visitados

**Veredicto:** ❌ No sostenible

---

### Opción C: Híbrido - 3 Niveles (RECOMENDADO) ⭐

**Cómo funciona:**
- Nivel 1: TODOS gratis
- Nivel 2: Prioritarios (P3+P2)
- Nivel 3: High-value con LLM

**Pros:**
- ✅ Balance perfecto coste/valor
- ✅ Base de datos completa
- ✅ Explicaciones donde importan
- ✅ Escalable y sostenible
- ✅ ~$50/mes (muy razonable)

**Contras:**
- ⚠️ Implementación más compleja
- ⚠️ Lógica de priorización necesaria

**Veredicto:** ✅✅✅ **ÓPTIMO**

---

### Opción D: Crawler Progresivo Hacia Atrás

**Cómo funciona:**
- Procesar hacia futuro (cada semana nueva)
- En background, ir hacia atrás en tiempo libre
- Llenar BD progresivamente

**Pros:**
- ✅ No sobrecarga inicial
- ✅ Eventualmente BD completa
- ✅ Prioriza contenido reciente

**Contras:**
- ⚠️ Requiere scheduler adicional
- ⚠️ BD incompleta al inicio
- ⚠️ Complejidad adicional

**Veredicto:** 🤔 Considerar para Fase 2

---

## 📊 TABLA COMPARATIVA FINAL

| Aspecto | Opción A (Lazy) | Opción B (Full LLM) | Opción C (3 Niveles) | Opción D (Crawler) |
|---------|----------------|-------------------|-------------------|-------------------|
| **Coste Mensual** | $0-10 | $400-800 | $50-100 | $80-150 |
| **UX Primera Carga** | ❌ Lenta (20s) | ✅ Rápida | ✅ Rápida | ⚠️ Variable |
| **Completitud BD** | ❌ Parcial | ✅ Completa | ✅ Completa | ⚠️ Progresiva |
| **Explicaciones LLM** | ⚠️ Solo buscado | ✅ Todo | ✅ Prioritario | ⚠️ Progresivo |
| **Sostenibilidad** | ✅ Alta | ❌ Baja | ✅ Alta | ✅ Media |
| **Complejidad** | ⚠️ Media | ⚠️ Media | ⚠️ Alta | ❌ Muy Alta |
| **Time to Market** | ✅ Rápido | ⚠️ Medio | ⚠️ Medio | ❌ Lento |
| **Analytics/Trends** | ❌ Limitado | ✅ Completo | ✅ Completo | ⚠️ Parcial |
| **Escalabilidad** | ✅ Alta | ❌ Baja | ✅ Alta | ✅ Alta |
| **Recomendación** | ❌ No | ❌ No | ✅✅✅ **SÍ** | 🤔 Fase 2 |

---

## 🎯 RECOMENDACIÓN FINAL

### ✅ Implementar Opción C: Arquitectura de 3 Niveles

**Razones:**

1. **Balance Perfecto Coste/Valor**
   - $50/mes es MUY razonable
   - Valor entregado es ALTO
   - ROI claro

2. **Experiencia de Usuario Óptima**
   - Búsquedas rápidas (todo en BD)
   - Explicaciones donde importan
   - Sin esperas frustrantes

3. **Sostenibilidad**
   - Coste predecible
   - Escalable (más usuarios = mismo coste)
   - Mantenible

4. **Ventaja Competitiva**
   - Nadie más lo hace así
   - Contenido educativo único
   - SEO excelente (contenido rico)

5. **Futuro-Proof**
   - Fácil añadir más categorías
   - Fácil ajustar priorización
   - Fácil agregar más agentes

---

## 📝 PRÓXIMOS PASOS

1. ✅ Aprobar esta arquitectura
2. ⏭️ Ver `PLAN_IMPLEMENTACION.md` para roadmap detallado
3. ⏭️ Ver `AGENTES_LLM.md` para prompts específicos
4. ⏭️ Ver `UI_PROPUESTAS.md` para diseño de interfaces

---

**Próximo documento:** `PLAN_IMPLEMENTACION.md`
