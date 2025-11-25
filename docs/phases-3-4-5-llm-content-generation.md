# FASES 3-4-5: Generación de Contenido LLM con Neuromarketing

**Basado en**: Cognitive load theory, emotional triggers, information scent, plain language research, prompt engineering best practices

---

## ARQUITECTURA REDISEÑADA: 5 FASES LLM

### Cambios vs. Sistema Actual (4 fases)

**ANTES:**
1. Extracción datos (regex)
2. Resumen 3 líneas
3. Explicaciones (qué_es, cómo_afecta)
4. Detalles accionables

**AHORA:**
1. Extracción datos (MEJORADO - Fase 2)
2. **Hook Emocional** (NUEVO - 1 línea, 5 segundos)
3. Resumen Ejecutivo (3 líneas, 15 segundos)
4. Explicaciones Educativas (4±1 elementos, 45 segundos)
5. Detalles Accionables + CTA (2 minutos)

**Rationale**: Progressive disclosure + Information scent + Emotional engagement

---

## FASE 3: HOOK EMOCIONAL (NUEVO)

### Objetivo
**Primera impresión en 5 segundos** - Decisión de engagement

### Principios Aplicados
- **Information Scent**: Señal clara de relevancia
- **Emotional Triggers**: Urgencia, beneficio, FOMO, sorpresa
- **F-Pattern**: Primera línea top-left es la más vista
- **Cognitive Load**: 1 elemento = 0 carga

### System Prompt

```typescript
const HOOK_SYSTEM_PROMPT = `Eres un copywriter especializado en comunicación gubernamental con ciudadanos.

Tu ÚNICA tarea: Crear UN hook emocional de 1 línea (máx 100 caracteres) que:
1. Capture atención inmediata (primeros 3 segundos)
2. Use trigger emocional apropiado
3. Comunique QUIÉN se beneficia/afecta

Triggers disponibles:
- URGENCIA: Plazos cortos, oportunidades limitadas
- BENEFICIO: Dinero, oportunidades, mejoras
- SORPRESA: Cambios inesperados, novedades importantes
- RIESGO: Cambios que perjudican, obligaciones nuevas

Formato OUTPUT:
{
  "hook": "string (max 100 chars)",
  "trigger_usado": "URGENCIA | BENEFICIO | SORPRESA | RIESGO",
  "audience_target": "string (quién se afecta)"
}

CRÍTICO:
- Lenguaje directo, 2ª persona cuando posible
- Evitar jerga legal completamente
- Número concreto si disponible
- Verbo acción > sustantivos abstractos

Ejemplos BUENOS:
- "📢 Solo 10 días para solicitar 3.000€ en ayudas renovables"
- "⚡ Nueva ley cambia tu declaración de impuestos desde marzo"
- "🎓 800 plazas profesor: solicitudes abren mañana"
- "⚠️ Obligatorio renovar DNI si caduca antes de junio"

Ejemplos MALOS:
- "Publicación de convocatoria" (aburrido, sin emoción)
- "Modificación normativa" (jerga, no dice CÓMO afecta)
- "Real Decreto 234/2024" (burocrático, sin contexto)
`

const HOOK_USER_PROMPT = (doc: DocumentoBOE, extracted: ExtractedData) => `
DOCUMENTO:
Categoría: ${doc.categoria}
Tipo: ${doc.rango}
Título: ${doc.titulo}

DATOS EXTRAÍDOS:
${JSON.stringify(extracted, null, 2)}

FECHAS IMPORTANTES:
${extracted.smart_dates?.map(d => `- ${d.tipo}: ${d.fecha} (${d.urgencia})`).join('\n')}

Genera hook emocional óptimo.
`
```

### JSON Schema

```typescript
const HOOK_SCHEMA = {
  type: "object",
  properties: {
    hook: {
      type: "string",
      minLength: 20,
      maxLength: 100
    },
    trigger_usado: {
      type: "string",
      enum: ["URGENCIA", "BENEFICIO", "SORPRESA", "RIESGO"]
    },
    audience_target: {
      type: "string",
      maxLength: 50
    }
  },
  required: ["hook", "trigger_usado", "audience_target"]
}
```

