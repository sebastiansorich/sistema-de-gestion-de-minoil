import { buildUrl, handleApiResponse, API_CONFIG } from './config'

export interface MercaderistaItem {
  id: number
  nombre: string
  tipo: 'Mercaderista' | 'Checkout-Mercaderista' | 'Fiambrera'
  regional?: string
  canal?: string
}

export interface MercaderistasResponse {
  success?: boolean
  message?: string
  data: MercaderistaItem[]
}

class MercaderistasService {
  async getMercaderistas(): Promise<MercaderistaItem[]> {
    try {
      const response = await fetch(buildUrl('/mercaderistas'), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      const parsed: unknown = await handleApiResponse(response)
      if (Array.isArray(parsed)) {
        return parsed as MercaderistaItem[]
      }
      const data = parsed as MercaderistasResponse
      return data?.data || []
    } catch (error) {
      console.error('Error obteniendo mercaderistas:', error)
      throw new Error('No se pudieron obtener los mercaderistas.')
    }
  }
}

export const mercaderistasService = new MercaderistasService()
export type { MercaderistasService }

