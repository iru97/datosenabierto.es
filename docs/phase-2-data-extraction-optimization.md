# FASE 2: Optimización de Extracción de Datos

**Basado en**: Semantic chunking, structured output JSON Schema, NLP information extraction best practices

---

## ESTADO ACTUAL

**Ubicación**: `utils/agentes-llm.ts` líneas 101-123
**Método**: Regex patterns + manual parsing
**Sin LLM**: Costo $0 ✅

### Extrae:
- **Structured data** por categoría (plazas, cuantía, leyes)
- **Important dates** con urgency levels
- **Keywords** para búsqueda

### Limitaciones Actuales:
1. Patterns hardcoded - no se adaptan
2. No usa BOE XML structure completa
3. Fechas detectadas pero parsing básico
4. No extrae relaciones entre entidades
5. Keywords extraídos sin ranking de relevancia

---

## PROPUESTA: EXTRACCIÓN ESTRUCTURADA MEJORADA

### Objetivo: Mantener $0 costo, +50% precisión

---

## MEJORA 1: SEMANTIC CHUNKING DEL DOCUMENTO

### Problema Actual
Se pasa documento completo (5000+ palabras) → confusión de contexto

### Solución: Chunking Semántico

```typescript
interface DocumentChunk {
  id: string
  tipo: 'preambulo' | 'articulo' | 'disposicion' | 'anexo'
  numero?: number // Artículo 5, Disposición Final 3, etc.
  titulo?: string
  contenido: string
  embeddings?: number[] // Para búsqueda semántica futura
  entidades_detectadas: string[]
}

async function semanticChunking(xmlContent: string): Promise<DocumentChunk[]> {
  const parser = new XMLParser()
  const doc = parser.parse(xmlContent)

  const chunks: DocumentChunk[] = []

  // 1. PREÁMBULO
  if (doc.preambulo) {
    chunks.push({
      id: 'preambulo',
      tipo: 'preambulo',
      contenido: doc.preambulo,
      entidades_detectadas: extractNamedEntities(doc.preambulo)
    })
  }

  // 2. ARTÍCULOS (estructura completa)
  doc.articulos?.forEach((art, idx) => {
    chunks.push({
      id: `art-${idx + 1}`,
      tipo: 'articulo',
      numero: idx + 1,
      titulo: art.titulo,
      contenido: art.texto,
      entidades_detectadas: extractNamedEntities(art.texto)
    })
  })

  // 3. DISPOSICIONES
  doc.disposiciones?.forEach((disp, idx) => {
    chunks.push({
      id: `disp-${disp.tipo}-${idx}`,
      tipo: 'disposicion',
      titulo: disp.titulo,
      contenido: disp.texto,
      entidades_detectadas: extractNamedEntities(disp.texto)
    })
  })

  // 4. ANEXOS
  doc.anexos?.forEach((anexo, idx) => {
    chunks.push({
      id: `anexo-${idx + 1}`,
      tipo: 'anexo',
      numero: idx + 1,
      titulo: anexo.titulo,
      contenido: anexo.texto,
      entidades_detectadas: extractNamedEntities(anexo.texto)
    })
  })

  return chunks
}
```

**Ventajas:**
- Extracción targeted por sección relevante
- Mejor contexto para fechas (saber si es plazo vs. entrada en vigor)
- Facilita citas ("Artículo 5.3 establece...")
- Preparado para RAG futuro

---

## MEJORA 2: NAMED ENTITY RECOGNITION (NER)

### Sin LLM: Usar librerías NLP

