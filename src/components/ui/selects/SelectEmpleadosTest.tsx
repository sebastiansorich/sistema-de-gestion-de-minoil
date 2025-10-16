/**
 * Componente de prueba para SelectEmpleados
 * Para verificar que el servicio y el componente funcionen correctamente
 */

import { useState } from 'react'
import { SelectEmpleados } from './SelectEmpleados'

export function SelectEmpleadosTest() {
  const [selectedEmpId, setSelectedEmpId] = useState<number | undefined>(undefined)

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Prueba de SelectEmpleados</h3>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Empleado seleccionado:</label>
        <SelectEmpleados
          value={selectedEmpId}
          onChange={setSelectedEmpId}
          placeholder="Seleccionar empleado..."
          className="w-full max-w-md"
        />
      </div>
      
      {selectedEmpId && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Empleado seleccionado: ID {selectedEmpId}
          </p>
        </div>
      )}
      
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Revisa la consola para ver los logs de debug del servicio.
        </p>
      </div>
    </div>
  )
}
