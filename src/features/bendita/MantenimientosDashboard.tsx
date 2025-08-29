import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Loader2,
  FileText,
  Wrench
} from "lucide-react";
import { Button } from "../../components/ui";
import Breadcrumb from "../../components/ui/navigation/Breadcrumb";
import { mantenimientosService } from "../../services";
import { useToastContext } from "../../contexts/ToastContext";
import { ModalVerMantenimiento, ModalEditarMantenimiento } from "../../components/ui/modals";
import type { DashboardStats, Mantenimiento } from "../../services";

export default function MantenimientosDashboard() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToastContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMantenimientos, setRecentMantenimientos] = useState<Mantenimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<Mantenimiento | null>(null);
  const [isVerModalOpen, setIsVerModalOpen] = useState(false);
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Obtener datos reales de mantenimientos
      const mantenimientosData = await mantenimientosService.getMantenimientos({ limit: 100 });
      
      // Calcular estadísticas basadas en datos reales
      const statsCalculadas = calcularStatsReales(mantenimientosData);
      setStats(statsCalculadas);
      setRecentMantenimientos(mantenimientosData.slice(0, 5)); // Solo los 5 más recientes
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
      setError('Error al cargar los datos del dashboard');
      showError(
        'Error al cargar datos',
        'No se pudieron cargar los datos del dashboard. Intente refrescar la página.',
        5000
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calcularStatsReales = (mantenimientos: Mantenimiento[]): DashboardStats => {
    const hoy = new Date().toISOString().split('T')[0];
    const mantenimientosHoy = mantenimientos.filter(m => 
      m.fechaVisita.startsWith(hoy)
    ).length;
    
    const mantenimientosCompletados = mantenimientos.length;
    const mantenimientosPendientes = 0; // Por ahora, todos los mantenimientos registrados están completados
    const mantenimientosCancelados = 0; // Por ahora no hay cancelados
    
    // Calcular promedio de tiempo (mock por ahora)
    const promedioTiempo = mantenimientos.length > 0 ? 2.5 : 0;
    
    // Generar tendencia semanal basada en datos reales
    const tendenciaSemanal = generarTendenciaSemanal(mantenimientos);
    
    return {
      mantenimientosHoy,
      mantenimientosPendientes,
      mantenimientosCompletados,
      mantenimientosCancelados,
      promedioTiempo,
      tendenciaSemanal
    };
  };

  const generarTendenciaSemanal = (mantenimientos: Mantenimiento[]) => {
    const hoy = new Date();
    const tendencia = [];
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const mantenimientosDelDia = mantenimientos.filter(m => 
        m.fechaVisita.startsWith(fechaStr)
      );
      
      tendencia.push({
        fecha: fechaStr,
        completados: mantenimientosDelDia.length,
        pendientes: 0 // Por ahora no hay pendientes
      });
    }
    
    return tendencia;
  };

  const handleRefresh = async () => {
    try {
      await loadDashboardData();
      showSuccess(
        'Datos actualizados',
        'El dashboard se ha actualizado correctamente.',
        3000
      );
    } catch (err) {
      showError(
        'Error al actualizar',
        'No se pudieron actualizar los datos del dashboard.',
        5000
      );
    }
  };

  const handleExport = async () => {
    try {
      const blob = await mantenimientosService.exportMantenimientos('excel');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mantenimientos_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exportando:', err);
      showError(
        'Error al exportar',
        'No se pudo exportar el archivo. Intente nuevamente.',
        5000
      );
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'EXCELENTE':
        return 'bg-green-100 text-green-800';
      case 'BUENO':
        return 'bg-blue-100 text-blue-800';
      case 'REGULAR':
        return 'bg-yellow-100 text-yellow-800';
      case 'MALO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'EXCELENTE':
        return <CheckCircle className="w-4 h-4" />;
      case 'BUENO':
        return <CheckCircle className="w-4 h-4" />;
      case 'REGULAR':
        return <AlertCircle className="w-4 h-4" />;
      case 'MALO':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <Button 
            onClick={loadDashboardData} 
            className="ml-4"
            variant="outline"
            size="sm"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con Breadcrumb */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between">
          
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
           
            <Button
               onClick={() => navigate('/bendita/mantenimientos/nuevo')}
               className="flex items-center gap-2 bg-amber-200"
             >
               <Plus className="w-4 h-4" />
               Nuevo
             </Button>

          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
  {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.mantenimientosHoy}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.mantenimientosPendientes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.mantenimientosCompletados}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Promedio (hrs)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.promedioTiempo}</p>
              </div>
            </div>
          </div>
        </div>
      )} 
      {/* Gráfico de tendencias */}
      {stats && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tendencia Semanal</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          {stats.tendenciaSemanal.some(item => item.completados > 0 || item.pendientes > 0) ? (
            <>
              <div className="h-64 flex items-end justify-between space-x-2">
                {stats.tendenciaSemanal.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-200 rounded-t">
                      <div 
                        className="bg-blue-500 rounded-t transition-all duration-300"
                        style={{ 
                          height: `${(item.completados / Math.max(...stats.tendenciaSemanal.map(d => d.completados))) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="w-full bg-gray-200 rounded-b mt-1">
                      <div 
                        className="bg-yellow-500 rounded-b transition-all duration-300"
                        style={{ 
                          height: `${(item.pendientes / Math.max(...stats.tendenciaSemanal.map(d => d.pendientes))) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {new Date(item.fecha).toLocaleDateString('es-ES', { weekday: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Completados</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Pendientes</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay datos de mantenimientos para mostrar</p>
                <p className="text-sm text-gray-400">Aún no se han registrado mantenimientos</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mantenimientos recientes */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Mantenimientos Recientes</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar mantenimientos..."
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando mantenimientos...</span>
          </div>
        ) : recentMantenimientos.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay mantenimientos registrados</p>
              <p className="text-sm text-gray-400 mb-4">Aún no se han registrado mantenimientos</p>
              <Button
                onClick={() => navigate('/bendita/mantenimientos/nuevo')}
                className="flex items-center gap-2 text-white"
              >
                <Plus className="w-4 h-4" />
                Registrar primer mantenimiento
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {recentMantenimientos.map((mantenimiento) => (
              <div key={mantenimiento.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        Cliente: {mantenimiento.clienteCodigo} - Chopera: {mantenimiento.choperaId}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getEstadoColor(mantenimiento.estadoGeneral)}`}>
                        {getEstadoIcon(mantenimiento.estadoGeneral)}
                        {mantenimiento.estadoGeneral}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(mantenimiento.fechaVisita).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        {mantenimiento.tipoMantenimiento.nombre}
                      </span>
                      <span>Técnico: {mantenimiento.usuario.nombre} {mantenimiento.usuario.apellido}</span>
                    </div>
                    
                    {mantenimiento.comentarioEstado && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {mantenimiento.comentarioEstado}
                      </p>
                    )}
                  </div>
                  
                                     <div className="flex gap-2 ml-4">
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => {
                         console.log('Abriendo modal para mantenimiento:', mantenimiento);
                         setSelectedMantenimiento(mantenimiento);
                         setIsVerModalOpen(true);
                       }}
                     >
                       Ver
                     </Button>
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => {
                         setSelectedMantenimiento(mantenimiento);
                         setIsEditarModalOpen(true);
                       }}
                     >
                       Editar
                     </Button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

       {/* Modales */}
       <ModalVerMantenimiento
         mantenimiento={selectedMantenimiento}
         isOpen={isVerModalOpen}
         onClose={() => {
           setIsVerModalOpen(false);
           setSelectedMantenimiento(null);
         }}
       />

       <ModalEditarMantenimiento
         mantenimiento={selectedMantenimiento}
         isOpen={isEditarModalOpen}
         onClose={() => {
           setIsEditarModalOpen(false);
           setSelectedMantenimiento(null);
         }}
         onUpdate={() => {
           loadDashboardData();
         }}
       />
     </div>
   );
 }
