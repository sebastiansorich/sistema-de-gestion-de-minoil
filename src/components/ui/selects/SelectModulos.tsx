import React, { useState, useEffect } from 'react'
import { ChevronDown, Loader2, Package } from 'lucide-react'
import { modulosService, type Modulo } from '../../../services'

interface SelectModulosProps {
  value: number | string
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  multiple?: boolean
  selectedValues?: number[]
  onMultipleChange?: (values: number[]) => void
}

export function SelectModulos({ 
  value, 
  onChange, 
  placeholder = "Seleccionar módulo...", 
  disabled = false,
  className = "",
  multiple = false,
  selectedValues = [],
  onMultipleChange
}: SelectModulosProps) {
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadModulos()
  }, [])

  const loadModulos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await modulosService.getAll()
      setModulos(data.filter(modulo => modulo.activo))
    } catch (err) {
      console.error('Error cargando módulos:', err)
      setError('Error al cargar módulos')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedModulo = modulos.find(modulo => modulo.id === Number(value))
  const selectedModulos = modulos.filter(modulo => selectedValues.includes(modulo.id))

  const handleSelect = (moduloId: number) => {
    if (multiple && onMultipleChange) {
      const newSelection = selectedValues.includes(moduloId)
        ? selectedValues.filter(id => id !== moduloId)
        : [...selectedValues, moduloId]
      onMultipleChange(newSelection)
    } else {
      onChange(moduloId)
      setIsOpen(false)
    }
  }

  const getDisplayText = () => {
    if (multiple) {
      if (selectedModulos.length === 0) return placeholder
      if (selectedModulos.length === 1) return selectedModulos[0].nombre
      return `${selectedModulos.length} módulos seleccionados`
    }
    return selectedModulo ? selectedModulo.nombre : placeholder
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`
          w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled || isLoading ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
          ${error ? 'border-red-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={(selectedModulo || selectedModulos.length > 0) ? 'text-gray-900' : 'text-gray-500'}>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cargando...
              </div>
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : (
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2 text-gray-400" />
                {getDisplayText()}
              </div>
            )}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </button>

      {isOpen && !isLoading && !error && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="max-h-60 overflow-auto">
            {modulos.length === 0 ? (
              <div className="px-3 py-2 text-gray-500">No hay módulos disponibles</div>
            ) : (
              modulos.map((modulo) => {
                const isSelected = multiple 
                  ? selectedValues.includes(modulo.id)
                  : modulo.id === Number(value)
                
                return (
                  <button
                    key={modulo.id}
                    type="button"
                    onClick={() => handleSelect(modulo.id)}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-100 
                      ${isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}
                    `}
                  >
                    <div className="flex items-center">
                      {multiple && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Manejado por el onClick del botón
                          className="mr-2"
                        />
                      )}
                      <Package className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div className="font-medium">{modulo.nombre}</div>
                        <div className="text-sm text-gray-500">{modulo.descripcion}</div>
                        <div className="text-xs text-gray-400">{modulo.ruta}</div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Overlay para cerrar el dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 