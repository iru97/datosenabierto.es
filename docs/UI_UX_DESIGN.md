# Diseño UI/UX - datosenabierto.es
## Sistema de Diseño y Arquitectura de Información

**Fecha:** 24 de Noviembre, 2025
**Versión:** 1.0

---

## 📐 ARQUITECTURA DE INFORMACIÓN

### Estructura de Navegación Principal

```
├── 🏠 Home
│   ├── Hero con buscador principal
│   ├── Trending hoy
│   ├── Últimos boletines
│   └── Accesos rápidos (oposiciones, ayudas, legislación)
│
├── 🔍 Búsqueda
│   ├── Resultados
│   ├── Filtros laterales
│   └── Vista detalle (modal/página)
│
├── 📚 Explorar
│   ├── Por sección (I, II, III, IV, V)
│   ├── Por tipo (Leyes, RD, Órdenes, etc)
│   ├── Por fecha (calendario)
│   └── Por organismo
│
├── 📊 Estadísticas (público)
│   ├── Dashboard general BOE
│   ├── Tendencias
│   └── Lo más consultado
│
├── 👤 Mi BOE (requiere auth)
│   ├── Dashboard personal
│   ├── Favoritos
│   ├── Búsquedas guardadas
│   ├── Alertas
│   ├── Documentos seguidos
│   └── Historial
│
├── 🔔 Alertas
│   ├── Mis alertas
│   ├── Nueva alerta
│   └── Configuración canales
│
├── ⚙️ Configuración
│   ├── Perfil
│   ├── Preferencias
│   ├── Privacidad
│   └── Suscripción (Pro)
│
└── ℹ️ Ayuda
    ├── Cómo usar
    ├── Tutoriales
    ├── FAQ
    ├── Centro de ayuda
    └── Contacto
```

### Flujos de Usuario Principales

#### Flujo 1: Usuario Nuevo → Primera Búsqueda

```
Landing → Ver ejemplo búsqueda → Búsqueda simple → Resultados →
Ver detalle → (Opcional) Registrarse → Guardar favorito
```

#### Flujo 2: Usuario Registrado → Configurar Alerta

```
Login → Dashboard → Nueva Alerta → Configurar criterios →
Elegir canales → Guardar → Recibir notificación test → Confirmar
```

#### Flujo 3: Profesional → Comparar Versiones

```
Búsqueda avanzada → Resultado ley modificada → Abrir detalle →
Ver "Modificaciones" → Comparar versiones → Ver diff →
Exportar comparación
```

---

## 🎨 SISTEMA DE DISEÑO

### Principios de Diseño

1. **Claridad sobre complejidad:** Siempre elegir lo más simple
2. **Información primero:** El contenido es el protagonista
3. **Accesibilidad por defecto:** WCAG 2.1 AA en todo
4. **Responsive y móvil-first:** Pensar primero en pantallas pequeñas
5. **Performance:** Cada elemento debe justificar su peso
6. **Consistencia:** Patrones reutilizables en toda la app

### Paleta de Colores

#### Colores Primarios

```css
/* Blues - Confianza, institucional, profesional */
--blue-50:  #eff6ff;  /* Backgrounds suaves */
--blue-100: #dbeafe;  /* Hover states ligeros */
--blue-200: #bfdbfe;  /* Borders */
--blue-300: #93c5fd;  /* Disabled states */
--blue-400: #60a5fa;  /* Secondary actions */
--blue-500: #3b82f6;  /* Primary actions */
--blue-600: #2563eb;  /* Primary hover */
--blue-700: #1d4ed8;  /* Primary active */
--blue-800: #1e40af;  /* Textos destacados */
--blue-900: #1e3a8a;  /* Textos muy destacados */

/* Grays - Neutrales, textos, fondos */
--gray-50:  #f9fafb;  /* Background app */
--gray-100: #f3f4f6;  /* Background cards */
--gray-200: #e5e7eb;  /* Borders suaves */
--gray-300: #d1d5db;  /* Borders normales */
--gray-400: #9ca3af;  /* Placeholder text */
--gray-500: #6b7280;  /* Secondary text */
--gray-600: #4b5563;  /* Body text */
--gray-700: #374151;  /* Headings */
--gray-800: #1f2937;  /* Strong emphasis */
--gray-900: #111827;  /* Maximum contrast */
```