```typescript
import nlp from 'compromise'
import compromiseDates from 'compromise-dates'
import compromiseNumbers from 'compromise-numbers'

nlp.extend(compromiseDates)
nlp.extend(compromiseNumbers)

interface ExtractedEntity {
  tipo: 'FECHA' | 'CANTIDAD' | 'ORGANISMO' | 'LEY' | 'PERSONA' | 'LUGAR'
  valor: string
  contexto: string // Frase que lo rodea
  chunk_id: string // De qué chunk vino
  confidence: number
}

function extractNamedEntities(text: string, chunk_id: string): ExtractedEntity[] {
  const doc = nlp(text)
  const entities: ExtractedEntity[] = []

  // FECHAS
  doc.dates().forEach(date => {
    entities.push({
      tipo: 'FECHA',
      valor: date.text(),
      contexto: date.before(10).text() + ' ' + date.text() + ' ' + date.after(10).text(),
      chunk_id,
      confidence: 0.9
    })
  })

  // CANTIDADES (números + unidad)
  doc.money().forEach(money => {
    entities.push({
      tipo: 'CANTIDAD',
      valor: money.text(),
      contexto: extractContext(text, money.text()),
      chunk_id,
      confidence: 0.95
    })
  })

  // ORGANISMOS (patrón: "Ministerio de X", "Dirección General de Y")
  const organismoPatterns = /(?:Ministerio|Secretaría|Dirección General|Consejería|Agencia) de [\w\s]+/gi
  const organismos = text.match(organismoPatterns) || []
  organismos.forEach(org => {
    entities.push({
      tipo: 'ORGANISMO',
      valor: org,
      contexto: extractContext(text, org),
      chunk_id,
      confidence: 0.88
    })
  })

  // LEYES (patrón: "Ley XX/YYYY")
  const leyPatterns = /(?:Ley|Real Decreto|Orden|Resolución)\s+\d+\/\d{4}/gi
  const leyes = text.match(leyPatterns) || []
  leyes.forEach(ley => {
    entities.push({
      tipo: 'LEY',
      valor: ley,
      contexto: extractContext(text, ley),
      chunk_id,
      confidence: 0.92
    })
  })

  return entities
}
```

---

## MEJORA 3: EXTRACCIÓN CATEGORY-SPECIFIC CON JSON SCHEMA

### Schema Definitions

```typescript
// OPOSICIONES
const OPOSICIONES_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    organismo_convocante: { type: "string" },
    cuerpo_escala: { type: "string" },
    plazas: {
      type: "object",
      properties: {
        total: { type: "number" },
        libres: { type: "number" },
        promocion_interna: { type: "number" },
        discapacidad: { type: "number" }
      }
    },
    grupo_clasificacion: { type: "string", enum: ["A1", "A2", "B", "C1", "C2"] },
    tipo_convocatoria: { type: "string", enum: ["oposicion", "concurso", "concurso-oposicion"] },
    fechas_clave: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tipo: { type: "string", enum: ["publicacion", "solicitud_inicio", "solicitud_fin", "examen"] },
          fecha: { type: "string", format: "date" },
          descripcion: { type: "string" }
        },
        required: ["tipo", "fecha"]
      }
    },
    titulacion_requerida: { type: "string" },
    url_bases: { type: "string", format: "uri" }
  },
  required: ["organismo_convocante", "plazas"]
}

// AYUDAS
const AYUDAS_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    organismo_convocante: { type: "string" },
    tipo_ayuda: { type: "string", enum: ["subvencion", "beca", "ayuda_directa", "credito_blando", "desgravacion"] },
    ambito: { type: "string", enum: ["estatal", "autonomico", "local", "europeo"] },
    destinatarios: {
      type: "array",
      items: { type: "string" }
    },
    cuantia: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["fija", "variable", "porcentaje", "rango"] },
        minima: { type: "number" },
        maxima: { type: "number" },
        unidad: { type: "string", default: "EUR" }
      }
    },
    plazo_solicitud: {
      type: "object",
      properties: {
        fecha_inicio: { type: "string", format: "date" },
        fecha_fin: { type: "string", format: "date" },
        dias_naturales: { type: "number" }
      }
    },
    requisitos_principales: {
      type: "array",
      items: { type: "string" }
    },
    url_solicitud: { type: "string", format: "uri" },
    presupuesto_total: { type: "number" }
  },
  required: ["organismo_convocante", "tipo_ayuda", "destinatarios"]
}

// LEGISLACIÓN
const LEGISLACION_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    tipo_norma: { type: "string", enum: ["ley", "real_decreto", "orden", "resolucion"] },
    numero_norma: { type: "string" },
    fecha_aprobacion: { type: "string", format: "date" },
    fecha_publicacion: { type: "string", format: "date" },
    fecha_entrada_vigor: { type: "string", format: "date" },
    ambito_aplicacion: { type: "string", enum: ["estatal", "autonomico", "sectorial"] },
    materia_principal: { type: "string" },
    normas_modificadas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nombre: { type: "string" },
          articulos_afectados: { type: "array", items: { type: "string" } }
        }
      }
    },
    normas_derogadas: {
      type: "array",
      items: { type: "string" }
    },
    sectores_afectados: {
      type: "array",
      items: { type: "string" }
    },
    resumen_cambios: { type: "string", maxLength: 500 }
  },
  required: ["tipo_norma", "fecha_publicacion"]
}
```

