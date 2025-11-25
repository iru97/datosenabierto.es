# FASE 1: Rediseño de Clasificación de Documentos BOE

**Basado en**: Investigación ML classification, precision/recall optimization, information scent theory

---

## ESTADO ACTUAL

### Sistema Existente
- **Ubicación**: `utils/boe-api.ts` líneas 419-553
- **Método**: Keyword matching simple
- **Categorías**: 12 predefinidas
- **Score**: Conteo de keywords que coinciden
- **Limitaciones**:
  - No considera contexto semántico
  - Keywords desactualizadas pueden perder documentos (low recall)
  - No hay confidence score
  - Asignación única (un documento = una categoría)
  - No tracking de precision/recall real

---

## PROBLEMAS IDENTIFICADOS

### 1. Baja Granularidad
Documento complejo puede aplicar a múltiples categorías:
- Ejemplo: "Oposición para profesor de medio ambiente" → ¿Oposiciones? ¿Educación? ¿Medio Ambiente?

### 2. Sin Métricas de Calidad
- No sabemos precision/recall actual
- No podemos optimizar sin feedback loop
- Keywords añadidas ad-hoc sin validación

### 3. No Aprovecha Estructura BOE
BOE API proporciona metadata rica:
- `seccion` (1, 2, 3, 4, 5)
- `rango` (Ley, Real Decreto, Orden, Resolución)
- `departamento` (Ministerio específico)
- `epígrafe` (Subtema dentro de sección)

### 4. Sin Aprendizaje
Sistema estático - no mejora con el tiempo

---

## PROPUESTA: CLASIFICACIÓN HÍBRIDA MULTI-NIVEL

### Arquitectura de 3 Niveles

```
Nivel 1: Rule-Based Classification (Fast, Alta Precision)
    ↓
Nivel 2: Keyword + Metadata Scoring (Medium, Balance)
    ↓
Nivel 3: LLM Classification (Slow, Alta Semántica)
```

### Decision Flow

```
1. Intentar Nivel 1 (rules)
   → Si confidence > 90% → DONE

2. Si no, Nivel 2 (enhanced keywords + metadata)
   → Si confidence > 75% → DONE
   → Si 50-75% → Asignar + FLAG para review

3. Si confidence < 50% → Nivel 3 (LLM)
   → Asignar con confidence score
   → Añadir a training data
```

---

## NIVEL 1: RULE-BASED CLASSIFICATION

### Reglas Deterministas

Basadas en estructura oficial BOE:

```typescript
const CLASSIFICATION_RULES = {
  oposiciones: [
    {
      seccion: ['2B', '2C'], // Sección 2: Oposiciones típicamente aquí
      rango: ['Resolución', 'Orden'],
      keywords_required: ['convocatoria', 'plazas'] // AL MENOS estos
      confidence: 0.95
    },
    {
      epigrafe_contains: ['ingreso', 'acceso', 'oposición'],
      keywords_required: ['cuerpo', 'funcionario'],
      confidence: 0.90
    }
  ],

  legislacion: [
    {
      rango: ['Ley', 'Real Decreto-ley', 'Real Decreto Legislativo'],
      confidence: 0.98 // Rangos legislativos = casi certeza
    },
    {
      seccion: '1', // Sección 1 = Disposiciones generales
      rango: ['Real Decreto'],
      confidence: 0.90
    }
  ],

  ayudas: [
    {
      keywords_required: ['subvención', 'bases reguladoras'],
      rango: ['Orden', 'Resolución'],
      confidence: 0.92
    },
    {
      epigrafe_contains: ['ayuda', 'subvención', 'beca'],
      confidence: 0.85
    }
  ],

  nombramientos: [
    {
      seccion: '2A', // Sección 2A: Nombramientos
      confidence: 0.95
    },
    {
      keywords_required: ['nombra', 'designa', 'cesa'],
      rango: ['Real Decreto', 'Orden'],
      confidence: 0.88
    }
  ],

  licitaciones: [
    {
      seccion: ['5A', '5B'], // Sección 5: Anuncios
      keywords_required: ['contrato', 'licitación', 'adjudicación'],
      confidence: 0.93
    }
  ]
}
```

**Ventajas:**
- **Velocidad**: ~1ms por documento
- **Alta Precision**: Rules basadas en estructura oficial
- **Sin costo**: No LLM calls
- **Explicable**: Sabemos exactamente por qué se clasificó

**Cobertura Estimada**: 60-70% documentos (los más claros)

---

## NIVEL 2: ENHANCED KEYWORD + METADATA SCORING

### Sistema de Puntuación Ponderada