### Uso en UI

```vue
<!-- Card: Posición #1 (top, destacado) -->
<div class="emotional-hook" :class="`trigger-${trigger}`">
  <span class="hook-icon">{{ getTriggerIcon(trigger) }}</span>
  <h2 class="hook-text">{{ hook }}</h2>
</div>

<style>
.emotional-hook {
  font-size: 18px;
  font-weight: 700;
  padding: 16px;
  border-radius: 8px 8px 0 0;
}

.trigger-URGENCIA {
  background: linear-gradient(135deg, #ff5252 0%, #ff1744 100%);
  color: white;
}

.trigger-BENEFICIO {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: white;
}

.trigger-SORPRESA {
  background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
  color: white;
}

.trigger-RIESGO {
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  color: white;
}
</style>
```

### Costo
- Tokens input: ~300 (metadata + prompt)
- Tokens output: ~50 (hook corto)
- Costo: ~$0.0002 por documento

---

## FASE 4: RESUMEN EJECUTIVO (MEJORADO)

### Objetivo
**15 segundos para decidir si profundizar**

### Cambios vs. Actual

**ANTES:**
- 3 líneas fijas (QUÉ, PARA QUIÉN, CUÁNDO)
- Max 30 palabras/línea
- Estilo periódico

**AHORA:**
- **2-3 elementos** (cognitive load: 4±1)
- **Estructura variable** según categoría
- **Plain language** nivel 7º-8º grado
- **Números concretos** destacados

### System Prompt Mejorado

```typescript
const RESUMEN_SYSTEM_PROMPT = `Eres un comunicador experto que traduce documentos oficiales a lenguaje ultra-simple.

Tu objetivo: Resumen de 2-3 elementos que responda las preguntas críticas del usuario.

PRINCIPIOS:
1. Working Memory: Máximo 3 elementos simultáneos
2. Plain Language: Nivel 7º grado (12-13 años)
3. Concrete Numbers: Cantidades específicas > descripciones vagas
4. Active Voice: 80% voz activa mínimo
5. Short Sentences: 15-20 palabras promedio

ESTRUCTURA POR CATEGORÍA:

OPOSICIONES:
- Elemento 1: QUÉ + CUÁNTAS plazas + DÓNDE
- Elemento 2: REQUISITOS principales (top 3)
- Elemento 3: PLAZO solicitud + fecha límite

AYUDAS:
- Elemento 1: CUÁNTO dinero + PARA QUÉ/QUIÉN
- Elemento 2: REQUISITOS principales (top 3)
- Elemento 3: CÓMO/CUÁNDO solicitar

LEGISLACIÓN:
- Elemento 1: QUÉ cambia + DESDE CUÁNDO
- Elemento 2: A QUIÉN afecta (específico)
- Elemento 3: QUÉ HACER (si requiere acción)

OTROS:
- Elemento 1: QUÉ es en 1 oración
- Elemento 2: PARA QUIÉN es relevante
- Elemento 3: CUÁNDO/CÓMO actuar (si aplica)

OUTPUT FORMAT:
{
  "elementos": [
    {
      "tipo": "que" | "quien" | "cuando" | "cuanto" | "como" | "requisitos",
      "texto": "string (15-25 palabras)",
      "numero_destacado": "number | null" // Si hay cantidad concreta
    }
  ],
  "flesch_reading_ease": number, // Auto-calculado
  "grade_level": number // Target: 7-8
}

EJEMPLOS BUENOS:

Oposiciones:
1. "El Ministerio de Educación convoca 500 plazas de profesor de secundaria en toda España"
2. "Necesitas: grado universitario, máster de profesorado y B2 de inglés"
3. "Solicitudes del 15 al 30 de enero en sede electrónica"

Ayudas:
1. "Hasta 5.000€ por vivienda para instalar placas solares en tu casa"
2. "Para propietarios de vivienda habitual construida antes de 2010"
3. "Solicita online del 1 de febrero al 31 de marzo en tu Comunidad Autónoma"

