import type { H3Event } from "h3";

/**
 * API Proxy para obtener el detalle de un documento BOE específico
 *
 * @route GET /api/boe/documento/:id
 * @param id - ID del documento BOE (ej: "BOE-A-2025-12345")
 * @param format - Formato de respuesta: json (default) o xml
 * @returns Detalle completo del documento
 *
 * @example
 * fetch('/api/boe/documento/BOE-A-2025-12345')
 * fetch('/api/boe/documento/BOE-A-2025-12345?format=xml')
 */
export default defineEventHandler(async (event: H3Event) => {
  const id = event.context.params?.id;
  const query = getQuery(event);
  const format = (query.format as string) || "json";

  // Validación de ID
  if (!id || !/^BOE-[A-Z]-\d{4}-\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      message:
        "ID de documento inválido. El formato debe ser BOE-A-YYYY-NNNNN",
    });
  }

  // Validación de formato
  if (!["json", "xml"].includes(format)) {
    throw createError({
      statusCode: 400,
      message: "Formato inválido. Usa 'json' o 'xml'",
    });
  }

  try {
    // Construir URL según formato
    const apiUrl =
      format === "xml"
        ? `https://boe.es/datosabiertos/api/boe/${id}.xml`
        : `https://boe.es/datosabiertos/api/boe/${id}`;

    // Llamada a la API oficial del BOE
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: format === "xml" ? "application/xml" : "application/json",
        "User-Agent": "datosenabierto.es/1.0",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw createError({
          statusCode: 404,
          message: `Documento ${id} no encontrado`,
        });
      }

      throw createError({
        statusCode: response.status,
        message: `Error al obtener el documento: ${response.statusText}`,
      });
    }

    // Configurar headers de cache
    // Los documentos son inmutables, cache muy agresivo
    setResponseHeaders(event, {
      "Cache-Control": "public, max-age=2592000, s-maxage=2592000", // 30 días
      "CDN-Cache-Control": "max-age=31536000", // 1 año en CDN
      "Content-Type":
        format === "xml" ? "application/xml" : "application/json",
    });

    // Devolver según formato
    if (format === "xml") {
      const xmlText = await response.text();
      return xmlText;
    } else {
      const jsonData = await response.json();
      return jsonData;
    }
  } catch (error: any) {
    console.error(`Error fetching BOE document ${id}:`, error);

    // No cachear errores
    setResponseHeaders(event, {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Error al obtener el documento del BOE",
    });
  }
});