#### Colores Semánticos

```css
/* Success - Acciones completadas, estados positivos */
--success-50:  #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;
--success-700: #15803d;

/* Warning - Advertencias, acciones con precaución */
--warning-50:  #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;
--warning-700: #b45309;

/* Error - Errores, acciones destructivas */
--error-50:  #fef2f2;
--error-500: #ef4444;
--error-600: #dc2626;
--error-700: #b91c1c;

/* Info - Información neutral, tips */
--info-50:  #eff6ff;
--info-500: #3b82f6;
--info-600: #2563eb;
--info-700: #1d4ed8;
```

#### Colores por Sección BOE

```css
/* Para badges de secciones */
--section-I:   #3b82f6;  /* Azul - Disposiciones generales */
--section-II:  #8b5cf6;  /* Morado - Autoridades y personal */
--section-III: #ec4899;  /* Rosa - Otras disposiciones */
--section-IV:  #f59e0b;  /* Ámbar - Administración de Justicia */
--section-V:   #10b981;  /* Verde - Anuncios */
```

### Tipografía

#### Font Stack

```css
/* Sans-serif moderna, legible, con buenos números */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont,
             'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* Monospace para código, IDs, referencias */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
```

#### Scale Tipográfica (Major Third - 1.250)

```css
--text-xs:   0.75rem;   /* 12px - Metadata, labels pequeños */
--text-sm:   0.875rem;  /* 14px - Body pequeño, secundario */
--text-base: 1rem;      /* 16px - Body principal */
--text-lg:   1.125rem;  /* 18px - Subtítulos, énfasis */
--text-xl:   1.25rem;   /* 20px - Títulos pequeños */
--text-2xl:  1.563rem;  /* 25px - Títulos medianos */
--text-3xl:  1.953rem;  /* 31px - Títulos grandes */
--text-4xl:  2.441rem;  /* 39px - Hero titles */
--text-5xl:  3.052rem;  /* 49px - Display titles */
```

#### Pesos de Fuente

```css
--font-normal:    400;  /* Body text */
--font-medium:    500;  /* Énfasis suave, labels */
--font-semibold:  600;  /* Subtítulos, botones */
--font-bold:      700;  /* Títulos, muy destacado */
```

#### Line Heights

```css
--leading-tight:  1.25;   /* Títulos */
--leading-snug:   1.375;  /* Subtítulos */
--leading-normal: 1.5;    /* Body text */
--leading-relaxed: 1.625; /* Lectura larga */
--leading-loose:  2;      /* Muy espaciado */
```

### Espaciado (Sistema 4px/8px)

```css
--spacing-0:  0;
--spacing-1:  0.25rem;  /* 4px */
--spacing-2:  0.5rem;   /* 8px */
--spacing-3:  0.75rem;  /* 12px */
--spacing-4:  1rem;     /* 16px */
--spacing-5:  1.25rem;  /* 20px */
--spacing-6:  1.5rem;   /* 24px */
--spacing-8:  2rem;     /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
```

### Bordes y Radios

```css
--radius-none: 0;
--radius-sm:   0.125rem;  /* 2px - Inputs, subtle */
--radius-base: 0.25rem;   /* 4px - Buttons, badges */
--radius-md:   0.375rem;  /* 6px - Cards */
--radius-lg:   0.5rem;    /* 8px - Modals */
--radius-xl:   0.75rem;   /* 12px - Hero sections */
--radius-2xl:  1rem;      /* 16px - Special containers */
--radius-full: 9999px;    /* Circular */

--border-width: 1px;
--border-width-2: 2px;
--border-width-4: 4px;
```

### Sombras

```css
/* Elevación progresiva */
--shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow:     0 1px 3px 0 rgba(0, 0, 0, 0.1),
              0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### Transiciones

```css
--transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base:   200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow:   300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slower: 500ms cubic-bezier(0.4, 0, 0.2, 1);

