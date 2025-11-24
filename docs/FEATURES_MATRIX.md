# Matriz de Features - datosenabierto.es
## Planificación y Priorización de Funcionalidades

**Fecha:** 24 de Noviembre, 2025
**Basado en:** Análisis de investigación de usuarios y competencia

---

## 📋 METODOLOGÍA DE PRIORIZACIÓN

### Criterios de Evaluación

Cada feature se evalúa en:

1. **Impacto en Usuario** (1-5): Valor que aporta al usuario
2. **Diferenciación** (1-5): Nos distingue de competencia
3. **Complejidad Técnica** (1-5): Dificultad de implementación (inverso)
4. **Esfuerzo** (S/M/L/XL): Small, Medium, Large, Extra Large

### Fórmula de Prioridad

```
Score = (Impacto × 2) + Diferenciación - (Complejidad × 0.5)
```

### Categorías Resultantes

- **P0 - Must Have:** Features críticas para MVP mejorado
- **P1 - Should Have:** Importantes pero no bloqueantes
- **P2 - Nice to Have:** Mejoran experiencia pero pueden esperar
- **P3 - Future:** Visión a largo plazo

---

## 🎯 FEATURES IDENTIFICADAS

### CATEGORÍA: INTERFAZ Y EXPERIENCIA VISUAL

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F001 | **Rediseño UI completo** | Sistema de diseño moderno, limpio y profesional | 5 | 3 | 3 | 11.5 | P0 | L |
| F002 | **Mobile-first responsive** | Optimización total para móviles y tablets | 5 | 2 | 2 | 11 | P0 | M |
| F003 | **Dark Mode** | Tema oscuro para reducir fatiga visual | 3 | 2 | 1 | 7.5 | P1 | S |
| F004 | **Animaciones suaves** | Transiciones y micro-interacciones | 2 | 1 | 2 | 4 | P2 | S |
| F005 | **Modo lectura** | Vista simplificada para lectura de documentos | 4 | 3 | 2 | 10 | P1 | M |
| F006 | **Personalización visual** | Usuario elige tamaño de fuente, espaciado | 3 | 2 | 1 | 7.5 | P2 | S |

### CATEGORÍA: BÚSQUEDA Y FILTRADO

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F007 | **Búsqueda facetada** | Filtros múltiples por sección, tipo, fecha, etc | 5 | 4 | 3 | 12.5 | P0 | M |
| F008 | **Autocomplete inteligente** | Sugerencias mientras escribes | 4 | 3 | 2 | 10 | P0 | M |
| F009 | **Búsqueda por intención** | "ayudas para emprendedores" → resultados relevantes | 5 | 5 | 4 | 13 | P0 | L |
| F010 | **Búsqueda por voz** | Input de voz para búsquedas | 3 | 4 | 3 | 8.5 | P2 | M |
| F011 | **Búsquedas guardadas** | Guardar y ejecutar búsquedas recurrentes | 4 | 2 | 1 | 9.5 | P1 | S |
| F012 | **Historial de búsquedas** | Ver y repetir búsquedas anteriores | 3 | 1 | 1 | 6.5 | P1 | S |
| F013 | **Búsqueda avanzada** | Operadores booleanos, rangos, wildcards | 4 | 2 | 2 | 9 | P1 | M |
| F014 | **"Trending" searches** | Búsquedas populares del momento | 3 | 3 | 1 | 8.5 | P1 | M |

