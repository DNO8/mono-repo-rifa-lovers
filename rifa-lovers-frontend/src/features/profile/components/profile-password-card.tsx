import { Lock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { PasswordField } from './password-field'
import type { PasswordFormData } from '../schemas/profile.schema'

interface ProfilePasswordCardProps {
  password: PasswordFormData
  error: { field: string; message: string } | null
  onChange: (field: keyof PasswordFormData, value: string) => void
}

export function ProfilePasswordCard({
  password,
  error,
  onChange,
}: ProfilePasswordCardProps) {
  const getFieldError = (field: string) =>
    error?.field === field ? error.message : null

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-secondary/10">
          <Lock className="size-5 text-secondary" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Cambiar contraseña</h2>
      </div>

      <div className="space-y-4">
        <PasswordField
          label="Contraseña actual"
          value={password.currentPassword}
          onChange={(v) => onChange('currentPassword', v)}
          placeholder="Ingresa tu contraseña actual"
          maxLength={100}
          error={getFieldError('currentPassword')}
        />

        <PasswordField
          label="Nueva contraseña"
          value={password.newPassword}
          onChange={(v) => onChange('newPassword', v)}
          placeholder="Mínimo 9 caracteres"
          maxLength={100}
          error={getFieldError('newPassword')}
        />

        <PasswordField
          label="Confirmar contraseña"
          value={password.confirmPassword}
          onChange={(v) => onChange('confirmPassword', v)}
          placeholder="Repite la nueva contraseña"
          maxLength={100}
          error={getFieldError('confirmPassword')}
        />

        <p className="text-xs text-text-tertiary">
          Deja los campos de contraseña en blanco si no deseas cambiarla.
        </p>
      </div>
    </Card>
  )
}
