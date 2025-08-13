import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Calendar,
  Package,
  CreditCard,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { hasPermission } from '../../../lib/utils'
import { Button } from '../base/button'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  path: string
  permission: string | null
  colorStyle: 'primary' | 'secondary' | 'neutral' | 'accent'
}

export function QuickActions() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Definir estilos de colores basados en la marca MINOIL
  const getColorStyle = (colorStyle: string) => {
    switch (colorStyle) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #002B68 0%, #1a4c8c 100%)',
          color: '#ffffff'
        }
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, #E8DB1B 0%, #d4c800 100%)',
          color: '#000000'
        }
      case 'neutral':
        return {
          background: 'linear-gradient(135deg, #19202a 0%, #2a3441 100%)',
          color: '#ffffff'
        }
      case 'accent':
        return {
          background: 'linear-gradient(135deg, #002B68 20%, #E8DB1B 100%)',
          color: '#ffffff'
        }
      default:
        return {
          background: 'linear-gradient(135deg, #002B68 0%, #1a4c8c 100%)',
          color: '#ffffff'
        }
    }
  }

  // Definir todas las acciones posibles
  const allActions: QuickAction[] = [
    {
      id: 'ingresar-salida',
      title: 'Registrar Salida',
      description: 'Ingresar nueva salida de producto',
      icon: <Package className="w-5 h-5" />,
      path: '/salidas/ingresar',
      permission: 'salidas de producto',
      colorStyle: 'primary'
    },
    {
      id: 'gestionar-salidas',
      title: 'Gestionar Salidas',
      description: 'Ver y administrar salidas existentes',
      icon: <FileText className="w-5 h-5" />,
      path: '/salidas/gestionar',
      permission: 'salidas de producto',
      colorStyle: 'neutral'
    },
    {
      id: 'mercaderistas',
      title: 'Mercaderistas',
      description: 'Gestionar equipo de mercaderistas',
      icon: <Users className="w-5 h-5" />,
      path: '/marketing/mercaderistas',
      permission: 'marketing/comisiones',
      colorStyle: 'secondary'
    },
    {
      id: 'reportes-sala',
      title: 'Reportes de Sala',
      description: 'Ver reportes por sala de ventas',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/marketing/reportes-sala',
      permission: 'marketing/comisiones',
      colorStyle: 'accent'
    },
    {
      id: 'planilla-comisiones',
      title: 'Planilla Comisiones',
      description: 'Gestionar comisiones del personal',
      icon: <CreditCard className="w-5 h-5" />,
      path: '/rrhh/planilla-comisiones',
      permission: 'recursos humanos',
      colorStyle: 'primary'
    },
    {
      id: 'vacaciones',
      title: 'Vacaciones',
      description: 'Solicitar y gestionar vacaciones',
      icon: <Calendar className="w-5 h-5" />,
      path: '/rrhh/vacaciones',
      permission: 'recursos humanos',
      colorStyle: 'secondary'
    },
    {
      id: 'usuarios',
      title: 'Gestionar Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: <Users className="w-5 h-5" />,
      path: '/usuarios',
      permission: 'usuarios',
      colorStyle: 'neutral'
    },
    {
      id: 'roles-permisos',
      title: 'Roles y Permisos',
      description: 'Configurar roles y permisos',
      icon: <Settings className="w-5 h-5" />,
      path: '/usuarios/roles',
      permission: 'usuarios',
      colorStyle: 'accent'
    }
  ]

  // Filtrar acciones basadas en permisos del usuario
  const availableActions = allActions.filter(action => 
    hasPermission(user, action.permission)
  )

  const handleActionClick = (path: string) => {
    navigate(path)
  }

  if (availableActions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 font-brand">Acciones Rápidas</h2>
        <p className="text-gray-600 text-center py-8 font-secondary">
          No hay acciones disponibles para tu rol actual.
          <br />
          Contacta al administrador para obtener más permisos.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 font-brand">Acciones Rápidas</h2>
        <span className="text-sm px-3 py-1 rounded-full font-secondary" style={{
          backgroundColor: 'rgba(232, 219, 27, 0.1)',
          color: '#002B68'
        }}>
          {availableActions.length} disponible{availableActions.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableActions.map((action) => {
          const colorStyle = getColorStyle(action.colorStyle)
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.path)}
              className="p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group relative overflow-hidden text-left"
              style={{
                background: colorStyle.background,
                color: colorStyle.color
              }}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex-shrink-0 mt-1">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1 group-hover:text-current font-brand">
                    {action.title}
                  </h3>
                  <p className="text-xs opacity-90 leading-relaxed font-secondary">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
              </div>
            </button>
          )
        })}
      </div>

      {availableActions.length > 6 && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/usuarios')}
            className="font-secondary"
            style={{
              borderColor: '#002B68',
              color: '#002B68'
            }}
          >
            Ver todas las opciones
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
} 