# Arquitectura Final - datosenabierto.es
## Procesamiento Semanal + LLM + Supabase

**Fecha:** 24 de Noviembre, 2025
**Versión:** 3.0 - Arquitectura Definitiva

---

## 🏗️ ARQUITECTURA COMPLETA

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Nuxt 3 SSR)                      │
│                                                         │
│  • UI educativa con explicaciones                       │
│  • Consulta Supabase directamente (rápido)             │
│  • WebLLM opcional para búsqueda local                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         SUPABASE (Database + Storage)                   │
│                                                         │
│  📊 PostgreSQL:                                         │
│     • categorias (oposiciones, ayudas, etc)            │
│     • documentos_procesados                             │
│     • explicaciones_llm                                 │
│     • favoritos_usuarios                                │
│                                                         │
│  🔒 Auth (opcional para favoritos)                      │
│  📦 Storage (PDFs, archivos procesados)                 │
└─────────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────────┐
│      NETLIFY FUNCTIONS (Serverless)                     │
│                                                         │
│  📍 /api/boe/proxy/[date]                              │
│     → Proxy + Caché para API BOE oficial               │
│                                                         │
│  ⏰ SCHEDULED WEEKLY (Domingo 7am)                      │
│     → Procesa TODA la semana anterior                  │
│     → Usa LLM (Claude/GPT) para explicaciones          │
│     → Guarda en Supabase                                │
│     → Envía notificaciones (opcional)                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│           SERVICIOS EXTERNOS                            │
│                                                         │
│  • API BOE Oficial (scraping)                          │
│  • Anthropic Claude (resúmenes/explicaciones)          │
│  • SendGrid (notificaciones email - opcional)          │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 TODAS LAS CATEGORÍAS DEFINIDAS

### Categorías Principales (Basadas en investigación)

#### 1. 🎓 **Oposiciones y Concursos** (Sección II-B)
**Prioridad:** ⭐⭐⭐ MÁXIMA
**Frecuencia de búsqueda:** Altísima
**Usuarios:** Opositores, estudiantes

**Subcategorías:**
- Convocatorias nuevas
- Bases y requisitos
- Listas admitidos/excluidos
- Fechas de exámenes
- Resultados y aprobados

**Información extraída:**
- Organismo convocante
- Número de plazas
- Tipo (libre/interno/promoción)
- Cuerpo/categoría
- Requisitos (título, edad, etc)
- Fechas límite de inscripción
- Pruebas a realizar
- Temario

**Explicaciones LLM:**
- ¿Qué hace un [puesto]?
- ¿Cumplo los requisitos?
- Pasos para inscribirme
- Cómo preparar el examen

---

#### 2. 💰 **Subvenciones y Ayudas** (Secciones III y V)
**Prioridad:** ⭐⭐⭐ MÁXIMA
**Frecuencia:** Alta
**Usuarios:** Emprendedores, PYMES, estudiantes, autónomos

**Subcategorías:**
- Ayudas para emprendedores
- Subvenciones I+D
- Becas de estudio/investigación
- Ayudas formación
- Ayudas sector primario (agricultura, ganadería)
- Ayudas digitalización
- Ayudas vivienda

**Información extraída:**
- Organismo convocante
- Cuantía (min/max)
- Porcentaje subvencionable
- Requisitos
- Plazos de solicitud
- Gastos elegibles
- Criterios de valoración

**Explicaciones LLM:**
- ¿Qué es esta subvención?
- ¿Puedo solicitarla? (análisis requisitos)
- ¿En qué puedo gastar el dinero?
- Cómo rellenar la solicitud
- Consejos para que me la concedan

---

#### 3. 📜 **Cambios Legislativos** (Sección I)
**Prioridad:** ⭐⭐⭐ ALTA
**Usuarios:** Ciudadanos, profesionales, asesores

**Subcategorías:**
- Leyes Orgánicas
- Reales Decretos
- Órdenes Ministeriales
- Modificaciones de leyes existentes
- Nuevas regulaciones

**Áreas de interés:**
- IRPF y fiscalidad
- Derecho laboral
- Vivienda y alquiler
- Protección de datos
- Consumo
- Medio ambiente

**Información extraída:**
- Ley modificada
- Qué cambia exactamente
- Desde cuándo (entrada en vigor)
- A quién afecta
- Antes vs Ahora

**Explicaciones LLM:**
- ¿Qué significa este cambio?
- ¿Cómo me afecta en mi día a día?
- ¿Qué debo hacer?
- Comparativa antes/después
- Ejemplos prácticos

