import { API_CONFIG, buildUrl, handleApiResponse } from './config'

export interface Modulo {
  id: number
  nombre: string
  descripcion: string
  ruta: string
  activo: boolean
  createdAt: string
  updatedAt: string
  
  // Nuevos campos para estructura jerárquica
  padreId: number | null
  nivel: number
  esMenu: boolean
  icono: string | null
  orden: number
  submodulos?: Modulo[] // Submódulos completos (con todos los datos)
  
  // Campos legacy para compatibilidad (opcionales)
  permisos?: {
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
  }[]
  _count?: {
    permisos: number
  }
}

export interface CreateModuloRequest {
  nombre: string
  descripcion: string
  ruta: string
  icono?: string // Ícono opcional (nombre del ícono de Lucide)
}

export interface UpdateModuloRequest {
  nombre?: string
  descripcion?: string
  ruta?: string
  icono?: string
  activo?: boolean
}

class ModulosService {
  async getAll(): Promise<Modulo[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.MODULOS), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      const data = await handleApiResponse(response)
      return Array.isArray(data) ? data : data.modulos || []
    } catch (error) {
      console.error('Error en modulosService.getAll:', error)
      throw error
    }
  }

  // Nuevo método para obtener estructura jerárquica del sidebar
  async getSidebarModules(): Promise<Modulo[]> {
    try {
      console.log('🔄 Cargando módulos desde /modulos/sidebar...')
      const response = await fetch(buildUrl('/modulos/sidebar'), {
        method: 'GET',
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      const data = await handleApiResponse(response)
      
      // La respuesta ya viene como array jerárquico
      const modules: Modulo[] = Array.isArray(data) ? data : data.modulos || []
      
      console.log('✅ Módulos sidebar cargados:', {
        total: modules.length,
        conSubmodulos: modules.filter(m => m.submodulos && m.submodulos.length > 0).length,
        responseStatus: response.status,
        responseStatusText: response.statusText
      })
      
      // Debug detallado de la estructura recibida
      console.log('📋 ESTRUCTURA COMPLETA RECIBIDA:')
      console.log('🔍 RAW DATA:', JSON.stringify(data, null, 2))
      
      modules.forEach(m => {
        console.log(`📂 ${m.id} - ${m.nombre}:`, {
          nivel: m.nivel,
          esMenu: m.esMenu,
          activo: m.activo,
          orden: m.orden,
          icono: m.icono,
          padreId: m.padreId,
          submodulos: m.submodulos?.length || 0,
          submodulosDetalle: m.submodulos?.map(sub => ({
            id: sub.id,
            nombre: sub.nombre,
            ruta: sub.ruta,
            activo: sub.activo,
            esMenu: sub.esMenu,
            orden: sub.orden,
            icono: sub.icono,
            padreId: sub.padreId,
            nivel: sub.nivel
          })) || []
        })
        
        // Log extra para módulo Usuarios específicamente
        if (m.id === 4) {
          console.log(`🎯 MÓDULO USUARIOS DETALLE COMPLETO:`, m)
        }
      })
      
      return modules
    } catch (error) {
      console.error('Error en modulosService.getSidebarModules:', error)
      throw error
    }
  }

  async getById(id: number): Promise<Modulo> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.MODULOS}/${id}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en modulosService.getById:', error)
      throw error
    }
  }

  async create(modulo: CreateModuloRequest): Promise<Modulo> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.MODULOS), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(modulo)
      })

      const nuevoModulo = await handleApiResponse(response)
      
      // Auto-asignar permisos completos al rol administrador (ID 1)
      try {
        console.log(`🔄 Auto-asignando permisos al rol administrador para módulo ${nuevoModulo.id}...`)
        await this.autoAssignAdminPermissions(nuevoModulo.id)
        console.log(`✅ Permisos asignados automáticamente al administrador`)
      } catch (permisosError) {
        console.warn('⚠️ No se pudieron asignar permisos automáticamente:', permisosError)
        // No fallar la creación del módulo por esto
      }

      // Refrescar sidebar automáticamente después de crear módulo
      try {
        if (typeof window !== 'undefined' && (window as any).refreshSidebar) {
          console.log('🔄 Refrescando sidebar automáticamente tras creación de módulo...')
          await (window as any).refreshSidebar()
        }
      } catch (refreshError) {
        console.warn('⚠️ No se pudo refrescar el sidebar automáticamente:', refreshError)
      }

      return nuevoModulo
    } catch (error) {
      console.error('Error en modulosService.create:', error)
      throw error
    }
  }

  // Método para auto-asignar permisos completos al rol administrador
  async autoAssignAdminPermissions(moduloId: number): Promise<void> {
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const { permisosService } = await import('./permisosService')
      
      // Asignar permisos completos al rol administrador (asumiendo ID 1)
      const ADMIN_ROL_ID = 1
      
      await permisosService.create({
        rolId: ADMIN_ROL_ID,
        moduloId: moduloId,
        crear: true,
        leer: true,
        actualizar: true,
        eliminar: true
      })
      
      console.log(`✅ Permisos automáticos asignados al rol administrador para módulo ${moduloId}`)
    } catch (error) {
      console.error('Error auto-asignando permisos:', error)
      throw error
    }
  }

  // Método helper para obtener submódulos recomendados basados en rutas existentes
  getRecommendedSubmodules(): Record<string, any[]> {
    return {
      'Salidas de Producto': [
        { nombre: 'Ingresar Salida', ruta: '/salidas/ingresar', icono: 'plus', orden: 1 },
        { nombre: 'Gestionar Salidas', ruta: '/salidas/gestionar', icono: 'package', orden: 2 }
      ],
      'Marketing/Comisiones': [
        { nombre: 'Mercaderistas', ruta: '/marketing/mercaderistas', icono: 'users', orden: 1 },
        { nombre: 'Reportes por Sala', ruta: '/marketing/reportes-sala', icono: 'barchart2', orden: 2 }
      ],
      'Recursos Humanos': [
        { nombre: 'Planilla de Comisiones', ruta: '/rrhh/planilla-comisiones', icono: 'filetext', orden: 1 },
        { nombre: 'Vacaciones', ruta: '/rrhh/vacaciones', icono: 'calendar', orden: 2 }
      ]
    }
  }

  async update(id: number, modulo: UpdateModuloRequest): Promise<Modulo> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.MODULOS}/${id}`), {
        method: 'PUT',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(modulo)
      })

      return await handleApiResponse(response)
    } catch (error) {
      console.error('Error en modulosService.update:', error)
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.MODULOS}/${id}`), {
        method: 'DELETE',
        headers: API_CONFIG.DEFAULT_HEADERS
      })

      await handleApiResponse(response)
    } catch (error) {
      console.error('Error en modulosService.delete:', error)
      throw error
    }
  }
}

export const modulosService = new ModulosService() 