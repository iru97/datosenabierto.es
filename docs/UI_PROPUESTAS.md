# Propuestas UI/UX para datosenabierto.es
## Diseño Centrado en el Usuario con Inteligencia Real

**Fecha:** 24 de Noviembre, 2025
**Versión:** 1.0
**Filosofía:** "Si no ayuda al usuario a tomar una decisión o acción, no lo mostramos"

---

## 📋 TABLA DE CONTENIDOS

1. [Principios de Diseño](#principios-de-diseño)
2. [Página de Categoría Individual](#página-de-categoría-individual)
3. [Modal de Documento Detallado](#modal-de-documento-detallado)
4. [Búsqueda Global](#búsqueda-global)
5. [Componentes Reutilizables](#componentes-reutilizables)
6. [Flujos de Usuario](#flujos-de-usuario)
7. [Mejoras de Accesibilidad](#mejoras-de-accesibilidad)

---

## 🎨 PRINCIPIOS DE DISEÑO

### 1. Claridad Sobre Belleza

```
❌ MALO: Animaciones complejas, gradientes everywhere
✅ BUENO: Información clara, jerarquía visual obvia
```

**Aplicación:**
- Tipografía grande y legible (mínimo 16px)
- Contraste suficiente (WCAG AA mínimo)
- Espaciado generoso entre elementos
- Íconos solo cuando ayuden a entender

---

### 2. Acción Sobre Información

```
❌ MALO: "Real Decreto 123/2025..."
✅ BUENO: "Puedes inscribirte hasta el 15 de diciembre →"
```

**Aplicación:**
- Botones de acción claros
- CTAs específicos ("Ver cómo inscribirme" vs "Más info")
- Fechas límite destacadas
- Pasos siguientes obvios

---

### 3. Contexto Antes de Detalle

```
❌ MALO: Mostrar 50 campos de datos
✅ BUENO: Mostrar resumen + expandir si interesa
```

**Aplicación:**
- Progressive disclosure
- Resúmenes ejecutivos primero
- Detalles bajo demanda
- No abrumar con información

---

### 4. Lenguaje Humano

```
❌ MALO: "Convocatoria proceso selectivo ingreso"
✅ BUENO: "Oposiciones de Administrativo"
```

**Aplicación:**
- Títulos simplificados
- Explicaciones en sidebar
- Glosario de términos técnicos
- Ejemplos concretos

---

### 5. Mobile-First

```
□ 70% de usuarios en móvil
□ Touch targets mínimo 44px
□ Scroll infinito mejor que paginación
□ Bottom navigation para acciones frecuentes
```

---

## 📱 PÁGINA DE CATEGORÍA INDIVIDUAL

**Ruta:** `/categorias/[slug]`
**Ejemplo:** `/categorias/oposiciones`

### Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Volver a Categorías               [🔍 Buscar]    [⚙️ Filtros]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [HERO - Color de categoría]                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  📝 Oposiciones y Concursos                                   │ │
│  │  Convocatorias de oposiciones públicas explicadas claramente  │ │
│  │                                                               │ │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │ │
│  │  │  125   │  │   45   │  │  Hoy   │  │  100%  │            │ │
│  │  │  docs  │  │ Nuevos │  │ Última │  │ Gratis │            │ │
│  │  │ semana │  │  P3    │  │ Actual │  │        │            │ │
│  │  └────────┘  └────────┘  └────────┘  └────────┘            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [RESUMEN SEMANAL - Card destacado con gradiente sutil]            │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  📊 Resumen de la Semana (18-22 Nov 2025)                     │ │
│  │                                                               │ │
│  │  Esta semana se han convocado 850 plazas nuevas, destacando  │ │
│  │  las de Administrativo del Estado (850 plazas) y Maestro de  │ │
│  │  Educación Primaria (200 plazas). El plazo de inscripción    │ │
│  │  para la mayoría finaliza en diciembre.                      │ │
│  │                                                               │ │
│  │  📈 Tendencias:                                               │ │
│  │  • 25% más convocatorias que la semana pasada                │ │
│  │  • Sector educación muy activo este mes                      │ │
│  │  • Muchas convocatorias con plazo corto (<30 días)           │ │
│  │                                                               │ │
│  │  💡 Lo más importante:                                        │ │
│  │  Si buscas empleo público en educación, esta es una buena    │ │
│  │  semana para revisar. Hay varias convocatorias con requisitos│ │
│  │  accesibles.                                                  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [FILTROS RÁPIDOS - Pills]                                          │
│  [ Todas ] [ Con plazo <30 días ] [ Nuevas esta semana ] [+Filtros]│
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [LISTA DE DOCUMENTOS - Cards]                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ [NUEVO] 📝                                     20 Nov 2025    │ │
│  │                                                               │ │
│  │ Oposiciones de Administrativo del Estado - 850 plazas        │ │
│  │                                                               │ │
│  │ Ministerio de Presidencia                                    │ │
│  │                                                               │ │
│  │ Resumen: El Estado convoca 850 plazas de Administrativo      │ │
│  │ para ingreso libre. Requisito: Bachiller o equivalente...    │ │
│  │                                                               │ │
│  │ ⏰ Plazo: hasta 20 Dic 2025 (30 días)                        │ │
│  │ 👥 850 plazas | 📚 Bachiller | 🔓 Acceso libre              │ │
│  │                                                               │ │
│  │ [ Ver detalles → ]                                           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 📝                                            18 Nov 2025    │ │
│  │                                                               │ │
│  │ Maestro Educación Primaria - 200 plazas                      │ │
│  │                                                               │ │
│  │ Ministerio de Educación                                      │ │
│  │                                                               │ │
│  │ Resumen: Convocatoria de 200 plazas de Maestro en varias    │ │
│  │ comunidades autónomas. Requisito: Grado en Ed. Primaria...  │ │
│  │                                                               │ │
│  │ ⏰ Plazo: hasta 15 Dic 2025 (25 días)                        │ │
│  │ 👥 200 plazas | 📚 Grado | 🔓 Acceso libre                  │ │
│  │                                                               │ │
│  │ [ Ver detalles → ]                                           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  [Cargar más...]                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Wireframe Mobile

```
┌─────────────────────────┐
│ ← 📝 Oposiciones   🔍   │
├─────────────────────────┤
│                         │
│  125 docs | 45 P3      │
│  Última: Hoy           │
│                         │
├─────────────────────────┤
│ 📊 Resumen Semana       │
│ ─────────────────────   │
│ Esta semana 850        │
│ plazas nuevas,         │
│ destacando             │
│ Administrativo...      │
│                         │
│ [Ver completo ▼]       │
├─────────────────────────┤
│                         │
│ 🗓️ [<30 días] [Nuevas] │
│                         │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ [NUEVO]             │ │
│ │ Administrativo      │ │
│ │ Estado - 850 plazas │ │
│ │                     │ │
│ │ ⏰ hasta 20 Dic     │ │
│ │ 📚 Bachiller        │ │
│ │                     │ │
│ │ [Ver más →]         │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Maestro Primaria    │ │
│ │ 200 plazas          │ │
│ │                     │ │
│ │ ⏰ hasta 15 Dic     │ │
│ │ 📚 Grado            │ │
│ │                     │ │
│ │ [Ver más →]         │ │
│ └─────────────────────┘ │
│                         │
│ [Cargar más...]        │
│                         │
└─────────────────────────┘
```

### Componentes Clave

#### 1. Hero Section

```vue
<template>
  <div class="hero" :style="{ backgroundColor: categoria.color }">
    <div class="container">
      <button @click="$router.back()" class="back-button">
        ← Volver a Categorías
      </button>

      <div class="hero-content">
        <div class="hero-icon">{{ categoria.icono }}</div>
        <div>
          <h1>{{ categoria.nombre }}</h1>
          <p class="description">{{ categoria.descripcion }}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ totalDocumentos }}</div>
          <div class="stat-label">Docs esta semana</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ documentosImportantes }}</div>
          <div class="stat-label">Destacados (P3)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ ultimaActualizacion }}</div>
          <div class="stat-label">Última actualización</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">✅</div>
          <div class="stat-label">100% Gratis</div>
        </div>
      </div>
    </div>
  </div>
</template>
```

#### 2. Resumen Semanal Card

```vue
<template>
  <div class="resumen-semanal-card">
    <div class="card-header">
      <h2>📊 Resumen de la Semana</h2>
      <span class="fecha-rango">{{ semana.inicio }} - {{ semana.fin }}</span>
    </div>

    <div class="card-body">
      <!-- Resumen principal -->
      <div class="resumen-text" v-html="estadistica.resumen_semanal"></div>

      <!-- Tendencias -->
      <div class="tendencias" v-if="estadistica.tendencias">
        <h3>📈 Tendencias</h3>
        <ul>
          <li v-for="tendencia in parseTendencias(estadistica.tendencias)">
            {{ tendencia }}
          </li>
        </ul>
      </div>

      <!-- Insights -->
      <div class="insights" v-if="estadistica.insights">
        <h3>💡 Lo más importante</h3>
        <p>{{ estadistica.insights }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resumen-semanal-card {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-left: 4px solid var(--categoria-color);
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
}

.resumen-text {
  font-size: 17px;
  line-height: 1.7;
  color: #374151;
  margin-bottom: 20px;
}

.tendencias ul {
  list-style: none;
  padding: 0;
}

.tendencias li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
}

.tendencias li::before {
  content: "•";
  position: absolute;
  left: 8px;
  color: var(--categoria-color);
  font-weight: bold;
}
</style>
```

#### 3. Documento Card

```vue
<template>
  <div class="documento-card" @click="abrirModal">
    <!-- Badge si es nuevo -->
    <div class="badges">
      <span v-if="esNuevo" class="badge badge-nuevo">NUEVO</span>
      <span v-if="esUrgente" class="badge badge-urgente">⏰ Plazo corto</span>
    </div>

    <!-- Fecha publicación -->
    <div class="fecha">{{ formatDate(documento.fecha_publicacion) }}</div>

    <!-- Título -->
    <h3 class="titulo">{{ documento.titulo_simplificado || documento.titulo }}</h3>

    <!-- Organismo -->
    <div class="organismo">{{ documento.departamento }}</div>

    <!-- Resumen LLM (si existe) -->
    <p class="resumen" v-if="explicacionResumen">
      {{ explicacionResumen }}
    </p>

    <!-- Metadata importante -->
    <div class="metadata">
      <div class="meta-item" v-if="plazoInscripcion">
        <span class="meta-icon">⏰</span>
        <span>Plazo: hasta {{ formatDate(plazoInscripcion) }} ({{ diasRestantes }} días)</span>
      </div>

      <div class="meta-item" v-if="numPlazas">
        <span class="meta-icon">👥</span>
        <span>{{ numPlazas }} plazas</span>
      </div>

      <div class="meta-item" v-if="requisitoPrincipal">
        <span class="meta-icon">📚</span>
        <span>{{ requisitoPrincipal }}</span>
      </div>

      <div class="meta-item" v-if="tipoAcceso">
        <span class="meta-icon">🔓</span>
        <span>{{ tipoAcceso }}</span>
      </div>
    </div>

    <!-- CTA -->
    <button class="btn-ver-detalles">
      Ver detalles →
    </button>
  </div>
</template>

<style scoped>
.documento-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.documento-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.badges {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-nuevo {
  background: #10b981;
  color: white;
}

.badge-urgente {
  background: #f59e0b;
  color: white;
}

.titulo {
  font-size: 20px;
  font-weight: 600;
  margin: 12px 0;
  color: #111827;
  line-height: 1.4;
}

.resumen {
  color: #6b7280;
  line-height: 1.6;
  margin: 12px 0;
}

.metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.meta-icon {
  font-size: 16px;
}

.btn-ver-detalles {
  margin-top: 12px;
  padding: 10px 20px;
  background: var(--categoria-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-ver-detalles:hover {
  opacity: 0.9;
}
</style>
```

---

## 🔍 MODAL DE DOCUMENTO DETALLADO

**Trigger:** Click en card de documento
**Componente:** `DocumentoDetailModal.vue`

### Wireframe Desktop

```
┌───────────────────────────────────────────────────────────────────────┐
│                                                           [X Cerrar]   │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │                         MODAL - Full Screen                       │ │
│ │                                                                   │ │
│ │ ┌─────────────────────────────────────────┬───────────────────┐  │ │
│ │ │                                         │   SIDEBAR         │  │ │
│ │ │  [Resumen] [Requisitos] [Pasos] [BOE]  │                   │  │ │
│ │ │  ─────────                              │  📅 Fechas        │  │ │
│ │ │                                         │  Importantes      │  │ │
│ │ │  [TAB ACTIVO: RESUMEN]                  │                   │  │ │
│ │ │                                         │  Inscripción:     │  │ │
│ │ │  📝 Oposiciones Administrativo          │  20 Nov - 20 Dic  │  │ │
│ │ │  Ministerio de Presidencia              │                   │  │ │
│ │ │  Publicado: 20 Nov 2025                 │  Examen previsto: │  │ │
│ │ │                                         │  Marzo 2026       │  │ │
│ │ │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │                   │  │ │
│ │ │                                         │  ━━━━━━━━━━━━━━━  │  │ │
│ │ │  ¿Qué es esta oposición?                │                   │  │ │
│ │ │                                         │  💾 Datos Clave   │  │ │
│ │ │  El Ministerio de Presidencia convoca  │                   │  │ │
│ │ │  850 plazas de Administrativo del       │  850 plazas       │  │ │
│ │ │  Estado. Es un puesto estable en el     │  Acceso libre     │  │ │
│ │ │  funcionariado con funciones de gestión │  Bachiller        │  │ │
│ │ │  administrativa y atención al público.  │  Oposición        │  │ │
│ │ │                                         │                   │  │ │
│ │ │  Los administrativos trabajan en        │  ━━━━━━━━━━━━━━━  │  │ │
│ │ │  ministerios, organismos públicos y     │                   │  │ │
│ │ │  delegaciones del Estado.               │  🔗 Enlaces       │  │ │
│ │ │                                         │                   │  │ │
│ │ │  ¿Quién puede presentarse?              │  [📄 Ver BOE]     │  │ │
│ │ │                                         │  [📝 Bases]       │  │ │
│ │ │  Cualquier persona que cumpla:          │  [💻 Inscripción] │  │ │
│ │ │  • Tener Bachiller (o FP Grado Medio)   │                   │  │ │
│ │ │  • Ser español o de la UE               │  ━━━━━━━━━━━━━━━  │  │ │
│ │ │  • Tener entre 16 y 65 años             │                   │  │ │
│ │ │                                         │  💬 Ayuda         │  │ │
│ │ │  Características destacadas:            │                   │  │ │
│ │ │  • Sueldo inicial: ~1,400€/mes          │  ¿No lo entiendes?│  │ │
│ │ │  • Estabilidad: Funcionario de carrera  │  Pregúntanos      │  │ │
│ │ │  • Jornada: 37.5h semanales             │                   │  │ │
│ │ │  • Formación continua                   │  [💬 Contacto]    │  │ │
│ │ │                                         │                   │  │ │
│ │ │  [Siguiente: Ver requisitos →]          │                   │  │ │
│ │ │                                         │                   │  │ │
│ │ └─────────────────────────────────────────┴───────────────────┘  │ │
│ │                                                                   │ │
│ └───────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
```

### Estructura de Tabs

#### Tab 1: Resumen
```
✅ Qué es esta convocatoria (explicación LLM)
✅ Quién puede presentarse (requisitos alto nivel)
✅ Características del puesto (sueldo, estabilidad)
✅ Qué hace un [puesto] (día a día)
✅ Puntos clave destacados
```

#### Tab 2: Requisitos
```
📋 Lista de requisitos oficiales
✅ Cada requisito con:
   • Texto oficial
   • Explicación simple
   • Cómo demostrarlo (documentos)
   • Alternativas válidas

❓ Preguntas frecuentes sobre requisitos
```

#### Tab 3: Cómo Actuar / Pasos
```
📝 Guía paso a paso para inscribirte

1️⃣ Reúne documentos
   [Lista específica con links]

2️⃣ Accede a la sede electrónica
   [URL + requisitos técnicos]

3️⃣ Rellena formulario
   [Consejos y avisos]

4️⃣ Paga tasa
   [Cuantía + formas de pago]

5️⃣ Envía solicitud
   [Confirmación + qué hacer después]

💡 Consejos adicionales
📚 Cómo preparar el examen (si aplica)
```

#### Tab 4: Documento Original BOE
```
🔗 Enlaces oficiales
   • Ver PDF en BOE
   • Ver HTML en BOE
   • Descargar XML

⚠️ Este es el documento legal oficial
   Las explicaciones anteriores son para ayudarte
   a entenderlo, pero lo oficial es lo que dice aquí.
```

### Sidebar Componentes

#### Fechas Importantes (Siempre Visible)

```vue
<template>
  <div class="fechas-importantes">
    <h3>📅 Fechas Importantes</h3>

    <div class="fecha-item fecha-destacada" v-if="plazoInscripcion">
      <div class="fecha-label">Plazo de inscripción</div>
      <div class="fecha-valor">
        {{ formatDateRange(inicioInscripcion, plazoInscripcion) }}
      </div>
      <div class="fecha-countdown" v-if="diasRestantes > 0">
        ⏰ Quedan {{ diasRestantes }} días
      </div>
    </div>

    <div class="fecha-item" v-if="fechaExamen">
      <div class="fecha-label">Examen previsto</div>
      <div class="fecha-valor">{{ formatDate(fechaExamen) }}</div>
    </div>

    <div class="fecha-item" v-if="resolucionPrevista">
      <div class="fecha-label">Resolución prevista</div>
      <div class="fecha-valor">{{ formatDate(resolucionPrevista) }}</div>
    </div>
  </div>
</template>

<style scoped>
.fecha-destacada {
  background: linear-gradient(135deg, #f59e0b15, #ef444415);
  border-left: 4px solid #f59e0b;
  padding: 12px;
  border-radius: 8px;
}

.fecha-countdown {
  font-weight: 600;
  color: #f59e0b;
  margin-top: 4px;
}
</style>
```

#### Datos Clave (Metadata)

```vue
<template>
  <div class="datos-clave">
    <h3>💾 Datos Clave</h3>

    <div class="dato-grid">
      <div class="dato-item" v-if="numPlazas">
        <span class="dato-label">Plazas</span>
        <span class="dato-valor">{{ numPlazas }}</span>
      </div>

      <div class="dato-item" v-if="tipoAcceso">
        <span class="dato-label">Tipo</span>
        <span class="dato-valor">{{ tipoAcceso }}</span>
      </div>

      <div class="dato-item" v-if="requisitoPrincipal">
        <span class="dato-label">Requisito</span>
        <span class="dato-valor">{{ requisitoPrincipal }}</span>
      </div>

      <div class="dato-item" v-if="modalidad">
        <span class="dato-label">Modalidad</span>
        <span class="dato-valor">{{ modalidad }}</span>
      </div>
    </div>
  </div>
</template>
```

---

## 🔍 BÚSQUEDA GLOBAL

**Ruta:** `/buscar`
**Acceso:** Navbar + Atajo teclado (Ctrl+K)

### Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] datosenabierto.es             [🔍 Buscar] [⚙️]   [👤]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🔍  Buscar en el BOE...                           [Enter]  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [ Oposiciones ] [ Ayudas ] [ Legislación ] ... [Todos]            │
│                                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                     │
│  ┌─────────────┐  ┌────────────────────────────────────────────┐  │
│  │ FILTROS     │  │  RESULTADOS (245 encontrados)              │  │
│  │             │  │                                            │  │
│  │ Categoría   │  │  ┌──────────────────────────────────────┐ │  │
│  │ ☑ Oposicion │  │  │ [NUEVO] Administrativo - 850 plazas │ │  │
│  │ ☑ Ayudas    │  │  │ Ministerio Presidencia              │ │  │
│  │ ☐ Legisla.. │  │  │                                      │ │  │
│  │             │  │  │ Convoca 850 plazas de Administra... │ │  │
│  │ Fecha       │  │  │                                      │ │  │
│  │ ○ Última    │  │  │ ⏰ hasta 20 Dic | 📚 Bachiller     │ │  │
│  │   semana    │  │  │ [Ver →]                             │ │  │
│  │ ◉ Último mes│  │  └──────────────────────────────────────┘ │  │
│  │ ○ Último año│  │                                            │  │
│  │ ○ Rango     │  │  ┌──────────────────────────────────────┐ │  │
│  │             │  │  │ Ayuda digitalización PYMES          │ │  │
│  │ Plazas      │  │  │ Ministerio Industria                │ │  │
│  │ [ ] > 100   │  │  │                                      │ │  │
│  │ [ ] > 500   │  │  │ Subvención de hasta 12,000€ para... │ │  │
│  │             │  │  │                                      │ │  │
│  │ Estado      │  │  │ 💰 hasta 12,000€ | 📝 PYME         │ │  │
│  │ [ ] Con exp │  │  │ [Ver →]                             │ │  │
│  │ [ ] Urgente │  │  └──────────────────────────────────────┘ │  │
│  │             │  │                                            │  │
│  │ [Limpiar]   │  │  [Página 1 de 13] [Siguiente →]           │  │
│  │             │  │                                            │  │
│  └─────────────┘  └────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Features Especiales

#### 1. Búsqueda Instantánea

```vue
<template>
  <div class="search-bar">
    <input
      v-model="query"
      @input="onSearch"
      placeholder="Buscar: oposiciones maestro, ayuda alquiler, ley vivienda..."
      class="search-input"
    />

    <!-- Autocomplete Dropdown -->
    <div v-if="sugerencias.length > 0" class="autocomplete">
      <div
        v-for="sugerencia in sugerencias"
        :key="sugerencia.id"
        class="sugerencia-item"
        @click="aplicarSugerencia(sugerencia)"
      >
        <span class="sugerencia-icon">{{ sugerencia.icono }}</span>
        <span class="sugerencia-text">{{ sugerencia.texto }}</span>
        <span class="sugerencia-categoria">{{ sugerencia.categoria }}</span>
      </div>
    </div>

    <!-- Búsquedas recientes -->
    <div v-if="query === '' && busquedasRecientes.length > 0" class="recientes">
      <div class="recientes-header">Búsquedas recientes</div>
      <div
        v-for="busqueda in busquedasRecientes"
        class="busqueda-reciente"
        @click="query = busqueda"
      >
        <span class="icon">🕐</span>
        {{ busqueda }}
      </div>
    </div>
  </div>
</template>

<script setup>
const query = ref('')
const sugerencias = ref([])
const busquedasRecientes = ref([])

const onSearch = useDebounceFn(async () => {
  if (query.value.length < 3) {
    sugerencias.value = []
    return
  }

  // Buscar en tiempo real
  const results = await searchDocumentos(query.value)
  sugerencias.value = results.slice(0, 5)
}, 300)
</script>
```

#### 2. Filtros Inteligentes

```vue
<template>
  <div class="filtros-panel">
    <h3>Filtros</h3>

    <!-- Categorías -->
    <div class="filtro-group">
      <h4>Categoría</h4>
      <label v-for="cat in categorias" :key="cat.id">
        <input
          type="checkbox"
          v-model="filtros.categorias"
          :value="cat.id"
        />
        {{ cat.nombre }}
        <span class="count">({{ cat.count }})</span>
      </label>
    </div>

    <!-- Fecha -->
    <div class="filtro-group">
      <h4>Fecha</h4>
      <label>
        <input type="radio" v-model="filtros.periodo" value="week" />
        Última semana
      </label>
      <label>
        <input type="radio" v-model="filtros.periodo" value="month" />
        Último mes
      </label>
      <label>
        <input type="radio" v-model="filtros.periodo" value="year" />
        Último año
      </label>
      <label>
        <input type="radio" v-model="filtros.periodo" value="custom" />
        Rango personalizado
      </label>

      <div v-if="filtros.periodo === 'custom'" class="date-range">
        <input type="date" v-model="filtros.desde" />
        <span>hasta</span>
        <input type="date" v-model="filtros.hasta" />
      </div>
    </div>

    <!-- Filtros específicos (dinámicos según categoría) -->
    <div v-if="categoriaSeleccionada === 'oposiciones'" class="filtro-group">
      <h4>Plazas</h4>
      <label>
        <input type="checkbox" v-model="filtros.plazas_min" value="100" />
        Más de 100 plazas
      </label>
      <label>
        <input type="checkbox" v-model="filtros.plazas_min" value="500" />
        Más de 500 plazas
      </label>
    </div>

    <div v-if="categoriaSeleccionada === 'ayudas'" class="filtro-group">
      <h4>Cuantía</h4>
      <input
        type="range"
        v-model="filtros.cuantia_min"
        min="0"
        max="50000"
        step="1000"
      />
      <div class="range-value">
        Mínimo: {{ formatCurrency(filtros.cuantia_min) }}
      </div>
    </div>

    <!-- Estado -->
    <div class="filtro-group">
      <h4>Estado</h4>
      <label>
        <input type="checkbox" v-model="filtros.con_explicacion" />
        Con explicación
      </label>
      <label>
        <input type="checkbox" v-model="filtros.urgente" />
        Plazo urgente (<15 días)
      </label>
      <label>
        <input type="checkbox" v-model="filtros.nuevo" />
        Publicado esta semana
      </label>
    </div>

    <button @click="limpiarFiltros" class="btn-limpiar">
      Limpiar filtros
    </button>
  </div>
</template>
```

---

## 🧩 COMPONENTES REUTILIZABLES

### 1. TimelineDePublicaciones

Muestra una línea de tiempo de cuándo se han publicado documentos.

```
┌────────────────────────────────────────────────┐
│  Timeline de Publicaciones - Noviembre 2025   │
│                                                │
│  Lun  Mar  Mié  Jue  Vie  Sáb  Dom           │
│  ───────────────────────────────────────────   │
│   18   19   20   21   22   23   24           │
│   ██   ███  ████  ██   ███  --   --          │
│   25   30   45    28   35    0    0           │
│                                                │
│  Más actividad: Miércoles                     │
│  Total esta semana: 163 documentos            │
└────────────────────────────────────────────────┘
```

### 2. ComparativaAnterior

Muestra comparativa con semana/mes anterior.

```
┌────────────────────────────────────┐
│  Esta semana vs Anterior           │
│                                    │
│  📊 163 documentos                 │
│     ▲ +25% vs semana pasada       │
│                                    │
│  📝 45 Destacados (P3)             │
│     ▼ -10% vs semana pasada       │
│                                    │
│  🎯 Top categoría: Oposiciones     │
│     ═ Sin cambios                 │
└────────────────────────────────────┘
```

### 3. TagFechaImportante

Tag visual para fechas límite.

```vue
<template>
  <div class="fecha-tag" :class="urgenciaClass">
    <span class="icon">⏰</span>
    <div class="fecha-content">
      <div class="fecha-label">{{ label }}</div>
      <div class="fecha-valor">{{ formatDate(fecha) }}</div>
      <div class="fecha-countdown" v-if="mostrarCountdown">
        {{ diasRestantes }} días restantes
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['fecha', 'label'])

const diasRestantes = computed(() => {
  return Math.ceil((new Date(props.fecha) - new Date()) / (1000 * 60 * 60 * 24))
})

const urgenciaClass = computed(() => {
  if (diasRestantes.value < 7) return 'urgente'
  if (diasRestantes.value < 15) return 'proximo'
  return 'normal'
})
</script>

<style scoped>
.fecha-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 4px solid;
}

.fecha-tag.urgente {
  background: #fef2f2;
  border-color: #ef4444;
}

.fecha-tag.proximo {
  background: #fffbeb;
  border-color: #f59e0b;
}

.fecha-tag.normal {
  background: #f0f9ff;
  border-color: #3b82f6;
}
</style>
```

---

## 🚶 FLUJOS DE USUARIO

### Flujo 1: Usuario busca oposición específica

```
1. Usuario entra a /categorias/oposiciones
   ↓
2. Ve resumen semanal: "Esta semana 850 plazas de Administrativo"
   ↓
3. Scroll down, ve card "Administrativo - 850 plazas"
   ↓
4. Click en "Ver detalles"
   ↓
5. Modal se abre con Tab "Resumen"
   Lee: "Es para personas con Bachiller, plazo hasta 20 Dic"
   ↓
6. Click en Tab "Requisitos"
   Ve lista clara de requisitos explicados
   ↓
7. Click en Tab "Pasos"
   Ve guía paso a paso para inscribirse
   ↓
8. Click en "Ver BOE" → Se abre PDF oficial en nueva pestaña
   ↓
9. Vuelve a modal, guarda documento (si auth implementado)
   ↓
10. Cierra modal, busca más oposiciones con filtro "Bachiller"
```

### Flujo 2: Usuario descubre contenido navegando

```
1. Usuario entra a / (homepage)
   ↓
2. Ve sección "Destacado esta semana"
   Card: "Nueva ley de vivienda afecta a alquileres"
   ↓
3. Click en card
   ↓
4. Redirige a /categorias/legislacion
   Modal auto-abre con ese documento
   ↓
5. Lee Tab "Antes vs Ahora"
   Ve tabla comparativa clara
   ↓
6. Lee Tab "Cómo me afecta"
   Ve ejemplos de inquilinos y propietarios
   ↓
7. Interesado, click en "Ver más de Legislación"
   ↓
8. Modal cierra, ve lista completa de legislación
   ↓
9. Aplica filtro "Última semana"
   ↓
10. Descubre más cambios legislativos relevantes
```

### Flujo 3: Usuario busca ayuda específica

```
1. Usuario entra a / y usa búsqueda global (Ctrl+K)
   Escribe: "ayuda alquiler joven"
   ↓
2. Autocomplete sugiere:
   - "Ayuda alquiler jóvenes 2025"
   - "Subvención vivienda menores 35 años"
   ↓
3. Selecciona primera sugerencia
   ↓
4. Resultados muestran 12 ayudas distintas
   Filtradas por: categoría=ayudas, keywords=alquiler+joven
   ↓
5. Ve ayuda de su comunidad autónoma
   Click en card
   ↓
6. Modal Tab "Quién puede pedirla"
   Ve checklist de requisitos
   Cumple: ✅ <35 años, ✅ renta <21k
   No cumple: ❌ empadronado (vive con padres)
   ↓
7. Lee Tab "Cómo solicitarla"
   Ve que necesita empadronarse primero
   ↓
8. Guarda documento para más tarde
   ↓
9. Busca "empadronamiento" en Google
   Vuelve cuando esté listo
```

---

## ♿ MEJORAS DE ACCESIBILIDAD

### 1. Navegación por Teclado

```typescript
// Implementar shortcuts globales
const shortcuts = {
  'ctrl+k': () => openSearch(),
  '/': () => focusSearch(),
  'esc': () => closeModal(),
  '?': () => showKeyboardHelp(),

  // Navegación en lista
  'j': () => nextItem(),
  'k': () => previousItem(),
  'enter': () => openCurrentItem(),

  // Tabs en modal
  '1': () => switchToTab(0),
  '2': () => switchToTab(1),
  '3': () => switchToTab(2),
  '4': () => switchToTab(3)
}
```

### 2. ARIA Labels Completos

```vue
<template>
  <button
    @click="abrirModal"
    :aria-label="`Ver detalles de ${documento.titulo}`"
    :aria-describedby="`resumen-${documento.id}`"
  >
    Ver detalles
  </button>

  <div :id="`resumen-${documento.id}`" class="sr-only">
    {{ documento.resumen }}
  </div>
</template>
```

### 3. Focus Management

```vue
<script setup>
const modalOpen = ref(false)
const previousFocusElement = ref(null)

function openModal() {
  previousFocusElement.value = document.activeElement
  modalOpen.value = true

  nextTick(() => {
    // Focus primer elemento interactivo
    const firstInput = document.querySelector('.modal input, .modal button')
    firstInput?.focus()
  })
}

function closeModal() {
  modalOpen.value = false
  // Restaurar focus
  previousFocusElement.value?.focus()
}

// Focus trap en modal
useFocusTrap(modalRef, { active: modalOpen })
</script>
```

### 4. Contraste y Tamaños

```css
/* Asegurar contraste WCAG AA (mínimo 4.5:1) */
.texto-normal {
  color: #374151; /* Contraste 7:1 con blanco */
  font-size: 16px; /* Mínimo legible */
  line-height: 1.6; /* Espaciado cómodo */
}

.texto-secundario {
  color: #6b7280; /* Contraste 4.6:1 con blanco */
}

/* Touch targets mínimo 44x44px */
.btn, .link-interactivo {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}
```

### 5. Reducción de Animaciones

```css
/* Respetar preferencia de usuario */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎯 CONCLUSIONES

### Prioridades de Implementación

**P1 - Crítico (Fase 4):**
- ✅ Página categoría con resumen semanal
- ✅ Modal de documento con tabs
- ✅ Cards de documento mejorados

**P2 - Alta (Fase 4):**
- ✅ Búsqueda global
- ✅ Filtros avanzados
- ✅ Timeline de publicaciones

**P3 - Media (Fase 5):**
- 🔲 Visualizaciones avanzadas
- 🔲 Dashboard de usuario
- 🔲 Sistema de notificaciones

### Métricas de Éxito UI/UX

| Métrica | Target | Medición |
|---------|--------|----------|
| **Tiempo para encontrar documento** | < 30s | User testing |
| **Tasa de apertura de modal** | > 40% | Analytics |
| **Tiempo medio en modal** | > 2min | Analytics |
| **Satisfacción (NPS)** | > 50 | Encuestas |
| **Accesibilidad (Lighthouse)** | 100 | Lighthouse |

---

**Siguiente:** Crear resumen ejecutivo con todas las recomendaciones consolidadas.