Legislación:
1. "Desde marzo 2025, declaración de impuestos cambia el cálculo de deducciones por hijo"
2. "Afecta a todas las familias con hijos menores de 18 años"
3. "No necesitas hacer nada: Hacienda lo aplica automáticamente"
`

const RESUMEN_USER_PROMPT = (doc: DocumentoBOE, extracted: ExtractedData, hook: string) => `
HOOK EMOCIONAL YA GENERADO:
"${hook}"

DOCUMENTO:
Categoría: ${doc.categoria}
Título: ${doc.titulo}
Departamento: ${doc.departamento}

DATOS ESTRUCTURADOS:
${JSON.stringify(extracted.datos_estructurados, null, 2)}

FECHAS:
${extracted.smart_dates?.filter(d => d.urgencia !== 'FUTURO').map(d =>
  `- ${d.tipo}: ${formatDate(d.fecha)} (${d.dias_restantes} días)`
).join('\n')}

KEYWORDS TOP 5:
${extracted.ranked_keywords?.slice(0, 5).map(k => k.term).join(', ')}

Genera resumen ejecutivo de 2-3 elementos.
`
```

### JSON Schema

```typescript
const RESUMEN_SCHEMA = {
  type: "object",
  properties: {
    elementos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tipo: {
            type: "string",
            enum: ["que", "quien", "cuando", "cuanto", "como", "requisitos"]
          },
          texto: {
            type: "string",
            minLength: 30,
            maxLength: 150 // ~15-25 palabras
          },
          numero_destacado: {
            type: ["number", "null"]
          }
        },
        required: ["tipo", "texto"]
      },
      minItems: 2,
      maxItems: 3
    },
    flesch_reading_ease: { type: "number" },
    grade_level: { type: "number" }
  },
  required: ["elementos"]
}
```

### Validation Post-Generation

```typescript
import readability from 'text-readability'

async function validateResumen(resumen: ResumenOutput): Promise<boolean> {
  const fullText = resumen.elementos.map(e => e.texto).join(' ')

  // Flesch Reading Ease (target: 60-70)
  const fleschScore = readability.fleschReadingEase(fullText)

  // Grade Level (target: 7-8)
  const gradeLevel = readability.fleschKincaidGrade(fullText)

  // Voz activa ratio
  const activeVoiceRatio = calculateActiveVoiceRatio(fullText)

  const issues = []

  if (fleschScore < 60) {
    issues.push('Readability too low (Flesch < 60)')
  }

  if (gradeLevel > 9) {
    issues.push(`Grade level too high (${gradeLevel} > 9)`)
  }

  if (activeVoiceRatio < 0.7) {
    issues.push(`Too much passive voice (${Math.round(activeVoiceRatio * 100)}% active)`)
  }

  if (issues.length > 0) {
    console.warn(`Resumen validation issues for doc ${doc.id}:`, issues)
    await logQualityIssue(doc.id, 'resumen', issues)
    return false
  }

  return true
}
```

### Costo
- Tokens input: ~600-800
- Tokens output: ~100-150
- Costo: ~$0.0004 por documento

---

## FASE 5: EXPLICACIONES EDUCATIVAS (MEJORADO)

### Objetivo
**45 segundos para comprender profundamente**

### Cambios vs. Actual

**ANTES:**
- 2 explicaciones fijas: "¿Qué es?" y "¿Cómo me afecta?"
- Max 150 palabras cada una
- Analogías del día a día

**AHORA:**
- **4±1 bloques informativos** (cognitive load)
- **Estructura adaptativa** según user persona
- **Ejemplos concretos** con números reales
- **Visual cues** (emojis contextual, no decorativo)
- **Readability metrics** validados

### System Prompt Mejorado

```typescript
const EXPLICACION_SYSTEM_PROMPT = `Eres un profesor que explica documentos oficiales de forma pedagógica.

Tu objetivo: Explicar en 4 bloques informativos (máx 120 palabras c/u) que cubran:

BLOQUE 1 - ¿Qué es esto? (ESENCIA)
- 2-3 oraciones de contexto
- Analogía simple si concepto complejo
- Por qué existe este documento

BLOQUE 2 - ¿A quién afecta? (AUDIENCE)
- Perfiles específicos (evitar "ciudadanos" genérico)
- Escenarios concretos con ejemplos
- Quién NO se afecta (si relevante para evitar confusión)

