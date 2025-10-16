import { useEffect, useState } from 'react'
import { RefreshCw, Download, Calendar, MapPin, User } from 'lucide-react'
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui'
import { SelectEmpleados } from '../../components/ui/selects/SelectEmpleados'
import { comisionesService, type Comision } from '../../services/comisionesService'

export default function PlanillaComisiones() {
  const [comisiones, setComisiones] = useState<Comision[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [regionalOptions, setRegionalOptions] = useState<string[]>([])
  
  // Filtros
  const [filtroRegional, setFiltroRegional] = useState<string>('')
  const [filtroEmpleado, setFiltroEmpleado] = useState<number | null>(null)
  const [filtroMes, setFiltroMes] = useState<string>(() => {
    const now = new Date()
    // Mostrar el mes anterior (las comisiones se pagan con un mes de retraso)
    const mesAnterior = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const añoAnterior = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return `${añoAnterior}-${String(mesAnterior + 1).padStart(2, '0')}`
  })

  const cargarComisiones = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await comisionesService.getAll({
        regional: filtroRegional || undefined,
        mesComision: filtroMes ? `${filtroMes}-01` : undefined,
        limit: 1000,
        sortBy: 'createdAt',
        sortDir: 'desc'
      })
      
      // Filtrar por empleado en el frontend si está seleccionado
      let comisionesFiltradas = data
      if (filtroEmpleado) {
        comisionesFiltradas = data.filter(c => (c.empId || c.empID) === filtroEmpleado)
      }
      
      setComisiones(comisionesFiltradas)
    } catch (e: any) {
      setError(e?.message || 'Error al cargar comisiones')
    } finally {
      setLoading(false)
    }
  }

  const cargarRegionales = async () => {
    try {
      // Cargar todas las comisiones para extraer las regionales únicas
      const { data } = await comisionesService.getAll({
        limit: 1000,
        sortBy: 'regional',
        sortDir: 'asc'
      })
      
      // Extraer regionales únicas y ordenarlas
      const regionalesUnicas = Array.from(
        new Set(data.map(c => c.regional).filter((regional): regional is string => Boolean(regional)))
      ).sort()
      
      setRegionalOptions(regionalesUnicas)
    } catch (e) {
      console.error('Error cargando regionales:', e)
      // Fallback a regionales por defecto si hay error
      setRegionalOptions(['Santa Cruz', 'La Paz', 'Cochabamba', 'Oruro', 'Potosí', 'Tarija', 'Beni', 'Pando', 'Chuquisaca'])
    }
  }

  useEffect(() => {
    cargarRegionales()
  }, [])

  useEffect(() => {
    cargarComisiones()
  }, [filtroRegional, filtroEmpleado, filtroMes])

  const exportarPlanilla = () => {
    if (comisiones.length === 0) {
      alert('No hay datos para exportar')
      return
    }

    // Crear CSV
    const headers = ['ID', 'Emp ID', 'Regional', 'Canal', 'Tipo Mercaderista', 'Ruta', 'Cliente', 'Mes Comisión', 'Estado', 'Creado']
    const csvContent = [
      headers.join(','),
      ...comisiones.map(c => {
        const mes = c.mesComision
        const mesFmt = mes ? String(mes).slice(0, 10) : '-'
        const creadoFmt = c.createdAt ? String(c.createdAt).replace('T', ' ').slice(0, 16) : '-'
        return [
          c.id || '',
          c.empId || '',
          c.regional || '',
          c.canal || '',
          c.tipoMercaderista || '',
          c.ruta || '',
          c.cliente || '',
          mesFmt,
          c.estado || '',
          creadoFmt
        ].map(field => `"${field}"`).join(',')
      })
    ].join('\n')

    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `planilla_comisiones_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planilla de Comisiones</h1>
          <p className="text-gray-600">Gestión y visualización de comisiones de mercaderistas</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={cargarComisiones} 
            variant="outline" 
            className="flex items-center gap-2"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button 
            onClick={exportarPlanilla} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            size="sm"
            disabled={loading || comisiones.length === 0}
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros superiores */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtro Regional */}
          <div>
            <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Regional
            </label>
            <select
              value={filtroRegional}
              onChange={(e) => setFiltroRegional(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas las regionales</option>
              {regionalOptions.map((regional) => (
                <option key={regional} value={regional}>{regional}</option>
              ))}
            </select>
          </div>

          {/* Buscador de Empleado */}
          <div>
            <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              Empleado
            </label>
            <SelectEmpleados
              value={filtroEmpleado || undefined}
              onChange={setFiltroEmpleado}
              placeholder="Buscar empleado..."
              className="w-full"
            />
          </div>

          {/* Filtro por Mes */}
          <div>
            <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Mes
            </label>
            <input
              type="month"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        {/* Información de filtros activos */}
        {(filtroRegional || filtroEmpleado || filtroMes) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Filtros activos:</span>
              {filtroRegional && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Regional: {filtroRegional}
                </span>
              )}
              {filtroEmpleado && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Empleado ID: {filtroEmpleado}
                </span>
              )}
              {filtroMes && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Mes: {new Date(filtroMes + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span className="text-gray-600">Cargando comisiones...</span>
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {comisiones.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Emp ID</TableHead>
                  <TableHead>Regional</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Tipo Mercaderista</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Mes Comisión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comisiones.map((c, idx) => {
                  const mes = c.mesComision
                  const mesFmt = mes ? String(mes).slice(0, 10) : '-'
                  const creadoFmt = c.createdAt ? String(c.createdAt).replace('T', ' ').slice(0, 16) : '-'
                  return (
                    <TableRow key={c.id ?? idx}>
                      <TableCell>{c.id ?? '-'}</TableCell>
                      <TableCell>{c.empId || c.empID || '-'}</TableCell>
                      <TableCell>{c.regional || '-'}</TableCell>
                      <TableCell>{c.canal || '-'}</TableCell>
                      <TableCell>{c.tipoMercaderista || '-'}</TableCell>
                      <TableCell>{c.ruta || '-'}</TableCell>
                      <TableCell>{c.cliente || '-'}</TableCell>
                      <TableCell>{mesFmt}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          c.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                          c.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          c.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {c.estado || 'Sin estado'}
                        </span>
                      </TableCell>
                      <TableCell>{creadoFmt}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No hay comisiones para mostrar.</p>
              {(filtroRegional || filtroEmpleado || filtroMes) && (
                <div className="mt-3">
                  <p className="text-sm">Con los filtros aplicados:</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {filtroRegional && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Regional: {filtroRegional}
                      </span>
                    )}
                    {filtroEmpleado && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Empleado ID: {filtroEmpleado}
                      </span>
                    )}
                    {filtroMes && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        Mes: {new Date(filtroMes + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}