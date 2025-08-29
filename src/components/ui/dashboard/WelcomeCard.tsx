import React from 'react'
import { User, Clock, MapPin, Users, Calendar } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'

export function WelcomeCard() {
  const { user } = useAuth()

  if (!user) return null

  const currentTime = new Date()
  const greeting = currentTime.getHours() < 12 ? 'Buenos días' : 
                  currentTime.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches'

  const formatLastLogin = (ultimoAcceso?: string | null) => {
    if (!ultimoAcceso) return 'Primera vez'
    
    try {
      const lastLoginDate = new Date(ultimoAcceso)
      const now = new Date()
      const diff = now.getTime() - lastLoginDate.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(hours / 24)
      
      if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`
      if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
      return 'Hace unos minutos'
    } catch (error) {
      return 'Fecha no válida'
    }
  }

  return (
    <div className="relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #002B68 0%, #19202a 100%)',
    }}>
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(45deg, rgba(232, 219, 27, 0.1) 0%, transparent 100%)',
      }}></div>

      <div className="relative text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2 font-brand">
              {greeting}, {user.nombre}!
            </h1>
            <p className="text-blue-100 mb-4 font-secondary">
              Bienvenido al sistema BPMS de MINOIL
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-blue-100">Cargo:</span>
                <span className="font-medium text-white">
                  {user.cargo?.nombre || 'No asignado'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-blue-100">Sede:</span>
                <span className="font-medium text-white">
                  {user.sede?.nombre || 'No asignada'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-blue-100">Área:</span>
                <span className="font-medium text-white">
                  {user.area?.nombre || 'No asignada'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-blue-100">Último acceso:</span>
                <span className="font-medium text-white">{formatLastLogin(user.ultimoAcceso)}</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
              background: 'rgba(232, 219, 27, 0.2)',
              border: '2px solid rgba(232, 219, 27, 0.3)'
            }}>
              <User className="w-10 h-10" style={{color: '#E8DB1B'}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 