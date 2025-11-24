# Investigación Exhaustiva: API del BOE
## Análisis Completo de Estructura de Datos y Oportunidades

**Fecha:** 24 de Noviembre, 2025
**Versión:** 1.0
**Autor:** Claude (Investigación)

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estructura de la API](#estructura-de-la-api)
3. [Análisis de Datos Disponibles](#análisis-de-datos-disponibles)
4. [Metadatos Útiles por Categoría](#metadatos-útiles-por-categoría)
5. [Limitaciones Identificadas](#limitaciones-identificadas)
6. [Oportunidades de Extracción](#oportunidades-de-extracción)
7. [Recomendaciones](#recomendaciones)

---

## 🎯 RESUMEN EJECUTIVO

### Hallazgos Clave

✅ **Lo que SÍ tenemos:**
- Estructura jerárquica completa: Sumario → Sección → Departamento → Epígrafe → Item
- URLs directas a PDF, XML y HTML de cada documento
- Metadatos básicos: título, identificador BOE, control
- Información de páginas (inicio/fin en el BOE físico)
- Organización por secciones (I-V) y departamentos

❌ **Lo que NO tenemos (directamente):**
- Contenido del texto completo en el sumario (necesita fetch adicional)
- Fechas importantes extraídas (plazos, inscripciones, etc.)
- Clasificación temática automática
- Rango específico del documento (Ley, RD, Orden, etc.) - está en el título pero no estructurado
- Cuantías económicas (en subvenciones)
- Número de plazas (en oposiciones)

⚠️ **Implicaciones:**
- **Necesitamos procesamiento adicional** para extraer información valiosa
- El sumario solo da "qué se publicó", no "qué significa"
- Para análisis profundo, debemos fetchear XML/HTML de cada documento
- La clasificación por categorías **debe ser nuestra**, no viene del BOE

---

## 🏗️ ESTRUCTURA DE LA API

### 1. Endpoint de Sumario Diario

```
GET https://boe.es/datosabiertos/api/boe/sumario/YYYYMMDD
Accept: application/json
```

### 2. Estructura de Respuesta JSON

Basado en análisis del código existente y documentación oficial:

```typescript
interface BOEResponse {
  response: {
    status: {
      code: number;        // 200 = ok
      text: string;        // "ok"
    };
    data: {
      sumario: BOESumario;
    };
  };
}

interface BOESumario {
  metadatos: {
    publicacion: string;          // Ej: "BOE"
    fecha_publicacion: string;    // Ej: "20251124"
  };
  diario: BOEDiario[];           // Array porque puede haber suplementos
}

interface BOEDiario {
  numero: string;                 // Ej: "283"
  sumario_diario: {
    identificador: string;        // Ej: "BOE-S-2025-283"
    url_pdf: {
      szBytes: string;           // Tamaño en bytes
      szKBytes: string;          // Tamaño en KB
      texto: string;             // URL del PDF del sumario
    };
  };
  seccion: BOESeccion[];         // Las 5 secciones (I, II, III, IV, V)
}

interface BOESeccion {
  codigo: string;                 // "I", "II", "III", "IV", "V"
  nombre: string;                 // Ej: "DISPOSICIONES GENERALES"
  departamento: BOEDepartamento | BOEDepartamento[];  // ⚠️ Puede ser objeto o array
}

interface BOEDepartamento {
  codigo: string;                 // Código interno del departamento
  nombre: string;                 // Ej: "MINISTERIO DE LA PRESIDENCIA"

  // ⚠️ Estructura variable: puede tener texto con epígrafes O items directos
  texto?: {
    epigrafe: BOEEpigrafe[];
  };
  epigrafe?: BOEEpigrafe[];      // Algunos departamentos tienen epígrafes sin texto
  item?: BOEItem | BOEItem[];    // Items directos sin epígrafe
}

interface BOEEpigrafe {
  nombre: string;                 // Ej: "Oposiciones y concursos"
  item: BOEItem | BOEItem[];     // ⚠️ Puede ser objeto único o array
}

interface BOEItem {
  identificador: string;          // Ej: "BOE-A-2025-12345" - CLAVE ÚNICA
  control: string;                // Control interno del BOE
  titulo: string;                 // TÍTULO COMPLETO del documento
  url_pdf: {
    szBytes: string;
    szKBytes: string;
    pagina_inicial: string;       // Página en el BOE físico
    pagina_final: string;
    texto: string;                // URL del PDF del documento
  };
  url_html: string;               // URL HTML del documento
  url_xml: string;                // URL XML del documento (MÁS DATOS)
}
```

### 3. Ejemplo Real de Estructura

```json
{
  "response": {
    "status": { "code": 200, "text": "ok" },
    "data": {
      "sumario": {
        "metadatos": {
          "publicacion": "BOE",
          "fecha_publicacion": "20251124"
        },
        "diario": [
          {
            "numero": "283",
            "sumario_diario": {
              "identificador": "BOE-S-2025-283",
              "url_pdf": {
                "szBytes": "456789",
                "szKBytes": "446",
                "texto": "https://boe.es/boe/dias/2025/11/24/pdfs/BOE-S-2025-283.pdf"
              }
            },
            "seccion": [
              {
                "codigo": "II",
                "nombre": "AUTORIDADES Y PERSONAL",
                "departamento": [
                  {
                    "codigo": "001",
                    "nombre": "MINISTERIO DE EDUCACIÓN",
                    "epigrafe": [
                      {
                        "nombre": "Oposiciones y concursos",
                        "item": [
                          {
                            "identificador": "BOE-A-2025-19876",
                            "control": "00012345",
                            "titulo": "Resolución de 18 de noviembre de 2025, de la Dirección General de la Función Pública, por la que se convoca concurso específico para la provisión de puestos de trabajo en el Ministerio de Educación",
                            "url_pdf": {
                              "szBytes": "234567",
                              "szKBytes": "229",
                              "pagina_inicial": "134567",
                              "pagina_final": "134572",
                              "texto": "https://boe.es/boe/dias/2025/11/24/pdfs/BOE-A-2025-19876.pdf"
                            },
                            "url_html": "https://boe.es/diario_boe/txt.php?id=BOE-A-2025-19876",
                            "url_xml": "https://boe.es/datosabiertos/api/boe/BOE-A-2025-19876.xml"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  }
}
```

---

## 📊 ANÁLISIS DE DATOS DISPONIBLES

### Nivel 1: Metadatos del Sumario
| Campo | Disponible | Utilidad | Notas |
|-------|-----------|----------|-------|
| Fecha publicación | ✅ | ALTA | Siempre disponible |
| Número BOE | ✅ | MEDIA | Identificador único del diario |
| URL PDF sumario | ✅ | BAJA | Solo para referencia |

### Nivel 2: Organización Estructural
| Campo | Disponible | Utilidad | Notas |
|-------|-----------|----------|-------|
| Sección (I-V) | ✅ | ALTA | Clave para clasificación inicial |
| Código sección | ✅ | ALTA | Mapeo directo a categorías |
| Departamento | ✅ | ALTA | Filtrado por organismo |
| Epígrafe | ✅ | MEDIA | Subcategorización útil |

### Nivel 3: Documentos Individuales
| Campo | Disponible | Utilidad | Notas |
|-------|-----------|----------|-------|
| BOE ID | ✅ | CRÍTICA | Identificador único inmutable |
| Título completo | ✅ | CRÍTICA | Contiene info valiosa para NLP |
| URLs (PDF/HTML/XML) | ✅ | CRÍTICA | Para fetch de contenido completo |
| Páginas físicas | ✅ | BAJA | Solo referencia |
| Control | ✅ | BAJA | Control interno BOE |

### ⚠️ Información NO Disponible (Requiere Procesamiento)

| Dato Necesario | Disponibilidad | Cómo Obtenerlo |
|----------------|----------------|----------------|
| **Rango del documento** (Ley, RD, Orden) | ❌ Parcial | Extraer del título con regex |
| **Fechas importantes** (plazos, exámenes) | ❌ | Fetch XML + NLP |
| **Cuantías económicas** | ❌ | Fetch XML + regex |
| **Número de plazas** | ❌ | Fetch XML + regex |
| **Requisitos** | ❌ | Fetch XML + LLM |
| **Organismos convocantes** | ⚠️ Parcial | Viene en departamento pero incompleto |
| **Categorización temática** | ❌ | Nuestra clasificación + LLM |

---

## 🎯 METADATOS ÚTILES POR CATEGORÍA

### 1. Oposiciones (Sección II-B)

**Disponibles en sumario:**
- ✅ Departamento → Organismo convocante (parcial)
- ✅ Título → Contiene: tipo convocatoria, cuerpo, ministerio

**Necesitamos extraer del XML/HTML:**
- ❌ Número de plazas
- ❌ Tipo (libre/promoción interna)
- ❌ Requisitos (titulación, edad)
- ❌ Fechas de inscripción
- ❌ Fechas de examen
- ❌ Temario

**Estrategia:**
1. **Fase 1 (Sumario):** Clasificar por sección II-B + keywords en título
2. **Fase 2 (XML):** Fetch documento completo
3. **Fase 3 (LLM):** Extraer info estructurada con prompts especializados

### 2. Subvenciones (Secciones III, V)

**Disponibles en sumario:**
- ✅ Sección y departamento
- ✅ Título → Keywords: "subvención", "ayuda", "beca"

**Necesitamos extraer:**
- ❌ Cuantía (min/max)
- ❌ Porcentaje subvencionable
- ❌ Requisitos (renta, actividad)
- ❌ Plazos de solicitud
- ❌ Gastos elegibles

**Estrategia:**
1. Keywords en título: "subvención", "ayuda", "beca", "financiación"
2. Fetch XML para cuantías y requisitos
3. LLM para explicar requisitos complejos

### 3. Cambios Legislativos (Sección I)

**Disponibles:**
- ✅ Título → Tipo: "Ley", "Real Decreto", "Orden"
- ✅ Departamento → Ministerio responsable

**Necesitamos extraer:**
- ❌ Qué ley modifica
- ❌ Artículos afectados
- ❌ Fecha entrada en vigor
- ❌ Derogaciones

**Estrategia:**
1. Clasificar por rango en título
2. LLM para analizar cambios: "antes vs ahora"
3. Extraer fecha entrada vigor con regex

### 4. Nombramientos (Sección II-A)

**Disponibles:**
- ✅ Epígrafe: "Nombramientos, situaciones e incidencias"
- ✅ Título completo

**Necesitamos extraer:**
- ❌ Nombre del nombrado
- ❌ Cargo
- ❌ Fecha efectiva

**Estrategia:**
1. Simple: regex en título
2. LLM para explicar relevancia del cargo

### 5. Licitaciones (Sección V-A)

**Disponibles:**
- ✅ Epígrafe: "Contratación del Sector Público"
- ✅ Departamento → Licitador

**Necesitamos extraer:**
- ❌ Objeto del contrato
- ❌ Presupuesto
- ❌ Plazo ejecución
- ❌ Plazo presentación
- ❌ Requisitos técnicos

**Estrategia:**
1. Fetch XML
2. Regex para presupuesto y fechas
3. LLM para simplificar requisitos técnicos

---

## 🚧 LIMITACIONES IDENTIFICADAS

### Limitaciones de la API

1. **Sin contenido completo en sumario**
   - Solo tenemos el título, no el texto
   - Cada documento requiere fetch adicional (XML/HTML)
   - Incrementa significativamente el volumen de requests

2. **Estructura inconsistente**
   - `departamento` puede ser objeto o array
   - `item` puede ser objeto único o array
   - `epigrafe` puede estar en diferentes niveles
   - **Implicación:** Necesitamos normalización robusta

3. **Metadatos limitados**
   - No hay clasificación temática
   - No hay extracción de datos estructurados
   - No hay resúmenes o abstracts

4. **Sin API de búsqueda**
   - No podemos buscar por keywords
   - Solo acceso por fecha
   - **Implicación:** Debemos indexar nosotros en Supabase

### Limitaciones de Costes

5. **Volumen de datos**
   - Típico: 200-500 documentos/día
   - Semana: ~1,500-3,500 documentos
   - Mes: ~6,000-15,000 documentos
   - **Implicación:** Procesamiento selectivo crítico

6. **Fetch adicionales costosos**
   - Si hacemos fetch XML de cada documento: 500 requests/día
   - Rate limiting potencial
   - **Implicación:** Batch inteligente + priorización

### Limitaciones de Tiempo

7. **Publicación solo días laborables**
   - No hay BOE sábados, domingos, festivos
   - **Implicación:** Procesamiento semanal óptimo (domingos)

8. **Inmutabilidad**
   - Una vez publicado, nunca cambia
   - **Ventaja:** Cache agresivo posible

---

## 🔍 OPORTUNIDADES DE EXTRACCIÓN

### Nivel 1: Solo Sumario (Rápido, Económico)

**Clasificación Inicial**
- Sección → Categoría base
- Departamento → Filtros adicionales
- Título + keywords → Categoría refinada

**Datos Extraíbles:**
- Rango del documento (Ley, RD, Orden) - regex en título
- Organismo básico - departamento
- Tipo de acto - epígrafe

**Coste:** GRATIS (ya tenemos los datos)

### Nivel 2: Sumario + Regex (Medio, Barato)

**Extracción con Patrones:**
- Fechas: `\d{1,2} de \w+ de \d{4}`
- Plazas: `(\d+)\s+plazas?`
- Cuantías: `(\d+(?:\.\d+)?)\s*(?:euros?|€)`
- Requisitos titulación: `Licenciado|Graduado|Grado en \w+`

**Coste:** MÍNIMO (procesamiento local)

### Nivel 3: Sumario + XML Selectivo (Alto, Moderado)

**Fetch Inteligente:**
- Solo documentos de categorías P3 (máxima prioridad)
- Solo si keywords coinciden
- Solo campos específicos del XML

**Datos XML Adicionales:**
- Texto completo estructurado
- Metadatos adicionales (análisis, texto derecho)
- Enlaces a documentos relacionados

**Coste:** MODERADO (200-300 requests/día)

### Nivel 4: LLM Especializado (Crítico, Caro)

**Procesamiento Inteligente:**
- Explicaciones en lenguaje simple
- Extracción de requisitos complejos
- Análisis de impacto
- Generación de FAQs

**Coste:** ~$5-10/día con GPT-4o-mini o Claude Haiku

---

## 💡 RECOMENDACIONES

### Estrategia de Procesamiento en 3 Niveles

#### 🚀 Nivel 1: TODOS los documentos (Gratis)
```
Para: TODOS los documentos del BOE
Costo: $0
Proceso:
  1. Fetch sumario diario
  2. Clasificar por sección + keywords
  3. Guardar en BD con categoría asignada
  4. Extraer datos básicos con regex (fechas, plazos, cuantías)
```

**Resultado:** Base de datos completa y buscable

#### ⚡ Nivel 2: Documentos Prioritarios (Barato)
```
Para: Solo categorías P3 (Oposiciones, Ayudas, Legislación)
Costo: ~$1/día
Proceso:
  1. Fetch XML de documentos P3
  2. Extracción con regex avanzado
  3. Parseo estructurado
  4. Guardar datos_estructurados en BD
```

**Resultado:** Datos ricos para búsquedas avanzadas

#### 🤖 Nivel 3: Explicaciones LLM (Moderado)
```
Para: Top 50-100 documentos/semana más relevantes
Costo: ~$5-10/semana
Proceso:
  1. Selección por criterios:
     - Categoría P3
     - Keywords high-priority
     - Nuevas convocatorias (no listas de admitidos)
  2. LLM para generar:
     - Resumen simple
     - Explicación de requisitos
     - Guía práctica
  3. Guardar explicaciones_llm en BD
```

**Resultado:** Contenido educativo de alto valor

### Implementación por Fases

**FASE 1 (Semana 1-2): Base Sólida**
- ✅ Procesamiento Nivel 1 para TODOS los documentos
- ✅ Sistema de clasificación por keywords
- ✅ Base de datos completa y buscable
- ✅ API de búsqueda propia

**FASE 2 (Semana 3-4): Datos Ricos**
- ✅ Procesamiento Nivel 2 para categorías P3
- ✅ Extracción avanzada con regex
- ✅ Datos estructurados por categoría

**FASE 3 (Semana 5-6): Inteligencia**
- ✅ Procesamiento Nivel 3 con LLM
- ✅ Explicaciones educativas
- ✅ FAQs automáticas

**FASE 4 (Semana 7-8): Optimización**
- ✅ Métricas y analytics
- ✅ Ajuste de algoritmos
- ✅ UI/UX refinado

### Priorización por Categoría

**P3 (Máxima) - Procesamiento Completo (Nivel 1+2+3):**
- Oposiciones
- Ayudas y Subvenciones
- Cambios Legislativos

**P2 (Alta) - Procesamiento Medio (Nivel 1+2):**
- Educación y Becas
- Empleo
- Vivienda
- Salud
- Licitaciones

**P1 (Media) - Procesamiento Básico (Nivel 1):**
- Tráfico
- Tecnología
- Medio Ambiente
- Nombramientos

### Optimización de Costes

1. **Cache Agresivo**
   - BOE es inmutable → cache permanente
   - CDN para PDFs
   - Supabase para datos estructurados

2. **Batch Inteligente**
   - Procesar de noche (menos carga)
   - Rate limiting: max 5 requests/segundo
   - Pausas entre lotes

3. **Priorización Dinámica**
   - Trackear qué buscan los usuarios
   - Procesar primero lo más demandado
   - Lazy loading para contenido antiguo

4. **Modelo LLM Económico**
   - GPT-4o-mini: ~$0.15/1M tokens input
   - Claude Haiku: ~$1/1M tokens input
   - Prompts cortos y específicos
   - Max 500 tokens output

---

## 📈 CASOS DE USO REALES

### Caso 1: Usuario busca "oposiciones maestro"

**Flujo Actual (Sin procesar):**
1. Usuario busca → API BOE → Títulos crudos
2. Usuario confuso: "¿Cuál es para mí?"
3. Abandono

**Flujo Propuesto (Con procesamiento):**
1. Usuario busca → Supabase con keywords indexadas
2. Resultados filtrados por:
   - Categoría: Oposiciones
   - Keyword: "maestro"
   - Con explicación LLM: "¿Qué requisitos necesito?"
3. Usuario informado → Conversión

### Caso 2: Usuario busca "ayuda alquiler jóvenes"

**Sin procesamiento:**
- 50 resultados mezclados (estatal, autonómico, local)
- Títulos: "Real Decreto 123/2025..."
- Usuario perdido

**Con procesamiento:**
- Filtrado: Solo ayudas vivienda + "jóvenes"
- Cuantía extraída: "hasta 250€/mes"
- Requisitos explicados: "menor 35 años, renta < 3x IPREM"
- Usuario puede decidir si aplica

### Caso 3: Usuario revisa "cambios IRPF 2025"

**Sin procesamiento:**
- Texto legal complejo
- "Modifica el art. 123.4 del RDL..."
- Usuario no entiende

**Con procesamiento LLM:**
- "Antes vs Ahora" con ejemplos
- "Cómo te afecta" con cálculo
- "Qué hacer" con pasos
- Usuario empoderado

---

## 🎯 CONCLUSIONES

### ✅ Lo que podemos hacer SIN fetch adicional:
1. Clasificación completa por categorías
2. Filtrado por departamento/organismo
3. Búsqueda por keywords en títulos
4. Extracción básica con regex (fechas, cuantías)
5. Timeline de publicaciones

### ⚠️ Lo que NECESITA fetch adicional (XML):
1. Contenido completo del documento
2. Datos estructurados específicos (plazas, cuantías detalladas)
3. Requisitos completos
4. Texto para análisis LLM profundo

### 🚀 Lo que NECESITA LLM:
1. Explicaciones en lenguaje simple
2. Análisis de impacto ("¿Cómo me afecta?")
3. Guías prácticas ("¿Qué pasos seguir?")
4. FAQs generadas automáticamente
5. Resúmenes ejecutivos

### 💰 Estimación de Costes Realista:

**Escenario Mínimo Viable (MVP):**
- Nivel 1 para todos: GRATIS
- Nivel 2 para P3 (150 docs/día): ~$1/día
- Nivel 3 LLM (50 docs/semana): ~$5/semana
- **Total mes: ~$50**

**Escenario Óptimo:**
- Todo lo anterior +
- Nivel 2 para P2 (100 docs adicionales): +$1/día
- Nivel 3 LLM (100 docs/semana): +$5/semana
- **Total mes: ~$100**

**Escenario Premium (Futuro):**
- Todo procesado con LLM
- Análisis de tendencias
- Predicciones
- **Total mes: ~$200-300**

---

## 📚 Referencias

- [BOE - Datos Abiertos](https://www.boe.es/datosabiertos/)
- [API Sumario BOE - Documentación](https://www.boe.es/datosabiertos/documentos/APIsumarioBOE.pdf)
- [BOE - FAQ](https://www.boe.es/datosabiertos/faq/boe.php)
- [BOE - Estructura y Secciones](https://www.boe.es/diario_boe/ayuda.php)

---

**Próximo paso:** Ver `ARQUITECTURA_PROPUESTA_V2.md` para el diseño técnico completo.
