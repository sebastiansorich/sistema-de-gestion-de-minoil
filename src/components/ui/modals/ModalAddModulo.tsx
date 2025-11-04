import React, { useState, useEffect } from 'react'
import { modulosService, type Modulo } from '../../../services'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../base'
import { Button } from '../base/button'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface ModalAddModuloProps {
  open: boolean
  onClose: () => void
  onSave: () => void
}

interface FormData {
  nombre: string
  descripcion: string
  ruta: string
  activo: boolean
  esMenu: boolean
  icono: string
  nivel: number
  orden: number
  padreId: number | null
}

const iconOptions = [
  { value: 'package', label: 'Package', icon: '📦' },
  { value: 'trending-up', label: 'Trending Up', icon: '📈' },
  { value: 'users', label: 'Users', icon: '👥' },
  { value: 'calendar', label: 'Calendar', icon: '📅' },
  { value: 'settings', label: 'Settings', icon: '⚙️' },
  { value: 'shield', label: 'Shield', icon: '🛡️' },
  { value: 'file-text', label: 'File Text', icon: '📄' },
  { value: 'folder', label: 'Folder', icon: '📁' },
  { value: 'plus', label: 'Plus', icon: '➕' },
  { value: 'list', label: 'List', icon: '📋' },
  { value: 'bar-chart-2', label: 'Bar Chart', icon: '📊' },
  { value: 'user', label: 'User', icon: '👤' }
]

