import React, { useState } from 'react'
import { X, Loader2, AlertCircle, Shield, FileText, Info } from 'lucide-react'
import { rolesService, type CreateRolRequest } from '../../../services'
import { Button } from '../base/button'

interface ModalAddRolProps {
  open: boolean
  onClose: () => void
  onSave: () => void
}

export function ModalAddRol({ open, onClose, onSave }: ModalAddRolProps) {
  const [formData, setFormData] = useState<CreateRolRequest>({
    nombre: '',
    descripcion: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: ''
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre del rol es obligatorio')
      return
    }

    if (!formData.descripcion.trim()) {
      setError('La descripción del rol es obligatoria')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const newRol = await rolesService.create(formData)
      console.log('Rol creado:', newRol)
      
      resetForm()
      onSave()
      onClose()
    } catch (err) {
      console.error('Error creando rol:', err)
      setError(err instanceof Error ? err.message : 'Error creando rol')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof CreateRolRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Crear Nuevo Rol
              </h2>
              <p className="text-sm text-gray-600">
                Define un nuevo rol y sus características
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre del rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-1" />
              Nombre del Rol *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Administrador, Supervisor, Usuario"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              El nombre debe ser único y descriptivo
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe las responsabilidades y alcance de este rol..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Explica qué puede hacer un usuario con este rol
            </p>
          </div>

          {/* Información sobre permisos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Configuración de Permisos</h4>
            </div>
            <p className="text-sm text-blue-800 mb-2">
              Una vez creado el rol, podrás configurar los permisos específicos para cada módulo del sistema.
            </p>
            <p className="text-xs text-blue-600">
              💡 Los permisos se asignan individualmente: crear, leer, actualizar y eliminar para cada módulo
            </p>
          </div>

          {/* Estado por defecto */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Estado Inicial</h4>
            <p className="text-sm text-green-800">
              El rol se creará en estado <strong>activo</strong> y sin permisos asignados inicialmente.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Rol'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 