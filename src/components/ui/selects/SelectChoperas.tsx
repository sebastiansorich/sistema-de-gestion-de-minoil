import { useState, useEffect, useRef } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import { choperasService, type Chopera } from "../../../services"

interface SelectChoperasProps {
  value?: string
  onChange: (value: string) => void
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
  const [searchTerm, setSearchTerm] = useState("")
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChoperas()
  }, [])

  // Manejar clics fuera del select
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

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

  // Encontrar la chopera seleccionada usando itemCode (mantener compatibilidad)
  const selectedChopera = choperas.find(chopera => chopera.itemCode === value)

  const handleSelect = (itemCode: string) => {
    onChange(itemCode)
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (selectedChopera) {
      return `${selectedChopera.itemCode} - ${selectedChopera.itemName} (${selectedChopera.serieActivo})`
    }
    return placeholder
  }

  // Filtrar choperas por término de búsqueda
  const filteredChoperas = choperas.filter(chopera =>
    chopera.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chopera.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chopera.serieActivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chopera.aliasName || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`relative ${className}`} ref={selectRef}>
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
              <button 
                onClick={loadChoperas}
                className="block w-full mt-2 text-blue-600 hover:text-blue-800"
              >
                Reintentar
              </button>
            </div>
          ) : choperas.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No hay choperas disponibles
            </div>
          ) : (
            <div className="py-1">
              {/* Campo de búsqueda */}
              <div className="px-3 py-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Buscar por código, nombre, serie o alias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              {/* Lista de choperas filtradas */}
              <div className="max-h-48 overflow-auto">
                {filteredChoperas.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No se encontraron choperas
                  </div>
                ) : (
                  filteredChoperas.map((chopera) => (
                    <button
                      key={`${chopera.itemCode}-${chopera.serieActivo}`}
                      type="button"
                      onClick={() => handleSelect(chopera.itemCode)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                        value === chopera.itemCode ? 'bg-primary text-white hover:bg-primary' : ''
                      }`}
                    >
                      <div className="font-medium">{chopera.itemCode}</div>
                      <div className="text-sm text-gray-600">{chopera.itemName}</div>
                      <div className="text-xs text-gray-500">
                        Serie: {chopera.serieActivo}
                        {chopera.aliasName && ` | Alias: ${chopera.aliasName}`}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
