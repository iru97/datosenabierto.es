import { createEventHandler } from 'h3'

export default createEventHandler(async (event) => {
  const date = event.context.params?.date
  
  if (!date || !/^\d{8}$/.test(date)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Fecha inválida. El formato debe ser YYYYMMDD' })
    }
  }

  try {
    const response = await fetch(
      `https://www.boe.es/diario_boe/xml.php?id=BOE-S-${date}`,
      {
        headers: {
          'Accept': 'application/json, application/xml',
          'User-Agent': 'BOE-Viewer/1.0'
        }
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            response: {
              status: {
                code: 404,
                text: 'No hay boletín disponible para esta fecha'
              },
              data: {
                sumario: {
                  diario: []
                }
              }
            }
          })
        }
      }

      throw new Error(`Error al obtener los datos del BOE: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  } catch (error) {
    console.error('Error fetching BOE data:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al obtener los datos del BOE' })
    }
  }
})