import { API_CONFIG, buildUrl, handleApiResponse } from './config'

export interface Sede {
  id: number
  nombre: string
  direccion?: string
  ciudad?: string
  telefono?: string
  email?: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSedeRequest {
  nombre: string
  direccion?: string
  ciudad?: string
  telefono?: string
  email?: string
}

export interface UpdateSedeRequest {
  nombre?: string
  direccion?: string
  ciudad?: string
  telefono?: string
  email?: string
  activo?: boolean
}

class SedesService {
  async getAll(): Promise<Sede[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.SEDES), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      const data = await handleApiResponse(response)
      return Array.isArray(data) ? data : data.sedes || []
    } catch (error) {
      console.error('Error en sedesService.getAll:', error)
      throw error
    }
  }

  async getById(id: number): Promise<Sede> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.SEDES}/${id}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en sedesService.getById:', error)
      throw error
    }
  }

  async create(sede: CreateSedeRequest): Promise<Sede> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.SEDES), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(sede)
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en sedesService.create:', error)
      throw error
    }
  }

  async update(id: number, sede: UpdateSedeRequest): Promise<Sede> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.SEDES}/${id}`), {
        method: 'PUT',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(sede)
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en sedesService.update:', error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.SEDES}/${id}`), {
        method: 'DELETE',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      await handleApiResponse(response)
    } catch (error) {
      console.error('Error en sedesService.delete:', error)
      throw error
    }
  }
}

export const sedesService = new SedesService() 