### CATEGORÍA: VISUALIZACIÓN DE CONTENIDO

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F015 | **Cards informativas mejoradas** | Diseño tipo tarjeta con iconografía clara | 5 | 3 | 1 | 12.5 | P0 | M |
| F016 | **Vista previa inline** | Ver resumen sin abrir modal | 4 | 2 | 2 | 9 | P1 | M |
| F017 | **Breadcrumbs mejorados** | Navegación clara de ubicación | 3 | 1 | 1 | 6.5 | P0 | S |
| F018 | **Badges visuales** | Etiquetas de tipo, urgencia, novedad | 4 | 2 | 1 | 9.5 | P0 | S |
| F019 | **Iconografía consistente** | Iconos para cada tipo de documento | 3 | 1 | 1 | 6.5 | P0 | S |
| F020 | **Destacados y "nuevo"** | Marcar contenido reciente o importante | 4 | 2 | 1 | 9.5 | P1 | S |
| F021 | **Vista de lista vs grid** | Usuario elige cómo ver resultados | 2 | 1 | 1 | 4.5 | P2 | S |
| F022 | **Infinite scroll** | Carga progresiva de resultados | 3 | 1 | 2 | 6 | P1 | S |

### CATEGORÍA: CONTENIDO Y COMPRENSIÓN

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F023 | **Resúmenes automáticos IA** | Resumen de cada documento en lenguaje claro | 5 | 5 | 4 | 13 | P0 | L |
| F024 | **Puntos clave destacados** | Bullet points de lo más importante | 5 | 4 | 3 | 12.5 | P0 | M |
| F025 | **Glosario jurídico** | Términos técnicos explicados | 4 | 3 | 2 | 9 | P1 | M |
| F026 | **"¿Cómo me afecta?"** | IA explica impacto personalizado | 5 | 5 | 4 | 13 | P1 | XL |
| F027 | **Contexto histórico** | Explicación de antecedentes | 3 | 3 | 3 | 7.5 | P2 | L |
| F028 | **Documentos relacionados** | "Ver también" inteligente | 4 | 3 | 2 | 9 | P1 | M |
| F029 | **Nivel de lectura ajustable** | Técnico / Normal / Simple | 4 | 4 | 3 | 10.5 | P2 | L |
| F030 | **Traducción a idiomas** | Catalán, Euskera, Gallego, Inglés | 3 | 3 | 3 | 7.5 | P2 | L |

### CATEGORÍA: ALERTAS Y NOTIFICACIONES

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F031 | **Sistema de alertas mejorado** | UI clara para configurar alertas | 5 | 3 | 2 | 11 | P0 | M |
| F032 | **Alertas multi-canal** | Email, SMS, Telegram, Push | 5 | 5 | 3 | 13.5 | P0 | L |
| F033 | **Alertas inteligentes** | IA filtra solo lo realmente relevante | 5 | 5 | 4 | 13 | P1 | XL |
| F034 | **Alertas con resumen** | Notificación incluye resumen del cambio | 4 | 3 | 2 | 9 | P1 | M |
| F035 | **Digest diario/semanal** | Resumen periódico personalizado | 4 | 3 | 2 | 9 | P1 | M |
| F036 | **Alertas de vencimiento** | Recordatorio de plazos importantes | 5 | 4 | 2 | 12 | P1 | M |
| F037 | **Prioridad de alertas** | Alta/Media/Baja según configuración | 3 | 2 | 1 | 7.5 | P1 | S |
| F038 | **Snooze notifications** | Posponer alertas temporalmente | 2 | 1 | 1 | 4.5 | P2 | S |

### CATEGORÍA: ANÁLISIS Y HERRAMIENTAS PRO

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F039 | **Comparador de versiones** | Diff visual de cambios en leyes | 5 | 5 | 3 | 13.5 | P0 | L |
| F040 | **Timeline de cambios** | Historial visual de modificaciones | 4 | 4 | 3 | 10.5 | P1 | M |
| F041 | **Exportación avanzada** | PDF, Word, Markdown, JSON | 4 | 2 | 2 | 9 | P1 | M |
| F042 | **Anotaciones personales** | Notas y highlights del usuario | 4 | 3 | 2 | 9 | P1 | M |
| F043 | **Generador de citas** | Formato APA, ISO, etc automático | 3 | 2 | 2 | 7 | P2 | S |
| F044 | **Compartir con tracking** | URL única con estadísticas | 2 | 2 | 1 | 5.5 | P2 | S |
| F045 | **Análisis de impacto** | Qué sectores/grupos afecta una ley | 4 | 4 | 4 | 10 | P2 | XL |
| F046 | **Detector de cambios** | Alerta automática al modificarse ley seguida | 5 | 4 | 3 | 12.5 | P1 | L |

