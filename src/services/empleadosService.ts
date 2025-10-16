import { buildUrl, handleApiResponse, API_CONFIG } from './config'

export interface Empleado {
  empId: number
  nombre: string
  apellido?: string
  nombreCompleto?: string
  cargo?: string
  regional?: string
  activo?: boolean
  // Campos de la API real
  empID?: number
  nombreCompletoSap?: string
  sede?: string
  area?: string
  jefeDirecto?: number
}

export interface EmpleadosResponse {
  success?: boolean
  message?: string
  data?: Empleado[] | {
    empleados?: Empleado[]
    socios?: Empleado[]
    [key: string]: any
  }
}

class EmpleadosService {
  /**
   * Obtener todos los empleados desde SAP
   */
  async getEmpleados(): Promise<Empleado[]> {
    try {
      const response = await fetch(buildUrl('/sap/empleados-sap'), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
      }

      const data = await handleApiResponse(response)
      console.log('🔍 DEBUG - empleadosService.getEmpleados() - Respuesta de la API:', data)
      console.log('🔍 DEBUG - empleadosService.getEmpleados() - Tipo de datos:', typeof data)
      console.log('🔍 DEBUG - empleadosService.getEmpleados() - Es array:', Array.isArray(data))
      
      // Manejar diferentes formatos de respuesta
      let empleadosRaw: any[] = []
      
      if (Array.isArray(data)) {
        empleadosRaw = data
        console.log('🔍 DEBUG - empleadosService.getEmpleados() - Datos como array:', empleadosRaw.length, 'empleados')
      } else if (data && Array.isArray(data.data)) {
        empleadosRaw = data.data
        console.log('🔍 DEBUG - empleadosService.getEmpleados() - Datos en data.data:', empleadosRaw.length, 'empleados')
      } else if (data && data.data && Array.isArray(data.data.empleados)) {
        empleadosRaw = data.data.empleados
        console.log('🔍 DEBUG - empleadosService.getEmpleados() - Datos en data.data.empleados:', empleadosRaw.length, 'empleados')
      } else if (data && data.data && Array.isArray(data.data.socios)) {
        empleadosRaw = data.data.socios
        console.log('🔍 DEBUG - empleadosService.getEmpleados() - Datos en data.data.socios:', empleadosRaw.length, 'empleados')
      } else {
        console.warn('🔍 DEBUG - empleadosService.getEmpleados() - Formato de respuesta inesperado:', data)
        return []
      }

      // Mapear los datos de la API al formato esperado
      const empleadosMapeados: Empleado[] = empleadosRaw.map((emp: any) => ({
        empId: emp.empID || emp.empId || 0,
        nombre: emp.nombreCompletoSap || emp.nombre || '',
        apellido: emp.apellido || '',
        nombreCompleto: emp.nombreCompletoSap || emp.nombreCompleto || emp.nombre || '',
        cargo: emp.cargo || '',
        regional: emp.sede || emp.regional || '',
        activo: emp.activo !== undefined ? emp.activo : true,
        // Mantener campos originales
        empID: emp.empID,
        nombreCompletoSap: emp.nombreCompletoSap,
        sede: emp.sede,
        area: emp.area,
        jefeDirecto: emp.jefeDirecto
      }))

      console.log('🔍 DEBUG - empleadosService.getEmpleados() - Empleados mapeados:', empleadosMapeados.length, 'empleados')
      return empleadosMapeados
    } catch (error) {
      console.error('Error obteniendo empleados:', error)
      throw new Error('No se pudieron obtener los empleados desde SAP. Verifique la conexión.')
    }
  }

  /**
   * Buscar empleados por término de búsqueda
   */
  async searchEmpleados(searchTerm: string): Promise<Empleado[]> {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getEmpleados()
      }

      const empleados = await this.getEmpleados()
      const term = searchTerm.toLowerCase().trim()
      
      return empleados.filter(empleado => 
        empleado.nombre.toLowerCase().includes(term) ||
        empleado.apellido?.toLowerCase().includes(term) ||
        empleado.nombreCompleto?.toLowerCase().includes(term) ||
        empleado.cargo?.toLowerCase().includes(term) ||
        empleado.empId.toString().includes(term)
      )
    } catch (error) {
      console.error('Error buscando empleados:', error)
      throw error
    }
  }

  /**
   * Obtener un empleado específico por ID
   */
  async getEmpleadoById(empId: number): Promise<Empleado | null> {
    try {
      const empleados = await this.getEmpleados()
      return empleados.find(empleado => empleado.empId === empId) || null
    } catch (error) {
      console.error('Error obteniendo empleado por ID:', error)
      throw error
    }
  }
}

export const empleadosService = new EmpleadosService()
