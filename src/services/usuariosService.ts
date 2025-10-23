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
  rol?: Rol
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
  empID?: number
  nombreCompletoSap: string | null
  jefeDirectoSapId: number | null
  activo: boolean
  ultimoAcceso: string | null
  ultimaSincronizacion: string
  sedeId?: number
  areaId?: number
  cargoId?: number
  rolId?: number
  createdAt: string
  updatedAt: string
  sede?: Sede
  area?: Area
  cargo?: Cargo
  rol?: Rol
}

export interface CreateUsuarioRequest {
  username: string
  email: string
  nombre: string
  apellido: string
  password?: string
  autenticacion: 'ldap' | 'local'
  nombreCompletoSap?: string
  jefeDirectoSapId?: number
  rolId?: number
  empID?: number
  activo?: boolean
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
  rolId?: number
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
      const usuarios = Array.isArray(data) ? data : data.usuarios || []
      
      // Mapear rolID a rolId para compatibilidad con el frontend
      return usuarios.map((usuario: any) => ({
        ...usuario,
        rolId: usuario.rolID || usuario.rolId
      }))
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

      const usuario = await handleApiResponse(response)
      
      // Mapear rolID a rolId para compatibilidad con el frontend
      return {
        ...usuario,
        rolId: usuario.rolID || usuario.rolId
      }
    } catch (error) {
      console.error('Error en usuariosService.getById:', error)
      throw error
    }
  }

  async create(usuario: CreateUsuarioRequest): Promise<Usuario> {
    try {
      // Mapear rolId a rolID para el backend
      const usuarioParaBackend = {
        ...usuario,
        rolID: usuario.rolId,
        rolId: undefined
      }
      delete usuarioParaBackend.rolId

      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.USUARIOS), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(usuarioParaBackend)
      })

      const usuarioCreado = await handleApiResponse(response)
      
      // Mapear rolID a rolId para compatibilidad con el frontend
      return {
        ...usuarioCreado,
        rolId: usuarioCreado.rolID || usuarioCreado.rolId
      }
    } catch (error) {
      console.error('Error en usuariosService.create:', error)
      throw error
    }
  }

  async update(id: number, usuario: UpdateUsuarioRequest): Promise<Usuario> {
    try {
      console.log('🔄 Actualizando usuario:', { id, usuario })
      
      // Mapear rolId a rolID para el backend
      const usuarioParaBackend = {
        ...usuario,
        rolID: usuario.rolId,
        rolId: undefined
      }
      delete usuarioParaBackend.rolId
      
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`), {
        method: 'PATCH', // Cambio de PUT a PATCH
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(usuarioParaBackend)
      })

      console.log('📥 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })

      const usuarioActualizado = await handleApiResponse(response)
      
      // Mapear rolID a rolId para compatibilidad con el frontend
      return {
        ...usuarioActualizado,
        rolId: usuarioActualizado.rolID || usuarioActualizado.rolId
      }
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