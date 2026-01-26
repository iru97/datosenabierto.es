# User Stories - datosenabierto.es MVP Mejorado
## Historias de Usuario Detalladas

**Fecha:** 24 de Noviembre, 2025
**Fase:** P0 - Must Have Features

---

## 📖 FORMATO DE USER STORIES

Cada user story sigue el formato:

```
Como [tipo de usuario]
Quiero [acción/funcionalidad]
Para [beneficio/objetivo]

Criterios de Aceptación:
- [ ] Criterio 1
- [ ] Criterio 2

Notas Técnicas:
- Detalles de implementación

Prioridad: P0/P1/P2
Esfuerzo: S/M/L/XL
```

---

## 👤 PERSONAS (Arquetipos de Usuario)

### 1. María - Ciudadana Opositora
- **Edad:** 28 años
- **Profesión:** Administrativa buscando empleo público
- **Tech-savvy:** Medio
- **Frecuencia uso:** Semanal durante preparación
- **Dispositivo:** 70% móvil, 30% desktop

### 2. Carlos - Abogado
- **Edad:** 42 años
- **Profesión:** Abogado laboralista
- **Tech-savvy:** Alto
- **Frecuencia uso:** Diaria
- **Dispositivo:** 60% desktop, 40% móvil

### 3. Ana - Emprendedora
- **Edad:** 35 años
- **Profesión:** Dueña de startup tech
- **Tech-savvy:** Alto
- **Frecuencia uso:** Mensual (búsqueda puntual)
- **Dispositivo:** 50/50

### 4. José - Jubilado Curioso
- **Edad:** 68 años
- **Profesión:** Profesor jubilado
- **Tech-savvy:** Bajo
- **Frecuencia uso:** Ocasional
- **Dispositivo:** 80% desktop, 20% tablet

---

## 🎨 EPIC 1: INTERFAZ MODERNA Y ACCESIBLE

### US-001: Rediseño UI Completo

**Como** María (ciudadana)
**Quiero** una interfaz visual moderna, limpia y fácil de usar
**Para** no sentirme abrumada y encontrar información rápidamente

**Criterios de Aceptación:**
- [ ] Sistema de diseño completo implementado (colores, tipografía, espaciado)
- [ ] Paleta de colores profesional y accesible
- [ ] Tipografía legible (mínimo 16px base, máximo 18px)
- [ ] Espaciado consistente (sistema 4px/8px)
- [ ] Componentes reutilizables documentados
- [ ] Sin elementos visuales del diseño antiguo
- [ ] Carga inicial < 3 segundos
- [ ] Layout limpio sin cluttering

**Notas Técnicas:**
- Tailwind CSS v4 con custom theme
- Design tokens en CSS variables
- Componentes Vue 3 con <script setup>
- Storybook para documentación (opcional)

**Prioridad:** P0
**Esfuerzo:** L (3-4 semanas)
**Dependencias:** Ninguna

---

### US-002: Diseño Responsive Mobile-First

**Como** María (usa móvil principalmente)
**Quiero** que la aplicación funcione perfectamente en mi teléfono
**Para** consultar el BOE desde cualquier lugar

**Criterios de Aceptación:**
- [ ] Diseño mobile-first (< 375px base)
- [ ] Breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- [ ] Touch targets mínimo 44x44px
- [ ] Menús hamburguesa en móvil
- [ ] Formularios optimizados móvil (inputs grandes, teclados correctos)
- [ ] Sin scroll horizontal en ningún tamaño
- [ ] Imágenes responsive con srcset
- [ ] Probado en iPhone, Android, tablet

**Notas Técnicas:**
- CSS Grid + Flexbox
- `@container` queries donde sea posible
- Viewport meta tag configurado
- Safe area insets para notch

**Prioridad:** P0
**Esfuerzo:** M (2 semanas)
**Dependencias:** US-001

---

### US-003: Accesibilidad WCAG 2.1 AA

**Como** José (con dificultades visuales)
**Quiero** poder usar la aplicación con mi lector de pantalla
**Para** acceder a información oficial sin barreras

