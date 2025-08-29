import { buildUrl, handleApiResponse, API_CONFIG } from './config'

// Interfaces para los clientes
export interface Cliente {
  cardCode: string
  cardName: string
  cardType: string
  groupName: string
  phone1: string
  phone2: string
  address: string
  active: boolean
  ruta: string
  alias: string
  cadena: string
}

export interface ClientesResponse {
  success: boolean
  message: string
  data: {
    total: number
    socios: Cliente[]
  }
}

class ClientesService {
  /**
   * Obtener todos los clientes
   */
  async getClientes(): Promise<Cliente[]> {
    try {
      const response = await fetch(buildUrl('/sap/socios-negocio'), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
      }

      const data: ClientesResponse = await handleApiResponse(response)
      return data.data.socios || []
    } catch (error) {
      console.error('Error obteniendo clientes:', error)
      throw new Error('No se pudieron obtener los clientes. Verifique la conexión.')
    }
  }

  /**
   * Buscar clientes por término de búsqueda
   */
  async searchClientes(searchTerm: string): Promise<Cliente[]> {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getClientes()
      }

      const clientes = await this.getClientes()
      const term = searchTerm.toLowerCase().trim()
      
      return clientes.filter(cliente => 
        cliente.cardCode.toLowerCase().includes(term) ||
        cliente.cardName.toLowerCase().includes(term) ||
        cliente.alias.toLowerCase().includes(term) ||
        cliente.groupName.toLowerCase().includes(term)
      )
    } catch (error) {
      console.error('Error buscando clientes:', error)
      throw error
    }
  }

  /**
   * Obtener un cliente específico por código
   */
  async getClienteByCode(cardCode: string): Promise<Cliente | null> {
    try {
      if (!cardCode || cardCode.trim() === '') {
        throw new Error('El código de cliente es requerido')
      }

      const clientes = await this.getClientes()
      return clientes.find(cliente => cliente.cardCode === cardCode.trim()) || null
    } catch (error) {
      console.error('Error obteniendo cliente por código:', error)
      throw error
    }
  }

  /**
   * Filtrar clientes por diferentes criterios
   */
  async filterClientes(filters: {
    grupo?: string
    ruta?: string
    activo?: boolean
    tipo?: string
  }): Promise<Cliente[]> {
    try {
      const clientes = await this.getClientes()
      
      return clientes.filter(cliente => {
        let matches = true
        
        if (filters.grupo && cliente.groupName !== filters.grupo) {
          matches = false
        }
        
        if (filters.ruta && !cliente.ruta.toLowerCase().includes(filters.ruta.toLowerCase())) {
          matches = false
        }
        
        if (filters.activo !== undefined && cliente.active !== filters.activo) {
          matches = false
        }
        
        if (filters.tipo && cliente.cardType !== filters.tipo) {
          matches = false
        }
        
        return matches
      })
    } catch (error) {
      console.error('Error filtrando clientes:', error)
      throw error
    }
  }

  /**
   * Obtener estadísticas de clientes
   */
  async getClientesStats(): Promise<{
    total: number
    porGrupo: Record<string, number>
    porRuta: Record<string, number>
    activos: number
    inactivos: number
  }> {
    try {
      const clientes = await this.getClientes()
      
      const stats = {
        total: clientes.length,
        porGrupo: {} as Record<string, number>,
        porRuta: {} as Record<string, number>,
        activos: 0,
        inactivos: 0
      }
      
      clientes.forEach(cliente => {
        // Estadísticas por grupo
        const grupo = cliente.groupName || 'Sin grupo'
        stats.porGrupo[grupo] = (stats.porGrupo[grupo] || 0) + 1
        
        // Estadísticas por ruta
        const ruta = cliente.ruta || 'Sin ruta'
        stats.porRuta[ruta] = (stats.porRuta[ruta] || 0) + 1
        
        // Estadísticas por estado
        if (cliente.active) {
          stats.activos++
        } else {
          stats.inactivos++
        }
      })
      
      return stats
    } catch (error) {
      console.error('Error obteniendo estadísticas de clientes:', error)
      throw new Error('No se pudieron obtener las estadísticas de clientes')
    }
  }
}

export const clientesService = new ClientesService()