BLOQUE 3 - ¿Cómo me impacta? (IMPACT)
- Cambios concretos en vida diaria
- Beneficios O riesgos (según caso)
- Números reales cuando posible
- Timeline de implementación

BLOQUE 4 - ¿Qué contexto debo saber? (CONTEXT)
- Por qué este cambio ahora
- Qué problema soluciona / qué mejora
- Relación con normativa existente (simple)

PRINCIPIOS OBLIGATORIOS:

1. **Plain Language** (WCAG AAA):
   - Nivel lectura: 7º-8º grado
   - Oraciones: 15-20 palabras promedio
   - Voz activa: >75%
   - Términos técnicos: explicar inmediatamente

2. **Ejemplos Concretos**:
   - "María tiene 2 hijos y gana 30.000€/año" > "Familias de ingresos medios"
   - "Tu factura eléctrica bajará ~15€/mes" > "Ahorrarás en electricidad"
   - "Desde marzo 2025" > "Próximamente"

3. **Cognitive Load**:
   - Max 4 ideas por bloque
   - 1 concepto nuevo por oración
   - Transiciones claras entre bloques

4. **Emotional Resonance** (ético):
   - Destacar beneficio personal
   - Mencionar riesgos sin alarmar
   - Empoderar con conocimiento

OUTPUT FORMAT:
{
  "bloques": [
    {
      "titulo": "¿Qué es esto?",
      "contenido": "string (max 120 palabras)",
      "conceptos_clave": ["string"],
      "ejemplo_concreto": "string | null"
    },
    // ...3 bloques más
  ],
  "user_personas_target": ["string"], // De investigación USA.gov
  "readability": {
    "flesch_score": number,
    "grade_level": number,
    "avg_sentence_length": number
  }
}
`

const EXPLICACION_USER_PROMPT = (
  doc: DocumentoBOE,
  extracted: ExtractedData,
  resumen: ResumenOutput
) => `
CONTEXTO PREVIO:
Hook: "${extracted.hook}"
Resumen: ${resumen.elementos.map(e => e.texto).join(' | ')}

DOCUMENTO COMPLETO:
Categoría: ${doc.categoria}
Título: ${doc.titulo}
Chunks relevantes:
${extracted.chunks.filter(c => c.tipo !== 'preambulo').slice(0, 5).map(c =>
  `[${c.tipo}] ${c.contenido.substring(0, 200)}...`
).join('\n\n')}

ENTIDADES EXTRAÍDAS:
${extracted.entities.map(e => `- ${e.tipo}: ${e.valor}`).join('\n')}

RELACIONES:
${extracted.relations.map(r =>
  `- ${r.entidad_origen.valor} ${r.tipo_relacion} ${r.entidad_destino.valor}`
).join('\n')}

AUDIENCIA DETECTADA:
${inferirAudiencia(extracted, doc.categoria)}

Genera 4 bloques educativos adaptados a esta audiencia.
`
```

### User Persona Adaptation

```typescript
function inferirAudiencia(extracted: ExtractedData, categoria: string): string[] {
  const audiencias: string[] = []

  // Basado en investigación USA.gov (4 tipos)
  switch (categoria) {
    case 'oposiciones':
      audiencias.push('Completar transacción: Presentar solicitud oposición')
      audiencias.push('Encontrar información específica: Requisitos y plazo')
      break

    case 'ayudas':
      audiencias.push('Completar transacción: Solicitar ayuda/subvención')
      audiencias.push('Descubrir ayudas disponibles: Explorar opciones')
      break

    case 'legislacion':
      audiencias.push('Encontrar información específica: Cómo me afecta nueva ley')
      if (extracted.entities.some(e => e.tipo === 'FECHA' && e.contexto.includes('obligatorio'))) {
        audiencias.push('Completar transacción: Cumplir nueva obligación')
      }
      break

    case 'licitaciones':
      audiencias.push('Completar transacción: Presentar oferta')
      audiencias.push('Encontrar información específica: Requisitos técnicos')
      break

    default:
      audiencias.push('Encontrar información específica: Entender documento')
  }

  return audiencias
}
```