**Criterios de Aceptación:**
- [ ] Contraste mínimo 4.5:1 para texto normal
- [ ] Contraste mínimo 3:1 para texto grande
- [ ] Todos los elementos interactivos accesibles por teclado
- [ ] Focus visible y claro en todos los elementos
- [ ] ARIA labels en elementos necesarios
- [ ] Imágenes con alt text descriptivo
- [ ] Headings jerárquicos correctos (h1 → h6)
- [ ] Formularios con labels explícitos
- [ ] Skip to content link
- [ ] Sin content only-color
- [ ] Probado con NVDA, JAWS y VoiceOver

**Notas Técnicas:**
- Axe DevTools para auditoría
- eslint-plugin-jsx-a11y
- Documentar patterns de accesibilidad
- Tests automatizados con @axe-core/playwright

**Prioridad:** P0
**Esfuerzo:** M (2-3 semanas)
**Dependencias:** US-001

---

### US-004: Modo Alto Contraste

**Como** José (con baja visión)
**Quiero** activar un modo de alto contraste
**Para** leer mejor los textos

**Criterios de Aceptación:**
- [ ] Toggle en header para activar/desactivar
- [ ] Contraste 7:1 mínimo en modo activado
- [ ] Bordes más gruesos (2px mínimo)
- [ ] Se guarda preferencia en localStorage
- [ ] Sin afectar funcionalidad
- [ ] Colores saturados evitados
- [ ] Respeta prefers-contrast: high del sistema

**Notas Técnicas:**
- CSS clase `.high-contrast` en body
- Media query `@media (prefers-contrast: high)`
- Persistencia con localStorage

**Prioridad:** P0
**Esfuerzo:** S (3-4 días)
**Dependencias:** US-001

---

### US-005: Navegación por Teclado Completa

**Como** Carlos (power user)
**Quiero** navegar usando solo el teclado
**Para** ser más eficiente en mi trabajo

**Criterios de Aceptación:**
- [ ] Tab order lógico en toda la aplicación
- [ ] Shortcuts documentados:
  - `/` - Focus búsqueda
  - `Esc` - Cerrar modales
  - `?` - Mostrar ayuda de shortcuts
  - `n` - Nuevo búsqueda
  - `s` - Guardar actual
- [ ] Focus trap en modales
- [ ] Focus restaurado al cerrar modales
- [ ] No keyboard traps
- [ ] Skip links funcionales
- [ ] Menús dropdown navegables con flechas

**Notas Técnicas:**
- `@vueuse/core` useFocusTrap
- Composable `useKeyboardShortcuts`
- Documentar en página /shortcuts

**Prioridad:** P0
**Esfuerzo:** M (1-2 semanas)
**Dependencias:** US-001

---

## 🔍 EPIC 2: BÚSQUEDA INTELIGENTE

### US-010: Búsqueda Facetada

**Como** Carlos (abogado)
**Quiero** filtrar resultados por múltiples criterios simultáneos
**Para** encontrar exactamente lo que necesito

**Criterios de Aceptación:**
- [ ] Filtros disponibles:
  - Rango de fechas (desde/hasta)
  - Sección BOE (I, II, III, IV, V)
  - Tipo documento (Ley, RD, Orden, etc)
  - Organismo emisor
  - Estado (vigente/derogado)
  - Ámbito (estatal/autonómico)
- [ ] Múltiples filtros aplicables simultáneamente
- [ ] Contador de resultados por filtro
- [ ] Clear filters button
- [ ] Filtros aplicados visibles como chips removibles
- [ ] URL actualizada con filtros (shareable)
- [ ] Estado persistido en navegación

**Notas Técnicas:**
- Usar Meilisearch o Elasticsearch
- Faceted search API
- Query params en URL
- Composable `useSearchFilters`

**Prioridad:** P0
**Esfuerzo:** M (2-3 semanas)
**Dependencias:** Ninguna (puede usar API actual mejorada)

---

### US-011: Autocomplete Inteligente

**Como** María (opositora)
**Quiero** que me sugiera búsquedas mientras escribo
**Para** encontrar más rápido sin saber términos exactos

**Criterios de Aceptación:**
- [ ] Sugerencias aparecen después de 3 caracteres
- [ ] Máximo 10 sugerencias
- [ ] Categorías de sugerencias:
  - Búsquedas populares
  - Tu historial (si logeado)
  - Documentos recientes
  - Términos relacionados
