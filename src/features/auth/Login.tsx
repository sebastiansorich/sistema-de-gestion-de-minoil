import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle, Wifi } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services'
import FormValidation from '../../components/ui/forms/FormValidation'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  })
  
  // Estados de validación y UI
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/')
    }
  }, [isAuthenticated, authLoading, navigate])

  // Verificar si la cuenta está bloqueada
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = localStorage.getItem('minoil_lockout_until')
      if (lockoutUntil) {
        const lockoutDate = new Date(lockoutUntil)
        if (lockoutDate > new Date()) {
          setIsLocked(true)
          setLockoutTime(lockoutDate)
        } else {
          // Desbloquear si ya pasó el tiempo
          setIsLocked(false)
          setLockoutTime(null)
          localStorage.removeItem('minoil_lockout_until')
          setAttempts(0)
        }
      }
    }

    checkLockout()
    const interval = setInterval(checkLockout, 1000)
    return () => clearInterval(interval)
  }, [])

  // Probar conectividad con el servidor
  const testConnection = async () => {
    setIsTestingConnection(true)
    try {
      const result = await authService.testConnection()
      if (result.success) {
        alert('✅ Conectividad OK: ' + result.message)
      } else {
        alert('❌ Error de conectividad:\n\n' + result.message)
      }
    } catch (error) {
      alert('❌ Error probando conectividad: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Limpiar errores cuando cambian los campos
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error específico del campo
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    // Limpiar error general si hay cambios
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
  }

  // Validaciones en tiempo real
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'username':
        if (!value.trim()) return 'El nombre de usuario es requerido'
        if (value.length < 3) return 'El nombre de usuario debe tener al menos 3 caracteres'
        if (value.length > 50) return 'El nombre de usuario no puede exceder 50 caracteres'
        break
      case 'password':
        if (!value) return 'La contraseña es requerida'
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
        if (value.length > 128) return 'La contraseña no puede exceder 128 caracteres'
        break
    }
    return undefined
  }

  const handleBlur = (field: string) => {
    const value = formData[field as keyof typeof formData] as string
    const error = validateField(field, value)
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLocked) {
      return
    }

    // Validar todos los campos
    const usernameError = validateField('username', formData.username)
    const passwordError = validateField('password', formData.password)
    
    if (usernameError || passwordError) {
      setErrors({
        username: usernameError,
        password: passwordError
      })
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const result = await login(formData.username, formData.password, formData.rememberMe)
      
      if (result.success) {
        // Login exitoso - redirigir automáticamente
        navigate('/')
      } else {
        // Login fallido
        setAttempts(prev => prev + 1)
        
        if (attempts >= 4) { // Bloquear después de 5 intentos
          const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
          localStorage.setItem('minoil_lockout_until', lockoutUntil.toISOString())
          setIsLocked(true)
          setLockoutTime(lockoutUntil)
          setErrors({ general: 'Cuenta bloqueada por 15 minutos debido a múltiples intentos fallidos' })
        } else {
          setErrors({ general: result.message })
        }
      }
    } catch (error) {
      console.error('Error durante el login:', error)
      setErrors({ general: 'Error de conexión. Verifique su conexión a internet.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calcular tiempo restante de bloqueo
  const getRemainingTime = (): string => {
    if (!lockoutTime) return ''
    
    const now = new Date()
    const diff = lockoutTime.getTime() - now.getTime()
    
    if (diff <= 0) return ''
    
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Si está cargando la autenticación, mostrar spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eceff1]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eceff1]">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md flex flex-col items-center border border-gray-200">
        <div className="flex flex-col items-center -mt-12">
          <div className="bg-white rounded-full shadow-md p-2 mt-8 mb-2">
            <img src="/MINOIL-PNG.png" alt="MINOIL Logo" className="w-16 h-16 object-contain" />
          </div>
        </div>
        
        <div className="w-full border-b border-gray-200 mt-2" />
        
        <h2 className="text-lg font-secondary font-semibold text-center mt-4 mb-2">
          Inicio de sesión
        </h2>
        
        {isLocked && (
          <div className="w-full px-8 py-3 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Cuenta bloqueada</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Tiempo restante: {getRemainingTime()}
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 px-8 py-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 20a7 7 0 0 1 14 0v1H3v-1Z"/>
              </svg>
            </span>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              disabled={isLocked || isSubmitting}
              placeholder="Usuario"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
              className={`w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-accent font-secondary transition-colors ${
                errors.username ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'
              } ${isLocked || isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            <FormValidation error={errors.username} />
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2" d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-2a6 6 0 1 0-12 0v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3Z"/>
              </svg>
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={isLocked || isSubmitting}
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={`w-full pl-10 pr-12 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-accent font-secondary transition-colors ${
                errors.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'
              } ${isLocked || isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            <button
              type="button"
              disabled={isLocked || isSubmitting}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <FormValidation error={errors.password} />
          </div>
          
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Error de Conexión</span>
              </div>
              <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
                {errors.general}
              </pre>
              <button
                type="button"
                onClick={testConnection}
                disabled={isTestingConnection}
                className="mt-2 flex items-center gap-1 text-xs text-red-800 hover:text-red-900 underline disabled:opacity-50"
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Probando...
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3" />
                    Probar conectividad
                  </>
                )}
              </button>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center text-sm font-secondary text-gray-700">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                disabled={isLocked || isSubmitting}
                className="mr-2 accent-primary disabled:opacity-50"
              />
              Recordarme
            </label>
            
            <button
              type="submit"
              disabled={isLocked || isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-fg font-brand rounded hover:bg-primary-accent transition-colors text-sm shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" d="M5 12h14m0 0-5-5m5 5-5 5"/>
                  </svg>
                  Ingresar
                </>
              )}
            </button>
          </div>
        </form>
        
       
      </div>
    </div>
  )
}

export default Login 