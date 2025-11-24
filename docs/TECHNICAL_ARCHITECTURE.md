# Arquitectura Técnica - datosenabierto.es
## Plan de Implementación y Stack Tecnológico

**Fecha:** 24 de Noviembre, 2025
**Versión:** 1.0

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Nuxt 3 + Vue 3 (Composition API)                  │   │
│  │  - Pages (SSR)                                       │   │
│  │  - Components (Reactive)                             │   │
│  │  - Composables (Logic)                               │   │
│  │  - Stores (Pinia)                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PWA Layer (Service Worker + Cache)                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER (Nitro)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  /api/search │  │ /api/alerts  │  │  /api/users  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   /api/ai    │  │ /api/compare │  │ /api/admin   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
           ↕              ↕                 ↕
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   External   │  │  Databases   │  │   Workers    │
│     APIs     │  │   & Cache    │  │   & Queues   │
└──────────────┘  └──────────────┘  └──────────────┘
       ↓                 ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ BOE Oficial  │  │  PostgreSQL  │  │ Bull Queue   │
│ Claude/GPT   │  │    Redis     │  │ CRON Jobs    │
│ Twilio       │  │   S3/R2      │  │              │
│ Telegram     │  │ Meilisearch  │  │              │
│ SendGrid     │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 💻 STACK TECNOLÓGICO

### Frontend

#### Core

- **Framework:** Nuxt 3.13+ (Vue 3 + Composition API)
  - SSR habilitado para SEO
  - Auto-imports de componentes y composables
  - File-based routing

- **State Management:** Pinia 2.1+
  - Stores modulares por feature
  - Persistencia con pinia-plugin-persistedstate

- **Estilos:** Tailwind CSS 4.0+
  - Sistema de diseño customizado
  - JIT compiler
  - Plugins: typography, forms, aspect-ratio

#### UI & UX

- **Componentes:**
  - Headless UI (accesibilidad)
  - VueUse (@vueuse/core) para composables utilities

- **Animaciones:**
  - CSS transitions nativas
  - VueUse `useTransition` para animaciones numéricas

- **Formularios:**
  - VeeValidate para validación
  - Zod para schemas de validación

- **Iconos:**
  - Heroicons 2.1+ (ya instalado)
  - Unplugin-icons para tree-shaking

#### Datos y Comunicación

- **HTTP Client:** ofetch (ya instalado)
  - Built-in con Nuxt
  - Auto-retry y interceptors

- **Fechas:** date-fns 2.30+ (ya instalado)
  - Tree-shakeable
  - i18n con locales

#### PWA

- **PWA:** @vite-pwa/nuxt 0.5+
  - Service Worker con Workbox
  - Manifest generator
  - Offline support
  - Push notifications

---

### Backend (Nitro)

#### Runtime

- **Server Engine:** Nitro 2.9+
  - File-based API routes
  - Middleware support
  - Built-in caché

#### Base de Datos

- **Primary DB:** PostgreSQL 16+
  - Tablas principales:
    ```sql
    - users (auth)
    - user_profiles (datos extendidos)
    - saved_searches
    - favorites
    - alerts
    - user_channels (notificaciones)
    - documents (caché BOE)
    - summaries (resúmenes IA)
    - versions (histórico documentos)
    - subscriptions (freemium)
    ```

- **ORM:** Drizzle ORM
  - Type-safe
  - Migrations automatizadas
  - Relaciones explícitas

- **Caché:** Redis 7+
  - Session storage
  - API response cache (TTL 5min-1h)
  - Rate limiting
  - Queue jobs storage

#### Búsqueda

- **Search Engine:** Meilisearch 1.6+
  - Full-text search optimizado
  - Typo-tolerant
  - Faceted search out-of-the-box
  - Filtros y sorting rápidos
  - Alternativa: Elasticsearch (más complejo)

#### Storage

- **Object Storage:** Cloudflare R2 (S3-compatible)
  - User avatars
  - Exported documents
  - Static assets CDN

---

### Servicios Externos

#### IA y NLP

- **Resúmenes:** Anthropic Claude API (Haiku/Sonnet)
  - Endpoint: `https://api.anthropic.com/v1/messages`
  - Fallback: OpenAI GPT-4o-mini
  - Prompt engineering optimizado
  - Caché permanente de resúmenes

- **NLP Español:** spaCy (self-hosted o API)
  - Modelo: `es_core_news_lg`
  - Named Entity Recognition
  - POS tagging
  - Dependency parsing

#### Notificaciones

- **Email:** SendGrid o Resend
  - Transaccional
  - Templates con variables
  - Tracking de opens/clicks

- **SMS:** Twilio
  - Solo tier Pro
  - Verificación por código

- **Telegram:** Bot API
  - Bot propio (@datosabiertosBot)
  - Webhook para mensajes

