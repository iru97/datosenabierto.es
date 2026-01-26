import type { H3Event } from "h3";

/**
 * API Proxy para obtener sumarios del BOE por fecha
 *
 * @route GET /api/boe/sumario/:date
 * @param date - Fecha en formato YYYYMMDD
 * @returns Sumario del BOE para la fecha especificada
 *
 * @example
 * fetch('/api/boe/sumario/20250124')
 */
export default defineEventHandler(async (event: H3Event) => {
  const date = event.context.params?.date;

  // Validación de fecha
  if (!date || !/^\d{8}$/.test(date)) {
    throw createError({
      statusCode: 400,
      message: "Fecha inválida. El formato debe ser YYYYMMDD",
    });
  }

  try {
    // Llamada a la API oficial del BOE
    const response = await fetch(
      `https://boe.es/datosabiertos/api/boe/sumario/${date}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "datosenabierto.es/1.0", // Identificarnos
        },
      }
    );

    // Manejar respuesta 404 (no hay boletín para esa fecha)
    if (!response.ok) {
      if (response.status === 404) {
        // Cache 404s por 1 hora (probablemente es fin de semana o festivo)
        setResponseHeaders(event, {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        });

        return {
          response: {
            status: {
              code: 404,
              text: "No hay boletín disponible para esta fecha",
            },
            data: {
              sumario: {
                diario: [],
              },
            },
          },
        };
      }

      throw createError({
        statusCode: response.status,
        message: `Error al obtener los datos del BOE: ${response.statusText}`,
      });
    }

    // Parsear respuesta JSON
    const jsonData = await response.json();

    // Configurar headers de cache
    // Los sumarios son inmutables una vez publicados, así que cache agresivo
    setResponseHeaders(event, {
      "Cache-Control": "public, max-age=86400, s-maxage=86400", // 24 horas
      "CDN-Cache-Control": "max-age=604800", // 7 días en CDN
    });

    return {
      response: {
        status: {
          code: 200,
          text: "ok",
        },
        data: {
          sumario: jsonData.data.sumario || {
            diario: [],
          },
        },
      },
    };
  } catch (error: any) {
    console.error("Error fetching BOE data:", error);

    // No cachear errores
    setResponseHeaders(event, {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });

    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || "Error al obtener los datos del BOE",
    });
  }
});
