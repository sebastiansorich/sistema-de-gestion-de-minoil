import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, type AuthUser } from '../services'

export interface User {
  id: number
  username: string
  email: string
  nombre: string
  apellido: string
  password: null
  autenticacion: 'ldap' | 'local'
  empleadoSapId: number
  empID?: number
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
  permisos: Array<{
    moduloId: number
    moduloNombre: string
    crear: boolean
    leer: boolean
    actualizar: boolean
    eliminar: boolean
  }>
  // Campos adicionales para el contexto
  lastLogin?: Date
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configuración de cookies
const COOKIE_CONFIG = {
  name: 'minoil_session',
  rememberMeName: 'minoil_remember_me',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  rememberMeMaxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
}

// Utilidades para manejo de cookies
const setCookie = (name: string, value: string, maxAge: number) => {
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; secure; samesite=strict`
}

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; max-age=0; path=/`
}

// Utilidades para localStorage
const setLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

const getLocalStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return null
  }
}

const removeLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const isAuthenticated = !!user

  // Validaciones de entrada
  const validateUsername = (username: string): { isValid: boolean; message: string } => {
    if (!username.trim()) {
      return { isValid: false, message: 'El nombre de usuario es requerido' }
    }
    if (username.length < 3) {
      return { isValid: false, message: 'El nombre de usuario debe tener al menos 3 caracteres' }
    }
    if (username.length > 50) {
      return { isValid: false, message: 'El nombre de usuario no puede exceder 50 caracteres' }
    }
    return { isValid: true, message: '' }
  }

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (!password) {
      return { isValid: false, message: 'La contraseña es requerida' }
    }
    if (password.length < 6) {
      return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' }
    }
    if (password.length > 128) {
      return { isValid: false, message: 'La contraseña no puede exceder 128 caracteres' }
    }
    return { isValid: true, message: '' }
  }

  // Función de login usando el servicio real
  const login = async (username: string, password: string, rememberMe: boolean): Promise<{ success: boolean; message: string }> => {
    try {
      // Validaciones de entrada
      const usernameValidation = validateUsername(username)
      if (!usernameValidation.isValid) {
        return { success: false, message: usernameValidation.message }
      }

      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.message }
      }

      // Llamar al servicio de autenticación real
      const response = await authService.login(username, password)
      
      if (!response.success) {
        return { success: false, message: response.message }
      }

      if (!response.data?.user) {
        return { success: false, message: 'Error en la respuesta del servidor' }
      }

      // Mapear datos del backend a la interfaz User
      const backendUser = response.data.user
      const userData: User = {
        id: backendUser.id,
        username: backendUser.username,
        email: backendUser.email,
        nombre: backendUser.nombre,
        apellido: backendUser.apellido,
        password: backendUser.password,
        autenticacion: backendUser.autenticacion,
        empleadoSapId: backendUser.empleadoSapId,
        nombreCompletoSap: backendUser.nombreCompletoSap,
        jefeDirectoSapId: backendUser.jefeDirectoSapId,
        activo: backendUser.activo,
        ultimoAcceso: backendUser.ultimoAcceso,
        ultimaSincronizacion: backendUser.ultimaSincronizacion,
        sedeId: backendUser.sedeId,
        areaId: backendUser.areaId,
        cargoId: backendUser.cargoId,
        createdAt: backendUser.createdAt,
        updatedAt: backendUser.updatedAt,
        sede: backendUser.sede,
        area: backendUser.area,
        cargo: backendUser.cargo,
        permisos: backendUser.permisos || [],
        lastLogin: new Date()
      }

      // Guardar sesión
      setUser(userData)
      
      // Configurar cookies y localStorage según "Recordarme"
      if (rememberMe) {
        setCookie(COOKIE_CONFIG.rememberMeName, 'true', COOKIE_CONFIG.rememberMeMaxAge)
        setLocalStorage('minoil_user', userData)
        
        // Guardar token si viene en la respuesta
        if (response.data.token) {
          setLocalStorage('minoil_token', response.data.token)
        }
      } else {
        setCookie(COOKIE_CONFIG.name, 'true', COOKIE_CONFIG.maxAge)
        setLocalStorage('minoil_session_user', userData)
        
        // Guardar token de sesión si viene en la respuesta
        if (response.data.token) {
          setLocalStorage('minoil_session_token', response.data.token)
        }
      }

      // Registrar intento de login exitoso
      console.log(`Login exitoso para usuario: ${username}`, {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        user: userData
      })

      return { success: true, message: 'Login exitoso' }

    } catch (error) {
      console.error('Error durante el login:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error interno del servidor. Intente nuevamente.' 
      }
    }
  }

  // Función de logout
  const logout = async () => {
    try {
      // Llamar al servicio de logout
      await authService.logout()
    } catch (error) {
      console.error('Error durante el logout:', error)
    } finally {
      // Limpiar estado local independientemente del resultado del servicio
      setUser(null)
      
      // Limpiar cookies
      deleteCookie(COOKIE_CONFIG.name)
      deleteCookie(COOKIE_CONFIG.rememberMeName)
      
      // Limpiar localStorage
      removeLocalStorage('minoil_user')
      removeLocalStorage('minoil_session_user')
      removeLocalStorage('minoil_token')
      removeLocalStorage('minoil_session_token')
      
      // Navegar al login
      navigate('/login')
      
      console.log('Usuario ha cerrado sesión')
    }
  }

  // Función para actualizar datos del usuario
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      
      // Actualizar en localStorage
      const rememberMe = getCookie(COOKIE_CONFIG.rememberMeName)
      if (rememberMe) {
        setLocalStorage('minoil_user', updatedUser)
      } else {
        setLocalStorage('minoil_session_user', updatedUser)
      }
    }
  }

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true)
        
        // Verificar si hay sesión recordada
        const rememberMe = getCookie(COOKIE_CONFIG.rememberMeName)
        const sessionCookie = getCookie(COOKIE_CONFIG.name)
        
        if (rememberMe || sessionCookie) {
          // Intentar recuperar usuario del localStorage
          const savedUser = rememberMe 
            ? getLocalStorage('minoil_user')
            : getLocalStorage('minoil_session_user')
          
          if (savedUser) {
            // Validar token con el servidor si es necesario
            const token = rememberMe 
              ? getLocalStorage('minoil_token')
              : getLocalStorage('minoil_session_token')
            
            if (token) {
              const isValidToken = await authService.validateToken(token)
              if (isValidToken) {
                setUser(savedUser)
                console.log('Sesión restaurada automáticamente')
              } else {
                // Token inválido, limpiar sesión
                deleteCookie(COOKIE_CONFIG.name)
                deleteCookie(COOKIE_CONFIG.rememberMeName)
                removeLocalStorage('minoil_user')
                removeLocalStorage('minoil_session_user')
                removeLocalStorage('minoil_token')
                removeLocalStorage('minoil_session_token')
              }
            } else {
              // No hay token, asumir que la sesión es válida (para retrocompatibilidad)
              setUser(savedUser)
              console.log('Sesión restaurada automáticamente (sin token)')
            }
          } else {
            // Si hay cookie pero no hay usuario, limpiar cookies
            deleteCookie(COOKIE_CONFIG.name)
            deleteCookie(COOKIE_CONFIG.rememberMeName)
          }
        }
      } catch (error) {
        console.error('Error verificando sesión:', error)
        // En caso de error, limpiar todo
        deleteCookie(COOKIE_CONFIG.name)
        deleteCookie(COOKIE_CONFIG.rememberMeName)
        removeLocalStorage('minoil_user')
        removeLocalStorage('minoil_session_user')
        removeLocalStorage('minoil_token')
        removeLocalStorage('minoil_session_token')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  // Proteger rutas - redirigir al login si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname
      if (currentPath !== '/login') {
        navigate('/login')
      }
    }
  }, [isAuthenticated, isLoading, navigate])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
} 