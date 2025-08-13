import { API_CONFIG, buildUrl, handleApiResponse } from './config'

export interface Permiso {
  id: number
  rolId: number
  moduloId: number
  crear: boolean
  leer: boolean
  actualizar: boolean
  eliminar: boolean
  createdAt: string
  updatedAt: string
  rol: {
    id: number
    nombre: string
  }
  modulo: {
    id: number
    nombre: string
    ruta: string
  }
}

export interface CreatePermisoRequest {
  rolId: number
  moduloId: number
  crear: boolean
  leer: boolean
  actualizar: boolean
  eliminar: boolean
}

export interface UpdatePermisoRequest {
  crear?: boolean
  leer?: boolean
  actualizar?: boolean
  eliminar?: boolean
}

class PermisosService {
  async getAll(): Promise<Permiso[]> {
    try {
      const response = await fetch(buildUrl('/permisos'), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      const data = await handleApiResponse(response)
      return Array.isArray(data) ? data : data.permisos || []
    } catch (error) {
      console.error('Error en permisosService.getAll:', error)
      throw error
    }
  }

  async getByRol(rolId: number): Promise<Permiso[]> {
    try {
      const response = await fetch(buildUrl(`/permisos?rolId=${rolId}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      const data = await handleApiResponse(response)
      return Array.isArray(data) ? data : data.permisos || []
    } catch (error) {
      console.error('Error en permisosService.getByRol:', error)
      throw error
    }
  }

  async create(permiso: CreatePermisoRequest): Promise<Permiso> {
    try {
      const response = await fetch(buildUrl('/permisos'), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(permiso)
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en permisosService.create:', error)
      throw error
    }
  }

  async update(id: number, permiso: UpdatePermisoRequest): Promise<Permiso> {
    try {
      const response = await fetch(buildUrl(`/permisos/${id}`), {
        method: 'PATCH',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(permiso)
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en permisosService.update:', error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(buildUrl(`/permisos/${id}`), {
        method: 'DELETE',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      await handleApiResponse(response)
    } catch (error) {
      console.error('Error en permisosService.delete:', error)
      throw error
    }
  }

  // Método especial para sincronizar todos los permisos de un rol
  async syncRolePermissions(rolId: number, permisos: CreatePermisoRequest[]): Promise<Permiso[]> {
    try {
      console.log('🔄 Sincronizando permisos del rol:', { rolId, permisos })
      
      // Primero obtener permisos existentes del rol
      console.log('📋 Obteniendo permisos existentes del rol...')
      const permisosExistentes = await this.getByRol(rolId)
      console.log('📋 Permisos existentes encontrados:', permisosExistentes)

      const resultados: Permiso[] = []

      // Procesar cada permiso solicitado
      for (const permisoSolicitado of permisos) {
        console.log(`🔄 Procesando permiso para módulo ${permisoSolicitado.moduloId}...`)
        
        // Buscar si ya existe un permiso para este rol-módulo
        const permisoExistente = permisosExistentes.find(
          p => p.rolId === rolId && p.moduloId === permisoSolicitado.moduloId
        )

        try {
          if (permisoExistente) {
            // Actualizar permiso existente
            console.log(`📝 Actualizando permiso existente ID ${permisoExistente.id}`)
            const permisoActualizado = await this.update(permisoExistente.id, {
              crear: permisoSolicitado.crear,
              leer: permisoSolicitado.leer,
              actualizar: permisoSolicitado.actualizar,
              eliminar: permisoSolicitado.eliminar
            })
            resultados.push(permisoActualizado)
            console.log(`✅ Permiso ${permisoExistente.id} actualizado exitosamente`)
          } else {
            // Crear nuevo permiso
            console.log(`📝 Creando nuevo permiso para módulo ${permisoSolicitado.moduloId}`)
            const nuevoPermiso = await this.create(permisoSolicitado)
            resultados.push(nuevoPermiso)
            console.log(`✅ Permiso creado exitosamente: ID ${nuevoPermiso.id}`)
          }
        } catch (permisoError) {
          console.error(`❌ Error procesando permiso para módulo ${permisoSolicitado.moduloId}:`, permisoError)
          // Continuar con el siguiente permiso en lugar de fallar completamente
        }
      }

      console.log(`✅ Sincronización completada. ${resultados.length}/${permisos.length} permisos procesados exitosamente`)
      return resultados

    } catch (error) {
      console.error('Error en permisosService.syncRolePermissions:', error)
      throw error
    }
  }
}

export const permisosService = new PermisosService() 