--easing-in:     cubic-bezier(0.4, 0, 1, 1);
--easing-out:    cubic-bezier(0, 0, 0.2, 1);
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🧩 COMPONENTES DEL SISTEMA

### 1. Buttons

#### Variantes

**Primary Button**
```
[Botón Primario]
- Background: --blue-600
- Text: white
- Hover: --blue-700
- Focus: ring --blue-500
- Padding: 12px 24px
- Border radius: --radius-md
- Font: --font-semibold
- Transition: --transition-base
```

**Secondary Button**
```
[Botón Secundario]
- Background: transparent
- Border: 1px --gray-300
- Text: --gray-700
- Hover: --gray-50
- Focus: ring --gray-500
```

**Ghost Button**
```
[Botón Ghost]
- Background: transparent
- Text: --gray-600
- Hover: --gray-100
- Sin border
```

**Danger Button**
```
[Botón Peligro]
- Background: --error-600
- Text: white
- Hover: --error-700
```

#### Tamaños

- **xs:** padding 6px 12px, text-xs
- **sm:** padding 8px 16px, text-sm
- **md:** padding 12px 24px, text-base (default)
- **lg:** padding 14px 28px, text-lg
- **xl:** padding 16px 32px, text-xl

### 2. Cards

**Card Base**
```html
┌──────────────────────────────────┐
│ [Badge] [Badge]        [Actions] │
│                                   │
│ Título del Documento              │
│ Metadata • Metadata • Metadata   │
│                                   │
│ Resumen del contenido en 2-3     │
│ líneas con puntos clave...       │
│                                   │
│ 🔑 Punto clave 1                 │
│ 🔑 Punto clave 2                 │
│                                   │
│ [CTA Principal] [CTA Secundario] │
└──────────────────────────────────┘

- Background: white
- Border: 1px --gray-200
- Border radius: --radius-lg
- Padding: --spacing-6
- Shadow: --shadow-sm (hover: --shadow-md)
- Transition: --transition-base
```

**Card Variants**
- Compact: menos padding, sin resumen
- Highlighted: border --blue-500, shadow-md
- Disabled: opacity 0.6, cursor not-allowed

### 3. Badges

```html
[Tipo de Badge]

Sizes:
• sm: px-2 py-1, text-xs
• md: px-3 py-1, text-sm (default)
• lg: px-4 py-2, text-base

Variants:
• Primary (blue): Tipos de documento
• Success (green): Vigente, Nuevo
• Warning (amber): Modificado, Urgente
• Error (red): Derogado, Atención
• Gray: Neutral, metadata
• Purple: Sección II
• Pink: Sección III
• etc.
```

### 4. Input Fields

```html
┌─────────────────────────────────┐
│ Label                      [?]  │
│ ┌─────────────────────────────┐ │
│ │ 🔍 Placeholder text...      │ │
│ └─────────────────────────────┘ │
│ Helper text aquí               │
└─────────────────────────────────┘

States:
• Default: border --gray-300
• Focus: border --blue-500, ring
• Error: border --error-500, text --error-600
• Disabled: background --gray-100, cursor not-allowed
• Success: border --success-500

Sizes:
• sm: h-8, text-sm
• md: h-10, text-base (default)
• lg: h-12, text-lg
```

### 5. Modal/Dialog

```html
[Overlay Oscuro Semi-transparente]
    ┌────────────────────────────────┐
    │ Título del Modal          [✕]  │
    ├────────────────────────────────┤
    │                                │
    │  Contenido del modal           │
    │  scrolleable si es largo       │
    │                                │
    │                                │
    ├────────────────────────────────┤
    │         [Cancelar] [Confirmar] │
    └────────────────────────────────┘

Properties:
• Max-width: 640px (md), 768px (lg), 1024px (xl)
• Border radius: --radius-xl
• Shadow: --shadow-2xl
• Backdrop: rgba(0, 0, 0, 0.5)
• Animation: fade + scale
• Focus trap: true
• Escape key: close
• Click backdrop: close (opcional)
```

### 6. Dropdown Menu

