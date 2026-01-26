# Análisis de Investigación - datosenabierto.es
## Mejora de Plataforma BOE para Ciudadanos

**Fecha:** 24 de Noviembre, 2025
**Objetivo:** Investigación exhaustiva de usuarios, necesidades y oportunidades de mejora

---

## 📊 RESUMEN EJECUTIVO

Este documento contiene los hallazgos de una investigación profunda sobre usuarios del BOE (Boletín Oficial del Estado), sus necesidades, pain points y oportunidades de mejora para transformar datosenabierto.es en una plataforma verdaderamente útil y diferenciada.

### Hallazgos Clave

1. **Usuarios muy diversos:** Desde ciudadanos ocasionales hasta profesionales del derecho
2. **Pain points principales:** Complejidad de búsqueda, lenguaje técnico, falta de contexto
3. **Oportunidad detectada:** Nueva competencia (Justicio) con enfoque en UX moderna
4. **Tecnología disponible:** APIs oficiales + NLP + IA para análisis legal en español
5. **Gap en mercado:** Alertas personalizadas avanzadas, comparación de versiones, resúmenes automáticos

---

## 👥 PERFILES DE USUARIOS

### 1. Ciudadanos Generales (40% estimado)

**Características:**
- Consulta ocasional (1-5 veces al año)
- Sin conocimientos jurídicos profundos
- Buscan información específica puntual

**Casos de uso principales:**
- **Oposiciones**: Búsqueda de convocatorias y bases de examen
- **Ayudas y subvenciones**: Becas, premios, subsidios
- **Normativa personal**: Cambios que afectan su situación (impuestos, permisos, etc.)
- **Curiosidad cívica**: Leyes de actualidad en noticias

**Pain points:**
- No entienden la estructura del BOE (secciones, códigos)
- Lenguaje técnico-jurídico intimidante
- No saben cómo hacer búsquedas efectivas
- Dificultad para saber si algo les afecta directamente

**Necesitan:**
- Lenguaje claro y explicaciones
- Búsqueda por intención ("¿hay ayudas para emprendedores?")
- Resúmenes en lenguaje simple
- Alertas sobre temas que les interesan

### 2. Profesionales Jurídicos (30% estimado)

**Características:**
- Abogados, procuradores, juristas
- Uso diario o semanal
- Necesitan información precisa y rápida

**Casos de uso principales:**
- Búsqueda de legislación consolidada
- Seguimiento de cambios normativos
- Consulta de jurisprudencia relacionada
- Preparación de casos y argumentos

**Pain points:**
- Pérdida de tiempo en búsquedas repetitivas
- Dificultad para trackear cambios en leyes
- Necesidad de comparar versiones
- Falta de integración con herramientas de trabajo

**Necesitan:**
- Búsqueda avanzada potente
- Sistema de alertas sofisticado
- Comparador de versiones de leyes
- Exportación de datos (PDF, Word, citas)
- Timeline de cambios legislativos

### 3. Empresas y Autónomos (20% estimado)

**Características:**
- Departamentos legales/RR.HH.
- Asesorías y gestorías
- Uso regular (semanal)

**Casos de uso principales:**
- Concursos públicos y licitaciones
- Subvenciones para empresas
- Cambios laborales y fiscales
- Nombramientos de cargos públicos

**Pain points:**
- Necesitan información agregada de múltiples boletines
- Tiempo crítico para responder a convocatorias
- Dificultad para detectar oportunidades relevantes
- Volumen alto de información irrelevante

**Necesitan:**
- Filtros muy específicos por sector/actividad
- Alertas instantáneas con plazos
- Dashboard empresarial con métricas
- API para integración con sistemas internos

### 4. Estudiantes e Investigadores (10% estimado)

**Características:**
- Estudiantes de derecho, ciencias políticas
- Investigadores académicos
- Periodistas especializados

**Casos de uso principales:**
- Análisis histórico de legislación
- Estudio de tendencias normativas
- Investigación de políticas públicas
- Datos para artículos y tesis

**Pain points:**
- Dificultad para análisis cuantitativo
- Falta de herramientas de visualización
- No hay datos históricos fácilmente accesibles
- Exportación limitada para análisis

**Necesitan:**
- Gráficos y estadísticas
- Exportación de datasets
- Análisis de tendencias temporales
- Comparativas entre periodos

---

## 🔍 ANÁLISIS DE COMPETENCIA

### BOE Oficial (boe.es)

**Fortalezas:**
- Fuente oficial y única de verdad
- Histórico completo desde 1661
- API de datos abiertos disponible
- Legislación consolidada
- Servicio "Mi BOE" con alertas básicas