---

#### 4. 🏛️ **Nombramientos** (Sección II-A)
**Prioridad:** ⭐⭐ MEDIA
**Usuarios:** Profesionales del sector público, periodistas

**Subcategorías:**
- Altos cargos
- Funcionarios
- Personal eventual
- Ceses

**Información extraída:**
- Nombre del nombrado
- Cargo
- Organismo
- Fecha efectiva

**Explicaciones LLM:**
- ¿Qué hace este cargo?
- ¿Por qué es relevante?
- Cambios que puede suponer

---

#### 5. 🏢 **Licitaciones Públicas** (Sección III)
**Prioridad:** ⭐⭐ MEDIA-ALTA
**Usuarios:** PYMES, autónomos, empresas

**Subcategorías:**
- Obra pública
- Servicios
- Suministros
- Consultoría

**Información extraída:**
- Organismo licitador
- Objeto del contrato
- Presupuesto base
- Plazo de ejecución
- Requisitos técnicos
- Plazo de presentación
- Criterios de adjudicación

**Explicaciones LLM:**
- ¿Qué están contratando?
- ¿Puedo presentarme?
- Requisitos técnicos explicados
- Cómo preparar la oferta

---

#### 6. 🎓 **Educación y Becas** (Secciones III, V)
**Prioridad:** ⭐⭐ ALTA
**Usuarios:** Estudiantes, familias

**Subcategorías:**
- Becas universitarias
- Becas FP
- Ayudas comedor
- Becas internacionales
- Premios académicos

**Información extraída:**
- Nivel educativo
- Cuantía
- Requisitos académicos/económicos
- Plazo de solicitud
- Documentación necesaria

**Explicaciones LLM:**
- ¿Cumplo los requisitos?
- Documentos necesarios explicados
- Cómo calcular si tengo derecho

---

#### 7. 🏠 **Vivienda** (Secciones I, III)
**Prioridad:** ⭐⭐ MEDIA-ALTA
**Usuarios:** Ciudadanos en general

**Subcategorías:**
- VPO (Vivienda Protección Oficial)
- Ayudas al alquiler
- Rehabilitación vivienda
- Ayudas jóvenes
- Regulaciones alquiler

**Información extraída:**
- Tipo de ayuda
- Cuantía
- Requisitos renta
- Plazo solicitud
- Cambios regulación

**Explicaciones LLM:**
- ¿Puedo acceder a VPO?
- Requisitos de renta explicados
- Cómo solicitarla

---

#### 8. 💼 **Empleo y Relaciones Laborales** (Sección I)
**Prioridad:** ⭐⭐ ALTA
**Usuarios:** Trabajadores, empresarios, autónomos

**Subcategorías:**
- Salario Mínimo Interprofesional
- Convenios colectivos
- Regulación teletrabajo
- Despidos
- Seguridad Social

**Información extraída:**
- Qué regula
- A quién afecta
- Desde cuándo
- Cambios respecto anterior

**Explicaciones LLM:**
- ¿Me afecta este cambio?
- ¿Qué significa en mi nómina?
- Derechos y obligaciones

---

#### 9. 🌱 **Medio Ambiente y Sostenibilidad** (Secciones I, III)
**Prioridad:** ⭐⭐ MEDIA
**Usuarios:** Empresas, ciudadanos interesados, ONGs

**Subcategorías:**
- Ayudas eficiencia energética
- Subvenciones renovables
- Regulación emisiones
- Protección espacios naturales
- Gestión residuos

**Información extraída:**
- Tipo de ayuda/regulación
- Requisitos
- Cuantía
- Ámbito aplicación

**Explicaciones LLM:**
- ¿Puedo pedir ayuda para placas solares?
- ¿Qué significa esta regulación?
- Ahorro estimado

---

#### 10. 🚗 **Tráfico y Movilidad** (Sección I)
**Prioridad:** ⭐ MEDIA-BAJA
**Usuarios:** Conductores, ciudadanos

**Subcategorías:**
- Nuevas multas
- Zonas de bajas emisiones
- Permisos de conducir
- ITV

**Información extraída:**
- Qué cambia
- Desde cuándo
- Sanciones

**Explicaciones LLM:**
- ¿Me afecta en mi ciudad?
- ¿Puedo circular con mi coche?
- Alternativas

---

#### 11. 🏥 **Salud** (Secciones I, III)
**Prioridad:** ⭐⭐ MEDIA
**Usuarios:** Ciudadanos, profesionales sanitarios