```html
Trigger: [Botón ▼]
         ↓
    ┌────────────────┐
    │ • Opción 1     │
    │ • Opción 2     │
    │ ─────────────  │
    │ • Opción 3     │
    │ ✓ Opción 4     │
    └────────────────┘

Properties:
• Border: 1px --gray-200
• Border radius: --radius-md
• Shadow: --shadow-lg
• Animation: fade + slide-down
• Keyboard navigation: ↑↓ Enter
• Max height: 400px (scroll si excede)
```

### 7. Toast Notifications

```html
Positions: top-right, top-left, bottom-right, bottom-left

┌────────────────────────────────────┐
│ [✓] Título de notificación    [✕] │
│     Mensaje descriptivo opcional   │
│     [Acción]                       │
└────────────────────────────────────┘

Variants:
• Success: border-left --success-500
• Error: border-left --error-500
• Warning: border-left --warning-500
• Info: border-left --info-500

Properties:
• Auto-dismiss: 5 segundos (configurable)
• Stack: múltiples toasts apilados
• Animation: slide-in + fade
```

### 8. Loading States

**Skeleton Loader**
```html
┌──────────────────────────────┐
│ ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░   │
│                              │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░     │
│ ▓▓▓░░░░ ▓▓▓░░░░ ▓▓▓░░░░     │
│                              │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░   │
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░    │
└──────────────────────────────┘

Properties:
• Background: linear gradient animado
• Border radius: match del componente real
• Pulse animation
```

**Spinner**
```
Loading... ⏳ (animado)

Sizes: sm (16px), md (24px), lg (32px), xl (48px)
```

---

## 📱 WIREFRAMES DE PANTALLAS PRINCIPALES

### Home Page

```
┌────────────────────────────────────────────────────────┐
│ [Logo] datosenabierto.es    [Explorar▼] [Mi BOE] [👤] │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                                                        │
│     Consulta el BOE de forma moderna e intuitiva      │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 🔍 Buscar en el BOE...                    [Buscar]│ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Ejemplos: "oposiciones administrativo" • "ayudas..."  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 🔥 Trending hoy                              Ver todo → │
├────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐            │
│ │[Trending] │ │[Trending] │ │[Trending] │  →         │
│ │  Card 1   │ │  Card 2   │ │  Card 3   │            │
│ └───────────┘ └───────────┘ └───────────┘            │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 📅 Últimos boletines                         Ver todo → │
├────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────┐       │
│ │ [NUEVO]             │ │ BOE Nº XXX          │       │
│ │ BOE Nº XXX          │ │ Viernes, 23/11/2025 │       │
│ │ Lunes, 25/11/2025   │ │                     │       │
│ │                     │ │ • 150 disposiciones │       │
│ │ • 180 disposiciones │ │ • 5 secciones       │       │
│ │ • 5 secciones       │ │                     │       │
│ │                     │ │ [Ver sumario]       │       │
│ │ [Ver sumario]       │ └─────────────────────┘       │
│ └─────────────────────┘                               │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 🚀 Accesos rápidos                                     │
├────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ 📝       │ │ 💰       │ │ 🏛️       │ │ 📜       │  │
│ │Oposicio- │ │Subvencio-│ │Nombra-   │ │Legisla-  │  │
│ │   nes    │ │   nes    │ │ mientos  │ │  ción    │  │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└────────────────────────────────────────────────────────┘
```

### Página de Resultados de Búsqueda

