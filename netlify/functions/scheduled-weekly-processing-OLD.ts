/**
 * NETLIFY SCHEDULED FUNCTION: Procesamiento Semanal del BOE
 *
 * Esta función se ejecuta automáticamente cada domingo a las 7:00 AM UTC
 * para procesar todos los documentos BOE de la semana anterior.
 *
 * FLUJO:
 * 1. Obtener todos los sumarios de la semana pasada
 * 2. Clasificar documentos por categoría
 * 3. Extraer datos estructurados de cada documento
 * 4. Generar explicaciones con Claude AI
 * 5. Guardar en Supabase
 * 6. Generar estadísticas semanales
 *
 * Schedule: Domingos 7:00 AM UTC (configurado en netlify.toml)
 * Timeout: 15 minutos
 * Modelo LLM: Claude 3.5 Haiku (económico y rápido)
 */

import { schedule } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/supabase";
import {
  fetchWeekSumarios,
  extractAllDocuments,
  filterByKeywords,
  KEYWORDS_BY_CATEGORY,
  type BOEDocumento,
  type CategoriaSlug,
} from "../../utils/boe-api";
import {
  subDays,
  startOfWeek,
  endOfWeek,
  format,
  previousSunday,
  previousSaturday,
} from "date-fns";

// ================================================================
// CONFIGURACIÓN
// ================================================================

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY!;

// Crear clientes
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
const anthropic = new Anthropic({ apiKey: anthropicApiKey });

// Configuración LLM
const LLM_MODEL = "claude-3-5-haiku-20241022";
const LLM_MAX_TOKENS = 1024;

// ================================================================
// TIPOS
// ================================================================

interface ProcessingStats {
  total_documentos_procesados: number;
  total_explicaciones_generadas: number;
  total_tokens_usados: number;
  total_costo_estimado: number;
  documentos_por_categoria: Record<string, number>;
  errores: string[];
}

// ================================================================
// FUNCIÓN PRINCIPAL
// ================================================================

