# Nueva Arquitectura - datosenabierto.es
## Plataforma Educativa Gratuita del BOE

**Fecha:** 24 de Noviembre, 2025
**Versión:** 2.0 - Pivote Educativo

---

## 🎯 NUEVA VISIÓN

**"No solo mostrar el BOE, sino explicar qué significa y por qué importa"**

### Principios Fundamentales

1. **100% Gratuito** - Sin paywalls, sin limitaciones artificiales
2. **Educativo Primero** - Explicar, contextualizar, empoderar
3. **Información de Valor** - No métricas vacías, sino datos útiles
4. **Procesamiento Inteligente** - Automatización sin depender de IA de pago
5. **Categorización Clara** - Encontrar lo que importa fácilmente

---

## 🏗️ ARQUITECTURA TÉCNICA SIMPLIFICADA

### Stack Minimalista

```
┌────────────────────────────────────────────────┐
│         FRONTEND (Nuxt 3 - Static)             │
│                                                │
│  • UI/UX educativa con explicaciones          │
│  • WebLLM en navegador (opcional)             │
│  • Todo el contenido visual aquí              │
│  • localStorage para favoritos locales        │
└────────────────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────┐
│    NETLIFY FUNCTIONS (Serverless - Gratis)     │
│                                                │
│  📍 /api/boe/proxy/[date]                     │
│     → Proxy a API oficial BOE                 │
│     → Caché de 1 hora                         │
│     → Resuelve CORS                           │
│                                                │
│  📍 /api/categories/oposiciones               │
│     → Datos pre-procesados del día            │
│                                                │
│  📍 /api/categories/ayudas                    │
│     → Datos clasificados y enriquecidos       │
│                                                │
│  📍 /api/categories/legislacion               │
│     → Cambios importantes explicados          │
│                                                │
│  ⏰ Scheduled Function (CRON Diario 7am)      │
│     → Scraping BOE del día                    │
│     → Clasificación automática                │
│     → Extracción de datos estructurados       │
│     → Generación de explicaciones             │
│     → Guarda en archivos JSON estáticos       │
└────────────────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────┐
│       STORAGE (Opcional / Gratis)              │
│                                                │
│  • Netlify Blobs (archivos JSON procesados)   │
│  • O GitHub (commit automático diario)        │
│  • localStorage navegador (favoritos)         │
└────────────────────────────────────────────────┘
```

### Por qué NO necesitamos base de datos compleja

```typescript
// En lugar de PostgreSQL complejo, usamos archivos JSON estáticos
// generados diariamente y servidos vía CDN (ultra rápido)

// Estructura de archivos:
/data/
  /processed/
    /2025/
      /11/
        24-oposiciones.json      // Datos del día procesados
        24-ayudas.json
        24-legislacion.json
    latest-oposiciones.json       // Acceso rápido a lo más reciente
    latest-ayudas.json

// Ventajas:
// ✅ Ultra rápido (CDN)
// ✅ Gratis
// ✅ Versionado automático (Git)
// ✅ Fácil de cachear
// ✅ No hay caída de BD
```

---

## 📚 CATEGORÍAS CON VALOR EDUCATIVO

### 1. 🎓 Oposiciones - `/oposiciones`

#### UI Educativa (No solo métricas)

