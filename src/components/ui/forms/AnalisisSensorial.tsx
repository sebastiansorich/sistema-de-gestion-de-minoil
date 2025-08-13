import React, { useState } from 'react';
import { Button } from '../base/button';
import { Star, Plus, Trash2, Beer } from 'lucide-react';

export interface AnalisisSensorialData {
  grifos: {
    id: string;
    numero: string;
    tipoCerveza: string;
    apariencia: number;
    aroma: number;
    sabor: number;
    textura: number;
    temperatura: number;
    observaciones: string;
  }[];
}

interface AnalisisSensorialProps {
  data: AnalisisSensorialData;
  onChange: (data: AnalisisSensorialData) => void;
  disabled?: boolean;
}

const tiposCerveza = [
  'Lager',
  'Pilsner',
  'IPA',
  'Stout',
  'Porter',
  'Wheat Beer',
  'Ale',
  'Pale Ale',
  'Amber Ale',
  'Brown Ale',
  'Otro'
];

const AnalisisSensorial: React.FC<AnalisisSensorialProps> = ({
  data,
  onChange,
  disabled = false
}) => {
  const [grifos, setGrifos] = useState(data.grifos || []);

  const addGrifo = () => {
    const newGrifo = {
      id: `grifo-${Date.now()}`,
      numero: '',
      tipoCerveza: '',
      apariencia: 0,
      aroma: 0,
      sabor: 0,
      textura: 0,
      temperatura: 0,
      observaciones: ''
    };
    
    const updatedGrifos = [...grifos, newGrifo];
    setGrifos(updatedGrifos);
    onChange({ grifos: updatedGrifos });
  };

  const removeGrifo = (id: string) => {
    const updatedGrifos = grifos.filter(grifo => grifo.id !== id);
    setGrifos(updatedGrifos);
    onChange({ grifos: updatedGrifos });
  };

  const updateGrifo = (id: string, field: string, value: any) => {
    const updatedGrifos = grifos.map(grifo => 
      grifo.id === id ? { ...grifo, [field]: value } : grifo
    );
    setGrifos(updatedGrifos);
    onChange({ grifos: updatedGrifos });
  };

  const renderStars = (value: number, onChange: (value: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            disabled={disabled}
            className={`p-1 transition-colors ${
              star <= value 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const getPromedioGrifo = (grifo: any) => {
    const valores = [grifo.apariencia, grifo.aroma, grifo.sabor, grifo.textura, grifo.temperatura];
    const promedio = valores.reduce((sum, val) => sum + val, 0) / valores.length;
    return promedio.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Beer className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Análisis Sensorial por Grifo
          </h3>
        </div>
        <Button
          type="button"
          onClick={addGrifo}
          disabled={disabled}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Grifo
        </Button>
      </div>

      {grifos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Beer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No hay grifos agregados</p>
          <p className="text-sm">Haz clic en "Agregar Grifo" para comenzar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grifos.map((grifo, index) => (
            <div key={grifo.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">
                  Grifo #{index + 1}
                </h4>
                <Button
                  type="button"
                  onClick={() => removeGrifo(grifo.id)}
                  disabled={disabled}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Información básica */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Grifo
                    </label>
                    <input
                      type="text"
                      value={grifo.numero}
                      onChange={(e) => updateGrifo(grifo.id, 'numero', e.target.value)}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: G01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Cerveza
                    </label>
                    <select
                      value={grifo.tipoCerveza}
                      onChange={(e) => updateGrifo(grifo.id, 'tipoCerveza', e.target.value)}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar tipo</option>
                      {tiposCerveza.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Evaluación sensorial */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apariencia
                      </label>
                      {renderStars(grifo.apariencia, (value) => updateGrifo(grifo.id, 'apariencia', value))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aroma
                      </label>
                      {renderStars(grifo.aroma, (value) => updateGrifo(grifo.id, 'aroma', value))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sabor
                      </label>
                      {renderStars(grifo.sabor, (value) => updateGrifo(grifo.id, 'sabor', value))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Textura
                      </label>
                      {renderStars(grifo.textura, (value) => updateGrifo(grifo.id, 'textura', value))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperatura
                    </label>
                    {renderStars(grifo.temperatura, (value) => updateGrifo(grifo.id, 'temperatura', value))}
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={grifo.observaciones}
                  onChange={(e) => updateGrifo(grifo.id, 'observaciones', e.target.value)}
                  disabled={disabled}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observaciones adicionales sobre este grifo..."
                />
              </div>

              {/* Promedio */}
              <div className="mt-3 flex justify-end">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Promedio: </span>
                  <span className="text-blue-600 font-semibold">
                    {getPromedioGrifo(grifo)}/5
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen general */}
      {grifos.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Resumen del Análisis</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total Grifos: </span>
              <span className="font-semibold text-blue-900">{grifos.length}</span>
            </div>
            <div>
              <span className="text-blue-700">Promedio General: </span>
              <span className="font-semibold text-blue-900">
                {(grifos.reduce((sum, grifo) => sum + parseFloat(getPromedioGrifo(grifo)), 0) / grifos.length).toFixed(1)}/5
              </span>
            </div>
            <div>
              <span className="text-blue-700">Mejor Evaluado: </span>
              <span className="font-semibold text-blue-900">
                {grifos.length > 0 ? grifos.reduce((best, current) => 
                  parseFloat(getPromedioGrifo(current)) > parseFloat(getPromedioGrifo(best)) ? current : best
                ).numero || 'N/A' : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Tipos Evaluados: </span>
              <span className="font-semibold text-blue-900">
                {new Set(grifos.map(g => g.tipoCerveza).filter(t => t)).size}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalisisSensorial;