- [ ] Highlight de término buscado en sugerencias
- [ ] Navegación con teclado (flechas arriba/abajo)
- [ ] Debounce de 300ms
- [ ] Loading state mientras busca
- [ ] Click en sugerencia ejecuta búsqueda

**Notas Técnicas:**
- Endpoint `/api/search/autocomplete`
- Debounce con `@vueuse/core` useDebounceFn
- Trie structure para sugerencias rápidas
- Caché en Redis 5 minutos

**Prioridad:** P0
**Esfuerzo:** M (1-2 semanas)
**Dependencias:** US-010

---

### US-012: Búsqueda por Intención (NLP)

**Como** Ana (emprendedora sin conocimientos legales)
**Quiero** buscar en lenguaje natural "¿hay ayudas para startups?"
**Para** encontrar información sin saber términos técnicos

**Criterios de Aceptación:**
- [ ] Acepta búsquedas en lenguaje natural
- [ ] Ejemplos de búsquedas sugeridas:
  - "¿hay ayudas para emprendedores?"
  - "cambios en el IRPF este año"
  - "oposiciones de administrativo"
- [ ] Extrae intención y entidades con NLP
- [ ] Traduce a búsqueda estructurada
- [ ] Muestra "Buscando: [interpretación]"
- [ ] Permite refinar si no encuentra
- [ ] Aprende de clics (mejora con uso)
- [ ] Soporta sinónimos (paro = desempleo)

**Notas Técnicas:**
- spaCy pipeline español
- Named Entity Recognition (NER)
- Intent classification con ML
- Fallback a búsqueda tradicional
- Logs para mejorar modelo

**Prioridad:** P0
**Esfuerzo:** L (3-4 semanas)
**Dependencias:** US-010, US-011

---

### US-013: Búsquedas Guardadas

**Como** Carlos (abogado)
**Quiero** guardar mis búsquedas frecuentes
**Para** ejecutarlas rápidamente cada día

**Criterios de Aceptación:**
- [ ] Botón "Guardar búsqueda" visible en resultados
- [ ] Pide nombre descriptivo
- [ ] Lista de búsquedas guardadas en dashboard
- [ ] Click ejecuta búsqueda automáticamente
- [ ] Editar nombre de búsqueda guardada
- [ ] Eliminar búsqueda guardada
- [ ] Máximo 3 en tier gratuito, ilimitadas en Pro
- [ ] Indicador de nuevos resultados desde última ejecución
- [ ] Ordenables (drag & drop)

**Notas Técnicas:**
- Tabla `saved_searches` en DB
- Guarda: query, filters, user_id, name, created_at
- Endpoint PATCH `/api/saved-searches/:id`
- Composable `useSavedSearches`

**Prioridad:** P0 (free user value)
**Esfuerzo:** S (1 semana)
**Dependencias:** US-053 (Auth)

---

## 📄 EPIC 3: CONTENIDO COMPRENSIBLE

### US-020: Cards Informativas Mejoradas

**Como** María (ciudadana)
**Quiero** ver resúmenes visuales de cada documento
**Para** decidir rápidamente si me interesa sin abrirlo

**Criterios de Aceptación:**
- [ ] Card design limpio y escaneable
- [ ] Información visible en card:
  - Título claro y destacado
  - Tipo de documento con badge
  - Fecha prominente
  - Sección/organismo
  - Preview de 2-3 líneas
  - Iconos visuales por tipo
  - Estado (nuevo/actualizado/derogado)
- [ ] Hover effect sutil
- [ ] Click abre modal detalle
- [ ] Quick actions visibles en hover:
  - Favorito
  - Compartir
  - Descargar PDF
- [ ] Responsive (stack en móvil)

**Notas Técnicas:**
- Componente `<BOECard>` reutilizable
- Skeleton loader mientras carga
- Lazy load imágenes/iconos
- CSS Grid para layout

**Prioridad:** P0
**Esfuerzo:** M (1-2 semanas)
**Dependencias:** US-001

---

### US-021: Resúmenes Automáticos con IA

