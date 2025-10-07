import { useEffect, useState } from 'react'
import { ChevronDown, Loader2, User } from 'lucide-react'
import { mercaderistasService, type MercaderistaItem } from '../../../services'

interface SelectMercaderistasProps {
  value?: number | string
  onChange?: (value: number | string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export function SelectMercaderistas({
  value = '',
  onChange,
  placeholder = 'Seleccionar mercaderista...',
  className = '',
  disabled = false,
  required = false,
}: SelectMercaderistasProps) {
  const [items, setItems] = useState<MercaderistaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await mercaderistasService.getMercaderistas()
        setItems(data)
      } catch (e) {
        console.error(e)
        setError('Error al cargar mercaderistas')
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
            {it.nombre}
            {it.tipo ? ` - ${it.tipo}` : ''}
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
          <User className="w-3 h-3" /> {error}
        </div>
      )}
    </div>
  )
}