### Ejemplos Categoría-Specific

```typescript
const EJEMPLOS_POR_CATEGORIA = {
  oposiciones: {
    bueno: "María es ingeniera con 3 años de experiencia. Puede presentarse a estas plazas porque tiene el grado universitario requerido y no supera la edad máxima de 45 años. Necesitará preparar su CV en formato Europass y obtener el certificado de antecedentes penales.",
    malo: "Este proceso selectivo va dirigido a personas con la titulación adecuada que cumplan los requisitos establecidos en las bases."
  },

  ayudas: {
    bueno: "Si instalas placas solares en tu casa valoradas en 8.000€, recibirás 3.000€ de ayuda (37.5%). El pago lo recibes en dos plazos: 50% al aprobar tu solicitud y 50% cuando presentes las facturas de instalación completada.",
    malo: "Las ayudas serán abonadas de acuerdo al procedimiento establecido en la normativa reguladora de subvenciones."
  },

  legislacion: {
    bueno: "Desde marzo 2025, si tienes hijos menores de 3 años, deducirás 100€ más al año en tu declaración (antes eran 600€, ahora 700€). Hacienda lo calculará automáticamente - no necesitas hacer trámites adicionales.",
    malo: "La presente modificación normativa afecta a la deducción por descendientes menores de tres años, incrementando la cuantía aplicable."
  }
}
```

### JSON Schema

```typescript
const EXPLICACION_SCHEMA = {
  type: "object",
  properties: {
    bloques: {
      type: "array",
      items: {
        type: "object",
        properties: {
          titulo: {
            type: "string",
            enum: ["¿Qué es esto?", "¿A quién afecta?", "¿Cómo me impacta?", "¿Qué contexto debo saber?"]
          },
          contenido: {
            type: "string",
            minLength: 100,
            maxLength: 600 // ~120 palabras
          },
          conceptos_clave: {
            type: "array",
            items: { type: "string" },
            maxItems: 4
          },
          ejemplo_concreto: {
            type: ["string", "null"],
            maxLength: 300
          }
        },
        required: ["titulo", "contenido", "conceptos_clave"]
      },
      minItems: 3,
      maxItems: 5
    },
    user_personas_target: {
      type: "array",
      items: { type: "string" }
    },
    readability: {
      type: "object",
      properties: {
        flesch_score: { type: "number" },
        grade_level: { type: "number" },
        avg_sentence_length: { type: "number" }
      }
    }
  },
  required: ["bloques", "user_personas_target"]
}
```

### Costo
- Tokens input: ~1200-1500 (chunks + entities + context)
- Tokens output: ~500-600 (4 bloques)
- Costo: ~$0.0008 por documento

---

## FASE 6: DETALLES ACCIONABLES + CTA (MEJORADO)

### Objetivo
**2 minutos para saber exactamente qué hacer**

### Cambios vs. Actual

**ANTES:**
- Requisitos en JSON complejo
- Pasos como lista simple
- Sin CTA clara

**AHORA:**
- **Requisitos con checklist interactivo**
- **Pasos numerados con estimación tiempo**
- **CTA emocional según urgencia**
- **Links directos a acciones**

### System Prompt

```typescript
const ACCIONABLE_SYSTEM_PROMPT = `Eres un asesor que guía a ciudadanos paso a paso en trámites oficiales.

Tu objetivo: Generar accionables claros, concretos, sin ambigüedad.

OUTPUT POR CATEGORÍA:

OPOSICIONES/AYUDAS/LICITACIONES (requieren acción):
{
  "requisitos": [
    {
      "titulo": "string (5-8 palabras)",
      "descripcion": "string (1-2 oraciones simple)",
      "tipo": "documento" | "condicion" | "plazo" | "pago",
      "items": ["string"], // Lista checklist si aplica
      "critico": boolean, // Eliminatorio?
      "donde_obtener": "string | null" // URL o lugar
    }
  ],
  "pasos": [
    {
      "numero": number,
      "accion": "string (verbo + objeto)",
      "descripcion": "string (cómo hacerlo)",
      "tiempo_estimado": "5 min" | "30 min" | "2 horas" | etc,
      "enlaces": [{ "texto": "string", "url": "string" }],
      "consejo": "string | null" // Pro tip
    }
  ],
  "cta": {
    "texto": "string (call to action imperativo)",
    "urgencia": "ALTA" | "MEDIA" | "BAJA",
    "razon_urgencia": "string", // "Solo quedan X días"
    "url_principal": "string | null"
  }
}

