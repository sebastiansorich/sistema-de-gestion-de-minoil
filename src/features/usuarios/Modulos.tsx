import React, { useState, useEffect } from 'react'
import { modulosService, type Modulo } from '../../services'
import { Loader2, AlertCircle, Plus, Edit, Trash2, Search, Folder, FileText, Package, Users, TrendingUp, Calendar, Settings, Shield } from 'lucide-react'
import { ModalConfirm, Pagination } from '../../components/ui'
import { ModalAddModulo, ModalEditModulo } from '../../components/ui/modals'

// Mapeo de iconos para mostrar en la interfaz
const iconMap: { [key: string]: React.ComponentType<any> } = {
  'package': Package,
  'trending-up': TrendingUp,
  'users': Users,
  'calendar': Calendar,
  'settings': Settings,
  'shield': Shield,
  'file-text': FileText,
  'folder': Folder,
  'plus': Plus,
  'list': FileText,
  'bar-chart-2': TrendingUp,
  'user': Users
}

export default function Modulos() {
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedModulo, setSelectedModulo] = useState<Modulo | null>(null)
  
  // Estados para modal de confirmación
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
  const [confirmData, setConfirmData] = useState({
    title: '',
    description: '',
    operation: 'generic' as 'delete' | 'edit' | 'create' | 'generic',
    entityName: '',
    isLoading: false
  })
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Cargar módulos al montar el componente
  useEffect(() => {
    loadModulos()
  }, [])

  const loadModulos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await modulosService.getAll()
      console.log('🔍 Datos de módulos cargados:', data)
      
      setModulos(data)
    } catch (err) {
      console.error('Error cargando módulos:', err)
      setError(err instanceof Error ? err.message : 'Error cargando módulos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (modulo: Modulo) => {
    setConfirmData({
      title: 'Eliminar Módulo',
      description: `¿Estás seguro de que deseas eliminar el módulo "${modulo.nombre}"? Esta acción no se puede deshacer.`,
      operation: 'delete',
      entityName: modulo.nombre,
      isLoading: false
    })
    setConfirmAction(() => async () => {
      try {
        setConfirmData(prev => ({ ...prev, isLoading: true }))
        await modulosService.delete(modulo.id)
        await loadModulos()
        setConfirmModalOpen(false)
        setConfirmAction(null)
      } catch (err) {
        console.error('Error eliminando módulo:', err)
        setError(err instanceof Error ? err.message : 'Error eliminando módulo')
        setConfirmData(prev => ({ ...prev, isLoading: false }))
      }
    })
    setConfirmModalOpen(true)
  }

  const handleEdit = (modulo: Modulo) => {
    setSelectedModulo(modulo)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedModulo(null)
  }

  const handleCloseAddModal = () => {
    setAddModalOpen(false)
  }

  const handleSaveModulo = () => {
    loadModulos() // Recargar la lista después de guardar
  }

  const handleAddModulo = () => {
    setAddModalOpen(true)
  }

  // Filtrar módulos por término de búsqueda
  const filteredModulos = modulos.filter(modulo =>
    modulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modulo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modulo.ruta.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Cálculos de paginación
  const totalPages = Math.ceil(filteredModulos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedModulos = filteredModulos.slice(startIndex, startIndex + itemsPerPage)
  
  // Resetear página al cambiar búsqueda
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])
  
  // Manejadores de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Resetear a primera página
  }

  // Función para obtener el icono correspondiente
  const getIcon = (iconName: string | null) => {
    if (!iconName) return Folder
    return iconMap[iconName] || Folder
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg">Cargando módulos...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <button
            onClick={loadModulos}
            className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar módulos por nombre, descripción o ruta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          {filteredModulos.length} de {modulos.length} módulos
        </div>
        <button
          className="bg-yellow-300 hover:bg-yellow-400 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-gray-900"
          onClick={handleAddModulo}
        >
          <Plus className="w-4 h-4" />
          Nuevo Módulo
        </button>
      </div>

      {/* Tabla de módulos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Módulo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submódulos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedModulos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron módulos que coincidan con la búsqueda' : 'No hay módulos registrados'}
                  </td>
                </tr>
              ) : (
                paginatedModulos.map((modulo) => {
                  const IconComponent = getIcon(modulo.icono)
                  return (
                    <tr key={modulo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {modulo.nombre}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {modulo.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {modulo.descripcion}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {modulo.ruta}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Nivel {modulo.nivel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {modulo.orden}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          modulo.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {modulo.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {modulo.submodulos?.length || 0} submódulos
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(modulo)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Editar módulo"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(modulo)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Eliminar módulo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {filteredModulos.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredModulos.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {/* Modal de agregar módulo */}
      <ModalAddModulo
        open={addModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleSaveModulo}
      />

      {/* Modal de edición de módulo */}
      <ModalEditModulo
        open={editModalOpen}
        onClose={handleCloseEditModal}
        modulo={selectedModulo}
        onSave={handleSaveModulo}
      />

      {/* Modal de confirmación */}
      <ModalConfirm
        open={confirmModalOpen}
        onClose={() => {
          if (!confirmData.isLoading) {
            setConfirmModalOpen(false)
            setConfirmAction(null)
          }
        }}
        onConfirm={() => confirmAction && confirmAction()}
        title={confirmData.title}
        description={confirmData.description}
        operation={confirmData.operation}
        entityName={confirmData.entityName}
        isLoading={confirmData.isLoading}
      />
    </div>
  )
}