**Subcategorías:**
- Autorizaciones medicamentos
- Cambios tarjeta sanitaria
- Ayudas dependencia
- Regulación sanitaria

**Información extraída:**
- Qué se autoriza/cambia
- A quién afecta
- Procedimiento

**Explicaciones LLM:**
- ¿Qué significa esta autorización?
- ¿Dónde solicitar ayuda dependencia?

---

#### 12. 📱 **Tecnología y Telecomunicaciones** (Sección I, III)
**Prioridad:** ⭐⭐ MEDIA
**Usuarios:** Usuarios, empresas tech

**Subcategorías:**
- Regulación digital
- Ayudas digitalización
- Protección datos
- Ciberseguridad

**Información extraída:**
- Qué regula
- Obligaciones
- Ayudas disponibles

**Explicaciones LLM:**
- ¿Qué debo hacer en mi web?
- ¿Cómo pedir ayuda Kit Digital?

---

## 🗄️ SCHEMA SUPABASE

```sql
-- Categorías (tabla maestra)
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL, -- 'oposiciones', 'ayudas', etc
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50), -- emoji o icon name
  prioridad INTEGER DEFAULT 0, -- orden de mostrar
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documentos BOE procesados
CREATE TABLE documentos_boe (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boe_id VARCHAR(100) UNIQUE NOT NULL, -- ID oficial BOE
  categoria_id UUID REFERENCES categorias(id),

  -- Datos básicos
  fecha_publicacion DATE NOT NULL,
  seccion VARCHAR(10), -- 'I', 'II', 'III', etc
  titulo TEXT NOT NULL,
  organismo VARCHAR(500),

  -- URLs oficiales
  url_boe VARCHAR(500),
  url_pdf VARCHAR(500),
  url_html VARCHAR(500),
  url_xml VARCHAR(500),

  -- Contenido raw
  contenido_raw TEXT,

  -- Datos estructurados extraídos
  datos_estructurados JSONB, -- JSON con datos específicos de cada categoría

  -- Fechas importantes extraídas
  fechas_importantes JSONB, -- {limite_inscripcion, examen, etc}

  -- Índices para búsqueda
  keywords TEXT[], -- array de palabras clave

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documentos_categoria ON documentos_boe(categoria_id);
CREATE INDEX idx_documentos_fecha ON documentos_boe(fecha_publicacion DESC);
CREATE INDEX idx_documentos_keywords ON documentos_boe USING GIN(keywords);

-- Explicaciones generadas por LLM
CREATE TABLE explicaciones_llm (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documento_id UUID REFERENCES documentos_boe(id) ON DELETE CASCADE,

  -- Tipo de explicación
  tipo VARCHAR(50) NOT NULL, -- 'resumen', 'que_es', 'como_hacer', 'requisitos', etc

  -- Contenido generado
  contenido TEXT NOT NULL,

  -- Metadata del LLM
  modelo_usado VARCHAR(50), -- 'claude-3-haiku', 'gpt-4o-mini'
  tokens_usados INTEGER,
  prompt_usado TEXT,

  -- Control de calidad
  validada BOOLEAN DEFAULT FALSE,
  feedback_usuario INTEGER, -- 1-5 estrellas

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_explicaciones_documento ON explicaciones_llm(documento_id, tipo);

-- Ejemplos y casos prácticos (generados por LLM)
CREATE TABLE ejemplos_practicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documento_id UUID REFERENCES documentos_boe(id) ON DELETE CASCADE,

  titulo VARCHAR(255),
  descripcion TEXT,
  caso_ejemplo TEXT, -- Texto del ejemplo
  calculadora_datos JSONB, -- Si tiene calculadora, los datos

  created_at TIMESTAMP DEFAULT NOW()
);

-- Estadísticas agregadas por categoría
CREATE TABLE estadisticas_categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias(id),
  semana_inicio DATE NOT NULL,
  semana_fin DATE NOT NULL,

  -- Stats
  total_documentos INTEGER DEFAULT 0,
  nuevos_esta_semana INTEGER DEFAULT 0,
  comparacion_semana_anterior JSONB,

  -- Tendencias
  tendencias TEXT, -- Texto generado por LLM
  insights TEXT, -- Insights generados por LLM

  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(categoria_id, semana_inicio)
);

-- FAQs por categoría (generadas automáticamente)
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias(id),
  documento_id UUID REFERENCES documentos_boe(id), -- opcional, puede ser FAQ general

  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  orden INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Favoritos de usuarios (opcional - si implementamos auth)
CREATE TABLE favoritos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- Supabase auth.users.id
  documento_id UUID REFERENCES documentos_boe(id) ON DELETE CASCADE,

  notas TEXT, -- Notas personales del usuario

  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, documento_id)
);

CREATE INDEX idx_favoritos_user ON favoritos(user_id);

-- Log de procesamiento semanal
CREATE TABLE procesamiento_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP,

  semana_procesada_inicio DATE NOT NULL,
  semana_procesada_fin DATE NOT NULL,

  total_documentos_procesados INTEGER DEFAULT 0,
  total_explicaciones_generadas INTEGER DEFAULT 0,
  total_tokens_usados INTEGER DEFAULT 0,
  coste_estimado_usd DECIMAL(10,2),

  errores JSONB, -- Array de errores si hubo

  completado BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ⚙️ PROCESAMIENTO SEMANAL

### Cloud Function Scheduled (Domingo 7am)

```typescript
// netlify/functions/scheduled-weekly-processing.ts
import { schedule } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // service key para permisos totales
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

