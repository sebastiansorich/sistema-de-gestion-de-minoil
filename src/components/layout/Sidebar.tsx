import { Menu, ChevronDown, ChevronUp, Users, Settings, Home, Briefcase, Package, ClipboardList, UserCog, UserCheck, FileText, CalendarCheck, BarChart2, UserPlus, Loader2, AlertCircle, DollarSign, TruckIcon, Building, Shield, Cog, Database, Calendar, BarChart3, FileSpreadsheet, Clock, MapPin, Activity, Archive, Bell, BookOpen, Camera, Coffee, Download, Edit, Eye, Filter, Folder, Globe, Heart, Image, Key, Lock, Mail, MessageSquare, Monitor, Phone, Plus, Printer, Save, Search, Send, Share, Star, Tag, Trash, Upload, User, Video, Wifi, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from '../../contexts/AuthContext'
import { modulosService, type Modulo } from '../../services'

// Tipos para menú
interface SubMenuItem {
	label: string;
	to: string;
	permission?: string;
}
interface MenuItem {
	id: number;
	label: string;
	icon: React.ReactNode;
	to?: string;
	permission?: string | null;
	submenu?: SubMenuItem[];
}

// Mapeo de iconos por tipo de módulo
// Mapa de íconos disponibles de Lucide
const iconMap: Record<string, React.ReactNode> = {
  // Íconos principales
  'Home': <Home className="w-5 h-5" />,
  'Users': <Users className="w-5 h-5" />,
  'Settings': <Settings className="w-5 h-5" />,
  'Briefcase': <Briefcase className="w-5 h-5" />,
  'Package': <Package className="w-5 h-5" />,
  'ClipboardList': <ClipboardList className="w-5 h-5" />,
  'UserCog': <UserCog className="w-5 h-5" />,
  'UserCheck': <UserCheck className="w-5 h-5" />,
  'FileText': <FileText className="w-5 h-5" />,
  'CalendarCheck': <CalendarCheck className="w-5 h-5" />,
  'BarChart2': <BarChart2 className="w-5 h-5" />,
  'BarChart3': <BarChart3 className="w-5 h-5" />,
  'UserPlus': <UserPlus className="w-5 h-5" />,
  'DollarSign': <DollarSign className="w-5 h-5" />,
  'TruckIcon': <TruckIcon className="w-5 h-5" />,
  'Building': <Building className="w-5 h-5" />,
  'Shield': <Shield className="w-5 h-5" />,
  'Cog': <Cog className="w-5 h-5" />,
  'Database': <Database className="w-5 h-5" />,
  'Calendar': <Calendar className="w-5 h-5" />,
  'FileSpreadsheet': <FileSpreadsheet className="w-5 h-5" />,
  'Clock': <Clock className="w-5 h-5" />,
  'MapPin': <MapPin className="w-5 h-5" />,
  'Activity': <Activity className="w-5 h-5" />,
  'Archive': <Archive className="w-5 h-5" />,
  'Bell': <Bell className="w-5 h-5" />,
  'BookOpen': <BookOpen className="w-5 h-5" />,
  'Camera': <Camera className="w-5 h-5" />,
  'Coffee': <Coffee className="w-5 h-5" />,
  'Download': <Download className="w-5 h-5" />,
  'Edit': <Edit className="w-5 h-5" />,
  'Eye': <Eye className="w-5 h-5" />,
  'Filter': <Filter className="w-5 h-5" />,
  'Folder': <Folder className="w-5 h-5" />,
  'Globe': <Globe className="w-5 h-5" />,
  'Heart': <Heart className="w-5 h-5" />,
  'Image': <Image className="w-5 h-5" />,
  'Key': <Key className="w-5 h-5" />,
  'Lock': <Lock className="w-5 h-5" />,
  'Mail': <Mail className="w-5 h-5" />,
  'MessageSquare': <MessageSquare className="w-5 h-5" />,
  'Monitor': <Monitor className="w-5 h-5" />,
  'Phone': <Phone className="w-5 h-5" />,
  'Plus': <Plus className="w-5 h-5" />,
  'Printer': <Printer className="w-5 h-5" />,
  'Save': <Save className="w-5 h-5" />,
  'Search': <Search className="w-5 h-5" />,
  'Send': <Send className="w-5 h-5" />,
  'Share': <Share className="w-5 h-5" />,
  'Star': <Star className="w-5 h-5" />,
  'Tag': <Tag className="w-5 h-5" />,
  'Trash': <Trash className="w-5 h-5" />,
  'Upload': <Upload className="w-5 h-5" />,
  'User': <User className="w-5 h-5" />,
  'Video': <Video className="w-5 h-5" />,
  'Wifi': <Wifi className="w-5 h-5" />,
  'Zap': <Zap className="w-5 h-5" />,
  
  // Variantes en minúsculas para compatibilidad con backend
  'user': <User className="w-5 h-5" />,
  'briefcase': <Briefcase className="w-5 h-5" />,
  'shield': <Shield className="w-5 h-5" />,
  'users': <Users className="w-5 h-5" />,
  'settings': <Settings className="w-5 h-5" />,
  'home': <Home className="w-5 h-5" />,
  'package': <Package className="w-5 h-5" />,
  'building': <Building className="w-5 h-5" />,
  'database': <Database className="w-5 h-5" />,
  'calendar': <Calendar className="w-5 h-5" />,
  'filetext': <FileText className="w-5 h-5" />,
  'dollarsign': <DollarSign className="w-5 h-5" />,
  'barchart2': <BarChart2 className="w-5 h-5" />,
  
  // Íconos específicos adicionales
  'beer': <Coffee className="w-5 h-5" />, // Usando Coffee como alternativa (no existe Beer en Lucide)
  'chopera': <Coffee className="w-5 h-5" />,
  'maintenance': <Cog className="w-5 h-5" />,
  'mantenimiento': <Cog className="w-5 h-5" />,
  'droplets': <Coffee className="w-5 h-5" />, // Alternativa para líquidos
  'glass': <Coffee className="w-5 h-5" />, // Alternativa para bebidas
  'cup': <Coffee className="w-5 h-5" /> // Alternativa para contenedores
};

// Función para obtener ícono dinámico del módulo
const getModuleIcon = (modulo: Modulo): React.ReactNode => {
  // 1. Si el módulo tiene un ícono específico desde el backend, usarlo
  if (modulo.icono && iconMap[modulo.icono]) {
    return iconMap[modulo.icono];
  }
  
  // 2. Normalizar nombre del ícono del backend (minúsculas -> PascalCase)
  if (modulo.icono) {
    const normalizedIconName = modulo.icono.charAt(0).toUpperCase() + modulo.icono.slice(1).toLowerCase();
    if (iconMap[normalizedIconName]) {
      return iconMap[normalizedIconName];
    }
  }
  
  	// 3. Fallback: detectar por nombre del módulo (mantener compatibilidad)
	const name = modulo.nombre.toLowerCase();
	
	if (name.includes('usuario') || name.includes('user')) {
		return <Users className="w-5 h-5" />;
	}
	if (name.includes('marketing') || name.includes('comision')) {
		return <BarChart2 className="w-5 h-5" />;
	}
	if (name.includes('salida') || name.includes('producto') || name.includes('inventario')) {
		return <Package className="w-5 h-5" />;
	}
	if (name.includes('recurso') || name.includes('humano') || name.includes('rrhh')) {
		return <Briefcase className="w-5 h-5" />;
	}
	if (name.includes('configurac') || name.includes('config')) {
		return <Settings className="w-5 h-5" />;
	}
	if (name.includes('seguridad')) {
		return <Shield className="w-5 h-5" />;
	}
	if (name.includes('reporte') || name.includes('informe')) {
		return <FileText className="w-5 h-5" />;
	}
	if (name.includes('planilla') || name.includes('nomina')) {
		return <FileSpreadsheet className="w-5 h-5" />;
	}
	if (name.includes('vacacion')) {
		return <CalendarCheck className="w-5 h-5" />;
	}
	if (name.includes('venta') || name.includes('factura')) {
		return <DollarSign className="w-5 h-5" />;
	}
	if (name.includes('sede') || name.includes('sucursal')) {
		return <Building className="w-5 h-5" />;
	}
	if (name.includes('cargo') || name.includes('puesto')) {
		return <Briefcase className="w-5 h-5" />;
	}
	if (name.includes('bendita') || name.includes('chopera')) {
		return <Coffee className="w-5 h-5" />;
	}
  
  // 4. Ícono por defecto
  return <ClipboardList className="w-5 h-5" />;
};

// Función para obtener submenues dinámicos del backend
const getSubmenus = (modulo: Modulo): SubMenuItem[] => {
  // Los submódulos vienen directamente del backend con datos completos
  if (!modulo.submodulos || modulo.submodulos.length === 0) {
    return [];
  }
  
  // Convertir submódulos a formato SubMenuItem y ordenar
  return modulo.submodulos
    .filter(sub => sub.activo && sub.esMenu) // Solo submódulos activos y de menú
    .sort((a, b) => a.orden - b.orden) // Ordenar por campo orden
    .map(sub => ({
      label: sub.nombre,
      to: sub.ruta,
      permission: sub.id.toString() // Usar ID como permission para verificar acceso
    }));
};

function SidebarItem({ item, active, parentOpen, onClick, children }: {
	item: any,
	active: boolean,
	parentOpen?: boolean,
	onClick: () => void,
	children?: React.ReactNode
}) {
	return item.submenu ? (
		<div>
			<button
				className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg sidebar-menu-item text-base ${parentOpen ? "sidebar-menu-parent-open" : ""}`}
				onClick={onClick}
				type="button"
			>
				{item.icon}
				<span className="flex-1 text-left">{item.label}</span>
				{children}
			</button>
		</div>
	) : (
		<Link
			to={item.to}
			className={`flex items-center gap-2 px-4 py-2 rounded-lg sidebar-menu-item text-base ${active ? "sidebar-menu-item-active" : ""}`}
			onClick={onClick}
		>
			{item.icon}
			<span>{item.label}</span>
		</Link>
	)
}

export default function Sidebar() {
	const [open, setOpen] = useState(false)
	const [submenuOpen, setSubmenuOpen] = useState<{ [key: string]: boolean }>({})
	const [modulos, setModulos] = useState<Modulo[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const location = useLocation()
	const { user } = useAuth()

	// Cargar módulos desde el backend
	useEffect(() => {
		loadModulos()
	}, [])

	const loadModulos = async () => {
		try {
			setIsLoading(true)
			setError(null)
			
			// Usar el nuevo endpoint jerárquico del sidebar
			const data = await modulosService.getSidebarModules()
			
			// Filtrar solo módulos activos (mostrar todos los módulos activos)
			const filteredModulos = data
				.filter(modulo => modulo.activo) // Solo módulos activos
				.sort((a, b) => a.orden - b.orden) // Ordenar por campo orden
			
			setModulos(filteredModulos)
			console.log('🔄 Sidebar: Módulos jerárquicos recargados desde /modulos/sidebar')
		} catch (err) {
			console.error('Error cargando módulos:', err)
			setError('Error al cargar módulos')
		} finally {
			setIsLoading(false)
		}
	}

	// Función para refrescar módulos desde componentes externos
	const refreshModulos = async () => {
		console.log('🔄 Sidebar: Solicitando refrescamiento de módulos...')
		await loadModulos()
	}

	// Hacer la función de refresh disponible globalmente
	useEffect(() => {
		// Adjuntar función de refresh al objeto window para acceso global
		(window as any).refreshSidebar = refreshModulos
		
		// Cleanup al desmontar
		return () => {
			delete (window as any).refreshSidebar
		}
	}, [])

	// Auto-refresh deshabilitado (solo manual cuando sea necesario)
	// Si necesitas auto-refresh, descomenta las siguientes líneas:
	// useEffect(() => {
	//   const interval = setInterval(() => {
	//     console.log('🔄 Sidebar: Auto-refresh cada 30 segundos')
	//     loadModulos()
	//   }, 30000)
	//   return () => clearInterval(interval)
	// }, [])

	// Función temporal para asignar permisos faltantes a submódulos
	const asignarPermisosSubmódulos = async () => {
		if (!user) return
		
		console.log('🔧 Asignando permisos faltantes a submódulos...')
		
		try {
			const { permisosService } = await import('../../services')
			
			// IDs de submódulos que necesitan permisos (6, 7, 8)
			const submodulosIds = [6, 7, 8]
			const rolId = 1 // Asumir rol administrador
			
			for (const moduloId of submodulosIds) {
				try {
					await permisosService.create({
						rolId: rolId,
						moduloId: moduloId,
						crear: true,
						leer: true,
						actualizar: true,
						eliminar: true
					})
					console.log(`✅ Permisos asignados al módulo ${moduloId}`)
				} catch (error) {
					console.warn(`⚠️ Error asignando permisos al módulo ${moduloId}:`, error)
				}
			}
			
			alert('Permisos asignados. Recarga la página para ver los cambios.')
		} catch (error) {
			console.error('Error asignando permisos:', error)
		}
	}

	// Hacer función disponible globalmente para debugging
	useEffect(() => {
		(window as any).asignarPermisosSubmódulos = asignarPermisosSubmódulos
	}, [user])

	const handleSubmenu = (label: string) => {
		setSubmenuOpen((prev) => ({
			...prev,
			[label]: !prev[label],
		}))
	}

	// Verificar si el usuario tiene acceso a un módulo por ID
	const hasModuleAccess = (moduloId: number): boolean => {
		if (!user || !user.permisos) return false
		return user.permisos.some(permiso => permiso.moduloId === moduloId)
	}

	// Verificar si el usuario tiene acceso a al menos un submódulo del módulo padre
	const hasSubmoduleAccess = (modulo: Modulo): boolean => {
		if (!modulo.submodulos || modulo.submodulos.length === 0) return false
		return modulo.submodulos.some(sub => hasModuleAccess(sub.id))
	}

	// Verificar si el módulo debe mostrarse (tiene acceso directo o a submódulos)
	const shouldShowModule = (modulo: Modulo): boolean => {
		// Si tiene acceso directo al módulo padre
		if (hasModuleAccess(modulo.id)) return true
		
		// Si tiene acceso a al menos un submódulo
		if (hasSubmoduleAccess(modulo)) return true
		
		return false
	}

	// Construir menu items dinámicamente desde los módulos jerárquicos del backend
	const buildMenuItems = (): MenuItem[] => {
		const menuItems: MenuItem[] = [
			{
				id: 0,
				label: "Inicio",
				icon: <Home className="w-5 h-5" />,
				to: "/",
				permission: null,
			}
		];

		

		// Agregar módulos del backend filtrados por permisos
		modulos.forEach(modulo => {
			console.log(`🔍 Procesando módulo ${modulo.id} (${modulo.nombre})...`)
			
			// Solo procesar módulos de nivel 1 (módulos padre)
			if (modulo.nivel === 1) {
				// TEMPORAL: Bypass de permisos para debugging
				const DEBUG_BYPASS_MODULE_PERMISSIONS = true; // Cambiar a false cuando quieras activar permisos
				
				// Solo agregar módulos a los que el usuario tiene acceso (directo o a submódulos)
				if (DEBUG_BYPASS_MODULE_PERMISSIONS || shouldShowModule(modulo)) {
					const submenu = getSubmenus(modulo);
					console.log(`📋 Submenu generado para ${modulo.nombre}:`, submenu)
					
					// TEMPORAL: Bypass de permisos para debugging
					const DEBUG_BYPASS_PERMISSIONS = true; // Cambiar a false cuando quieras activar permisos
					
					let filteredSubmenu: SubMenuItem[];
					
					if (DEBUG_BYPASS_PERMISSIONS) {
						// Mostrar TODOS los submódulos sin validar permisos
						filteredSubmenu = submenu;
						console.log(`🧪 DEBUG - Mostrando submódulos SIN validar permisos para ${modulo.nombre}:`, submenu)
					} else {
						// Filtrar submenu por permisos del usuario (comportamiento normal)
						filteredSubmenu = submenu.filter(sub => {
							const hasAccess = hasModuleAccess(parseInt(sub.permission!))
							console.log(`  🔐 Submódulo ${sub.label} (${sub.permission}): acceso=${hasAccess}`)
							return hasAccess
						});
					}
					
					console.log(`✅ Submenu filtrado para ${modulo.nombre}:`, filteredSubmenu)
					
					menuItems.push({
						id: modulo.id,
						label: modulo.nombre,
						icon: getModuleIcon(modulo),
						// Si hay submódulos con acceso, no ruta directa; si no hay submódulos o solo acceso al padre, ruta directa
						to: filteredSubmenu.length > 0 ? undefined : modulo.ruta,
						permission: null, // Ya verificamos permisos arriba
						submenu: filteredSubmenu.length > 0 ? filteredSubmenu : undefined,
					});
				} else {
					console.log(`❌ Módulo ${modulo.nombre} no se mostrará (sin acceso)`)
				}
			}
		});

		return menuItems;
	};

	const menuItems = buildMenuItems();

	// Para debug - mostrar qué módulos tiene acceso el usuario con nueva estructura
	useEffect(() => {
		if (user && modulos.length > 0) {
			console.log('🔍 DEBUG JERÁRQUICO - Usuario:', {
				nombre: user.nombre,
				apellido: user.apellido,
				permisos: user.permisos,
				permisosLength: user.permisos?.length,
				permisosDetalle: user.permisos?.map(p => ({
					moduloId: p.moduloId,
					moduloNombre: p.moduloNombre,
					crear: p.crear,
					leer: p.leer,
					actualizar: p.actualizar,
					eliminar: p.eliminar
				}))
			})
			
			console.log('📋 DEBUG JERÁRQUICO - Módulos:')
			modulos.forEach(modulo => {
				console.log(`📂 Módulo ${modulo.id} (${modulo.nombre}):`, {
					accesoPadre: hasModuleAccess(modulo.id),
					accesoSubmods: hasSubmoduleAccess(modulo),
					debeShowcase: shouldShowModule(modulo),
					nivel: modulo.nivel,
					orden: modulo.orden,
					icono: modulo.icono,
					submodulos: modulo.submodulos?.map(sub => ({
						id: sub.id,
						nombre: sub.nombre,
						acceso: hasModuleAccess(sub.id)
					})) || []
				})
			})
			
			console.log('🎯 Menu items jerárquico final:', menuItems)
		}
	}, [user, modulos, menuItems])

	return (
		<>
			{/* Botón menú móvil, oculto cuando el menú está abierto */}
			{!open && (
				<button
					className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-full text-primary-fg bg-primary shadow-lg"
					onClick={() => setOpen(!open)}
					aria-label="Abrir menú lateral"
				>
					<Menu className="w-6 h-6" />
				</button>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 h-screen w-64 sidebar-bg shadow-lg z-40 transform transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
			>
				<div className="flex flex-col h-full">
					{/* Header/Logo */}
					<div className="flex items-center gap-2 px-6 py-4 sidebar-logo">
						<span>MINOIL S.A</span>
						<span className="sidebar-badge">BPMS</span>
					</div>
					<div className="sidebar-separator" />
					{/* Navegación */}
					<nav className="flex-1 flex flex-col gap-2 px-2 mt-2">
						{isLoading ? (
							<div className="flex items-center justify-center p-4">
								<Loader2 className="w-5 h-5 animate-spin mr-2" />
								<span className="text-sm">Cargando menú...</span>
							</div>
						) : error ? (
							<div className="flex flex-col items-center p-4">
								<AlertCircle className="w-6 h-6 text-red-500 mb-2" />
								<p className="text-sm text-red-600 mb-2 text-center">{error}</p>
								<button 
									onClick={loadModulos}
									className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
								>
									Reintentar
								</button>
							</div>
						) : (
							menuItems.map((item) => {
								const isActive = location.pathname === item.to;
								return (
									<div key={item.id}>
										<SidebarItem
											item={item}
											active={!!isActive}
											parentOpen={!!(item.submenu && submenuOpen[item.label])}
											onClick={item.submenu ? () => handleSubmenu(item.label) : () => setOpen(false)}
										>
											{item.submenu && (submenuOpen[item.label] ? <ChevronUp /> : <ChevronDown />)}
										</SidebarItem>
										{item.submenu && submenuOpen[item.label] && (
											<div className="ml-8 flex flex-col gap-1">
												{item.submenu.map((sub) => (
													<Link
														key={sub.to}
														to={sub.to}
														className={`px-3 py-1 rounded sidebar-menu-item text-sm ${location.pathname === sub.to ? "sidebar-menu-item-active" : ""}`}
														onClick={() => setOpen(false)}
													>
														{sub.label}
													</Link>
												))}
											</div>
										)}
									</div>
								)
							})
						)}
					</nav>
					<div className="sidebar-separator" />
					{/* Acción (configuración) */}
					<div className="p-4 mt-auto">
						<button className="flex items-center gap-2 w-full px-4 py-2 rounded-lg sidebar-menu-item text-base" onClick={() => {/* lógica de configuración */}}>
							<Settings className="w-5 h-5" />
							Configuraciones
						</button>
					</div>
				</div>
			</aside>

			{/* Overlay para móvil */}
			{open && (
				<div
					className="fixed inset-0 bg-black/30 z-30 md:hidden"
					onClick={() => setOpen(false)}
				/>
			)}
		</>
	)
}