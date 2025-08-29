import { API_CONFIG, buildUrl, handleApiResponse, diagnoseConnectionError } from './config'

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthUser {
  id: number
  username: string
  email: string
  nombre: string
  apellido: string
  password: null
  autenticacion: 'ldap' | 'local'
  empleadoSapId: number
  nombreCompletoSap: string
  jefeDirectoSapId: number | null
  activo: boolean
  ultimoAcceso: string | null
  ultimaSincronizacion: string
  sedeId?: number
  areaId?: number
  cargoId?: number
  createdAt: string
  updatedAt: string
  sede?: {
    id: number
    nombre: string
  }
  area?: {
    id: number
    nombre: string
  }
  cargo?: {
    id: number
    nombre: string
    nivel: number
  }
  // Campos que se agregarán en el procesamiento para compatibilidad
  permisos?: Array<{
    moduloId: number
    moduloNombre: string
    crear: boolean
    leer: boolean
    actualizar: boolean
    eliminar: boolean
  }>
}

export interface LoginResponse {
  success: boolean
  message: string
  data?: {
    user: AuthUser
    token?: string
    refreshToken?: string
  }
}

class AuthService {
  // Método para procesar y mapear datos del usuario desde el backend
  private processUserData(rawUserData: any): AuthUser {
    // Log para debug
    console.log('🔍 Datos sin procesar del backend:', rawUserData)
    
    // Mapear campos según la estructura real de la API
    const processedUser: AuthUser = {
      id: rawUserData.id,
      username: rawUserData.username,
      email: rawUserData.email,
      nombre: rawUserData.nombre,
      apellido: rawUserData.apellido,
      password: rawUserData.password,
      autenticacion: rawUserData.autenticacion || 'ldap',
      empleadoSapId: rawUserData.empleadoSapId, // Este es el campo crítico
      nombreCompletoSap: rawUserData.nombreCompletoSap,
      jefeDirectoSapId: rawUserData.jefeDirectoSapId,
      activo: rawUserData.activo,
      ultimoAcceso: rawUserData.ultimoAcceso,
      ultimaSincronizacion: rawUserData.ultimaSincronizacion,
      sedeId: rawUserData.sedeId,
      areaId: rawUserData.areaId,
      cargoId: rawUserData.cargoId,
      createdAt: rawUserData.createdAt,
      updatedAt: rawUserData.updatedAt,
      sede: rawUserData.sede,
      area: rawUserData.area,
      cargo: rawUserData.cargo,
      permisos: rawUserData.permisos || [] // Usar permisos del backend
    }
    
    // Validar campos críticos
    if (processedUser.empleadoSapId === undefined) {
      console.warn('⚠️ empleadoSapId no encontrado en respuesta del backend')
    }
    
    console.log('✅ Usuario procesado exitosamente:', processedUser)
    return processedUser
  }
  
  // Nota: Los permisos se obtendrán de un endpoint separado en el futuro
  // Por ahora retornamos array vacío

  async login(username: string, password: string): Promise<LoginResponse> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.AUTH)
    const body = { username, password }
    
    try {
      // Debug: Log de lo que se está enviando
      console.log('🚀 Enviando request de login:', {
        url,
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: body
      })

      // Test de conectividad básica
      console.log('🔍 Verificando conectividad con:', API_CONFIG.BASE_URL)

      const response = await fetch(url, {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(body)
      })

      console.log('📥 Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const data = await handleApiResponse(response)
      
      console.log('✅ Datos parseados:', data)
      console.log('🔍 Tipo de datos:', typeof data)
      console.log('🔍 Estructura completa:', JSON.stringify(data, null, 2))

      // Verificar si la respuesta tiene la estructura esperada
      if (!data || typeof data !== 'object') {
        console.error('❌ Respuesta no es un objeto válido')
        return {
          success: false,
          message: 'Respuesta del servidor inválida'
        }
      }

      // Log detallado de lo que encontramos
      console.log('🔍 Analizando estructura de respuesta:', {
        hasUser: !!data.user,
        hasData: !!data.data,
        hasSuccess: !!data.success,
        hasMessage: !!data.message,
        keys: Object.keys(data)
      })

      // Adaptarse a diferentes estructuras de respuesta del backend
      let userData = null
      let token = null

      if (data.user) {
        // Estructura directa: { user: {...}, token?: "..." }
        userData = data.user
        token = data.token
        console.log('📋 Estructura tipo 1: user en raíz')
      } else if (data.data && data.data.user) {
        // Estructura anidada: { data: { user: {...}, token?: "..." } }
        userData = data.data.user
        token = data.data.token
        console.log('📋 Estructura tipo 2: user en data')
      } else if (data.id && data.username) {
        // El usuario viene directamente sin wrapper
        userData = data
        console.log('📋 Estructura tipo 3: usuario directo')
      } else {
        console.error('❌ No se encontró información de usuario en:', data)
        return {
          success: false,
          message: 'Estructura de respuesta inesperada del servidor'
        }
      }

      console.log('👤 Usuario extraído:', userData)
      
      // Procesar y validar los datos del usuario
      const processedUser = this.processUserData(userData)
      console.log('🔄 Usuario procesado:', processedUser)
      
      return {
        success: true,
        message: 'Login exitoso',
        data: {
          user: processedUser,
          token: token
        }
      }
    } catch (error) {
      console.error('❌ Error completo en authService.login:', error)
      
      // Diagnóstico específico del error
      const diagnosticMessage = diagnoseConnectionError(error)
      console.error(diagnosticMessage)
      
      // Mostrar información de debug adicional
      console.group('🔧 Información de Debug:')
      console.log('URL objetivo:', url)
      console.log('Base URL configurada:', API_CONFIG.BASE_URL)
      console.log('Variable de entorno VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
      console.log('Origen actual:', window.location.origin)
      console.log('Headers enviados:', API_CONFIG.DEFAULT_HEADERS)
      console.log('Body enviado:', JSON.stringify(body, null, 2))
      console.groupEnd()
      
      return {
        success: false,
        message: error instanceof Error ? diagnoseConnectionError(error) : 'Error de conexión desconocido'
      }
    }
  }

  async logout(): Promise<void> {
    // Si en el futuro necesitas hacer logout en el servidor
    // puedes agregar la lógica aquí
    console.log('Logout realizado')
  }

  async validateToken(token: string): Promise<boolean> {
    // Función para validar token con el servidor si es necesario
    // Por ahora retorna true, implementar según necesidades
    try {
      // Podrías hacer una llamada al servidor para validar el token
      // const response = await fetch(buildUrl('/auth/validate'), {
      //   method: 'POST',
      //   headers: { ...API_CONFIG.DEFAULT_HEADERS, 'Authorization': `Bearer ${token}` }
      // })
      // return response.ok
      
      return true // Por ahora siempre válido
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
  }

  // Método helper para probar conectividad
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Probando conectividad básica...')
      
      const response = await fetch(API_CONFIG.BASE_URL, {
        method: 'GET',
        headers: { 'accept': '*/*' }
      })
      
      return {
        success: true,
        message: `✅ Servidor accesible. Status: ${response.status}`
      }
    } catch (error) {
      return {
        success: false,
        message: diagnoseConnectionError(error)
      }
    }
  }
}

export const authService = new AuthService() 