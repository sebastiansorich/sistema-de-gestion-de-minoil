import { buildUrl, handleApiResponse, API_CONFIG } from './config'

// Interfaces para las choperas
export interface Chopera {
  itemCode: string
  itemName: string
  status: string
  ciudad: string
  serieActivo: string
  cardCode: string
  cardName: string
  aliasName: string
}

export interface ChoperasResponse {
  success: boolean
  data: Chopera[]
  total: number
  sincronizadas: boolean
  message: string
}

class ChoperasService {
  /**
   * Obtener todas las choperas desde SAP
   */
  async getChoperas(): Promise<Chopera[]> {
    try {
      const response = await fetch(buildUrl('/bendita/choperas'), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
      }

      const data: ChoperasResponse = await handleApiResponse(response)
      console.log('🔍 DEBUG - choperasService.getChoperas() - Datos del endpoint:', data);
      console.log('🔍 DEBUG - choperasService.getChoperas() - Cantidad de choperas:', data.data?.length);
      
      // Log detallado de todas las choperas con cliente
      const choperasConCliente = data.data?.filter(c => c.cardCode && c.cardCode.trim() !== '') || [];
      console.log('🔍 DEBUG - choperasService.getChoperas() - Choperas con cliente:', choperasConCliente.length);
      choperasConCliente.slice(0, 3).forEach((c, i) => {
        console.log(`🔍 DEBUG - choperasService.getChoperas() - Chopera ${i+1} con cliente:`, {
          itemCode: c.itemCode,
          serieActivo: c.serieActivo,
          cardCode: c.cardCode,
          cardName: c.cardName,
          aliasName: c.aliasName
        });
      });
      
      // Log específico de la chopera 903039
      const chopera903039 = data.data?.find(c => c.itemCode === '903039');
      console.log('🔍 DEBUG - choperasService.getChoperas() - Chopera 903039:', chopera903039);
      
      return data.data || []
    } catch (error) {
      console.error('Error obteniendo choperas:', error)
      throw new Error('No se pudieron obtener las choperas desde SAP. Verifique la conexión.')
    }
  }

  /**
   * Obtener una chopera específica por código
   */
  async getChoperaByCode(itemCode: string): Promise<Chopera | null> {
    try {
      if (!itemCode || itemCode.trim() === '') {
        throw new Error('El código de chopera es requerido')
      }

      const choperas = await this.getChoperas()
      return choperas.find(chopera => chopera.itemCode === itemCode.trim()) || null
    } catch (error) {
      console.error('Error obteniendo chopera por código:', error)
      throw error
    }
  }

