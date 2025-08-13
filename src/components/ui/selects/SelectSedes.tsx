import React, { useState, useEffect } from 'react'
import { ChevronDown, Loader2, Building } from 'lucide-react'
import { sedesService, type Sede } from '../../../services'

interface SelectSedesProps {
  value: number | string
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SelectSedes({ 
  value, 
  onChange, 
  placeholder = "Seleccionar sede...", 
  disabled = false,
  className = ""
}: SelectSedesProps) {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadSedes()
  }, [])

  const loadSedes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await sedesService.getAll()
      setSedes(data.filter(sede => sede.activo))
    } catch (err) {
      console.error('Error cargando sedes:', err)
      setError('Error al cargar sedes')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedSede = sedes.find(sede => sede.id === Number(value))

  const handleSelect = (sedeId: number) => {
    onChange(sedeId)
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
          <span className={selectedSede ? 'text-gray-900' : 'text-gray-500'}>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cargando...
              </div>
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : selectedSede ? (
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2 text-gray-400" />
                {selectedSede.nombre}
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
            {sedes.length === 0 ? (
              <div className="px-3 py-2 text-gray-500">No hay sedes disponibles</div>
            ) : (
              sedes.map((sede) => (
                <button
                  key={sede.id}
                  type="button"
                  onClick={() => handleSelect(sede.id)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-100 
                    ${sede.id === Number(value) ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}
                  `}
                >
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    {sede.nombre}
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