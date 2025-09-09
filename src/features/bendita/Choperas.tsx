import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  RefreshCw,
  Loader2,
  AlertCircle,
  Package,
  MapPin,
  Calendar,
  Building,
  BarChart3,
  Users,
  CheckCircle,
  Wrench
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
import Breadcrumb from "../../components/ui/navigation/Breadcrumb";
import { choperasService, type Chopera } from "../../services/choperasService";
import { mantenimientosService, type Mantenimiento } from "../../services/mantenimientosService";
import { useNavigate } from "react-router-dom";

export default function Choperas() {
  const navigate = useNavigate();
  const [choperas, setChoperas] = useState<Chopera[]>([]);
  const [filteredChoperas, setFilteredChoperas] = useState<Chopera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estado para los últimos mantenimientos
  const [ultimosMantenimientos, setUltimosMantenimientos] = useState<Record<string, Mantenimiento | null>>({});
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState("");
  const [selectedCiudad, setSelectedCiudad] = useState("");
  const [selectedAlias, setSelectedAlias] = useState("");
  
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
  const [selectedChopera, setSelectedChopera] = useState<Chopera | null>(null);
  const [modalDetailsOpen, setModalDetailsOpen] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadChoperas();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [choperas, searchTerm, selectedCliente, selectedCiudad, selectedAlias]);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCliente, selectedCiudad, selectedAlias]);

  const loadChoperas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [choperasData, statsData] = await Promise.all([
        choperasService.getChoperas(),
        choperasService.getChoperasStats()
      ]);
      
      console.log('🔍 DEBUG - Choperas.tsx - Todas las choperas cargadas:', choperasData.length);
      console.log('🔍 DEBUG - Choperas.tsx - Buscando chopera 903039:', choperasData.find(c => c.itemCode === '903039'));
      
      setChoperas(choperasData);
      setStats(statsData);
      
      // Cargar últimos mantenimientos para cada chopera
      await loadUltimosMantenimientos(choperasData);
    } catch (err) {
      console.error('Error cargando choperas:', err);
      setError('Error al cargar los datos de choperas desde SAP');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUltimosMantenimientos = async (choperasData: Chopera[]) => {
    try {
      const mantenimientosPromises = choperasData.map(async (chopera) => {
        try {
          const ultimoMantenimiento = await mantenimientosService.getUltimoMantenimientoByChopera(chopera.itemCode);
          return { itemCode: chopera.itemCode, mantenimiento: ultimoMantenimiento };
        } catch (error) {
          console.error(`Error cargando último mantenimiento para chopera ${chopera.itemCode}:`, error);
          return { itemCode: chopera.itemCode, mantenimiento: null };
        }
      });

      const resultados = await Promise.all(mantenimientosPromises);
      
      const mantenimientosMap: Record<string, Mantenimiento | null> = {};
      resultados.forEach(({ itemCode, mantenimiento }) => {
        mantenimientosMap[itemCode] = mantenimiento;
      });
      
      setUltimosMantenimientos(mantenimientosMap);
    } catch (error) {
      console.error('Error cargando últimos mantenimientos:', error);
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

  // Función helper para determinar si el mantenimiento está pendiente
  const isMantenimientoPendiente = (ultimoMantenimiento: Mantenimiento | null): boolean => {
    if (!ultimoMantenimiento) return true;
    
    const fechaUltimoMantenimiento = new Date(ultimoMantenimiento.fechaVisita);
    const fechaActual = new Date();
    const unMesAtras = new Date();
    unMesAtras.setMonth(fechaActual.getMonth() - 1);
    
    return fechaUltimoMantenimiento < unMesAtras;
  };

  // Función helper para formatear la fecha del último mantenimiento
  const formatearUltimoMantenimiento = (ultimoMantenimiento: Mantenimiento | null): string => {
    if (!ultimoMantenimiento) return "Mantenimiento Pendiente";
    
    if (isMantenimientoPendiente(ultimoMantenimiento)) {
      return "Mantenimiento Pendiente";
    }
    
    const fecha = new Date(ultimoMantenimiento.fechaVisita);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const applyFilters = () => {
    let filtered = [...choperas];

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(chopera =>
        chopera.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chopera.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chopera.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chopera.aliasName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chopera.cardName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por cliente
    if (selectedCliente) {
      if (selectedCliente === 'Sin cliente') {
        filtered = filtered.filter(chopera => !chopera.cardName || chopera.cardName.trim() === '');
      } else {
        filtered = filtered.filter(chopera => chopera.cardName === selectedCliente);
      }
    }

    // Filtro por ciudad
    if (selectedCiudad) {
      filtered = filtered.filter(chopera => chopera.ciudad === selectedCiudad);
    }

    // Filtro por alias - manejar casos donde aliasName está vacío
    if (selectedAlias) {
      if (selectedAlias === 'Sin alias') {
        filtered = filtered.filter(chopera => !chopera.aliasName || chopera.aliasName.trim() === '');
      } else {
        filtered = filtered.filter(chopera => chopera.aliasName === selectedAlias);
      }
    }

    setFilteredChoperas(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCliente("");
    setSelectedCiudad("");
    setSelectedAlias("");
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

  const handleViewDetails = (chopera: Chopera) => {
    setSelectedChopera(chopera);
    setModalDetailsOpen(true);
  };

           const handleViewMantenimientos = (chopera: Chopera) => {
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
  
  // Para clientes, incluir "Sin cliente" si hay registros sin cliente
  const clienteOptions = [...new Set(choperas.map(c => c.cardName).filter(Boolean))];
  const hasEmptyCliente = choperas.some(c => !c.cardName || c.cardName.trim() === '');
  const clientes = hasEmptyCliente ? ['Sin cliente', ...clienteOptions] : clienteOptions;
  
  // Para aliases, incluir "Sin alias" si hay registros sin alias
  const aliasOptions = [...new Set(choperas.map(c => c.aliasName).filter(Boolean))];
  const hasEmptyAlias = choperas.some(c => !c.aliasName || c.aliasName.trim() === '');
  const aliases = hasEmptyAlias ? ['Sin alias', ...aliasOptions] : aliasOptions;



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
          {(searchTerm || selectedCliente || selectedCiudad || selectedAlias) && (
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
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, código, ubicación, alias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por Cliente */}
          <select
            value={selectedCliente}
            onChange={(e) => setSelectedCliente(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los clientes</option>
            {clientes.map((cliente) => (
              <option key={cliente} value={cliente}>{cliente}</option>
            ))}
          </select>

          {/* Filtro por Ciudad */}
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

          {/* Filtro por Alias */}
          <select
            value={selectedAlias}
            onChange={(e) => setSelectedAlias(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los alias</option>
            {aliases.map((alias) => (
              <option key={alias} value={alias}>{alias}</option>
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
                      {(() => {
                        const ultimoMantenimiento = ultimosMantenimientos[chopera.itemCode];
                        const esPendiente = isMantenimientoPendiente(ultimoMantenimiento);
                        const fechaTexto = formatearUltimoMantenimiento(ultimoMantenimiento);
                        
                        return (
                          <div className="flex items-center">
                            {esPendiente ? (
                              <>
                                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                                <span className="text-red-600 font-medium">{fechaTexto}</span>
                              </>
                            ) : (
                              <>
                                <Calendar className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-green-600">{fechaTexto}</span>
                              </>
                            )}
                          </div>
                        );
                      })()}
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
            {searchTerm || selectedCliente || selectedCiudad || selectedAlias
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