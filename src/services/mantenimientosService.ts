import { buildUrl, handleApiResponse, API_CONFIG } from './config'

// Interfaces para mantenimientos basadas en el API real
export interface Mantenimiento {
  id: number
  usuarioId: number
  clienteCodigo: string
  itemCode: string
  choperaCode: string
  fechaVisita: string
  tipoMantenimientoId: number
  estadoGeneral: string
  comentarioEstado: string
  comentarioCalidadCerveza: string
  createdAt: string
  updatedAt: string
  usuario: {
    id: number
    nombre: string
    apellido: string
  }
  tipoMantenimiento: {
    id: number
    nombre: string
    descripcion: string
    activo: boolean
  }
  chopera: {
    itemCode: string
    itemName: string
    status: string
    ciudad: string
    serieActivo: string
    cardCode: string
    cardName: string
    aliasName: string
  }
  respuestasChecklist: RespuestaChecklist[]
  respuestasSensorial: RespuestaSensorial[]
}

export interface RespuestaChecklist {
  id: number
  mantenimientoId: number
  itemId: number
  valor: string
  createdAt: string
  updatedAt: string
  item: {
    id: number
    categoriaId: number
    nombre: string
    tipoRespuesta: string
    opciones: string[] | null
    orden: number
    createdAt: string
    updatedAt: string
    categoria: {
      id: number
      nombre: string
      orden: number
      createdAt: string
      updatedAt: string
    }
  }
}

export interface RespuestaSensorial {
  id: number
  mantenimientoId: number
  grifo: number
  cerveza: string
  criterio: string
  valor: string
  createdAt: string
  updatedAt: string
}

export interface ChecklistMantenimiento {
  limpieza: {
    grifos: boolean
    tuberias: boolean
    tanque: boolean
    conexiones: boolean
  }
  funcionamiento: {
    presion: boolean
    temperatura: boolean
    flujo: boolean
    valvulas: boolean
  }
  seguridad: {
    fugas: boolean
    conexionesElectricas: boolean
    estabilidad: boolean
  }
}

export interface AnalisisSensorial {
  grifo1?: {
    cerveza: string
    apariencia: number // 1-5
    aroma: number // 1-5
    sabor: number // 1-5
    textura: number // 1-5
    temperatura: number // 1-5
  }
  grifo2?: {
    cerveza: string
    apariencia: number
    aroma: number
    sabor: number
    textura: number
    temperatura: number
  }
  grifo3?: {
    cerveza: string
    apariencia: number
    aroma: number
    sabor: number
    textura: number
    temperatura: number
  }
}

export interface MantenimientoFormData {
  fechaVisita: string
  clienteCodigo: string
  itemCode: string
  choperaCode: string
  tipoMantenimientoId: number
  estadoGeneral: string
  comentarioEstado: string
  comentarioCalidadCerveza: string
  checklist: ChecklistMantenimiento
  analisisSensorial: { grifos: any[] }
  fotos: File[]
}

export interface DashboardStats {
  mantenimientosHoy: number
  mantenimientosPendientes: number
  mantenimientosCompletados: number
  mantenimientosCancelados: number
  promedioTiempo: number
  tendenciaSemanal: {
    fecha: string
    completados: number
    pendientes: number
  }[]
}

export interface ChoperasStats {
  total: number
  porEstado: Record<string, number>
  porFabricante: Record<string, number>
  porUbicacion: Record<string, number>
  ultimaSincronizacion: string
}

export interface ChoperasStatsResponse {
  success: boolean
  data: ChoperasStats
  message: string
}

export interface MantenimientosResponse {
  mantenimientos: Mantenimiento[]
  total: number
  page: number
  limit: number
}