**Como** José (sin conocimientos legales)
**Quiero** ver un resumen en lenguaje claro de cada documento
**Para** entender de qué trata sin leer el texto completo técnico

**Criterios de Aceptación:**
- [ ] Resumen de 3-5 líneas máximo
- [ ] Lenguaje simple (nivel secundaria)
- [ ] Estructura: "Este documento [hace qué]"
- [ ] Generado automáticamente con IA
- [ ] Fallback a extracto si falla IA
- [ ] Cacheado permanentemente
- [ ] Indicador de "Resumen generado por IA"
- [ ] Link "Ver documento completo"
- [ ] En tier gratuito: 5 resúmenes/día
- [ ] En tier Pro: ilimitado

**Notas Técnicas:**
- API Claude/GPT-4 mini para resúmenes
- Prompt engineering optimizado
- Caché en DB (tabla `summaries`)
- Rate limiting por usuario
- Background job para pre-generar populares
- Fallback gracefully si cuota excedida

**Prioridad:** P0
**Esfuerzo:** L (3-4 semanas)
**Dependencias:** US-020, infraestructura IA

---

### US-022: Puntos Clave Destacados

**Como** Carlos (abogado con poco tiempo)
**Quiero** ver los puntos más importantes de un documento
**Para** decidir si necesito leerlo completo

**Criterios de Aceptación:**
- [ ] 3-5 bullet points por documento
- [ ] Extraídos automáticamente con NLP/IA
- [ ] Formato: "• [Punto clave]"
- [ ] Destacados visualmente (iconos, badges)
- [ ] Ejemplos:
  - "• Entra en vigor: 01/01/2026"
  - "• Modifica: Ley 43/2006"
  - "• Afecta a: Autónomos y PYMES"
  - "• Plazo: 30 días desde publicación"
- [ ] Visible en card y modal detalle
- [ ] Cacheado

**Notas Técnicas:**
- Named Entity Recognition para fechas, leyes
- Patrón regex para plazos
- IA para inferir "afecta a"
- Structured output de IA (JSON)

**Prioridad:** P0
**Esfuerzo:** M (2 semanas)
**Dependencias:** US-021

---

### US-023: Badges Visuales de Estado

**Como** María (usuario visual)
**Quiero** identificar rápidamente el tipo y estado de documentos
**Para** escanear resultados visualmente

**Criterios de Aceptación:**
- [ ] Badges implementados:
  - **Tipo:** Ley, RD, Orden, Resolución, etc (color azul)
  - **Estado:** Nuevo (< 7 días), Actualizado, Derogado
  - **Prioridad:** Urgente, Importante
  - **Sección:** I, II, III, IV, V (colores diferenciados)
  - **Ámbito:** Estatal, Autonómico
- [ ] Colores accesibles y consistentes
- [ ] Con iconos donde aplique
- [ ] Tooltips explicativos en hover
- [ ] Máximo 3 badges por card (evitar clutter)
- [ ] Filtrable haciendo click en badge

**Notas Técnicas:**
- Componente `<Badge>` con variants
- Paleta de colores para badges en design system
- Props: `variant`, `size`, `icon`

**Prioridad:** P0
**Esfuerzo:** S (3-5 días)
**Dependencias:** US-001, US-020

---

### US-024: Iconografía Consistente

**Como** usuario en general
**Quiero** iconos claros y consistentes
**Para** reconocer tipos de contenido rápidamente

**Criterios de Aceptación:**
- [ ] Conjunto de iconos definido:
  - 📜 Ley/Disposición
  - 📋 Orden/Resolución
  - 👥 Personal/Oposiciones
  - 💰 Subvenciones/Ayudas
  - 🏛️ Nombramientos
  - 🔔 Alerta
  - ⭐ Favorito
  - 📥 Descargar
  - 🔗 Compartir
  - 🔍 Buscar
  - ⚙️ Configuración
- [ ] Familia de iconos única (Heroicons o Lucide)
- [ ] Tamaños estandarizados (16px, 20px, 24px)
- [ ] Colores consistentes
- [ ] Siempre con aria-label para accesibilidad

**Notas Técnicas:**
- Heroicons 2.1.1 (ya instalado)
- Componente wrapper `<Icon name="..." />`
- Tree-shaking para optimizar bundle

