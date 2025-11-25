/**
 * Utilidades para interactuar con la API del BOE
 *
 * Este módulo proporciona helpers para trabajar con la API oficial del BOE
 * tanto desde el cliente como desde el servidor/Netlify functions.
 */

import { format, eachDayOfInterval, parseISO } from "date-fns";
import { ProxyAgent } from "undici";

// ================================================================
// TIPOS
// ================================================================

export interface BOEDocumento {
  id: string;
  titulo: string;
  seccion: string;
  departamento: string;
  rango?: string;
  fecha_publicacion: string;
  url_pdf?: string;
  url_xml?: string;
  url_html?: string;
}

export interface BOESeccion {
  nombre: string;
  items: BOEDocumento[];
}

export interface BOESumario {
  fecha: string;
  diario: BOESeccion[];
}

export interface BOERangeResult {
  fecha: string;
  fecha_boe: string;
  disponible: boolean;
  sumario: BOESumario;
  error?: string;
}

// ================================================================
// HELPERS DE FORMATO
// ================================================================

/**
 * Convierte una fecha Date a formato BOE (YYYYMMDD)
 */
export function dateToBoeDateString(date: Date): string {
  return format(date, "yyyyMMdd");
}

/**
 * Convierte un string de fecha BOE (YYYYMMDD) a Date
 */
export function boeDateStringToDate(boeDate: string): Date {
  const year = boeDate.substring(0, 4);
  const month = boeDate.substring(4, 6);
  const day = boeDate.substring(6, 8);
  return parseISO(`${year}-${month}-${day}`);
}

/**
 * Extrae el ID del documento desde una URL del BOE
 *
 * @example
 * extractDocumentIdFromUrl('https://boe.es/diario_boe/txt.php?id=BOE-A-2025-12345')
 * // => 'BOE-A-2025-12345'
 */
export function extractDocumentIdFromUrl(url: string): string | null {
  const match = url.match(/id=(BOE-[A-Z]-\d{4}-\d+)/);
  return match ? match[1] : null;
}

/**
 * Construye URLs del BOE para diferentes formatos
 */
export function buildBoeUrls(documentId: string) {
  return {
    pdf: `https://boe.es/boe/dias/${extractYearMonthDay(documentId)}/pdfs/${documentId}.pdf`,
    xml: `https://boe.es/datosabiertos/api/boe/${documentId}.xml`,
    html: `https://boe.es/diario_boe/txt.php?id=${documentId}`,
    json: `https://boe.es/datosabiertos/api/boe/${documentId}`,
  };
}

function extractYearMonthDay(documentId: string): string {
  // BOE-A-2025-12345 => 2025/01/24 (necesitaríamos la fecha real)
  // Por simplicidad, usamos la URL estándar del BOE
  const match = documentId.match(/BOE-[A-Z]-(\d{4})-(\d+)/);
  if (!match) return "";

  // No podemos extraer mes/día solo del ID, necesitamos la fecha de publicación
  // Retornamos string vacío y dejamos que la URL se construya diferente
  return "";
}

// ================================================================
// HELPERS DE API (para usar desde cliente)
// ================================================================

/**
 * Obtiene el sumario de un día específico desde nuestro proxy
 */