### CATEGORÍA: DASHBOARDS Y ESTADÍSTICAS

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F047 | **Dashboard personal** | "Mi BOE" personalizado | 4 | 3 | 2 | 9 | P1 | M |
| F048 | **Estadísticas públicas** | Visualización de datos BOE agregados | 3 | 4 | 2 | 9 | P1 | L |
| F049 | **Gráficos interactivos** | Chart.js visualizaciones | 3 | 3 | 2 | 8 | P1 | M |
| F050 | **Análisis temporal** | Tendencias de legislación por tiempo | 3 | 4 | 3 | 8.5 | P2 | L |
| F051 | **Heatmap de actividad** | Qué días/meses más publicaciones | 2 | 3 | 2 | 6 | P2 | M |
| F052 | **Métricas secciones** | Estadísticas por sección BOE | 3 | 2 | 2 | 7 | P2 | M |

### CATEGORÍA: USUARIO Y PERSONALIZACIÓN

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F053 | **Registro de usuarios** | Sistema de auth (email, social) | 4 | 2 | 2 | 9 | P0 | M |
| F054 | **Perfil personalizable** | Intereses, sector, profesión | 4 | 2 | 1 | 9.5 | P1 | M |
| F055 | **Favoritos/Marcadores** | Guardar documentos importantes | 5 | 2 | 1 | 11.5 | P0 | S |
| F056 | **Colecciones** | Organizar marcadores en carpetas | 3 | 2 | 1 | 7.5 | P1 | M |
| F057 | **Historial de lectura** | Qué has visto recientemente | 3 | 1 | 1 | 6.5 | P1 | S |
| F058 | **Feed personalizado** | Homepage basada en intereses | 4 | 3 | 3 | 9.5 | P1 | L |
| F059 | **Recomendaciones IA** | "Puede interesarte" basado en ML | 3 | 4 | 4 | 9 | P2 | XL |
| F060 | **Sincronización multi-dispositivo** | Datos del usuario en la nube | 3 | 2 | 2 | 7 | P1 | M |

### CATEGORÍA: SOCIAL Y COMUNIDAD

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F061 | **Sistema de comentarios** | Discusión moderada por documento | 3 | 4 | 3 | 8.5 | P2 | L |
| F062 | **Valoraciones** | Like/útil en documentos | 2 | 2 | 1 | 5.5 | P2 | S |
| F063 | **Compartir en RRSS** | Preview cards optimizadas | 3 | 2 | 1 | 7.5 | P1 | S |
| F064 | **Preguntas frecuentes** | Q&A por documento | 3 | 3 | 2 | 8 | P2 | M |
| F065 | **Expertos verificados** | Badges para profesionales | 2 | 3 | 2 | 6 | P3 | M |
| F066 | **Seguir topics** | Notificaciones de discusiones | 2 | 2 | 2 | 5 | P3 | M |

### CATEGORÍA: ACCESIBILIDAD

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F067 | **WCAG 2.1 AA completo** | Cumplimiento total accesibilidad | 5 | 2 | 2 | 11 | P0 | M |
| F068 | **Alto contraste** | Modo alto contraste | 4 | 1 | 1 | 8.5 | P0 | S |
| F069 | **Navegación por teclado** | Shortcuts y accesibilidad teclado | 4 | 1 | 1 | 8.5 | P0 | M |
| F070 | **Screen reader optimizado** | ARIA labels completos | 4 | 1 | 1 | 8.5 | P0 | M |
| F071 | **Lectura fácil** | Versiones simplificadas | 4 | 3 | 3 | 9.5 | P1 | L |
| F072 | **Ajuste de tipografía** | Tamaño, tipo, espaciado | 3 | 1 | 1 | 6.5 | P1 | S |
| F073 | **Audio narración** | TTS de documentos | 3 | 3 | 3 | 7.5 | P2 | L |

