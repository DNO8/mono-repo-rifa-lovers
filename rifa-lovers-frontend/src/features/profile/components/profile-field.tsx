import { type LucideIcon } from 'lucide-react'

interface ProfileFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'password'
  icon?: LucideIcon
  error?: string | null
  disabled?: boolean
  maxLength?: number
  inputClassName?: string
}

const inputBase =
  'w-full rounded-lg border border-border-light bg-bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-text-tertiary transition-colors'
const errorClass = 'border-red-400 focus:border-red-400 focus:ring-red-200'

export function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon: Icon,
  error,
  disabled,
  maxLength,
  inputClassName,
}: ProfileFieldProps) {
  const hasError = !!error
  const baseClasses = Icon ? `${inputBase} pl-9` : inputBase
  const classes = hasError ? `${baseClasses} ${errorClass}` : baseClasses

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName ?? classes}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
        />
      </div>
      {hasError && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
