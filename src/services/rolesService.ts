import { API_CONFIG, buildUrl, handleApiResponse } from './config'
import { permisosService, type CreatePermisoRequest } from './permisosService'

export interface Rol {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
  createdAt: string
  updatedAt: string
  permisos: {
    id: number
    rolId: number
    moduloId: number
    crear: boolean
    leer: boolean
    actualizar: boolean
    eliminar: boolean
    createdAt: string
    updatedAt: string
    modulo: {
      id: number
      nombre: string
      ruta: string
    }
  }[]
  _count: {
    cargos: number
    permisos: number
  }
}

export interface CreateRolRequest {
  nombre: string
  descripcion: string
}

export interface UpdateRolRequest {
  nombre?: string
  descripcion?: string
  activo?: boolean
}

export interface PermisoRequest {
  moduloId: number
  crear: boolean
  leer: boolean
  actualizar: boolean
  eliminar: boolean
}

// Removed UpdatePermissionsRequest - now using UpdateRolRequest with permisos field

class RolesService {
  async getAll(): Promise<Rol[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.ROLES), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      const data = await handleApiResponse(response)
      return Array.isArray(data) ? data : data.roles || []
    } catch (error) {
      console.error('Error en rolesService.getAll:', error)
      throw error
    }
  }

  async getById(id: number): Promise<Rol> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.ROLES}/${id}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en rolesService.getById:', error)
      throw error
    }
  }

  async create(rol: CreateRolRequest): Promise<Rol> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.ROLES), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(rol)
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en rolesService.create:', error)
      throw error
    }
  }

  async update(id: number, rol: UpdateRolRequest): Promise<Rol> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.ROLES}/${id}`), {
        method: 'PATCH',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(rol)
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en rolesService.update:', error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.ROLES}/${id}`), {
        method: 'DELETE',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      await handleApiResponse(response)
    } catch (error) {
      console.error('Error en rolesService.delete:', error)
      throw error
    }
  }

  async updateWithPermissions(rolId: number, basicData: UpdateRolRequest, permisos?: PermisoRequest[]): Promise<Rol> {
    try {
      console.log('🔄 Actualizando rol (información básica):', { rolId, basicData })
      
      // Primero actualizar información básica del rol
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.ROLES}/${rolId}`), {
        method: 'PATCH',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(basicData)
      })

      console.log('📥 Respuesta del servidor (rol básico):', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })

      let result = await handleApiResponse(response)

      // Si hay permisos, actualizar usando el servicio dedicado
      if (permisos && permisos.length > 0) {
        console.log('🔄 Actualizando permisos del rol usando permisosService:', { rolId, permisos })
        
        try {
          // Convertir PermisoRequest a CreatePermisoRequest
          const createPermisosRequest: CreatePermisoRequest[] = permisos.map(p => ({
            rolId: rolId,
            moduloId: p.moduloId,
            crear: p.crear,
            leer: p.leer,
            actualizar: p.actualizar,
            eliminar: p.eliminar
          }))

          await permisosService.syncRolePermissions(rolId, createPermisosRequest)
          console.log('✅ Permisos actualizados exitosamente usando permisosService')
        } catch (permisosError) {
          console.log('⚠️ No se pudieron actualizar permisos automáticamente:', permisosError)
          // Por ahora, solo loguear el error pero no fallar la operación principal
          // En el futuro aquí podríamos mostrar un mensaje al usuario
        }
      }

      return result
    } catch (error) {
      console.error('Error en rolesService.updateWithPermissions:', error)
      throw error
    }
  }
}

export const rolesService = new RolesService() 