**Debilidades:**
- UI/UX anticuada y poco intuitiva
- Búsqueda compleja para usuarios no técnicos
- Solo alertas por email/RSS
- Sin resúmenes ni contexto
- Carga lenta y pesada
- Accesibilidad parcial (cumplimiento limitado)
- Sin móvil-first design

**Valoración usuarios:** 2.5/5 (estimado basado en quejas recurrentes)

### Justicio (justicio.es/boe) - ⚠️ COMPETIDOR EMERGENTE

**Lanzado:** 2025 (beta desde 9 meses antes)
**Modelo:** Gratuito, sin registro

**Características destacadas:**
- UI moderna y visual
- "BOE vitaminado" - Interpretación semántica
- Dashboard con información clave
- Organización por tipos, secciones y áreas
- Sin barreras técnicas
- Desarrollado por legaltech (Little John)

**Estrategia:**
- Enfoque en profesionales jurídicos
- Simplificación radical de la UX
- Gratuidad como gancho (monetización futura probable)

**Impacto para nosotros:**
- Han validado que hay mercado para "BOE mejorado"
- Demuestran que UI/UX es factor crítico
- Ya están capturando early adopters
- Necesitamos diferenciarnos con features únicas

### Plataformas Jurídicas de Pago

**vLex, Aranzadi, Tirantonline, NEO (Lefebvre)**

**Características:**
- Integran BOE + jurisprudencia + doctrina
- IA para análisis legal (Vincent AI, GenIA-L, K+)
- Comparadores de versiones avanzados
- Resúmenes automáticos
- Precio: €50-200+/mes

**Por qué no son amenaza directa:**
- Enfocados en profesionales de pago
- Demasiado complejos para ciudadano medio
- Caros para uso ocasional
- No optimizados para móvil

**Oportunidad:**
- Podemos tomar sus mejores ideas
- Ofrecerlas gratis con freemium model
- Democratizar acceso a herramientas pro

### Otras herramientas detectadas

**BOE Comparador** (Extensión Chrome gratuita)
- Compara versiones de artículos modificados
- Muestra diff visual estilo GitHub
- Open source (migohe14)
- Muy específico pero útil

**JurisTracker** (Servicio de pago)
- Alertas automáticas de cambios en leyes
- Comparación personalizada de versiones
- Resúmenes de cambios

---

## 📱 CASOS DE USO MÁS FRECUENTES

### Ranking de búsquedas más comunes:

1. **Oposiciones y concursos** (Section II-B)
   - Convocatorias de empleo público
   - Listas de admitidos/excluidos
   - Fechas de exámenes
   - Resultados

2. **Subvenciones y ayudas** (Section III y V)
   - Becas de estudio
   - Ayudas para emprendedores
   - Subvenciones I+D
   - Premios y concursos

3. **Legislación general** (Section I)
   - Leyes orgánicas nuevas
   - Real decretos
   - Órdenes ministeriales
   - Cambios fiscales

4. **Nombramientos** (Section II-A)
   - Cargos públicos
   - Funcionarios de alto nivel

5. **Licitaciones públicas**
   - Concursos de obra pública
   - Contratos de servicios

### Flujo de usuario típico:

1. **Trigger:** Necesidad específica o curiosidad
2. **Búsqueda:** Intento de encontrar información
3. **Frustración:** No encuentra o no entiende
4. **Abandono o persistencia:** Muchos abandonan
5. **Lectura superficial:** Los que persisten leen por encima
6. **Descarga PDF:** Para leer con calma después
7. **No vuelven a visitar:** Hasta próxima necesidad

**💡 Oportunidad:** Convertir el flujo en experiencia satisfactoria y crear hábito de visita

---

## 💔 PAIN POINTS IDENTIFICADOS

### Problemas de Usabilidad

1. **Búsqueda ineficiente**
   - Búsqueda por texto libre da miles de resultados
   - Sin sugerencias de búsqueda
   - No distingue entre tipos de documentos
   - Sin búsqueda por intención

2. **Navegación confusa**
   - Estructura jerárquica no intuitiva
   - Muchos clics para llegar al contenido
   - Breadcrumbs poco claros
   - No hay "navegación facetada"

3. **Sobrecarga de información**
   - Páginas densas con mucho texto
   - Sin jerarquía visual clara
   - Todo tiene el mismo peso visual
   - No hay resúmenes ejecutivos

4. **Lenguaje complejo**
   - Jerga jurídica sin explicaciones
   - Acrónimos sin expandir
   - Referencias cruzadas confusas
   - Sin contexto para no expertos

