# 🚀 Guía de Setup de Supabase

Esta guía te ayudará a configurar Supabase para el proyecto datosenabierto.es paso a paso.

---

## 📋 Requisitos Previos

- [ ] Cuenta en [Supabase](https://supabase.com) (gratis)
- [ ] Acceso al proyecto en GitHub
- [ ] Variables de entorno configuradas

---

## 🔧 Paso 1: Crear Proyecto en Supabase

1. **Ir a Supabase Dashboard:**
   - Visita: https://supabase.com/dashboard
   - Haz clic en "New Project"

2. **Configurar el proyecto:**
   - **Name:** `datosenabierto-es` (o el nombre que prefieras)
   - **Database Password:** Genera una contraseña segura (guárdala, la necesitarás)
   - **Region:** Elige `Europe West (eu-west-1)` para menor latencia en España
   - **Pricing Plan:** Free Tier es suficiente para empezar

3. **Esperar a que se cree:**
   - El proyecto tardará ~2 minutos en estar listo
   - Verás una barra de progreso

---

## 🗄️ Paso 2: Ejecutar el Schema SQL

1. **Abrir SQL Editor:**
   - En el dashboard de tu proyecto, ve a la pestaña **"SQL Editor"**
   - O directo: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

2. **Crear una nueva query:**
   - Haz clic en **"New query"**

3. **Copiar el schema completo:**
   - Abre el archivo `supabase/schema.sql` de este proyecto
   - Copia TODO el contenido (es un archivo grande)

4. **Pegar y ejecutar:**
   - Pega el contenido en el editor SQL
   - Haz clic en **"Run"** (esquina inferior derecha)
   - Deberías ver: ✅ "Success. No rows returned"

5. **Verificar que se creó correctamente:**
   - Ve a **"Table Editor"** en el sidebar
   - Deberías ver 9 tablas creadas:
     - ✅ `categorias` (con 12 filas insertadas)
     - ✅ `documentos_boe`
     - ✅ `explicaciones_llm`
     - ✅ `estadisticas_categorias`
     - ✅ `faqs`
     - ✅ `favoritos`
     - ✅ `alertas_usuario`
     - ✅ `procesamiento_log`
     - ✅ `feedback_usuarios`

---

## 🔑 Paso 3: Obtener las API Keys

1. **Ir a Settings:**
   - En el sidebar, haz clic en **"Settings"** (⚙️)
   - Luego en **"API"**

2. **Copiar las siguientes credenciales:**

   **a) Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   - Copia esta URL completa

   **b) Anon (public) Key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - Esta key es **segura para usar en el cliente**
   - Se puede exponer públicamente

   **c) Service Role Key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - ⚠️ Esta key es **SECRETA**
   - **NUNCA** la expongas en el cliente
   - Solo para Netlify Functions

---

## 🔐 Paso 4: Configurar Variables de Entorno

### Desarrollo Local

1. **Crear archivo .env:**
   ```bash
   cp .env.example .env
   ```

2. **Editar .env con tus valores:**
   ```bash
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Verificar que funciona:**
   ```bash
   npm run dev
   ```

### Netlify (Producción)

1. **Ir a Netlify Dashboard:**
   - Ve a: https://app.netlify.com/sites/YOUR_SITE_NAME/settings/env

2. **Agregar variables:**
   - Haz clic en **"Add a variable"**
   - Agrega una por una:

   | Key | Value | Scopes |
   |-----|-------|--------|
   | `SUPABASE_URL` | `https://xxx.supabase.co` | All |
   | `SUPABASE_ANON_KEY` | `eyJhbG...` | All |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Functions only |

3. **Re-deploy:**
   - Después de agregar las variables, haz un nuevo deploy
   - O haz clic en **"Trigger deploy"**

---

## ✅ Paso 5: Verificar la Instalación

### Opción 1: Verificar desde Supabase

1. **Ir a Table Editor:**
   - Abre la tabla `categorias`
   - Deberías ver **12 categorías** insertadas:
     - Oposiciones
     - Ayudas
     - Legislación
     - Nombramientos
     - Licitaciones
     - Educación
     - Vivienda
     - Empleo
     - Medio Ambiente
     - Tráfico
     - Salud
     - Tecnología

2. **Verificar índices:**
   - Ve a **"Database"** > **"Indexes"**
   - Deberías ver múltiples índices creados

3. **Verificar RLS:**
   - Ve a **"Authentication"** > **"Policies"**
   - Deberías ver políticas para `favoritos` y `alertas_usuario`

### Opción 2: Verificar desde tu app