### CATEGORÍA: PERFORMANCE Y TÉCNICO

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F074 | **PWA** | Instalable, offline-capable | 4 | 4 | 2 | 11 | P1 | L |
| F075 | **Push notifications nativas** | Notificaciones OS-level | 4 | 3 | 2 | 9 | P1 | M |
| F076 | **Caché inteligente** | Service worker avanzado | 4 | 2 | 2 | 9 | P1 | M |
| F077 | **Lazy loading agresivo** | Carga diferida de todo | 3 | 1 | 1 | 6.5 | P1 | M |
| F078 | **Image optimization** | WebP, responsive images | 3 | 1 | 1 | 6.5 | P1 | S |
| F079 | **CDN** | Distribución global de assets | 3 | 1 | 1 | 6.5 | P1 | S |
| F080 | **API pública v1** | API RESTful documentada | 4 | 4 | 2 | 11 | P2 | L |
| F081 | **Rate limiting** | Protección contra abuse | 3 | 2 | 1 | 7.5 | P1 | S |
| F082 | **Logging y analytics** | Telemetría para mejoras | 3 | 1 | 1 | 6.5 | P1 | M |

### CATEGORÍA: EDUCACIÓN Y AYUDA

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F083 | **Onboarding interactivo** | Tour guiado para nuevos usuarios | 4 | 3 | 1 | 10.5 | P1 | M |
| F084 | **Tutoriales en contexto** | Ayuda contextual donde se necesita | 3 | 2 | 1 | 7.5 | P1 | M |
| F085 | **Centro de ayuda** | Documentación completa | 4 | 2 | 1 | 9.5 | P1 | M |
| F086 | **Video tutoriales** | Screencasts de funcionalidades | 3 | 2 | 2 | 7 | P2 | L |
| F087 | **Chatbot básico** | FAQ automatizado | 3 | 3 | 3 | 7.5 | P2 | M |
| F088 | **Chatbot IA avanzado** | Asistente conversacional | 4 | 5 | 4 | 11 | P2 | XL |
| F089 | **Blog educativo** | Artículos sobre cómo usar BOE | 3 | 2 | 1 | 7.5 | P2 | M |
| F090 | **Webinars** | Sesiones en vivo de formación | 2 | 2 | 2 | 5 | P3 | L |

### CATEGORÍA: MONETIZACIÓN (Freemium)

| # | Feature | Descripción | Impacto | Dif | Comp | Score | Prior | Esfuerzo |
|---|---------|-------------|---------|-----|------|-------|-------|----------|
| F091 | **Tier gratuito robusto** | Features básicas sin límites | 5 | 3 | 1 | 12.5 | P0 | - |
| F092 | **Tier Pro individual** | Suscripción €9.99/mes | 3 | 3 | 2 | 8 | P2 | M |
| F093 | **Tier Enterprise** | Custom pricing para empresas | 2 | 3 | 2 | 6 | P3 | L |
| F094 | **Paywall claro** | Indicadores de features premium | 3 | 1 | 1 | 6.5 | P2 | S |
| F095 | **Trial premium** | 14 días gratis de Pro | 3 | 2 | 1 | 7.5 | P2 | S |
| F096 | **Facturación automática** | Stripe/PayPal integration | 2 | 2 | 2 | 5 | P2 | M |

---

## 📊 PRIORIZACIÓN FINAL

### P0 - MUST HAVE (MVP Mejorado)

**Total: 25 features**

