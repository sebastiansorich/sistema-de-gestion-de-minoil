import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  Loader2,
  AlertCircle,
  AlertTriangle,
  Package,
  MapPin,
  Calendar,
  CheckCircle,
  Wrench,
  Clock,
  User
} from "lucide-react";
import { Button, ModalChoperaDetails, Pagination } from "../../components/ui";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../../components/ui";
import { choperasService, type ChoperaConMantenimiento } from "../../services/choperasService";
import { useNavigate } from "react-router-dom";

export default function Choperas() {
  const navigate = useNavigate();
  const [choperas, setChoperas] = useState<ChoperaConMantenimiento[]>([]);
  const [filteredChoperas, setFilteredChoperas] = useState<ChoperaConMantenimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstadoMantenimiento, setSelectedEstadoMantenimiento] = useState("");
  const [selectedCiudad, setSelectedCiudad] = useState("");
  const [selectedTecnico, setSelectedTecnico] = useState("");
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados para estadísticas
  const [stats, setStats] = useState<{
    total: number;
    porStatus: Record<string, number>;
    porCiudad: Record<string, number>;
    porSerie: Record<string, number>;
  } | null>(null);

  // Estados para modal de detalles
  const [selectedChopera, setSelectedChopera] = useState<ChoperaConMantenimiento | null>(null);
  const [modalDetailsOpen, setModalDetailsOpen] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadChoperas();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [choperas, searchTerm, selectedEstadoMantenimiento, selectedCiudad, selectedTecnico]);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEstadoMantenimiento, selectedCiudad, selectedTecnico]);

  const loadChoperas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [choperasData, statsData] = await Promise.all([
        choperasService.getChoperasConMantenimientos(),
        choperasService.getChoperasStats()
      ]);
      
      console.log('🔍 DEBUG - Choperas.tsx - Todas las choperas cargadas:', choperasData.length);
      console.log('🔍 DEBUG - Choperas.tsx - Choperas con mantenimiento:', choperasData.filter(c => c.ultimoMantenimiento).length);
      
      setChoperas(choperasData);
      setStats(statsData);
    } catch (err) {
      console.error('Error cargando choperas:', err);
      setError('Error al cargar los datos de choperas desde SAP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadChoperas();
    } catch (err) {
      console.error('Error refrescando datos:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Función helper para formatear la fecha del último mantenimiento
  const formatearUltimoMantenimiento = (ultimoMantenimiento: ChoperaConMantenimiento['ultimoMantenimiento']): string => {
    if (!ultimoMantenimiento) return "Sin mantenimiento";
    
    if (ultimoMantenimiento.esPendiente) {
      return `Pendiente (${ultimoMantenimiento.diasDesdeUltimo} días)`;
    }
    
    const fecha = new Date(ultimoMantenimiento.fechaVisita);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función helper para obtener el color del estado
  const getEstadoColor = (ultimoMantenimiento: ChoperaConMantenimiento['ultimoMantenimiento']) => {
    if (!ultimoMantenimiento) return 'text-gray-500';
    if (ultimoMantenimiento.esPendiente) {
      if (ultimoMantenimiento.diasDesdeUltimo > 60) return 'text-red-600';
      if (ultimoMantenimiento.diasDesdeUltimo > 30) return 'text-orange-600';
      return 'text-yellow-600';
    }
    return 'text-green-600';
  };

  // Función helper para obtener el icono del estado
  const getEstadoIcono = (ultimoMantenimiento: ChoperaConMantenimiento['ultimoMantenimiento']) => {
    if (!ultimoMantenimiento) return 'AlertTriangle';
    if (ultimoMantenimiento.esPendiente) {
      if (ultimoMantenimiento.diasDesdeUltimo > 60) return 'AlertCircle';
      if (ultimoMantenimiento.diasDesdeUltimo > 30) return 'Clock';
      return 'AlertTriangle';
    }
    return 'CheckCircle';
  };

  const applyFilters = () => {
    let filtered = [...choperas];

    // Filtro por término de búsqueda (serie de choperas y código de cliente)
    if (searchTerm) {
      filtered = filtered.filter(chopera =>
        chopera.serieActivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chopera.cardCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado de mantenimiento
    if (selectedEstadoMantenimiento) {
      if (selectedEstadoMantenimiento === 'Sin mantenimiento') {
        filtered = filtered.filter(chopera => !chopera.ultimoMantenimiento);
      } else if (selectedEstadoMantenimiento === 'Pendiente') {
        filtered = filtered.filter(chopera => chopera.ultimoMantenimiento?.esPendiente);
      }
    }

    // Filtro por ciudad
    if (selectedCiudad) {
      filtered = filtered.filter(chopera => chopera.ciudad === selectedCiudad);
    }

    // Filtro por técnico
    if (selectedTecnico) {
      filtered = filtered.filter(chopera => {
        if (!chopera.ultimoMantenimiento?.tecnico) return false;
        const nombreCompleto = `${chopera.ultimoMantenimiento.tecnico.nombre} ${chopera.ultimoMantenimiento.tecnico.apellido}`;
        return nombreCompleto === selectedTecnico;
      });
    }

    setFilteredChoperas(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedEstadoMantenimiento("");
    setSelectedCiudad("");
    setSelectedTecnico("");
  };

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredChoperas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedChoperas = filteredChoperas.slice(startIndex, startIndex + itemsPerPage);

  // Manejadores de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const dataToExport = filteredChoperas.map(chopera => ({
        'Código': chopera.itemCode,
        'Nombre': chopera.itemName,
        'Status': chopera.status || 'Sin status',
        'Ciudad': chopera.ciudad || 'Sin ciudad',
        'Serie/Activo': chopera.serieActivo || 'Sin serie',
        'Código Cliente': chopera.cardCode || 'Sin código',
        'Nombre Cliente': chopera.cardName || 'Sin nombre',
        'Alias': chopera.aliasName || 'Sin alias'
      }));
      
      const csvContent = [
        Object.keys(dataToExport[0]).join(','),
        ...dataToExport.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `choperas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exportando:', err);
      alert('Error al exportar los datos');
    }
  };

  const handleViewDetails = (chopera: ChoperaConMantenimiento) => {
    setSelectedChopera(chopera);
    setModalDetailsOpen(true);
  };

           const handleViewMantenimientos = (chopera: ChoperaConMantenimiento) => {
           console.log('🔍 DEBUG - handleViewMantenimientos - Chopera seleccionada:', {
             itemCode: chopera.itemCode,
             itemName: chopera.itemName,
             serieActivo: chopera.serieActivo,
             cardCode: chopera.cardCode,
             cardName: chopera.cardName,
             aliasName: chopera.aliasName
           });

           // Verificar si la chopera tiene cliente antes de navegar
           if (!chopera.cardCode || chopera.cardCode.trim() === '') {
             console.log('⚠️ ADVERTENCIA: Intentando navegar a una chopera sin cliente!');
             return; // No navegar si no tiene cliente
           }

           console.log('✅ Navegando a mantenimientos de chopera con cliente:', chopera.itemCode);
           // Pasar el serieActivo en la URL para que MantenimientosPorChopera pueda usarlo
           const url = `/bendita/choperas/${chopera.itemCode}/mantenimientos?serieActivo=${encodeURIComponent(chopera.serieActivo)}`;
           console.log('URL generada:', url);
           navigate(url);
         };

  const handleCloseModal = () => {
    setModalDetailsOpen(false);
    setSelectedChopera(null);
  };

  // Obtener opciones únicas para los filtros
  const ciudades = [...new Set(choperas.map(c => c.ciudad).filter(Boolean))];
  
  // Para técnicos, obtener nombres únicos de los técnicos que han hecho mantenimientos
  const tecnicos = [...new Set(
    choperas
      .filter(c => c.ultimoMantenimiento?.tecnico)
      .map(c => `${c.ultimoMantenimiento!.tecnico.nombre} ${c.ultimoMantenimiento!.tecnico.apellido}`)
  )];



  // Calcular estadísticas regionales
  const totalChoperas = choperas.length;
  const choperasSCZ = choperas.filter(c => c.ciudad && c.ciudad.toLowerCase().includes('santa cruz')).length;
  const choperasCBB = choperas.filter(c => c.ciudad && c.ciudad.toLowerCase().includes('cochabamba')).length;
  const choperasLPZ = choperas.filter(c => c.ciudad && c.ciudad.toLowerCase().includes('la paz')).length;

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <Button 
            onClick={loadChoperas} 
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Choperas</p>
              <p className="text-2xl font-bold text-gray-900">{totalChoperas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Choperas SCZ</p>
              <p className="text-2xl font-bold text-gray-900">{choperasSCZ}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-orange-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Choperas CBB</p>
              <p className="text-2xl font-bold text-gray-900">{choperasCBB}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-purple-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Choperas LPZ</p>
              <p className="text-2xl font-bold text-gray-900">{choperasLPZ}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          {(searchTerm || selectedEstadoMantenimiento || selectedCiudad || selectedTecnico) && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Buscador por serie de choperas y código de cliente */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por serie o código de cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 2. Estados de mantenimiento */}
          <select
            value={selectedEstadoMantenimiento}
            onChange={(e) => setSelectedEstadoMantenimiento(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="Sin mantenimiento">Sin mantenimiento</option>
            <option value="Pendiente">Pendiente</option>
          </select>

          {/* 3. Filtro por Ciudad */}
          <select
            value={selectedCiudad}
            onChange={(e) => setSelectedCiudad(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las ciudades</option>
            {ciudades.map((ciudad) => (
              <option key={ciudad} value={ciudad}>{ciudad}</option>
            ))}
          </select>

          {/* 4. Filtro por Técnico */}
          <select
            value={selectedTecnico}
            onChange={(e) => setSelectedTecnico(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los técnicos</option>
            {tecnicos.map((tecnico) => (
              <option key={tecnico} value={tecnico}>{tecnico}</option>
            ))}
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Mostrando {filteredChoperas.length} de {choperas.length} choperas
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando choperas desde SAP...</span>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Último Mantenimiento</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Serie/Activo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedChoperas.map((chopera) => (
                  <TableRow key={`${chopera.itemCode}-${chopera.serieActivo}`}>
                    <TableCell className="font-medium">{chopera.itemCode}</TableCell>
                    <TableCell>{chopera.itemName}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {/* Estado principal */}
                        <div className="flex items-center">
                          {(() => {
                            const icono = getEstadoIcono(chopera.ultimoMantenimiento);
                            const color = getEstadoColor(chopera.ultimoMantenimiento);
                            const IconComponent = icono === 'AlertCircle' ? AlertCircle :
                                                 icono === 'AlertTriangle' ? AlertTriangle :
                                                 icono === 'Clock' ? Clock :
                                                 icono === 'CheckCircle' ? CheckCircle : Calendar;
                            
                            return (
                              <>
                                <IconComponent className={`w-4 h-4 ${color.replace('text-', 'text-')} mr-2`} />
                                <span className={`font-medium ${color}`}>
                                  {formatearUltimoMantenimiento(chopera.ultimoMantenimiento)}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                        
                        {/* Información adicional del técnico */}
                        {chopera.ultimoMantenimiento && (
                          <div className="flex items-center text-xs text-gray-500 ml-6">
                            <User className="w-3 h-3 mr-1" />
                            <span>
                              {chopera.ultimoMantenimiento.tecnico.nombre} {chopera.ultimoMantenimiento.tecnico.apellido}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-sm">
                          {chopera.ciudad || 'Sin ciudad'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {chopera.serieActivo || 'Sin serie'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className={`font-medium ${chopera.cardName ? 'text-gray-900' : 'text-red-500'}`}>
                          {chopera.cardName || 'Sin cliente'}
                        </div>
                        <div className={`${chopera.cardCode ? 'text-gray-600' : 'text-red-400'}`}>
                          {chopera.cardCode || 'Sin código'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {chopera.aliasName || 'Sin alias'}
                      </span>
                    </TableCell>
                                      <TableCell>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleViewDetails(chopera)}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          console.log('🔍 DEBUG - Botón Wrench clickeado para chopera:', {
                            itemCode: chopera.itemCode,
                            cardCode: chopera.cardCode,
                            cardName: chopera.cardName,
                            serieActivo: chopera.serieActivo
                          });
                          handleViewMantenimientos(chopera);
                        }}
                        variant="outline"
                        size="sm"
                        className={`h-8 w-8 p-0 ${!chopera.cardCode || chopera.cardCode.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={!chopera.cardCode || chopera.cardCode.trim() === '' ? 'Esta chopera no tiene cliente asignado' : 'Ver mantenimientos'}
                        disabled={!chopera.cardCode || chopera.cardCode.trim() === ''}
                      >
                        <Wrench className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Paginación */}
            {filteredChoperas.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredChoperas.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {filteredChoperas.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron choperas</h3>
          <p className="text-gray-600">
            {searchTerm || selectedEstadoMantenimiento || selectedCiudad || selectedTecnico
              ? "Intenta ajustar los filtros de búsqueda"
              : "No hay choperas registradas en el sistema"}
          </p>
        </div>
      )}

      {/* Modal de detalles */}
      <ModalChoperaDetails
        open={modalDetailsOpen}
        onClose={handleCloseModal}
        chopera={selectedChopera}
      />
    </div>
  );
}