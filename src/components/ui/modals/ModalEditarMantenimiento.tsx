import { useState, useEffect } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { Button } from '../base'
import { SelectChoperas, SelectClientes } from '../selects'
import { mantenimientosService } from '../../../services'
import { useToastContext } from '../../../contexts/ToastContext'
import type { Mantenimiento } from '../../../services'

interface ModalEditarMantenimientoProps {
  mantenimiento: Mantenimiento | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function ModalEditarMantenimiento({ mantenimiento, isOpen, onClose, onUpdate }: ModalEditarMantenimientoProps) {
  const { showSuccess, showError } = useToastContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fechaVisita: '',
    tipoMantenimientoId: 1,
    estadoGeneral: 'BUENO',
    comentarioEstado: '',
    comentarioCalidadCerveza: ''
  })

  // Actualizar formData cuando cambia el mantenimiento
  useEffect(() => {
    if (mantenimiento) {
      console.log('Cargando datos del mantenimiento para editar:', mantenimiento)
      setFormData({
        fechaVisita: mantenimiento.fechaVisita ? new Date(mantenimiento.fechaVisita).toISOString().split('T')[0] : '',
        tipoMantenimientoId: mantenimiento.tipoMantenimientoId || 1,
        estadoGeneral: mantenimiento.estadoGeneral || 'BUENO',
        comentarioEstado: mantenimiento.comentarioEstado || '',
        comentarioCalidadCerveza: mantenimiento.comentarioCalidadCerveza || ''
      })
      console.log('FormData actualizado:', formData)
    }
  }, [mantenimiento])

  if (!isOpen || !mantenimiento) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      await mantenimientosService.updateMantenimiento(mantenimiento.id, formData)
      
      showSuccess(
        'Mantenimiento actualizado',
        'El mantenimiento se ha actualizado correctamente.',
        3000
      )
      
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error actualizando mantenimiento:', error)
      showError(
        'Error al actualizar',
        'No se pudo actualizar el mantenimiento. Intente nuevamente.',
        5000
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Editar Mantenimiento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha de Visita */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Visita *
              </label>
              <input
                type="date"
                value={formData.fechaVisita}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaVisita: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Tipo de Mantenimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Mantenimiento *
              </label>
              <select
                value={formData.tipoMantenimientoId}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoMantenimientoId: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={1}>Preventivo</option>
                <option value={2}>Correctivo</option>
                <option value={3}>Emergencia</option>
              </select>
            </div>

            {/* Estado General */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado General *
              </label>
              <select
                value={formData.estadoGeneral}
                onChange={(e) => setFormData(prev => ({ ...prev, estadoGeneral: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="EXCELENTE">Excelente</option>
                <option value="BUENO">Bueno</option>
                <option value="REGULAR">Regular</option>
                <option value="MALO">Malo</option>
              </select>
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {mantenimiento.clienteCodigo || 'Sin cliente asignado'}
              </div>
            </div>

            {/* Chopera */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chopera *
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {mantenimiento.chopera?.itemCode || 'Sin chopera asignada'} - {mantenimiento.chopera?.serieActivo || 'Sin serie'}
              </div>
            </div>
          </div>

          {/* Comentarios */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios del Estado *
              </label>
              <textarea
                value={formData.comentarioEstado}
                onChange={(e) => setFormData(prev => ({ ...prev, comentarioEstado: e.target.value }))}
                rows={4}
                placeholder="Describe el estado general de los equipos, problemas encontrados, acciones realizadas, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios de Calidad de Cerveza
              </label>
              <textarea
                value={formData.comentarioCalidadCerveza}
                onChange={(e) => setFormData(prev => ({ ...prev, comentarioCalidadCerveza: e.target.value }))}
                rows={4}
                placeholder="Describe la calidad de la cerveza, temperatura, sabor, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 text-white bg-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 " />
                  Actualizar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