```typescript
interface ClassificationScore {
  categoria_id: string
  score: number // 0-100
  confidence: number // 0-1
  evidence: {
    keyword_matches: string[]
    metadata_matches: string[]
    department_relevance: number
    section_relevance: number
  }
}

function calculateEnhancedScore(documento: DocumentoBOE): ClassificationScore[] {
  const scores: ClassificationScore[] = []

  for (const categoria of CATEGORIAS) {
    let score = 0
    let evidence = {
      keyword_matches: [],
      metadata_matches: [],
      department_relevance: 0,
      section_relevance: 0
    }

    // 1. KEYWORD MATCHING (ponderado)
    const titulo_lower = documento.titulo.toLowerCase()
    const dept_lower = documento.departamento?.toLowerCase() || ''

    for (const kw of categoria.keywords) {
      if (titulo_lower.includes(kw.term)) {
        score += kw.weight_titulo // e.g., "oposición" en título = +15
        evidence.keyword_matches.push(kw.term)
      }
      if (dept_lower.includes(kw.term)) {
        score += kw.weight_dept // en departamento = +5
        evidence.keyword_matches.push(kw.term)
      }
    }

    // 2. METADATA SCORING
    if (categoria.secciones_relevantes.includes(documento.seccion)) {
      score += 20
      evidence.metadata_matches.push(`seccion:${documento.seccion}`)
      evidence.section_relevance = 20
    }

    if (categoria.rangos_relevantes.includes(documento.rango)) {
      score += 15
      evidence.metadata_matches.push(`rango:${documento.rango}`)
    }

    // 3. DEPARTMENT MAPPING
    const dept_score = getDepartmentRelevance(documento.departamento, categoria)
    score += dept_score
    evidence.department_relevance = dept_score

    // 4. CALCULATE CONFIDENCE
    const max_possible_score = 100
    const confidence = Math.min(score / max_possible_score, 1.0)

    scores.push({
      categoria_id: categoria.id,
      score,
      confidence,
      evidence
    })
  }

  return scores.sort((a, b) => b.score - a.score)
}
```

### Keywords Ponderados por Posición

```typescript
const WEIGHTED_KEYWORDS = {
  oposiciones: [
    { term: 'oposición', weight_titulo: 20, weight_dept: 8 },
    { term: 'convocatoria', weight_titulo: 15, weight_dept: 5 },
    { term: 'plazas', weight_titulo: 15, weight_dept: 5 },
    { term: 'concurso-oposición', weight_titulo: 18, weight_dept: 7 },
    { term: 'lista de admitidos', weight_titulo: 12, weight_dept: 10 },
    { term: 'tribunal', weight_titulo: 8, weight_dept: 6 },
    // ...more
  ],

  ayudas: [
    { term: 'subvención', weight_titulo: 20, weight_dept: 10 },
    { term: 'ayuda', weight_titulo: 15, weight_dept: 8 },
    { term: 'beca', weight_titulo: 18, weight_dept: 10 },
    { term: 'bases reguladoras', weight_titulo: 15, weight_dept: 12 },
    { term: 'convocatoria', weight_titulo: 10, weight_dept: 5 },
    // ...more
  ]
}
```

### Department-Category Mapping

Ciertos ministerios/organismos son altamente predictivos:

```typescript
const DEPARTMENT_CATEGORY_MAP = {
  'Ministerio de Educación': {
    educacion: 25,
    oposiciones: 15, // También publica oposiciones
  },
  'Ministerio para la Transición Ecológica': {
    'medio-ambiente': 30,
    legislacion: 10
  },
  'SEPE': {
    empleo: 30,
    ayudas: 15
  },
  // ...more
}
```

**Cobertura Estimada**: +25-30% documentos adicionales (total 85-95%)

---

## NIVEL 3: LLM CLASSIFICATION (Fallback)

Para documentos ambiguos o nuevos tipos:

### System Prompt Optimizado

```typescript
const CLASSIFICATION_SYSTEM_PROMPT = `Eres un clasificador experto de documentos oficiales españoles del BOE.

Tu tarea: Asignar documento a 1-3 categorías de una lista predefinida.

IMPORTANTE:
- Puedes asignar múltiples categorías si el documento es relevante para varias
- Asigna confidence score (0-1) para cada categoría
- Explica brevemente tu razonamiento
- Si no encaja bien en ninguna, asigna "otros" con explicación

Categorías disponibles:
${CATEGORIAS_JSON}

Output format (JSON):
{
  "clasificaciones": [
    {
      "categoria_id": "oposiciones",
      "confidence": 0.95,
      "razonamiento": "Convocatoria con plazas y requisitos"
    }
  ]
}
`

const CLASSIFICATION_USER_PROMPT = (doc: DocumentoBOE) => `
Clasifica este documento:

