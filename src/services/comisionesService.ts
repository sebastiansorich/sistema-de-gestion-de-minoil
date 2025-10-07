import { API_CONFIG, buildUrl, handleApiResponse } from './config'

export type ComisionEstado = 'pendiente' | 'aprobado' | 'rechazado' | string

export interface Comision {
  id: number
  userId?: number | null
  empId?: number | null // Agregado empId
  // Removido mercaderista - el backend no lo acepta
  regional?: string | null
  canal?: string | null // Agregado canal como campo requerido
  tipoMercaderista?: string | null
  ruta?: string | null
  cliente?: string | null
  mesComision?: string | null // YYYY-MM-DD
  estado?: ComisionEstado | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface GetComisionesParams {
  regional?: string
  canal?: string
  tipoMercaderista?: string
  mesComision?: string // YYYY-MM-DD o YYYY-MM
  estado?: string
  page?: number
  limit?: number
  sortBy?: 'id' | 'regional' | 'Canal' | 'tipoMercaderista' | 'mesComision' | 'estado' | 'createdAt'
  sortDir?: 'asc' | 'desc'
}

export interface Paginado<T> {
  data: T[]
  pagination?: { page: number; limit: number; total: number }
}

class ComisionesService {
  private toQuery(params?: Record<string, any>) {
    if (!params) return ''
    const q = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && String(v) !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    return q ? `?${q}` : ''
  }

  async getAll(params?: GetComisionesParams): Promise<Paginado<Comision>> {
    const url = buildUrl(`${API_CONFIG.ENDPOINTS.COMISIONES}${this.toQuery(params)}`)
    const res = await fetch(url, { method: 'GET', headers: API_CONFIG.DEFAULT_HEADERS })
    const json = await handleApiResponse(res)
    if (Array.isArray(json)) return { data: json }
    return { data: json?.data ?? [], pagination: json?.pagination }
  }

  async getById(id: number): Promise<Comision> {
    const res = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.COMISIONES}/${id}`), {
      method: 'GET', headers: API_CONFIG.DEFAULT_HEADERS
    })
    return await handleApiResponse(res)
  }

  async create(payload: Partial<Comision>): Promise<Comision> {
    const res = await fetch(buildUrl(API_CONFIG.ENDPOINTS.COMISIONES), {
      method: 'POST',
      headers: API_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify(payload)
    })
    return await handleApiResponse(res)
  }

  async update(id: number, payload: Partial<Comision>): Promise<Comision> {
    const res = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.COMISIONES}/${id}`), {
      method: 'PUT',
      headers: API_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify(payload)
    })
    return await handleApiResponse(res)
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.COMISIONES}/${id}`), {
      method: 'DELETE', headers: API_CONFIG.DEFAULT_HEADERS
    })
    await handleApiResponse(res)
  }
}

export const comisionesService = new ComisionesService()


