# Netlify Functions

Esta carpeta contiene las funciones serverless de Netlify que se ejecutan automáticamente o bajo demanda.

---

## 📦 Funciones Disponibles

### 1. `scheduled-weekly-processing.ts` ⏰

**Tipo:** Scheduled Function (automática)
**Schedule:** Cada domingo a las 7:00 AM UTC
**Timeout:** 15 minutos
**Descripción:** Procesa todos los documentos BOE de la semana anterior

**¿Qué hace?**

1. Obtiene todos los sumarios del BOE de la semana anterior (domingo a sábado)
2. Clasifica cada documento en una de las 12 categorías usando keywords
3. Extrae datos estructurados de cada documento
4. Genera 3 tipos de explicaciones con Claude 3.5 Haiku:
   - **Resumen:** Breve resumen del documento (2-3 frases)
   - **Qué es:** Explicación clara de qué es el documento
   - **Cómo afecta:** A quién afecta y cómo
5. Guarda todo en Supabase (documentos + explicaciones)
6. Genera estadísticas semanales por categoría
7. Registra logs de ejecución con costos y métricas

**Costos estimados:**
- ~500 documentos/semana
- ~2,500 llamadas al LLM (3 por documento + estadísticas)
- **~$5-20 USD/semana** con Claude 3.5 Haiku

---

## 🧪 Testing Local

### Opción 1: Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Ejecutar función localmente (CRON trigger simulado)
netlify functions:invoke scheduled-weekly-processing
```

### Opción 2: Test Script Manual

Crear un script de test que ejecute la lógica principal:

```typescript
// test/test-weekly-processing.ts
import { handler } from '../netlify/functions/scheduled-weekly-processing'

async function test() {
  // Simular evento de Netlify
  const event = {
    body: '',
    headers: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/.netlify/functions/scheduled-weekly-processing',
    queryStringParameters: {},
  }

  const result = await handler(event, {} as any)
  console.log('Result:', result)
}

test()
```

Ejecutar:
```bash
npx tsx test/test-weekly-processing.ts
```

---

## 🔧 Variables de Entorno Requeridas

Estas variables deben estar configuradas en Netlify:

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # ⚠️ SECRET, solo funciones

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-api03-...  # ⚠️ SECRET

# Opcional
BOE_API_RATE_LIMIT=30
```

**Configurar en Netlify:**
1. Ir a: Site Settings > Environment variables
2. Agregar cada variable
3. Para `SUPABASE_SERVICE_ROLE_KEY` y `ANTHROPIC_API_KEY`, marcar como **"Functions only"**

---

## 📊 Monitoreo

### Ver Logs de Ejecución

**En Netlify Dashboard:**
1. Ir a: Functions > scheduled-weekly-processing
2. Ver logs de ejecuciones recientes
3. Ver métricas de duración y errores

**En Supabase:**
```sql
-- Ver últimas ejecuciones
SELECT * FROM procesamiento_log
ORDER BY fecha_inicio DESC
LIMIT 10;

-- Ver ejecución con error
SELECT * FROM procesamiento_log
WHERE estado = 'error'
ORDER BY fecha_inicio DESC;

-- Ver costos totales
SELECT
  DATE(fecha_inicio) as fecha,
  SUM(total_costo_estimado) as costo_total,
  SUM(total_documentos_procesados) as docs_procesados
FROM procesamiento_log
WHERE estado = 'completado'
GROUP BY DATE(fecha_inicio)
ORDER BY fecha DESC;
```

### Alertas Recomendadas

Configurar alertas para:
- ❌ Ejecución fallida (estado = 'error')
- ⏱️ Duración > 10 minutos
- 💰 Costo > $30/semana
- 📉 Documentos procesados = 0

---

## 🐛 Troubleshooting

### Error: "SUPABASE_URL is not defined"

**Solución:** Agregar variables de entorno en Netlify Dashboard

### Error: "Anthropic API key is invalid"

**Solución:**
1. Verificar API key en https://console.anthropic.com/settings/keys
2. Regenerar si es necesario
3. Actualizar en Netlify

### Error: "Rate limit exceeded"

**Solución:**
- BOE API tiene rate limiting
- La función ya implementa delays entre requests
- Si persiste, aumentar delays en `sleep()` calls

### Timeout después de 15 minutos

**Solución:**
- 15 minutos es el máximo en Netlify
- Si se excede regularmente, considerar:
  1. Reducir llamadas a LLM (solo resumen)
  2. Procesar solo categorías prioritarias
  3. Dividir en múltiples funciones

### Costos muy altos

**Solución:**
1. Ver logs de tokens usados en `procesamiento_log`
2. Reducir `max_tokens` en prompts
3. Procesar menos documentos por semana
4. Usar modelo más barato (pero menos bueno)

---

## 🚀 Despliegue

La función se despliega automáticamente con cada push a la rama principal.

**Verificar despliegue:**
```bash
# Ver status del deploy
netlify status

# Ver funciones deployadas
netlify functions:list

# Ver logs en tiempo real
netlify functions:log scheduled-weekly-processing
```

---

## 📚 Referencias

- [Netlify Scheduled Functions](https://docs.netlify.com/functions/scheduled-functions/)
- [Netlify Functions Timeout](https://docs.netlify.com/functions/configure-and-deploy/#configure-the-functions-directory)
- [Anthropic API Docs](https://docs.anthropic.com/claude/reference)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

---

## 📝 Notas Adicionales

### Cambiar el horario

Editar en `netlify.toml`:

```toml
[[functions]]
  name = "scheduled-weekly-processing"
  schedule = "0 7 * * 0"  # Formato CRON
  #          ┬ ┬ ┬ ┬ ┬
  #          │ │ │ │ └─ Día de la semana (0-6, 0=Domingo)
  #          │ │ │ └─── Mes (1-12)
  #          │ │ └───── Día del mes (1-31)
  #          │ └─────── Hora (0-23)
  #          └───────── Minuto (0-59)
```

**Ejemplos:**
- `0 7 * * 0` - Domingos 7:00 AM
- `0 0 * * 1` - Lunes 12:00 AM (medianoche)
- `30 8 * * 1-5` - Lunes a Viernes 8:30 AM

### Ejecutar manualmente

Crear una función HTTP regular que llame a la lógica:

```typescript
// netlify/functions/trigger-processing.ts
import { Handler } from '@netlify/functions'
import { handler as scheduledHandler } from './scheduled-weekly-processing'

export const handler: Handler = async (event, context) => {
  // Verificar autenticación (importante!)
  const authHeader = event.headers['authorization']
  if (authHeader !== `Bearer ${process.env.MANUAL_TRIGGER_SECRET}`) {
    return {
      statusCode: 401,
      body: 'Unauthorized'
    }
  }

  // Ejecutar procesamiento
  return await scheduledHandler(event, context)
}
```

Luego:
```bash
curl -X POST https://tu-sitio.netlify.app/.netlify/functions/trigger-processing \
  -H "Authorization: Bearer tu-secret-key"
```

---

**¡La función está lista para procesar BOEs automáticamente cada semana! 🎉**
