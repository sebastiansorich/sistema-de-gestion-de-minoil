/**
 * Versión simplificada de SelectEmpleados para debugging
 */

import { useState, useEffect } from "react"
import { empleadosService, type Empleado } from "../../../services"

interface SelectEmpleadosSimpleProps {
  value?: number | string
  onChange: (empId: number) => void
  placeholder?: string
  className?: string
}

export function SelectEmpleadosSimple({ 
  value, 
  onChange, 
  placeholder = "Seleccionar empleado...",
  className = ""
}: SelectEmpleadosSimpleProps) {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEmpleados()
  }, [])

  const loadEmpleados = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🔍 SelectEmpleadosSimple - Cargando empleados...')
      
      const data = await empleadosService.getEmpleados()
      console.log('🔍 SelectEmpleadosSimple - Datos recibidos:', data)
      
      if (!Array.isArray(data)) {
        console.error('Los datos recibidos no son un array:', data)
        setError('Formato de datos inválido')
        setEmpleados([])
        return
      }
      
      console.log('🔍 SelectEmpleadosSimple - Cargando', data.length, 'empleados')
      setEmpleados(data)
    } catch (err) {
      console.error('Error cargando empleados:', err)
      setError('Error al cargar empleados')
      setEmpleados([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (empId: number) => {
    console.log('🔍 SelectEmpleadosSimple - Seleccionando empleado:', empId)
    onChange(empId)
  }

  if (isLoading) {
    return (
      <div className={`p-2 border rounded ${className}`}>
        <div className="text-sm text-gray-500">Cargando empleados...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-2 border border-red-300 rounded bg-red-50 ${className}`}>
        <div className="text-sm text-red-600">{error}</div>
        <button 
          onClick={loadEmpleados}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className={`border rounded ${className}`}>
      <div className="p-2 text-sm text-gray-600">
        {empleados.length} empleados disponibles
      </div>
      <div className="max-h-40 overflow-y-auto">
        {empleados.slice(0, 10).map((empleado, index) => (
          <button
            key={`emp-${empleado.empId}-${index}`}
            onClick={() => handleSelect(empleado.empId)}
            className={`w-full text-left p-2 hover:bg-gray-100 border-b last:border-b-0 ${
              value === empleado.empId ? 'bg-blue-50' : ''
            }`}
          >
            <div className="text-sm">
              <div className="font-medium">ID: {empleado.empId}</div>
              <div className="text-gray-600">{empleado.nombre} {empleado.apellido || ''}</div>
              {empleado.cargo && (
                <div className="text-xs text-gray-500">{empleado.cargo}</div>
              )}
            </div>
          </button>
        ))}
      </div>
      {empleados.length > 10 && (
        <div className="p-2 text-xs text-gray-500 text-center">
          Mostrando 10 de {empleados.length} empleados
        </div>
      )}
    </div>
  )
}
