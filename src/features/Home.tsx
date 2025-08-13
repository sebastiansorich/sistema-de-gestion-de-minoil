import React from 'react'
import { WelcomeCard, StatsCards, QuickActions, ActivityFeed } from '../components/ui'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Fila 1: Tarjeta de Bienvenida */}
        <div className="w-full">
          <WelcomeCard />
        </div>

        {/* Fila 2: Estadísticas Organizacionales */}
        <div className="w-full">
          <StatsCards />
        </div>

        {/* Fila 3: Acciones Rápidas y Feed de Actividad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel Izquierdo: Acciones Rápidas */}
          <div className="w-full">
            <QuickActions />
          </div>

          {/* Panel Derecho: Feed de Actividad */}
          <div className="w-full">
            <ActivityFeed />
          </div>
        </div>

        {/* Fila 4: Información Adicional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card de Tips */}
          <div className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-60"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #002B68 0%, #1a4c8c 100%)'
                  }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 font-brand">Tip del Día</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed font-secondary">
                Utiliza los filtros en las tablas para encontrar información específica más rápidamente. 
                Presiona <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl+F</kbd> para buscar dentro de la página actual.
              </p>
            </div>
          </div>

          {/* Card de Soporte */}
          <div className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-amber-50 opacity-60"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #E8DB1B 0%, #d4c800 100%)'
                  }}
                >
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 font-brand">Soporte</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed font-secondary">
                ¿Necesitas ayuda? Contacta al equipo de soporte técnico:
                <br />
                <span className="inline-flex items-center gap-1 mt-2">
                  <span className="text-lg">📧</span>
                  <a href="mailto:ssorich@minoil.com.bo" className="text-blue-600 hover:text-blue-800 font-medium">
                    ssorich@minoil.com.bo
                  </a>
                </span>
                <br />
                <span className="inline-flex items-center gap-1">
                  <span className="text-lg">📞</span>
                  <a href="tel:+59168682046" className="text-blue-600 hover:text-blue-800 font-medium">
                    +591 68682046
                  </a>
                </span>
              </p>
            </div>
          </div>

          {/* Card de Versión */}
          <div className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-slate-50 opacity-60"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #19202a 0%, #2a3441 100%)'
                  }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 font-brand">Sistema</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed font-secondary">
                <span className="font-semibold text-gray-900">BPMS MINOIL v1.0.0</span>
                <br />
                <span className="inline-flex items-center gap-2 mt-2">
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{backgroundColor: '#10b981'}}
                  ></span>
                  <span className="font-medium text-green-700">Sistema operativo</span>
                </span>
                <br />
                <span className="text-gray-600">Última actualización: Hoy</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer del Dashboard */}
        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 font-secondary">
            © 2025 MINOIL S.A - Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
} 