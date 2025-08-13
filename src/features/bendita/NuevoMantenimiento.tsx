import { useState } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Camera, 
  Upload, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "../../components/ui";
import Breadcrumb from "../../components/ui/navigation/Breadcrumb";
import ChecklistMantenimientoComponent from "../../components/ui/forms/ChecklistMantenimiento";
import AnalisisSensorialComponent from "../../components/ui/forms/AnalisisSensorial";
import { SelectChoperas } from "../../components/ui/selects";
import { mantenimientosService } from "../../services";
import type { MantenimientoFormData, ChecklistMantenimiento } from "../../services";
import type { AnalisisSensorialData } from "../../components/ui/forms/AnalisisSensorial";

const steps = [
  { id: 1, title: "Información Básica", description: "Datos del cliente y chopera" },
  { id: 2, title: "Checklist", description: "Verificación de equipos" },
  { id: 3, title: "Análisis Sensorial", description: "Evaluación de cerveza" },
  { id: 4, title: "Comentarios y Fotos", description: "Observaciones y evidencia" },
  { id: 5, title: "Revisión", description: "Confirmar y enviar" }
];

const initialFormData: MantenimientoFormData = {
  fechaVisita: new Date().toISOString().split('T')[0],
  clienteCodigo: '',
  choperaId: 0,
  tipoMantenimientoId: 1, // Preventivo por defecto
  estadoGeneral: 'BUENO',
  comentarioEstado: '',
  comentarioCalidadCerveza: '',
  checklist: {
    limpieza: {
      grifos: false,
      tuberias: false,
      tanque: false,
      conexiones: false
    },
    funcionamiento: {
      presion: false,
      temperatura: false,
      flujo: false,
      valvulas: false
    },
    seguridad: {
      fugas: false,
      conexionesElectricas: false,
      estabilidad: false
    }
  },
  analisisSensorial: { grifos: [] },
  fotos: []
};

