import React, { createContext, useContext, useState, type ReactNode } from 'react'
import { Toast, ToastContainerWithProps } from '../components/ui/Toast'

interface ToastContextType {
  showSuccess: (title: string, message?: string, duration?: number) => void
  showError: (title: string, message?: string, duration?: number) => void
  showInfo: (title: string, message?: string, duration?: number) => void
  showWarning: (title: string, message?: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<any[]>([])

  const addToast = (toast: any) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = {
      ...toast,
      id,
      onClose: (id: string) => removeToast(id)
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

  const toastValue = {
    showSuccess,
    showError,
    showInfo,
    showWarning
  }

  return (
    <ToastContext.Provider value={toastValue}>
      {children}
      <ToastContainerWithProps toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}