1. **Crear un archivo de test:**

   ```typescript
   // test/supabase-test.ts
   import { getCategorias } from '~/utils/supabase'

   async function testSupabase() {
     console.log('🧪 Testing Supabase connection...')

     const categorias = await getCategorias()

     if (categorias.length === 12) {
       console.log('✅ Supabase connected successfully!')
       console.log('📋 Categorías encontradas:', categorias.length)
       categorias.forEach(cat => {
         console.log(`   - ${cat.icono} ${cat.nombre} (prioridad: ${cat.prioridad})`)
       })
     } else {
       console.error('❌ Error: Expected 12 categorias, got', categorias.length)
     }
   }

   testSupabase()
   ```

2. **Ejecutar el test:**
   ```bash
   npx tsx test/supabase-test.ts
   ```

3. **Output esperado:**
   ```
   🧪 Testing Supabase connection...
   ✅ Supabase connected successfully!
   📋 Categorías encontradas: 12
      - 📝 Oposiciones y Concursos (prioridad: 3)
      - 💰 Subvenciones y Ayudas (prioridad: 3)
      - ⚖️ Cambios Legislativos (prioridad: 3)
      - 👔 Nombramientos y Ceses (prioridad: 2)
      ...
   ```

---

## 🎯 Paso 6: Configurar RLS (Row Level Security)

El schema ya incluye las políticas de RLS básicas, pero puedes personalizarlas:

1. **Ir a Authentication > Policies:**
   - https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/policies

2. **Políticas actuales:**

   **favoritos:**
   - Users can view own favorites ✅
   - Users can insert own favorites ✅
   - Users can update own favorites ✅
   - Users can delete own favorites ✅

   **alertas_usuario:**
   - Users can view own alerts ✅
   - Users can insert own alerts ✅
   - Users can update own alerts ✅
   - Users can delete own alerts ✅

3. **Las demás tablas son de lectura pública:**
   - `categorias`: Lectura pública ✅
   - `documentos_boe`: Lectura pública ✅
   - `explicaciones_llm`: Lectura pública ✅
   - `estadisticas_categorias`: Lectura pública ✅
   - `faqs`: Lectura pública ✅

---

## 📊 Paso 7: Configurar Límites (Free Tier)

El Free Tier de Supabase incluye:

| Recurso | Límite Free |
|---------|-------------|
| Database | 500 MB |
| Bandwidth | 5 GB |
| File Storage | 1 GB |
| Auth Users | Ilimitados |
| API Requests | Ilimitadas |
| Paused after | 7 días inactividad |

**Para este proyecto:**
- Estimamos ~100 MB de datos en el primer año
- ~1 GB de bandwidth mensual
- Muy por debajo de los límites ✅

**Para monitorear:**
- Ve a **"Settings"** > **"Usage"**
- Revisa semanalmente

---

## 🔄 Paso 8: Backup Automático

Supabase hace backups automáticos:

1. **Free Tier:**
   - Backups diarios por 7 días
   - No se pueden descargar directamente

2. **Para backups manuales:**
   ```bash
   # Instalar Supabase CLI
   npm install -g supabase

   # Login
   supabase login

   # Backup manual
   supabase db dump -f backup.sql
   ```

3. **Programar backups semanales:**
   - Usar GitHub Actions (opcional)
   - Guardar en repositorio privado

---

## 🐛 Troubleshooting

### Problema: "relation 'categorias' does not exist"

**Solución:**
- El schema no se ejecutó correctamente
- Volver al Paso 2 y ejecutar `schema.sql` nuevamente

### Problema: "Invalid API key"

**Solución:**
- Verificar que copiaste las keys correctamente
- Asegúrate de que no hay espacios extra
- Verifica en Supabase Dashboard que el proyecto esté activo

### Problema: "Row Level Security policy violation"

**Solución:**
- Verificar que las políticas RLS se crearon
- Para tablas públicas (categorias, documentos_boe), NO deben tener RLS habilitado
- Para tablas privadas (favoritos, alertas), SÍ debe estar habilitado

### Problema: "Connection timeout"

**Solución:**
- Verificar que el proyecto Supabase no esté pausado
- Free tier se pausa después de 7 días de inactividad
- Ir al dashboard y hacer clic en "Restore"

---

## 📚 Recursos Adicionales

- **Supabase Docs:** https://supabase.com/docs
- **API Reference:** https://supabase.com/docs/reference/javascript
- **Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security
- **Community:** https://github.com/supabase/supabase/discussions

---

## ✨ Próximos Pasos

Una vez completado el setup de Supabase:

1. ✅ Instalar dependencias necesarias
2. ✅ Crear el proxy API para BOE
3. ✅ Implementar la función semanal de procesamiento
4. ✅ Desarrollar procesadores por categoría
5. ✅ Construir la UI educativa

Continuar con la implementación según `docs/ARQUITECTURA_FINAL.md` ➡️

---

**¡Setup completado! 🎉**