METADATA:
- Sección: ${doc.seccion}
- Rango: ${doc.rango}
- Departamento: ${doc.departamento}
- Epígrafe: ${doc.epigrafe}

TÍTULO:
${doc.titulo}

RESUMEN (si disponible):
${doc.resumen_boe || 'No disponible'}

Clasifica y explica.
`
```

### Structured Output con JSON Schema

```typescript
const CLASSIFICATION_SCHEMA = {
  type: "object",
  properties: {
    clasificaciones: {
      type: "array",
      items: {
        type: "object",
        properties: {
          categoria_id: {
            type: "string",
            enum: ["oposiciones", "ayudas", "legislacion", /* ...all */ "otros"]
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1
          },
          razonamiento: { type: "string" }
        },
        required: ["categoria_id", "confidence", "razonamiento"]
      },
      minItems: 1,
      maxItems: 3
    }
  },
  required: ["clasificaciones"]
}
```

**Ventajas:**
- Captura ambigüedad (multi-categoría)
- Explica razonamiento (auditable)
- Aprende de ejemplos nuevos
- Flexible ante cambios normativos

**Desventajas:**
- Costo: ~$0.0005 por documento
- Latencia: ~500-1000ms
- Requiere validación humana inicial

**Cobertura**: 100% (todos los restantes)

---

## MULTI-CATEGORY SUPPORT

### Database Schema Update

Añadir tabla de asociación many-to-many:

```sql
CREATE TABLE documento_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID REFERENCES documentos_boe(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  confidence DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
  clasificacion_metodo VARCHAR(20) NOT NULL, -- 'rule', 'keyword', 'llm'
  razonamiento TEXT, -- Explicación (especialmente para LLM)
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(documento_id, categoria_id)
);

-- Índices
CREATE INDEX idx_doc_cat_documento ON documento_categorias(documento_id);
CREATE INDEX idx_doc_cat_categoria ON documento_categorias(categoria_id);
CREATE INDEX idx_doc_cat_confidence ON documento_categorias(confidence DESC);
```

### Migration de Datos Existentes

```typescript
// Convertir categoria_id única a documento_categorias
async function migrateToMultiCategory() {
  const documentos = await supabase
    .from('documentos_boe')
    .select('id, categoria_id')
    .not('categoria_id', 'is', null)

  const inserts = documentos.map(doc => ({
    documento_id: doc.id,
    categoria_id: doc.categoria_id,
    confidence: 1.0, // Asumimos alta confianza en clasificación original
    clasificacion_metodo: 'legacy'
  }))

  await supabase.from('documento_categorias').insert(inserts)
}
```

---

## MÉTRICAS Y EVALUACIÓN

### 1. Confusion Matrix Tracking

```typescript
interface ClassificationMetrics {
  categoria_id: string
  periodo: string // 'YYYY-WW'

  // Counts
  true_positives: number
  false_positives: number
  false_negatives: number
  true_negatives: number

  // Calculated
  precision: number // TP / (TP + FP)
  recall: number    // TP / (TP + FN)
  f1_score: number  // 2 * (precision * recall) / (precision + recall)

  // Método
  metodo_breakdown: {
    rule_based: number
    keyword_enhanced: number
    llm: number
  }
}
```

### 2. Weekly Report

```typescript
async function generateWeeklyClassificationReport() {
  const report = {
    periodo: getCurrentWeek(),
    total_documentos: 0,
    por_categoria: {},
    por_metodo: {},
    documentos_ambiguos: [], // confidence < 0.75
    sugerencias_keywords: [] // patrones no capturados
  }

  // Calcular métricas
  // ...

  return report
}
```

### 3. Human Validation Loop

**Sample Aleatorio Semanal:**
- 50 documentos clasificados por rules
- 100 documentos clasificados por keywords
- TODOS documentos clasificados por LLM (primeras semanas)

**UI Admin Panel:**
- Ver documento + clasificación asignada + confidence
- Botones: ✅ Correcta | ❌ Incorrecta | ➕ Añadir categoría
- Feedback almacenado en `classification_feedback`

