import React, { useState } from 'react'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Lock, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/base/button'
import FormValidation from '../../components/ui/forms/FormValidation'
import { authService, type ChangePasswordRequest } from '../../services/authService'
import { useAuth } from '../../contexts/AuthContext'

interface ChangePasswordProps {
  onBack?: () => void
  onSuccess?: () => void
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onBack, onSuccess }) => {
  console.log('🔥 COMPONENTE ChangePassword RENDERIZADO')
  const { user } = useAuth()
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Estados de validación y UI
  const [errors, setErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
    general?: string
  }>({})
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [successMessage, setSuccessMessage] = useState('')

  // Limpiar errores cuando cambian los campos
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error específico del campo
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    // Limpiar error general y mensaje de éxito si hay cambios
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  // Validaciones en tiempo real
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'currentPassword':
        if (!value) return 'La contraseña actual es requerida'
        break
      case 'newPassword':
        if (!value) return 'La nueva contraseña es requerida'
        if (value.length < 8) return 'La nueva contraseña debe tener al menos 8 caracteres'
        if (value.length > 128) return 'La contraseña no puede exceder 128 caracteres'
        if (!/(?=.*[a-z])/.test(value)) return 'Debe contener al menos una letra minúscula'
        if (!/(?=.*[A-Z])/.test(value)) return 'Debe contener al menos una letra mayúscula'
        if (!/(?=.*\d)/.test(value)) return 'Debe contener al menos un número'
        if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value)) return 'Debe contener al menos un carácter especial'
        if (value === formData.currentPassword) return 'La nueva contraseña debe ser diferente a la actual'
        break
      case 'confirmPassword':
        if (!value) return 'La confirmación de contraseña es requerida'
        if (value !== formData.newPassword) return 'Las contraseñas no coinciden'
        break
    }
    return undefined
  }

  const handleBlur = (field: string) => {
    const value = formData[field as keyof typeof formData]
    const error = validateField(field, value)
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  // Validar fortaleza de contraseña
  const getPasswordStrength = (password: string): { score: number, label: string, color: string } => {
    let score = 0
    
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/(?=.*[a-z])/.test(password)) score++
    if (/(?=.*[A-Z])/.test(password)) score++
    if (/(?=.*\d)/.test(password)) score++
    if (/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) score++
    
    if (score <= 2) return { score, label: 'Débil', color: 'bg-red-500' }
    if (score <= 4) return { score, label: 'Media', color: 'bg-yellow-500' }
    return { score, label: 'Fuerte', color: 'bg-green-500' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔥 HANDLE SUBMIT INICIADO - ChangePassword.tsx')

    // Validar todos los campos
    const currentPasswordError = validateField('currentPassword', formData.currentPassword)
    const newPasswordError = validateField('newPassword', formData.newPassword)
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword)
    
    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      setErrors({
        currentPassword: currentPasswordError,
        newPassword: newPasswordError,
        confirmPassword: confirmPasswordError
      })
      return
    }

    // Validar que el usuario esté autenticado
    if (!user?.username) {
      console.log('❌ Usuario no autenticado:', user)
      setErrors({ general: 'No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.' })
      return
    }

    console.log('✅ Usuario autenticado:', user.username)
    setIsSubmitting(true)
    setErrors({})

    try {
      console.log('🔄 Iniciando try block...')
      const clientInfo = getClientInfo()
      
      const changePasswordRequest: ChangePasswordRequest = {
        username: user.username,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        clientIp: clientInfo.clientIp,
        userAgent: clientInfo.userAgent
      }

      console.log('🔄 Llamando a authService.changePassword con:', changePasswordRequest)
      const response = await authService.changePassword(changePasswordRequest)
      console.log('📥 Respuesta recibida del authService:', response)
      
      if (response.success) {
        console.log('✅ AuthService reportó éxito, mostrando mensaje de éxito')
        setSuccessMessage(response.message || '¡Contraseña cambiada exitosamente!')
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        
        // Llamar callback de éxito si existe
        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 1500)
        }
      } else {
        console.log('❌ AuthService reportó fallo:', response.message)
        setErrors({ general: response.message || 'Error al cambiar la contraseña. Intente nuevamente.' })
      }
      
    } catch (error) {
      console.error('❌ ERROR EN CATCH - ChangePassword.tsx:', error)
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      setErrors({ general: 'Error al cambiar la contraseña. Intente nuevamente.' })
    } finally {
      console.log('🔄 Finally block ejecutado')
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Función helper para obtener información del cliente
  const getClientInfo = () => {
    return {
      clientIp: '192.168.1.100', // En un entorno real, esto se obtendría del servidor
      userAgent: navigator.userAgent
    }
  }

  const strength = getPasswordStrength(formData.newPassword)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eceff1] p-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-secondary font-semibold">Cambiar Contraseña</h2>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mx-6 mt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{successMessage}</span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => { console.log('🔥 FORM ONSUBMIT TRIGGERED'); handleSubmit(e); }} className="p-6 space-y-4">
          {/* Contraseña Actual */}
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                placeholder="Ingrese su contraseña actual"
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                onBlur={() => handleBlur('currentPassword')}
                className={`w-full pr-12 py-2 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary-accent font-secondary transition-colors ${
                  errors.currentPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'
                } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <FormValidation error={errors.currentPassword} />
          </div>

          {/* Nueva Contraseña */}
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? "text" : "password"}
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                placeholder="Ingrese su nueva contraseña"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                onBlur={() => handleBlur('newPassword')}
                className={`w-full pr-12 py-2 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary-accent font-secondary transition-colors ${
                  errors.newPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'
                } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Indicador de fortaleza */}
            {formData.newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Fortaleza:</span>
                  <span className={`font-medium ${
                    strength.score <= 2 ? 'text-red-600' : 
                    strength.score <= 4 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${strength.color}`}
                    style={{ width: `${(strength.score / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            <FormValidation error={errors.newPassword} />
            
            {/* Requisitos de contraseña */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>La contraseña debe contener:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Al menos 8 caracteres</li>
                <li>Una letra minúscula y una mayúscula</li>
                <li>Al menos un número</li>
                <li>Al menos un carácter especial (!@#$%^&*)</li>
              </ul>
            </div>
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                placeholder="Confirme su nueva contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full pr-12 py-2 px-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary-accent font-secondary transition-colors ${
                  errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'
                } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <FormValidation error={errors.confirmPassword} />
          </div>

          {/* Error General */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => console.log('🔥 BOTÓN CLICKEADO')}
              className="flex-1 bg-transparent hover:bg-gray-100 text-gray-800 border border-gray-300 hover:border-gray-400 opacity-80 hover:opacity-100 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Cambiar Contraseña
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword