import { useState, useEffect } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import { choperasService, type Chopera } from "../../../services"

interface SelectChoperasProps {
  value?: number
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SelectChoperas({ 
  value, 
  onChange, 
  placeholder = "Seleccionar chopera...", 
  disabled = false,
  className = ""
}: SelectChoperasProps) {
  const [choperas, setChoperas] = useState<Chopera[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadChoperas()
  }, [])

  const loadChoperas = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await choperasService.getChoperas()
      setChoperas(data)
    } catch (err) {
      console.error('Error cargando choperas:', err)
      setError('Error al cargar choperas')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedChopera = choperas.find(chopera => chopera.ItemCode === value?.toString())

  const handleSelect = (choperaId: string) => {
    // Convertir a número si es posible, sino usar el código como string
    const numericId = parseInt(choperaId) || 0
    onChange(numericId)
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (selectedChopera) {
      return `${selectedChopera.ItemCode} - ${selectedChopera.ItemName}`
    }
    return placeholder
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg bg-white text-left ${
          disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-primary focus:border-primary focus:outline-none'
        } ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <span className={selectedChopera ? 'text-gray-900' : 'text-gray-500'}>
          {getDisplayText()}
        </span>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : (
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Cargando choperas...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600 text-sm">
              {error}
            </div>
          ) : choperas.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No hay choperas disponibles
            </div>
          ) : (
            <div className="py-1">
              {choperas.map((chopera) => (
                <button
                  key={chopera.ItemCode}
                  type="button"
                  onClick={() => handleSelect(chopera.ItemCode)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                    value?.toString() === chopera.ItemCode ? 'bg-primary text-white hover:bg-primary' : ''
                  }`}
                >
                  <div className="font-medium">{chopera.ItemCode}</div>
                  <div className="text-sm text-gray-600">{chopera.ItemName}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