export async function fetchSumarioByDate(date: Date): Promise<BOESumario> {
  const dateStr = dateToBoeDateString(date);
  const response = await fetch(`/api/boe/sumario/${dateStr}`);

  if (!response.ok) {
    throw new Error(`Error fetching sumario for ${dateStr}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response.data.sumario;
}

/**
 * Obtiene sumarios para un rango de fechas desde nuestro proxy
 */
export async function fetchSumarioRange(
  desde: Date,
  hasta: Date
): Promise<BOERangeResult[]> {
  const desdeStr = format(desde, "yyyy-MM-dd");
  const hastaStr = format(hasta, "yyyy-MM-dd");

  const response = await fetch(`/api/boe/range?desde=${desdeStr}&hasta=${hastaStr}`);

  if (!response.ok) {
    throw new Error(`Error fetching range: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response.data.resultados;
}

/**
 * Obtiene el detalle de un documento específico
 */
export async function fetchDocumento(
  documentId: string,
  format: "json" | "xml" = "json"
): Promise<any> {
  const response = await fetch(`/api/boe/documento/${documentId}?format=${format}`);

  if (!response.ok) {
    throw new Error(`Error fetching document ${documentId}: ${response.statusText}`);
  }

  if (format === "xml") {
    return await response.text();
  }

  return await response.json();
}

// ================================================================
// HELPERS DE PROCESAMIENTO
// ================================================================

/**
 * Extrae todos los documentos de un sumario
 */
export function extractAllDocuments(sumario: BOESumario): BOEDocumento[] {
  const documentos: BOEDocumento[] = [];

  if (!sumario?.diario) return documentos;

  for (const dia of sumario.diario) {
    const diaAny = dia as any;

    // DEBUG: Ver qué hay dentro
    console.log('\n   DEBUG - Explorando estructura del día:');
    console.log('   - Keys:', Object.keys(diaAny));

    // Ver si seccion es array o objeto
    if (diaAny.seccion) {
      console.log('   - seccion es Array?:', Array.isArray(diaAny.seccion));
      if (Array.isArray(diaAny.seccion)) {
        console.log('   - seccion.length:', diaAny.seccion.length);
        if (diaAny.seccion[0]) {
          console.log('   - Keys de seccion[0]:', Object.keys(diaAny.seccion[0]));
        }
      } else {
        console.log('   - Keys de seccion (objeto):', Object.keys(diaAny.seccion));
      }
    }

    // Ver si sumario_diario tiene algo
    if (diaAny.sumario_diario) {
      console.log('   - sumario_diario es Array?:', Array.isArray(diaAny.sumario_diario));
      if (Array.isArray(diaAny.sumario_diario)) {
        console.log('   - sumario_diario.length:', diaAny.sumario_diario.length);
      } else {
        console.log('   - Keys de sumario_diario:', Object.keys(diaAny.sumario_diario));
      }
    }

    // TODO: Cuando sepamos la estructura real, extraer documentos aquí
  }

  return documentos;
}

/**
 * Filtra documentos por sección
 */
export function filterBySeccion(
  documentos: BOEDocumento[],
  seccion: string
): BOEDocumento[] {
  return documentos.filter((doc) => doc.seccion === seccion);
}

/**
 * Filtra documentos por palabras clave en el título
 */
export function filterByKeywords(
  documentos: BOEDocumento[],
  keywords: string[]
): BOEDocumento[] {
  return documentos.filter((doc) => {
    const tituloLower = doc.titulo.toLowerCase();
    return keywords.some((keyword) => tituloLower.includes(keyword.toLowerCase()));
  });
}

/**
 * Filtra documentos por rango
 */
export function filterByRango(
  documentos: BOEDocumento[],
  rangos: string[]
): BOEDocumento[] {
  return documentos.filter((doc) =>
    rangos.some((rango) => doc.rango?.toLowerCase().includes(rango.toLowerCase()))
  );
}

/**
 * Filtra documentos por departamento
 */
export function filterByDepartamento(
  documentos: BOEDocumento[],
  departamentos: string[]
): BOEDocumento[] {
  return documentos.filter((doc) =>
    departamentos.some((dept) =>
      doc.departamento?.toLowerCase().includes(dept.toLowerCase())
    )
  );
}

// ================================================================
// HELPERS PARA NETLIFY FUNCTIONS (Server-side)
// ================================================================

/**
 * Fetch directo a la API del BOE (para usar en Netlify Functions)
 * NO usar desde el cliente, usar /api/boe/* endpoints
 *
 * Soporta proxy automáticamente si hay variables de entorno configuradas
 */
export async function fetchBoeApiDirect(
  endpoint: string,
  format: "json" | "xml" = "json"
): Promise<any> {
  // IMPORTANTE: La URL correcta es SIN www (como en server/api/boe/range.ts)
  const baseUrl = "https://boe.es/datosabiertos/api/boe";
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  // Configurar proxy si está disponible (para entornos con restricciones de red)
  const fetchOptions: any = {
    method: "GET",
    headers: {
      Accept: format === "xml" ? "application/xml" : "application/json",
      "User-Agent": "datosenabierto.es/1.0",
    },
  };

  // Si hay proxy configurado, usar ProxyAgent de undici
  const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY ||
                   process.env.http_proxy || process.env.HTTP_PROXY;

  if (proxyUrl) {
    const agent = new ProxyAgent(proxyUrl);
    fetchOptions.dispatcher = agent;
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    // 404 significa que no hay boletín ese día (normal)
    if (response.status === 404) {
      return null;
    }
    throw new Error(`BOE API error: ${response.status} ${response.statusText}`);
  }

  if (format === "xml") {
    return await response.text();
  }

  return await response.json();
}

/**
 * Obtiene sumario de una semana completa (para procesamiento semanal)
 * Usa fetch directo a la API del BOE
 */
export async function fetchWeekSumarios(
  startDate: Date,
  endDate: Date
): Promise<BOERangeResult[]> {
  const dates = eachDayOfInterval({ start: startDate, end: endDate });
  const results: BOERangeResult[] = [];

  // Procesar en lotes de 3 para no sobrecargar la API
  const batchSize = 3;

  for (let i = 0; i < dates.length; i += batchSize) {
    const batch = dates.slice(i, i + batchSize);

    const batchPromises = batch.map(async (date) => {
      const dateStr = dateToBoeDateString(date);

      try {
        const data = await fetchBoeApiDirect(`/sumario/${dateStr}`, "json");

        // Si es null (404), no hay boletín ese día
        if (!data) {
          return {
            fecha: format(date, "yyyy-MM-dd"),
            fecha_boe: dateStr,
            disponible: false,
            sumario: { diario: [] },
          };
        }

        // La API retorna { data: { sumario: {...} } }
        const sumario = data?.data?.sumario || { diario: [] };
        const numSecciones = sumario.diario?.length || 0;

        // Contar documentos totales usando extractAllDocuments
        const docs = extractAllDocuments(sumario);
        const totalDocs = docs.length;

        console.log(`✓ Sumario ${dateStr}: ${numSecciones} días, ${totalDocs} documentos`);

        return {
          fecha: format(date, "yyyy-MM-dd"),
          fecha_boe: dateStr,
          disponible: true,
          sumario: sumario,
        };
      } catch (error) {
        console.error(`Error fetching sumario for ${dateStr}:`, error);
        return {
          fecha: format(date, "yyyy-MM-dd"),
          fecha_boe: dateStr,
          disponible: false,
          sumario: { diario: [] },
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Pausa entre lotes
    if (i + batchSize < dates.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// ================================================================
// KEYWORDS POR CATEGORÍA (para clasificación)
// ================================================================

export const KEYWORDS_BY_CATEGORY = {
  oposiciones: [
    "oposicion",
    "oposiciones",
    "convocatoria",
    "plazas",
    "concurso",
    "acceso libre",
    "promoción interna",
    "lista de admitidos",
    "lista de excluidos",
    "tribunal",
    "examen",
    "prueba selectiva",
  ],
  ayudas: [
    "subvención",
    "subvenciones",
    "ayuda",
    "ayudas",
    "beca",
    "becas",
    "bonificación",
    "financiación",
    "crédito",
    "línea de ayuda",
    "convocatoria de ayudas",
  ],
  legislacion: [
    "ley",
    "real decreto",
    "decreto-ley",
    "orden",
    "reglamento",
    "modifica",
    "deroga",
    "entrada en vigor",
    "texto refundido",
    "norma",
  ],
  nombramientos: [
    "nombramiento",
    "nombramientos",
    "cese",
    "ceses",
    "designación",
    "director general",
    "secretario general",
    "subsecretario",
    "embajador",
  ],
  licitaciones: [
    "licitación",
    "licitaciones",
    "contrato",
    "contratos",
    "pliego",
    "adjudicación",
    "concurso de obras",
    "concurso de servicios",
    "suministro",
  ],
  educacion: [
    "educación",
    "universidad",
    "título",
    "homologación",
    "plan de estudios",
    "grado",
    "máster",
    "doctorado",
    "enseñanza",
  ],
  vivienda: [
    "vivienda",
    "viviendas",
    "alquiler",
    "rehabilitación",
    "vivienda protegida",
    "VPO",
    "plan de vivienda",
    "acceso a la vivienda",
  ],
  empleo: [
    "convenio colectivo",
    "salario",
    "salario mínimo",
    "relaciones laborales",
    "contrato de trabajo",
    "jornada",
    "despido",
    "huelga",
  ],
  "medio-ambiente": [
    "medio ambiente",
    "medioambiente",
    "parque natural",
    "espacio protegido",
    "residuos",
    "reciclaje",
    "sostenibilidad",
    "emisiones",
    "cambio climático",
  ],
  trafico: [
    "tráfico",
    "circulación",
    "permiso de conducir",
    "vehículo",
    "vehículos",
    "carretera",
    "seguridad vial",
    "transporte",
  ],
  salud: [
    "salud",
    "sanitario",
    "sanidad",
    "medicamento",
    "medicamentos",
    "farmacia",
    "seguridad alimentaria",
    "salud pública",
  ],
  tecnologia: [
    "telecomunicaciones",
    "protección de datos",
    "RGPD",
    "digital",
    "tecnología",
    "internet",
    "administración electrónica",
    "firma electrónica",
  ],
} as const;

export type CategoriaSlug = keyof typeof KEYWORDS_BY_CATEGORY;