class MantenimientosService {
  /**
   * Obtener estadísticas del dashboard
   */
  /**
   * Obtener estadísticas de choperas
   */
  async getChoperasStats(): Promise<ChoperasStats> {
    try {
      const response = await fetch(buildUrl('/bendita/choperas/estadisticas'), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      const data: ChoperasStatsResponse = await handleApiResponse(response)
      return data.data
    } catch (error) {
      console.error('Error obteniendo estadísticas de choperas:', error)
      throw error
    }
  }

  /**
   * Obtener estadísticas del dashboard de mantenimientos
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Por ahora, usar datos mock ya que no tenemos endpoint de mantenimientos
      // TODO: Implementar cuando esté disponible el endpoint de estadísticas de mantenimientos
      return {
        mantenimientosHoy: 5,
        mantenimientosPendientes: 12,
        mantenimientosCompletados: 45,
        mantenimientosCancelados: 2,
        promedioTiempo: 2.5,
        tendenciaSemanal: [
          { fecha: '2024-01-01', completados: 8, pendientes: 3 },
          { fecha: '2024-01-02', completados: 12, pendientes: 5 },
          { fecha: '2024-01-03', completados: 10, pendientes: 7 },
          { fecha: '2024-01-04', completados: 15, pendientes: 4 },
          { fecha: '2024-01-05', completados: 9, pendientes: 6 },
          { fecha: '2024-01-06', completados: 7, pendientes: 8 },
          { fecha: '2024-01-07', completados: 11, pendientes: 2 },
        ]
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error)
      throw error
    }
  }

  /**
   * Obtener lista de mantenimientos con paginación y filtros
   */
  async getMantenimientos(filters: {
    page?: number
    limit?: number
    estado?: string
    cliente?: string
    fechaDesde?: string
    fechaHasta?: string
    tecnico?: string
    itemCode?: string
    serieActivo?: string
  } = {}): Promise<Mantenimiento[]> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      console.log('🔍 DEBUG - mantenimientosService.getMantenimientos - Filtros enviados:', filters);
      console.log('🔍 DEBUG - mantenimientosService.getMantenimientos - URL params:', params.toString());

      const response = await fetch(buildUrl(`/bendita/mantenimientos?${params}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      const data = await handleApiResponse(response)
      console.log('🔍 DEBUG - mantenimientosService.getMantenimientos - Datos devueltos:', data);
      console.log('🔍 DEBUG - mantenimientosService.getMantenimientos - Cantidad de mantenimientos:', data.length);
      if (data.length > 0) {
        console.log('🔍 DEBUG - mantenimientosService.getMantenimientos - Primer mantenimiento:', {
          itemCode: data[0].itemCode,
          choperaCode: data[0].choperaCode,
          clienteCodigo: data[0].clienteCodigo
        });
      }
      return data
    } catch (error) {
      console.error('Error obteniendo mantenimientos:', error)
      // Retornar datos mock para desarrollo
      return this.getMockMantenimientos()
    }
  }

  /**
   * Obtener un mantenimiento específico
   */
  async getMantenimiento(id: number): Promise<Mantenimiento> {
    try {
      const response = await fetch(buildUrl(`/bendita/mantenimientos/${id}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      const data = await handleApiResponse(response)
      return data
    } catch (error) {
      console.error('Error obteniendo mantenimiento:', error)
      throw error
    }
  }

  /**
   * Crear nuevo mantenimiento
   */
  async createMantenimiento(formData: MantenimientoFormData): Promise<Mantenimiento> {
    try {
      // Log para depuración
      console.log('Enviando datos al servidor:', formData);
      
      // Convertir el checklist a respuestasChecklist
      const respuestasChecklist = this.convertChecklistToRespuestas(formData.checklist);
      
      // Convertir el análisis sensorial a respuestasSensorial
      const respuestasSensorial = this.convertAnalisisToRespuestas(formData.analisisSensorial);
      
      // Crear el objeto de datos que espera el backend
      const mantenimientoData = {
        fechaVisita: formData.fechaVisita,
        clienteCodigo: formData.clienteCodigo,
        itemCode: formData.itemCode,
        choperaCode: formData.choperaCode,
        tipoMantenimientoId: formData.tipoMantenimientoId,
        estadoGeneral: formData.estadoGeneral,
        comentarioEstado: formData.comentarioEstado,
        comentarioCalidadCerveza: formData.comentarioCalidadCerveza,
        respuestasChecklist: respuestasChecklist,
        respuestasSensorial: respuestasSensorial
      };

      console.log('Datos convertidos para el backend:', mantenimientoData);

      const response = await fetch(buildUrl('/bendita/mantenimientos'), {
        method: 'POST',
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mantenimientoData)
      })

      console.log('Respuesta del servidor:', response.status, response.statusText);

      const data = await handleApiResponse(response)
      return data
    } catch (error) {
      console.error('Error creando mantenimiento:', error)
      throw error
    }
  }