### Validation & Extraction

```typescript
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv()
addFormats(ajv)

async function extractStructuredData(
  documento: DocumentoBOE,
  chunks: DocumentChunk[],
  entities: ExtractedEntity[],
  categoria: string
): Promise<any> {

  const schema = getSchemaForCategory(categoria)
  const validate = ajv.compile(schema)

  // Extraction logic específica por categoría
  let extracted = {}

  switch (categoria) {
    case 'oposiciones':
      extracted = extractOposicionesData(chunks, entities)
      break
    case 'ayudas':
      extracted = extractAyudasData(chunks, entities)
      break
    case 'legislacion':
      extracted = extractLegislacionData(chunks, entities)
      break
    default:
      extracted = extractGenericData(chunks, entities)
  }

  // Validate
  const valid = validate(extracted)

  if (!valid) {
    console.warn('Validation errors:', validate.errors)
    // Log para mejorar extraction logic
    await logExtractionError(documento.id, categoria, validate.errors)
  }

  return extracted
}
```

---

## MEJORA 4: FECHAS INTELIGENTES CON CONTEXTO

### Problema Actual
Detecta fechas pero no distingue tipo (publicación vs. plazo vs. entrada en vigor)

### Solución: Context-Aware Date Extraction

```typescript
interface SmartDate {
  fecha: Date
  tipo: 'publicacion' | 'solicitud_inicio' | 'solicitud_fin' | 'examen' | 'resolucion' | 'entrada_vigor' | 'derogacion'
  dias_restantes: number
  urgencia: 'EXPIRADO' | 'CRITICO' | 'URGENTE' | 'PROXIMO' | 'FUTURO'
  contexto: string // Frase completa
  confidence: number
}

function classifyDateByContext(dateEntity: ExtractedEntity, fullText: string): SmartDate {
  const context = dateEntity.contexto.toLowerCase()

  // Patrones de tipo de fecha
  const patterns = {
    solicitud_inicio: ['inicio.*plazo', 'desde.*hasta', 'partir.*del.*día'],
    solicitud_fin: ['plazo.*finali', 'hasta.*el.*día', 'antes.*del'],
    examen: ['realiz.*prueba', 'fecha.*examen', 'celebr.*ejercicio'],
    entrada_vigor: ['entrar.*vigor', 'entrada.*vigor', 'vigor.*al.*día.*siguiente'],
    resolucion: ['fecha.*resolución', 'plazo.*resolver', 'notificaci.*resolución']
  }

  let tipo: SmartDate['tipo'] = 'publicacion' // default

  for (const [key, regexes] of Object.entries(patterns)) {
    for (const regex of regexes) {
      if (new RegExp(regex).test(context)) {
        tipo = key as SmartDate['tipo']
        break
      }
    }
  }

  const fecha = parseDate(dateEntity.valor)
  const diasRestantes = differenceInDays(fecha, new Date())

  let urgencia: SmartDate['urgencia']
  if (diasRestantes < 0) urgencia = 'EXPIRADO'
  else if (diasRestantes <= 7) urgencia = 'CRITICO'
  else if (diasRestantes <= 15) urgencia = 'URGENTE'
  else if (diasRestantes <= 30) urgencia = 'PROXIMO'
  else urgencia = 'FUTURO'

  return {
    fecha,
    tipo,
    dias_restantes: diasRestantes,
    urgencia,
    contexto: dateEntity.contexto,
    confidence: calculateDateConfidence(tipo, context)
  }
}
```

---

## MEJORA 5: KEYWORD EXTRACTION CON TF-IDF