```vue
<template>
  <!-- ❌ MAL: Solo mostrar números -->
  <div>Hay 150 convocatorias activas</div>

  <!-- ✅ BIEN: Explicar y dar contexto -->
  <div class="info-card">
    <h3>📊 ¿Qué significan estos números?</h3>
    <p>
      Actualmente hay <strong>150 convocatorias abiertas</strong> en toda España.
      Esto es <strong>25% más que el mes pasado</strong>, lo que indica un aumento
      en la oferta de empleo público.
    </p>

    <div class="highlight">
      <h4>💡 ¿Qué hacer?</h4>
      <ul>
        <li>Revisa las convocatorias de tu comunidad autónoma</li>
        <li>Mira los <strong>plazos de inscripción</strong> - muchos cierran en 20 días</li>
        <li>Comprueba si cumples los requisitos antes de preparar el examen</li>
      </ul>
    </div>
  </div>

  <!-- Explicación de cada convocatoria -->
  <div class="convocatoria-card">
    <h3>{{ titulo }}</h3>

    <!-- Datos importantes EXPLICADOS -->
    <div class="explanation-box">
      <h4>¿Qué es esto?</h4>
      <p>
        El <strong>Ayuntamiento de Madrid</strong> busca cubrir
        <strong>50 plazas de Administrativo</strong>. Esto significa que
        necesitan personas para trabajar en tareas de gestión, archivo,
        atención al público y apoyo administrativo.
      </p>
    </div>

    <div class="important-dates">
      <h4>📅 Fechas Clave (¡No las pierdas!)</h4>
      <div class="timeline">
        <div class="date">
          <strong>20 días restantes</strong> para inscribirte
          <small>Hasta el 15 de diciembre de 2025</small>
        </div>
        <div class="date">
          <strong>Examen estimado:</strong> Abril-Mayo 2026
          <small>Suelen ser 3-4 meses después del cierre</small>
        </div>
      </div>
    </div>

    <div class="requirements-explained">
      <h4>✅ Requisitos (¿Los cumples?)</h4>
      <ul>
        <li>
          <strong>Título de Bachiller o equivalente</strong>
          <small class="tooltip">
            → Esto incluye FP de Grado Medio, COU o prueba de acceso a universidad
          </small>
        </li>
        <li>
          <strong>No haber sido separado del servicio</strong>
          <small class="tooltip">
            → Significa que no te hayan despedido antes de un empleo público
          </small>
        </li>
      </ul>
    </div>

    <div class="what-to-do">
      <h4>🎯 Siguientes Pasos</h4>
      <ol>
        <li>
          <strong>Descarga las bases</strong> (PDF oficial)
          <small>→ Lee el temario completo y el proceso de selección</small>
        </li>
        <li>
          <strong>Inscríbete antes del {{ plazo }}</strong>
          <small>→ Necesitarás DNI, título y solicitud firmada</small>
        </li>
        <li>
          <strong>Prepara el examen</strong>
          <small>→ El temario está en las bases. Empieza YA, no el día antes</small>
        </li>
      </ol>
    </div>
  </div>
</template>
```

#### Datos Procesados Automáticamente

```typescript
// /api/categories/oposiciones
{
  "metadata": {
    "fecha_procesado": "2025-11-24T07:00:00Z",
    "total_convocatorias": 150,
    "comparacion_mes_anterior": "+25%",
    "contexto": "Aumento significativo debido a ofertas públicas de empleo anuales"
  },

  "convocatorias_destacadas": [
    {
      "id": "BOE-A-2025-12345",
      "titulo": "Convocatoria de 50 plazas de Administrativo - Ayuntamiento de Madrid",
      "organismo": "Ayuntamiento de Madrid",
      "plazas": 50,
      "cuerpo": "Administrativo",
      "tipo_acceso": "Libre",

      // Fechas extraídas automáticamente
      "fechas": {
        "publicacion": "2025-11-24",
        "limite_inscripcion": "2025-12-15",
        "dias_restantes": 20,
        "examen_estimado": "2026-04-01", // Estimación basada en histórico
        "contexto": "El plazo de inscripción es de 20 días hábiles desde publicación"
      },

      // Requisitos EXPLICADOS
      "requisitos": [
        {
          "texto_oficial": "Estar en posesión del título de Bachiller o equivalente",
          "explicacion": "Necesitas título de Bachillerato, FP Grado Medio, COU o haber aprobado la prueba de acceso a la universidad para mayores de 25 años",
          "alternativas": ["Bachiller", "FP Grado Medio", "COU", "Prueba acceso universidad +25"]
        },
        {
          "texto_oficial": "No haber sido separado mediante expediente disciplinario del servicio",
          "explicacion": "No haber sido despedido de otro empleo público por faltas graves",
          "critico": false
        }
      ],

      // Explicación del proceso
      "proceso": {
        "fases": [
          {
            "fase": "Inscripción",
            "que_hacer": "Rellenar solicitud en sede electrónica con certificado digital o Cl@ve",
            "documentos": ["DNI", "Título académico", "Justificante pago tasa"],
            "duracion_estimada": "20 días"
          },
          {
            "fase": "Examen",
            "que_hacer": "Examen tipo test + caso práctico sobre el temario de las bases",
            "preparacion": "3-6 meses de estudio según experiencia",
            "fecha_estimada": "Abril-Mayo 2026"
          },
          {
            "fase": "Curso selectivo",
            "que_hacer": "Periodo de prácticas remuneradas de 1-3 meses",
            "contexto": "Es la última fase, casi todos los que llegan aquí aprueban"
          }
        ]
      },

      // Calculadora de compatibilidad
      "calculadora_requisitos": {
        "preguntas": [
          "¿Tienes título de Bachiller o equivalente?",
          "¿Tienes nacionalidad española o UE?",
          "¿Has sido sancionado en empleo público antes?"
        ]
      },

      // Contexto útil
      "contexto_util": {
        "salario_estimado": "18.000-22.000€ brutos/año inicial",
        "jornada": "37.5 horas semanales",
        "estabilidad": "Empleo fijo tras superar proceso",
        "dificultad": "Media - Ratio 15 candidatos por plaza en convocatorias similares"
      },

      "enlaces": {
        "bases_pdf": "https://boe.es/...",
        "inscripcion": "https://...",
        "temario": "Ver en bases oficiales"
      }
    }
  ],

  // Timeline visual
  "proximos_examenes": [
    {
      "fecha": "2025-12-15",
      "evento": "Cierre inscripción Ayto Madrid",
      "urgente": true,
      "dias_restantes": 20
    }
  ],

  // Estadísticas EXPLICADAS
  "estadisticas": {
    "por_comunidad": {
      "madrid": {
        "convocatorias": 45,
        "contexto": "Madrid lidera en número debido a su tamaño y necesidades administrativas"
      }
    },
    "tendencias": {
      "mensaje": "Diciembre es buen momento: muchas oposiciones abren antes de fin de año",
      "consejo": "Prepara documentación ahora para no perder oportunidades"
    }
  }
}
```

