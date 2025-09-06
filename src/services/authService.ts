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

export interface ChangePasswordRequest {
  username: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  clientIp: string
  userAgent: string
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
  data?: any
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

  async validateToken(_token: string): Promise<boolean> {
    // Función para validar token con el servidor si es necesario
    // Por ahora retorna true, implementar según necesidades
    try {
      // Podrías hacer una llamada al servidor para validar el token
      // const response = await fetch(buildUrl('/auth/validate'), {
      //   method: 'POST',
      //   headers: { ...API_CONFIG.DEFAULT_HEADERS, 'Authorization': `Bearer ${_token}` }
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

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    console.log('🔥 MÉTODO changePassword INICIADO - authService.ts')
    const url = buildUrl('/auth/change-password')
    
    try {
      console.log('🚀 Enviando request de cambio de contraseña:')
      console.log('📍 URL construida:', url)
      console.log('🌐 Base URL configurada:', API_CONFIG.BASE_URL)
      console.log('🔧 Modo desarrollo:', import.meta.env.DEV)
      console.log('📋 Request completo:', {
        url,
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: request
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify(request)
      })

      console.log('📥 Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      })

      // Validar que la respuesta sea exitosa (status 200-299)
      if (!response.ok) {
        console.error('❌ Error del servidor:', response.status, response.statusText)
        
        // Intentar obtener el mensaje de error del servidor
        let errorMessage = 'Error del servidor'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`
        }
        
        return {
          success: false,
          message: errorMessage
        }
      }

      // Parsear la respuesta manualmente para mejor control
      let data
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          data = await response.json()
        } else {
          data = await response.text()
        }
        console.log('✅ Datos parseados:', data)
      } catch (parseError) {
        console.error('❌ Error al parsear respuesta:', parseError)
        return {
          success: false,
          message: 'Error al procesar la respuesta del servidor'
        }
      }

      // Validar que la respuesta tenga la estructura esperada
      if (!data || typeof data !== 'object') {
        console.error('❌ Respuesta del servidor inválida:', data)
        return {
          success: false,
          message: 'Respuesta del servidor inválida'
        }
      }

      // Verificar si el servidor indica éxito en su respuesta
      // Solo considerar éxito si el servidor explícitamente retorna success: true
      console.log('🔍 Validando respuesta del servidor:', {
        hasSuccess: 'success' in data,
        successValue: data.success,
        message: data.message,
        dataKeys: Object.keys(data)
      })

      const serverSuccess = data.success === true // Solo éxito si explícitamente true
      const serverMessage = data.message || 'Sin mensaje del servidor'

      if (!serverSuccess) {
        console.error('❌ El servidor NO confirmó el éxito:', {
          success: data.success,
          message: serverMessage,
          fullResponse: data
        })
        return {
          success: false,
          message: serverMessage || 'El servidor no confirmó que la contraseña se cambió exitosamente'
        }
      }

      console.log('✅ Cambio de contraseña exitoso según el servidor')
      return {
        success: true,
        message: serverMessage,
        data: data.data
      }
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error)
      
      const diagnosticMessage = diagnoseConnectionError(error)
      console.error(diagnosticMessage)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al cambiar la contraseña'
      }
    }
  }
}

export const authService = new AuthService() 