- **Push:** Firebase Cloud Messaging
  - Multi-platform (web, Android, iOS)
  - Topics para broadcasting

#### Auth

- **Authentication:** Supabase Auth o Auth.js (NextAuth)
  - Email/password
  - OAuth (Google, GitHub)
  - Magic links
  - JWT tokens + refresh

#### Pagos

- **Payments:** Stripe
  - Subscripciones recurrentes
  - Webhooks para eventos
  - Customer portal

#### Monitoring

- **Errors:** Sentry
  - Error tracking frontend + backend
  - Performance monitoring
  - User feedback

- **Analytics:** Plausible o Umami
  - Privacy-friendly
  - GDPR compliant
  - Self-hosted option

---

## 🗄️ SCHEMA DE BASE DE DATOS

### Tablas Principales

```sql
-- Usuarios y autenticación
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  profession VARCHAR(100),
  sector VARCHAR(100),
  interests JSONB, -- array de intereses
  preferences JSONB, -- UI preferences
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Búsquedas guardadas
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  query TEXT,
  filters JSONB,
  sort_by VARCHAR(50),
  last_executed_at TIMESTAMP,
  result_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id)
);

-- Favoritos
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id VARCHAR(255) NOT NULL, -- ID del BOE
  document_data JSONB, -- caché del documento
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, document_id),
  INDEX idx_user_id (user_id),
  INDEX idx_document_id (document_id)
);

-- Alertas
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  criteria JSONB NOT NULL, -- filtros de búsqueda
  frequency VARCHAR(20) NOT NULL, -- immediate, daily, weekly
  channels JSONB, -- [email, sms, telegram, push]
  active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMP,
  next_check_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_active_next_check (active, next_check_at)
);

-- Canales de notificación del usuario
CREATE TABLE user_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel_type VARCHAR(20) NOT NULL, -- email, sms, telegram, push
  channel_value TEXT NOT NULL, -- email address, phone, chat_id, token
  verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, channel_type, channel_value)
);

-- Documentos seguidos (para detector de cambios)
CREATE TABLE document_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id VARCHAR(255) NOT NULL,
  content_hash VARCHAR(64), -- SHA-256 del contenido
  last_checked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, document_id),
  INDEX idx_document_id (document_id)
);

-- Caché de documentos BOE
CREATE TABLE documents (
  id VARCHAR(255) PRIMARY KEY, -- ID oficial BOE
  boe_date DATE NOT NULL,
  section VARCHAR(10),
  type VARCHAR(50),
  title TEXT NOT NULL,
  organism VARCHAR(255),
  content TEXT,
  metadata JSONB,
  pdf_url VARCHAR(500),
  html_url VARCHAR(500),
  xml_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_boe_date (boe_date),
  INDEX idx_section_type (section, type)
);

-- Resúmenes generados por IA
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id VARCHAR(255) REFERENCES documents(id),
  summary TEXT NOT NULL,
  key_points JSONB, -- array de puntos clave
  model_used VARCHAR(50), -- claude-haiku, gpt-4o-mini
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id),
  INDEX idx_document_id (document_id)
);

-- Versiones de documentos (para comparador)
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id VARCHAR(255) NOT NULL,
  version_date DATE NOT NULL,
  content TEXT NOT NULL,
  content_hash VARCHAR(64),
  diff_from_previous TEXT, -- pre-computado
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_document_id_date (document_id, version_date)
);

-- Suscripciones (freemium)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL, -- free, pro, enterprise
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(20), -- active, canceled, past_due
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_stripe_customer_id (stripe_customer_id)
);
```

---

## 🔌 INTEGRACIONES DE APIs

### 1. API Oficial del BOE

**Endpoint:** `https://boe.es/datosabiertos/api/`

**Uso:**
- Proxy a través de nuestro backend
- Caché agresivo (Redis + DB)
- Scraping complementario para datos no disponibles en API

**Rate Limiting:**
- Sin límite oficial documentado
- Implementar rate limiting propio: max 10 req/s
- Retry con exponential backoff

**Endpoints principales:**
```typescript
// Sumario diario
GET /boe/sumario/{YYYYMMDD}

// Documento específico
GET /boe/dias/{YYYYMMDD}/pdfs/{BOE-CODIGO}.pdf

// Legislación consolidada
GET /legislacion-consolidada/api/...
```

### 2. Anthropic Claude API (IA)

**Uso:** Resúmenes automáticos

**Configuración:**
```typescript
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Usar modelo Haiku para coste-eficiencia
const model = 'claude-3-5-haiku-20241022'

// Prompt optimizado
const systemPrompt = `
Eres un asistente experto en resumir documentos legales españoles.
Genera resúmenes en lenguaje claro y accesible para ciudadanos sin
conocimientos jurídicos. Máximo 4 líneas.
`
```