```
┌────────────────────────────────────────────────────────┐
│ [Logo]              [🔍 búsqueda...]        [👤] [🔔] │
└────────────────────────────────────────────────────────┘

┌──────────┬──────────────────────────────────────────────┐
│          │ Resultados para "oposiciones administativo"  │
│ Filtros  │ 1,234 resultados encontrados     [Sort▼]     │
│          ├──────────────────────────────────────────────┤
│ Fecha    │                                              │
│ [Desde]  │ ┌──────────────────────────────────────────┐ │
│ [Hasta]  │ │ [NUEVO] [Sección II]            [⭐] [⋮] │ │
│          │ │                                          │ │
│ Sección  │ │ Convocatoria de oposiciones para...      │ │
│ ☑ I      │ │ BOE Nº 123 • 23/11/2025 • Ministerio... │ │
│ ☑ II     │ │                                          │ │
│ ☐ III    │ │ Bases de la convocatoria para provisión  │ │
│ ☐ IV     │ │ de plazas de Administrativo...           │ │
│ ☐ V      │ │                                          │ │
│          │ │ 🔑 Plazo: 20 días desde publicación      │ │
│ Tipo     │ │ 🔑 Plazas: 50 (35 libre, 15 interno)     │ │
│ ☐ Ley    │ │                                          │ │
│ ☐ RD     │ │ [Ver detalles] [PDF] [Crear alerta]     │ │
│ ☑ Orden  │ └──────────────────────────────────────────┘ │
│ ☐ Resol. │                                              │
│          │ ┌──────────────────────────────────────────┐ │
│ Estado   │ │ [Sección II]                    [⭐] [⋮] │ │
│ ☑ Vigente│ │ Orden convocando oposiciones...          │ │
│ ☐ Derog. │ │ ...                                      │ │
│          │ └──────────────────────────────────────────┘ │
│ [Limpiar]│                                              │
│          │ [1] [2] [3] ... [41]  →                     │
└──────────┴──────────────────────────────────────────────┘
```

### Modal de Detalle de Documento

```
[Overlay Oscurecido]

  ┌───────────────────────────────────────────────────┐
  │ BOE Nº 123 • 23/11/2025                      [✕] │
  ├───────────────────────────────────────────────────┤
  │                                                   │
  │ [Sección II] [Orden] [NUEVO]                     │
  │                                                   │
  │ Orden convocando proceso selectivo para          │
  │ provisión de 50 plazas de Administrativo         │
  │                                                   │
  │ Ministerio de Hacienda y Función Pública        │
  │                                                   │
  │ ─────────────────────────────────────────────── │
  │                                                   │
  │ 📝 Resumen generado por IA                       │
  │ Esta orden convoca un proceso selectivo para     │
  │ cubrir 50 plazas de Administrativo mediante      │
  │ oposición libre y promoción interna...           │
  │                                                   │
  │ 🔑 Puntos clave:                                 │
  │ • Plazo de presentación: 20 días hábiles         │
  │ • Plazas: 35 turno libre, 15 turno interno      │
  │ • Requisitos: Título de Bachiller o equivalente │
  │ • Fecha examen: A determinar (mínimo 3 meses)   │
  │ • Entra en vigor: Día siguiente a publicación   │
  │                                                   │
  │ [Tabs: Resumen | Texto completo | Anexos]       │
  │                                                   │
  │ ─────────────────────────────────────────────── │
  │                                                   │
  │ [⭐ Favorito] [🔔 Alertas] [⬇️ PDF] [🔗 Compartir] │
  │                                                   │
  │ [Ver en BOE oficial →]                           │
  └───────────────────────────────────────────────────┘
```

### Dashboard Personal (Mi BOE)

