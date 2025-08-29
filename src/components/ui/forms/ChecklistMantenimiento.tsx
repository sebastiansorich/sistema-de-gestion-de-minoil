import React from 'react';
import { CheckCircle, Circle, AlertTriangle } from 'lucide-react';
import type { ChecklistMantenimiento } from '../../../services/mantenimientosService';

interface ChecklistMantenimientoProps {
  checklist: ChecklistMantenimiento;
  onChange: (checklist: ChecklistMantenimiento) => void;
  disabled?: boolean;
}

const checklistItems = {
  limpieza: {
    title: 'Limpieza',
    icon: '🧹',
    items: [
      { key: 'grifos', label: 'Desarmado y Limpieza de Grifos' },
      { key: 'tuberias', label: 'Limpieza general del área y del equipo' },
      { key: 'tanque', label: 'Pasada de soda cáustica (solución adecuada)' },
      { key: 'conexiones', label: 'Aplicación de desinfectante autorizado' }
    ]
  },
  funcionamiento: {
    title: 'Funcionamiento',
    icon: '⚙️',
    items: [
      { key: 'presion', label: 'Confirmar que todos los componentes están correctamente armados y ajustados' },
      { key: 'temperatura', label: 'Revisar que no haya residuos o restos de productos químicos en el sistema' },
      { key: 'flujo', label: 'Verificación de la temperatura de la cerveza en el punto de servicio' },
      { key: 'valvulas', label: 'Comprobación del funcionamiento correcto de los grifos y sistema de enfriamiento' }
    ]
  },
  seguridad: {
    title: 'Seguridad',
    icon: '🛡️',
    items: [
      { key: 'fugas', label: 'Sin fugas de gas o líquidos' },
      { key: 'conexionesElectricas', label: 'Conexiones eléctricas seguras' },
      { key: 'estabilidad', label: 'Equipo estable y fijo' }
    ]
  }
};

export default function ChecklistMantenimientoComponent({ 
  checklist, 
  onChange, 
  disabled = false 
}: ChecklistMantenimientoProps) {
  
  const handleToggle = (category: keyof ChecklistMantenimiento, item: string) => {
    if (disabled) return;
    
    const newChecklist = {
      ...checklist,
      [category]: {
        ...checklist[category],
        [item]: !checklist[category][item as keyof typeof checklist[typeof category]]
      }
    };
    
    onChange(newChecklist);
  };

  const getCategoryProgress = (category: keyof ChecklistMantenimiento) => {
    const items = Object.values(checklist[category]);
    const completed = items.filter(Boolean).length;
    const total = items.length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const getOverallProgress = () => {
    const categories = Object.keys(checklist) as (keyof ChecklistMantenimiento)[];
    const totalItems = categories.reduce((sum, category) => {
      return sum + Object.keys(checklist[category]).length;
    }, 0);
    
    const completedItems = categories.reduce((sum, category) => {
      return sum + Object.values(checklist[category]).filter(Boolean).length;
    }, 0);
    
    return { completed: completedItems, total: totalItems, percentage: (completedItems / totalItems) * 100 };
  };

  const overallProgress = getOverallProgress();

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Progreso General</h3>
          <span className="text-sm font-medium text-gray-600">
            {overallProgress.completed} de {overallProgress.total} completados
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress.percentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {Math.round(overallProgress.percentage)}% completado
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {Object.entries(checklistItems).map(([categoryKey, category]) => {
          const progress = getCategoryProgress(categoryKey as keyof ChecklistMantenimiento);
          
          return (
            <div key={categoryKey} className="bg-white rounded-lg border overflow-hidden">
              {/* Category Header */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-600">
                        {progress.completed} de {progress.total} items completados
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {progress.percentage === 100 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : progress.percentage > 0 ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-600">
                      {Math.round(progress.percentage)}%
                    </span>
                  </div>
                </div>
                
                {/* Category Progress Bar */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress.percentage === 100 
                        ? 'bg-green-500' 
                        : progress.percentage > 0 
                        ? 'bg-yellow-500' 
                        : 'bg-gray-300'
                    }`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="p-6">
                <div className="space-y-3">
                  {category.items.map((item) => {
                    const isChecked = checklist[categoryKey as keyof ChecklistMantenimiento][item.key as keyof typeof checklist[typeof categoryKey]];
                    
                    return (
                      <div 
                        key={item.key}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isChecked 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        } ${disabled ? 'cursor-not-allowed' : ''}`}
                        onClick={() => handleToggle(categoryKey as keyof ChecklistMantenimiento, item.key)}
                      >
                        <div className="flex-shrink-0">
                          {isChecked ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <span className={`text-sm font-medium ${
                          isChecked ? 'text-green-800' : 'text-gray-700'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Resumen del Checklist</h4>
        </div>
        <p className="text-sm text-blue-800">
          {overallProgress.completed === overallProgress.total 
            ? '¡Excelente! Todos los items del checklist han sido completados.'
            : `Faltan ${overallProgress.total - overallProgress.completed} items por completar.`
          }
        </p>
      </div>
    </div>
  );
}
