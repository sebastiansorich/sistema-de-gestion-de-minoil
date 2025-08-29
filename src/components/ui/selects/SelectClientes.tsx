/**
 * SelectClientes - Componente de selección de clientes con búsqueda
 * 
 * Características:
 * - Búsqueda en tiempo real por código, nombre, alias o grupo
 * - Muestra información detallada de cada cliente
 * - Límite de resultados para mejor rendimiento
 * - Indicador de estado activo/inactivo
 * - Interfaz intuitiva con iconos
 * 
 * Uso:
 * <SelectClientes
 *   value={selectedClienteCode}
 *   onChange={(code) => setSelectedClienteCode(code)}
 *   placeholder="Buscar cliente..."
 * />
 */

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Loader2, Search, User, Building } from "lucide-react"
import { clientesService, type Cliente } from "../../../services"

interface SelectClientesProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SelectClientes({ 
  value, 
  onChange, 
  placeholder = "Buscar cliente por código o nombre...", 
  disabled = false,
  className = ""
}: SelectClientesProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadClientes()
  }, [])

  // Manejar clics fuera del select
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Filtrar clientes cuando cambie el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClientes(clientes.slice(0, 50)) // Mostrar solo los primeros 50 si no hay búsqueda
    } else {
      const filtered = clientes.filter(cliente => 
        cliente.cardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.groupName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredClientes(filtered.slice(0, 100)) // Limitar a 100 resultados
    }
  }, [searchTerm, clientes])

  const loadClientes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await clientesService.getClientes()
      setClientes(data)
      setFilteredClientes(data.slice(0, 50)) // Mostrar solo los primeros 50 inicialmente
    } catch (err) {
      console.error('Error cargando clientes:', err)
      setError('Error al cargar clientes')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCliente = clientes.find(cliente => cliente.cardCode === value)

  const handleSelect = (cardCode: string) => {
    onChange(cardCode)
    setIsOpen(false)
    setSearchTerm("")
  }

  const getDisplayText = () => {
    if (selectedCliente) {
      return `${selectedCliente.cardCode} - ${selectedCliente.cardName}`
    }
    return placeholder
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleInputClick = () => {
    if (!disabled && !isLoading) {
      setIsOpen(true)
    }
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={isOpen ? searchTerm : (selectedCliente ? `${selectedCliente.cardCode} - ${selectedCliente.cardName}` : "")}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-white text-left ${
            disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-primary focus:border-primary focus:outline-none'
          } ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Cargando clientes...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600 text-sm">
              {error}
              <button 
                onClick={loadClientes}
                className="block w-full mt-2 text-blue-600 hover:text-blue-800"
              >
                Reintentar
              </button>
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes disponibles'}
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {searchTerm && (
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                  {filteredClientes.length} resultado(s) para "{searchTerm}"
                </div>
              )}
              <div className="py-1">
                {filteredClientes.map((cliente) => (
                  <button
                    key={cliente.cardCode}
                    type="button"
                    onClick={() => handleSelect(cliente.cardCode)}
                    className={`w-full text-left px-3 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0 ${
                      value === cliente.cardCode ? 'bg-primary text-white hover:bg-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm">{cliente.cardCode}</div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            cliente.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {cliente.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {cliente.cardName}
                        </div>
                        {cliente.alias && (
                          <div className="text-xs text-gray-500">
                            Alias: {cliente.alias}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Building className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{cliente.groupName}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {filteredClientes.length === 100 && (
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                  Mostrando los primeros 100 resultados. Refina tu búsqueda para ver más.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