---

### 2. 💰 Ayudas y Subvenciones - `/ayudas`

#### UI Educativa

```vue
<template>
  <div class="ayudas-explicadas">
    <div class="intro-section">
      <h2>💰 Ayudas y Subvenciones: ¿Qué son y cómo funcionan?</h2>

      <div class="explicacion-basica">
        <h3>🤔 ¿Qué es una subvención?</h3>
        <p>
          Una subvención es <strong>dinero público que NO tienes que devolver</strong>,
          otorgado por el Estado, comunidades autónomas o ayuntamientos para fomentar
          actividades de interés público (emprender, investigar, formarse, etc).
        </p>

        <div class="diferencias">
          <h4>📊 Diferencias importantes:</h4>
          <table>
            <tr>
              <td><strong>Subvención</strong></td>
              <td>No se devuelve, pero hay que justificar el gasto</td>
            </tr>
            <tr>
              <td><strong>Préstamo</strong></td>
              <td>Hay que devolverlo (con o sin intereses)</td>
            </tr>
            <tr>
              <td><strong>Beca</strong></td>
              <td>Subvención específica para estudios/investigación</td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <!-- Ayuda individual EXPLICADA -->
    <div class="ayuda-card">
      <h3>{{ titulo }}</h3>

      <div class="explicacion">
        <h4>¿Qué es esto y para qué sirve?</h4>
        <p>
          El <strong>Ministerio de Industria</strong> ofrece hasta
          <strong>50.000€</strong> para ayudar a pequeñas empresas tecnológicas
          a desarrollar nuevos productos digitales. El objetivo es fomentar
          la innovación y competitividad de las PYMES españolas.
        </p>
      </div>

      <div class="quien-puede">
        <h4>✅ ¿Puedo solicitarla? (Requisitos explicados)</h4>

        <div class="requisito">
          <input type="checkbox" id="req1">
          <label for="req1">
            <strong>Ser PYME con menos de 50 empleados</strong>
            <div class="tooltip-inline">
              → Microempresa (1-10), Pequeña (11-50). Autónomos también cuentan si facturan como empresa.
            </div>
          </label>
        </div>

        <div class="requisito">
          <input type="checkbox" id="req2">
          <label for="req2">
            <strong>Proyecto tecnológico o digital</strong>
            <div class="tooltip-inline">
              → App, web, software, IA, IoT, etc. NO vale comercio tradicional sin componente tech.
            </div>
          </label>
        </div>

        <div class="requisito">
          <input type="checkbox" id="req3">
          <label for="req3">
            <strong>Estar al corriente de pago con Hacienda y Seguridad Social</strong>
            <div class="tooltip-inline">
              → Sin deudas pendientes. Puedes comprobarlo online en tu área de Hacienda.
            </div>
          </label>
        </div>

        <button class="check-compatibility">
          ✓ Comprobar si cumplo requisitos
        </button>
      </div>

      <div class="como-funciona">
        <h4>💡 ¿Cómo funciona? (Paso a paso)</h4>

        <ol class="steps">
          <li>
            <strong>1. Preparar documentación (1-2 semanas)</strong>
            <ul>
              <li>Proyecto detallado (qué harás, cómo, cuánto cuesta)</li>
              <li>Presupuesto desglosado</li>
              <li>Declaración responsable</li>
              <li>Certificados al corriente de pago</li>
            </ul>
            <button>Ver checklist completa</button>
          </li>

          <li>
            <strong>2. Solicitar online (hasta {{ fecha_limite }})</strong>
            <ul>
              <li>Necesitas certificado digital o Cl@ve</li>
              <li>Rellenar formulario en sede electrónica</li>
              <li>Adjuntar documentos (PDF)</li>
            </ul>
            <a href="{{ link_solicitud }}" class="btn-primary">
              Ir a formulario →
            </a>
          </li>

          <li>
            <strong>3. Evaluación (2-3 meses)</strong>
            <p>
              Un comité técnico evalúa tu proyecto según criterios de innovación,
              viabilidad y impacto. Te pueden pedir aclaraciones.
            </p>
          </li>

          <li>
            <strong>4. Resolución (publicada en BOE)</strong>
            <p>
              Si te conceden la ayuda, saldrá publicado en el BOE. Recibirás
              notificación y tendrás que aceptar formalmente.
            </p>
          </li>

          <li>
            <strong>5. Justificación (6-12 meses después)</strong>
            <p>
              Debes demostrar que gastaste el dinero en lo que dijiste:
              facturas, contratos, informes de progreso.
            </p>
            <div class="warning">
              ⚠️ <strong>Importante:</strong> Si no justificas bien, tendrás que devolver el dinero.
            </div>
          </li>
        </ol>
      </div>

      <div class="cuanto-dinero">
        <h4>💵 ¿Cuánto dinero puedo recibir?</h4>

        <div class="calculadora">
          <p>Esta subvención cubre hasta el <strong>70% de los gastos</strong> del proyecto:</p>

          <div class="ejemplo">
            <h5>Ejemplo:</h5>
            <table>
              <tr>
                <td>Tu proyecto cuesta:</td>
                <td><strong>60.000€</strong></td>
              </tr>
              <tr>
                <td>Subvención (70%):</td>
                <td class="highlight"><strong>42.000€</strong></td>
              </tr>
              <tr>
                <td>Pones tú (30%):</td>
                <td><strong>18.000€</strong></td>
              </tr>
            </table>
          </div>

          <div class="max-min">
            <p><strong>Mínimo:</strong> 5.000€ (proyectos pequeños)</p>
            <p><strong>Máximo:</strong> 50.000€ (tope por empresa)</p>
          </div>
        </div>
      </div>

      <div class="gastos-elegibles">
        <h4>📋 ¿En qué puedo gastar el dinero?</h4>

        <div class="gastos-si">
          <h5>✅ Gastos permitidos:</h5>
          <ul>
            <li>Salarios del equipo de desarrollo</li>
            <li>Hardware y software necesario</li>
            <li>Servicios cloud (servidores, hosting)</li>
            <li>Subcontratación técnica</li>
            <li>Auditorías y consultorías técnicas</li>
          </ul>
        </div>

        <div class="gastos-no">
          <h5>❌ NO permitidos:</h5>
          <ul>
            <li>Compra de vehículos</li>
            <li>Gastos generales de oficina</li>
            <li>IVA (si eres empresa y lo recuperas)</li>
            <li>Gastos anteriores a la solicitud</li>
          </ul>
        </div>
      </div>

      <div class="consejos">
        <h4>💪 Consejos para que te concedan la ayuda</h4>
        <ul>
          <li>
            <strong>Sé específico:</strong> "Desarrollar app móvil de salud" es mejor que "Proyecto digital"
          </li>
          <li>
            <strong>Presupuesto realista:</strong> Investiga precios reales, no inventes números
          </li>
          <li>
            <strong>Demuestra impacto:</strong> Cuántos usuarios, empleos creados, facturación esperada
          </li>
          <li>
            <strong>Revisa todo:</strong> Un error administrativo puede descalificarte
          </li>
        </ul>
      </div>

      <div class="alternativas">
        <h4>🔄 Si no cumples requisitos, mira estas alternativas:</h4>
        <ul>
          <li>
            <a href="#">Ayudas para autónomos (Trabajo)</a>
            <small>Requisitos más flexibles, hasta 10.000€</small>
          </li>
          <li>
            <a href="#">Kit Digital</a>
            <small>Para digitalizar tu negocio, hasta 12.000€</small>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
```

