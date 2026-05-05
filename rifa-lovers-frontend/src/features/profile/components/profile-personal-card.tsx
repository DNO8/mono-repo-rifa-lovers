import { User, Mail, Phone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ProfileField } from './profile-field'
import type { ProfileFormData } from '../schemas/profile.schema'

interface ProfilePersonalCardProps {
  profile: ProfileFormData
  email: string
  error: { field: string; message: string } | null
  onChange: (field: keyof ProfileFormData, value: string) => void
}

const inputBase =
  'w-full rounded-lg border border-border-light bg-bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-text-tertiary transition-colors'

export function ProfilePersonalCard({
  profile,
  email,
  error,
  onChange,
}: ProfilePersonalCardProps) {
  const getFieldError = (field: string) =>
    error?.field === field ? error.message : null

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <User className="size-5 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Datos personales</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileField
          label="Nombre"
          value={profile.firstName}
          onChange={(v) => onChange('firstName', v)}
          placeholder="Tu nombre"
          maxLength={120}
          error={getFieldError('firstName')}
        />

        <ProfileField
          label="Apellido"
          value={profile.lastName}
          onChange={(v) => onChange('lastName', v)}
          placeholder="Tu apellido"
          maxLength={120}
          error={getFieldError('lastName')}
        />

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
            <input
              type="email"
              value={email}
              disabled
              className={`${inputBase} pl-9 bg-bg-muted cursor-not-allowed`}
            />
          </div>
          <p className="text-xs text-text-tertiary mt-1">
            El correo no se puede modificar.
          </p>
        </div>

        <div className="sm:col-span-2">
          <ProfileField
            label="Teléfono"
            value={profile.phone}
            onChange={(v) => onChange('phone', v.replace(/[^\d+]/g, ''))}
            placeholder="56912345678"
            type="tel"
            icon={Phone}
            error={getFieldError('phone')}
          />
        </div>
      </div>
    </Card>
  )
}
