import React, { useState, useEffect } from 'react'
import { X, Loader2, AlertCircle, Shield, FileText, Package, Check, Settings, Save, ChevronDown, ChevronRight, Users, BarChart2, Coffee, UserCog } from 'lucide-react'
import { rolesService, modulosService, permisosService, type Rol, type UpdateRolRequest, type Modulo, type PermisoRequest, type CreatePermisoRequest } from '../../../services'
import { Button } from '../base/button'

interface ModalEditRolProps {
  open: boolean
  onClose: () => void
  rol: Rol | null
  onSave: () => void
}

export function ModalEditRol({ open, onClose, rol, onSave }: ModalEditRolProps) {
  const [formData, setFormData] = useState<UpdateRolRequest>({})
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingModulos, setIsLoadingModulos] = useState(false)
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'permissions'>('basic')
  
  // Estado para manejar cambios en permisos
  const [permissions, setPermissions] = useState<Map<number, PermisoRequest>>(new Map())
  const [hasPermissionChanges, setHasPermissionChanges] = useState(false)
  
  // Estado para manejar dropdowns de módulos padre
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  
  // Estado para organizar módulos jerárquicamente
  const [parentModules, setParentModules] = useState<Modulo[]>([])
  const [childModules, setChildModules] = useState<Map<number, Modulo[]>>(new Map())

  // Resetear formulario cuando cambia el rol
  useEffect(() => {
    if (rol) {
      console.log(`🔄 Modal abierto para rol: ${rol.nombre}`)
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        activo: rol.activo
      })
      // initializePermissions() ahora carga tanto módulos como permisos
      initializePermissions()
    }
    setError(null)
    setActiveTab('basic')
    setHasPermissionChanges(false)
  }, [rol])

  // Función para organizar módulos jerárquicamente
  const organizeModulesHierarchically = (allModules: Modulo[]) => {
    const parents: Modulo[] = []
    const children: Map<number, Modulo[]> = new Map()
    
    allModules.forEach(modulo => {
      if (modulo.nivel === 1) {
        // Es un módulo padre
        parents.push(modulo)
        children.set(modulo.id, [])
      } else if (modulo.padreId) {
        // Es un submódulo
        if (!children.has(modulo.padreId)) {
          children.set(modulo.padreId, [])
        }
        children.get(modulo.padreId)!.push(modulo)
      }
    })
    
    // Ordenar padres por orden
    parents.sort((a, b) => a.orden - b.orden)
    
    // Ordenar hijos por orden
    children.forEach((childList) => {
      childList.sort((a, b) => a.orden - b.orden)
    })
    
    setParentModules(parents)
    setChildModules(children)
    
    console.log('📊 Módulos organizados jerárquicamente:', {
      padres: parents.length,
      hijos: Array.from(children.values()).flat().length,
      estructura: parents.map(p => ({
        padre: p.nombre,
        hijos: children.get(p.id)?.length || 0
      }))
    })
  }

  // Función para alternar dropdown de módulo padre
  const toggleModuleDropdown = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })
  }

  // Función para obtener icono del módulo
  const getModuleIcon = (modulo: Modulo) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'users': Users,
      'user-cog': UserCog,
      'trending-up': BarChart2,
      'coffee': Coffee,
      'package': Package,
      'settings': Settings
    }
    
    const IconComponent = iconMap[modulo.icono || ''] || Package
    return <IconComponent className="w-5 h-5" />
  }

  const initializePermissions = async () => {
    if (!rol) return
    
    console.log(`🔄 Inicializando permisos para rol ${rol.nombre} (ID: ${rol.id})`)
    
    try {
      setIsLoadingModulos(true)
      setIsLoadingPermissions(true)
      
      // Cargar todos los módulos disponibles y asignarlos al estado
      console.log('🔄 Llamando a modulosService.getAll()...')
      const todosLosModulos = await modulosService.getAll()
      console.log(`📋 Resultado de modulosService.getAll():`, {
        esArray: Array.isArray(todosLosModulos),
        longitud: todosLosModulos?.length,
        datos: todosLosModulos
      })
      
      if (!Array.isArray(todosLosModulos)) {
        console.error('❌ modulosService.getAll() no devolvió un array:', todosLosModulos)
        throw new Error('Error: El servicio de módulos no devolvió un array válido')
      }
      
      if (todosLosModulos.length === 0) {
        console.warn('⚠️ modulosService.getAll() devolvió un array vacío')
        setError('No se encontraron módulos en el sistema')
      }
      
      setModulos(todosLosModulos) // ¡IMPORTANTE! Asignar los módulos al estado
      console.log(`✅ Módulos asignados al estado:`, todosLosModulos.length, 'módulos')
      
      // Organizar módulos jerárquicamente
      organizeModulesHierarchically(todosLosModulos)
      
      setIsLoadingModulos(false)
      
      // Cargar permisos específicos del rol
      console.log('🔄 Llamando a permisosService.getByRol()...')
      const permisosDelRol = await permisosService.getByRol(rol.id)
      console.log(`🔐 Permisos del rol ${rol.nombre}:`, {
        esArray: Array.isArray(permisosDelRol),
        longitud: permisosDelRol?.length,
        datos: permisosDelRol
      })
      
      const permissionsMap = new Map<number, PermisoRequest>()
      
      // Para cada módulo, verificar si tiene permisos asignados
      console.log('🔄 Procesando permisos para cada módulo...')
      todosLosModulos.forEach((modulo, index) => {
        console.log(`📋 Procesando módulo ${index + 1}/${todosLosModulos.length}:`, {
          id: modulo.id,
          nombre: modulo.nombre
        })
        
        const permisoDelRol = permisosDelRol.find(p => p.moduloId === modulo.id)
        
        if (permisoDelRol) {
          // El rol ya tiene permisos para este módulo
          console.log(`✅ Permisos encontrados para módulo ${modulo.nombre}:`, permisoDelRol)
          permissionsMap.set(modulo.id, {
            moduloId: modulo.id,
            crear: Boolean(permisoDelRol.crear),
            leer: Boolean(permisoDelRol.leer),
            actualizar: Boolean(permisoDelRol.actualizar),
            eliminar: Boolean(permisoDelRol.eliminar)
          })
        } else {
          // El rol no tiene permisos para este módulo (todos en false)
          console.log(`❌ Sin permisos para módulo ${modulo.nombre}`)
          permissionsMap.set(modulo.id, {
            moduloId: modulo.id,
            crear: false,
            leer: false,
            actualizar: false,
            eliminar: false
          })
        }
      })
      
      console.log(`✅ Permisos inicializados para rol ${rol.nombre}:`, {
        totalModulos: todosLosModulos.length,
        permisosConfigurados: Array.from(permissionsMap.entries()).filter(([_, perm]) => 
          perm.crear || perm.leer || perm.actualizar || perm.eliminar
        ).length,
        mapaCompleto: Array.from(permissionsMap.entries())
      })
      setPermissions(permissionsMap)
      setIsLoadingPermissions(false)
    } catch (error) {
      console.error(`❌ Error cargando permisos para rol ${rol.nombre}:`, error)
      setError(`Error al cargar módulos y permisos del sistema: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      // En caso de error, usar permisos vacíos
      setPermissions(new Map())
      setIsLoadingModulos(false)
      setIsLoadingPermissions(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rol) return

    // Validaciones
    if (!formData.nombre?.trim()) {
      setError('El nombre del rol es obligatorio')
      return
    }

    if (!formData.descripcion?.trim()) {
      setError('La descripción del rol es obligatoria')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Preparar datos básicos del rol
      const basicData: UpdateRolRequest = {
        ...formData
      }

      // Actualizar información básica del rol
      await rolesService.update(rol.id, basicData)
      console.log('✅ Información básica del rol actualizada')

      // Actualizar permisos si hay cambios
      if (hasPermissionChanges) {
        console.log('🔄 Actualizando permisos del rol...')
        const permissionsArray = Array.from(permissions.values())
        
        // Convertir a CreatePermisoRequest
        const createPermisosRequest: CreatePermisoRequest[] = permissionsArray.map(p => ({
          rolId: rol.id,
          moduloId: p.moduloId,
          crear: p.crear,
          leer: p.leer,
          actualizar: p.actualizar,
          eliminar: p.eliminar
        }))

        await permisosService.syncRolePermissions(rol.id, createPermisosRequest)
        console.log('✅ Permisos del rol actualizados')
      }
      setHasPermissionChanges(false)
      onSave()
      onClose()
    } catch (err) {
      console.error('Error actualizando rol:', err)
      setError(err instanceof Error ? err.message : 'Error actualizando rol')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof UpdateRolRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }


  const getModuloPermission = (moduloId: number) => {
    return permissions.get(moduloId) || {
      moduloId,
      crear: false,
      leer: false,
      actualizar: false,
      eliminar: false
    }
  }

  const updatePermission = (moduloId: number, field: keyof Omit<PermisoRequest, 'moduloId'>, value: boolean) => {
    const currentPermission = getModuloPermission(moduloId)
    const updatedPermission = {
      ...currentPermission,
      [field]: value
    }
    
    setPermissions(prev => {
      const newMap = new Map(prev)
      newMap.set(moduloId, updatedPermission)
      return newMap
    })
    
    setHasPermissionChanges(true)
  }

  // Removed separate handleSavePermissions function - now handled in main submit

  const toggleAllPermissions = (moduloId: number, enable: boolean) => {
    const updatedPermission: PermisoRequest = {
      moduloId,
      crear: enable,
      leer: enable,
      actualizar: enable,
      eliminar: enable
    }
    
    setPermissions(prev => {
      const newMap = new Map(prev)
      newMap.set(moduloId, updatedPermission)
      return newMap
    })
    
    setHasPermissionChanges(true)
  }

  // Función para dar todos los permisos a un módulo padre y sus submódulos
  const toggleAllParentPermissions = (parentId: number, enable: boolean) => {
    setPermissions(prev => {
      const newMap = new Map(prev)
      
      // Aplicar al módulo padre
      newMap.set(parentId, {
        moduloId: parentId,
        crear: enable,
        leer: enable,
        actualizar: enable,
        eliminar: enable
      })
      
      // Aplicar a todos los submódulos
      const children = childModules.get(parentId) || []
      children.forEach(child => {
        newMap.set(child.id, {
          moduloId: child.id,
          crear: enable,
          leer: enable,
          actualizar: enable,
          eliminar: enable
        })
      })
      
      return newMap
    })
    
    setHasPermissionChanges(true)
  }

  // Función para verificar si un módulo padre tiene todos sus permisos y submódulos configurados
  const getParentPermissionStatus = (parentId: number) => {
    const parentPermission = getModuloPermission(parentId)
    const children = childModules.get(parentId) || []
    
    const parentHasAll = parentPermission.crear && parentPermission.leer && parentPermission.actualizar && parentPermission.eliminar
    const childrenHaveAll = children.every(child => {
      const childPermission = getModuloPermission(child.id)
      return childPermission.crear && childPermission.leer && childPermission.actualizar && childPermission.eliminar
    })
    
    return {
      parentHasAll,
      childrenHaveAll,
      allConfigured: parentHasAll && childrenHaveAll,
      totalChildren: children.length,
      configuredChildren: children.filter(child => {
        const childPermission = getModuloPermission(child.id)
        return childPermission.crear || childPermission.leer || childPermission.actualizar || childPermission.eliminar
      }).length
    }
  }

  if (!open || !rol) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Editar Rol
              </h2>
              <p className="text-sm text-gray-600">
                {rol.nombre}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Información Básica
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'permissions'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Permisos ({Array.from(permissions.keys()).length} módulos)
              {hasPermissionChanges && <span className="ml-2 w-2 h-2 bg-yellow-500 rounded-full inline-block"></span>}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Tab Content */}
          {activeTab === 'basic' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Nombre del rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Descripción *
                </label>
                <textarea
                  value={formData.descripcion || ''}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              {/* Estado */}
              <div className="flex items-center gap-3">
                <label className="block text-sm font-medium text-gray-700">
                  Estado del Rol
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo ?? true}
                    onChange={(e) => handleChange('activo', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Activo</span>
                </label>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Usuarios con este rol</div>
                  <div className="text-2xl font-semibold text-gray-900">{(rol as any)._count?.usuarios || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Módulos con permisos</div>
                  <div className="text-2xl font-semibold text-gray-900">{Array.from(permissions.keys()).length}</div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'permissions' && (
            <div className="p-6">
              {isLoadingModulos || isLoadingPermissions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>
                    {isLoadingModulos ? 'Cargando módulos...' : 'Cargando permisos...'}
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Permisos por Módulo</h3>
                    <div className="text-sm text-gray-600">
                      {Array.from(permissions.keys()).length} de {modulos.length} módulos configurados
                    </div>
                  </div>

                  {/* Debug info - solo en desarrollo */}
                  {process.env.NODE_ENV === 'development' && (() => {
                    console.log('🔍 Renderizando módulos en modal:', { 
                      totalModulos: modulos.length, 
                      permisosMapa: Array.from(permissions.entries()),
                      modulos: modulos.map(m => ({ id: m.id, nombre: m.nombre }))
                    })
                    return null
                  })()}

                  {modulos.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay módulos disponibles</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {parentModules.map((parentModule) => {
                        const parentPermission = getModuloPermission(parentModule.id)
                        const parentHasAnyPermission = parentPermission.crear || parentPermission.leer || parentPermission.actualizar || parentPermission.eliminar
                        const parentTotalPermissions = [parentPermission.crear, parentPermission.leer, parentPermission.actualizar, parentPermission.eliminar].filter(Boolean).length
                        const isExpanded = expandedModules.has(parentModule.id)
                        const children = childModules.get(parentModule.id) || []
                        const parentStatus = getParentPermissionStatus(parentModule.id)
                        
                        return (
                          <div key={parentModule.id} className="border rounded-lg bg-white hover:shadow-md transition-all duration-200">
                            {/* Header del módulo padre */}
                            <div className="p-5">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3 flex-1">
                                  <button
                                    onClick={() => toggleModuleDropdown(parentModule.id)}
                                    className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                  >
                                    {isExpanded ? <ChevronDown className="w-5 h-5 text-blue-600" /> : <ChevronRight className="w-5 h-5 text-blue-600" />}
                                  </button>
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    {getModuleIcon(parentModule)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-gray-900">{parentModule.nombre}</h4>
                                      {parentStatus.allConfigured && (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                          {parentStatus.totalChildren + 1} módulos configurados
                                        </span>
                                      )}
                                      {parentHasAnyPermission && !parentStatus.allConfigured && (
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                          {parentTotalPermissions}/4 permisos padre
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{parentModule.descripcion}</p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {parentModule.ruta}
                                      </span>
                                      {parentModule.activo ? (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                          Activo
                                        </span>
                                      ) : (
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                          Inactivo
                                        </span>
                                      )}
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        {children.length} submódulos
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleAllParentPermissions(parentModule.id, !parentStatus.allConfigured)}
                                    className={`text-xs font-medium ${
                                      parentStatus.allConfigured 
                                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                    }`}
                                  >
                                    {parentStatus.allConfigured ? 'Quitar todos' : 'Dar todos'}
                                  </Button>
                                </div>
                              </div>

                              {/* Permisos del módulo padre */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 hover:bg-green-50 hover:border-green-200 transition-all duration-200 group">
                                  <input
                                    type="checkbox"
                                    checked={parentPermission.crear}
                                    onChange={(e) => updatePermission(parentModule.id, 'crear', e.target.checked)}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                  />
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Crear</span>
                                    <Check className={`w-4 h-4 ${parentPermission.crear ? 'text-green-600' : 'text-gray-300'}`} />
                                  </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group">
                                  <input
                                    type="checkbox"
                                    checked={parentPermission.leer}
                                    onChange={(e) => updatePermission(parentModule.id, 'leer', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Leer</span>
                                    <Check className={`w-4 h-4 ${parentPermission.leer ? 'text-blue-600' : 'text-gray-300'}`} />
                                  </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 hover:bg-yellow-50 hover:border-yellow-200 transition-all duration-200 group">
                                  <input
                                    type="checkbox"
                                    checked={parentPermission.actualizar}
                                    onChange={(e) => updatePermission(parentModule.id, 'actualizar', e.target.checked)}
                                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                  />
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-yellow-700">Actualizar</span>
                                    <Check className={`w-4 h-4 ${parentPermission.actualizar ? 'text-yellow-600' : 'text-gray-300'}`} />
                                  </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 hover:bg-red-50 hover:border-red-200 transition-all duration-200 group">
                                  <input
                                    type="checkbox"
                                    checked={parentPermission.eliminar}
                                    onChange={(e) => updatePermission(parentModule.id, 'eliminar', e.target.checked)}
                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                  />
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-red-700">Eliminar</span>
                                    <Check className={`w-4 h-4 ${parentPermission.eliminar ? 'text-red-600' : 'text-gray-300'}`} />
                                  </div>
                                </label>
                              </div>

                              {/* Resumen del estado del módulo padre */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Estado actual:</span>
                                  {parentStatus.allConfigured ? (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        Padre + {parentStatus.totalChildren} submódulos configurados
                                      </span>
                                      <span className="text-xs text-green-600">({parentStatus.totalChildren + 1} módulos)</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                      {parentStatus.configuredChildren}/{parentStatus.totalChildren} submódulos configurados
                                    </span>
                                  )}
                                </div>
                                {parentStatus.allConfigured && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-green-600 font-medium">Completamente configurado</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Submódulos (solo si está expandido) */}
                            {isExpanded && children.length > 0 && (
                              <div className="border-t bg-gray-50 p-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                  <ChevronDown className="w-4 h-4" />
                                  Submódulos ({children.length})
                                </h5>
                                <div className="space-y-3">
                                  {children.map((childModule) => {
                                    const childPermission = getModuloPermission(childModule.id)
                                    const childHasAnyPermission = childPermission.crear || childPermission.leer || childPermission.actualizar || childPermission.eliminar
                                    const childTotalPermissions = [childPermission.crear, childPermission.leer, childPermission.actualizar, childPermission.eliminar].filter(Boolean).length
                                    
                                    return (
                                      <div key={childModule.id} className="bg-white border rounded-lg p-4 ml-4">
                                        {/* Header del submódulo */}
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-3 flex-1">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                              {getModuleIcon(childModule)}
                                            </div>
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <h6 className="font-medium text-blue-900">{childModule.nombre}</h6>
                                                {childHasAnyPermission && (
                                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                    {childTotalPermissions}/4 permisos
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-sm text-blue-700 mb-1">{childModule.descripcion}</p>
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                  {childModule.ruta}
                                                </span>
                                                {childModule.activo ? (
                                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                    Activo
                                                  </span>
                                                ) : (
                                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                    Inactivo
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => toggleAllPermissions(childModule.id, !childHasAnyPermission)}
                                              className={`text-xs font-medium ${
                                                childHasAnyPermission 
                                                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                              }`}
                                            >
                                              {childHasAnyPermission ? 'Quitar todos' : 'Dar todos'}
                                            </Button>
                                          </div>
                                        </div>

                                        {/* Permisos del submódulo */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border-2 hover:bg-green-50 hover:border-green-200 transition-all duration-200 group">
                                            <input
                                              type="checkbox"
                                              checked={childPermission.crear}
                                              onChange={(e) => updatePermission(childModule.id, 'crear', e.target.checked)}
                                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                            />
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Crear</span>
                                              <Check className={`w-4 h-4 ${childPermission.crear ? 'text-green-600' : 'text-gray-300'}`} />
                                            </div>
                                          </label>

                                          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group">
                                            <input
                                              type="checkbox"
                                              checked={childPermission.leer}
                                              onChange={(e) => updatePermission(childModule.id, 'leer', e.target.checked)}
                                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Leer</span>
                                              <Check className={`w-4 h-4 ${childPermission.leer ? 'text-blue-600' : 'text-gray-300'}`} />
                                            </div>
                                          </label>

                                          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border-2 hover:bg-yellow-50 hover:border-yellow-200 transition-all duration-200 group">
                                            <input
                                              type="checkbox"
                                              checked={childPermission.actualizar}
                                              onChange={(e) => updatePermission(childModule.id, 'actualizar', e.target.checked)}
                                              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                            />
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-gray-700 group-hover:text-yellow-700">Actualizar</span>
                                              <Check className={`w-4 h-4 ${childPermission.actualizar ? 'text-yellow-600' : 'text-gray-300'}`} />
                                            </div>
                                          </label>

                                          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border-2 hover:bg-red-50 hover:border-red-200 transition-all duration-200 group">
                                            <input
                                              type="checkbox"
                                              checked={childPermission.eliminar}
                                              onChange={(e) => updatePermission(childModule.id, 'eliminar', e.target.checked)}
                                              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                            />
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium text-gray-700 group-hover:text-red-700">Eliminar</span>
                                              <Check className={`w-4 h-4 ${childPermission.eliminar ? 'text-red-600' : 'text-gray-300'}`} />
                                            </div>
                                          </label>
                                        </div>

                                        {/* Resumen del estado del submódulo */}
                                        <div className="mt-3 flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Estado actual:</span>
                                            {childHasAnyPermission ? (
                                              <div className="flex items-center gap-1">
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                  {[childPermission.crear && 'C', childPermission.leer && 'L', childPermission.actualizar && 'A', childPermission.eliminar && 'E'].filter(Boolean).join(' + ')} configurado
                                                </span>
                                                <span className="text-xs text-green-600">({childTotalPermissions}/4)</span>
                                              </div>
                                            ) : (
                                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                Sin permisos asignados
                                              </span>
                                            )}
                                          </div>
                                          {childHasAnyPermission && (
                                            <div className="flex items-center gap-1">
                                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                              <span className="text-xs text-green-600 font-medium">Configurado</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Resumen de cambios */}
                  {hasPermissionChanges && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                      <h4 className="font-medium text-yellow-900 mb-2">📝 Cambios Pendientes</h4>
                      <p className="text-sm text-yellow-800">
                        Has realizado cambios en los permisos. Ve a la pestaña "Información Básica" y haz clic en "Guardar Cambios" para aplicar todos los cambios.
                      </p>
                    </div>
                  )}

                  {/* Resumen general de permisos */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-blue-900">📊 Resumen de Permisos</h4>
                      <div className="text-sm text-blue-700">
                        {Array.from(permissions.values()).filter(p => p.crear || p.leer || p.actualizar || p.eliminar).length} de {modulos.length} módulos configurados
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-blue-800">
                          Crear: {Array.from(permissions.values()).filter(p => p.crear).length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-800">
                          Leer: {Array.from(permissions.values()).filter(p => p.leer).length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-blue-800">
                          Actualizar: {Array.from(permissions.values()).filter(p => p.actualizar).length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-blue-800">
                          Eliminar: {Array.from(permissions.values()).filter(p => p.eliminar).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Consejos de Uso</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>Crear:</strong> Permite agregar nuevos elementos al sistema</li>
                      <li>• <strong>Leer:</strong> Permite visualizar y consultar información</li>
                      <li>• <strong>Actualizar:</strong> Permite modificar elementos existentes</li>
                      <li>• <strong>Eliminar:</strong> Permite borrar elementos del sistema</li>
                    </ul>
                    <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                      <p className="text-xs text-blue-700">
                        💡 <strong>Tip:</strong> Usa los botones "Dar todos" / "Quitar todos" para cambios masivos en un módulo específico
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          {activeTab === 'basic' && (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`${hasPermissionChanges ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {hasPermissionChanges ? 'Guardar Todo (Info + Permisos)' : 'Guardar Cambios'}
                </>
              )}
            </Button>
          )}
          {activeTab === 'permissions' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  await initializePermissions()
                  setHasPermissionChanges(false)
                }}
                disabled={isLoading}
              >
                Deshacer Cambios de Permisos
              </Button>
              {hasPermissionChanges && (
                <Button
                  onClick={() => setActiveTab('basic')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Ir a Guardar Todo
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 