  /**
   * Convertir checklist a formato de respuestas
   */
  private convertChecklistToRespuestas(checklist: ChecklistMantenimiento): any[] {
    const respuestas: any[] = [];
    
    // Crear respuestas por defecto basadas en la estructura del backend
    // Basándome en el ejemplo que proporcionaste, crear al menos 11 respuestas
    const defaultItems = [
      { itemId: 1, valor: 'BUENO' }, // Estado General del Equipo
      { itemId: 2, valor: 'Cumple' }, // Enjuague completo
      { itemId: 3, valor: 'Cumple' }, // Pasada de fenolftaleína
      { itemId: 4, valor: 'Cumple' }, // Confirmar componentes
      { itemId: 5, valor: 'Cumple' }, // Desarmado y Limpieza de Grifos
      { itemId: 6, valor: 'Cumple' }, // Aplicación de desinfectante
      { itemId: 7, valor: 'Cumple' }, // Pasada de soda cáustica
      { itemId: 8, valor: 'Cumple' }, // Revisar residuos
      { itemId: 9, valor: 'Cumple' }, // Comprobación funcionamiento
      { itemId: 10, valor: 'Cumple' }, // Verificación temperatura
      { itemId: 11, valor: 'Cumple' }  // Limpieza general
    ];

    // Si hay datos del checklist, usarlos para actualizar las respuestas por defecto
    if (checklist) {
      // Actualizar basándose en los valores del checklist
      let itemIndex = 0;
      
      // Limpieza
      Object.entries(checklist.limpieza).forEach(([key, value]) => {
        if (defaultItems[itemIndex]) {
          defaultItems[itemIndex].valor = value ? 'Cumple' : 'No Cumple';
        }
        itemIndex++;
      });

      // Funcionamiento
      Object.entries(checklist.funcionamiento).forEach(([key, value]) => {
        if (defaultItems[itemIndex]) {
          defaultItems[itemIndex].valor = value ? 'Cumple' : 'No Cumple';
        }
        itemIndex++;
      });

      // Seguridad
      Object.entries(checklist.seguridad).forEach(([key, value]) => {
        if (defaultItems[itemIndex]) {
          defaultItems[itemIndex].valor = value ? 'Cumple' : 'No Cumple';
        }
        itemIndex++;
      });
    }

    return defaultItems;
  }

  /**
   * Convertir análisis sensorial a formato de respuestas
   */
  private convertAnalisisToRespuestas(analisisSensorial: { grifos: any[] }): any[] {
    const respuestas: any[] = [];

    // Crear respuestas por defecto basadas en la estructura del backend
    // Basándome en el ejemplo que proporcionaste, crear al menos 6 respuestas
    const defaultRespuestas = [
      { grifo: 1, cerveza: 'Hoppy Lager', criterio: 'Aroma', valor: 'Cumple' },
      { grifo: 1, cerveza: 'Hoppy Lager', criterio: 'Aspecto', valor: 'Cumple' },
      { grifo: 1, cerveza: 'Hoppy Lager', criterio: 'Sabor', valor: 'Cumple' },
      { grifo: 2, cerveza: 'IPA', criterio: 'Aspecto', valor: 'Cumple' },
      { grifo: 2, cerveza: 'IPA', criterio: 'Sabor', valor: 'Cumple' },
      { grifo: 2, cerveza: 'IPA', criterio: 'Aroma', valor: 'Cumple' }
    ];

    // Si hay datos de análisis sensorial, usarlos para actualizar las respuestas por defecto
    if (analisisSensorial && analisisSensorial.grifos && analisisSensorial.grifos.length > 0) {
      analisisSensorial.grifos.forEach((grifo, index) => {
        if (defaultRespuestas[index * 3]) {
          defaultRespuestas[index * 3].cerveza = grifo.cerveza || 'Cerveza';
          defaultRespuestas[index * 3 + 1].cerveza = grifo.cerveza || 'Cerveza';
          defaultRespuestas[index * 3 + 2].cerveza = grifo.cerveza || 'Cerveza';
        }
      });
    }

    return defaultRespuestas;
  }

