interface SelectTipoMercaderistaProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

const opciones = [
  'Mercaderista',
  'Checkout-Mercaderista',
  'Fiambrera',
]

export function SelectTipoMercaderista({
  value = '',
  onChange,
  placeholder = 'Seleccionar tipo...',
  className = '',
  disabled = false,
  required = false,
}: SelectTipoMercaderistaProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white pr-8"
      >
        <option value="">{placeholder}</option>
        {opciones.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        {/* Chevron visual acorde a los otros selects */}
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/></svg>
      </div>
    </div>
  )
}

