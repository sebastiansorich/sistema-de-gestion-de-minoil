import { buildUrl, handleApiResponse, API_CONFIG } from './config'

// Interfaces para las choperas
export interface Chopera {
  ItemCode: string
  ItemName: string
  ItemType: string
  ItmsGrpCod: number
  ItmsGrpNam: string
  QryGroup1: string
  InvntItem: string
  SellItem: string
  PrchseItem: string
  SalUnitMsr: string
  PurUnitMsr: string
  InvntryUom: string
  LastPurPrc: number
  AvgPrice: number
  FirmCode: number
  FirmName: string
  U_Ubicacion: string
  U_Estado: string
  CreateDate: string
  UpdateDate: string
}

export interface ChoperasResponse {
  choperas: Chopera[]
}

class ChoperasService {
  /**
   * Obtener todas las choperas desde SAP
   */
  async getChoperas(): Promise<Chopera[]> {
    try {
      const response = await fetch(buildUrl('/sap/choperas'), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      const data: ChoperasResponse = await handleApiResponse(response)
      return data.choperas || []
    } catch (error) {
      console.error('Error obteniendo choperas:', error)
      throw error
    }
  }

  /**
   * Obtener una chopera específica por código
   */
  async getChoperaByCode(itemCode: string): Promise<Chopera | null> {
    try {
      const choperas = await this.getChoperas()
      return choperas.find(chopera => chopera.ItemCode === itemCode) || null
    } catch (error) {
      console.error('Error obteniendo chopera por código:', error)
      throw error
    }
  }

  /**
   * Filtrar choperas por diferentes criterios
   */
  async filterChoperas(filters: {
    estado?: string
    ubicacion?: string
    nombre?: string
    grupo?: string
  }): Promise<Chopera[]> {
    try {
      const choperas = await this.getChoperas()
      
      return choperas.filter(chopera => {
        let matches = true
        
        if (filters.estado && chopera.U_Estado !== filters.estado) {
          matches = false
        }
        
        if (filters.ubicacion && !chopera.U_Ubicacion.toLowerCase().includes(filters.ubicacion.toLowerCase())) {
          matches = false
        }
        
        if (filters.nombre && !chopera.ItemName.toLowerCase().includes(filters.nombre.toLowerCase())) {
          matches = false
        }
        
        if (filters.grupo && chopera.ItmsGrpNam !== filters.grupo) {
          matches = false
        }
        
        return matches
      })
    } catch (error) {
      console.error('Error filtrando choperas:', error)
      throw error
    }
  }

  /**
   * Obtener estadísticas de choperas
   */
  async getChoperasStats(): Promise<{
    total: number
    porEstado: Record<string, number>
    porGrupo: Record<string, number>
    porUbicacion: Record<string, number>
  }> {
    try {
      const choperas = await this.getChoperas()
      
      const stats = {
        total: choperas.length,
        porEstado: {} as Record<string, number>,
        porGrupo: {} as Record<string, number>,
        porUbicacion: {} as Record<string, number>
      }
      
      choperas.forEach(chopera => {
        // Estadísticas por estado
        const estado = chopera.U_Estado || 'Sin estado'
        stats.porEstado[estado] = (stats.porEstado[estado] || 0) + 1
        
        // Estadísticas por grupo
        const grupo = chopera.ItmsGrpNam || 'Sin grupo'
        stats.porGrupo[grupo] = (stats.porGrupo[grupo] || 0) + 1
        
        // Estadísticas por ubicación
        const ubicacion = chopera.U_Ubicacion || 'Sin ubicación'
        stats.porUbicacion[ubicacion] = (stats.porUbicacion[ubicacion] || 0) + 1
      })
      
      return stats
    } catch (error) {
      console.error('Error obteniendo estadísticas de choperas:', error)
      throw error
    }
  }
}

export const choperasService = new ChoperasService()