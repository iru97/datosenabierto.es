# 🎯 Definición de Features - Información Crítica para el Usuario

## 1. DATOS DISPONIBLES (De la API BOE)

### Campos Base (Metadata API)
```json
{
  "id": "BOE-A-2025-12345",
  "titulo": "Convocatoria...",
  "fecha_publicacion": "2025-11-20",
  "seccion": "III",
  "departamento": "Ministerio de Hacienda",
  "rango": "Resolución",
  "url_pdf": "...",
  "url_xml": "..."
}
```

### Campos Procesados con LLM (Lo que añadiremos)
```json
{
  "datos_estructurados": {
    "tipo_convocatoria": "Oposiciones",
    "num_plazas": 850,
    "requisitos": "Bachiller",
    "organismo": "Ministerio de Hacienda"
  },
  "fechas_importantes": [
    {
      "tipo": "Plazo solicitud",
      "fecha": "2025-12-20",
      "descripcion": "Último día para presentar solicitudes",
      "dias_restantes": 15
    }
  ],
  "keywords": ["oposicion", "administrativo", "estado"],
  "explicaciones": {
    "resumen": "Esta convocatoria ofrece 850 plazas...",
    "que_es": "Una oposición es un proceso...",
    "como_afecta": "Si buscas empleo público...",
    "requisitos": "Necesitas tener Bachiller...",
    "pasos": "1. Presenta solicitud antes del 20 Dic..."
  }
}
```

---

## 2. FEATURES POR PRIORIDAD (De más a menos crítico)

### 🔴 P1: CRÍTICAS - Información que el usuario NECESITA saber YA

#### Feature 1.1: Timeline de Fechas Importantes
**¿Por qué?** Las fechas son lo MÁS crítico (plazos, deadlines)

**Implementación:**
```vue
<TimelineFechas :fechas="documento.fechas_importantes" />
```

**Vista:**
```
📅 Fechas Importantes
┌─────────────────────────────────┐
│ ⏰ URGENTE - 5 DÍAS             │
│ Plazo solicitud: 20 Dic 2025    │
│                                 │
│ 📝 En 30 días                   │
│ Fecha examen: 15 Ene 2026       │
│                                 │
│ 📊 En 60 días                   │
│ Publicación resultados: 15 Feb  │
└─────────────────────────────────┘
```

**Datos necesarios:**
- `fechas_importantes[]` con `tipo`, `fecha`, `dias_restantes`
- Ordenadas por proximidad
- Destacar si < 7 días (URGENTE), < 30 días (PRÓXIMO)

---

#### Feature 1.2: Alertas de Plazos
**¿Por qué?** Usuarios pueden perder oportunidades por no ver fechas a tiempo

**Implementación:**
```vue
<AlertaPlazo
  :dias="diasRestantes"
  :tipo="tipoDocumento"
  @guardar-alerta="crearAlerta"
/>
```

**Vista:**
```
┌─────────────────────────────────┐
│ ⚠️ ATENCIÓN                     │
│ Esta oposición cierra en 5 DÍAS │
│                                 │
│ [🔔 Crear alerta] [📅 Calendario]│
└─────────────────────────────────┘
```

**Datos necesarios:**
- `fechas_importantes[0].dias_restantes`
- `tipo_documento`

---

#### Feature 1.3: Resumen en 3 Líneas
**¿Por qué?** Usuario necesita entender EN 5 SEGUNDOS si le interesa

**Implementación:**
```vue
<ResumenRapido :documento="doc" />
```

**Vista:**
```
📝 En Resumen:
• 850 plazas de Administrativo Estado
• Requisito: Bachiller
• Plazo: hasta 20 Diciembre (15 días)
```

**Datos necesarios:**
- `datos_estructurados.num_plazas` o datos clave
- `datos_estructurados.requisitos`
- `fechas_importantes[0]` (la más próxima)

---

### 🟡 P2: IMPORTANTES - Información que facilita decisiones

#### Feature 2.1: Filtro Inteligente "¿Te interesa?"
**¿Por qué?** Reducir ruido, mostrar solo lo relevante

**Implementación:**
```vue
<FiltroInteligente
  @filtrar="aplicarFiltros"
  :opciones="opcionesFiltro"
/>
```

**Vista:**
```
🔍 Muéstrame solo:
┌─────────────────────────────────┐
│ [✓] Con plazo < 30 días         │
│ [ ] Solo mi provincia           │
│ [✓] Que NO requiera título      │
│ [ ] Solo ayudas económicas      │
└─────────────────────────────────┘

Mostrando 12 de 150 documentos
```

