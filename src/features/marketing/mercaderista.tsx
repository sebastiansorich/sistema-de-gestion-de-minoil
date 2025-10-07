import { useEffect, useState } from 'react'
import { Plus, Upload, Save, Edit, Trash2 } from 'lucide-react'
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui'
import { SelectTipoMercaderista } from '../../components/ui'
import { comisionesService, type Comision } from '../../services/comisionesService'

type Filtro = {
  regional?: string
  canal?: string
  mes?: string
  mercaderistaId?: string | number
  tipo?: string
  rutaId?: string | number
  clienteCode?: string
}

type Registro = {
  id: number
  regional: string
  canal: string
  mercaderista: string
  empId: number | null // Agregado empId
  tipo: string
  ruta: string
  cliente: string
  ultimaModificacion: string
  usuario: string
}

const REGIONALES = ['Santa Cruz', 'La Paz', 'Cochabamba']
const CANALES = ['Moderno', 'Tradicional']

export default function MercaderistaComisiones() {
  const [filtros, setFiltros] = useState<Filtro>({})
  const [registros, setRegistros] = useState<Registro[]>([])
  const [editId, setEditId] = useState<number | null>(null)
  const listo = Boolean(filtros.regional && filtros.canal && filtros.mes)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      if (!listo) return
      try {
        setLoading(true)
        setError(null)
        const mesComision = filtros.mes ? `${filtros.mes}-01` : undefined
        const { data } = await comisionesService.getAll({
          regional: filtros.regional,
          canal: filtros.canal,
          mesComision,
          limit: 100,
          sortBy: 'createdAt',
          sortDir: 'desc'
        })
        const adaptados: Registro[] = (data as Comision[]).map((c) => ({
          id: c.id,
          regional: c.regional || '',
          canal: c.canal || '',
          mercaderista: '', // Campo removido del backend, mantener vacío en UI
          empId: c.empId || null, // Agregado empId
          tipo: c.tipoMercaderista || '',
          ruta: c.ruta || '',
          cliente: c.cliente || '',
          ultimaModificacion: c.updatedAt || c.createdAt || '',
          usuario: ''
        }))
        setRegistros(adaptados)
      } catch (e: any) {
        setError(e?.message || 'Error al cargar comisiones')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [listo, filtros.regional, filtros.canal, filtros.mes])

  const handleFiltro = (partial: Partial<Filtro>) => setFiltros((f) => ({ ...f, ...partial }))

  const handleAgregar = () => {
    const nuevo: Registro = {
      id: -Date.now(),
      regional: filtros.regional || '',
      canal: filtros.canal || '',
      mercaderista: '',
      empId: null, // Agregado empId
      tipo: filtros.tipo || '',
      ruta: '',
      cliente: '',
      ultimaModificacion: new Date().toISOString().slice(0, 16).replace('T', ' '),
      usuario: ''
    }
    setRegistros((prev) => [nuevo, ...prev])
    setEditId(nuevo.id)
  }

  const handleGuardar = async () => {
    if (editId == null) return
    const actual = registros.find((r) => r.id === editId)
    if (!actual) return
    
    // Validar campos requeridos
    if (!actual.empId) {
      alert('El campo Emp ID es requerido')
      return
    }
    if (!actual.tipo.trim()) {
      alert('El campo Tipo es requerido')
      return
    }
    if (!actual.ruta.trim()) {
      alert('El campo Ruta es requerido')
      return
    }
    if (!actual.cliente.trim()) {
      alert('El campo Cliente es requerido')
      return
    }
    if (!filtros.canal) {
      alert('El campo Canal es requerido')
      return
    }

    const payload: Partial<Comision> = {
      // Removido 'mercaderista' - el backend no lo acepta
      empId: actual.empId, // Agregado empId
      tipoMercaderista: actual.tipo,
      ruta: actual.ruta,
      cliente: actual.cliente,
      regional: filtros.regional,
      canal: filtros.canal, // Agregado canal como string
      mesComision: filtros.mes ? `${filtros.mes}-01` : undefined,
    }
    
    try {
      setLoading(true)
      let guardado: Comision
      if (actual.id < 0) {
        // Crear nueva comisión
        console.log('🔄 Creando nueva comisión:', payload)
        guardado = await comisionesService.create(payload)
        console.log('✅ Comisión creada:', guardado)
        setRegistros((prev) => prev.map((r) => (r.id === actual.id ? {
          ...r,
          id: guardado.id,
          ultimaModificacion: guardado.updatedAt || guardado.createdAt || r.ultimaModificacion
        } : r)))
      } else {
        // Actualizar comisión existente
        console.log('🔄 Actualizando comisión:', actual.id, payload)
        guardado = await comisionesService.update(actual.id, payload)
        console.log('✅ Comisión actualizada:', guardado)
        setRegistros((prev) => prev.map((r) => (r.id === actual.id ? {
          ...r,
          ultimaModificacion: guardado.updatedAt || guardado.createdAt || r.ultimaModificacion
        } : r)))
      }
      setEditId(null)
    } catch (e: any) {
      console.error('❌ Error al guardar:', e)
      alert(`Error al guardar: ${e?.message || 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImportar = () => {
    // Simulación de importación
    console.log('Importar (simulado)')
  }

  const actualizarCampo = (id: number, campo: keyof Registro, valor: string | number | null) => {
    setRegistros((prev) => prev.map((r) => (r.id === id ? { ...r, [campo]: valor } : r)))
  }

  const eliminar = async (id: number) => {
    try {
      if (id > 0) {
        await comisionesService.delete(id)
      }
      setRegistros((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Gestión de comisiones de mercaderistas</p>
        </div>
        {listo && (
          <div className="flex gap-2">
            <Button onClick={handleImportar} variant="outline" className="flex items-center gap-2  bg-white" size="sm">
              <Upload className="w-4 h-4" /> Importar
            </Button>
            <Button onClick={handleGuardar} className="flex items-center gap- bg-blue-300"  size="sm">
              <Save className="w-4 h-4" /> Guardar
            </Button>
            <Button onClick={handleAgregar} className="flex items-center gap- bg-yellow-300" size="sm">
              <Plus className="w-4 h-4" /> Agregar
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
            <div>
              <label className="text-xs text-gray-600">Regional</label>
              <select
                value={filtros.regional || ''}
                onChange={(e) => handleFiltro({ regional: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccionar regional</option>
                {REGIONALES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Canal</label>
              <select
                value={filtros.canal || ''}
                onChange={(e) => handleFiltro({ canal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccionar canal</option>
                {CANALES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Mes</label>
              <input
                type="month"
                value={filtros.mes || ''}
                onChange={(e) => handleFiltro({ mes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
           
          </div>
        </div>
      </div>

      {listo && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {loading && (
            <div className="p-4 text-gray-600">Cargando...</div>
          )}
          {error && (
            <div className="p-4 text-red-600">{error}</div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emp ID</TableHead>
                <TableHead>Tipo de Mercaderista</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Última Modificación</TableHead>
                <TableHead>Usuario que modificó</TableHead>
                <TableHead className="w-28">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    {editId === r.id ? (
                      <input
                        type="number"
                        className="w-full px-2 py-1 border rounded"
                        value={r.empId || ''}
                        onChange={(e) => actualizarCampo(r.id, 'empId', e.target.value ? Number(e.target.value) : null)}
                        placeholder="Emp ID"
                      />
                    ) : (
                      r.empId || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === r.id ? (
                      <SelectTipoMercaderista
                        value={r.tipo}
                        onChange={(v) => actualizarCampo(r.id, 'tipo', v)}
                      />
                    ) : (
                      r.tipo
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === r.id ? (
                      <input
                        className="w-full px-2 py-1 border rounded"
                        value={r.ruta}
                        onChange={(e) => actualizarCampo(r.id, 'ruta', e.target.value)}
                      />
                    ) : (
                      r.ruta
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === r.id ? (
                      <input
                        className="w-full px-2 py-1 border rounded"
                        value={r.cliente}
                        onChange={(e) => actualizarCampo(r.id, 'cliente', e.target.value)}
                      />
                    ) : (
                      r.cliente
                    )}
                  </TableCell>
                  <TableCell>{r.ultimaModificacion}</TableCell>
                  <TableCell>{r.usuario}</TableCell>
                  <TableCell>
                    {editId === r.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => setEditId(null)} className="h-8 px-2 bg-gray-500 text-white" >
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={handleGuardar} className="h-8 px-2 bg-blue-500 text-white" disabled={loading}>
                          <Save className="w-4 h-4" />
                          {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setEditId(r.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600" onClick={() => eliminar(r.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}


