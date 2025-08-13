import { API_CONFIG, buildUrl, handleApiResponse } from './config'

export interface Area {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAreaRequest {
  nombre: string
  descripcion: string
}

export interface UpdateAreaRequest {
  nombre?: string
  descripcion?: string
  activo?: boolean
}

class AreasService {
  async getAll(): Promise<Area[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.AREAS), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      const data = await handleApiResponse(response)
      return Array.isArray(data) ? data : data.areas || []
    } catch (error) {
      console.error('Error en areasService.getAll:', error)
      throw error
    }
  }

  async getById(id: number): Promise<Area> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.AREAS}/${id}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en areasService.getById:', error)
      throw error
    }
  }

  async create(area: CreateAreaRequest): Promise<Area> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.AREAS), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(area)
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en areasService.create:', error)
      throw error
    }
  }

  async update(id: number, area: UpdateAreaRequest): Promise<Area> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.AREAS}/${id}`), {
        method: 'PUT',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(area)
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en areasService.update:', error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.AREAS}/${id}`), {
        method: 'DELETE',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      await handleApiResponse(response)
    } catch (error) {
      console.error('Error en areasService.delete:', error)
      throw error
    }
  }
}

export const areasService = new AreasService() 