### Problemas Funcionales

5. **Alertas limitadas**
   - Solo email y RSS
   - No hay alertas por SMS/Telegram/WhatsApp
   - Configuración poco flexible
   - Sin priorización de alertas
   - Notificaciones genéricas sin contexto

6. **Sin análisis ni contexto**
   - No hay resúmenes
   - No explica impacto de cambios
   - Sin timeline de evolución
   - No relaciona documentos conectados

7. **Difícil seguimiento temporal**
   - No se puede ver "qué cambió"
   - Sin comparadores de versiones
   - Historial fragmentado
   - Difícil ver evolución de una ley

8. **Experiencia móvil deficiente**
   - No responsive en muchas secciones
   - PDFs ilegibles en móvil
   - Sin app nativa
   - Carga lenta en 3G/4G

### Problemas de Accesibilidad

9. **Accesibilidad parcial**
   - Cumplimiento limitado WCAG 2.1
   - Documentos históricos no accesibles
   - Sin lectura fácil
   - Contraste de colores bajo en algunas secciones

10. **Barrera tecnológica**
    - Requiere conocimiento técnico
    - No hay onboarding
    - Sin ayuda contextual
    - Curva de aprendizaje alta

---

## 🚀 TECNOLOGÍAS Y APIS DISPONIBLES

### APIs Oficiales

**1. API BOE Datos Abiertos**
- **URL:** `https://boe.es/datosabiertos/api/`
- **Documentación:** https://www.boe.es/datosabiertos/api/api.php
- **Endpoints:**
  - `/boe/sumario/[YYYYMMDD]` - Sumario diario
  - `/boe/dias/[YYYYMMDD]/[seccion]/[codigo]` - Documento específico
  - Legislación consolidada API disponible
- **Formato:** JSON, XML
- **Límites:** Sin rate limit documentado públicamente
- **Estado:** Estable y mantenida

**2. API datos.gob.es**
- **URL:** https://datos.gob.es/en/apidata
- Portal general de datos abiertos del gobierno
- Múltiples datasets disponibles
- Algunos datasets pueden complementar información BOE

### Tecnologías NLP para Español

**1. MarIA (GPT Español)**
- Primera IA masiva en español
- Generación y resumen de textos
- Desarrollada por BSC (Barcelona Supercomputing Center)
- Puede usarse para resumir documentos legales

**2. Bibliotecas NLP**
- **spaCy:** Modelos pre-entrenados en español
- **NLTK:** Análisis de texto
- **Hugging Face Transformers:** Modelos BERT/GPT en español
- **fastText:** Clasificación de texto

**3. Servicios de IA Legal Comerciales**
- **Vincent AI (vLex):** API de análisis legal
- **GenIA-L (Lefebvre):** Generación y análisis
- Costosos pero posible integración futura

### Proyectos Open Source Relevantes

**1. BOE_Extractor**
- GitHub: Proyecto de extracción automática BOE
- Web scraping + NLP
- Referencia: https://riunet.upv.es/entities/publication/071e8701-b582-4ad2-b3f8-1e9fc51e0e8e

**2. BOE Comparador**
- GitHub: https://github.com/migohe14/BOE-Comparador
- Extensión Chrome open source
- Compara versiones de leyes
- Código reutilizable

**3. eGov España**
- GitHub: https://github.com/palmerabollo/egov
- API abierto de acceso a datos públicos
- Ejemplos de integración

### Servicios Complementarios Posibles

**1. Servicios de Notificación**
- **Twilio:** SMS programáticos
- **Telegram Bot API:** Bots de alertas
- **Firebase Cloud Messaging:** Push notifications
- **SendGrid/Mailgun:** Email transaccional

**2. Análisis y Visualización**
- **Chart.js / D3.js:** Gráficos interactivos
- **Apache ECharts:** Visualizaciones complejas
- **Plotly:** Dashboards analíticos

**3. OCR y Procesamiento de PDFs**
- **pdf.js:** Visualización web de PDFs
- **Tesseract.js:** OCR en navegador
- **pdf-parse:** Extracción de texto

**4. Búsqueda Avanzada**
- **Algolia:** Búsqueda instantánea
- **Elasticsearch:** Búsqueda full-text potente
- **Meilisearch:** Alternativa ligera y rápida

---

## 🎨 INSIGHTS DE DISEÑO UX

### Normativa de Accesibilidad (Obligatoria)

**Real Decreto 1112/2018**
- Transposición Directiva EU 2016/2102
- Basado en WCAG 2.1 nivel AA
- **Fecha límite:** Ya vigente
- **Penalizaciones:** Por incumplimiento grave

