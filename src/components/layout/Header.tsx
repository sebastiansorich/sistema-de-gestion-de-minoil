import { useState, useRef, useEffect } from "react"
import { UserIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { useAuth } from "../../contexts/AuthContext"
import { useLocation } from "react-router-dom"
import Breadcrumb from "../ui/navigation/Breadcrumb"
import { ModalChangePassword } from "../ui/modals"

// Mapeo de rutas a títulos dinámicos
const getPageTitle = (pathname: string): string => {
  const routeTitles: Record<string, string> = {
    '/': 'MINOIL BPMS',
    '/usuarios': 'Gestión de Usuarios',
    '/usuarios/roles': 'Roles y Permisos',
    // Removed route for deleted Cargos component
    '/salidas/ingresar': 'Ingresar Salida',
    '/salidas/gestionar': 'Gestionar Salidas',
    '/marketing/mercaderistas': 'Mercaderistas',
    '/marketing/reportes-sala': 'Reportes por Sala',
    '/rrhh/planilla-comisiones': 'Planilla de Comisiones',
    '/rrhh/vacaciones': 'Gestión de Vacaciones',
    '/Bendita/choperas': 'Gestión de Choperas',
    '/Bendita/mantenimiento': 'Gestión de Mantenimiento',
  }
  
  return routeTitles[pathname] || 'MINOIL S.A'
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [empleadoInfo, setEmpleadoInfo] = useState<{sede: string, area: string, cargo: string} | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { logout, user } = useAuth()
  const location = useLocation()
  
  // Si no hay usuario, no renderizar el header
  if (!user) {
    return null
  }

  // Cierra el menú si haces click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  // Función para obtener información del empleado desde SAP
  const getEmpleadoInfo = async () => {
    const empID = user?.empID
    const nombreCompleto = user?.nombreCompletoSap || `${user?.nombre} ${user?.apellido}`
    
    console.log('🔍 Header - getEmpleadoInfo llamada')
    console.log('🔍 Header - empID:', empID)
    console.log('🔍 Header - nombreCompleto:', nombreCompleto)
    
    if (!empID && !nombreCompleto) {
      console.log('🔍 Header - No hay empID ni nombreCompleto del usuario:', user)
      return
    }
    
    try {
      console.log('🔍 Header - Obteniendo información del empleado')
      const response = await fetch('/api/sap/empleados-sap')
      const data = await response.json()
      
      console.log('🔍 Header - Respuesta completa de SAP:', data)
      
      if (data.success && data.data.empleados) {
        console.log('🔍 Header - Total empleados encontrados:', data.data.empleados.length)
        
        // Buscar por empID primero, luego por nombre completo
        let empleado = null
        if (empID) {
          empleado = data.data.empleados.find((emp: any) => emp.empID === empID)
          console.log('🔍 Header - Búsqueda por empID:', empID, 'Resultado:', empleado)
        }
        
        if (!empleado && nombreCompleto) {
          empleado = data.data.empleados.find((emp: any) => 
            emp.nombreCompletoSap?.toLowerCase() === nombreCompleto.toLowerCase()
          )
          console.log('🔍 Header - Búsqueda por nombreCompleto:', nombreCompleto, 'Resultado:', empleado)
        }
        
        if (empleado) {
          const info = {
            sede: empleado.sede || 'Sin sede',
            area: empleado.area || 'Sin área',
            cargo: empleado.cargo || 'Sin cargo'
          }
          console.log('🔍 Header - Información del empleado:', info)
          setEmpleadoInfo(info)
        } else {
          console.log('🔍 Header - No se encontró empleado con empID:', empID, 'o nombre:', nombreCompleto)
        }
      } else {
        console.log('🔍 Header - Error en respuesta de SAP:', data)
      }
    } catch (error) {
      console.error('Error obteniendo información del empleado:', error)
    }
  }

  // Cargar información del empleado cuando se monta el componente
  useEffect(() => {
    console.log('🔍 Header - useEffect ejecutado')
    console.log('🔍 Header - user?.empID:', user?.empID)
    console.log('🔍 Header - user?.nombreCompletoSap:', user?.nombreCompletoSap)
    
    if (user?.empID || user?.nombreCompletoSap || (user?.nombre && user?.apellido)) {
      console.log('🔍 Header - Llamando getEmpleadoInfo')
      getEmpleadoInfo()
    } else {
      console.log('🔍 Header - No hay datos suficientes para buscar empleado')
    }
  }, [user?.empID, user?.nombreCompletoSap, user?.nombre, user?.apellido])

  const handleLogout = () => {
    setOpen(false)
    logout()
  }

  const handleChangePassword = () => {
    setOpen(false)
    setShowChangePasswordModal(true)
  }

  const handleChangePasswordSuccess = () => {
    // Aquí puedes agregar lógica adicional como:
    // - Mostrar una notificación de éxito
    // - Forzar un re-login por seguridad
    // - Actualizar el estado de la aplicación
    console.log('¡Contraseña cambiada exitosamente!')
  }

  // Formatear nombre completo
  const fullName = user ? `${user.nombre} ${user.apellido}` : ''
  
  // Formatear información adicional (estructura actualizada)
  const cargoInfo = empleadoInfo?.cargo || user?.cargo?.nombre || ''
  const cargoNivel = user?.cargo?.nivel || ''
  const areaInfo = empleadoInfo?.area || user?.area?.nombre || ''
  const sedeInfo = empleadoInfo?.sede || user?.sede?.nombre || ''
  const empleadoSapId = user?.empID || user?.empleadoSapId || ''
  
  // Debug logs
  console.log('🔍 Header - Usuario completo:', user)
  console.log('🔍 Header - user?.empID:', user?.empID)
  console.log('🔍 Header - user?.empleadoSapId:', user?.empleadoSapId)
  console.log('🔍 Header - empleadoInfo:', empleadoInfo)
  console.log('🔍 Header - cargoInfo:', cargoInfo)
  console.log('🔍 Header - areaInfo:', areaInfo)
  console.log('🔍 Header - sedeInfo:', sedeInfo)
  console.log('🔍 Header - empleadoSapId:', empleadoSapId)

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-neutral-900 shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-center md:justify-start">
          <h1 className="text-xl font-bold text-center w-full md:w-auto">
            {getPageTitle(location.pathname)}
          </h1>
        </div>
        <div className="relative flex-shrink-0 flex items-center gap-3" ref={menuRef}>
          {/* Información del usuario */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {fullName}
            </span>
            <div className="flex items-center gap-2 text-xs">
              {/* Badge del SAP ID */}
              {empleadoSapId && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  SAP: {empleadoSapId}
                </span>
              )}
              {/* Separador */}
              {cargoInfo && (
                <>
                  <span className="text-gray-400">•</span>
                  {/* Badge del cargo con nivel */}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {cargoInfo}
                    {cargoNivel && (
                      <span className="ml-1 text-xs opacity-75">
                        (Nivel {cargoNivel})
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Botón del menú de usuario */}
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center focus:outline-none border border-neutral-300 dark:border-neutral-700 bg-transparent hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú de usuario"
          >
            <UserIcon className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />
          </button>
          
          {open && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-neutral-800 rounded-lg shadow-lg py-2 z-50 border border-neutral-200 dark:border-neutral-700">
              {/* Información completa del usuario en el menú desplegable */}
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                    {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{user?.username}
                    </p>
                  </div>
                </div>
                
                {/* Información organizacional */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <BuildingOfficeIcon className="w-3 h-3" />
                    <span>{sedeInfo} • {areaInfo}</span>
                  </div>
                  
                  {/* Información del cargo */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Cargo
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {cargoInfo}
                      </p>
                      
                      {cargoNivel && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Nivel {cargoNivel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {user?.autenticacion && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Auth: {user.autenticacion.toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Email y empleado SAP */}
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                  {empleadoSapId && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        SAP: {empleadoSapId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Opciones del menú */}
              <div className="py-1">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition text-sm"
                  onClick={() => {
                    setOpen(false)
                    // Aquí lógica para ver perfil
                    alert("Ver perfil")
                  }}
                >
                  Ver perfil
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition text-sm"
                  onClick={handleChangePassword}
                >
                  Cambiar contraseña
                </button>
                <div className="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition text-sm text-red-600 dark:text-red-400"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-start">
        <Breadcrumb />
      </div>
      
      {/* Modal para cambiar contraseña */}
      <ModalChangePassword
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={handleChangePasswordSuccess}
      />
    </header>
  )
}