```sql
CREATE TABLE classification_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID REFERENCES documentos_boe(id),
  clasificacion_id UUID REFERENCES documento_categorias(id),
  correcto BOOLEAN,
  categoria_correcta UUID REFERENCES categorias(id), -- Si fue incorrecta
  comentario TEXT,
  revisor_id UUID, -- Usuario que revisó
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## TARGETS DE CALIDAD

Basado en investigación ML classification:

| Categoría | Precision Target | Recall Target | F1 Target | Prioridad |
|-----------|------------------|---------------|-----------|-----------|
| Oposiciones | 90% | 95% | 92% | HIGH RECALL |
| Ayudas | 88% | 93% | 90% | HIGH RECALL |
| Legislación | 95% | 85% | 90% | HIGH PRECISION |
| Nombramientos | 98% | 80% | 88% | HIGH PRECISION |
| Licitaciones | 92% | 85% | 88% | BALANCE |
| Otros | 85% | 80% | 82% | BALANCE |

**Rationale:**
- **Oposiciones/Ayudas**: No perder oportunidades (recall > precision)
- **Legislación/Nombramientos**: Evitar falsos positivos (precision > recall)

---

## CONTINUOUS IMPROVEMENT

### 1. Keyword Discovery

Análisis mensual de documentos mal clasificados:

```typescript
async function discoverNewKeywords(categoria_id: string) {
  // 1. Obtener falsos negativos
  const missedDocs = await getFalseNegatives(categoria_id)

  // 2. Extraer términos frecuentes
  const terms = extractCommonTerms(missedDocs, {
    min_frequency: 3,
    exclude_stopwords: true
  })

  // 3. Calcular relevancia
  const candidates = terms.map(term => ({
    term,
    frequency: term.count,
    precision: calculatePrecision(term, categoria_id),
    suggested_weight: calculateSuggestedWeight(term)
  }))

  // 4. Sugerir a admin
  return candidates.filter(c => c.precision > 0.8)
}
```

### 2. Rule Extraction from LLM

Si LLM clasifica consistentemente bien cierto tipo de documento:

```typescript
async function extractRuleFromLLMPatterns() {
  // Buscar documentos clasificados por LLM con confidence > 0.95
  const highConfidenceDocs = await getHighConfidenceLLMClassifications()

  // Agrupar por metadata patterns
  const patterns = findCommonPatterns(highConfidenceDocs, [
    'seccion',
    'rango',
    'departamento',
    'keyword_combinations'
  ])

  // Si pattern aparece en > 20 documentos con 95%+ accuracy:
  const ruleCandidate = patterns.filter(p =>
    p.frequency > 20 &&
    p.accuracy > 0.95
  )

  return ruleCandidate // Sugerir añadir a Level 1 rules
}
```

---

## IMPLEMENTACIÓN INCREMENTAL

### Fase 1.1: Multi-Category Support (Semana 1-2)
- [ ] Crear tabla `documento_categorias`
- [ ] Migrar datos existentes
- [ ] Actualizar composables para multi-category queries
- [ ] Actualizar UI cards para mostrar múltiples badges

### Fase 1.2: Enhanced Keyword Scoring (Semana 3-4)
- [ ] Implementar weighted keywords
- [ ] Añadir metadata scoring
- [ ] Añadir department mapping
- [ ] Calcular confidence scores

### Fase 1.3: Rule-Based Classification (Semana 5-6)
- [ ] Definir rules para top 6 categorías
- [ ] Implementar rule engine
- [ ] Testing con 1000 documentos históricos
- [ ] Ajustar rules basado en precision/recall

### Fase 1.4: LLM Fallback (Semana 7-8)
- [ ] Implementar prompt optimizado
- [ ] JSON Schema validation
- [ ] Cost control (límite diario)
- [ ] Human validation UI

### Fase 1.5: Métricas y Monitoring (Semana 9-10)
- [ ] Confusion matrix tracking
- [ ] Weekly report automation
- [ ] Admin dashboard para review
- [ ] Alert system para low confidence

### Fase 1.6: Continuous Learning (Ongoing)
- [ ] Keyword discovery automation
- [ ] Rule extraction from patterns
- [ ] Quarterly review y ajustes

---

## ESTIMACIÓN DE COSTOS

### Escenario: 1,500 documentos/semana

**Nivel 1 (Rules)**: 900 docs (60%) × $0 = **$0**
**Nivel 2 (Keywords)**: 450 docs (30%) × $0 = **$0**
**Nivel 3 (LLM)**: 150 docs (10%) × $0.0005 = **$0.075/semana**

**Total anual**: ~$4

**Ahorro vs. LLM todo**: 1,500 × $0.0005 × 52 = $39/año
**Ahorro**: 90% en costos clasificación

---

## MÉTRICAS DE ÉXITO

**Cuantitativas:**
- Precision promedio > 90%
- Recall promedio > 88%
- F1 Score promedio > 89%
- Tiempo clasificación < 50ms/documento (avg)
- Costo clasificación < $0.01/documento

**Cualitativas:**
- Usuarios encuentran documentos relevantes más fácil
- Reducción de "no encontré nada" en feedback
- Menos documentos en "otros"
- Confianza en recomendaciones de categoría

---

**Siguiente**: Phase 2 - Data Extraction Optimization
