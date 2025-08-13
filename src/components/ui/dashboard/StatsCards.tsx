import React, { useState, useEffect } from 'react'
import { Users, Building, MapPin, Shield, TrendingUp, Activity } from 'lucide-react'
import { usuariosService, sedesService, areasService, rolesService } from '../../../services'

interface StatCard {
  title: string
  value: number | string
  icon: React.ReactNode
  gradient: string
  iconColor: string
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
}

export function StatsCards() {
  const [stats, setStats] = useState<StatCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // Obtener datos en paralelo
        const [usuarios, sedes, areas, roles] = await Promise.all([
          usuariosService.getAll().catch(() => []),
          sedesService.getAll().catch(() => []),
          areasService.getAll().catch(() => []),
          rolesService.getAll().catch(() => [])
        ])

        // Calcular estadísticas
        const activeUsers = usuarios.filter((u: any) => u.activo).length
        const totalUsers = usuarios.length
        const activationRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0

        const recentUsers = usuarios.filter((u: any) => {
          if (!u.ultimoAcceso) return false
          const lastAccess = new Date(u.ultimoAcceso)
          const daysSinceAccess = (Date.now() - lastAccess.getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceAccess <= 7
        }).length

        const statsData: StatCard[] = [
          {
            title: 'Usuarios Activos',
            value: activeUsers,
            icon: <Users className="w-6 h-6" />,
            gradient: 'linear-gradient(135deg, #002B68 0%, #1a4c8c 100%)',
            iconColor: '#ffffff',
            change: `${activationRate}% del total`,
            changeType: activationRate > 80 ? 'increase' : activationRate > 60 ? 'neutral' : 'decrease'
          },
          {
            title: 'Sedes Operativas',
            value: sedes.filter((s: any) => s.activo).length,
            icon: <Building className="w-6 h-6" />,
            gradient: 'linear-gradient(135deg, #E8DB1B 0%, #d4c800 100%)',
            iconColor: '#000000',
            change: `${sedes.length} total`,
            changeType: 'neutral'
          },
          {
            title: 'Áreas de Trabajo',
            value: areas.filter((a: any) => a.activo).length,
            icon: <MapPin className="w-6 h-6" />,
            gradient: 'linear-gradient(135deg, #19202a 0%, #2a3441 100%)',
            iconColor: '#ffffff',
            change: `${areas.length} configuradas`,
            changeType: 'neutral'
          },
          {
            title: 'Accesos Recientes',
            value: recentUsers,
            icon: <Activity className="w-6 h-6" />,
            gradient: 'linear-gradient(135deg, #002B68 20%, #E8DB1B 100%)',
            iconColor: '#ffffff',
            change: 'Últimos 7 días',
            changeType: recentUsers > activeUsers * 0.7 ? 'increase' : 'decrease'
          }
        ]

        setStats(statsData)
      } catch (error) {
        console.error('Error obteniendo estadísticas:', error)
        // Mostrar estadísticas por defecto en caso de error
        setStats([
          {
            title: 'Sistema Operativo',
            value: '✓',
            icon: <Activity className="w-6 h-6" />,
            gradient: 'linear-gradient(135deg, #E8DB1B 0%, #d4c800 100%)',
            iconColor: '#000000',
            change: 'Funcionando correctamente',
            changeType: 'increase'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2 font-secondary">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-3 font-brand">{stat.value}</p>
              {stat.change && (
                <div className="flex items-center gap-1">
                  {stat.changeType === 'increase' && <TrendingUp className="w-3 h-3 text-green-500" />}
                  {stat.changeType === 'decrease' && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                  <span className={`text-xs font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' :
                    stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              )}
            </div>
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: stat.gradient
              }}
            >
              <span style={{color: stat.iconColor}}>
                {stat.icon}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 