| Feature | Score | Esfuerzo | Descripción |
|---------|-------|----------|-------------|
| F009 | 13.0 | L | Búsqueda por intención |
| F032 | 13.5 | L | Alertas multi-canal |
| F039 | 13.5 | L | Comparador de versiones |
| F023 | 13.0 | L | Resúmenes automáticos IA |
| F033 | 13.0 | XL | Alertas inteligentes |
| F007 | 12.5 | M | Búsqueda facetada |
| F015 | 12.5 | M | Cards informativas mejoradas |
| F024 | 12.5 | M | Puntos clave destacados |
| F046 | 12.5 | L | Detector de cambios |
| F091 | 12.5 | - | Tier gratuito robusto |
| F001 | 11.5 | L | Rediseño UI completo |
| F055 | 11.5 | S | Favoritos/Marcadores |
| F002 | 11.0 | M | Mobile-first responsive |
| F031 | 11.0 | M | Sistema de alertas mejorado |
| F067 | 11.0 | P0 | WCAG 2.1 AA completo |
| F074 | 11.0 | L | PWA |
| F008 | 10.0 | M | Autocomplete inteligente |
| F018 | 9.5 | S | Badges visuales |
| F020 | 9.5 | S | Destacados y "nuevo" |
| F053 | 9.0 | M | Registro de usuarios |
| F054 | 9.5 | M | Perfil personalizable |
| F068 | 8.5 | S | Alto contraste |
| F069 | 8.5 | M | Navegación por teclado |
| F070 | 8.5 | M | Screen reader optimizado |
| F019 | 6.5 | S | Iconografía consistente |
| F017 | 6.5 | S | Breadcrumbs mejorados |

**Esfuerzo total P0:** ~5-7 meses con equipo de 2-3 devs

### P1 - SHOULD HAVE (Post-MVP)

**Total: 35 features** - No listo todas pero incluyen:
- F003: Dark Mode
- F005: Modo lectura
- F011: Búsquedas guardadas
- F028: Documentos relacionados
- F034: Alertas con resumen
- F040: Timeline de cambios
- F047: Dashboard personal
- F048: Estadísticas públicas
- F056: Colecciones
- F075: Push notifications nativas
- F083: Onboarding interactivo
- Etc.

### P2 - NICE TO HAVE (Futuro cercano)

**Total: 22 features**

### P3 - FUTURE (Visión largo plazo)

**Total: 8 features**

---

## 🎯 ROADMAP PROPUESTO

### SPRINT 0: Setup (2 semanas)
- Configuración del proyecto mejorado
- Sistema de diseño base
- CI/CD pipeline

### FASE 1: UI Foundation (4-6 semanas)
**Features:** F001, F002, F015, F017, F018, F019, F053, F067, F068, F069, F070

**Objetivo:** Nueva UI moderna y accesible
- Rediseño completo de interfaz
- Sistema de diseño implementado
- Responsive mobile-first
- Accesibilidad WCAG 2.1 AA
- Sistema de usuarios básico

### FASE 2: Search & Discovery (4-6 semanas)
**Features:** F007, F008, F009, F011, F055

**Objetivo:** Búsqueda potente e intuitiva
- Búsqueda facetada
- Autocomplete
- Búsqueda por intención (NLP)
- Búsquedas guardadas
- Favoritos

### FASE 3: Content Understanding (6-8 semanas)
**Features:** F023, F024, F028, F054

**Objetivo:** Hacer el contenido comprensible
- Resúmenes automáticos con IA
- Puntos clave destacados
- Documentos relacionados
- Perfiles personalizados

### FASE 4: Alerts & Notifications (4-6 semanas)
**Features:** F031, F032, F034, F036, F037

**Objetivo:** Sistema de alertas avanzado
- UI de configuración de alertas
- Multi-canal (Email, SMS, Telegram, Push)
- Alertas con resumen
- Alertas de vencimiento

### FASE 5: Pro Tools (6-8 semanas)
**Features:** F039, F040, F041, F042, F046

**Objetivo:** Herramientas profesionales
- Comparador de versiones
- Timeline de cambios
- Exportación avanzada
- Anotaciones
- Detector de cambios automático

### FASE 6: Progressive Enhancement (4-6 semanas)
**Features:** F074, F075, F076, F083, F091

**Objetivo:** PWA y monetización
- PWA completa
- Push notifications nativas
- Caché inteligente
- Onboarding
- Estructura freemium

### FASE 7: Analytics & Insights (4-6 semanas)
**Features:** F047, F048, F049, F080