**Prioridad:** P0
**Esfuerzo:** S (2-3 días)
**Dependencias:** US-001

---

## 🔔 EPIC 4: ALERTAS AVANZADAS

### US-030: Sistema de Alertas Mejorado UI

**Como** Carlos (profesional)
**Quiero** una interfaz clara para configurar mis alertas
**Para** recibir notificaciones de lo que me interesa

**Criterios de Aceptación:**
- [ ] Página `/alertas` dedicada
- [ ] Botón "Nueva Alerta" prominente
- [ ] Formulario de creación con:
  - Nombre de la alerta
  - Criterios de búsqueda (reutiliza filtros)
  - Frecuencia (inmediata, diaria, semanal)
  - Canales (email, SMS, Telegram, Push)
  - Activa/Inactiva
- [ ] Lista de alertas existentes con:
  - Nombre
  - Criterios (resumen)
  - Última ejecución
  - Siguiente ejecución
  - Acciones: Editar, Pausar, Eliminar
- [ ] Test alert (enviar notificación de prueba)
- [ ] Estadística: "Has recibido X notificaciones este mes"

**Notas Técnicas:**
- Tabla `alerts` en DB
- CRON jobs para alertas programadas
- Queue system (Bull/BullMQ) para envíos
- Composable `useAlerts`

**Prioridad:** P0
**Esfuerzo:** M (2 semanas)
**Dependencias:** US-053 (Auth)

---

### US-031: Alertas Multi-canal

**Como** Carlos (siempre conectado)
**Quiero** recibir alertas por múltiples canales
**Para** no perder ninguna notificación importante

**Criterios de Aceptación:**
- [ ] Canales soportados:
  - ✅ Email (tier gratuito)
  - 💰 SMS (tier Pro)
  - 💰 Telegram (tier Pro)
  - 💰 Push notifications (tier Pro)
- [ ] Configuración por alerta de canales
- [ ] Verificación de canales:
  - Email: confirmación al agregar
  - SMS: código verificación
  - Telegram: conectar bot con comando /start
  - Push: permiso del navegador
- [ ] No duplicar si múltiples canales
- [ ] Rate limiting: máx 100 notificaciones/día por usuario
- [ ] Opt-out fácil desde notificación

**Notas Técnicas:**
- Twilio para SMS
- Telegram Bot API
- Firebase Cloud Messaging para push
- SendGrid para email
- Tabla `user_channels` para almacenar configs

**Prioridad:** P0
**Esfuerzo:** L (3-4 semanas)
**Dependencias:** US-030

---

## 👤 EPIC 5: USUARIOS Y PERSONALIZACIÓN

### US-050: Registro de Usuarios

**Como** usuario
**Quiero** crear una cuenta
**Para** acceder a features personalizadas

**Criterios de Aceptación:**
- [ ] Registro con email + password
- [ ] Validación:
  - Email válido
  - Password mínimo 8 caracteres
  - Password con mayúscula, minúscula, número
- [ ] Confirmación de email obligatoria
- [ ] Login social:
  - Google
  - GitHub (para desarrolladores)
- [ ] "Recordarme" checkbox
- [ ] Recuperar contraseña
- [ ] Página /perfil después de registro
- [ ] GDPR: checkbox consentimiento privacidad
- [ ] No mostrar paywall inmediato (dar valor primero)

**Notas Técnicas:**
- Supabase Auth o Auth.js
- JWT tokens con refresh
- HttpOnly cookies para seguridad
- Middleware de autenticación

**Prioridad:** P0
**Esfuerzo:** M (2 semanas)
**Dependencias:** Ninguna

---

### US-051: Perfil Personalizable

**Como** usuario registrado
**Quiero** configurar mis preferencias
**Para** tener experiencia personalizada

**Criterios de Aceptación:**
- [ ] Página `/perfil`
- [ ] Campos editables:
  - Nombre completo
  - Foto de perfil (opcional)
  - Profesión/Sector
  - Intereses (multi-select):
    * Oposiciones
    * Subvenciones
    * Legislación laboral
    * Fiscalidad
    * etc.
  - Preferencias UI:
    * Dark mode
    * Tamaño fuente
    * Densidad información (compacta/normal/cómoda)
