import React, { useState, useEffect } from 'react'
import { rolesService, modulosService, type Rol, type Modulo } from '../../services'
import { Loader2, AlertCircle, Plus, Edit, Trash2, Search, Shield, Users, Package, Check, X } from 'lucide-react'
import { ModalAddRol, ModalEditRol, ModalConfirm, Pagination, Button } from '../../components/ui'
import { useAuth } from '../../contexts/AuthContext'
import { hasPermission } from '../../lib/utils'

export default function RolesPermisos() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null)
  const [showPermissions, setShowPermissions] = useState<number | null>(null)
  
  // Estados para modales
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  
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
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [rolesData, modulosData] = await Promise.all([
        rolesService.getAll(),
        modulosService.getAll()
      ])
      
      setRoles(rolesData)
      setModulos(modulosData)
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError(err instanceof Error ? err.message : 'Error cargando datos')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar roles por término de búsqueda
  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Cálculos de paginación
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage)
  
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
    setCurrentPage(1)
  }

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <Check className="w-4 h-4 text-green-600" />
    ) : (
      <X className="w-4 h-4 text-gray-300" />
    )
  }

  const getModuloByPermission = (permiso: any) => {
    return modulos.find(m => m.id === permiso.moduloId)
  }

  const handleDelete = async (rol: Rol) => {
    setConfirmData({
      title: 'Eliminar Rol',
      description: `¿Estás seguro de que deseas eliminar el rol "${rol.nombre}"? Esta acción no se puede deshacer y afectará a ${rol._count?.usuarios || 0} usuarios que tienen este rol asignado.`,
      operation: 'delete',
      entityName: rol.nombre,
      isLoading: false
    })
    setConfirmAction(() => async () => {
      try {
        setConfirmData(prev => ({ ...prev, isLoading: true }))
        await rolesService.delete(rol.id)
        await loadData()
        setConfirmModalOpen(false)
        setConfirmAction(null)
      } catch (err) {
        console.error('Error eliminando rol:', err)
        setError(err instanceof Error ? err.message : 'Error eliminando rol')
        setConfirmData(prev => ({ ...prev, isLoading: false }))
      }
    })
    setConfirmModalOpen(true)
  }

  const handleEdit = (rol: Rol) => {
    setSelectedRol(rol)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedRol(null)
  }

  const handleCloseAddModal = () => {
    setAddModalOpen(false)
  }

  const handleSaveRol = () => {
    loadData() // Recargar la lista después de guardar
  }

  const handleAddRol = () => {
    setAddModalOpen(true)
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <Button 
            onClick={loadData} 
            className="ml-4"
            variant="outline"
            size="sm"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Cargando roles y permisos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-lg border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          {filteredRoles.length} de {roles.length} roles
        </div>
        <Button
          onClick={handleAddRol}
          className="bg-yellow-300 hover:bg-yellow-400 flex items-center gap-2 font-medium text-gray-900"
        >
          <Plus className="w-4 h-4" />
          Crear Rol
        </Button>
      </div>

      {/* Grid de roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" style={{ minHeight: 'calc(100vh - 320px)', maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
        {paginatedRoles.map((rol) => (
          <div key={rol.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{rol.nombre}</h3>
                    <p className="text-sm text-gray-600">{rol.descripcion}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(rol)}
                    title="Editar rol"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(rol)}
                    title="Eliminar rol"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Estadísticas del rol */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Usuarios asignados</span>
                  </div>
                  <span className="font-medium">{rol._count?.usuarios || 0}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>Módulos con acceso</span>
                  </div>
                  <span className="font-medium">{rol._count?.permisos || 0}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className={`w-2 h-2 rounded-full ${rol.activo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>Estado</span>
                  </div>
                  <span className={`font-medium ${rol.activo ? 'text-green-600' : 'text-red-600'}`}>
                    {rol.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Botón para ver permisos */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowPermissions(showPermissions === rol.id ? null : rol.id)}
              >
                {showPermissions === rol.id ? 'Ocultar Permisos' : 'Ver Permisos'}
              </Button>

              {/* Tabla de permisos expandible */}
              {showPermissions === rol.id && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Permisos por Módulo</h4>
                  <div className="space-y-2">
                    {!rol.permisos || rol.permisos.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No hay permisos asignados
                      </p>
                    ) : (
                      rol.permisos.map((permiso) => {
                        const modulo = getModuloByPermission(permiso)
                        return (
                          <div key={permiso.id} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h5 className="font-medium text-sm text-gray-900">
                                  {modulo?.nombre || 'Módulo desconocido'}
                                </h5>
                                <p className="text-xs text-gray-500">{modulo?.ruta}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                {getPermissionIcon(permiso.crear)}
                                <span>Crear</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {getPermissionIcon(permiso.leer)}
                                <span>Leer</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {getPermissionIcon(permiso.actualizar)}
                                <span>Actualizar</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {getPermissionIcon(permiso.eliminar)}
                                <span>Eliminar</span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {filteredRoles.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRoles.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}

      {paginatedRoles.length === 0 && roles.length > 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron roles</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta con un término de búsqueda diferente.' : 'Cambia de página o ajusta los filtros.'}
          </p>
        </div>
      )}
      
      {roles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay roles disponibles</h3>
          <p className="text-gray-600">Crea tu primer rol para comenzar.</p>
        </div>
      )}

      {/* Resumen de módulos disponibles */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Módulos del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modulos.map((modulo) => (
            <div key={modulo.id} className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-sm">{modulo.nombre}</h4>
              </div>
              <p className="text-xs text-gray-600 mb-2">{modulo.descripcion}</p>
              <div className="text-xs text-gray-500">
                <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                  {modulo.ruta}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {modulo._count?.permisos || 0} roles con acceso
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de agregar rol */}
      <ModalAddRol
        open={addModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleSaveRol}
      />

      {/* Modal de edición de rol */}
      <ModalEditRol
        open={editModalOpen}
        onClose={handleCloseEditModal}
        rol={selectedRol}
        onSave={handleSaveRol}
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