**Rate Limits:**
- 4,000 requests/min (tier 2)
- 400,000 tokens/min
- Caché obligatorio

**Costes estimados:**
- Haiku: $1 / 1M input tokens, $5 / 1M output
- Estimado: ~$50-100/mes en fase inicial

### 3. Meilisearch (Búsqueda)

**Instalación:** Self-hosted o Cloud

**Configuración de Índices:**
```typescript
// Índice principal de documentos
const documentsIndex = client.index('documents')

await documentsIndex.updateSettings({
  searchableAttributes: [
    'title',
    'content',
    'organism',
    'summary'
  ],
  filterableAttributes: [
    'boe_date',
    'section',
    'type',
    'organism',
    'status'
  ],
  sortableAttributes: [
    'boe_date',
    'relevance'
  ],
  rankingRules: [
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness'
  ]
})
```

**Sincronización:**
- Webhook desde scraper BOE
- Background job nocturno para re-indexar
- Incremental updates en tiempo real

### 4. Twilio (SMS)

**Uso:** Notificaciones SMS (tier Pro)

**Configuración:**
```typescript
const twilioClient = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// Enviar SMS
await twilioClient.messages.create({
  body: 'Nueva alerta BOE: ...',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: userPhone
})
```

**Costes:**
- ~$0.075 por SMS en España
- Estimado: Variable según usuarios Pro

### 5. Telegram Bot API

**Setup:**
```bash
# Crear bot con @BotFather
# Obtener token

# Configurar webhook
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d url=https://datosenabierto.es/api/telegram/webhook
```

**Implementación:**
```typescript
// Webhook handler
export default defineEventHandler(async (event) => {
  const update = await readBody(event)

  if (update.message?.text === '/start') {
    // Vincular chat_id con usuario
    await linkTelegramUser(update.message.from.id)
  }

  // Enviar notificación
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: user.telegram_chat_id,
      text: message,
      parse_mode: 'Markdown'
    })
  })
})
```

---

## ⚙️ WORKERS Y JOBS

### CRON Jobs

```typescript
// Nuxt config - nitro scheduled tasks
export default defineNuxtConfig({
  nitro: {
    scheduledTasks: {
      // Scraper BOE diario - 7am
      '0 7 * * *': ['tasks:scrape-daily-boe'],

      // Checker de alertas - cada hora
      '0 * * * *': ['tasks:check-alerts'],

      // Detector de cambios - noche
      '0 2 * * *': ['tasks:detect-document-changes'],

      // Cleanup de caché antiguo - semanal
      '0 3 * * 0': ['tasks:cleanup-old-cache'],

      // Pre-generar resúmenes populares - madrugada
      '0 4 * * *': ['tasks:pregenerate-summaries']
    }
  }
})
```

### Background Jobs (Bull Queue)

```typescript
import { Queue } from 'bullmq'

// Queues
const alertQueue = new Queue('alerts', { connection: redisConnection })
const summaryQueue = new Queue('summaries', { connection: redisConnection })
const notificationQueue = new Queue('notifications', { connection: redisConnection })

// Workers
const alertWorker = new Worker('alerts', async (job) => {
  const { alertId } = job.data
  await processAlert(alertId)
}, { connection: redisConnection })

// Job types
- alerts:check - Ejecutar criterios de alerta
- summaries:generate - Generar resumen con IA
- notifications:send - Enviar notificación multi-canal
- documents:index - Indexar en Meilisearch
- documents:compare - Generar diff de versiones
```

---

## 🔒 SEGURIDAD

### Authentication & Authorization

```typescript
// Middleware de autenticación
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const session = await verifyJWT(token)
  event.context.user = session.user
})

// Middleware de tier check
export const requirePro = defineEventHandler(async (event) => {
  if (event.context.user.tier === 'free') {
    throw createError({ statusCode: 403, message: 'Pro tier required' })
  }
})
```

### Rate Limiting

```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible'

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl',
  points: 100, // requests
  duration: 60, // per 60 seconds
})

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event)

  try {
    await rateLimiter.consume(ip)
  } catch (error) {
    throw createError({ statusCode: 429, message: 'Too many requests' })
  }
})
```

### Content Security Policy

```typescript
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          'http-equiv': 'Content-Security-Policy',
          content: `
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval';
            style-src 'self' 'unsafe-inline';
            img-src 'self' data: https:;
            font-src 'self' data:;
            connect-src 'self' https://boe.es https://api.anthropic.com;
          `
        }
      ]
    }
  }
})
```

---

## 📊 MONITORING Y OBSERVABILIDAD

### Metrics

