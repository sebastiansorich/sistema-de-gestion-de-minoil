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
  FileText
} from "lucide-react";
import { Button } from "../../components/ui";
import Breadcrumb from "../../components/ui/navigation/Breadcrumb";
import { mantenimientosService } from "../../services";
import type { DashboardStats, Mantenimiento } from "../../services";

export default function MantenimientosDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMantenimientos, setRecentMantenimientos] = useState<Mantenimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [statsData, mantenimientosData] = await Promise.all([
        mantenimientosService.getDashboardStats(),
        mantenimientosService.getMantenimientos({ limit: 5 })
      ]);
      
      setStats(statsData);
      setRecentMantenimientos(mantenimientosData);
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadDashboardData();
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
      alert('Error al exportar los datos');
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
              onClick={handleExport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
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
        ) : (
          <div className="divide-y">
            {recentMantenimientos.map((mantenimiento) => (
              <div key={mantenimiento.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        Cliente: {mantenimiento.clienteCodigo} - Chopera ID: {mantenimiento.choperaId}
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
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Nuevo Mantenimiento</h3>
              <p className="text-blue-100 mb-4">Crear un nuevo registro de mantenimiento</p>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => navigate('/bendita/mantenimientos/nuevo')}
              >
                Crear
              </Button>
            </div>
            <Plus className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Reportes</h3>
              <p className="text-green-100 mb-4">Ver todos los mantenimientos y reportes</p>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => navigate('/bendita/mantenimientos/lista')}
              >
                Ver Reportes
              </Button>
            </div>
            <FileText className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