const handler = schedule("0 7 * * 0", async (event) => {
  console.log("🚀 Iniciando procesamiento semanal del BOE...");

  const startTime = new Date();
  const stats: ProcessingStats = {
    total_documentos_procesados: 0,
    total_explicaciones_generadas: 0,
    total_tokens_usados: 0,
    total_costo_estimado: 0,
    documentos_por_categoria: {},
    errores: [],
  };

  // Calcular semana anterior (domingo a sábado)
  const hoy = new Date();
  const dominioAnterior = previousSunday(hoy);
  const sabadoAnterior = previousSaturday(hoy);

  const semanaInicio = format(dominioAnterior, "yyyy-MM-dd");
  const semanaFin = format(sabadoAnterior, "yyyy-MM-dd");

  console.log(`📅 Procesando semana: ${semanaInicio} a ${semanaFin}`);

  // Crear registro en log
  const { data: logData, error: logError } = await supabase
    .from("procesamiento_log")
    .insert({
      fecha_inicio: startTime.toISOString(),
      semana_procesada_inicio: semanaInicio,
      semana_procesada_fin: semanaFin,
      estado: "iniciado",
    })
    .select()
    .single();

  if (logError) {
    console.error("❌ Error creando log:", logError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error creando log" }),
    };
  }

  const logId = logData.id;

  try {
    // ================================================================
    // PASO 1: OBTENER CATEGORÍAS
    // ================================================================
    console.log("📋 Obteniendo categorías...");

    const { data: categorias, error: categoriasError } = await supabase
      .from("categorias")
      .select("*")
      .eq("activa", true);

    if (categoriasError || !categorias) {
      throw new Error(`Error obteniendo categorías: ${categoriasError?.message}`);
    }

    console.log(`✅ ${categorias.length} categorías activas encontradas`);

    // ================================================================
    // PASO 2: OBTENER SUMARIOS DE LA SEMANA
    // ================================================================
    console.log("🔍 Obteniendo sumarios de la semana...");

    const sumarios = await fetchWeekSumarios(dominioAnterior, sabadoAnterior);
    const todosDocs: BOEDocumento[] = [];

    for (const sumario of sumarios) {
      if (sumario.disponible) {
        const docs = extractAllDocuments(sumario.sumario);
        todosDocs.push(
          ...docs.map((doc) => ({
            ...doc,
            fecha_publicacion: sumario.fecha,
          }))
        );
      }
    }

    console.log(`✅ ${todosDocs.length} documentos encontrados en la semana`);

    // ================================================================
    // PASO 3: CLASIFICAR Y PROCESAR DOCUMENTOS
    // ================================================================
    console.log("🏷️ Clasificando documentos por categoría...");

    for (const categoria of categorias) {
      const categoriaSlug = categoria.slug as CategoriaSlug;
      const keywords = KEYWORDS_BY_CATEGORY[categoriaSlug] || [];

      if (keywords.length === 0) {
        console.log(`⚠️ No hay keywords definidas para ${categoria.nombre}`);
        continue;
      }

      // Filtrar documentos de esta categoría
      const docsCategoría = filterByKeywords(todosDocs, keywords);

      console.log(`📝 ${categoria.nombre}: ${docsCategoría.length} documentos`);

      stats.documentos_por_categoria[categoria.slug] = docsCategoría.length;

      // Procesar cada documento
      for (const doc of docsCategoría) {
        try {
          await procesarDocumento(doc, categoria, stats);
          stats.total_documentos_procesados++;
        } catch (error) {
          const errorMsg = `Error procesando ${doc.id}: ${error}`;
          console.error(`❌ ${errorMsg}`);
          stats.errores.push(errorMsg);
        }

        // Pequeña pausa para no saturar APIs
        await sleep(200);
      }
    }

    // ================================================================
    // PASO 4: GENERAR ESTADÍSTICAS SEMANALES
    // ================================================================
    console.log("📊 Generando estadísticas semanales...");

    for (const categoria of categorias) {
      try {
        await generarEstadisticasCategoria(
          categoria,
          semanaInicio,
          semanaFin,
          stats
        );
      } catch (error) {
        const errorMsg = `Error generando estadísticas para ${categoria.nombre}: ${error}`;
        console.error(`❌ ${errorMsg}`);
        stats.errores.push(errorMsg);
      }
    }

    // ================================================================
    // PASO 5: ACTUALIZAR LOG
    // ================================================================
    const endTime = new Date();

    await supabase
      .from("procesamiento_log")
      .update({
        fecha_fin: endTime.toISOString(),
        total_documentos_procesados: stats.total_documentos_procesados,
        total_explicaciones_generadas: stats.total_explicaciones_generadas,
        total_tokens_usados: stats.total_tokens_usados,
        total_costo_estimado: stats.total_costo_estimado,
        estado: "completado",
        metadata: {
          documentos_por_categoria: stats.documentos_por_categoria,
          errores: stats.errores,
          duracion_minutos:
            (endTime.getTime() - startTime.getTime()) / 1000 / 60,
        },
      })
      .eq("id", logId);

    console.log("✅ Procesamiento completado!");
    console.log(`📊 Estadísticas finales:`, stats);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        stats,
        duracion_minutos:
          (endTime.getTime() - startTime.getTime()) / 1000 / 60,
      }),
    };
  } catch (error) {
    console.error("❌ Error fatal en procesamiento:", error);

    // Actualizar log con error
    await supabase
      .from("procesamiento_log")
      .update({
        fecha_fin: new Date().toISOString(),
        estado: "error",
        error_mensaje: error instanceof Error ? error.message : String(error),
        total_documentos_procesados: stats.total_documentos_procesados,
        total_explicaciones_generadas: stats.total_explicaciones_generadas,
        total_tokens_usados: stats.total_tokens_usados,
        total_costo_estimado: stats.total_costo_estimado,
        metadata: {
          documentos_por_categoria: stats.documentos_por_categoria,
          errores: stats.errores,
        },
      })
      .eq("id", logId);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        stats,
      }),
    };
  }
});

// ================================================================
// FUNCIONES AUXILIARES
// ================================================================

/**
 * Procesa un documento individual:
 * - Lo guarda en la base de datos
 * - Genera explicaciones con LLM
 */