### Problema Actual
Keywords extraídos sin ranking

### Solución: TF-IDF + Category Relevance

```typescript
import { TfIdf } from 'natural'

interface RankedKeyword {
  term: string
  score: number // TF-IDF
  category_relevance: number // Qué tan relevante para la categoría
  final_score: number // Combined
  appearances: number
  contexts: string[] // Dónde aparece
}

async function extractRankedKeywords(
  documento: DocumentoBOE,
  chunks: DocumentChunk[],
  categoria: string
): Promise<RankedKeyword[]> {

  const tfidf = new TfIdf()

  // Add document
  tfidf.addDocument(documento.titulo + ' ' + chunks.map(c => c.contenido).join(' '))

  // Add corpus de la categoría (para IDF)
  const corpusDocs = await getCorpusDocuments(categoria, 100)
  corpusDocs.forEach(doc => tfidf.addDocument(doc.texto))

  // Extract terms
  const keywords: RankedKeyword[] = []

  tfidf.listTerms(0).forEach(term => {
    // Solo términos significativos (no stopwords, longitud > 3)
    if (term.term.length > 3 && !STOPWORDS.includes(term.term)) {

      const categoryRelevance = calculateCategoryRelevance(term.term, categoria)

      keywords.push({
        term: term.term,
        score: term.tfidf,
        category_relevance: categoryRelevance,
        final_score: term.tfidf * (1 + categoryRelevance), // Boost por relevancia categoría
        appearances: countAppearances(term.term, chunks),
        contexts: extractContexts(term.term, chunks, 3) // Top 3 contextos
      })
    }
  })

  // Sort by final score y retornar top 20
  return keywords
    .sort((a, b) => b.final_score - a.final_score)
    .slice(0, 20)
}

function calculateCategoryRelevance(term: string, categoria: string): number {
  // Keywords core de la categoría tienen boost
  const categoryKeywords = CATEGORY_CORE_KEYWORDS[categoria] || []

  if (categoryKeywords.includes(term.toLowerCase())) {
    return 1.5 // +50% boost
  }

  // Calcular similitud semántica (futuro: embeddings)
  // Por ahora: substring matching
  for (const coreKeyword of categoryKeywords) {
    if (term.includes(coreKeyword) || coreKeyword.includes(term)) {
      return 0.8 // +80% boost parcial
    }
  }

  return 0 // Sin boost
}
```

---

## MEJORA 6: RELACIÓN ENTRE ENTIDADES

### Entity Relationship Graph

```typescript
interface EntityRelation {
  entidad_origen: ExtractedEntity
  entidad_destino: ExtractedEntity
  tipo_relacion: 'MODIFICA' | 'DEROGA' | 'AFECTA_A' | 'EMITIDO_POR' | 'DIRIGIDO_A' | 'PLAZO_PARA'
  confidence: number
  evidencia: string // Frase que evidencia la relación
}

function extractEntityRelations(
  entities: ExtractedEntity[],
  chunks: DocumentChunk[]
): EntityRelation[] {

  const relations: EntityRelation[] = []

  // Ejemplo: "Ley 5/2024 modifica Ley 3/2020"
  const leyEntities = entities.filter(e => e.tipo === 'LEY')

  for (const ley1 of leyEntities) {
    for (const ley2 of leyEntities) {
      if (ley1 === ley2) continue

      const combinedContext = ley1.contexto + ' ' + ley2.contexto

      if (/modific/.test(combinedContext)) {
        relations.push({
          entidad_origen: ley1,
          entidad_destino: ley2,
          tipo_relacion: 'MODIFICA',
          confidence: 0.85,
          evidencia: combinedContext
        })
      }
    }
  }

  // Ejemplo: "Plazo hasta [FECHA]" + "para [ORGANISMO]"
  const fechaEntities = entities.filter(e => e.tipo === 'FECHA')
  const organismoEntities = entities.filter(e => e.tipo === 'ORGANISMO')

  for (const fecha of fechaEntities) {
    for (const org of organismoEntities) {
      const distance = Math.abs(
        chunks.findIndex(c => c.id === fecha.chunk_id) -
        chunks.findIndex(c => c.id === org.chunk_id)
      )

      if (distance <= 1) { // En mismo chunk o adyacente
        relations.push({
          entidad_origen: fecha,
          entidad_destino: org,
          tipo_relacion: 'PLAZO_PARA',
          confidence: 0.7,
          evidencia: fecha.contexto + ' | ' + org.contexto
        })
      }
    }
  }

  return relations
}
```

