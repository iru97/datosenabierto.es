import type { H3Event } from "h3";
import { format, eachDayOfInterval, parseISO } from "date-fns";

/**
 * API Proxy para obtener sumarios del BOE en un rango de fechas
 *
 * @route GET /api/boe/range
 * @query desde - Fecha inicio en formato YYYY-MM-DD
 * @query hasta - Fecha fin en formato YYYY-MM-DD
 * @returns Array de sumarios para cada día del rango
 *
 * @example
 * fetch('/api/boe/range?desde=2025-01-20&hasta=2025-01-26')
 *
 * NOTA: Este endpoint hace múltiples llamadas al BOE API
 * y puede tardar varios segundos. Usar con precaución.
 */
export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const desde = query.desde as string;
  const hasta = query.hasta as string;

  // Validación de parámetros
  if (!desde || !hasta) {
    throw createError({
      statusCode: 400,
      message:
        "Parámetros 'desde' y 'hasta' son requeridos en formato YYYY-MM-DD",
    });
  }

  // Validación de formato de fechas
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(desde) || !dateRegex.test(hasta)) {
    throw createError({
      statusCode: 400,
      message: "Formato de fecha inválido. Usa YYYY-MM-DD",
    });
  }

  try {
    // Parsear fechas
    const startDate = parseISO(desde);
    const endDate = parseISO(hasta);

    // Validar que la fecha desde es anterior a hasta
    if (startDate > endDate) {
      throw createError({
        statusCode: 400,
        message: "La fecha 'desde' debe ser anterior a 'hasta'",
      });
    }

    // Validar que el rango no sea muy grande (máximo 30 días)
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > 30) {
      throw createError({
        statusCode: 400,
        message: "El rango máximo permitido es de 30 días",
      });
    }

    // Obtener todas las fechas del rango
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    // Función helper para fetch con retry
    const fetchWithRetry = async (
      url: string,
      retries = 2
    ): Promise<any> => {
      for (let i = 0; i <= retries; i++) {
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "User-Agent": "datosenabierto.es/1.0",
            },
          });

          if (response.ok) {
            return await response.json();
          }

          // Si es 404, retornar null (no hay boletín ese día)
          if (response.status === 404) {
            return null;
          }

          // Si no es el último intento, esperar antes de reintentar
          if (i < retries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
            continue;
          }

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (error) {
          if (i === retries) throw error;
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    };

    // Procesar fechas en lotes para no sobrecargar la API
    const batchSize = 3;
    const results: any[] = [];

    for (let i = 0; i < dates.length; i += batchSize) {
      const batch = dates.slice(i, i + batchSize);

      // Fetch en paralelo dentro del lote
      const batchPromises = batch.map(async (date) => {
        const dateStr = format(date, "yyyyMMdd");
        const apiUrl = `https://boe.es/datosabiertos/api/boe/sumario/${dateStr}`;

        try {
          const data = await fetchWithRetry(apiUrl);

          return {
            fecha: format(date, "yyyy-MM-dd"),
            fecha_boe: dateStr,
            disponible: data !== null,
            sumario: data?.data?.sumario || { diario: [] },
          };
        } catch (error) {
          console.error(`Error fetching BOE for ${dateStr}:`, error);
          return {
            fecha: format(date, "yyyy-MM-dd"),
            fecha_boe: dateStr,
            disponible: false,
            error: "Error al obtener datos",
            sumario: { diario: [] },
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Pequeña pausa entre lotes para ser amigables con la API
      if (i + batchSize < dates.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Cache moderado para rangos (1 hora)
    setResponseHeaders(event, {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    });

    return {
      response: {
        status: {
          code: 200,
          text: "ok",
        },
        data: {
          desde: desde,
          hasta: hasta,
          total_dias: dates.length,
          dias_con_boletin: results.filter((r) => r.disponible).length,
          resultados: results,
        },
      },
    };
  } catch (error: any) {
    console.error("Error fetching BOE range:", error);

    // No cachear errores
    setResponseHeaders(event, {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Error al obtener el rango de fechas del BOE",
    });
  }
});