---

### 3. 📜 Cambios Legislativos - `/cambios`

#### UI Educativa

```vue
<template>
  <div class="cambios-explicados">
    <div class="intro">
      <h2>📜 Cambios en las Leyes: ¿Qué significa y cómo te afecta?</h2>

      <div class="explicacion">
        <p>
          Las leyes cambian constantemente. Aquí te explicamos
          <strong>qué ha cambiado, por qué y cómo te impacta</strong> en tu día a día.
        </p>
        <p class="highlight">
          💡 No necesitas ser abogado para entenderlo. Lo explicamos en lenguaje claro.
        </p>
      </div>
    </div>

    <!-- Cambio individual EXPLICADO -->
    <div class="cambio-card">
      <div class="badge-urgencia">
        <span class="urgente">⚠️ Entra en vigor en 30 días</span>
      </div>

      <h3>Modificación del IRPF para autónomos</h3>

      <div class="que-es">
        <h4>🤔 ¿Qué es el IRPF?</h4>
        <p>
          El IRPF (Impuesto sobre la Renta de las Personas Físicas) es el impuesto
          que pagas sobre tus ingresos. Si eres autónomo, lo declaras cada trimestre
          y al final del año.
        </p>
      </div>

      <div class="que-cambio">
        <h4>🔄 ¿Qué ha cambiado exactamente?</h4>

        <div class="antes-despues">
          <div class="antes">
            <h5>❌ Antes (hasta 31/12/2025)</h5>
            <ul>
              <li>
                <strong>Retención mínima: 15%</strong>
                <p class="explicacion">
                  Si emitías una factura de 1.000€, tenías que retener 150€
                  y enviarlo a Hacienda.
                </p>
              </li>
              <li>
                <strong>Reducción por inicio de actividad: 2 años</strong>
                <p class="explicacion">
                  Los nuevos autónomos pagaban menos durante 2 años.
                </p>
              </li>
            </ul>
          </div>

          <div class="despues">
            <h5>✅ Ahora (desde 01/01/2026)</h5>
            <ul>
              <li>
                <strong>Retención mínima: 7%</strong>
                <p class="explicacion">
                  Misma factura de 1.000€, ahora solo retienes 70€.
                  <strong>Ahorras 80€ de liquidez inmediata.</strong>
                </p>
              </li>
              <li>
                <strong>Reducción por inicio: 3 años</strong>
                <p class="explicacion">
                  Los nuevos autónomos tienen un año más de ventaja.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="quien-afecta">
        <h4>👥 ¿A quién afecta?</h4>

        <div class="afectados">
          <div class="si-afecta">
            <h5>✅ Te afecta SI eres:</h5>
            <ul>
              <li>Autónomo profesional (diseñador, programador, consultor, etc.)</li>
              <li>Freelancer que emite facturas a empresas</li>
              <li>Profesional liberal (abogado, arquitecto, médico privado)</li>
            </ul>
          </div>

          <div class="no-afecta">
            <h5>❌ NO te afecta si:</h5>
            <ul>
              <li>Trabajas por cuenta ajena (empleado con nómina)</li>
              <li>Eres autónomo pero vendes a particulares (sin retención)</li>
              <li>Estás en módulos (sistema de estimación objetiva)</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="como-afecta">
        <h4>💰 ¿Cómo me afecta en la práctica?</h4>

        <div class="ejemplo-real">
          <h5>Ejemplo real (autónomo que factura 30.000€/año):</h5>

          <table class="comparativa">
            <thead>
              <tr>
                <th></th>
                <th>Antes (15%)</th>
                <th>Ahora (7%)</th>
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Factura trimestral</td>
                <td>7.500€</td>
                <td>7.500€</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Retención a ingresar</td>
                <td class="bad">1.125€</td>
                <td class="good">525€</td>
                <td class="highlight">-600€</td>
              </tr>
              <tr>
                <td>Cobras en tu cuenta</td>
                <td>6.375€</td>
                <td>6.975€</td>
                <td class="highlight">+600€</td>
              </tr>
            </tbody>
          </table>

          <div class="conclusion">
            <p class="highlight-big">
              💡 <strong>En resumen:</strong> Cobras <strong>600€ más al trimestre</strong>
              (2.400€ al año) de liquidez inmediata. Ojo: al final del año ajustarás en la
              declaración, pero mientras tanto tienes más dinero disponible.
            </p>
          </div>
        </div>
      </div>

      <div class="que-hacer">
        <h4>✅ ¿Qué debo hacer?</h4>

        <ol class="acciones">
          <li>
            <strong>Actualiza tus facturas desde 01/01/2026</strong>
            <p>
              Cambia el % de retención en tu programa de facturación (Contasol,
              FacturaDirecta, etc.) del 15% al 7%.
            </p>
            <button>Ver tutorial cambiar retención</button>
          </li>

          <li>
            <strong>Avisa a tus clientes habituales</strong>
            <p>
              Envíales un email informando del cambio para que no se extrañen
              de que la retención es menor.
            </p>
            <button>Ver plantilla email</button>
          </li>

          <li>
            <strong>Ajusta tu planificación fiscal</strong>
            <p>
              Habla con tu gestor: al retener menos ahora, puede que debas más
              en la declaración anual. Guarda la diferencia.
            </p>
          </li>
        </ol>
      </div>

      <div class="dudas-frecuentes">
        <h4>❓ Preguntas frecuentes</h4>

        <details>
          <summary>¿Pagaré más o menos impuestos al final del año?</summary>
          <p>
            Pagarás <strong>lo mismo</strong>. El cambio es solo en el momento
            del pago: antes pagabas más cada mes, ahora pagas menos mensualmente
            pero ajustas al final. Es un tema de <strong>liquidez</strong>, no
            de cantidad total.
          </p>
        </details>

        <details>
          <summary>¿Las facturas anteriores a enero 2026 también cambian?</summary>
          <p>
            <strong>No.</strong> Las facturas emitidas antes del 01/01/2026
            mantienen la retención del 15%. Solo las nuevas llevan el 7%.
          </p>
        </details>

        <details>
          <summary>¿Puedo seguir aplicando 15% si quiero?</summary>
          <p>
            <strong>Sí.</strong> El 7% es el nuevo mínimo, pero puedes aplicar más
            si prefieres adelantar el pago y evitar sorpresas en la declaración anual.
          </p>
        </details>
      </div>

      <div class="enlaces-utiles">
        <h4>🔗 Enlaces útiles</h4>
        <ul>
          <li><a href="#">📄 Texto completo de la modificación (BOE oficial)</a></li>
          <li><a href="#">📺 Video explicativo (5 min)</a></li>
          <li><a href="#">🧮 Calculadora de retenciones</a></li>
          <li><a href="#">💬 Preguntar a la comunidad</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>
```

