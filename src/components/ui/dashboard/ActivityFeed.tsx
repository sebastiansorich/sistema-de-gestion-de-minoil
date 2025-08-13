import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Calendar,
  Users,
  Package,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { Button } from '../base/button'

interface ActivityItem {
  id: string
  type: 'notification' | 'activity' | 'system' | 'achievement'
  title: string
  description: string
  time: string
  icon: React.ReactNode
  colorStyle: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'info'
  priority: 'high' | 'medium' | 'low'
}

export function ActivityFeed() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  // Función para obtener estilos de color basados en la marca MINOIL
  const getColorStyle = (colorStyle: string) => {
    switch (colorStyle) {
      case 'primary':
        return {
          gradient: 'linear-gradient(135deg, #002B68 0%, #1a4c8c 100%)',
          iconColor: '#ffffff',
          bgColor: 'rgba(0, 43, 104, 0.05)'
        }
      case 'secondary':
        return {
          gradient: 'linear-gradient(135deg, #E8DB1B 0%, #d4c800 100%)',
          iconColor: '#000000',
          bgColor: 'rgba(232, 219, 27, 0.05)'
        }
      case 'neutral':
        return {
          gradient: 'linear-gradient(135deg, #19202a 0%, #2a3441 100%)',
          iconColor: '#ffffff',
          bgColor: 'rgba(25, 32, 42, 0.05)'
        }
      case 'success':
        return {
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          iconColor: '#ffffff',
          bgColor: 'rgba(16, 185, 129, 0.05)'
        }
      case 'warning':
        return {
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          iconColor: '#ffffff',
          bgColor: 'rgba(245, 158, 11, 0.05)'
        }
      case 'info':
        return {
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          iconColor: '#ffffff',
          bgColor: 'rgba(59, 130, 246, 0.05)'
        }
      default:
        return {
          gradient: 'linear-gradient(135deg, #002B68 0%, #1a4c8c 100%)',
          iconColor: '#ffffff',
          bgColor: 'rgba(0, 43, 104, 0.05)'
        }
    }
  }

  useEffect(() => {
    const generateMockActivities = (): ActivityItem[] => {
      const now = new Date()
      
      // Función auxiliar para convertir ultimoAcceso a Date
      const getLastLoginDate = () => {
        if (!user?.ultimoAcceso) return new Date()
        try {
          return new Date(user.ultimoAcceso)
        } catch {
          return new Date()
        }
      }
      
      // Generar actividades basadas en el rol del usuario
      const baseActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'system',
          title: 'Sistema Actualizado',
          description: 'El sistema BPMS se actualizó a la versión 2.1.0',
          time: formatTimeAgo(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
          icon: <RefreshCw className="w-4 h-4" />,
          colorStyle: 'info',
          priority: 'medium'
        },
        {
          id: '2',
          type: 'activity',
          title: 'Bienvenido al Sistema',
          description: `¡Hola ${user?.nombre}! Te damos la bienvenida al dashboard de MINOIL`,
          time: formatTimeAgo(getLastLoginDate()),
          icon: <User className="w-4 h-4" />,
          colorStyle: 'success',
          priority: 'high'
        }
      ]

      // Agregar actividades específicas según permisos
      if (user?.permisos?.some(p => p.moduloNombre.toLowerCase().includes('salida'))) {
        baseActivities.push({
          id: '3',
          type: 'notification',
          title: 'Salidas Pendientes',
          description: 'Hay 3 salidas de producto que requieren tu aprobación',
          time: formatTimeAgo(new Date(now.getTime() - 30 * 60 * 1000)),
          icon: <Package className="w-4 h-4" />,
          colorStyle: 'warning',
          priority: 'high'
        })
      }

      if (user?.permisos?.some(p => p.moduloNombre.toLowerCase().includes('marketing'))) {
        baseActivities.push({
          id: '4',
          type: 'achievement',
          title: 'Meta Alcanzada',
          description: 'El equipo de mercaderistas superó la meta mensual en un 15%',
          time: formatTimeAgo(new Date(now.getTime() - 4 * 60 * 60 * 1000)),
          icon: <TrendingUp className="w-4 h-4" />,
          colorStyle: 'secondary',
          priority: 'medium'
        })
      }

      if (user?.permisos?.some(p => p.moduloNombre.toLowerCase().includes('usuario'))) {
        baseActivities.push({
          id: '5',
          type: 'notification',
          title: 'Nuevos Usuarios',
          description: '2 nuevos usuarios se registraron y esperan activación',
          time: formatTimeAgo(new Date(now.getTime() - 6 * 60 * 60 * 1000)),
          icon: <Users className="w-4 h-4" />,
          colorStyle: 'primary',
          priority: 'medium'
        })
      }

      if (user?.permisos?.some(p => p.moduloNombre.toLowerCase().includes('recurso'))) {
        baseActivities.push({
          id: '6',
          type: 'notification',
          title: 'Solicitudes de Vacaciones',
          description: 'Tienes 2 solicitudes de vacaciones pendientes de revisión',
          time: formatTimeAgo(new Date(now.getTime() - 8 * 60 * 60 * 1000)),
          icon: <Calendar className="w-4 h-4" />,
          colorStyle: 'warning',
          priority: 'high'
        })
      }

      // Actividades generales del sistema
      baseActivities.push(
        {
          id: '7',
          type: 'system',
          title: 'Mantenimiento Programado',
          description: 'El próximo mantenimiento está programado para el domingo a las 2:00 AM',
          time: formatTimeAgo(new Date(now.getTime() - 12 * 60 * 60 * 1000)),
          icon: <Info className="w-4 h-4" />,
          colorStyle: 'neutral',
          priority: 'low'
        },
        {
          id: '8',
          type: 'activity',
          title: 'Backup Completado',
          description: 'El respaldo automático diario se completó exitosamente',
          time: formatTimeAgo(new Date(now.getTime() - 18 * 60 * 60 * 1000)),
          icon: <CheckCircle className="w-4 h-4" />,
          colorStyle: 'success',
          priority: 'low'
        }
      )

      return baseActivities.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
    }

    // Simular carga de datos
    setTimeout(() => {
      setActivities(generateMockActivities())
      setLoading(false)
    }, 1000)
  }, [user])

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
    return 'Hace unos momentos'
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        borderColor: '#fecaca'
      },
      medium: {
        backgroundColor: '#fef3c7',
        color: '#d97706',
        borderColor: '#fde68a'
      },
      low: {
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
        borderColor: '#e5e7eb'
      }
    }
    return styles[priority as keyof typeof styles] || styles.low
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #002B68 0%, #1a4c8c 100%)'
          }}>
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 font-brand">Actividad Reciente</h2>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #002B68 0%, #1a4c8c 100%)'
          }}>
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 font-brand">Actividad Reciente</h2>
        </div>
        <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{
          background: 'linear-gradient(135deg, #E8DB1B 0%, #d4c800 100%)',
          color: '#000000'
        }}>
          {activities.filter(a => a.priority === 'high').length} urgente{activities.filter(a => a.priority === 'high').length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-secondary">No hay actividad reciente</p>
          </div>
        ) : (
          activities.map((item) => {
            const colorStyle = getColorStyle(item.colorStyle)
            const priorityBadge = getPriorityBadge(item.priority)
            
            return (
              <div 
                key={item.id} 
                className="flex items-start gap-3 p-4 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer"
                style={{
                  backgroundColor: colorStyle.bgColor
                }}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{
                    background: colorStyle.gradient
                  }}
                >
                  <span style={{color: colorStyle.iconColor}}>
                    {item.icon}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight font-brand">
                      {item.title}
                    </h3>
                    <span 
                      className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                      style={{
                        backgroundColor: priorityBadge.backgroundColor,
                        color: priorityBadge.color,
                        border: `1px solid ${priorityBadge.borderColor}`
                      }}
                    >
                      {item.priority === 'high' ? 'Urgente' : 
                       item.priority === 'medium' ? 'Medio' : 'Bajo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-secondary mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500 font-secondary">{item.time}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full font-secondary border-2 hover:shadow-md transition-all duration-200"
            style={{
              borderColor: '#002B68',
              color: '#002B68'
            }}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      )}
    </div>
  )
} 