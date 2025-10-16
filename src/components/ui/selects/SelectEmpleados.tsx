/**
 * SelectEmpleados - Componente de selección de empleados con búsqueda
 */

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Loader2, Search, User, Briefcase, X } from "lucide-react"
import { empleadosService, type Empleado } from "../../../services"

interface SelectEmpleadosProps {
  value?: number | string
  onChange: (empId: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SelectEmpleados({ 
  value, 
  onChange, 
  placeholder = "Buscar empleado por ID o nombre...", 
  disabled = false,
  className = ""
}: SelectEmpleadosProps) {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const selectRef = useRef<HTMLDivElement>(null)

  // Debug: Log cuando cambie el valor
  useEffect(() => {
    console.log('🔍 SelectEmpleados - Valor actual:', value)
  }, [value])

  useEffect(() => {
    loadEmpleados()
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

  // Filtrar empleados cuando cambie el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmpleados(empleados.slice(0, 50))
    } else {
      const filtered = empleados.filter(empleado => 
        empleado.empId.toString().includes(searchTerm) ||
        empleado.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEmpleados(filtered.slice(0, 100))
    }
  }, [searchTerm, empleados])

  const loadEmpleados = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🔍 SelectEmpleados - Cargando empleados...')
      
      const data = await empleadosService.getEmpleados()
      console.log('🔍 SelectEmpleados - Datos recibidos:', data)
      
      if (!Array.isArray(data)) {
        console.error('Los datos recibidos no son un array:', data)
        setError('Formato de datos inválido')
        setEmpleados([])
        setFilteredEmpleados([])
        return
      }
      
      console.log('🔍 SelectEmpleados - Cargando', data.length, 'empleados')
      setEmpleados(data)
      setFilteredEmpleados(data.slice(0, 50))
    } catch (err) {
      console.error('Error cargando empleados:', err)
      setError('Error al cargar empleados')
      setEmpleados([])
      setFilteredEmpleados([])
    } finally {
      setIsLoading(false)
    }
  }

  const selectedEmpleado = empleados.find(empleado => empleado.empId === Number(value))

  const handleSelect = (empId: number) => {
    console.log('🔍 SelectEmpleados - Seleccionando empleado:', empId)
    onChange(empId)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClear = () => {
    console.log('🔍 SelectEmpleados - Limpiando selección')
    onChange(0)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleInputClick = () => {
    if (!disabled && !isLoading) {
      setIsOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm("")
    }
  }

  const getDisplayText = () => {
    if (selectedEmpleado) {
      const nombre = selectedEmpleado.nombreCompleto || selectedEmpleado.nombre || ''
      return `${selectedEmpleado.empId} - ${nombre}`.trim()
    }
    return placeholder
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={isOpen ? searchTerm : (selectedEmpleado ? getDisplayText() : "")}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-white text-left ${
            disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-primary focus:border-primary focus:outline-none'
          } ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {selectedEmpleado && !isOpen && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-3 h-3" />
            </button>
          )}
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
              <span className="text-sm">Cargando empleados...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600 text-sm">
              {error}
              <button 
                onClick={loadEmpleados}
                className="block w-full mt-2 text-blue-600 hover:text-blue-800"
              >
                Reintentar
              </button>
            </div>
          ) : filteredEmpleados.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchTerm ? 'No se encontraron empleados' : 'No hay empleados disponibles'}
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {searchTerm && (
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                  {filteredEmpleados.length} resultado(s) para "{searchTerm}"
                </div>
              )}
              <div className="py-1">
                {filteredEmpleados.map((empleado, index) => (
                  <button
                    key={`${empleado.empId}-${index}`}
                    type="button"
                    onClick={() => handleSelect(empleado.empId)}
                    className={`w-full text-left px-3 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors ${
                      value === empleado.empId ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm">ID: {empleado.empId}</div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            empleado.activo !== false 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {empleado.activo !== false ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {empleado.nombreCompleto || empleado.nombre} {empleado.apellido || ''}
                        </div>
                        {empleado.cargo && (
                          <div className="flex items-center gap-2 mt-1">
                            <Briefcase className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{empleado.cargo}</span>
                          </div>
                        )}
                        {empleado.regional && (
                          <div className="text-xs text-gray-500 mt-1">
                            Regional: {empleado.regional}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {filteredEmpleados.length === 100 && (
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