import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  ArrowUpDown,
  Filter,
  Upload,
  Save,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button, Pagination, ModalUpload, ModalConfirm } from "../../components/ui";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../../components/ui";
import { SelectSedes, SelectAreas, SelectCargos } from "../../components/ui";

// Interfaces para los datos de mercaderistas
interface Mercaderista {
  id: number
  regional: string
  canal: string
  cargo: string
  gestionador: string
  ruta: string
  codigo: string
  clientes: string
  sedeId?: number
  areaId?: number
  cargoId?: number
}

// Opciones base para selects
const regionales = ["SANTA CRUZ", "COCHABAMBA", "LA PAZ"];
const canales = ["TRADICIONAL", "MODERNO", "CHECKOUT", "FIAMBRERAS"];
const rutas = [
  "2005-RSCZ ABASTO",
  "2006-RSCZ MUTUALISTA",
  "3001-LPZ CENTRO",
  "4001-CBB NORTE",
];
const clientes = ["Hipermaxi", "Fidalga", "IC Norte", "Tía"];

export default function Mercaderistas() {
  const [mes, setMes] = useState("2024-05");
  const [data, setData] = useState<Mercaderista[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [modalUploadOpen, setModalUploadOpen] = useState(false);
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadMercaderistas();
  }, [mes]);

  const loadMercaderistas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Por ahora usamos datos simulados hasta que tengas el endpoint específico
      // En el futuro esto sería algo como: const response = await mercaderistasService.getByMes(mes)
      const mockData: Mercaderista[] = [
        {
          id: 1,
          regional: "SANTA CRUZ",
          canal: "TRADICIONAL",
          cargo: "MERCADERISTA",
          gestionador: "AGUILAR JUSTINIANO LUPE",
          ruta: "2005-RSCZ ABASTO",
          codigo: "",
          clientes: "",
          sedeId: 1,
          areaId: 1,
          cargoId: 11,
        },
        {
          id: 2,
          regional: "SANTA CRUZ",
          canal: "TRADICIONAL",
          cargo: "MERCADERISTA",
          gestionador: "CHIRIMBAQUE PERALES GUSTAVO HORACIO",
          ruta: "2006-RSCZ MUTUALISTA",
          codigo: "",
          clientes: "",
          sedeId: 1,
          areaId: 1,
          cargoId: 11,
        },
      ];
      
      setData(mockData);
    } catch (err) {
      console.error('Error cargando mercaderistas:', err);
      setError('Error al cargar los datos de mercaderistas');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers básicos para demo
  const handleEdit = (idx: number) => setEditIdx(idx);
  
  const handleChange = (idx: number, field: string, value: string | number) => {
    setData((d) => d.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };
  
  const handleSave = async () => {
    try {
      // Aquí iría la lógica para guardar en el backend
      // await mercaderistasService.update(data[editIdx!]);
      setEditIdx(null);
    } catch (err) {
      console.error('Error guardando:', err);
      alert('Error al guardar los cambios');
    }
  };
  
  const handleDelete = async (idx: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este mercaderista?')) {
      return;
    }
    
    try {
      // Aquí iría la lógica para eliminar del backend
      // await mercaderistasService.delete(data[idx].id);
      setData((d) => d.filter((_, i) => i !== idx));
    } catch (err) {
      console.error('Error eliminando:', err);
      alert('Error al eliminar el mercaderista');
    }
  };
  
  const handleAdd = () => {
    const newMercaderista: Mercaderista = {
      id: Date.now(),
      regional: "SANTA CRUZ",
      canal: "TRADICIONAL",
      cargo: "MERCADERISTA",
      gestionador: "",
      ruta: "",
      codigo: "",
      clientes: "",
      sedeId: undefined,
      areaId: undefined,
      cargoId: undefined,
    };
    setData((d) => [...d, newMercaderista]);
    setEditIdx(data.length); // Editar el nuevo registro inmediatamente
  };

  // Nuevo flujo de importación
  const handleOpenUpload = () => setModalUploadOpen(true);
  
  const handleFileSelected = (file: File) => {
    setFileToImport(file);
    setModalUploadOpen(false);
    setModalConfirmOpen(true);
  };
  
  const handleConfirmImport = async () => {
    try {
      setImporting(true);
      // Aquí iría la lógica real de importación
      // await mercaderistasService.importFromFile(fileToImport);
      setModalConfirmOpen(false);
      setFileToImport(null);
      await loadMercaderistas(); // Recargar datos
      alert("Archivo importado correctamente");
    } catch (err) {
      console.error('Error importando:', err);
      alert('Error al importar el archivo');
    } finally {
      setImporting(false);
    }
  };
  
  const handleCancelImport = () => {
    setModalConfirmOpen(false);
    setFileToImport(null);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      // Aquí iría la lógica real de exportación
      // const blob = await mercaderistasService.exportToExcel(mes);
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `mercaderistas_${mes}.xlsx`;
      // a.click();
      alert("Exportación completada (simulada)");
    } catch (err) {
      console.error('Error exportando:', err);
      alert('Error al exportar los datos');
    } finally {
      setExporting(false);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <Button 
            onClick={loadMercaderistas} 
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Gestión de personal de mercadereo por mes</p>
        </div>
      </div>

      {/* Controles principales */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="mes" className="text-sm font-medium text-gray-700">
              Mes:
            </label>
            <input
              id="mes"
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Total: {data.length} mercaderistas
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </Button>
          
          <Button
            onClick={handleOpenUpload}
            variant="outline"
            className="flex items-center gap-2"
            size="sm"
          >
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
            size="sm"
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando mercaderistas...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Regional</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Gestionador</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Cargo Específico</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {editIdx === idx ? (
                      <select
                        value={row.regional}
                        onChange={(e) => handleChange(idx, "regional", e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {regionales.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      row.regional
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editIdx === idx ? (
                      <select
                        value={row.canal}
                        onChange={(e) => handleChange(idx, "canal", e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {canales.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      row.canal
                    )}
                  </TableCell>
                  
                  <TableCell>{row.cargo}</TableCell>
                  
                  <TableCell>
                    {editIdx === idx ? (
                      <input
                        type="text"
                        value={row.gestionador}
                        onChange={(e) => handleChange(idx, "gestionador", e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Nombre del gestionador"
                      />
                    ) : (
                      row.gestionador
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editIdx === idx ? (
                      <select
                        value={row.ruta}
                        onChange={(e) => handleChange(idx, "ruta", e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar ruta</option>
                        {rutas.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      row.ruta
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editIdx === idx ? (
                      <input
                        type="text"
                        value={row.codigo}
                        onChange={(e) => handleChange(idx, "codigo", e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Código"
                      />
                    ) : (
                      row.codigo
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editIdx === idx ? (
                      <input
                        type="text"
                        value={row.clientes}
                        onChange={(e) => handleChange(idx, "clientes", e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Clientes asignados"
                      />
                    ) : (
                      row.clientes
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editIdx === idx ? (
                      <SelectSedes
                        value={row.sedeId || ""}
                        onChange={(value) => handleChange(idx, "sedeId", value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">
                        {row.sedeId ? `Sede ${row.sedeId}` : "No asignada"}
                      </span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editIdx === idx ? (
                      <SelectAreas
                        value={row.areaId || ""}
                        onChange={(value) => handleChange(idx, "areaId", value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">
                        {row.areaId ? `Área ${row.areaId}` : "No asignada"}
                      </span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {editIdx === idx ? (
                      <SelectCargos
                        value={row.cargoId || ""}
                        onChange={(value) => handleChange(idx, "cargoId", value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">
                        {row.cargoId ? `Cargo ${row.cargoId}` : "No asignado"}
                      </span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex gap-1">
                      {editIdx === idx ? (
                        <>
                          <Button
                            onClick={handleSave}
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setEditIdx(null)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleEdit(idx)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            ✏️
                          </Button>
                          <Button
                            onClick={() => handleDelete(idx)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modales */}
      <ModalUpload
        open={modalUploadOpen}
        onClose={() => setModalUploadOpen(false)}
        onFile={handleFileSelected}
      />

      <ModalConfirm
        open={modalConfirmOpen}
        onClose={handleCancelImport}
        onConfirm={handleConfirmImport}
        title="Confirmar Importación"
        description={`¿Estás seguro de que deseas importar el archivo "${fileToImport?.name}"? Esta acción reemplazará los datos existentes para el mes seleccionado.`}
      />
    </div>
  );
} 