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
                    <p className="text-gray-900 font-mono">{chopera.itemCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-gray-900">{chopera.status}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Nombre del Artículo</label>
                    <p className="text-gray-900 font-medium">{chopera.itemName}</p>
                  </div>
                </div>
              </div>

              {/* Ubicación y Serie */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ubicación y Serie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ciudad</label>
                    <p className="text-gray-900">{chopera.ciudad || 'No especificada'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Serie/Activo</label>
                    <p className="text-gray-900 font-mono">{chopera.serieActivo || 'Sin serie'}</p>
                  </div>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Código del Cliente</label>
                    <p className="text-gray-900">{chopera.cardCode || 'Sin código'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre del Cliente</label>
                    <p className="text-gray-900">{chopera.cardName || 'Sin nombre'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Alias</label>
                    <p className="text-gray-900">{chopera.aliasName || 'Sin alias'}</p>
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