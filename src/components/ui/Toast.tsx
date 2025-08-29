import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle
}

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
}

const iconStyles = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600'
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  const Icon = toastIcons[type]

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto-cerrar después del tiempo especificado
    const autoCloseTimer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(autoCloseTimer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  return (
    <div
      className={`
        fixed z-50 transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${toastStyles[type]} border rounded-lg shadow-lg p-4
        top-4 right-4 left-4 sm:left-auto sm:max-w-sm md:max-w-md lg:max-w-lg
        w-auto sm:w-full
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconStyles[type]}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium leading-5">
            {title}
          </h4>
          {message && (
            <p className="mt-1 text-sm leading-4 opacity-90">
              {message}
            </p>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Barra de progreso */}
      <div className="mt-3 h-1 bg-black/10 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-linear ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
          }`}
          style={{
            width: isExiting ? '0%' : '100%',
            transitionDuration: isExiting ? '300ms' : `${duration}ms`
          }}
        />
      </div>
    </div>
  )
}

// Hook para manejar múltiples toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast
    }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showSuccess = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration })
  }

  const showError = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration })
  }

  const showInfo = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration })
  }

  const showWarning = (title: string, message?: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration })
  }

  return {
    toasts,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast
  }
}

// Componente contenedor para múltiples toasts que usa el contexto
export function ToastContainerWithContext() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 space-y-2 max-w-sm sm:max-w-md md:max-w-lg">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}

// Componente contenedor para múltiples toasts
export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 space-y-2 max-w-sm sm:max-w-md md:max-w-lg">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}

// Componente contenedor que acepta props
export function ToastContainerWithProps({ toasts, removeToast }: { toasts: any[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 space-y-2 max-w-sm sm:max-w-md md:max-w-lg">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}