- [ ] Cambiar email
- [ ] Cambiar contraseña
- [ ] Eliminar cuenta (con confirmación)
- [ ] Exportar datos (GDPR)

**Notas Técnicas:**
- Tabla `user_profiles` separada de `users`
- Upload de imágenes a S3/R2
- Soft delete para cuentas eliminadas

**Prioridad:** P1 (pero necesario para otras features)
**Esfuerzo:** M (1-2 semanas)
**Dependencias:** US-050

---

### US-052: Favoritos y Marcadores

**Como** María (estudiante oposición)
**Quiero** guardar documentos importantes
**Para** volver a ellos fácilmente

**Criterios de Aceptación:**
- [ ] Botón favorito (estrella) en cada card y modal
- [ ] Click toggle favorito on/off
- [ ] Feedback visual inmediato
- [ ] Página `/favoritos` con todos guardados
- [ ] Ordenar por:
  - Fecha agregado
  - Fecha documento
  - Relevancia
- [ ] Buscar dentro de favoritos
- [ ] Eliminar de favoritos
- [ ] Contador: "X documentos guardados"
- [ ] Tier gratuito: máx 10 favoritos
- [ ] Tier Pro: ilimitado

**Notas Técnicas:**
- Tabla `favorites` (user_id, document_id, created_at)
- Optimistic UI updates
- Sincronización cuando online (PWA offline)

**Prioridad:** P0
**Esfuerzo:** S (1 semana)
**Dependencias:** US-050

---

## 🛠️ EPIC 6: HERRAMIENTAS PROFESIONALES

### US-060: Comparador de Versiones

**Como** Carlos (abogado)
**Quiero** ver qué cambió en una ley modificada
**Para** entender el impacto de las modificaciones

**Criterios de Aceptación:**
- [ ] Botón "Comparar versiones" en documentos modificados
- [ ] Selector de dos versiones a comparar
- [ ] Vista diff lado a lado (desktop) o apilada (móvil)
- [ ] Highlighting visual:
  - Verde: texto agregado
  - Rojo: texto eliminado
  - Amarillo: texto modificado
- [ ] Navegación entre cambios (anterior/siguiente)
- [ ] Contador: "X cambios encontrados"
- [ ] Exportar comparación como PDF
- [ ] Link shareable a comparación específica

**Notas Técnicas:**
- Algoritmo diff (google-diff-match-patch o jsdiff)
- Pre-computar diffs populares (background job)
- Caché de diffs en DB
- Componente `<DiffViewer>`

**Prioridad:** P0
**Esfuerzo:** L (3-4 semanas)
**Dependencias:** Acceso a versiones históricas API BOE

---

### US-061: Detector de Cambios Automático

**Como** Carlos (necesita estar actualizado)
**Quiero** recibir alertas cuando leyes que sigo sean modificadas
**Para** no perderme cambios importantes

**Criterios de Aceptación:**
- [ ] Botón "Seguir documento" en modal detalle
- [ ] Lista de documentos seguidos en `/seguimientos`
- [ ] CRON diario compara versiones
- [ ] Notificación si detecta cambio:
  - "La Ley X ha sido modificada"
  - Link a comparador con diff
  - Resumen de cambios principales con IA
- [ ] Tier gratuito: seguir 3 documentos
- [ ] Tier Pro: ilimitado + alertas multi-canal

**Notas Técnicas:**
- Tabla `document_follows` (user_id, document_id, last_checked)
- CRON job nocturno
- Almacenar hash de contenido para detectar cambios
- Queue de notificaciones

**Prioridad:** P0
**Esfuerzo:** L (2-3 semanas)
**Dependencias:** US-030, US-060

---

## 📱 EPIC 7: PWA Y MOBILE

### US-070: Progressive Web App

**Como** María (usa móvil principalmente)
**Quiero** instalar la app en mi teléfono
**Para** acceder rápidamente como app nativa

