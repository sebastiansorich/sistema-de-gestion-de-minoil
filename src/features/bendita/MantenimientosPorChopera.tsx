import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Plus,

  Filter,
  Search,
  Calendar,

  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Loader2,

  ArrowLeft,
  Package,
  Wrench,
  Trash2
} from "lucide-react";
import { Button } from "../../components/ui";
import Breadcrumb from "../../components/ui/navigation/Breadcrumb";
import { mantenimientosService, choperasService } from "../../services";
import { useToastContext } from "../../contexts/ToastContext";
import { ModalVerMantenimiento, ModalEditarMantenimiento, ModalConfirm } from "../../components/ui/modals";
import type { Mantenimiento, Chopera } from "../../services";

// Interfaz para estadísticas específicas de una chopera
interface ChoperaStats {
  mantenimientosHoy: number;
  mantenimientosPendientes: number;
  mantenimientosCompletados: number;
  mantenimientosCancelados: number;
  promedioTiempo: number;
  mantenimientosPorMes: {
    mes: string;
    año: number;
    completados: number;
    preventivos: number;
    correctivos: number;
    mantenimientosDetalle: {
      id: number;
      fecha: string;
      cliente: string;
      tipo: string;
      estado: string;
      tecnico: string;
    }[];
  }[];
}

