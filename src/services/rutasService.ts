import { buildUrl, handleApiResponse, API_CONFIG } from './config'

export interface RutaItem {
  id: number | string
  nombre: string
  codigo?: string
  regional?: string
}

export interface RutasResponse {
  success?: boolean
  message?: string
  data: RutaItem[]
}

class RutasService {
  async getRutas(): Promise<RutaItem[]> {
    try {
      const response = await fetch(buildUrl('/rutas'), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      const data: RutasResponse = await handleApiResponse(response)
      if (Array.isArray(data)) {
        // @ts-expect-error runtime guard
        return data as RutaItem[]
      }
      return data?.data || []
    } catch (error) {
      console.error('Error obteniendo rutas:', error)
      throw new Error('No se pudieron obtener las rutas.')
    }
  }
}

export const rutasService = new RutasService()
export type { RutasService }

