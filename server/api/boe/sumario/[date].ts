import type { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const date = event.context.params?.date;

  if (!date || !/^\d{8}$/.test(date)) {
    throw createError({
      statusCode: 400,
      message: "Fecha inválida. El formato debe ser YYYYMMDD",
    });
  }

  try {
    const response = await fetch(
      `https://boe.es/datosabiertos/api/boe/sumario/${date}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
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

    // Se obtiene la respuesta en JSON directamente
    const jsonData = await response.json();

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

    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || "Error al obtener los datos del BOE",
    });
  }
});
