import React, { useState, useEffect } from 'react'
import { ChevronDown, Loader2, Building } from 'lucide-react'
import { areasService, type Area } from '../../../services'

interface SelectAreasProps {
  value: number | string
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SelectAreas({ 
  value, 
  onChange, 
  placeholder = "Seleccionar área...", 
  disabled = false,
  className = ""
}: SelectAreasProps) {
  const [areas, setAreas] = useState<Area[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadAreas()
  }, [])

  const loadAreas = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await areasService.getAll()
      setAreas(data.filter(area => area.activo))
    } catch (err) {
      console.error('Error cargando áreas:', err)
      setError('Error al cargar áreas')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedArea = areas.find(area => area.id === Number(value))

  const handleSelect = (areaId: number) => {
    onChange(areaId)
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
          <span className={selectedArea ? 'text-gray-900' : 'text-gray-500'}>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cargando...
              </div>
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : selectedArea ? (
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2 text-gray-400" />
                {selectedArea.nombre}
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
            {areas.length === 0 ? (
              <div className="px-3 py-2 text-gray-500">No hay áreas disponibles</div>
            ) : (
              areas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleSelect(area.id)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-100 
                    ${area.id === Number(value) ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}
                  `}
                >
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    {area.nombre}
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