**Objetivo:** Dashboards y API pública
- Dashboard personal
- Estadísticas públicas
- Visualizaciones
- API pública v1

---

## 💰 MODELO FREEMIUM DETALLADO

### Tier GRATUITO (Forever Free)

**Búsqueda y Consulta:**
- ✅ Búsqueda ilimitada
- ✅ Búsqueda facetada
- ✅ Autocomplete
- ✅ 3 búsquedas guardadas
- ✅ Historial 30 días

**Contenido:**
- ✅ Visualización completa
- ✅ Resúmenes básicos IA (5/día)
- ✅ Puntos clave
- ✅ Documentos relacionados

**Alertas:**
- ✅ 3 alertas email
- ❌ SMS, Telegram, Push

**Herramientas:**
- ✅ 10 favoritos
- ✅ Exportar PDF básico
- ❌ Comparador versiones
- ❌ Anotaciones

**Experiencia:**
- ⚠️ Anuncios discretos
- ✅ Soporte comunidad

### Tier PRO (€9.99/mes o €99/año)

**Todo lo de Gratuito +**

**Búsqueda y Consulta:**
- ✅ Búsquedas guardadas ilimitadas
- ✅ Historial completo

**Contenido:**
- ✅ Resúmenes IA ilimitados
- ✅ "¿Cómo me afecta?" personalizado
- ✅ Glosario expandido

**Alertas:**
- ✅ Alertas ilimitadas
- ✅ Multi-canal (Email, SMS, Telegram, Push)
- ✅ Alertas inteligentes con IA
- ✅ Digest personalizado

**Herramientas:**
- ✅ Favoritos ilimitados
- ✅ Colecciones organizadas
- ✅ Comparador de versiones
- ✅ Timeline completo
- ✅ Anotaciones y highlights
- ✅ Exportar Word, Markdown, JSON
- ✅ Detector de cambios automático

**Experiencia:**
- ✅ Sin anuncios
- ✅ Soporte prioritario email
- ✅ Dashboard avanzado
- ✅ API access (1000 calls/día)

### Tier ENTERPRISE (Custom)

**Todo lo de Pro +**

- ✅ API dedicada con SLA
- ✅ White label disponible
- ✅ Integración SSO
- ✅ Dashboard empresarial
- ✅ Onboarding personalizado
- ✅ Soporte telefónico
- ✅ Account manager
- ✅ Reportes personalizados
- ✅ Webhooks
- ✅ Bulk operations

**Precio:** Desde €499/mes (según volumen)

---

## 📝 NOTAS TÉCNICAS

### Dependencias Tecnológicas

**Para implementar P0 necesitamos:**

1. **NLP/IA:**
   - API OpenAI / Anthropic para resúmenes
   - O modelo open source (Llama, Mistral) self-hosted
   - spaCy para procesamiento español

2. **Búsqueda:**
   - Elasticsearch o Meilisearch
   - Vector search para búsqueda semántica

3. **Notificaciones:**
   - Twilio para SMS
   - Telegram Bot API
   - Firebase Cloud Messaging para push
   - SendGrid para email

4. **Storage:**
   - PostgreSQL para datos estructurados
   - Redis para caché
   - S3/R2 para archivos

5. **Auth:**
   - Supabase Auth o Auth0
   - Social login (Google, GitHub)

### Consideraciones

- **Costos IA:** Resúmenes pueden ser costosos. Considerar caché agresivo.
- **Rate Limits API BOE:** Necesitamos scraping + caché propio
- **Legal:** Terms of service claros sobre uso de datos BOE
- **GDPR:** Cumplimiento total para datos de usuarios

---

## ✅ PRÓXIMOS PASOS

1. ✅ Investigación completada
2. ✅ Features definidas y priorizadas
3. 🔄 **Crear user stories detalladas** (siguiente)
4. ⏳ Wireframes y diseños
5. ⏳ Arquitectura técnica
6. ⏳ Comenzar implementación Fase 1

---

**Documento creado:** 24/11/2025
**Última actualización:** 24/11/2025
**Versión:** 1.0