**Ley Europea de Accesibilidad 2025**
- Aplicable desde junio 2025
- Amplía a tiendas online, banca, audiovisual
- Mayor exigencia en accesibilidad móvil

### Principios UX para Portales Gubernamentales

**Basados en mejores prácticas españolas:**

1. **Claridad sobre complejidad**
   - Lenguaje llano (plain language)
   - Jerarquía visual clara
   - Menos es más

2. **Acceso sin barreras**
   - Sin registro obligatorio para consulta básica
   - Navegación por teclado
   - Compatible con lectores de pantalla
   - Alto contraste

3. **Mobile-first**
   - 60%+ de accesos desde móvil (estimado)
   - Touch-friendly
   - Carga rápida en conexiones lentas

4. **Progresive disclosure**
   - Mostrar lo esencial primero
   - Detalles bajo demanda
   - No abrumar al usuario

5. **Transparencia y confianza**
   - Indicar fuente oficial
   - Fechas de actualización visibles
   - Sin publicidad engañosa
   - Políticas de privacidad claras

### Insights de Justicio (Competidor)

**Qué están haciendo bien:**
- Dashboard informativo en homepage
- Organización visual por categorías
- Sin registro obligatorio
- Carga rápida
- Interpretación semántica ("traducción" de jerga)

**Qué podemos hacer mejor:**
- Más features (ellos están en básico)
- Comunidad y socialización
- Personalización avanzada
- Herramientas pro para profesionales
- Gamificación para engagement

---

## 💎 OPORTUNIDADES IDENTIFICADAS

### Oportunidades de Diferenciación

**1. Hub de Conocimiento Ciudadano**
- No solo consulta sino educación
- Explicaciones de procesos administrativos
- Tutoriales de "cómo hacer X"
- Glosario jurídico accesible

**2. Comunidad y Social**
- Sistema de comentarios moderado
- Marcadores públicos/privados
- Compartir en RRSS con preview
- "Trending" - Lo más consultado hoy

**3. Personalización Inteligente**
- Perfil de usuario con intereses
- Feed personalizado tipo "Tu BOE"
- ML para recomendar contenido relevante
- Historial de búsquedas con insights

**4. Herramientas Pro (Freemium)**
- Alertas avanzadas (SMS, Telegram, WhatsApp)
- Comparador de versiones ilimitado
- Exportación en múltiples formatos
- API access para desarrolladores
- Sin ads en versión premium

**5. Análisis con IA**
- Resúmenes automáticos en lenguaje claro
- Extracción de puntos clave
- "¿Cómo me afecta esto?"
- Timeline visual de cambios
- Impacto estimado de nuevas leyes

**6. Datos y Transparencia**
- Estadísticas públicas del BOE
- Visualizaciones interactivas
- Open data exportable
- API pública gratuita (uso razonable)

### Oportunidades de Tecnología

**1. PWA (Progressive Web App)**
- Instalable como app
- Funciona offline (caché)
- Push notifications nativas
- Experiencia app-like

**2. Búsqueda Inteligente**
- NLP para búsqueda por intención
- Autocomplete inteligente
- Sugerencias de búsqueda
- "La gente también busca..."
- Búsqueda por voz

**3. Chatbot Asistente**
- IA conversacional
- "¿Hay ayudas para estudiantes?"
- Guía paso a paso
- Integración con WhatsApp/Telegram

**4. Scraping Inteligente**
- Detectar automáticamente cambios
- Alertar de modificaciones
- Indexar más rápido que BOE oficial
- Enriquecer con metadatos

### Oportunidades de Negocio

**Modelo Freemium:**

**Tier Gratuito:**
- Consulta ilimitada
- Alertas básicas (email)
- 3 búsquedas guardadas
- Acceso API limitado

**Tier Pro (€9.99/mes):**
- Alertas avanzadas (SMS, Telegram, instant)
- Búsquedas guardadas ilimitadas
- Comparador de versiones
- Sin publicidad
- Exportación avanzada
- Soporte prioritario

**Tier Enterprise (Custom):**
- API dedicada
- Integración personalizada
- SLA garantizado
- Dashboard empresarial
- White label

---

## 🎯 RECOMENDACIONES INICIALES

### Quick Wins (1-2 meses)

1. **Rediseño UI completo**
   - Sistema de diseño moderno
   - Mobile-first
   - Accesibilidad WCAG 2.1 AA completa

2. **Búsqueda mejorada**
   - Filtros facetados
   - Autocomplete
   - Búsqueda por rango de fechas mejorada

3. **Cards de contenido informativas**
   - Resumen visual
   - Iconografía clara
   - Badges de categoría
   - Fecha destacada