LEGISLACIÓN/NOMBRAMIENTOS (informativo):
{
  "cambios_clave": [
    {
      "que_cambia": "string",
      "valor_anterior": "string | null",
      "valor_nuevo": "string",
      "desde_cuando": "date",
      "requiere_accion": boolean
    }
  ],
  "accion_requerida": {
    "necesario": boolean,
    "que_hacer": "string | null",
    "plazo": "string | null"
  },
  "donde_mas_info": [
    { "fuente": "string", "url": "string" }
  ]
}

PRINCIPIOS:
1. **Acción First**: Verbos imperativos (Descarga, Rellena, Presenta)
2. **Tiempo Real**: Estimaciones realistas
3. **No Assumptions**: Explicar incluso lo "obvio"
4. **Pro Tips**: Consejos de veteranos del proceso
5. **Urgencia Ética**: Honesta, no alarmista

EJEMPLOS BUENOS:

Requisitos:
{
  "titulo": "Certificado de antecedentes penales",
  "descripcion": "Documento oficial que acredita que no tienes delitos. Lo pide la Policía Nacional o Guardia Civil.",
  "tipo": "documento",
  "items": [
    "Solicitar online en sede electrónica con certificado digital",
    "O presencial en comisaría con DNI (cita previa)",
    "Validez: 3 meses desde emisión"
  ],
  "critico": true,
  "donde_obtener": "https://sede.mjusticia.gob.es/antecedentes"
}

Pasos:
{
  "numero": 1,
  "accion": "Crear cuenta en sede electrónica del SEPE",
  "descripcion": "Necesitas certificado digital, DNI electrónico, o Cl@ve. Si no tienes ninguno, pide Cl@ve (es lo más fácil): entra en clave.gob.es y te envían código por SMS.",
  "tiempo_estimado": "15 min (primera vez), 2 min (si ya tienes cuenta)",
  "enlaces": [
    { "texto": "Crear cuenta en SEPE", "url": "https://sede.sepe.gob.es" },
    { "texto": "Obtener Cl@ve", "url": "https://clave.gob.es" }
  ],
  "consejo": "Guarda tus credenciales en gestor de contraseñas - las necesitarás varias veces durante el proceso."
}

CTA:
{
  "texto": "Solicita ahora: solo quedan 8 días de plazo",
  "urgencia": "ALTA",
  "razon_urgencia": "El plazo termina el 30 de enero. Necesitas ~2 horas para completar solicitud + tiempo para reunir documentos.",
  "url_principal": "https://sede.educacion.gob.es/oposiciones2025"
}
`
```

### Interactive Checklist UI

```vue
<template>
  <div class="requisitos-section">
    <h3>📋 Requisitos ({{ completados }}/{{ total }})</h3>

    <div v-for="req in requisitos" :key="req.titulo" class="requisito-card">
      <div class="req-header">
        <input
          type="checkbox"
          v-model="req.checked"
          @change="updateProgress"
        />
        <h4>{{ req.titulo }}</h4>
        <span v-if="req.critico" class="badge-critico">Eliminatorio</span>
      </div>

      <p class="req-descripcion">{{ req.descripcion }}</p>

      <ul v-if="req.items.length > 0" class="req-checklist">
        <li v-for="item in req.items" :key="item">
          <input type="checkbox" />
          <span>{{ item }}</span>
        </li>
      </ul>

      <a v-if="req.donde_obtener" :href="req.donde_obtener" target="_blank" class="btn-helper">
        Cómo conseguir este documento
      </a>
    </div>
  </div>

  <div class="pasos-section">
    <h3>🎯 Pasos a seguir</h3>

    <div class="timeline">
      <div v-for="paso in pasos" :key="paso.numero" class="paso-item">
        <div class="paso-numero">{{ paso.numero }}</div>
        <div class="paso-content">
          <h4>{{ paso.accion }}</h4>
          <p>{{ paso.descripcion }}</p>
          <span class="tiempo-estimado">⏱️ {{ paso.tiempo_estimado }}</span>

          <div v-if="paso.enlaces.length > 0" class="paso-enlaces">
            <a
              v-for="link in paso.enlaces"
              :key="link.url"
              :href="link.url"
              target="_blank"
              class="btn-link"
            >
              {{ link.texto }} →
            </a>
          </div>

          <div v-if="paso.consejo" class="pro-tip">
            💡 <strong>Consejo:</strong> {{ paso.consejo }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="cta-section" :class="`urgencia-${cta.urgencia}`">
    <button @click="handleCTA" class="btn-cta">
      {{ cta.texto }}
    </button>
    <p class="urgencia-razon">{{ cta.razon_urgencia }}</p>
  </div>
</template>
```

