# Sistema de Agentes LLM Especializados
## Prompts y Estrategias de Extracción por Categoría

**Fecha:** 24 de Noviembre, 2025
**Versión:** 1.0
**Propósito:** Definir prompts específicos para cada categoría del BOE

---

## 📋 TABLA DE CONTENIDOS

1. [Filosofía de Prompting](#filosofía-de-prompting)
2. [Agentes por Categoría](#agentes-por-categoría)
3. [Ejemplos Input/Output](#ejemplos-inputoutput)
4. [Optimización de Tokens](#optimización-de-tokens)
5. [Control de Calidad](#control-de-calidad)

---

## 🎯 FILOSOFÍA DE PROMPTING

### Principios Fundamentales

1. **Corto y Específico**
   - Máximo 500 tokens por prompt
   - Instrucciones claras y directas
   - Sin contexto innecesario

2. **Orientado a Resultados**
   - Formato de salida especificado
   - Ejemplos cuando sea necesario
   - Validación estructurada

3. **Lenguaje Simple**
   - Explicaciones para ciudadanos normales
   - Sin jerga legal
   - Ejemplos prácticos

4. **Contextual**
   - Usar datos extraídos (Nivel 2)
   - Referencias a campos específicos
   - Personalizado por categoría

### Template Base

```typescript
const BASE_TEMPLATE = `
Eres {{rol}}. Tu objetivo es {{objetivo}}.

Contexto:
{{contexto}}

Datos del documento:
{{datos}}

Tarea:
{{tarea_especifica}}

Formato de respuesta:
{{formato}}

Restricciones:
- Máximo {{max_palabras}} palabras
- Lenguaje simple y claro
- Sin jerga técnica
- Ejemplos prácticos cuando sea relevante
`
```

---

## 🎓 CATEGORÍA: OPOSICIONES

### Agente 1: Resumidor

```typescript
const OPOSICIONES_RESUMEN = `
Eres un asesor de empleo público. Resume esta convocatoria de oposición en 3-4 líneas que cualquier persona pueda entender.

Datos:
- Título: {{titulo}}
- Organismo: {{departamento}}
- Plazas: {{num_plazas}}
- Tipo: {{tipo_convocatoria}}

Formato:
[Organismo] convoca [número] plazas de [puesto]. Es para [quién puede presentarse]. Plazo hasta [fecha].

Máximo 80 palabras.
`

// Ejemplo Output:
// "El Ministerio de Educación convoca 150 plazas de Maestro de Educación Primaria.
//  Es para personas con el título de Grado en Educación Primaria.
//  Puedes inscribirte hasta el 15 de diciembre de 2025."
```

### Agente 2: Explicador de Puesto

```typescript
const OPOSICIONES_QUE_HACE_PUESTO = `
Explica en 2-3 párrafos cortos qué hace un {{puesto}} en su trabajo diario.

Usa lenguaje simple y ejemplos concretos. Imagina que le explicas a alguien de 16 años que no sabe nada del sector público.

Estructura:
1. ¿En qué consiste el trabajo?
2. Tareas principales
3. Dónde trabaja y con quién

Máximo 150 palabras.
`

// Ejemplo Output para "Auxiliar Administrativo":
// "Un Auxiliar Administrativo trabaja en oficinas públicas haciendo tareas de organización
//  y atención al público. Su día a día incluye responder emails, archivar documentos,
//  atender llamadas telefónicas y ayudar a otros trabajadores con trámites.
//
//  Sus tareas principales son: gestionar el correo (digital y físico), archivar expedientes,
//  hacer fotocopias, escanear documentos, y llevar el registro de entradas y salidas de documentos.
//
//  Trabaja en ministerios, ayuntamientos, consejerías u otros organismos públicos.
//  Suele trabajar en equipo con otros administrativos y bajo la supervisión de un jefe de sección."
```

### Agente 3: Requisitos Explicados

```typescript
const OPOSICIONES_REQUISITOS = `
Tienes estos requisitos oficiales de una oposición:
{{requisitos_raw}}

Explica CADA requisito de forma que cualquiera lo entienda.

Para cada requisito, especifica:
1. Qué significa en lenguaje simple
2. Cómo lo demuestras (qué documentos necesitas)
3. Alternativas válidas si las hay

Formato por requisito:
📋 Requisito oficial: [texto literal]
✅ Qué significa: [explicación simple]
📄 Cómo lo demuestro: [documentos necesarios]
🔄 Alternativas: [si las hay, o "No hay alternativas"]

Máximo 250 palabras total.
`

// Ejemplo Output:
// 📋 Requisito oficial: "Estar en posesión o en condiciones de obtener el título de Grado"
// ✅ Qué significa: Necesitas haber terminado la universidad (carrera de 4 años)
// 📄 Cómo lo demuestro: Con tu título universitario o certificado de haber aprobado todo
// 🔄 Alternativas: Si estudiaste antes de 2010, una Licenciatura o Diplomatura también vale
//
// 📋 Requisito oficial: "Tener cumplidos 16 años y no exceder de la edad máxima de jubilación"
// ✅ Qué significa: Debes tener mínimo 16 años y máximo 65 años
// 📄 Cómo lo demuestro: Con tu DNI (la fecha de nacimiento)
// 🔄 Alternativas: No hay alternativas
```

### Agente 4: Guía de Inscripción

```typescript
const OPOSICIONES_COMO_INSCRIBIRME = `
Genera una guía paso a paso para inscribirse en esta oposición.

Datos:
- Plazo: {{fecha_inicio}} hasta {{fecha_fin}}
- URL: {{url_inscripcion}}
- Tasa: {{tasa_inscripcion}}

Crea una lista numerada con pasos CONCRETOS y ACCIONABLES.
Incluye: qué hacer, dónde, qué documentos necesito, cuánto cuesta.

Formato:
1️⃣ [Paso 1]
2️⃣ [Paso 2]
...

Máximo 200 palabras.
`

// Ejemplo Output:
// 1️⃣ Reúne estos documentos antes de empezar:
//    - DNI escaneado
//    - Título universitario o certificado de notas
//    - Certificado de empadronamiento (pide cita en tu ayuntamiento)
//
// 2️⃣ Entra en la web: https://sede.educacion.gob.es
//    - Necesitas certificado digital o Cl@ve
//    - Si no tienes, pide cita en tu ayuntamiento para el certificado
//
// 3️⃣ Rellena el formulario online:
//    - Sube los documentos escaneados
//    - Revisa bien todos los datos antes de enviar
//
// 4️⃣ Paga la tasa de inscripción:
//    - Coste: 35€
//    - Puedes pagar con tarjeta online
//    - Guarda el justificante de pago
//
// 5️⃣ Envía la solicitud antes del 15 de diciembre de 2025
```

### Agente 5: Guía de Preparación

```typescript
const OPOSICIONES_COMO_PREPARAR = `
Eres un preparador de oposiciones. Da consejos prácticos para preparar esta oposición.

Datos:
- Puesto: {{puesto}}
- Tipo de prueba: {{tipo_prueba}}
- Temario: {{tiene_temario}}

Crea una guía con:
1. Qué materiales necesito
2. Cuánto tiempo estudiar (estimación realista)
3. Estrategia de estudio
4. Recursos gratuitos disponibles

Máximo 250 palabras. Sé realista y honesto.
`

// Ejemplo Output:
// 📚 Materiales necesarios:
// - Temario oficial (descargable gratis en la web de la convocatoria)
// - Tests de años anteriores (búscalos en www.funcionpublica.gob.es)
// - Libros especializados (opcional, unos 60-80€)
//
// ⏱️ Tiempo de preparación:
// Si partes de cero: 6-8 meses estudiando 2-3 horas diarias
// Si ya trabajas en el sector: 3-4 meses con 1-2 horas diarias
// Ten en cuenta que el examen será competitivo (muchos candidatos por plaza)
//
// 📖 Estrategia de estudio:
// 1. Lee el temario completo una vez (1 mes)
// 2. Estudia tema por tema haciendo resúmenes (3-4 meses)
// 3. Haz tests y simulacros (1-2 meses finales)
// 4. Repasa los temas con más peso en el examen
//
// 🆓 Recursos gratuitos:
// - Temario oficial: web de la convocatoria
// - Tests: www.funcionpublica.gob.es
// - Grupos de estudio: busca en Telegram "oposiciones maestro 2025"
// - Vídeos: YouTube tiene explicaciones de muchos temas
```

---

## 💰 CATEGORÍA: AYUDAS Y SUBVENCIONES

### Agente 1: Resumidor

```typescript
const AYUDAS_RESUMEN = `
Resume esta subvención en 3-4 líneas claras.

Datos:
- Título: {{titulo}}
- Organismo: {{departamento}}
- Cuantía: {{cuantia_min}} - {{cuantia_max}}
- Para: {{beneficiarios}}

Formato:
[Organismo] ofrece ayudas de [cuantía] para [finalidad]. Pueden pedirla [quién]. Plazo hasta [fecha].

Máximo 80 palabras.
`
```

### Agente 2: ¿Quién Puede Pedirla?

```typescript
const AYUDAS_QUIEN_PUEDE = `
Explica de forma SUPER SIMPLE quién puede pedir esta ayuda.

Requisitos oficiales:
{{requisitos}}

Para cada requisito, di si la persona PROMEDIO lo cumple o no.
Usa ejemplos concretos y números reales.

Formato:
✅ Requisito que cumple casi todo el mundo
⚠️ Requisito que cumple solo algunos
❌ Requisito restrictivo

Máximo 200 palabras.
`

// Ejemplo Output:
// ✅ Ser mayor de 18 años
//    Casi todo el mundo lo cumple. Simplemente necesitas ser adulto.
//
// ⚠️ Tener ingresos inferiores a 3 veces el IPREM
//    El IPREM de 2025 es 7,200€/año, así que 3 veces = 21,600€/año brutos.
//    Si cobras menos de 1,800€/mes brutos, SÍ cumples este requisito.
//    Aproximadamente el 40% de españoles cumple este requisito.
//
// ❌ Estar empadronado en municipios de menos de 5,000 habitantes
//    Solo el 15% de españoles vive en pueblos pequeños.
//    Si vives en ciudad, NO puedes pedir esta ayuda.
//
// ✅ No haber recibido otras ayudas similares en los últimos 2 años
//    Si es la primera vez que pides esta ayuda, cumples el requisito.
```

### Agente 3: Cómo Solicitarla

```typescript
const AYUDAS_COMO_SOLICITAR = `
Genera una guía paso a paso para solicitar esta subvención.

Datos:
- Plazo: {{fecha_inicio}} - {{fecha_fin}}
- Sede electrónica: {{url_solicitud}}
- Documentación: {{documentos_necesarios}}

Crea pasos SUPER concretos. Di exactamente dónde conseguir cada documento.

Formato:
Paso 1: [Acción concreta]
  ↳ Dónde: [URL o lugar físico]
  ↳ Coste: [si lo tiene]
  ↳ Tiempo: [cuánto tarda]

Máximo 300 palabras.
`
```

### Agente 4: Gastos Permitidos

```typescript
const AYUDAS_GASTOS_PERMITIDOS = `
Explica EN QUÉ SE PUEDE GASTAR esta subvención.

Gastos elegibles oficiales:
{{gastos_elegibles}}

Gastos excluidos oficiales:
{{gastos_excluidos}}

Para cada tipo de gasto, pon ejemplos CONCRETOS del día a día.

Formato:
✅ PUEDES GASTAR EN:
• [Categoría]: Ejemplos reales: [ejemplos]

❌ NO PUEDES GASTAR EN:
• [Categoría]: Por ejemplo: [ejemplos]

⚠️ IMPORTANTE:
[Advertencias o excepciones importantes]

Máximo 250 palabras.
`

// Ejemplo Output (ayuda digitalización PYME):
// ✅ PUEDES GASTAR EN:
// • Software y licencias: Office 365, programa de facturación, CRM, herramientas diseño
// • Hardware: Ordenadores, tablets, impresoras, routers, servidores
// • Páginas web: Diseño, dominio, hosting, ecommerce
// • Formación: Cursos online para empleados (máximo 20% del total)
//
// ❌ NO PUEDES GASTAR EN:
// • Móviles o teléfonos: Aunque sean para la empresa, no están permitidos
// • Consumibles: Tóner, papel, cables, fundas
// • Alquileres: Hosting que sea alquiler mensual sin compra
// • Reparaciones: Solo compra nueva, no arreglar equipos viejos
//
// ⚠️ IMPORTANTE:
// - Guarda TODAS las facturas (digitales o físicas)
// - Las compras deben hacerse DESPUÉS de solicitar la ayuda
// - Las facturas deben estar a nombre de la empresa, no tuyo personal
// - Tienes 6 meses para gastar el dinero desde que te lo conceden
```

### Agente 5: Ejemplo de Cálculo

```typescript
const AYUDAS_EJEMPLO_CALCULO = `
Crea un ejemplo práctico y realista de cuánto dinero recibiría una persona típica.

Datos:
- Porcentaje subvencionable: {{porcentaje}}%
- Cuantía mínima: {{cuantia_min}}
- Cuantía máxima: {{cuantia_max}}
- Límites: {{limites}}

Inventa un CASO REAL con números concretos.
Muestra el cálculo paso a paso.

Formato:
📊 EJEMPLO PRÁCTICO:

Situación: [Describe persona/empresa típica]

Gastos previstos:
• [Concepto 1]: XXX€
• [Concepto 2]: XXX€
Total gastos: XXX€

Cálculo de la ayuda:
1. [Paso 1]: XXX€
2. [Paso 2]: XXX€
💰 Total ayuda: XXX€

Máximo 200 palabras.
`

// Ejemplo Output (ayuda Kit Digital):
// 📊 EJEMPLO PRÁCTICO:
//
// Situación: María tiene una peluquería con 2 empleados. Quiere digitalizarse.
//
// Gastos previstos:
// • Página web con reservas online: 2,000€
// • Software de gestión de citas: 800€
// • 2 tablets para el negocio: 600€
// • Curso de redes sociales: 300€
// Total gastos: 3,700€
//
// Cálculo de la ayuda:
// 1. Empresa de 1-2 empleados → Kit de 2,000€
// 2. Como sus gastos (3,700€) superan el kit (2,000€), recibe el máximo
// 3. La ayuda cubre 100% hasta 2,000€
//
// 💰 Total ayuda: 2,000€
//
// María pagaría:
// - Ayuda cubre: 2,000€
// - Ella paga de su bolsillo: 1,700€
// - Total inversión: 3,700€ (ahorro del 54%)
```

---

## ⚖️ CATEGORÍA: CAMBIOS LEGISLATIVOS

### Agente 1: Resumidor

```typescript
const LEGISLACION_RESUMEN = `
Resume este cambio legislativo en lenguaje de periódico (no legal).

Datos:
- Tipo: {{rango}} (Ley/Real Decreto/Orden)
- Título: {{titulo}}
- Departamento: {{departamento}}

Formato:
El [organismo] aprueba [qué cambia]. Afecta a [quién]. Entra en vigor [cuándo].

Máximo 80 palabras. Como si lo contaras en el bar.
`
```

### Agente 2: ¿Qué Cambia Exactamente?

```typescript
const LEGISLACION_QUE_CAMBIA = `
Extrae del texto QUÉ ARTÍCULOS O NORMAS SE MODIFICAN y explícalos.

Texto legal:
{{contenido}}

Para cada cambio:
1. Qué norma/artículo cambia
2. Qué decía antes (si lo sabes o puedes inferir)
3. Qué dice ahora
4. Por qué es importante

Formato:
📜 Artículo X de [Ley/Norma]

ANTES: [Texto o resumen anterior]
AHORA: [Nuevo texto resumido]

💡 Por qué importa: [Explicación práctica]

Máximo 300 palabras.
`
```

### Agente 3: Comparativa Antes vs Ahora

```typescript
const LEGISLACION_ANTES_VS_AHORA = `
Crea una tabla comparativa clara de antes vs ahora.

Datos del cambio:
{{contenido}}

Usa una tabla con ejemplos concretos y números reales.

Formato:
| Situación | ANTES | AHORA |
|-----------|-------|--------|
| [Ejemplo 1] | [Cómo era] | [Cómo es] |
| [Ejemplo 2] | [Cómo era] | [Cómo es] |

✅ Beneficiados: [Quién sale ganando]
⚠️ Perjudicados: [Quién sale perdiendo]

Máximo 250 palabras.
`

// Ejemplo Output (subida SMI):
// | Situación | ANTES (2024) | AHORA (2025) |
// |-----------|--------------|--------------|
// | Salario mínimo mensual | 1,080€ | 1,134€ |
// | Salario mínimo anual (14 pagas) | 15,120€ | 15,876€ |
// | Trabajador media jornada (20h) | 540€/mes | 567€/mes |
// | Trabajador por horas | 7.2€/hora | 7.56€/hora |
//
// ✅ Beneficiados:
// • 2.5 millones de trabajadores con salario mínimo
// • Trabajadores a tiempo parcial
// • Empleadas de hogar
// • Trabajadores agrícolas temporales
//
// ⚠️ Costes para:
// • Empresas pequeñas (deben pagar más)
// • Autónomos con empleados
// • Sector hostelería (muchos trabajadores afectados)
```

### Agente 4: ¿Cómo Me Afecta?

```typescript
const LEGISLACION_COMO_ME_AFECTA = `
Explica cómo este cambio afecta a PERSONAS NORMALES en su día a día.

Datos:
- Cambio: {{resumen_cambio}}
- Ámbito: {{ambito_aplicacion}}
- Entrada en vigor: {{fecha_vigor}}

Crea 3-4 escenarios de personas reales.

Formato:
👤 Perfil: [Tipo de persona]
📍 Situación: [Su caso concreto]
🎯 Cómo le afecta: [Impacto directo]
📋 Qué debe hacer: [Acción necesaria, si la hay]

Máximo 300 palabras.
`

// Ejemplo Output (nueva Ley de Vivienda):
// 👤 Perfil: Laura, 28 años, alquila un piso en Madrid
// 📍 Situación: Paga 950€/mes por un piso de 60m²
// 🎯 Cómo le afecta: Su casero no puede subirle el alquiler más del 3% este año
// 📋 Qué debe hacer: Nada. La ley protege automáticamente. Si su casero sube más, puede denunciar
//
// 👤 Perfil: Carlos, 55 años, propietario de 2 pisos en alquiler
// 📍 Situación: Alquila pisos desde hace 10 años
// 🎯 Cómo le afecta: Solo puede subir alquileres un 3% máximo (antes podía 6-8%)
// 📋 Qué debe hacer: Revisar sus contratos. Si sube más, puede ser multado
//
// 👤 Perfil: Ana, 32 años, quiere alquilar su piso vacío
// 📍 Situación: Heredó un piso y quiere alquilarlo
// 🎯 Cómo le afecta: Debe registrarlo en la web de vivienda de su comunidad autónoma
// 📋 Qué debe hacer: Ir a sede.vivienda.gob.es, registrarse, y dar de alta el piso (es gratis)
```

### Agente 5: Ejemplo Práctico

```typescript
const LEGISLACION_EJEMPLO_PRACTICO = `
Inventa un caso SUPER concreto y detallado para ilustrar este cambio.

Datos:
{{resumen_cambio}}

Crea una historia corta con:
- Personaje real con nombre
- Situación específica con números
- Antes y después del cambio
- Resultado claro

Formato: Como un mini caso de estudio.

Máximo 250 palabras. Hazlo interesante y memorable.
`
```

---

## 🏢 OTRAS CATEGORÍAS (Prompts Resumidos)

### Licitaciones

```typescript
const LICITACIONES_PROMPTS = {
  resumen: `Resume esta licitación: qué contratan, quién licita, presupuesto, plazo presentación`,

  requisitos_tecnicos: `Explica en lenguaje simple los requisitos técnicos. Qué debe saber/tener la empresa para presentarse`,

  como_presentarse: `Guía paso a paso para presentar la oferta. URLs, documentos, plazos.`,

  valoracion: `Explica cómo se valorarán las ofertas. Qué criterios hay y cuánto pesa cada uno`
}
```

### Educación y Becas

```typescript
const EDUCACION_PROMPTS = {
  resumen: `Resume la beca/ayuda: para qué nivel educativo, cuantía, requisitos básicos`,

  requisitos_economicos: `Explica los requisitos de renta con ejemplos. Calcula umbrales con números reales`,

  como_solicitarla: `Pasos para solicitar. Documentación, plazos, dónde presentar`,

  ejemplo_calculo: `Ejemplo de familia típica: cuánto recibirían según su situación`
}
```

### Empleo y Relaciones Laborales

```typescript
const EMPLEO_PROMPTS = {
  resumen: `Resume el cambio laboral: qué afecta, a quién, desde cuándo`,

  antes_vs_ahora: `Tabla comparativa con ejemplos de nóminas o situaciones`,

  quien_afecta: `Lista de perfiles afectados con ejemplos concretos`,

  que_hacer: `Si eres trabajador/empresa, qué debes hacer`
}
```

---

## 📊 EJEMPLOS INPUT/OUTPUT REALES

### Ejemplo 1: Oposición Real

**INPUT (Documento BOE):**
```json
{
  "titulo": "Resolución de 18 de noviembre de 2025, de la Secretaría de Estado de Función Pública, por la que se convoca proceso selectivo para ingreso en el Cuerpo General Administrativo de la Administración del Estado",
  "datos_estructurados": {
    "num_plazas": 850,
    "tipo_convocatoria": "libre",
    "requisitos": {
      "titulacion": "Título de Bachiller o equivalente",
      "edad_min": 16,
      "edad_max": 65
    },
    "fechas": {
      "publicacion": "2025-11-19",
      "inicio_inscripcion": "2025-11-20",
      "fin_inscripcion": "2025-12-20"
    }
  }
}
```

**OUTPUT (Agente Resumidor):**
```
La Secretaría de Estado de Función Pública convoca 850 plazas de Administrativo del Estado.
Es para personas con el título de Bachiller o equivalente.
Puedes inscribirte desde el 20 de noviembre hasta el 20 de diciembre de 2025.
```

**OUTPUT (Agente Requisitos):**
```
📋 Requisito oficial: "Título de Bachiller o equivalente"
✅ Qué significa: Necesitas haber terminado Bachillerato (2 años después de la ESO)
📄 Cómo lo demuestro: Con tu título de Bachiller o certificado de notas
🔄 Alternativas: También vale FP de Grado Medio, antiguo BUP, o cualquier título universitario

📋 Requisito oficial: "Tener cumplidos 16 años"
✅ Qué significa: Debes ser mayor de 16 años (no hay edad máxima real)
📄 Cómo lo demuestro: Con tu DNI
🔄 Alternativas: No hay alternativas

📋 Requisito oficial: "Nacionalidad española o de país de la UE"
✅ Qué significa: Debes ser español o de cualquier país de Europa
📄 Cómo lo demuestro: Con tu DNI o pasaporte
🔄 Alternativas: Algunos países de fuera UE también pueden si hay convenio (pregunta)
```

---

## 💾 OPTIMIZACIÓN DE TOKENS

### Técnicas Aplicadas

#### 1. Datos Estructurados en Lugar de Texto Completo

```typescript
// ❌ MALO: Enviar todo el documento (5,000 tokens)
const prompt = `
Resume este documento del BOE:

${documentoCompleto} // 10,000 palabras de texto legal
`

// ✅ BUENO: Solo datos relevantes (200 tokens)
const prompt = `
Resume esta oposición:
- Organismo: ${datos.departamento}
- Puesto: ${datos.puesto}
- Plazas: ${datos.num_plazas}
- Requisito principal: ${datos.requisitos.titulacion}
- Plazo: hasta ${datos.fechas.fin_inscripcion}
`

// Reducción: 96% menos tokens
```

#### 2. Templates Cortos y Directos

```typescript
// ❌ MALO: Contexto largo (800 tokens)
const prompt = `
Eres un experto en comunicación de documentos oficiales con 20 años de experiencia...
[400 palabras de contexto]

Tu tarea es analizar este documento y generar...
[200 palabras de instrucciones]

Debes seguir estas pautas...
[200 palabras de restricciones]

Aquí está el documento...
`

// ✅ BUENO: Directo al grano (150 tokens)
const prompt = `
Resume esta oposición en 3 líneas simples.

Datos: ${datos}

Formato: [Organismo] convoca [N] plazas...
`

// Reducción: 81% menos tokens
```

#### 3. Reutilización de Datos Extraídos

```typescript
// ❌ MALO: LLM extrae + explica (2 llamadas)
// Llamada 1: "Extrae el número de plazas de este texto"
// Llamada 2: "Ahora explica la oposición usando esos datos"

// ✅ BUENO: Regex extrae, LLM solo explica (1 llamada)
const datos = extraerConRegex(documento) // Local, gratis
const explicacion = await llm.generar(PROMPT, datos) // 1 llamada

// Reducción: 50% menos llamadas LLM
```

#### 4. Max Tokens Limitados

```typescript
const config = {
  model: 'gpt-4o-mini',
  max_tokens: 300,      // Forzar respuestas concisas
  temperature: 0.7
}

// Beneficio: LLM no puede divagar
// Output: Respuestas de 200-250 palabras (suficiente)
```

### Resultado de Optimizaciones

**Antes de optimizar:**
- Prompt: 2,000 tokens input
- Output: 800 tokens
- Total: 2,800 tokens/doc
- Coste (GPT-4o-mini): $0.0018/doc
- 400 docs/semana: **$72/mes**

**Después de optimizar:**
- Prompt: 400 tokens input
- Output: 300 tokens
- Total: 700 tokens/doc
- Coste: $0.00045/doc
- 400 docs/semana: **$18/mes**

**Ahorro: 75%** 🎉

---

## ✅ CONTROL DE CALIDAD

### Validación de Respuestas

```typescript
class ValidadorExplicaciones {
  validar(explicacion: string, tipo: string): ValidacionResult {
    const errores: string[] = []
    const advertencias: string[] = []

    // 1. Longitud apropiada
    const palabras = explicacion.split(' ').length
    if (palabras < 50) errores.push('Demasiado corto')
    if (palabras > 500) advertencias.push('Demasiado largo')

    // 2. Sin jerga legal no explicada
    const jergaLegal = [
      'promulgación', 'deroga', 'artículo', 'disposición',
      'Real Decreto Ley', 'Orden Ministerial'
    ]
    for (const termino of jergaLegal) {
      if (explicacion.toLowerCase().includes(termino.toLowerCase())) {
        advertencias.push(`Contiene jerga legal: "${termino}"`)
      }
    }

    // 3. Tiene estructura esperada según tipo
    const estructuras = {
      'resumen': ['organismo', 'plazo', 'para'],
      'requisitos': ['requisito', 'significa', 'documento'],
      'como_hacer': ['paso', '1', '2']
    }

    const palabrasClaveNecesarias = estructuras[tipo] || []
    for (const palabra of palabrasClaveNecesarias) {
      if (!explicacion.toLowerCase().includes(palabra)) {
        errores.push(`Falta palabra clave: "${palabra}"`)
      }
    }

    // 4. Sin URLs rotas (si menciona URLs)
    const urlsEnTexto = explicacion.match(/https?:\/\/[^\s]+/g) || []
    // Aquí podríamos validar URLs, pero es opcional

    return {
      valida: errores.length === 0,
      errores,
      advertencias,
      score: this.calcularScore(errores, advertencias)
    }
  }

  private calcularScore(errores: string[], advertencias: string[]): number {
    let score = 1.0
    score -= errores.length * 0.3
    score -= advertencias.length * 0.1
    return Math.max(0, score)
  }
}
```

### Métricas de Calidad

```typescript
interface MetricasCalidad {
  // Por documento
  tokens_usados: number
  tiempo_generacion_ms: number
  score_validacion: number
  regeneraciones: number

  // Agregadas
  promedio_tokens_por_tipo: Record<string, number>
  tasa_error: number
  tiempo_promedio: number
}

// Guardado en Supabase para análisis
await supabase.from('explicaciones_llm').insert({
  documento_id,
  tipo,
  contenido,
  modelo_usado: 'gpt-4o-mini',
  tokens_usados,
  tokens_input,
  tokens_output,
  tiempo_generacion_ms,
  calidad_score: score,
  validado: score > 0.7
})
```

### Regeneración Automática si Falla

```typescript
async function generarConReintento(
  documento: Documento,
  agente: Agente,
  maxIntentos = 3
): Promise<Explicacion> {
  for (let intento = 1; intento <= maxIntentos; intento++) {
    const explicacion = await agente.ejecutar(documento)
    const validacion = validador.validar(explicacion.texto, agente.tipo)

    if (validacion.valida) {
      return explicacion
    }

    console.warn(
      `Intento ${intento} falló validación:`,
      validacion.errores
    )

    // Si es el último intento, guardar con warning
    if (intento === maxIntentos) {
      return {
        ...explicacion,
        advertencia: 'No pasó validación completa',
        errores_validacion: validacion.errores
      }
    }

    // Ajustar prompt para siguiente intento
    agente.ajustarPromptConErrores(validacion.errores)
  }
}
```

---

## 🎯 CONCLUSIONES

### Estrategia de Prompting

1. **Corto y Específico**
   - Prompts de 150-400 tokens
   - Datos estructurados, no texto completo
   - Instrucciones claras

2. **Orientado a Valor**
   - Cada explicación debe responder una pregunta real
   - Ejemplos prácticos y concretos
   - Lenguaje que entienda un adolescente

3. **Económico**
   - ~700 tokens por documento procesado
   - ~$0.0005 por explicación
   - ~$20/mes para 400 docs/semana

4. **Validado**
   - Control de calidad automático
   - Regeneración si falla
   - Métricas de rendimiento

### Próximos Pasos

1. Implementar sistema de prompts
2. Testing con documentos reales
3. Ajustar según feedback
4. Iterar y mejorar

---

**Próximo documento:** `PLAN_IMPLEMENTACION.md`
