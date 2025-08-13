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
  BarChart3
} from "lucide-react";
import { Button, ModalChoperaDetails } from "../../components/ui";
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

export default function Choperas() {
  const [choperas, setChoperas] = useState<Chopera[]>([]);
  const [filteredChoperas, setFilteredChoperas] = useState<Chopera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedUbicacion, setSelectedUbicacion] = useState("");
  const [selectedGrupo, setSelectedGrupo] = useState("");
  
  // Estados para estadísticas
  const [stats, setStats] = useState<{
    total: number;
    porEstado: Record<string, number>;
    porGrupo: Record<string, number>;
    porUbicacion: Record<string, number>;
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
  }, [choperas, searchTerm, selectedEstado, selectedUbicacion, selectedGrupo]);

  const loadChoperas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [choperasData, statsData] = await Promise.all([
        choperasService.getChoperas(),
        choperasService.getChoperasStats()
      ]);
      
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

  const applyFilters = () => {
    let filtered = [...choperas];

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(chopera =>
        chopera.ItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chopera.ItemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chopera.U_Ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (selectedEstado) {
      filtered = filtered.filter(chopera => chopera.U_Estado === selectedEstado);
    }

    // Filtro por ubicación
    if (selectedUbicacion) {
      filtered = filtered.filter(chopera => chopera.U_Ubicacion === selectedUbicacion);
    }

    // Filtro por grupo
    if (selectedGrupo) {
      filtered = filtered.filter(chopera => chopera.ItmsGrpNam === selectedGrupo);
    }

    setFilteredChoperas(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedEstado("");
    setSelectedUbicacion("");
    setSelectedGrupo("");
  };

  const handleExport = async () => {
    try {
      const dataToExport = filteredChoperas.map(chopera => ({
        'Código': chopera.ItemCode,
        'Nombre': chopera.ItemName,
        'Grupo': chopera.ItmsGrpNam,
        'Estado': chopera.U_Estado || 'Sin estado',
        'Ubicación': chopera.U_Ubicacion || 'Sin ubicación',
        'Última Compra': chopera.LastPurPrc,
        'Precio Promedio': chopera.AvgPrice,
        'Fecha Creación': chopera.CreateDate,
        'Última Actualización': chopera.UpdateDate
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

  const handleCloseModal = () => {
    setModalDetailsOpen(false);
    setSelectedChopera(null);
  };

  // Obtener opciones únicas para los filtros
  const estados = [...new Set(choperas.map(c => c.U_Estado).filter(Boolean))];
  const ubicaciones = [...new Set(choperas.map(c => c.U_Ubicacion).filter(Boolean))];
  const grupos = [...new Set(choperas.map(c => c.ItmsGrpNam).filter(Boolean))];

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
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Choperas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <Building className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Grupos</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.porGrupo).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-orange-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ubicaciones</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.porUbicacion).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Estados</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.porEstado).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          {(searchTerm || selectedEstado || selectedUbicacion || selectedGrupo) && (
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
              placeholder="Buscar por nombre, código o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por Estado */}
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          {/* Filtro por Ubicación */}
          <select
            value={selectedUbicacion}
            onChange={(e) => setSelectedUbicacion(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las ubicaciones</option>
            {ubicaciones.map((ubicacion) => (
              <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
            ))}
          </select>

          {/* Filtro por Grupo */}
          <select
            value={selectedGrupo}
            onChange={(e) => setSelectedGrupo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los grupos</option>
            {grupos.map((grupo) => (
              <option key={grupo} value={grupo}>{grupo}</option>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Precio Promedio</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChoperas.map((chopera) => (
                <TableRow key={chopera.ItemCode}>
                  <TableCell className="font-medium">{chopera.ItemCode}</TableCell>
                  <TableCell>{chopera.ItemName}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {chopera.ItmsGrpNam}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      chopera.U_Estado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {chopera.U_Estado || 'Sin estado'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-sm">
                        {chopera.U_Ubicacion || 'Sin ubicación'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {chopera.LastPurPrc > 0 ? `$${chopera.LastPurPrc.toFixed(2)}` : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {chopera.AvgPrice > 0 ? `$${chopera.AvgPrice.toFixed(2)}` : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-sm">
                        {new Date(chopera.CreateDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleViewDetails(chopera)}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {filteredChoperas.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron choperas</h3>
          <p className="text-gray-600">
            {searchTerm || selectedEstado || selectedUbicacion || selectedGrupo
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