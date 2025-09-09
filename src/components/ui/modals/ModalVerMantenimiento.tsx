import { X, Calendar, User, Building, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../base'
import type { Mantenimiento } from '../../../services'

interface ModalVerMantenimientoProps {
  mantenimiento: Mantenimiento | null
  isOpen: boolean
  onClose: () => void
}

export function ModalVerMantenimiento({ mantenimiento, isOpen, onClose }: ModalVerMantenimientoProps) {
  if (!isOpen || !mantenimiento) {
    console.log('Modal no se abre:', { isOpen, mantenimiento: !!mantenimiento });
    return null;
  }

  // Debug: mostrar los datos del mantenimiento
  console.log('Datos del mantenimiento en el modal:', mantenimiento)

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'EXCELENTE':
        return 'bg-green-100 text-green-800'
      case 'BUENO':
        return 'bg-blue-100 text-blue-800'
      case 'REGULAR':
        return 'bg-yellow-100 text-yellow-800'
      case 'MALO':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'EXCELENTE':
      case 'BUENO':
        return <CheckCircle className="w-4 h-4" />
      case 'REGULAR':
      case 'MALO':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalles del Mantenimiento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Información General</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Visita</p>
                      <p className="font-medium">{new Date(mantenimiento.fechaVisita).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Cliente</p>
                      <p className="font-medium">{mantenimiento.clienteCodigo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Chopera</p>
                      <p className="font-medium">{mantenimiento.itemCode} - {mantenimiento.choperaCode}</p>
                      <p className="text-xs text-gray-400">{mantenimiento.chopera?.itemName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Técnico Responsable</p>
                      <p className="font-medium">
                        {mantenimiento.usuario?.nombre || 'N/A'} {mantenimiento.usuario?.apellido || ''}
                      </p>
                      <p className="text-xs text-gray-400">
                        Creado el {new Date(mantenimiento.createdAt).toLocaleDateString()} a las {new Date(mantenimiento.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Estado y Tipo</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Estado General</p>
                    <span className={`px-3 py-1 text-sm rounded-full flex items-center gap-2 w-fit ${getEstadoColor(mantenimiento.estadoGeneral)}`}>
                      {getEstadoIcon(mantenimiento.estadoGeneral)}
                      {mantenimiento.estadoGeneral}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tipo de Mantenimiento</p>
                    <p className="font-medium">
                      {mantenimiento.tipoMantenimiento?.nombre || 
                       (mantenimiento.tipoMantenimientoId === 1 ? 'Preventivo' :
                        mantenimiento.tipoMantenimientoId === 2 ? 'Correctivo' :
                        mantenimiento.tipoMantenimientoId === 3 ? 'Emergencia' : 'Desconocido')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fecha de Creación</p>
                    <p className="font-medium">{new Date(mantenimiento.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comentarios */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Comentarios</h3>
            
            {mantenimiento.comentarioEstado && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Estado del Equipo</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{mantenimiento.comentarioEstado}</p>
                </div>
              </div>
            )}

            {mantenimiento.comentarioCalidadCerveza && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Calidad de Cerveza</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{mantenimiento.comentarioCalidadCerveza}</p>
                </div>
              </div>
            )}
          </div>

          {/* Checklist */}
          {mantenimiento.respuestasChecklist && mantenimiento.respuestasChecklist.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Checklist</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mantenimiento.respuestasChecklist.map((respuesta, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{respuesta.item?.nombre || `Item ${respuesta.itemId}`}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        respuesta.valor === 'SI' ? 'bg-green-100 text-green-800' : 
                        respuesta.valor === 'NO' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {respuesta.valor === 'SI' ? '✓ SÍ' : respuesta.valor === 'NO' ? '✗ NO' : respuesta.valor || 'No especificado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Análisis Sensorial */}
          {mantenimiento.respuestasSensorial && mantenimiento.respuestasSensorial.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Análisis Sensorial</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3">
                  {mantenimiento.respuestasSensorial.map((respuesta, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">
                          Grifo {respuesta.grifo || 'N/A'} - {respuesta.cerveza || 'N/A'}
                        </span>
                        <p className="text-xs text-gray-500">{respuesta.criterio || 'Sin criterio especificado'}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        respuesta.valor === 'EXCELENTE' ? 'bg-green-100 text-green-800' : 
                        respuesta.valor === 'BUENO' ? 'bg-blue-100 text-blue-800' : 
                        respuesta.valor === 'REGULAR' ? 'bg-yellow-100 text-yellow-800' : 
                        respuesta.valor === 'MALO' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {respuesta.valor || 'No especificado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
