import React, { useState, useEffect, useRef } from 'react'
import { cargosService, type Cargo, type UpdateCargoRequest } from '../../services'
import { Loader2, AlertCircle, Edit, Search, Briefcase, Shield, Building } from 'lucide-react'
import { SelectRoles, Pagination, Button } from '../../components/ui'

export default function Cargos() {
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCargoId, setEditingCargoId] = useState<number | null>(null)
  const [tempRolId, setTempRolId] = useState<number | string>('')
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  
  // Ref para el scroll de la tabla
  const tableScrollRef = useRef<HTMLDivElement>(null)

  // Cargar cargos al montar el componente
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
      setError(err instanceof Error ? err.message : 'Error cargando cargos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditRol = (cargoId: number, currentRolId?: number) => {
    setEditingCargoId(cargoId)
    setTempRolId(currentRolId || '')
  }

  const handleSaveRol = async (cargoId: number) => {
    try {
      const updateData: UpdateCargoRequest = {
        rolId: tempRolId ? Number(tempRolId) : undefined
      }

      await cargosService.update(cargoId, updateData)
      await loadCargos() // Recargar datos
      setEditingCargoId(null)
      setTempRolId('')
    } catch (err) {
      console.error('Error actualizando cargo:', err)
      alert(err instanceof Error ? err.message : 'Error actualizando cargo')
    }
  }

  const handleCancelEdit = () => {
    setEditingCargoId(null)
    setTempRolId('')
  }

  // Filtrar cargos por término de búsqueda
  const filteredCargos = cargos.filter(cargo =>
    cargo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Cálculos de paginación
  const totalPages = Math.ceil(filteredCargos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCargos = filteredCargos.slice(startIndex, startIndex + itemsPerPage)
  
  // Resetear página al cambiar búsqueda
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])
  
  // Manejadores de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top de la tabla
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0
    }
  }
  
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
    // Scroll to top de la tabla
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Cargando cargos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 m-0">
      {/* Barra de búsqueda */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar cargos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          {filteredCargos.length} de {cargos.length} cargos
        </div>
      </div>

      {/* Tabla de cargos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div ref={tableScrollRef} className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Área
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol Asignado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCargos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron cargos que coincidan con la búsqueda' : 'No hay cargos disponibles'}
                  </td>
                </tr>
              ) : (
                paginatedCargos.map((cargo) => (
                  <tr key={cargo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Briefcase className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {cargo.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            Nivel {cargo.nivel}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          Área ID: {cargo.areaId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Nivel {cargo.nivel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCargoId === cargo.id ? (
                        <div className="flex items-center gap-2">
                          <SelectRoles
                            value={tempRolId}
                            onChange={(value) => setTempRolId(value)}
                            placeholder="Seleccionar rol..."
                            className="w-48"
                          />
                          <Button
                            onClick={() => handleSaveRol(cargo.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Guardar
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {cargo.rolId ? (
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">
                                Rol ID: {cargo.rolId}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 italic">
                              Sin rol asignado
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingCargoId === cargo.id ? null : (
                        <button
                          onClick={() => handleEditRol(cargo.id, cargo.rolId)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Editar rol"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {filteredCargos.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCargos.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
                 )}
      </div>

      {/* Información adicional */}
      <div className="flex justify-between items-center text-sm text-gray-600 m-0">
        <div>
          <p>
            Total: {cargos.length} cargos
            {searchTerm && ` · Resultados de búsqueda: ${filteredCargos.length}`}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-green-500 rounded-full"></div>
            <span>Con rol asignado: {cargos.filter(c => c.rolId).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-yellow-500 rounded-full"></div>
            <span>Sin rol: {cargos.filter(c => !c.rolId).length}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 