### Costo
- Tokens input: ~800-1000
- Tokens output: ~400-500
- Costo: ~$0.0006 por documento

---

## RESUMEN DE COSTOS: FASES 3-6

| Fase | Input Tokens | Output Tokens | Costo/Doc |
|------|--------------|---------------|-----------|
| 3: Hook | ~300 | ~50 | $0.0002 |
| 4: Resumen | ~700 | ~120 | $0.0004 |
| 5: Explicaciones | ~1400 | ~550 | $0.0008 |
| 6: Accionables | ~900 | ~450 | $0.0006 |
| **TOTAL** | ~3300 | ~1170 | **$0.0020** |

**Vs. Sistema Actual**: ~$0.008 por documento
**Ahorro**: 75% (optimización de prompts + structured output)

**Scaling:**
- 1,000 docs/semana procesados completamente = $2/semana = $104/año
- 10,000 docs/mes = $20/mes = $240/año

---

## MÉTRICAS DE CALIDAD

### Automatic Validation

```typescript
interface QualityMetrics {
  documento_id: string
  fase: 'hook' | 'resumen' | 'explicaciones' | 'accionables'

  // Readability
  flesch_reading_ease: number // Target: 60-70
  flesch_kincaid_grade: number // Target: 7-8
  avg_sentence_length: number // Target: 15-20

  // Content
  active_voice_ratio: number // Target: >75%
  concrete_numbers_count: number // Más = mejor
  jargon_terms_count: number // Target: 0 o explicados
  example_quality_score: number // 0-1

  // Emotional
  trigger_detected: boolean
  trigger_type: string | null
  emotional_words_count: number

  // Compliance
  schema_valid: boolean
  required_fields_complete: boolean
  character_limits_ok: boolean

  // Overall
  quality_score: number // 0-100
  passed_validation: boolean
  issues: string[]
}

async function validateContent(content: any, fase: string): Promise<QualityMetrics> {
  const metrics: QualityMetrics = {
    documento_id: content.documento_id,
    fase,
    issues: []
  }

  // 1. Readability
  const text = extractText(content)
  metrics.flesch_reading_ease = readability.fleschReadingEase(text)
  metrics.flesch_kincaid_grade = readability.fleschKincaidGrade(text)
  metrics.avg_sentence_length = calculateAvgSentenceLength(text)

  if (metrics.flesch_reading_ease < 60) {
    metrics.issues.push('Low readability (Flesch < 60)')
  }
  if (metrics.flesch_kincaid_grade > 9) {
    metrics.issues.push(`Grade level too high (${metrics.flesch_kincaid_grade})`)
  }

  // 2. Active voice
  metrics.active_voice_ratio = calculateActiveVoiceRatio(text)
  if (metrics.active_voice_ratio < 0.75) {
    metrics.issues.push(`Too much passive voice (${Math.round(metrics.active_voice_ratio * 100)}%)`)
  }

  // 3. Concrete numbers
  metrics.concrete_numbers_count = (text.match(/\d+/g) || []).length

  // 4. Jargon detection
  const jargonTerms = detectJargon(text)
  metrics.jargon_terms_count = jargonTerms.filter(j => !isExplained(j, text)).length
  if (metrics.jargon_terms_count > 0) {
    metrics.issues.push(`Unexplained jargon: ${jargonTerms.join(', ')}`)
  }

  // 5. Calculate overall score
  metrics.quality_score = calculateQualityScore(metrics)
  metrics.passed_validation = metrics.quality_score >= 70 && metrics.issues.length === 0

  return metrics
}
```