export default function MantenimientosPorChopera() {
  const navigate = useNavigate();
  const { itemCode } = useParams<{ itemCode: string }>();
  const [searchParams] = useSearchParams();
  const serieActivo = searchParams.get('serieActivo');
  const { showError, showSuccess } = useToastContext();

  const [chopera, setChopera] = useState<Chopera | null>(null);
  const [stats, setStats] = useState<ChoperaStats | null>(null);
  const [recentMantenimientos, setRecentMantenimientos] = useState<Mantenimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<Mantenimiento | null>(null);
  const [isVerModalOpen, setIsVerModalOpen] = useState(false);
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  
  // Estados para modal de confirmación de eliminación
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmData, setConfirmData] = useState({
    title: '',
    description: '',
    operation: 'generic' as 'delete' | 'edit' | 'create' | 'generic',
    entityName: '',
    isLoading: false
  });

  // Función para obtener el cliente usando el endpoint de búsqueda
  const getClienteCodigo = (itemCode: string, chopera: Chopera | null): string => {
    // Por ahora, devolver vacío. El formulario se encargará de buscar los datos
    return '';
  };

  useEffect(() => {
           console.log('🔍 DEBUG - useEffect - itemCode recibido:', itemCode);
       console.log('🔍 DEBUG - useEffect - serieActivo recibido:', serieActivo);
       console.log('🔍 DEBUG - useEffect - URL completa:', window.location.href);
    if (itemCode) {
      loadChoperaData();
    }
  }, [itemCode, serieActivo]);

  const loadChoperaData = async () => {
    if (!itemCode) return;

    try {
      setIsLoading(true);
      setError(null);

             // Obtener datos de la chopera y sus mantenimientos
       const [choperaDetalle, mantenimientosData] = await Promise.all([
         choperasService.getChoperaDetalle(itemCode, serieActivo || undefined),
         mantenimientosService.getMantenimientos({ 
           itemCode: itemCode,
           serieActivo: serieActivo || undefined
         })
       ]);

      console.log('🔍 DEBUG - Chopera detalle obtenida:', choperaDetalle);

      // Usar directamente la chopera detalle (ya no necesitamos fallbacks)
      const choperaConCliente = choperaDetalle;

      console.log('🔍 DEBUG - MantenimientosPorChopera - itemCode buscado:', itemCode);
      console.log('🔍 DEBUG - MantenimientosPorChopera - choperaDetalle encontrada:', choperaDetalle);
      console.log('🔍 DEBUG - MantenimientosPorChopera - serieActivo de la chopera detalle:', choperaDetalle?.serieActivo);
      
      // Verificar si se encontró la chopera
      if (!choperaConCliente) {
        throw new Error('Chopera no encontrada');
      }

      console.log('🔍 DEBUG - Chopera encontrada en MantenimientosPorChopera:', choperaConCliente);
      console.log('🔍 DEBUG - cardCode:', choperaConCliente.cardCode);
      console.log('🔍 DEBUG - cardName:', choperaConCliente.cardName);
      console.log('🔍 DEBUG - aliasName:', choperaConCliente.aliasName);
      console.log('🔍 DEBUG - Todos los campos:', {
        itemCode: choperaConCliente.itemCode,
        itemName: choperaConCliente.itemName,
        status: choperaConCliente.status,
        ciudad: choperaConCliente.ciudad,
        serieActivo: choperaConCliente.serieActivo,
        cardCode: choperaConCliente.cardCode,
        cardName: choperaConCliente.cardName,
        aliasName: choperaConCliente.aliasName
      });

      setChopera(choperaConCliente);
      
             // Filtrar mantenimientos para mostrar solo los de esta chopera específica
       // Usar choperaCode en lugar de serieActivo porque ese es el campo que realmente identifica la chopera
       const mantenimientosFiltrados = mantenimientosData.filter(m => 
         m.choperaCode === serieActivo
       );
      
             console.log('🔍 DEBUG - Mantenimientos filtrados:', {
         total: mantenimientosData.length,
         filtrados: mantenimientosFiltrados.length,
         serieActivoBuscado: serieActivo,
         mantenimientosFiltrados: mantenimientosFiltrados.map(m => ({
           id: m.id,
           choperaCode: m.choperaCode,
           serieActivo: m.chopera?.serieActivo,
           cliente: m.clienteCodigo
         }))
       });
      
      setRecentMantenimientos(mantenimientosFiltrados);

      // Debug: mostrar datos de la chopera
      console.log('Chopera encontrada en MantenimientosPorChopera:', choperaConCliente);
      console.log('cardCode:', choperaConCliente.cardCode);
      console.log('aliasName:', choperaConCliente.aliasName);
      console.log('cardName:', choperaConCliente.cardName);

             // Debug: mostrar datos de mantenimientos
       console.log('Mantenimientos encontrados:', mantenimientosData.length);
       mantenimientosData.forEach((m, index) => {
         console.log(`Mantenimiento ${index + 1}:`, {
           fecha: m.fechaVisita,
           tipo: m.tipoMantenimiento.nombre,
           estado: m.estadoGeneral,
           choperaCode: m.choperaCode,
           serieActivo: m.chopera?.serieActivo,
           cliente: m.clienteCodigo
         });
       });

             // Calcular estadísticas específicas de esta chopera usando los mantenimientos filtrados
       const statsCalculadas = calcularStatsPorChopera(mantenimientosFiltrados);
      console.log('Estadísticas calculadas:', statsCalculadas);
      console.log('Mantenimientos por mes:', statsCalculadas.mantenimientosPorMes);

      // Debug: verificar si hay datos en algún mes
      const mesesConDatos = statsCalculadas.mantenimientosPorMes.filter(item => item.completados > 0);
      console.log('Meses con datos:', mesesConDatos);

      setStats(statsCalculadas);

    } catch (err) {
      console.error('Error cargando datos de la chopera:', err);
      setError('Error al cargar los datos de la chopera');
      showError(
        'Error al cargar datos',
        'No se pudieron cargar los datos de la chopera. Intente refrescar la página.',
        5000
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calcularStatsPorChopera = (mantenimientos: Mantenimiento[]): ChoperaStats => {
    const hoy = new Date().toISOString().split('T')[0];
    const mantenimientosHoy = mantenimientos.filter(m => {
      try {
        // Manejar diferentes formatos de fecha
        if (m.fechaVisita.includes('T')) {
          return m.fechaVisita.startsWith(hoy);
        } else {
          return m.fechaVisita === hoy;
        }
      } catch (error) {
        console.error('Error procesando fecha para hoy:', m.fechaVisita, error);
        return false;
      }
    }).length;

    const mantenimientosCompletados = mantenimientos.length;
    const mantenimientosPendientes = 0; // Por ahora, todos los mantenimientos registrados están completados
    const mantenimientosCancelados = 0; // Por ahora no hay cancelados

    // Calcular promedio de tiempo (mock por ahora)
    const promedioTiempo = mantenimientos.length > 0 ? 2.5 : 0;

    // Generar datos de mantenimientos por mes basados en datos reales
    const mantenimientosPorMes = generarMantenimientosPorMes(mantenimientos);

    return {
      mantenimientosHoy,
      mantenimientosPendientes,
      mantenimientosCompletados,
      mantenimientosCancelados,
      promedioTiempo,
      mantenimientosPorMes
    };
  };

  const generarMantenimientosPorMes = (mantenimientos: Mantenimiento[]) => {
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    const hoy = new Date();
    const mantenimientosPorMes = [];

    console.log('Generando datos para mantenimientos:', mantenimientos.length);

    // Generar datos para los últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = fecha.getMonth();
      const año = fecha.getFullYear();

      const mantenimientosDelMes = mantenimientos.filter(m => {
        try {
          // Manejar diferentes formatos de fecha
          let fechaMantenimiento: Date;
          if (m.fechaVisita.includes('T')) {
            fechaMantenimiento = new Date(m.fechaVisita);
          } else {
            // Si es solo fecha sin tiempo, agregar tiempo
            fechaMantenimiento = new Date(m.fechaVisita + 'T00:00:00');
          }

          const coincideMes = fechaMantenimiento.getMonth() === mes;
          const coincideAño = fechaMantenimiento.getFullYear() === año;

          if (coincideMes && coincideAño) {
            console.log(`Mantenimiento encontrado para ${meses[mes]} ${año}:`, {
              fechaOriginal: m.fechaVisita,
              fechaProcesada: fechaMantenimiento.toISOString(),
              tipo: m.tipoMantenimiento.nombre
            });
          }

          return coincideMes && coincideAño;
        } catch (error) {
          console.error('Error procesando fecha:', m.fechaVisita, error);
          return false;
        }
      });

      const preventivos = mantenimientosDelMes.filter(m =>
        m.tipoMantenimiento.nombre.toLowerCase().includes('preventivo')
      );

      const correctivos = mantenimientosDelMes.filter(m =>
        m.tipoMantenimiento.nombre.toLowerCase().includes('correctivo')
      );

      const item = {
        mes: meses[mes],
        año: año,
        completados: mantenimientosDelMes.length,
        preventivos: preventivos.length,
        correctivos: correctivos.length,
        mantenimientosDetalle: mantenimientosDelMes.map(m => ({
          id: m.id,
          fecha: m.fechaVisita,
          cliente: m.clienteCodigo,
          tipo: m.tipoMantenimiento.nombre,
          estado: m.estadoGeneral,
          tecnico: `${m.usuario.nombre} ${m.usuario.apellido}`
        }))
      };

      if (mantenimientosDelMes.length > 0) {
        console.log(`Datos para ${meses[mes]} ${año}:`, item);
      }

      mantenimientosPorMes.push(item);
    }

    console.log('Datos finales por mes:', mantenimientosPorMes);
    return mantenimientosPorMes;
  };

  const handleRefresh = async () => {
    try {
      await loadChoperaData();
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

  const handleDelete = async (mantenimiento: Mantenimiento) => {
    setConfirmData({
      title: 'Eliminar Mantenimiento',
      description: `¿Estás seguro de que deseas eliminar el mantenimiento del ${new Date(mantenimiento.fechaVisita).toLocaleDateString()}? Esta acción no se puede deshacer.`,
      operation: 'delete',
      entityName: `Mantenimiento #${mantenimiento.id}`,
      isLoading: false
    });
    setConfirmAction(() => async () => {
      try {
        setConfirmData(prev => ({ ...prev, isLoading: true }));
        await mantenimientosService.deleteMantenimiento(mantenimiento.id);
        await loadChoperaData();
        setConfirmModalOpen(false);
        setConfirmAction(null);
        showSuccess(
          'Mantenimiento eliminado',
          'El mantenimiento se ha eliminado correctamente.',
          3000
        );
      } catch (err) {
        console.error('Error eliminando mantenimiento:', err);
        showError(
          'Error al eliminar',
          'No se pudo eliminar el mantenimiento. Intente nuevamente.',
          5000
        );
        setConfirmData(prev => ({ ...prev, isLoading: false }));
      }
    });
    setConfirmModalOpen(true);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <Button
            onClick={loadChoperaData}
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
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/bendita/choperas')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>

            {chopera && (
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Mantenimientos - {chopera.itemCode} - {chopera.cardCode} - {chopera.aliasName}
                  </h1>
                  <p className="text-gray-600">
                    {chopera.itemName} | Serie: {chopera.serieActivo}
                  </p>
                </div>
              </div>
            )}
          </div>

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
              onClick={async () => {
                // Recargar datos de la chopera antes de navegar
                console.log('🔄 Recargando datos de la chopera antes de navegar...');
                await loadChoperaData();
                
                // Verificar si la chopera tiene cliente asignado
                if (!chopera?.cardCode || chopera.cardCode.trim() === '') {
                  showError(
                    'Chopera sin cliente',
                    'Esta chopera no tiene cliente asignado. Selecciona una chopera que tenga cliente desde la tabla de choperas.',
                    5000
                  );
                  return;
                }
                
                // Pasar el serieActivo para que el formulario pueda buscar los datos completos
                const serieActivo = chopera?.serieActivo || '';
                const url = `/bendita/mantenimientos/nuevo?itemCode=${itemCode}&serieActivo=${encodeURIComponent(serieActivo)}`;
                console.log('URL generada:', url);
                console.log('chopera?.serieActivo:', chopera?.serieActivo);
                navigate(url);
              }}
              className="flex items-center gap-2 bg-amber-200"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas principales 
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
      )}*/}

      {/* Gráfico de tendencias */}
      {stats && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mantenimientos por Mes</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          {stats.mantenimientosPorMes.length > 0 ? (
            <>
              <div className="h-64 flex items-end justify-between space-x-2 relative">
                {stats.mantenimientosPorMes.map((item, index) => {
                  const maxCompletados = Math.max(...stats.mantenimientosPorMes.map(d => d.completados));
                  const maxPreventivos = Math.max(...stats.mantenimientosPorMes.map(d => d.preventivos));

                  const alturaCompletados = maxCompletados > 0 ? (item.completados / maxCompletados) * 100 : 0;
                  const alturaPreventivos = maxPreventivos > 0 ? (item.preventivos / maxPreventivos) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center relative group"
                      onMouseEnter={() => setHoveredMonth(`${item.mes}-${item.año}`)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <div className="w-full bg-gray-200 rounded-t">
                        <div
                          className="bg-blue-500 rounded-t transition-all duration-300 cursor-pointer hover:bg-blue-600"
                          style={{
                            height: `${alturaCompletados}%`,
                            minHeight: item.completados > 0 ? '4px' : '0px'
                          }}
                        />
                      </div>
                      <div className="w-full bg-gray-200 rounded-b mt-1">
                        <div
                          className="bg-green-500 rounded-b transition-all duration-300 cursor-pointer hover:bg-green-600"
                          style={{
                            height: `${alturaPreventivos}%`,
                            minHeight: item.preventivos > 0 ? '4px' : '0px'
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {item.mes}
                      </p>

                      {/* Tooltip */}
                      {hoveredMonth === `${item.mes}-${item.año}` && item.mantenimientosDetalle.length > 0 && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                          <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs">
                            <div className="text-sm font-semibold mb-2">
                              {item.mes} {item.año} - {item.completados} mantenimiento{item.completados !== 1 ? 's' : ''}
                            </div>
                            <div className="space-y-1 text-xs">
                              {item.mantenimientosDetalle.map((mant, idx) => (
                                                                 <div key={idx} className="border-t border-gray-700 pt-1 first:border-t-0 first:pt-0">
                                   <div className="flex justify-between">
                                     <span className="font-medium">{chopera?.cardCode || mant.cliente}</span>
                                     <span className="text-gray-300">{new Date(mant.fecha).toLocaleDateString()}</span>
                                   </div>
                                   <div className="text-gray-300">{mant.tipo}</div>
                                   <div className="text-gray-400 text-xs">Técnico: {mant.tecnico}</div>
                                 </div>
                              ))}
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Total</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Preventivos</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay datos de mantenimientos para mostrar</p>
                <p className="text-sm text-gray-400">Esta chopera aún no ha tenido mantenimientos registrados</p>
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
              <p className="text-sm text-gray-400 mb-4">Esta chopera aún no ha tenido mantenimientos</p>
              <Button
                onClick={async () => {
                  // Recargar datos de la chopera antes de navegar
                  console.log('🔄 Recargando datos de la chopera antes de navegar (primer mantenimiento)...');
                  await loadChoperaData();
                  
                  // Verificar si la chopera tiene cliente asignado
                  if (!chopera?.cardCode || chopera.cardCode.trim() === '') {
                    showError(
                      'Chopera sin cliente',
                      'Esta chopera no tiene cliente asignado. Selecciona una chopera que tenga cliente desde la tabla de choperas.',
                      5000
                    );
                    return;
                  }
                  
                  // Pasar el serieActivo para que el formulario pueda buscar los datos completos
                  const serieActivo = chopera?.serieActivo || '';
                  const url = `/bendita/mantenimientos/nuevo?itemCode=${itemCode}&serieActivo=${encodeURIComponent(serieActivo)}`;
                  console.log('URL generada (primer mantenimiento):', url);
                  navigate(url);
                }}
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
                        Cliente: {chopera?.cardCode || mantenimiento.clienteCodigo} - Chopera: {chopera?.serieActivo || mantenimiento.chopera.serieActivo}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(mantenimiento)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
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
          loadChoperaData();
        }}
      />

      {/* Modal de confirmación para eliminar */}
      <ModalConfirm
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction();
          }
        }}
        title={confirmData.title}
        description={confirmData.description}
        operation={confirmData.operation}
        entityName={confirmData.entityName}
        isLoading={confirmData.isLoading}
      />
    </div>
  );
}
