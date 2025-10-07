import { useEffect, useState } from 'react'
import { ChevronDown, Loader2, Map } from 'lucide-react'
import { rutasService, type RutaItem } from '../../../services'

interface SelectRutasProps {
  value?: string | number
  onChange?: (value: string | number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function SelectRutas({
  value = '',
  onChange,
  placeholder = 'Seleccionar ruta...',
  className = '',
  disabled = false,
  required = false,
}: SelectRutasProps) {
  const [items, setItems] = useState<RutaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await rutasService.getRutas()
        setItems(data)
      } catch (e) {
        console.error(e)
        setError('Error al cargar rutas')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className={`relative ${className}`}>
      <select
        value={value as any}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled || isLoading}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white ${isLoading ? 'pr-8' : 'pr-8'}`}
      >
        <option value="">{placeholder}</option>
        {items.map((it) => (
          <option key={it.id} value={it.id}>
            {it.codigo ? `${it.codigo} - ${it.nombre}` : it.nombre}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </div>
      {error && (
        <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <Map className="w-3 h-3" /> {error}
        </div>
      )}
    </div>
  )
}