async function procesarDocumento(
  doc: BOEDocumento,
  categoria: any,
  stats: ProcessingStats
): Promise<void> {
  // Verificar si ya existe
  const { data: existente } = await supabase
    .from("documentos_boe")
    .select("id")
    .eq("boe_id", doc.id)
    .single();

  if (existente) {
    console.log(`⏭️ Documento ${doc.id} ya existe, saltando...`);
    return;
  }

  // Extraer datos estructurados básicos
  const datosEstructurados = extractDatosEstructurados(doc, categoria.slug);

  // Insertar documento
  const { data: docInsertado, error: docError } = await supabase
    .from("documentos_boe")
    .insert({
      boe_id: doc.id,
      categoria_id: categoria.id,
      fecha_publicacion: doc.fecha_publicacion,
      titulo: doc.titulo,
      seccion: doc.seccion,
      departamento: doc.departamento,
      rango: doc.rango,
      url_pdf: doc.url_pdf,
      url_xml: doc.url_xml,
      datos_estructurados: datosEstructurados,
      keywords: extractKeywords(doc.titulo, categoria.slug),
      procesado: false,
    })
    .select()
    .single();

  if (docError || !docInsertado) {
    throw new Error(`Error insertando documento: ${docError?.message}`);
  }

  // Generar explicaciones con LLM
  const tiposExplicacion = ["resumen", "que_es", "como_afecta"];

  for (const tipo of tiposExplicacion) {
    try {
      const explicacion = await generarExplicacionLLM(
        doc,
        tipo,
        categoria.slug
      );

      await supabase.from("explicaciones_llm").insert({
        documento_id: docInsertado.id,
        tipo: tipo,
        contenido: explicacion.contenido,
        modelo_usado: LLM_MODEL,
        tokens_usados: explicacion.tokens_usados,
        tokens_input: explicacion.tokens_input,
        tokens_output: explicacion.tokens_output,
      });

      stats.total_explicaciones_generadas++;
      stats.total_tokens_usados += explicacion.tokens_usados;

      // Claude 3.5 Haiku: $1/1M input, $5/1M output
      const costoInput = (explicacion.tokens_input / 1_000_000) * 1;
      const costoOutput = (explicacion.tokens_output / 1_000_000) * 5;
      stats.total_costo_estimado += costoInput + costoOutput;
    } catch (error) {
      console.error(
        `Error generando explicación ${tipo} para ${doc.id}:`,
        error
      );
    }
  }

  // Marcar como procesado
  await supabase
    .from("documentos_boe")
    .update({
      procesado: true,
      procesado_at: new Date().toISOString(),
    })
    .eq("id", docInsertado.id);
}

/**
 * Genera una explicación usando Claude AI
 */
