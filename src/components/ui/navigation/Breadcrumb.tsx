import { useLocation, Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

const routeNames: { [key: string]: string } = {
  "/": "Inicio",
  "/salidas/ingresar": "Ingresar Salida",
  "/salidas/gestionar": "Gestionar Salidas",
  "/marketing/mercaderistas": "Gestionar Mercaderistas",
  "/marketing/reportes-sala": "Reporte por Sala",
  "/rrhh/planilla-comisiones": "Planilla de Comisiones",
  "/rrhh/vacaciones": "Vacaciones",
  "/usuarios": "Usuarios",
  "/usuarios/roles": "Roles y Permisos",
  "/bendita": "Bendita",
  "/bendita/choperas": "Choperas",
  "/bendita/choperas/:itemCode/mantenimientos": "Dashboard de Chopera",
  "/bendita/mantenimientos": "Dashboard de Mantenimientos",
  "/bendita/mantenimientos/nuevo": "Nuevo Mantenimiento",
  "/bendita/mantenimientos/lista": "Lista de Mantenimientos",
}

interface BreadcrumbItem {
  path: string
  label: string
  icon?: React.ReactElement
  isLast?: boolean
}

const getBreadcrumbItems = (pathname: string): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = []
  
  // Siempre agregar Inicio
  items.push({ path: "/", label: "Inicio", icon: <Home className="w-4 h-4" /> })
  
  if (pathname === "/") {
    return items
  }
  
  // Casos especiales para mejor navegación
  if (pathname.startsWith("/bendita/choperas/") && pathname.includes("/mantenimientos")) {
    // Dashboard específico de una chopera
    items.push(
      { path: "/bendita", label: "Bendita", isLast: false },
      { path: "/bendita/choperas", label: "Choperas", isLast: false },
      { path: pathname, label: "Dashboard de Chopera", isLast: true }
    )
    return items
  }
  
  if (pathname === "/bendita/mantenimientos/nuevo") {
    // Formulario de nuevo mantenimiento
    items.push(
      { path: "/bendita", label: "Bendita", isLast: false },
      { path: "/bendita/mantenimientos", label: "Dashboard de Mantenimientos", isLast: false },
      { path: pathname, label: "Nuevo Mantenimiento", isLast: true }
    )
    return items
  }
  
  if (pathname === "/bendita/mantenimientos/lista") {
    // Lista de mantenimientos
    items.push(
      { path: "/bendita", label: "Bendita", isLast: false },
      { path: "/bendita/mantenimientos", label: "Dashboard de Mantenimientos", isLast: false },
      { path: pathname, label: "Lista de Mantenimientos", isLast: true }
    )
    return items
  }
  
  if (pathname === "/bendita/choperas") {
    // Lista de choperas
    items.push(
      { path: "/bendita", label: "Bendita", isLast: false },
      { path: pathname, label: "Choperas", isLast: true }
    )
    return items
  }
  
  if (pathname === "/bendita/mantenimientos") {
    // Dashboard de mantenimientos
    items.push(
      { path: "/bendita", label: "Bendita", isLast: false },
      { path: pathname, label: "Dashboard de Mantenimientos", isLast: true }
    )
    return items
  }
  
  // Dividir la ruta en segmentos para casos normales
  const segments = pathname.split("/").filter(Boolean)
  
  let currentPath = ""
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Buscar el nombre de la ruta
    const routeName = routeNames[currentPath]
    if (routeName) {
      items.push({
        path: currentPath,
        label: routeName,
        isLast: index === segments.length - 1
      })
    }
  })
  
  return items
}

export default function Breadcrumb() {
  const location = useLocation()
  const breadcrumbItems = getBreadcrumbItems(location.pathname)
  
  if (breadcrumbItems.length <= 1) {
    return null
  }
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          )}
          {item.isLast ? (
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {item.icon && <span className="inline-flex items-center mr-1">{item.icon}</span>}
              {item.label}
            </span>
          ) : (
            <Link
              to={item.path}
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center"
            >
              {item.icon && <span className="inline-flex items-center mr-1">{item.icon}</span>}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
} 