---

## 🤖 PROCESAMIENTO AUTOMÁTICO (Sin IA de pago)

### Cloud Function Diaria

```typescript
// netlify/functions/scheduled-daily-processing.ts
import { schedule } from '@netlify/functions'
import { format } from 'date-fns'

export const handler = schedule('0 7 * * *', async () => {
  console.log('🚀 Iniciando procesamiento diario del BOE...')

  const today = format(new Date(), 'yyyyMMdd')

  // 1. Fetch BOE del día
  const boe = await fetchBOE(today)

  // 2. Procesar cada categoría
  const oposiciones = await processOposiciones(boe)
  const ayudas = await processAyudas(boe)
  const cambios = await processCambiosLegislativos(boe)

  // 3. Guardar en archivos JSON estáticos
  await saveProcessedData({
    fecha: today,
    oposiciones,
    ayudas,
    cambios
  })

  // 4. Enviar alertas (opcional)
  await sendNotifications(oposiciones, ayudas, cambios)

  console.log('✅ Procesamiento completado')

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  }
})

// Procesador de oposiciones (REGEX + KEYWORDS)
async function processOposiciones(boe: BOEData) {
  const seccionII = boe.sections.find(s => s.codigo === 'II')

  const convocatorias = seccionII.documentos
    .filter(doc => {
      // Clasificación por keywords
      const titulo = doc.titulo.toLowerCase()
      return (
        titulo.includes('convocatoria') ||
        titulo.includes('oposición') ||
        titulo.includes('oposiciones') ||
        titulo.includes('concurso')
      ) && (
        titulo.includes('plazas') ||
        titulo.includes('provisión')
      )
    })
    .map(doc => {
      // Extraer datos estructurados con REGEX
      const plazas = extractPlazas(doc.titulo, doc.content)
      const organismo = extractOrganismo(doc.titulo)
      const fechas = extractFechas(doc.content)
      const requisitos = extractRequisitos(doc.content)

      // Generar EXPLICACIONES (templates, no IA)
      const explicacion = generarExplicacionOposicion({
        organismo,
        plazas,
        cuerpo: doc.categoria
      })

      return {
        ...doc,
        plazas,
        organismo,
        fechas,
        requisitos,
        explicacion, // Texto explicativo generado
        que_hacer: generarPasosOposicion(fechas),
        contexto: generarContexto(doc)
      }
    })

  return {
    total: convocatorias.length,
    destacadas: convocatorias.filter(c => c.fechas.dias_restantes < 30),
    por_organismo: groupBy(convocatorias, 'organismo'),
    estadisticas: calcularEstadisticas(convocatorias)
  }
}

// Extracción con REGEX (sin IA)
function extractPlazas(titulo: string, content: string): number {
  // Patrones comunes
  const patterns = [
    /(\d+)\s+plazas?/i,
    /provisión\s+de\s+(\d+)/i,
    /cubrir\s+(\d+)/i
  ]

  for (const pattern of patterns) {
    const match = titulo.match(pattern) || content.match(pattern)
    if (match) return parseInt(match[1])
  }

  return 0 // No detectado
}

function extractFechas(content: string): Fechas {
  // Regex para detectar fechas
  const plazoInscripcion = content.match(
    /plazo.{0,30}(\d{1,2}).{0,5}días.{0,5}hábiles/i
  )

  const fechaPublicacion = new Date()

  let fechaLimite
  if (plazoInscripcion) {
    const dias = parseInt(plazoInscripcion[1])
    fechaLimite = addBusinessDays(fechaPublicacion, dias)
  }

  return {
    publicacion: fechaPublicacion,
    limite_inscripcion: fechaLimite,
    dias_restantes: differenceInDays(fechaLimite, new Date()),
    examen_estimado: addMonths(fechaLimite, 4), // Estimación
    contexto: `El plazo de inscripción es de ${plazoInscripcion?.[1] || 20} días hábiles desde publicación`
  }
}

// Generador de EXPLICACIONES (templates)
function generarExplicacionOposicion(data: OpData): string {
  const { organismo, plazas, cuerpo } = data

  // Template explicativo
  return `
    El ${organismo} busca cubrir ${plazas} plazas de ${cuerpo}.
    Esto significa que necesitan personas para trabajar en ${getDescripcionCuerpo(cuerpo)}.

    ${plazas > 100 ?
      'Es una convocatoria grande, lo que aumenta tus probabilidades.' :
      'Es una convocatoria más reducida, la competencia será mayor.'
    }
  `.trim()
}

function getDescripcionCuerpo(cuerpo: string): string {
  const descripciones = {
    'Administrativo': 'tareas de gestión, archivo, atención al público y apoyo administrativo',
    'Auxiliar Administrativo': 'apoyo en tareas básicas de oficina, archivo y registro',
    'Técnico': 'proyectos específicos que requieren titulación técnica',
    'Auxiliar de Enfermería': 'cuidados básicos de pacientes bajo supervisión',
    // etc...
  }

  return descripciones[cuerpo] || 'las funciones especificadas en las bases'
}

// Generador de PASOS A SEGUIR
function generarPasosOposicion(fechas: Fechas): PasosOposicion {
  return {
    pasos: [
      {
        numero: 1,
        titulo: 'Descarga las bases',
        descripcion: 'Lee el temario completo y el proceso de selección',
        urgente: false
      },
      {
        numero: 2,
        titulo: `Inscríbete antes del ${format(fechas.limite_inscripcion, 'dd/MM/yyyy')}`,
        descripcion: 'Necesitarás DNI, título y solicitud firmada',
        urgente: fechas.dias_restantes < 10,
        dias_restantes: fechas.dias_restantes
      },
      {
        numero: 3,
        titulo: 'Prepara el examen',
        descripcion: 'El temario está en las bases. Empieza YA, no el día antes',
        tiempo_estimado: '3-6 meses según experiencia'
      }
    ]
  }
}
```

