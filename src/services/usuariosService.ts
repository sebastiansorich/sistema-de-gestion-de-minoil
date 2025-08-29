import { API_CONFIG, buildUrl, handleApiResponse } from './config'

export interface Sede {
  id: number
  nombre: string
}

export interface Area {
  id: number
  nombre: string
}

export interface Cargo {
  id: number
  nombre: string
  nivel: number
}
export interface Rol {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
}

export interface Usuario {
  id: number
  username: string
  email: string
  nombre: string
  apellido: string
  password: string | null
  autenticacion: 'ldap' | 'local'
  empleadoSapId: number | null
  nombreCompletoSap: string | null
  jefeDirectoSapId: number | null
  activo: boolean
  ultimoAcceso: string | null
  ultimaSincronizacion: string
  sedeId?: number
  areaId?: number
  cargoId?: number
  // rolId NO existe - el rol viene a través del cargo
  createdAt: string
  updatedAt: string
  sede?: Sede
  area?: Area
  rol?: Rol
}

export interface CreateUsuarioRequest {
  username: string
  email: string
  nombre: string
  apellido: string
  password?: string
  autenticacion: 'ldap' | 'local'
  empleadoSapId?: number
  nombreCompletoSap?: string
  jefeDirectoSapId?: number
  // Removed sedeId, areaId, cargoId as these tables no longer exist
}

export interface UpdateUsuarioRequest {
  username?: string
  email?: string
  nombre?: string
  apellido?: string
  password?: string
  autenticacion?: 'ldap' | 'local'
  // empleadoSapId y nombreCompletoSap son campos de solo lectura del SAP
  jefeDirectoSapId?: number
  activo?: boolean
  // Removed sedeId, areaId, cargoId as these tables no longer exist
}

class UsuariosService {
  async getAll(): Promise<Usuario[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.USUARIOS), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      const data = await handleApiResponse(response)
      return Array.isArray(data) ? data : data.usuarios || []
    } catch (error) {
      console.error('Error en usuariosService.getAll:', error)
      throw error
    }
  }

  async getById(id: number): Promise<Usuario> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en usuariosService.getById:', error)
      throw error
    }
  }

  async create(usuario: CreateUsuarioRequest): Promise<Usuario> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.USUARIOS), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(usuario)
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en usuariosService.create:', error)
      throw error
    }
  }

  async update(id: number, usuario: UpdateUsuarioRequest): Promise<Usuario> {
    try {
      console.log('🔄 Actualizando usuario:', { id, usuario })
      
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`), {
        method: 'PATCH', // Cambio de PUT a PATCH
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(usuario)
      })

      console.log('📥 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en usuariosService.update:', error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`), {
        method: 'DELETE',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      await handleApiResponse(response)
    } catch (error) {
      console.error('Error en usuariosService.delete:', error)
      throw error
    }
  }
}

export const usuariosService = new UsuariosService() 