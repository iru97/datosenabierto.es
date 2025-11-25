# Scripts de Procesamiento BOE

Este directorio contiene scripts para probar y ejecutar el procesamiento del BOE.

## Test de Procesamiento

### `test-processing.ts`

Script de prueba que descarga y procesa una muestra pequeña de documentos BOE para verificar que todo el sistema funciona correctamente.

**Qué hace:**
1. Descarga documentos del BOE de los últimos 2 días
2. Los clasifica por categoría usando keywords
3. Procesa 3 documentos de muestra con los agentes LLM (4 fases)
4. Guarda los resultados en Supabase
5. Muestra un resumen detallado de los resultados

**Cómo ejecutar:**

```bash
npm run test:processing
```

**Variables de entorno requeridas:**
- `SUPABASE_URL` - URL de tu proyecto Supabase
- `SUPABASE_SERVICE_KEY` - Service key de Supabase (con permisos totales)
- `OPENAI_API_KEY` - API key de OpenAI

**Coste estimado:**
- ~$0.003 por los 3 documentos de prueba (muy económico)
- Usa GPT-4o-mini que es muy barato ($0.15/1M tokens input, $0.60/1M output)

**Salida esperada:**
- Resumen de documentos descargados y clasificados
- Detalles de cada documento procesado
- Tokens usados y coste total
- Muestra de las explicaciones generadas por cada fase
- Confirmación de guardado en Supabase

**Verificar resultados:**
1. Ve a tu panel de Supabase
2. Revisa las tablas:
   - `documentos_boe` - Documentos procesados con datos estructurados
   - `explicaciones_llm` - Explicaciones generadas (resumen, que_es, como_afecta, etc.)
3. Prueba la interfaz web para ver cómo se visualizan los datos

## Troubleshooting

### Error: "Cannot find module 'openai'"
Instala el paquete OpenAI:
```bash
npm install openai
```

### Error: "OPENAI_API_KEY is not defined"
Crea un archivo `.env` en la raíz del proyecto con:
```
OPENAI_API_KEY=tu-api-key-aqui
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-key-aqui
```

### Error de conexión a Supabase
Verifica que:
- Las variables de entorno estén correctamente configuradas
- El service key tenga permisos suficientes
- Las tablas existan en Supabase (ejecuta el schema.sql si no)

### No se encuentran documentos
- El BOE puede no tener documentos algunos días (festivos, fines de semana)
- Intenta aumentar `DIAS_ATRAS` en el script a 7 días