async function generarExplicacionLLM(
  doc: BOEDocumento,
  tipo: string,
  categoriaSlug: string
): Promise<{
  contenido: string;
  tokens_usados: number;
  tokens_input: number;
  tokens_output: number;
}> {
  const prompt = construirPrompt(doc, tipo, categoriaSlug);

  const message = await anthropic.messages.create({
    model: LLM_MODEL,
    max_tokens: LLM_MAX_TOKENS,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const contenido =
    message.content[0].type === "text" ? message.content[0].text : "";

  return {
    contenido,
    tokens_usados: message.usage.input_tokens + message.usage.output_tokens,
    tokens_input: message.usage.input_tokens,
    tokens_output: message.usage.output_tokens,
  };
}

/**
 * Construye el prompt para el LLM según el tipo de explicación
 */
function construirPrompt(
  doc: BOEDocumento,
  tipo: string,
  categoriaSlug: string
): string {
  const baseContext = `
Documento del BOE:
- Título: ${doc.titulo}
- Sección: ${doc.seccion}
- Departamento: ${doc.departamento}
- Rango: ${doc.rango || "No especificado"}
- Categoría: ${categoriaSlug}
`;

  switch (tipo) {
    case "resumen":
      return `${baseContext}

Genera un resumen muy breve (máximo 2-3 frases) de este documento del BOE.
Usa lenguaje sencillo y directo, como si le hablaras a un ciudadano.
NO uses términos técnicos legales innecesarios.`;

    case "que_es":
      return `${baseContext}

Explica de forma muy clara qué es este documento y para qué sirve.
Responde como si respondieras: "¿Qué es esto?"
Máximo 3-4 frases, lenguaje sencillo.`;

    case "como_afecta":
      return `${baseContext}

Explica de forma muy clara a quién afecta este documento y cómo.
Responde como si respondieras: "¿Cómo me afecta?"
Sé específico sobre los grupos de personas o empresas afectadas.
Máximo 3-4 frases, lenguaje sencillo.`;

    default:
      return baseContext;
  }
}

/**
 * Extrae datos estructurados básicos del documento
 */
function extractDatosEstructurados(doc: BOEDocumento, categoriaSlug: string): any {
  // Aquí iría lógica más sofisticada con regex para extraer datos específicos
  // Por ahora retornamos estructura básica
  return {
    titulo_original: doc.titulo,
    seccion: doc.seccion,
    departamento: doc.departamento,
    rango: doc.rango,
    categoria: categoriaSlug,
  };
}

/**
 * Extrae keywords del título del documento
 */
function extractKeywords(titulo: string, categoriaSlug: string): string[] {
  const keywords: string[] = [];
  const tituloLower = titulo.toLowerCase();

  // Agregar keywords de la categoría que aparezcan en el título
  const categoriasKeywords = KEYWORDS_BY_CATEGORY[categoriaSlug as CategoriaSlug];
  if (categoriasKeywords) {
    for (const keyword of categoriasKeywords) {
      if (tituloLower.includes(keyword.toLowerCase())) {
        keywords.push(keyword);
      }
    }
  }

  return [...new Set(keywords)]; // Remover duplicados
}

/**
 * Genera estadísticas semanales para una categoría
 */
async function generarEstadisticasCategoria(
  categoria: any,
  semanaInicio: string,
  semanaFin: string,
  stats: ProcessingStats
): Promise<void> {
  // Obtener documentos de esta categoría en la semana
  const { data: documentos } = await supabase
    .from("documentos_boe")
    .select("*")
    .eq("categoria_id", categoria.id)
    .gte("fecha_publicacion", semanaInicio)
    .lte("fecha_publicacion", semanaFin);

  if (!documentos || documentos.length === 0) {
    console.log(`⏭️ No hay documentos para ${categoria.nombre}, saltando...`);
    return;
  }

  // Generar resumen semanal con LLM
  const promptEstadisticas = `
Documentos BOE de la categoría "${categoria.nombre}" esta semana:
Total de documentos: ${documentos.length}

Algunos títulos:
${documentos
  .slice(0, 10)
  .map((d) => `- ${d.titulo}`)
  .join("\n")}

Genera:
1. Un resumen breve de lo más destacado de la semana (2-3 frases)
2. Las tendencias principales que observas (2-3 puntos)
3. Los insights más importantes para los ciudadanos (2-3 puntos)

Usa lenguaje claro y sencillo.
`;

  try {
    const message = await anthropic.messages.create({
      model: LLM_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: promptEstadisticas }],
    });

    const contenido =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parsear respuesta (simple, mejorar en el futuro)
    const partes = contenido.split("\n\n");
    const resumen = partes[0] || contenido;
    const tendencias = partes[1] || "";
    const insights = partes[2] || "";

    await supabase.from("estadisticas_categorias").insert({
      categoria_id: categoria.id,
      semana_inicio: semanaInicio,
      semana_fin: semanaFin,
      total_documentos: documentos.length,
      documentos_importantes: Math.min(5, documentos.length),
      resumen_semanal: resumen,
      tendencias: tendencias,
      insights: insights,
      documentos_destacados: documentos.slice(0, 5).map((d) => d.id),
      modelo_usado: LLM_MODEL,
      tokens_usados: message.usage.input_tokens + message.usage.output_tokens,
    });

    stats.total_tokens_usados +=
      message.usage.input_tokens + message.usage.output_tokens;

    const costoInput = (message.usage.input_tokens / 1_000_000) * 1;
    const costoOutput = (message.usage.output_tokens / 1_000_000) * 5;
    stats.total_costo_estimado += costoInput + costoOutput;
  } catch (error) {
    console.error(
      `Error generando estadísticas para ${categoria.nombre}:`,
      error
    );
  }
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { handler };