---

## 🎨 PRINCIPIOS DE UI EDUCATIVA

### ❌ NO HACER (Típico)

```vue
<!-- Malo: Solo métricas sin contexto -->
<div class="stat-card">
  <div class="number">150</div>
  <div class="label">Convocatorias</div>
</div>

<div class="stat-card">
  <div class="number">€50,000</div>
  <div class="label">Máximo</div>
</div>
```

### ✅ SÍ HACER (Educativo)

```vue
<!-- Bueno: Métricas CON explicación y contexto -->
<div class="info-card educativa">
  <div class="numero-destacado">
    <span class="cifra">150</span>
    <span class="etiqueta">convocatorias activas</span>
  </div>

  <div class="explicacion">
    <p>
      Hay <strong>150 oportunidades</strong> de empleo público abiertas ahora mismo.
      Esto es <strong>25% más que el mes pasado</strong> 📈
    </p>
    <p class="contexto">
      💡 <strong>¿Qué significa?</strong> Las administraciones están contratando
      activamente. Es buen momento para buscar oposiciones.
    </p>
  </div>

  <div class="accion">
    <button>Ver las 150 convocatorias →</button>
  </div>
</div>

<div class="info-card educativa">
  <div class="numero-destacado">
    <span class="cifra">50.000€</span>
    <span class="etiqueta">máximo por proyecto</span>
  </div>

  <div class="explicacion">
    <p>
      <strong>¿Qué significa esto?</strong>
    </p>
    <ul>
      <li>✓ Tu proyecto puede costar hasta 70.000€</li>
      <li>✓ La subvención cubre hasta 50.000€ (70%)</li>
      <li>✓ Tú pones mínimo 20.000€ (30%)</li>
    </ul>
  </div>

  <div class="calculadora">
    <button>Calcular mi subvención →</button>
  </div>
</div>
```

