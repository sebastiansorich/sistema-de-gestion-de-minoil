import React, { useState, useEffect } from 'react'
import { X, Loader2, AlertCircle, User, Mail, Building, MapPin, Briefcase, Shield } from 'lucide-react'
import { usuariosService, type Usuario, type UpdateUsuarioRequest } from '../../../services'
import { SelectSedes, SelectAreas, SelectCargos } from '../selects'
import { Button } from '../base/button'

interface ModalEditUserProps {
  open: boolean
  onClose: () => void
  usuario: Usuario | null
  onSave: () => void
}

export function ModalEditUser({ open, onClose, usuario, onSave }: ModalEditUserProps) {
  const [formData, setFormData] = useState<UpdateUsuarioRequest>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Resetear formulario cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      setFormData({
        username: usuario.username,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        autenticacion: usuario.autenticacion,
        // empleadoSapId y nombreCompletoSap son de solo lectura, no se envían en updates
        activo: usuario.activo,
        sedeId: usuario.sedeId,
        areaId: usuario.areaId,
        cargoId: usuario.cargoId
        // rolId NO existe - el rol viene del cargo seleccionado
      })
    }
    setError(null)
  }, [usuario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuario) return

    try {
      setIsLoading(true)
      setError(null)

      await usuariosService.update(usuario.id, formData)
      onSave()
      onClose()
    } catch (err) {
      console.error('Error actualizando usuario:', err)
      setError(err instanceof Error ? err.message : 'Error actualizando usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof UpdateUsuarioRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }))
  }

  if (!open || !usuario) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Editar Usuario
              </h2>
              <p className="text-sm text-gray-500">
                {usuario.nombre} {usuario.apellido}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre || ''}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido
              </label>
              <input
                type="text"
                value={formData.apellido || ''}
                onChange={(e) => handleChange('apellido', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => handleChange('username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* SAP ID - Solo lectura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SAP ID (Empleado) - Solo lectura
            </label>
            <input
              type="number"
              value={usuario?.empleadoSapId || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              placeholder="Sincronizado desde SAP"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este campo se sincroniza automáticamente desde SAP
            </p>
          </div>

          {/* Ubicación y cargo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Sede
              </label>
              <SelectSedes
                value={formData.sedeId || ''}
                onChange={(value) => handleChange('sedeId', value ? Number(value) : undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Área
              </label>
              <SelectAreas
                value={formData.areaId || ''}
                onChange={(value) => handleChange('areaId', value ? Number(value) : undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Cargo
              </label>
              <SelectCargos
                value={formData.cargoId || ''}
                onChange={(value) => handleChange('cargoId', value ? Number(value) : undefined)}
              />
            </div>
          </div>

          {/* Información sobre roles */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Sistema de Roles</h4>
            </div>
            <p className="text-sm text-blue-800 mb-2">
              El rol del usuario se asigna automáticamente a través del <strong>cargo seleccionado</strong>.
            </p>
            {usuario?.cargo?.rol && (
              <div className="bg-white rounded border border-blue-300 p-3">
                <p className="text-sm text-gray-600">Rol actual:</p>
                <p className="font-semibold text-blue-900">
                  {usuario.cargo.rol.nombre}
                </p>
                {usuario.cargo.rol.descripcion && (
                  <p className="text-xs text-gray-600 mt-1">
                    {usuario.cargo.rol.descripcion}
                  </p>
                )}
              </div>
            )}
            <p className="text-xs text-blue-600 mt-2">
              💡 Para cambiar el rol, selecciona un cargo diferente arriba
            </p>
          </div>

          {/* Autenticación y estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Autenticación
              </label>
              <select
                value={formData.autenticacion || 'ldap'}
                onChange={(e) => handleChange('autenticacion', e.target.value as 'ldap' | 'local')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ldap">LDAP (Active Directory)</option>
                <option value="local">Local</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium text-gray-700">
                Estado del Usuario
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activo ?? true}
                  onChange={(e) => handleChange('activo', e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Activo</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 