---

## DATABASE SCHEMA EXTENSIONS

### Nuevas Tablas

```sql
-- Document Chunks (para RAG futuro)
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID REFERENCES documentos_boe(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL, -- 'preambulo', 'articulo', 'disposicion', 'anexo'
  numero INTEGER,
  titulo TEXT,
  contenido TEXT NOT NULL,
  embeddings VECTOR(1536), -- Para búsqueda semántica (futuro)
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_chunk_documento(documento_id),
  INDEX idx_chunk_tipo(tipo)
);

-- Extracted Entities
CREATE TABLE extracted_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID REFERENCES documentos_boe(id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES document_chunks(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL, -- 'FECHA', 'CANTIDAD', 'ORGANISMO', 'LEY', 'PERSONA', 'LUGAR'
  valor TEXT NOT NULL,
  contexto TEXT,
  confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_entity_doc(documento_id),
  INDEX idx_entity_tipo(tipo),
  INDEX idx_entity_valor(valor)
);

-- Entity Relations
CREATE TABLE entity_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID REFERENCES documentos_boe(id) ON DELETE CASCADE,
  entidad_origen_id UUID REFERENCES extracted_entities(id) ON DELETE CASCADE,
  entidad_destino_id UUID REFERENCES extracted_entities(id) ON DELETE CASCADE,
  tipo_relacion VARCHAR(30) NOT NULL,
  confidence DECIMAL(3,2),
  evidencia TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_relation_doc(documento_id),
  INDEX idx_relation_tipo(tipo_relacion)
);

-- Ranked Keywords
CREATE TABLE ranked_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID REFERENCES documentos_boe(id) ON DELETE CASCADE,
  term VARCHAR(100) NOT NULL,
  tfidf_score DECIMAL(10,6),
  category_relevance DECIMAL(3,2),
  final_score DECIMAL(10,6),
  appearances INTEGER,
  contexts JSONB, -- Array of context strings
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_keyword_doc(documento_id),
  INDEX idx_keyword_term(term),
  INDEX idx_keyword_score(final_score DESC)
);
```

---

## MÉTRICAS DE ÉXITO

### Precision/Recall por Tipo de Entidad

| Tipo Entidad | Precision Target | Recall Target |
|--------------|------------------|---------------|
| FECHA | 95% | 90% |
| CANTIDAD | 92% | 85% |
| ORGANISMO | 88% | 80% |
| LEY | 90% | 85% |
| PERSONA | 85% | 75% |

### Extracción Estructurada

| Categoría | Schema Compliance | Completeness |
|-----------|-------------------|--------------|
| Oposiciones | 95% | 80% |
| Ayudas | 92% | 75% |
| Legislación | 90% | 70% |

### Performance

- Tiempo extracción: <500ms por documento
- Costo: $0 (sin LLM)
- Memoria: <100MB peak

---

## IMPLEMENTACIÓN

### Prioridad 1 (Semanas 1-2): Semantic Chunking + NER
- Implementar parsing XML a chunks
- Integrar compromise.js para NER básico
- Almacenar en document_chunks y extracted_entities

### Prioridad 2 (Semanas 3-4): Category-Specific Extraction
- Definir JSON schemas para top 3 categorías
- Implementar extraction logic
- Validación con Ajv

### Prioridad 3 (Semanas 5-6): Smart Dates + Keywords
- Context-aware date classification
- TF-IDF keyword ranking
- Almacenar en ranked_keywords

### Prioridad 4 (Semanas 7-8): Entity Relations
- Implementar relation extraction
- Graph storage
- Query optimization

---

**Costo Total Fase 2**: $0 (sin LLM)
**Mejora Estimada**: +50% precisión extracción, +40% keywords relevantes

**Siguiente**: Phase 3 - Summary Generation with Neuromarketing