```
┌────────────────────────────────────────────────────────┐
│ [Logo]  [Buscar...]  [Explorar▼] [Mi BOE] [Avatar]   │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ Hola, Carlos 👋                              [⚙️ Config]│
│                                                        │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│ │ 📚 Favoritos │ │ 🔔 Alertas   │ │ 🔍 Búsquedas │   │
│ │     24       │ │   Activas: 5 │ │   Guardadas  │   │
│ │              │ │   Hoy: 3     │ │      8       │   │
│ └──────────────┘ └──────────────┘ └──────────────┘   │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 🔔 Notificaciones recientes                 Ver todas → │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ [NUEVO] Alerta: "oposiciones"              • Ahora │ │
│ │ Nueva convocatoria de oposiciones...              │ │
│ │ [Ver documento]                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [📝] Documento modificado               • Hace 2h  │ │
│ │ La Ley 43/2006 ha sido modificada                 │ │
│ │ [Ver cambios]                                      │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ ⭐ Tus favoritos recientes                  Ver todos → │
├────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│ │Document │ │Document │ │Document │ │Document │  →   │
│ │ Card 1  │ │ Card 2  │ │ Card 3  │ │ Card 4  │      │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 📊 Tu actividad                                        │
├────────────────────────────────────────────────────────┤
│ • Búsquedas esta semana: 15                           │
│ • Documentos consultados: 28                           │
│ • Tema más consultado: Oposiciones (12)               │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 PATRONES DE INTERACCIÓN

### Feedback Inmediato

**Principio:** Toda acción del usuario debe tener feedback en < 100ms

- **Click botón:** Cambio visual inmediato (scale, color)
- **Favorito:** Animación de estrella rellenándose
- **Copiar link:** Toast "Link copiado" + icono check
- **Error formulario:** Shake animation + mensaje
- **Búsqueda:** Skeleton loader mientras carga

### Estados de Carga

1. **Immediate (<100ms):** Spinner inline
2. **Short (100ms-1s):** Spinner + "Cargando..."
3. **Medium (1-3s):** Skeleton loader
4. **Long (>3s):** Progress bar + "Procesando X de Y"

### Validación de Formularios

- **Validación inline:** Al perder focus (onBlur)
- **Errores:** Mostrar bajo el campo con icono ⚠️
- **Success:** Check verde ✓ en el input
- **Requeridos:** Asterisco rojo *
- **Submit disabled:** Hasta que formulario válido

### Navegación y Scroll

- **Scroll to top:** Botón flotante cuando scroll > 500px
- **Infinite scroll:** Con indicador "Cargando más..."
- **Breadcrumbs:** Siempre visibles en páginas internas
- **Back button:** Respeta historial del navegador

---

## 📏 RESPONSIVE BREAKPOINTS

```css
/* Mobile-first approach */

/* Extra Small - Móviles pequeños */
@media (min-width: 0px) { }  /* < 375px base */

/* Small - Móviles */
@media (min-width: 640px) { }  /* sm */

/* Medium - Tablets */
@media (min-width: 768px) { }  /* md */

/* Large - Tablets horizontales / Desktops pequeños */
@media (min-width: 1024px) { }  /* lg */

/* Extra Large - Desktops */
@media (min-width: 1280px) { }  /* xl */

/* 2XL - Desktops grandes */
@media (min-width: 1536px) { }  /* 2xl */
```

### Cambios por Breakpoint

**Mobile (< 640px):**
- Menú hamburguesa
- Cards en 1 columna
- Modales fullscreen
- Filtros en drawer inferior
- Tabs scroll horizontal

**Tablet (640-1024px):**
- Menú completo o drawer lateral
- Cards en 2 columnas
- Modales centrados
- Filtros en sidebar colapsable

**Desktop (> 1024px):**
- Menú completo persistente
- Cards en 3 columnas
- Modales centrados con max-width
- Filtros en sidebar fijo
- Hover states activos

---

## ♿ ACCESIBILIDAD

### Checklist General

- [ ] Contraste mínimo 4.5:1 (texto normal)
- [ ] Contraste mínimo 3:1 (texto grande >18px)
- [ ] Focus visible en todos los elementos interactivos
- [ ] Orden de tabulación lógico
- [ ] Sin keyboard traps
- [ ] ARIA labels donde necesario
- [ ] Headings jerárquicos (h1 → h6)
- [ ] Imágenes con alt text
- [ ] Videos con subtítulos
- [ ] Formularios con labels explícitos
- [ ] Errores identificables y descriptivos
- [ ] Contenido no solo por color
- [ ] Skip links funcionales
- [ ] Live regions para contenido dinámico

### Testing

- **Herramientas automatizadas:**
  - Axe DevTools
  - WAVE
  - Lighthouse Accessibility

- **Testing manual:**
  - Navegación por teclado
  - Screen readers (NVDA, JAWS, VoiceOver)
  - Zoom hasta 200%
  - Windows High Contrast Mode

---

## 📦 PRÓXIMOS PASOS

1. ✅ Arquitectura de información definida
2. ✅ Sistema de diseño especificado
3. ✅ Wireframes de pantallas principales
4. 🔄 **Crear plan de implementación técnica** (siguiente)
5. ⏳ Implementar componentes base
6. ⏳ Implementar páginas principales
7. ⏳ Testing y ajustes

---

**Documento creado:** 24/11/2025
**Última actualización:** 24/11/2025
**Versión:** 1.0
