// Configuración base para las APIs
export const API_CONFIG = {
  // Base URL: En desarrollo usa proxy, en producción usa variable de entorno
  BASE_URL: import.meta.env.DEV 
    ? 'http://192.168.0.12:3000'  // En desarrollo, usar IP del servidor
    : (import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.12:3000'),
  
  // Endpoints
  ENDPOINTS: {
    AUTH: '/auth/login',
    USUARIOS: '/usuarios',
    ROLES: '/roles',
    MODULOS: '/modulos',
    COMISIONES: '/comisiones'
  },
  
  // Configuración de headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'accept': '*/*'
  }
}

// Función helper para construir URLs
export const buildUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Función helper para manejar respuestas con mejor diagnóstico de errores
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`
    
    try {
      const errorData = await response.json()
      if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.error) {
        errorMessage = errorData.error
      } else if (errorData.detail) {
        errorMessage = errorData.detail
      }
    } catch (parseError) {
      // Si no se puede parsear el JSON, usar el mensaje de estado HTTP
      console.warn('No se pudo parsear la respuesta de error:', parseError)
    }
    
    throw new Error(errorMessage)
  }
  
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return await response.json()
  }
  
  return await response.text()
}

// Función para diagnosticar problemas de conectividad
export const diagnoseConnectionError = (error: any): string => {
  const message = error?.message || ''
  
  if (message.includes('Failed to fetch')) {
    return `
❌ Error de Conectividad:

Posibles causas:
1. 🔴 El servidor backend NO está corriendo en ${API_CONFIG.BASE_URL}
2. 🔴 Problemas de CORS (el servidor necesita permitir origen ${window.location.origin})
3. 🔴 URL incorrecta (verifica VITE_API_BASE_URL en .env)
4. 🔴 Firewall o antivirus bloqueando la conexión

Soluciones:
✅ Verifica que el backend esté corriendo: curl ${API_CONFIG.BASE_URL}/health
✅ Revisa la consola del backend para errores de CORS
✅ Confirma que VITE_API_BASE_URL apunte al servidor correcto
    `
  }
  
  if (message.includes('NetworkError')) {
    return `❌ Error de Red: Verifica tu conexión a internet y que el servidor esté accesible`
  }
  
  if (message.includes('CORS')) {
    return `❌ Error de CORS: El servidor necesita configurar headers CORS para permitir ${window.location.origin}`
  }
  
  if (message.includes('Timeout') || message.includes('timeout')) {
    return `❌ Timeout: El servidor tardó demasiado en responder. Verifica que esté funcionando correctamente`
  }
  
  return `❌ Error desconocido: ${message}`
} 