export default function NuevoMantenimiento() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<MantenimientoFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!formData.fechaVisita) newErrors.fechaVisita = 'La fecha es requerida';
        if (!formData.clienteCodigo) newErrors.clienteCodigo = 'El cliente es requerido';
        if (!formData.choperaId) newErrors.choperaId = 'La chopera es requerida';
        break;
      case 2:
        // Validar que al menos un item del checklist esté completado
        const checklistItems = Object.values(formData.checklist).flatMap(category => Object.values(category));
        if (!checklistItems.some(item => item)) {
          newErrors.checklist = 'Debe completar al menos un item del checklist';
        }
        break;
      case 3:
        // El análisis sensorial es opcional
        break;
      case 4:
        if (!formData.comentarioEstado.trim()) {
          newErrors.comentarioEstado = 'Los comentarios son requeridos';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setIsSubmitting(true);
      
      // Log de depuración para ver qué datos se están enviando
      console.log('Datos a enviar:', formData);
      
      const result = await mantenimientosService.createMantenimiento(formData);
      
      console.log('Respuesta del servidor:', result);
      
      // Mostrar mensaje de éxito y redirigir
      alert('Mantenimiento creado exitosamente');
      // Aquí podrías redirigir al dashboard o lista
    } catch (error) {
      console.error('Error creando mantenimiento:', error);
      
      // Mostrar información más detallada del error
      if (error instanceof Error) {
        alert(`Error al crear el mantenimiento: ${error.message}`);
      } else {
        alert('Error al crear el mantenimiento');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      fotos: [...prev.fotos, ...files]
    }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Mantenimiento *
                </label>
                <input
                  type="date"
                  value={formData.fechaVisita}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechaVisita: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fechaVisita ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fechaVisita && <p className="text-red-500 text-sm mt-1">{errors.fechaVisita}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Mantenimiento *
                </label>
                <select
                  value={formData.tipoMantenimientoId}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tipoMantenimientoId: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Preventivo</option>
                  <option value={2}>Correctivo</option>
                  <option value={3}>Emergencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado General *
                </label>
                <select
                  value={formData.estadoGeneral}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estadoGeneral: e.target.value as 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'MALO'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EXCELENTE">Excelente</option>
                  <option value="BUENO">Bueno</option>
                  <option value="REGULAR">Regular</option>
                  <option value="MALO">Malo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente *
                </label>
                <input
                  type="text"
                  value={formData.clienteCodigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, clienteCodigo: e.target.value }))}
                  placeholder="Código del cliente"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clienteCodigo ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.clienteCodigo && <p className="text-red-500 text-sm mt-1">{errors.clienteCodigo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chopera *
                </label>
                <SelectChoperas
                  value={formData.choperaId || undefined}
                  onChange={(value) => setFormData(prev => ({ ...prev, choperaId: value }))}
                  placeholder="Seleccionar chopera..."
                  className={errors.choperaId ? 'border-red-500' : ''}
                />
                {errors.choperaId && <p className="text-red-500 text-sm mt-1">{errors.choperaId}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <ChecklistMantenimientoComponent
            checklist={formData.checklist}
            onChange={(data) => 
              setFormData(prev => ({ ...prev, checklist: data }))
            }
          />
        );

      case 3:
        return (
          <AnalisisSensorialComponent
            data={formData.analisisSensorial}
            onChange={(data) => 
              setFormData(prev => ({ ...prev, analisisSensorial: data }))
            }
          />
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios del Estado *
              </label>
              <textarea
                value={formData.comentarioEstado}
                onChange={(e) => setFormData(prev => ({ ...prev, comentarioEstado: e.target.value }))}
                rows={4}
                placeholder="Describe el estado general de los equipos, problemas encontrados, acciones realizadas, etc."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.comentarioEstado ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.comentarioEstado && <p className="text-red-500 text-sm mt-1">{errors.comentarioEstado}</p>}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos del Equipo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Haz clic para subir fotos o arrastra archivos aquí
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG hasta 10MB
                  </p>
                </label>
              </div>

              {formData.fotos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Fotos subidas ({formData.fotos.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.fotos.map((foto, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(foto)}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Resumen del Mantenimiento
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Información Básica</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Fecha:</span> {formData.fechaVisita}</p>
                    <p><span className="font-medium">Cliente:</span> {formData.clienteCodigo}</p>
                    <p><span className="font-medium">Chopera ID:</span> {formData.choperaId}</p>
                    <p><span className="font-medium">Tipo ID:</span> {formData.tipoMantenimientoId}</p>
                    <p><span className="font-medium">Estado General:</span> {formData.estadoGeneral}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Checklist Completado</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(formData.checklist).map(([category, items]) => (
                      <div key={category}>
                        <p className="font-medium capitalize">{category}:</p>
                        <p className="text-blue-600">
                          {Object.values(items).filter(Boolean).length} de {Object.keys(items).length} items
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {Object.keys(formData.analisisSensorial).length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-blue-800 mb-2">Análisis Sensorial</h4>
                  <p className="text-sm text-blue-600">
                    {Object.keys(formData.analisisSensorial).length} grifo(s) evaluado(s)
                  </p>
                </div>
              )}

              {formData.comentarioEstado && (
                <div className="mt-4">
                  <h4 className="font-medium text-blue-800 mb-2">Comentarios del Estado</h4>
                  <p className="text-sm text-blue-600">{formData.comentarioEstado}</p>
                </div>
              )}

              {formData.comentarioCalidadCerveza && (
                <div className="mt-4">
                  <h4 className="font-medium text-blue-800 mb-2">Comentarios de Calidad</h4>
                  <p className="text-sm text-blue-600">{formData.comentarioCalidadCerveza}</p>
                </div>
              )}

              {formData.fotos.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-blue-800 mb-2">Fotos</h4>
                  <p className="text-sm text-blue-600">{formData.fotos.length} foto(s) adjunta(s)</p>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">
                    Confirmar Envío
                  </h4>
                  <p className="text-sm text-yellow-800">
                    Al hacer clic en "Crear Mantenimiento", se guardará toda la información y se enviará al sistema.
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header con Breadcrumb */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between">

        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="font-medium">{step.id}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-gray-600">{steps[currentStep - 1].description}</p>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2 text-white"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    Registrar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