### Checklist de UI Educativa

Cada elemento debe tener:

- [ ] **¿Qué es?** - Definición clara
- [ ] **¿Para qué sirve?** - Propósito
- [ ] **¿Cómo me afecta?** - Relevancia personal
- [ ] **¿Qué debo hacer?** - Pasos accionables
- [ ] **¿Dudas frecuentes?** - FAQ inline
- [ ] **Contexto adicional** - "Sabías que...", "Importante:", "Consejo:"

---

## 📊 MÉTRICAS DE ÉXITO (Nuevas)

### No medir solo números, medir COMPRENSIÓN

**Métricas tradicionales:**
- ❌ Número de visitas
- ❌ Tiempo en página
- ❌ Bounce rate

**Métricas de valor educativo:**
- ✅ % usuarios que hacen clic en "¿Qué significa esto?"
- ✅ % usuarios que completan la calculadora de requisitos
- ✅ % usuarios que descargan las bases después de leer explicación
- ✅ Feedback: "¿Te ha sido útil esta explicación?" (Sí/No/Más o menos)
- ✅ % usuarios que vuelven (indica que encontraron valor)

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

¿Por dónde empezamos?

1. **Implementar proxy API** (`/api/boe/proxy/[date].ts`)
2. **Crear Cloud Function diaria** (scraping + clasificación)
3. **Implementar procesador de 1 categoría** (empecemos con Oposiciones)
4. **Crear página `/oposiciones`** con UI educativa
5. **Probar con datos reales**

¿Procedemos?
