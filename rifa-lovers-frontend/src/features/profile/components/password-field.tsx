import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string | null
  maxLength?: number
}

const inputBase =
  'w-full rounded-lg border border-border-light bg-bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-text-tertiary transition-colors pr-10'
const errorClass = 'border-red-400 focus:border-red-400 focus:ring-red-200'

export function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const hasError = !!error
  const classes = hasError ? `${inputBase} ${errorClass}` : inputBase

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={classes}
          placeholder={placeholder}
          maxLength={maxLength}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hasError && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
