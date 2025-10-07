import { useEffect, useState } from 'react'

type Comision = any

export default function PlanillaComisiones() {
  const [comisiones, setComisiones] = useState<Comision[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('http://localhost:3000/comisiones')
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }
        const json = await res.json()
        const lista = Array.isArray(json) ? json : (json?.data ?? [])
        if (!cancelado) setComisiones(lista)
      } catch (e: any) {
        if (!cancelado) setError(e?.message || 'Error al cargar comisiones')
      } finally {
        if (!cancelado) setLoading(false)
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Planilla de Comisiones</h1>

      {loading && (
        <p className="text-gray-600">Cargando comisiones...</p>
      )}

      {error && (
        <div className="p-3 border border-red-300 bg-red-50 text-red-700 rounded">{error}</div>
      )}

      {!loading && !error && (
        <div className="mt-4">
          {Array.isArray(comisiones) && comisiones.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2 border">ID</th>
                    <th className="text-left p-2 border">Mercaderista</th>
                    <th className="text-left p-2 border">Regional</th>
                    <th className="text-left p-2 border">Tipo</th>
                    <th className="text-left p-2 border">Ruta</th>
                    <th className="text-left p-2 border">Cliente</th>
                    <th className="text-left p-2 border">Mes Comisión</th>
                    <th className="text-left p-2 border">Estado</th>
                    <th className="text-left p-2 border">Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {comisiones.map((c: any, idx: number) => {
                    const mes = c.mesComision || c.mes || c.periodo
                    const mesFmt = mes ? String(mes).slice(0, 10) : '-'
                    const creadoFmt = c.createdAt ? String(c.createdAt).replace('T', ' ').slice(0, 16) : '-'
                    return (
                      <tr key={c.id ?? idx}>
                        <td className="p-2 border">{c.id ?? '-'}</td>
                        <td className="p-2 border">{c.mercaderista || '-'}</td>
                        <td className="p-2 border">{c.regional || '-'}</td>
                        <td className="p-2 border">{c.tipoMercaderista || '-'}</td>
                        <td className="p-2 border">{c.ruta || '-'}</td>
                        <td className="p-2 border">{c.cliente || '-'}</td>
                        <td className="p-2 border">{mesFmt}</td>
                        <td className="p-2 border">{c.estado || '-'}</td>
                        <td className="p-2 border">{creadoFmt}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No hay comisiones para mostrar.</p>
          )}
        </div>
      )}
    </div>
  )
}