**Datos necesarios:**
- `fechas_importantes[]` para filtrar por plazo
- `datos_estructurados.provincia` si aplica
- `datos_estructurados.requisitos`
- `datos_estructurados.tipo`

---

#### Feature 2.2: Comparador de Oposiciones/Ayudas
**¿Por qué?** Usuario necesita decidir entre varias opciones

**Implementación:**
```vue
<Comparador :documentos="seleccionados" />
```

**Vista:**
```
Comparar 3 oposiciones seleccionadas:
┌─────────────┬─────────────┬─────────────┐
│ Admin Estado│ Maestro     │ Policía     │
├─────────────┼─────────────┼─────────────┤
│ 850 plazas  │ 200 plazas  │ 1500 plazas │
│ Bachiller   │ Grado       │ ESO         │
│ 15 días     │ 30 días     │ 45 días     │
│ [Ver más]   │ [Ver más]   │ [Ver más]   │
└─────────────┴─────────────┴─────────────┘
```

**Datos necesarios:**
- `datos_estructurados` comparables
- `fechas_importantes[0]`

---

#### Feature 2.3: "Documentos Relacionados"
**¿Por qué?** Un BOE puede tener continuación (lista admitidos → fecha examen → resultados)

**Implementación:**
```vue
<DocumentosRelacionados :boeId="documento.id" />
```

**Vista:**
```
📎 Documentos relacionados:
┌─────────────────────────────────┐
│ ✓ Convocatoria (20 Nov)         │
│ → Lista admitidos (5 Dic) NUEVO │
│ → Fecha examen (pendiente)      │
│ → Resultados (pendiente)        │
└─────────────────────────────────┘
```

**Datos necesarios:**
- `keywords` similares
- Mismo `departamento`
- `datos_estructurados.convocatoria_id` si aplica

---

### 🟢 P3: ÚTILES - Información que mejora experiencia

#### Feature 3.1: "Trending Esta Semana"
**¿Por qué?** Usuario quiere saber qué es importante AHORA

**Implementación:**
```vue
<TrendingDocumentos :categoria="categoria" />
```

**Vista:**
```
🔥 Más visto esta semana en Oposiciones:
┌─────────────────────────────────┐
│ 1. Administrativo Estado (850)  │
│    ⏰ 5 días │ 👁️ 1,234 visitas │
│                                 │
│ 2. Maestro Primaria (200)       │
│    ⏰ 15 días │ 👁️ 856 visitas  │
└─────────────────────────────────┘
```

**Datos necesarios:**
- Contador de visitas (nuevo campo)
- `fecha_publicacion` reciente
- `fechas_importantes` próximas

---

#### Feature 3.2: Mapa de España (si aplica)
**¿Por qué?** Algunas oposiciones/ayudas son por provincia

**Implementación:**
```vue
<MapaEspana :documentos="filtrados" />
```

**Vista:**
```
📍 Oposiciones por provincia:
[Mapa de España con pins]
Madrid: 5 convocatorias
Barcelona: 3 convocatorias
Valencia: 2 convocatorias
```

**Datos necesarios:**
- `datos_estructurados.provincia` o `ambito_geografico`

---

## 3. HOMEPAGE - Definición Específica

### Objetivo
**Guiar al usuario a lo que necesita EN 5 SEGUNDOS**

### Estructura

```
┌─────────────────────────────────────────────┐
│ HERO: "El BOE, Explicado para Todos"       │
│ → Búsqueda rápida                          │
│ → [Categorías] [Por fecha] [Trending]     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ⚠️ URGENTE - Plazos que cierran esta semana│
├─────────────────────────────────────────────┤
│ [Card] Oposición Admin - 3 DÍAS            │
│ [Card] Ayuda alquiler - 5 DÍAS             │
│ [Card] Beca estudios - 7 DÍAS              │
│                                            │
│ [Ver todas las urgencias →]                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🆕 Nuevo esta semana                       │
├─────────────────────────────────────────────┤
│ Pestañas: [Oposiciones] [Ayudas] [Todo]   │
│                                            │
│ [Card] 850 plazas Administrativo           │
│ [Card] Subvención empresas                 │
│ [Card] Nueva ley tráfico                   │
│                                            │
│ [Explorar por categoría →]                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 📊 Resumen de la semana                    │
├─────────────────────────────────────────────┤
│ Esta semana se han publicado:              │
│ • 15 oposiciones (850 plazas totales)      │
│ • 8 subvenciones y ayudas                  │
│ • 12 cambios legislativos                  │
│                                            │
│ [Ver análisis completo →]                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🔍 Explora por categoría                   │
├─────────────────────────────────────────────┤
│ [Grid de 12 categorías con stats]          │
└─────────────────────────────────────────────┘
```

