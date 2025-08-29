import React, { useState } from 'react'
import { X, Loader2, AlertCircle, User, Mail, Building, MapPin, Briefcase, Shield } from 'lucide-react'
import { usuariosService, type CreateUsuarioRequest } from '../../../services'
import { Button } from '../base/button'
import { SelectRoles } from '../selects/SelectRoles'

interface ModalAddUserProps {
  open: boolean
  onClose: () => void
  onSave: () => void
}

export function ModalAddUser({ open, onClose, onSave }: ModalAddUserProps) {
  const [formData, setFormData] = useState<CreateUsuarioRequest>({
    username: '',
    email: '',
    nombre: '',
    apellido: '',
    autenticacion: 'ldap',
    rolId: undefined
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      nombre: '',
      apellido: '',
      autenticacion: 'ldap',
      rolId: undefined
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.username.trim() || !formData.email.trim()) {
      setError('Todos los campos básicos son obligatorios')
      return
    }

    // Removed validation for sedeId, areaId, cargoId as these fields no longer exist

    try {
      setIsLoading(true)
      setError(null)

      const newUser = await usuariosService.create(formData)
      console.log('Usuario creado:', newUser)
      
      resetForm()
      onSave()
      onClose()
    } catch (err) {
      console.error('Error creando usuario:', err)
      setError(err instanceof Error ? err.message : 'Error creando usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof CreateUsuarioRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? '' : value
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
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Agregar Nuevo Usuario
              </h2>
              <p className="text-sm text-gray-600">
                Complete la información del nuevo usuario
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
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el nombre"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el apellido"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="usuario@minoil.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="nombre.usuario"
                required
              />
            </div>
          </div>

                     {/* Asignación de Rol */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               <Shield className="w-4 h-4 inline mr-1" />
               Rol Asignado
             </label>
             <SelectRoles
               value={formData.rolId?.toString() || ''}
               onChange={(value) => handleChange('rolId', value ? parseInt(value) : undefined)}
               placeholder="Seleccionar rol..."
               className="w-full"
             />
             <p className="text-xs text-gray-500 mt-1">
               Asigna un rol para definir los permisos del usuario en el sistema
             </p>
           </div>

           {/* Información sobre roles */}
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
             <div className="flex items-center gap-2 mb-2">
               <Shield className="w-5 h-5 text-blue-600" />
               <h4 className="font-medium text-blue-900">Sistema de Roles</h4>
             </div>
             <p className="text-sm text-blue-800 mb-2">
               Los roles definen los permisos que tiene el usuario en cada módulo del sistema.
             </p>
             <p className="text-xs text-blue-600">
               💡 Puede gestionar roles y permisos desde la sección de Roles y Permisos
             </p>
           </div>

          {/* Autenticación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Autenticación
            </label>
            <select
              value={formData.autenticacion}
              onChange={(e) => handleChange('autenticacion', e.target.value as 'ldap' | 'local')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="local">Local</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              LDAP es la opción recomendada para usuarios de la empresa
            </p>
          </div>

          {/* SAP Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Información SAP</h4>
            <p className="text-sm text-yellow-800">
              Los datos del empleado en SAP (ID, nombre completo, jefe directo) se sincronizarán automáticamente una vez creado el usuario.
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
                'Crear Usuario'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 