4. **Sistema de alertas básico mejorado**
   - UI para configurar alertas
   - Múltiples tipos de notificación
   - Preview de alertas

### Medium Term (3-6 meses)

5. **Comparador de versiones**
   - Diff visual estilo GitHub
   - Timeline de cambios
   - Exportación de comparación

6. **Resúmenes con IA**
   - Integrar NLP para resumir
   - Explicaciones en lenguaje claro
   - Destacar puntos clave

7. **Sistema de usuarios completo**
   - Registro opcional
   - Perfil personalizable
   - Historial
   - Favoritos

8. **PWA**
   - Instalable
   - Offline-first
   - Push notifications

### Long Term (6-12 meses)

9. **Chatbot inteligente**
   - IA conversacional
   - Integración multicanal

10. **Comunidad**
    - Comentarios
    - Valoraciones
    - Compartir

11. **Dashboard analítico**
    - Estadísticas públicas
    - Visualizaciones
    - Insights de datos

12. **API pública**
    - Documentación completa
    - SDKs en varios lenguajes
    - Freemium model

---

## 📚 FUENTES Y REFERENCIAS

### Documentación Oficial
- [BOE - Datos Abiertos API](https://www.boe.es/datosabiertos/api/api.php)
- [BOE - Accesibilidad](https://www.boe.es/informacion/accesibilidad/index.php)
- [BOE - Mi BOE Service](https://www.boe.es/mi_boe/)
- [BOE - Ayuda Personal/Oposiciones](https://www.boe.es/buscar/ayudas/personal_ayuda.php)
- [datos.gob.es - Open Data Portal](https://datos.gob.es/en)

### Competencia y Alternativas
- [Justicio BOE - Confilegal Article](https://confilegal.com/20250625-el-boe-ahora-si-al-alcance-de-los-juristas-justicio-lanza-una-nueva-forma-de-consultarlo-facil-agil-y-gratuita/)
- [Bases de Datos Jurídicas](https://www.todojuristas.com/35-bases-de-datos-juridicas)
- [Comparativa Plataformas IA Jurídicas](https://tuconsultajuridica.es/ia-para-abogados/)

### Tecnología y Herramientas
- [BOE Comparador - GitHub](https://github.com/migohe14/BOE-Comparador)
- [BOE Comparador - Chrome Store](https://chromewebstore.google.com/detail/boe-comparador/cciafdiafcgnendcokggomabfcdplcgg)
- [eGov España API](https://github.com/palmerabollo/egov)
- [Extracción NLP BOE](https://riunet.upv.es/entities/publication/071e8701-b582-4ad2-b3f8-1e9fc51e0e8e)

### IA y NLP
- [vLex Vincent AI](https://vlex.es/vincent-ai)
- [GenIA-L Lefebvre](https://elderecho.com/genia-l-docs-la-ia-definitiva-para-el-analisis-inteligente-de-documentos-legales)
- [Aranzadi IA Jurídica](https://www.aranzadilaley.es/inteligencia-artificial/)
- [NLP Gobierno España](https://datos.gob.es/sites/default/files/doc/file/tecnologias_emergentes_y_opendata_procesado_del_lenguaje_natural.pdf)

### Accesibilidad y UX
- [Real Decreto 1112/2018 Accesibilidad](https://www.boe.es/buscar/act.php?id=BOE-A-2018-12699)
- [Ley Europea Accesibilidad 2025](https://www.grupoenfoca.com/blog/ley-europea-de-accesibilidad-web-prepara-tu-web-o-e-commerce-para-el-futuro/)
- [VISEO - Diseño UX Accesible](https://iberia.viseo.com/noticias-y-eventos/hacer-posible-la-accesibilidad-digital-diseno-ux-para-todos/)

### Servicios de Alertas
- [JurisTracker](https://www.juristracker.com/)
- [Prensa Social - Suscripción BOE](https://prensasocial.es/como-suscribirse-al-boe-para-estar-al-corriente-de-aquello-que-nos-interesa/)

---

## 🎬 PRÓXIMOS PASOS

1. ✅ **Investigación completada**
2. 🔄 **Definir features y priorización** (siguiente fase)
3. ⏳ Crear user stories y flujos
4. ⏳ Diseñar UI/UX mejorada
5. ⏳ Planificar implementación técnica
6. ⏳ Desarrollar MVP de mejoras
7. ⏳ Testing con usuarios reales
8. ⏳ Iterar basado en feedback

---

**Documento creado:** 24/11/2025
**Última actualización:** 24/11/2025
**Versión:** 1.0
