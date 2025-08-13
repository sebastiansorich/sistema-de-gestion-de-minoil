import { API_CONFIG, buildUrl, handleApiResponse } from './config'

export interface Cargo {
  id: number
  nombre: string
  descripcion?: string
  cargoSap?: string
  nivel: number
  activo: boolean
  areaId: number
  cargoSuperiorId?: number
  rolId?: number
  sincronizadoSap: boolean
  createdAt: string
  updatedAt: string
  area?: {
    id: number
    nombre: string
  }
  cargoSuperior?: {
    id: number
    nombre: string
  }
  rol?: {
    id: number
    nombre: string
  }
}

export interface CreateCargoRequest {
  nombre: string
  descripcion?: string
  cargoSap?: string
  nivel: number
  areaId: number
  cargoSuperiorId?: number
  rolId?: number
}

export interface UpdateCargoRequest {
  nombre?: string
  descripcion?: string
  cargoSap?: string
  nivel?: number
  activo?: boolean
  areaId?: number
  cargoSuperiorId?: number
  rolId?: number
}

class CargosService {
  async getAll(): Promise<Cargo[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CARGOS), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      const data = await handleApiResponse(response)
      return Array.isArray(data) ? data : data.cargos || []
    } catch (error) {
      console.error('Error en cargosService.getAll:', error)
      throw error
    }
  }

  async getById(id: number): Promise<Cargo> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.CARGOS}/${id}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en cargosService.getById:', error)
      throw error
    }
  }

  async create(cargo: CreateCargoRequest): Promise<Cargo> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CARGOS), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(cargo)
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en cargosService.create:', error)
      throw error
    }
  }

  async update(id: number, cargo: UpdateCargoRequest): Promise<Cargo> {
    try {
      console.log('🔄 Actualizando cargo:', { id, cargo })
      
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.CARGOS}/${id}`), {
        method: 'PATCH', // Cambio de PUT a PATCH
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(cargo)
      })

      console.log('📥 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en cargosService.update:', error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.CARGOS}/${id}`), {
        method: 'DELETE',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      await handleApiResponse(response)
    } catch (error) {
      console.error('Error en cargosService.delete:', error)
      throw error
    }
  }
}

export const cargosService = new CargosService() 