export default function ModalAddModulo({ open, onClose, onSave }: ModalAddModuloProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    ruta: '',
    activo: true,
    esMenu: true,
    icono: 'folder',
    nivel: 1,
    orden: 1,
    padreId: null
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [parentModules, setParentModules] = useState<Modulo[]>([])
  const [isLoadingParents, setIsLoadingParents] = useState(false)
  const [rutaManuallyEdited, setRutaManuallyEdited] = useState(false)

  // Cargar módulos padre cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadParentModules()
      setRutaManuallyEdited(false)
    }
  }, [open])

  const loadParentModules = async () => {
    try {
      setIsLoadingParents(true)
      const allModules = await modulosService.getAll()
      // Filtrar solo módulos de nivel 1 (padres)
      const parents = allModules.filter(modulo => modulo.nivel === 1)
      setParentModules(parents)
    } catch (err) {
      console.error('Error cargando módulos padre:', err)
    } finally {
      setIsLoadingParents(false)
    }
  }

  // Función para normalizar texto y generar slug
  const generateSlug = (nombre: string): string => {
    if (!nombre.trim()) return ''
    
    return nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  
  // Función para generar ruta base (con /)
  const generateRuta = (nombre: string): string => {
    const slug = generateSlug(nombre)
    return slug ? `/${slug}` : ''
  }

  // Función para generar ruta completa cuando hay módulo padre
  const generateFullRuta = (nombre: string, padreId: number | null): string => {
    const slug = generateSlug(nombre)
    if (!slug) return ''
    
    if (padreId) {
      const padre = parentModules.find(p => p.id === padreId)
      if (padre) {
        const padreRuta = padre.ruta.replace(/\/$/, '')
        return `${padreRuta}/${slug}`
      }
    }
    
    return `/${slug}`
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean | number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      
      // Si se cambia el nivel a 1, resetear el padreId y actualizar ruta
      if (field === 'nivel' && value === 1) {
        newData.padreId = null
        if (!rutaManuallyEdited && prev.nombre) {
          newData.ruta = generateRuta(prev.nombre)
        }
      }
      
      // Si se cambia el nombre, actualizar la ruta automáticamente (solo si no se editó manualmente)
      if (field === 'nombre' && !rutaManuallyEdited) {
        newData.ruta = generateFullRuta(value as string, prev.padreId)
      }
      
      // Si se cambia el módulo padre, actualizar la ruta
      if (field === 'padreId' && !rutaManuallyEdited && prev.nombre) {
        newData.ruta = generateFullRuta(prev.nombre, value as number | null)
        // Si se selecciona un padre, actualizar el nivel automáticamente si es necesario
        if (value && prev.nivel === 1) {
          newData.nivel = 2
        }
      }
      
      return newData
    })
  }

  // Manejar cambio manual de ruta
  const handleRutaChange = (value: string) => {
    setRutaManuallyEdited(true)
    handleInputChange('ruta', value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim() || !formData.descripcion.trim() || !formData.ruta.trim()) {
      setError('Todos los campos son obligatorios')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const moduloData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        ruta: formData.ruta.trim(),
        activo: formData.activo,
        esMenu: formData.esMenu,
        icono: formData.icono,
        nivel: formData.nivel,
        orden: formData.orden,
        padreId: formData.padreId
      }

      await modulosService.create(moduloData)
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSave()
        onClose()
        // Resetear formulario
        setFormData({
          nombre: '',
          descripcion: '',
          ruta: '',
          activo: true,
          esMenu: true,
          icono: 'folder',
          nivel: 1,
          orden: 1,
          padreId: null
        })
        setRutaManuallyEdited(false)
      }, 1500)
      
    } catch (err) {
      console.error('Error creando módulo:', err)
      setError(err instanceof Error ? err.message : 'Error creando módulo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      setSuccess(false)
      onClose()
      // Resetear formulario
      setFormData({
        nombre: '',
        descripcion: '',
        ruta: '',
        activo: true,
        esMenu: true,
        icono: 'folder',
        nivel: 1,
        orden: 1,
        padreId: null
      })
      setRutaManuallyEdited(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Nuevo Módulo
          </DialogTitle>
        </DialogHeader>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">¡Módulo creado exitosamente!</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Gestión de Usuarios"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ruta *
              </label>
              <input
                type="text"
                value={formData.ruta}
                onChange={(e) => handleRutaChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Se genera automáticamente desde el nombre"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {rutaManuallyEdited ? '✏️ Editando manualmente' : '⚡ Se genera automáticamente desde el nombre'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción del módulo..."
              rows={3}
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel
              </label>
              <select
                value={formData.nivel}
                onChange={(e) => handleInputChange('nivel', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value={1}>1 - Principal</option>
                <option value={2}>2 - Submódulo</option>
                <option value={3}>3 - Sub-submódulo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden
              </label>
              <input
                type="number"
                value={formData.orden}
                onChange={(e) => handleInputChange('orden', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ícono
              </label>
              <select
                value={formData.icono}
                onChange={(e) => handleInputChange('icono', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de módulo padre - visible cuando nivel > 1 o cuando se selecciona un padre */}
          {(formData.nivel > 1 || formData.padreId) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Módulo Padre {formData.nivel > 1 && '*'}
              </label>
              {isLoadingParents ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cargando módulos padre...</span>
                </div>
              ) : (
                <select
                  value={formData.padreId || ''}
                  onChange={(e) => handleInputChange('padreId', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                  required={formData.nivel > 1}
                >
                  <option value="">Seleccionar módulo padre...</option>
                  {parentModules.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.nombre} ({parent.ruta})
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.nivel > 1 
                  ? 'Selecciona el módulo padre al que pertenecerá este submódulo'
                  : '💡 Al seleccionar un módulo padre, el nivel cambiará automáticamente a 2 - Submódulo'}
              </p>
            </div>
          )}
          
          {/* Indicador de relación padre-hijo */}
          {formData.padreId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <span className="text-sm font-medium">📋 Módulo Padre Seleccionado:</span>
                <span className="text-sm">
                  {parentModules.find(p => p.id === formData.padreId)?.nombre || 'Cargando...'}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Ruta completa: {formData.ruta || 'Se generará automáticamente'}
              </p>
            </div>
          )}

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => handleInputChange('activo', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-700">Activo</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.esMenu}
                onChange={(e) => handleInputChange('esMenu', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-700">Es menú</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              className="bg-yellow-300 hover:bg-yellow-400 text-gray-900"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Módulo'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
