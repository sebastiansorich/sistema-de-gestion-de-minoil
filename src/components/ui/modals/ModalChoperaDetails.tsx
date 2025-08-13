import React from 'react';
import { X, Package, Building, MapPin, Calendar, DollarSign, Info } from 'lucide-react';
import { Button } from '../base/button';
import { Dialog } from '../base/dialog';
import type { Chopera } from '../../../services/choperasService';

interface ModalChoperaDetailsProps {
  open: boolean;
  onClose: () => void;
  chopera: Chopera | null;
}

export default function ModalChoperaDetails({ open, onClose, chopera }: ModalChoperaDetailsProps) {
  if (!chopera) return null;

  const formatCurrency = (value: number) => {
    return value > 0 ? `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : 'No disponible';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Detalles de Chopera</h2>
                <p className="text-sm text-gray-600">Información completa del equipo</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="space-y-6">
              {/* Información Principal */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Información Principal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Código de Artículo</label>
                    <p className="text-gray-900 font-mono">{chopera.ItemCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo de Artículo</label>
                    <p className="text-gray-900">{chopera.ItemType}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Nombre del Artículo</label>
                    <p className="text-gray-900 font-medium">{chopera.ItemName}</p>
                  </div>
                </div>
              </div>

              {/* Información de Inventario */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Información de Inventario
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Artículo de Inventario</label>
                    <p className="text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        chopera.InvntItem === 'Y' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {chopera.InvntItem === 'Y' ? 'Sí' : 'No'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Artículo de Venta</label>
                    <p className="text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        chopera.SellItem === 'Y' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {chopera.SellItem === 'Y' ? 'Sí' : 'No'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Artículo de Compra</label>
                    <p className="text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        chopera.PrchseItem === 'Y' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {chopera.PrchseItem === 'Y' ? 'Sí' : 'No'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Grupo y Clasificación */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Grupo y Clasificación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Código de Grupo</label>
                    <p className="text-gray-900">{chopera.ItmsGrpCod}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre del Grupo</label>
                    <p className="text-gray-900">{chopera.ItmsGrpNam}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Grupo de Consulta 1</label>
                    <p className="text-gray-900">{chopera.QryGroup1}</p>
                  </div>
                </div>
              </div>

              {/* Unidades de Medida */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Unidades de Medida</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Unidad de Venta</label>
                    <p className="text-gray-900 font-mono">{chopera.SalUnitMsr}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Unidad de Compra</label>
                    <p className="text-gray-900 font-mono">{chopera.PurUnitMsr}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Unidad de Inventario</label>
                    <p className="text-gray-900 font-mono">{chopera.InvntryUom}</p>
                  </div>
                </div>
              </div>

              {/* Precios */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Información de Precios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Último Precio de Compra</label>
                    <p className="text-gray-900 font-mono text-lg">{formatCurrency(chopera.LastPurPrc)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Precio Promedio</label>
                    <p className="text-gray-900 font-mono text-lg">{formatCurrency(chopera.AvgPrice)}</p>
                  </div>
                </div>
              </div>

              {/* Ubicación y Estado */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ubicación y Estado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ubicación</label>
                    <p className="text-gray-900">{chopera.U_Ubicacion || 'No especificada'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <p className="text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        chopera.U_Estado 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {chopera.U_Estado || 'Sin estado'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Proveedor */}
              {(chopera.FirmCode > 0 || chopera.FirmName) && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Información de Proveedor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Código de Proveedor</label>
                      <p className="text-gray-900">{chopera.FirmCode || 'No asignado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre de Proveedor</label>
                      <p className="text-gray-900">{chopera.FirmName || 'No asignado'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fechas Importantes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                    <p className="text-gray-900">{formatDate(chopera.CreateDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Última Actualización</label>
                    <p className="text-gray-900">{formatDate(chopera.UpdateDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t bg-gray-50">
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}