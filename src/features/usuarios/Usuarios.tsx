import React, { useState, useEffect } from 'react'
import { usuariosService, type Usuario } from '../../services'
import { Loader2, AlertCircle, Plus, Edit, Trash2, Search, Building, MapPin, Briefcase, Shield } from 'lucide-react'
import { ModalEditUser, ModalAddUser, ModalConfirm, Pagination } from '../../components/ui'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [empleadosInfo, setEmpleadosInfo] = useState<{[key: number]: {sede: string, area: string, cargo: string}}>({})
  
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

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsuarios()
  }, [])

  // Función para obtener información de empleados desde SAP
  const getEmpleadosInfo = async () => {
    try {
      const response = await fetch('/api/sap/empleados-sap')
      const data = await response.json()
      
      if (data.success && data.data.empleados) {
        const empleadosMap: {[key: number]: {sede: string, area: string, cargo: string}} = {}
        
        data.data.empleados.forEach((empleado: any) => {
          empleadosMap[empleado.empID] = {
            sede: empleado.sede || 'Sin sede',
            area: empleado.area || 'Sin área',
            cargo: empleado.cargo || 'Sin cargo'
          }
        })
        
        setEmpleadosInfo(empleadosMap)
      }
    } catch (error) {
      console.error('Error obteniendo información de empleados:', error)
    }
  }

  // Cargar información de empleados cuando se cargan los usuarios
  useEffect(() => {
    if (usuarios.length > 0) {
      getEmpleadosInfo()
    }
  }, [usuarios])

  const loadUsuarios = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await usuariosService.getAll()
      console.log('🔍 Datos de usuarios cargados:', data)
      
      // Debug: verificar datos de ubicación
      if (data.length > 0) {
        console.log('📍 Ejemplo de datos de usuario:', {
          nombre: data[0].nombre,
          sede: data[0].sede,
          area: data[0].area,
          cargo: data[0].cargo
        })
      }
      
      setUsuarios(data)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
      setError(err instanceof Error ? err.message : 'Error cargando usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (usuario: Usuario) => {
    setConfirmData({
      title: 'Eliminar Usuario',
      description: `¿Estás seguro de que deseas eliminar al usuario "${usuario.nombre} ${usuario.apellido}"? Esta acción no se puede deshacer.`,
      operation: 'delete',
      entityName: `@${usuario.username}`,
      isLoading: false
    })
    setConfirmAction(() => async () => {
      try {
        setConfirmData(prev => ({ ...prev, isLoading: true }))
        await usuariosService.delete(usuario.id)
        await loadUsuarios()
        setConfirmModalOpen(false)
        setConfirmAction(null)
      } catch (err) {
        console.error('Error eliminando usuario:', err)
        setError(err instanceof Error ? err.message : 'Error eliminando usuario')
        setConfirmData(prev => ({ ...prev, isLoading: false }))
      }
    })
    setConfirmModalOpen(true)
  }

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedUsuario(null)
  }

  const handleCloseAddModal = () => {
    setAddModalOpen(false)
  }

  const handleSaveUser = () => {
    loadUsuarios() // Recargar la lista después de guardar
  }

  const handleAddUser = () => {
    setAddModalOpen(true)
  }

  // Filtrar usuarios por término de búsqueda
  const filteredUsuarios = usuarios.filter(usuario =>
    `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usuario.sede?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usuario.area?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usuario.cargo?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usuario.rol?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Cálculos de paginación
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsuarios = filteredUsuarios.slice(startIndex, startIndex + itemsPerPage)
  
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg">Cargando usuarios...</span>
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
            onClick={loadUsuarios}
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
              placeholder="Buscar usuarios por nombre, usuario, email, sede, área, cargo o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div className="text-sm text-gray-600">
          {filteredUsuarios.length} de {usuarios.length} usuarios
        </div>
        <button
          className="bg-yellow-300 hover:bg-yellow-400 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-gray-900"
          onClick={handleAddUser}
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autenticación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
                  </td>
                </tr>
              ) : (
                paginatedUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{usuario.username}
                        </div>
                        {usuario.empleadoSapId && (
                          <div className="text-xs text-gray-400">
                            SAP ID: {usuario.empleadoSapId}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1 mb-1">
                          <Building className="w-3 h-3 text-gray-400" />
                          <span className="font-medium">
                            {usuario.empID && empleadosInfo[usuario.empID] 
                              ? empleadosInfo[usuario.empID].sede 
                              : (usuario.sede?.nombre || 'Sin sede')
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">
                            {usuario.empID && empleadosInfo[usuario.empID] 
                              ? empleadosInfo[usuario.empID].area 
                              : (usuario.area?.nombre || 'Sin área')
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">
                            {usuario.empID && empleadosInfo[usuario.empID] 
                              ? empleadosInfo[usuario.empID].cargo 
                              : (usuario.cargo?.nombre || 'Sin cargo')
                            }
                          </span>
                          {usuario.cargo?.nivel && (
                            <span className="text-xs text-gray-400 ml-1">(Nivel {usuario.cargo.nivel})</span>
                          )}
                        </div>
                        {usuario.cargo?.rol && (
                          <div className="flex items-center gap-1 mt-1">
                            <Shield className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-blue-600 font-medium">{usuario.cargo.rol.nombre}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {usuario.rol ? (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{usuario.rol.nombre}</div>
                            <div className="text-xs text-gray-500">{usuario.rol.descripcion}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sin rol asignado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        usuario.autenticacion === 'ldap' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {usuario.autenticacion.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        usuario.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.ultimoAcceso 
                        ? new Date(usuario.ultimoAcceso).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Nunca'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {filteredUsuarios.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsuarios.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      

      {/* Modal de agregar usuario */}
      <ModalAddUser
        open={addModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleSaveUser}
      />

      {/* Modal de edición de usuario */}
      <ModalEditUser
        open={editModalOpen}
        onClose={handleCloseEditModal}
        usuario={selectedUsuario}
        onSave={handleSaveUser}
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