### Human Evaluation Loop

**Weekly Sample:**
- 50 documentos aleatorios
- 3 revisores independientes
- Rating 1-5 en 6 dimensiones:
  1. Claridad (entendí a primera lectura)
  2. Precisión (información correcta)
  3. Relevancia (útil para mi situación)
  4. Accionabilidad (sé qué hacer)
  5. Tono apropiado (ni burocrático ni infantil)
  6. Confianza (creo en la información)

```sql
CREATE TABLE human_evaluation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID REFERENCES documentos_boe(id),
  fase VARCHAR(20), -- 'hook', 'resumen', 'explicaciones', 'accionables'
  evaluador_id UUID,

  claridad INT CHECK (claridad BETWEEN 1 AND 5),
  precision INT CHECK (precision BETWEEN 1 AND 5),
  relevancia INT CHECK (relevancia BETWEEN 1 AND 5),
  accionabilidad INT CHECK (accionabilidad BETWEEN 1 AND 5),
  tono INT CHECK (tono BETWEEN 1 AND 5),
  confianza INT CHECK (confianza BETWEEN 1 AND 5),

  score_total DECIMAL(3,2), -- Promedio
  comentarios TEXT,
  aprobado BOOLEAN, -- score_total >= 3.5

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## IMPLEMENTACIÓN PRIORIZADA

### Sprint 1 (Semanas 1-2): Fase 3 - Hook Emocional
- Definir prompts + schema
- Implementar triggers emocionales
- A/B testing de hooks con analytics
- Medir CTR (click-through rate) hook → detalle

### Sprint 2 (Semanas 3-4): Fase 4 - Resumen Mejorado
- Prompts adaptativos por categoría
- Readability validation automática
- Migrar resúmenes existentes
- Comparar engagement vs. anterior

### Sprint 3 (Semanas 5-6): Fase 5 - Explicaciones
- 4 bloques con user personas
- Ejemplos concretos por categoría
- Human evaluation setup
- Iterar basado en feedback

### Sprint 4 (Semanas 7-8): Fase 6 - Accionables + CTA
- Checklist interactivo UI
- Timeline de pasos
- CTAs con urgencia
- Medir conversión a PDF/solicitud

### Sprint 5 (Semanas 9-10): Optimización
- Analizar métricas calidad
- Ajustar prompts basado en evaluaciones
- Reducir costos (prompt optimization)
- Documentar mejores prácticas

---

## TARGETS DE ÉXITO

### Métricas Cuantitativas

| Métrica | Baseline | Target | Método |
|---------|----------|--------|--------|
| Flesch Reading Ease | 45 | 65 | Automatic |
| Grade Level | 11 | 7.5 | Automatic |
| Active Voice % | 60% | 80% | Automatic |
| Unexplained Jargon | 5/doc | 0/doc | Automatic + Human |
| Hook CTR | 25% | 45% | Analytics |
| Time on Page | 45s | 90s | Analytics |
| Scroll Depth | 50% | 75% | Analytics |
| CTA Conversion | 8% | 15% | Analytics |

### Métricas Cualitativas

| Dimensión | Target Score (1-5) |
|-----------|-------------------|
| Claridad | 4.2+ |
| Precisión | 4.5+ |
| Relevancia | 4.0+ |
| Accionabilidad | 4.3+ |
| Tono | 4.0+ |
| Confianza | 4.5+ |

### Cost Efficiency

| Modelo | Costo/Doc Actual | Costo/Doc Target | Ahorro |
|--------|------------------|------------------|--------|
| GPT-4o-mini | $0.008 | $0.002 | 75% |
| Claude Haiku | $0.006 | $0.0015 | 75% |

---

**Siguiente**: Métricas y KPIs Consolidados