// Ejecutar cada domingo a las 7am
export const handler = schedule('0 7 * * 0', async (event) => {
  console.log('🚀 Iniciando procesamiento semanal del BOE...')

  // Crear log de procesamiento
  const { data: logEntry } = await supabase
    .from('procesamiento_log')
    .insert({
      fecha_inicio: new Date(),
      semana_procesada_inicio: getLastWeekMonday(),
      semana_procesada_fin: getLastWeekSunday()
    })
    .select()
    .single()

  try {
    // 1. Obtener todos los BOE de la semana pasada
    const semanaDocumentos = await fetchSemanaCompleta()

    // 2. Procesar cada categoría
    const categorias = await supabase.from('categorias').select('*').eq('activa', true)

    for (const categoria of categorias.data) {
      console.log(`📂 Procesando categoría: ${categoria.nombre}`)

      // Filtrar documentos de esta categoría
      const docsCategoria = clasificarDocumentos(semanaDocumentos, categoria)

      // Procesar cada documento
      for (const doc of docsCategoria) {
        await procesarDocumento(doc, categoria)
      }

      // Generar estadísticas de la categoría
      await generarEstadisticasCategoria(categoria, docsCategoria)
    }

    // 3. Actualizar log
    await supabase
      .from('procesamiento_log')
      .update({
        fecha_fin: new Date(),
        completado: true,
        total_documentos_procesados: semanaDocumentos.length
      })
      .eq('id', logEntry.id)

    console.log('✅ Procesamiento completado exitosamente')

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        documentos_procesados: semanaDocumentos.length
      })
    }

  } catch (error) {
    console.error('❌ Error en procesamiento:', error)

    await supabase
      .from('procesamiento_log')
      .update({
        fecha_fin: new Date(),
        completado: false,
        errores: [{ message: error.message, stack: error.stack }]
      })
      .eq('id', logEntry.id)

    throw error
  }
})

// Función para procesar un documento individual
async function procesarDocumento(doc: BOEDocument, categoria: Categoria) {
  // 1. Extraer datos estructurados (regex + keywords)
  const datosEstructurados = await extraerDatosEstructurados(doc, categoria)

  // 2. Guardar documento en BD
  const { data: docGuardado } = await supabase
    .from('documentos_boe')
    .insert({
      boe_id: doc.id,
      categoria_id: categoria.id,
      fecha_publicacion: doc.fecha,
      seccion: doc.seccion,
      titulo: doc.titulo,
      organismo: doc.organismo,
      url_boe: doc.url,
      url_pdf: doc.url_pdf,
      contenido_raw: doc.contenido,
      datos_estructurados: datosEstructurados,
      fechas_importantes: extraerFechas(doc.contenido),
      keywords: extraerKeywords(doc.titulo + ' ' + doc.contenido)
    })
    .select()
    .single()

  // 3. Generar explicaciones con LLM
  await generarExplicacionesLLM(docGuardado, categoria)

  // 4. Generar ejemplos prácticos
  await generarEjemplosPracticos(docGuardado, categoria)

  // 5. Generar FAQs
  await generarFAQs(docGuardado, categoria)
}

// Generar explicaciones con Claude
async function generarExplicacionesLLM(documento: any, categoria: Categoria) {
  const explicacionesTipos = getExplicacionesPorCategoria(categoria.slug)

  for (const tipo of explicacionesTipos) {
    const prompt = generarPrompt(tipo, documento, categoria)

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Modelo barato para procesamiento masivo
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const contenido = message.content[0].text

    await supabase.from('explicaciones_llm').insert({
      documento_id: documento.id,
      tipo: tipo,
      contenido: contenido,
      modelo_usado: 'claude-3-5-haiku',
      tokens_usados: message.usage.input_tokens + message.usage.output_tokens,
      prompt_usado: prompt
    })
  }
}

