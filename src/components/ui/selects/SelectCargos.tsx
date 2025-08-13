import React, { useState, useEffect } from 'react'
import { ChevronDown, Loader2, Briefcase } from 'lucide-react'
import { cargosService, type Cargo } from '../../../services'

interface SelectCargosProps {
  value: number | string
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SelectCargos({ 
  value, 
  onChange, 
  placeholder = "Seleccionar cargo...", 
  disabled = false,
  className = ""
}: SelectCargosProps) {
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadCargos()
  }, [])

  const loadCargos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await cargosService.getAll()
      setCargos(data.filter(cargo => cargo.activo))
    } catch (err) {
      console.error('Error cargando cargos:', err)
      setError('Error al cargar cargos')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCargo = cargos.find(cargo => cargo.id === Number(value))

  const handleSelect = (cargoId: number) => {
    onChange(cargoId)
    setIsOpen(false)
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
          <span className={selectedCargo ? 'text-gray-900' : 'text-gray-500'}>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cargando...
              </div>
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : selectedCargo ? (
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                  <div>{selectedCargo.nombre}</div>
                  <div className="text-sm text-gray-500">Nivel {selectedCargo.nivel}</div>
                </div>
              </div>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </button>

      {isOpen && !isLoading && !error && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="max-h-60 overflow-auto">
            {cargos.length === 0 ? (
              <div className="px-3 py-2 text-gray-500">No hay cargos disponibles</div>
            ) : (
              cargos.map((cargo) => (
                <button
                  key={cargo.id}
                  type="button"
                  onClick={() => handleSelect(cargo.id)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-100 
                    ${cargo.id === Number(value) ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}
                  `}
                >
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <div className="font-medium">{cargo.nombre}</div>
                      <div className="text-sm text-gray-500">Nivel {cargo.nivel}</div>
                    </div>
                  </div>
                </button>
              ))
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