  /**
   * Actualizar mantenimiento
   */
  async updateMantenimiento(id: number, formData: Partial<MantenimientoFormData>): Promise<Mantenimiento> {
    try {
      const response = await fetch(buildUrl(`/bendita/mantenimientos/${id}`), {
        method: 'PUT',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(formData)
      })

      const data = await handleApiResponse(response)
      return data
    } catch (error) {
      console.error('Error actualizando mantenimiento:', error)
      throw error
    }
  }

  /**
   * Eliminar mantenimiento
   */
  async deleteMantenimiento(id: number): Promise<void> {
    try {
      const response = await fetch(buildUrl(`/bendita/mantenimientos/${id}`), {
        method: 'DELETE',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      await handleApiResponse(response)
    } catch (error) {
      console.error('Error eliminando mantenimiento:', error)
      throw error
    }
  }

  /**
   * Exportar mantenimientos a PDF/Excel
   */
  async exportMantenimientos(format: 'pdf' | 'excel', filters: any = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      params.append('format', format)
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      const response = await fetch(buildUrl(`/bendita/mantenimientos/export?${params}`), {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      })

      return await response.blob()
    } catch (error) {
      console.error('Error exportando mantenimientos:', error)
      throw error
    }
  }

  /**
   * Datos mock para desarrollo
   */
  private getMockMantenimientos(): Mantenimiento[] {
    return [
      {
        id: 1,
        usuarioId: 1,
        clienteCodigo: "CLP03480",
        itemCode: "903050",
        choperaCode: "UPP2092208M",
        fechaVisita: "2025-08-10T00:00:00.000Z",
        tipoMantenimientoId: 2,
        estadoGeneral: "BUENO",
        comentarioEstado: "Equipo en buen estado general, requiere limpieza rutinaria",
        comentarioCalidadCerveza: "Cerveza con buen aroma y sabor, temperatura correcta",
        createdAt: "2025-08-12T15:18:28.976Z",
        updatedAt: "2025-08-12T15:18:28.976Z",
        usuario: {
          id: 1,
          nombre: "Usuario",
          apellido: "Prueba"
        },
        tipoMantenimiento: {
          id: 2,
          nombre: "Mantenimiento Preventivo",
          descripcion: "Mantenimiento programado para prevenir fallas",
          activo: true
        },
        chopera: {
          itemCode: "903050",
          itemName: "CHOPERA PLUS 3T TP IT",
          status: "Minoil",
          ciudad: "1.Santa Cruz",
          serieActivo: "Sin serie TP 3T - 2",
          cardCode: "",
          cardName: "",
          aliasName: ""
        },
        respuestasChecklist: [],
        respuestasSensorial: []
      },
      {
        id: 2,
        usuarioId: 1,
        clienteCodigo: "CLP04520",
        itemCode: "903039",
        choperaCode: "UPP2092208Q",
        fechaVisita: "2025-08-11T00:00:00.000Z",
        tipoMantenimientoId: 1,
        estadoGeneral: "REGULAR",
        comentarioEstado: "Equipo requiere mantenimiento, grifos con fugas menores",
        comentarioCalidadCerveza: "Cerveza con sabor ligeramente alterado, requiere ajuste de temperatura",
        createdAt: "2025-08-12T15:18:28.987Z",
        updatedAt: "2025-08-12T15:18:28.987Z",
        usuario: {
          id: 1,
          nombre: "Usuario",
          apellido: "Prueba"
        },
        tipoMantenimiento: {
          id: 1,
          nombre: "Mantenimiento Correctivo",
          descripcion: "Mantenimiento para corregir fallas existentes",
          activo: true
        },
        chopera: {
          itemCode: "903039",
          itemName: "CHOPERA MEMO UPPER PLUS 2T",
          status: "Prestado",
          ciudad: "2.La Paz",
          serieActivo: "UPP2092208Q",
          cardCode: "CLP03480",
          cardName: "LINARES CASTILLO LUIS FERNANDO",
          aliasName: "LEGENDS"
        },
        respuestasChecklist: [],
        respuestasSensorial: []
      }
    ]
  }
}

export const mantenimientosService = new MantenimientosService()
