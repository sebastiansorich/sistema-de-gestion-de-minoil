import React, { useState, useEffect } from 'react'
import { rolesService, type Rol } from '../../../services'
import { ChevronDown, Loader2, Shield } from 'lucide-react'

interface SelectRolesProps {
  value?: string | number
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function SelectRoles({ 
  value = "", 
  onChange, 
  placeholder = "Seleccionar rol...",
  className = "",
  disabled = false,
  required = false
}: SelectRolesProps) {
  const [roles, setRoles] = useState<Rol[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await rolesService.getAll()
      // Filtrar solo roles activos
      setRoles(data.filter(rol => rol.activo))
    } catch (err) {
      console.error('Error cargando roles:', err)
      setError('Error al cargar roles')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-2 text-red-600 bg-red-50 rounded border">
        <Shield className="w-4 h-4" />
        <span className="text-sm">{error}</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled || isLoading}
        required={required}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          appearance-none bg-white
          ${isLoading ? 'pr-8' : 'pr-8'}
        `}
      >
        <option value="">{placeholder}</option>
        {roles.map((rol) => (
          <option key={rol.id} value={rol.id}>
            {rol.nombre}
            {rol.descripcion && ` - ${rol.descripcion}`}
          </option>
        ))}
      </select>
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </div>
  )
} 