```typescript
// server/middleware/metrics.ts
export default defineEventHandler((event) => {
  const start = Date.now()

  event.node.res.on('finish', () => {
    const duration = Date.now() - start

    // Log métricas
    metrics.record({
      route: event.path,
      method: event.method,
      status: event.node.res.statusCode,
      duration,
      user_id: event.context.user?.id
    })
  })
})
```

### Error Tracking (Sentry)

```typescript
import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // No enviar datos sensibles
    if (event.user) {
      delete event.user.email
      delete event.user.ip_address
    }
    return event
  }
})
```

---

## 🚀 DESPLIEGUE

### Hosting Recomendado

**Opción 1: Netlify (actual)**
- ✅ Ya configurado
- ✅ Gratis para empezar
- ✅ Edge functions
- ❌ Límites de ejecución (10s)
- ❌ No ideal para workers

**Opción 2: Vercel**
- Similar a Netlify
- Mejor integración Nuxt
- Serverless functions

**Opción 3: Cloudflare Pages + Workers (Recomendado)**
- ✅ Global CDN
- ✅ Workers ilimitados
- ✅ R2 storage incluido
- ✅ Pricing competitivo
- ✅ WebSockets support

**Opción 4: Railway / Render**
- ✅ Full control
- ✅ Long-running workers
- ✅ Databases managed
- 💰 Más caro

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
```

---

## 📦 ESTRUCTURA DEL PROYECTO

```
datosenabierto.es/
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── test.yml
├── app/
│   └── router.options.ts
├── assets/
│   ├── css/
│   │   ├── tailwind.css
│   │   └── components.css
│   └── images/
├── components/
│   ├── base/
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   ├── Badge.vue
│   │   ├── Input.vue
│   │   └── Modal.vue
│   ├── search/
│   │   ├── SearchBar.vue
│   │   ├── SearchFilters.vue
│   │   └── SearchResults.vue
│   ├── document/
│   │   ├── DocumentCard.vue
│   │   ├── DocumentDetail.vue
│   │   └── DocumentCompare.vue
│   └── layout/
│       ├── Header.vue
│       ├── Footer.vue
│       └── Sidebar.vue
├── composables/
│   ├── useBOE.ts
│   ├── useSearch.ts
│   ├── useAlerts.ts
│   ├── useAuth.ts
│   └── useFavorites.ts
├── docs/
│   ├── RESEARCH_ANALYSIS.md
│   ├── FEATURES_MATRIX.md
│   ├── USER_STORIES.md
│   ├── UI_UX_DESIGN.md
│   └── TECHNICAL_ARCHITECTURE.md
├── layouts/
│   ├── default.vue
│   └── dashboard.vue
├── middleware/
│   ├── auth.ts
│   └── pro-tier.ts
├── pages/
│   ├── index.vue
│   ├── search.vue
│   ├── explore/
│   │   ├── index.vue
│   │   └── [section].vue
│   ├── dashboard/
│   │   ├── index.vue
│   │   ├── favorites.vue
│   │   └── alerts.vue
│   └── settings/
│       ├── profile.vue
│       └── subscription.vue
├── plugins/
│   ├── v-calendar.client.ts
│   ├── sentry.client.ts
│   └── pwa.client.ts
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── sw.js
├── server/
│   ├── api/
│   │   ├── boe/
│   │   │   └── sumario/[date].ts
│   │   ├── search/
│   │   │   ├── index.post.ts
│   │   │   └── autocomplete.get.ts
│   │   ├── auth/
│   │   │   ├── register.post.ts
│   │   │   └── login.post.ts
│   │   ├── alerts/
│   │   │   ├── index.get.ts
│   │   │   └── [id].ts
│   │   ├── ai/
│   │   │   └── summarize.post.ts
│   │   └── users/
│   │       └── me.get.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rate-limit.ts
│   │   └── metrics.ts
│   ├── tasks/
│   │   ├── scrape-daily-boe.ts
│   │   ├── check-alerts.ts
│   │   └── detect-changes.ts
│   ├── utils/
│   │   ├── db.ts
│   │   ├── redis.ts
│   │   ├── meilisearch.ts
│   │   └── ai.ts
│   └── tsconfig.json
├── stores/
│   ├── user.ts
│   ├── search.ts
│   └── alerts.ts
├── types/
│   ├── boe.ts
│   ├── user.ts
│   └── alert.ts
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── drizzle.config.ts
├── nuxt.config.ts
├── package.json
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📝 PRÓXIMOS PASOS

1. ✅ Arquitectura técnica definida
2. ✅ Stack tecnológico especificado
3. ✅ Integraciones planeadas
4. 🔄 **Crear plan de sprints detallado** (siguiente)
5. ⏳ Setup inicial de infraestructura
6. ⏳ Comenzar implementación Fase 1

---

**Documento creado:** 24/11/2025
**Última actualización:** 24/11/2025
**Versión:** 1.0