### Datos necesarios para la Home

```typescript
interface HomePage {
  urgentes: Documento[] // fechas_importantes < 7 días
  nuevos: {
    oposiciones: Documento[] // esta semana
    ayudas: Documento[]
    todos: Documento[]
  }
  resumenSemanal: {
    total_oposiciones: number
    total_plazas: number
    total_ayudas: number
    total_legislacion: number
  }
  categorias: Categoria[] // con count de docs esta semana
}
```

---

## 4. VISTAS ESPECÍFICAS

### Vista: Categoría (ej: /categorias/oposiciones)

**Secciones:**

1. **Header con stats reales**
```
Esta semana: 15 oposiciones | 850 plazas totales | 3 cierran <7 días
```

2. **Sección educativa** (ya implementada)
```
¿Qué encontrarás? ¿Para quién? Consejos
```

3. **Filtros útiles**
```
[Con plazo <30 días] [Por requisito] [Por organismo]
```

4. **Documentos ordenados**
```
1. URGENTES (< 7 días)
2. PRÓXIMOS (7-30 días)
3. NORMALES (> 30 días)
```

### Vista: Documento Individual (ej: /documento/BOE-A-2025-12345)

**Tabs (Modal o Página):**

```
┌─────────────────────────────────┐
│ [Resumen] [Fechas] [Requisitos] [Pasos] │
└─────────────────────────────────┘

TAB 1: Resumen
• ¿Qué es? (3 líneas)
• ¿Cómo me afecta? (párrafo)
• Info clave (bullets)

TAB 2: Fechas (Timeline visual)
• Plazo solicitud
• Fecha examen
• Resultados
[Agregar a calendario] [Crear alerta]

TAB 3: Requisitos
• Título necesario
• Edad
• Documentación
• Tasas
[Checklist: ¿Cumples?]

TAB 4: Pasos a seguir
1. Presenta solicitud (enlace)
2. Espera lista admitidos
3. Prepara examen
4. Consulta resultados
[Guía completa →]
```

### Vista: Búsqueda por Fecha (ej: /buscar?fecha=2025-11-20)

**NO mostrar:**
❌ Lista cruda de BOE

**SÍ mostrar:**
```
📅 20 Noviembre 2025 - 45 documentos publicados

✨ Lo más importante de hoy:
┌─────────────────────────────────┐
│ 🔥 3 con plazos próximos        │
│ 🆕 5 convocatorias nuevas       │
│ ⚖️ 2 leyes importantes          │
└─────────────────────────────────┘

Por categoría:
📝 Oposiciones (8) → [Ver]
💰 Ayudas (5) → [Ver]
⚖️ Legislación (12) → [Ver]
...
```

---

## 5. PRIORIZACIÓN DE IMPLEMENTACIÓN

### Sprint 1 (Ahora)
- ✅ Navegación básica
- ✅ Sección educativa categoría
- ⏳ Timeline de fechas importantes
- ⏳ Resumen en 3 líneas
- ⏳ Homepage rediseñada

### Sprint 2
- Modal con 4 tabs
- Filtros inteligentes
- Alertas de plazos
- Búsqueda por fecha mejorada

### Sprint 3
- Trending esta semana
- Documentos relacionados
- Comparador
- Mapa (si aplica)

---

## 6. MÉTRICAS DE ÉXITO

**Usuario encuentra lo que necesita en < 30 segundos:**
- Ve fechas críticas inmediatamente
- Entiende si le afecta con el resumen
- Puede actuar (solicitar, guardar fecha)

**Indicadores:**
- Clicks en "Ver más" > 40%
- Tiempo en página > 2 min
- Guardado de fechas/alertas > 20%
- Clicks en PDF BOE oficial > 60%

---

## 7. NEXT STEPS

1. Implementar Timeline de Fechas (crítico)
2. Rediseñar Homepage con datos reales
3. Crear Modal con 4 tabs
4. Añadir filtros inteligentes

¿Por dónde empezamos?
