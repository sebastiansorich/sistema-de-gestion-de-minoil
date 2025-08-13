import React from 'react'
import { AlertTriangle, CheckCircle, Info, Trash2, Edit, Plus } from 'lucide-react'

interface ModalConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  type?: 'danger' | 'success' | 'info' | 'warning';
  operation?: 'delete' | 'edit' | 'create' | 'generic';
  entityName?: string;
  isLoading?: boolean;
}

export function ModalConfirm({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  type = 'info',
  operation = 'generic',
  entityName = '',
  isLoading = false
}: ModalConfirmProps) {
  
  const getIcon = () => {
    switch (operation) {
      case 'delete':
        return <Trash2 className="w-8 h-8 text-red-600" />
      case 'edit':
        return <Edit className="w-8 h-8 text-blue-600" />
      case 'create':
        return <Plus className="w-8 h-8 text-green-600" />
      default:
        switch (type) {
          case 'danger':
            return <AlertTriangle className="w-8 h-8 text-red-600" />
          case 'success':
            return <CheckCircle className="w-8 h-8 text-green-600" />
          case 'warning':
            return <AlertTriangle className="w-8 h-8 text-yellow-600" />
          default:
            return <Info className="w-8 h-8 text-blue-600" />
        }
    }
  }

  const getColors = () => {
    switch (operation) {
      case 'delete':
        return {
          background: 'bg-red-50',
          border: 'border-red-200',
          button: 'bg-red-600 hover:bg-red-700',
          buttonText: 'text-white'
        }
      case 'edit':
        return {
          background: 'bg-blue-50',
          border: 'border-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700',
          buttonText: 'text-white'
        }
      case 'create':
        return {
          background: 'bg-green-50',
          border: 'border-green-200',
          button: 'bg-green-600 hover:bg-green-700',
          buttonText: 'text-white'
        }
      default:
        switch (type) {
          case 'danger':
            return {
              background: 'bg-red-50',
              border: 'border-red-200',
              button: 'bg-red-600 hover:bg-red-700',
              buttonText: 'text-white'
            }
          case 'success':
            return {
              background: 'bg-green-50',
              border: 'border-green-200',
              button: 'bg-green-600 hover:bg-green-700',
              buttonText: 'text-white'
            }
          case 'warning':
            return {
              background: 'bg-yellow-50',
              border: 'border-yellow-200',
              button: 'bg-yellow-600 hover:bg-yellow-700',
              buttonText: 'text-white'
            }
          default:
            return {
              background: 'bg-blue-50',
              border: 'border-blue-200',
              button: 'bg-blue-600 hover:bg-blue-700',
              buttonText: 'text-white'
            }
        }
    }
  }

  const getConfirmText = () => {
    switch (operation) {
      case 'delete':
        return 'Eliminar'
      case 'edit':
        return 'Guardar Cambios'
      case 'create':
        return 'Crear'
      default:
        return 'Confirmar'
    }
  }

  if (!open) return null

  const colors = getColors()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md m-4 overflow-hidden">
        {/* Header with colored background */}
        <div className={`${colors.background} ${colors.border} border-b p-6`}>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              {entityName && (
                <p className="text-sm text-gray-600 mt-1">
                  {entityName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {description && (
            <p className="text-gray-700 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium ${colors.button} ${colors.buttonText} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px] flex items-center justify-center`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando...</span>
              </div>
            ) : (
              getConfirmText()
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 