// Tipos de explicaciones según categoría
function getExplicacionesPorCategoria(categoriaSlug: string): string[] {
  const explicaciones = {
    'oposiciones': [
      'resumen',
      'que_hace_puesto',
      'requisitos_explicados',
      'como_inscribirme',
      'como_preparar',
      'pasos_siguientes'
    ],
    'ayudas': [
      'resumen',
      'que_es_subvencion',
      'requisitos_explicados',
      'como_solicitarla',
      'gastos_permitidos',
      'consejos_concesion',
      'ejemplo_calculo'
    ],
    'cambios-legislativos': [
      'resumen',
      'que_cambia',
      'antes_vs_ahora',
      'quien_afecta',
      'que_hacer',
      'ejemplo_practico'
    ],
    // ... más categorías
  }

  return explicaciones[categoriaSlug] || ['resumen']
}

// Generar prompt según tipo de explicación
function generarPrompt(tipo: string, documento: any, categoria: Categoria): string {
  const prompts = {
    'resumen': `
      Eres un experto en comunicación clara de documentos oficiales españoles.

      Resume este documento del BOE en 3-4 líneas usando lenguaje simple que cualquier
      ciudadano pueda entender. Evita jerga legal.

      Documento:
      Título: ${documento.titulo}
      Contenido: ${documento.contenido_raw.substring(0, 2000)}

      Genera un resumen claro y directo.
    `,

    'requisitos_explicados': `
      Eres un asesor que explica requisitos oficiales en lenguaje claro.

      Extrae y explica los requisitos de este documento del BOE.
      Para cada requisito oficial, da una explicación simple de qué significa.

      Documento:
      ${documento.contenido_raw.substring(0, 2000)}

      Formato de respuesta:
      - Requisito oficial: [texto literal]
        Explicación: [explicación simple]
        Alternativas válidas: [si las hay]
    `,

    'como_hacer': `
      Eres un guía práctico que ayuda a ciudadanos con trámites.

      Genera una lista paso a paso de cómo solicitar/hacer lo que indica este documento.
      Usa lenguaje claro, indica qué documentos necesitan y dónde hacerlo.

      Documento:
      ${documento.contenido_raw}

      Genera pasos concretos y accionables.
    `,

    'ejemplo_practico': `
      Eres un educador que usa ejemplos reales para explicar conceptos.

      Crea un ejemplo práctico y concreto de cómo este cambio legislativo
      afecta a una persona real. Usa números reales y situaciones cotidianas.

      Documento:
      ${documento.titulo}
      ${documento.contenido_raw.substring(0, 2000)}

      Crea un ejemplo que cualquiera pueda entender.
    `
  }

  return prompts[tipo] || prompts['resumen']
}
```

---

## 📊 COSTES ESTIMADOS

### Procesamiento Semanal con LLM

**Asumiendo:**
- 500 documentos/semana a procesar
- 5 explicaciones por documento = 2,500 llamadas LLM
- Claude 3.5 Haiku: $1/1M input tokens, $5/1M output tokens
- ~500 tokens input, ~300 tokens output por llamada

**Cálculo:**
```
Input: 2,500 * 500 tokens = 1,250,000 tokens = $1.25
Output: 2,500 * 300 tokens = 750,000 tokens = $3.75
Total semanal: ~$5
Total mensual: ~$20
```

**¡Súper económico!** 🎉

---

## 🚀 PRÓXIMOS PASOS (EN ORDEN)

1. **Setup Supabase**
   - Crear proyecto
   - Ejecutar schema SQL
   - Configurar RLS (Row Level Security)
   - Obtener credenciales

2. **Proxy API BOE**
   - `/api/boe/proxy/[date].ts`

3. **Seed Categorías**
   - Insertar las 12 categorías en Supabase

4. **Cloud Function Semanal**
   - Estructura base
   - Fetch semana BOE
   - Clasificación por categoría

5. **Procesadores por Categoría**
   - Extracción datos estructurados
   - Llamadas LLM
   - Guardar en Supabase

6. **UI Categoría por Categoría**
   - Empezar con Oposiciones
   - Luego Ayudas
   - Luego el resto

¿Empezamos con el Setup de Supabase?
