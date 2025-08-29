import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from '../contexts/AuthContext'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasPermission(user: User | null, permission: string | null): boolean {
  if (!user) return false
  if (!permission) return true // Si no se requiere permiso específico
  
  console.log(`🔐 Verificando permiso: "${permission}" para usuario: ${user.nombre}`)
  console.log(`📋 Permisos del usuario:`, user.permisos?.map(p => ({
    moduloId: p.moduloId,
    moduloNombre: p.moduloNombre,
    crear: p.crear,
    leer: p.leer,
    actualizar: p.actualizar,
    eliminar: p.eliminar
  })))
  
  // Si no hay permisos configurados aún, denegar acceso
  if (!user.permisos || user.permisos.length === 0) {
    console.warn('⚠️ Usuario sin permisos configurados')
    return false
  }
  
  // Verificar permisos por ID de módulo (nuevo formato)
  if (!isNaN(Number(permission))) {
    const moduloId = Number(permission)
    return user.permisos.some(p => p.moduloId === moduloId)
  }
  
  // Verificar permisos por módulo y acción específica
  if (permission.includes(':')) {
    // Formato: "moduloId:accion" o "moduloNombre:accion"
    const [modulo, accion] = permission.split(':')
    
    let permiso;
    if (!isNaN(Number(modulo))) {
      // Buscar por ID de módulo
      permiso = user.permisos.find(p => p.moduloId === Number(modulo))
    } else {
      // Buscar por nombre de módulo
      permiso = user.permisos.find(p => 
        p.moduloNombre.toLowerCase() === modulo.toLowerCase()
      )
    }
    
    if (!permiso) return false
    
    switch (accion.toLowerCase()) {
      case 'crear': return permiso.crear
      case 'leer': return permiso.leer
      case 'actualizar': return permiso.actualizar
      case 'eliminar': return permiso.eliminar
      default: return false
    }
  }
  
  // Verificar acceso general al módulo por nombre
  const hasModule = user.permisos.some(p => {
    const matches = p.moduloNombre.toLowerCase().includes(permission.toLowerCase()) ||
                   permission.toLowerCase().includes(p.moduloNombre.toLowerCase())
    console.log(`🔍 Comparando "${p.moduloNombre}" con "${permission}": ${matches}`)
    return matches
  })
  
  console.log(`✅ Resultado final para permiso "${permission}": ${hasModule}`)
  return hasModule
}

// Función helper para verificar acciones específicas por ID de módulo
export function canCreate(user: User | null, moduloId: number): boolean {
  if (!user || !user.permisos) return false
  const permiso = user.permisos.find(p => p.moduloId === moduloId)
  return permiso ? permiso.crear : false
}

export function canRead(user: User | null, moduloId: number): boolean {
  if (!user || !user.permisos) return false
  const permiso = user.permisos.find(p => p.moduloId === moduloId)
  return permiso ? permiso.leer : false
}

export function canUpdate(user: User | null, moduloId: number): boolean {
  if (!user || !user.permisos) return false
  const permiso = user.permisos.find(p => p.moduloId === moduloId)
  return permiso ? permiso.actualizar : false
}

export function canDelete(user: User | null, moduloId: number): boolean {
  if (!user || !user.permisos) return false
  const permiso = user.permisos.find(p => p.moduloId === moduloId)
  return permiso ? permiso.eliminar : false
}

// Función para verificar acciones específicas por nombre de módulo
export function canCreateByName(user: User | null, moduloNombre: string): boolean {
  return hasPermission(user, `${moduloNombre}:crear`)
}

export function canReadByName(user: User | null, moduloNombre: string): boolean {
  return hasPermission(user, `${moduloNombre}:leer`)
}

export function canUpdateByName(user: User | null, moduloNombre: string): boolean {
  return hasPermission(user, `${moduloNombre}:actualizar`)
}

export function canDeleteByName(user: User | null, moduloNombre: string): boolean {
  return hasPermission(user, `${moduloNombre}:eliminar`)
}

// Función para obtener todos los módulos disponibles para el usuario
export function getUserModules(user: User | null): Array<{
  id: number
  nombre: string
  permisos: {
    crear: boolean
    leer: boolean
    actualizar: boolean
    eliminar: boolean
  }
}> {
  if (!user || !user.permisos) return []
  
  return user.permisos.map(p => ({
    id: p.moduloId,
    nombre: p.moduloNombre,
    permisos: {
      crear: p.crear,
      leer: p.leer,
      actualizar: p.actualizar,
      eliminar: p.eliminar
    }
  }))
}

// Función para verificar si el usuario es administrador
export function isAdmin(user: User | null): boolean {
  if (!user || !user.permisos) return false
  
  // Un administrador tiene permisos de crear, leer, actualizar y eliminar en todos los módulos
  // O tiene acceso al módulo de "Usuarios" con permisos completos
  const usuariosPermiso = user.permisos.find(p => 
    p.moduloNombre.toLowerCase().includes('usuario')
  )
  
  if (usuariosPermiso && usuariosPermiso.crear && usuariosPermiso.eliminar) {
    return true
  }
  
  // Verificar si tiene permisos completos en la mayoría de módulos
  const totalModulos = user.permisos.length
  const modulosCompletos = user.permisos.filter(p => 
    p.crear && p.leer && p.actualizar && p.eliminar
  ).length
  
  return totalModulos > 0 && (modulosCompletos / totalModulos) >= 0.8 // 80% o más con permisos completos
}

// Función para obtener el nivel de acceso del usuario a un módulo
export function getModuleAccessLevel(user: User | null, moduloId: number): {
  hasAccess: boolean
  level: 'none' | 'read' | 'write' | 'admin'
  permissions: {
    crear: boolean
    leer: boolean
    actualizar: boolean
    eliminar: boolean
  }
} {
  if (!user || !user.permisos) {
    return {
      hasAccess: false,
      level: 'none',
      permissions: { crear: false, leer: false, actualizar: false, eliminar: false }
    }
  }
  
  const permiso = user.permisos.find(p => p.moduloId === moduloId)
  
  if (!permiso) {
    return {
      hasAccess: false,
      level: 'none',
      permissions: { crear: false, leer: false, actualizar: false, eliminar: false }
    }
  }
  
  const permissions = {
    crear: permiso.crear,
    leer: permiso.leer,
    actualizar: permiso.actualizar,
    eliminar: permiso.eliminar
  }
  
  let level: 'none' | 'read' | 'write' | 'admin' = 'none'
  
  if (permiso.crear && permiso.leer && permiso.actualizar && permiso.eliminar) {
    level = 'admin'
  } else if (permiso.crear || permiso.actualizar || permiso.eliminar) {
    level = 'write'
  } else if (permiso.leer) {
    level = 'read'
  }
  
  return {
    hasAccess: true,
    level,
    permissions
  }
}