  /**
   * Obtener una chopera específica directamente del backend
   */
  async getChoperaDetalle(itemCode: string, serieActivo?: string): Promise<Chopera | null> {
    try {
      if (!itemCode || itemCode.trim() === '') {
        throw new Error('El código de chopera es requerido')
      }

      // Si tenemos serieActivo, buscar directamente por ese término
      const searchTerm = serieActivo || itemCode;
      console.log('🔍 DEBUG - getChoperaDetalle - Buscando por término:', searchTerm);

      const response = await fetch(buildUrl(`/bendita/choperas/buscar?termino=${encodeURIComponent(searchTerm)}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
      }

      const data = await handleApiResponse(response)
      console.log('🔍 DEBUG - getChoperaDetalle - Datos del endpoint:', data);
      
      // Buscar la chopera específica en los resultados
      if (data.data && Array.isArray(data.data)) {
        let choperaEncontrada: Chopera | null = null;
        
        if (serieActivo) {
          // Si tenemos serieActivo, buscar la chopera que coincida exactamente
          choperaEncontrada = data.data.find((c: Chopera) => 
            c.itemCode === itemCode && 
            c.serieActivo === serieActivo
          );
          console.log('🔍 DEBUG - getChoperaDetalle - Búsqueda por serieActivo específico:', choperaEncontrada);
        } else {
          // Si no tenemos serieActivo, buscar la primera que tenga cliente
          choperaEncontrada = data.data.find((c: Chopera) => 
            c.itemCode === itemCode && 
            (c.cardCode && c.cardCode.trim() !== '')
          );
          console.log('🔍 DEBUG - getChoperaDetalle - Búsqueda por itemCode con cliente:', choperaEncontrada);
        }
        
        return choperaEncontrada || null;
      }
      
      return null
    } catch (error) {
      console.error('Error obteniendo detalle de chopera:', error)
      // Si falla, intentar con el método anterior
      return this.getChoperaByCode(itemCode)
    }
  }

  /**
   * Filtrar choperas por diferentes criterios
   */
  async filterChoperas(filters: {
    status?: string
    ciudad?: string
    nombre?: string
    serie?: string
  }): Promise<Chopera[]> {
    try {
      const choperas = await this.getChoperas()
      
      return choperas.filter(chopera => {
        let matches = true
        
        if (filters.status && chopera.status !== filters.status) {
          matches = false
        }
        
        if (filters.ciudad && !chopera.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase())) {
          matches = false
        }
        
        if (filters.nombre && !chopera.itemName.toLowerCase().includes(filters.nombre.toLowerCase())) {
          matches = false
        }
        
        if (filters.serie && !chopera.serieActivo.toLowerCase().includes(filters.serie.toLowerCase())) {
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
    porStatus: Record<string, number>
    porCiudad: Record<string, number>
    porSerie: Record<string, number>
  }> {
    try {
      const choperas = await this.getChoperas()
      
      const stats = {
        total: choperas.length,
        porStatus: {} as Record<string, number>,
        porCiudad: {} as Record<string, number>,
        porSerie: {} as Record<string, number>
      }
      
      choperas.forEach(chopera => {
        // Estadísticas por status
        const status = chopera.status || 'Sin status'
        stats.porStatus[status] = (stats.porStatus[status] || 0) + 1
        
        // Estadísticas por ciudad
        const ciudad = chopera.ciudad || 'Sin ciudad'
        stats.porCiudad[ciudad] = (stats.porCiudad[ciudad] || 0) + 1
        
        // Estadísticas por serie
        const serie = chopera.serieActivo || 'Sin serie'
        stats.porSerie[serie] = (stats.porSerie[serie] || 0) + 1
      })
      
      return stats
    } catch (error) {
      console.error('Error obteniendo estadísticas de choperas:', error)
      throw new Error('No se pudieron obtener las estadísticas de choperas')
    }
  }

  /**
   * Buscar choperas por término de búsqueda
   */
  async searchChoperas(searchTerm: string): Promise<Chopera[]> {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getChoperas()
      }

      const choperas = await this.getChoperas()
      const term = searchTerm.toLowerCase().trim()
      
      return choperas.filter(chopera => 
        chopera.itemCode.toLowerCase().includes(term) ||
        chopera.itemName.toLowerCase().includes(term) ||
        chopera.ciudad.toLowerCase().includes(term) ||
        chopera.serieActivo.toLowerCase().includes(term)
      )
    } catch (error) {
      console.error('Error buscando choperas:', error)
      throw error
    }
  }

  /**
   * Buscar choperas por término usando el endpoint de búsqueda
   */
  async searchChoperasByTerm(termino: string): Promise<Chopera[]> {
    try {
      if (!termino || termino.trim() === '') {
        return []
      }

      const response = await fetch(buildUrl(`/bendita/choperas/buscar?termino=${encodeURIComponent(termino.trim())}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
      }

      const data = await handleApiResponse(response)
      console.log('🔍 DEBUG - searchChoperasByTerm - Datos del endpoint:', data);
      return data.data || []
    } catch (error) {
      console.error('Error buscando choperas por término:', error)
      throw error
    }
  }
}

export const choperasService = new ChoperasService()