**Criterios de Aceptación:**
- [ ] manifest.json configurado correctamente
- [ ] Iconos PWA en todos los tamaños
- [ ] Instalable desde navegador (prompt)
- [ ] Launch como standalone app
- [ ] Splash screen con branding
- [ ] Service worker registrado
- [ ] Funciona offline (ver caché)
- [ ] Update prompt cuando nueva versión
- [ ] Probado en:
  - Chrome Android
  - Safari iOS
  - Edge Windows

**Notas Técnicas:**
- Vite PWA plugin
- Service worker con Workbox
- Estrategia cache-first para assets
- Network-first para API calls

**Prioridad:** P1 (pero importante para engagement)
**Esfuerzo:** L (2-3 semanas)
**Dependencias:** US-001, US-002

---

### US-071: Push Notifications Nativas

**Como** Carlos (Pro user)
**Quiero** recibir notificaciones push en mi dispositivo
**Para** estar al tanto sin abrir la app

**Criterios de Aceptación:**
- [ ] Permiso de notificaciones al activar alerta push
- [ ] Notificaciones estilo nativo del OS
- [ ] Click en notificación abre documento relevante
- [ ] Funciona con app cerrada
- [ ] Badge count en icono app
- [ ] Configuración granular (qué notificar)
- [ ] "Silenciar hasta..."
- [ ] Solo para tier Pro

**Notas Técnicas:**
- Firebase Cloud Messaging
- Push API del navegador
- Tabla `push_subscriptions`
- Endpoint `/api/push/subscribe`

**Prioridad:** P1
**Esfuerzo:** M (2 semanas)
**Dependencias:** US-031, US-070

---

## 📊 RESUMEN DE ESFUERZO

### Totales por Epic

| Epic | User Stories | Esfuerzo Total | Semanas Estimadas |
|------|--------------|----------------|-------------------|
| 1. Interfaz | 6 | 2L + 3M + 1S | 8-10 semanas |
| 2. Búsqueda | 4 | 1L + 3M + 1S | 6-8 semanas |
| 3. Contenido | 5 | 1L + 2M + 2S | 5-6 semanas |
| 4. Alertas | 2 | 1L + 1M | 4-5 semanas |
| 5. Usuarios | 3 | 3M + 1S | 4-5 semanas |
| 6. Herramientas | 2 | 2L | 5-6 semanas |
| 7. PWA | 2 | 1L + 1M | 4-5 semanas |

**Total: ~36-45 semanas** (para equipo de 1 dev full-time)

**Con 2 devs:** ~18-23 semanas (4.5-6 meses)
**Con 3 devs:** ~12-15 semanas (3-4 meses)

---

## 🎯 RECOMENDACIÓN DE IMPLEMENTACIÓN

### Enfoque Ágil (Sprints de 2 semanas)

**Sprint 1-2:** US-001, US-002 (Interfaz base)
**Sprint 3:** US-003, US-004, US-005 (Accesibilidad)
**Sprint 4-5:** US-010, US-011 (Búsqueda básica)
**Sprint 6:** US-020, US-023, US-024 (Cards y badges)
**Sprint 7-8:** US-021, US-022 (IA resúmenes)
**Sprint 9:** US-050, US-051, US-052 (Auth y perfil)
**Sprint 10-11:** US-030, US-031 (Alertas)
**Sprint 12:** US-012 (Búsqueda NLP)
**Sprint 13:** US-013 (Búsquedas guardadas)
**Sprint 14-15:** US-060, US-061 (Comparador)
**Sprint 16-17:** US-070, US-071 (PWA)

**Total: ~34 semanas (8.5 meses) con 2 devs**

---

## ✅ DEFINITION OF DONE

Cada User Story se considera DONE cuando:

- [ ] Código implementado y funcional
- [ ] Tests unitarios escritos (cobertura > 70%)
- [ ] Tests e2e de flujos críticos
- [ ] Documentación actualizada
- [ ] Revisión de código aprobada
- [ ] Accesibilidad validada (Axe)
- [ ] Responsive testeado (móvil + desktop)
- [ ] Performance OK (Lighthouse > 90)
- [ ] Deployed a staging
- [ ] Aprobado por Product Owner
- [ ] No bugs críticos pendientes

---

**Documento creado:** 24/11/2025
**Última actualización:** 24/11/2025
**Versión:** 1.0
