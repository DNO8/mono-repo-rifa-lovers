import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { ArrowLeft, Save, User, Lock, Eye, EyeOff, Mail, Phone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { updateProfile } from '@/api/users.api'
import { ApiError } from '@/api/client'
import {
  validateProfile,
  validatePassword,
  type ProfileFormData,
  type PasswordFormData,
} from '../schemas/profile.schema'

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const refreshUser = useAuthStore((s) => s.refreshUser)

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<{ field: string; message: string } | null>(null)

  const [profile, setProfile] = useState<ProfileFormData>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
  })

  const [password, setPassword] = useState<PasswordFormData>({
    newPassword: '',
    confirmPassword: '',
  })

  const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    if (error?.field === field) setError(null)
  }

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPassword((prev) => ({ ...prev, [field]: value }))
    if (error?.field === field) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const profileError = validateProfile(profile)
    if (profileError) {
      setError(profileError)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsLoading(true)
    try {
      const payload: { firstName: string; lastName: string; phone: string; newPassword?: string } = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      }

      if (password.newPassword.length > 0) {
        payload.newPassword = password.newPassword
      }

      await updateProfile(payload)
      await refreshUser()
      toast.success('Perfil actualizado correctamente')
      setPassword({ newPassword: '', confirmPassword: '' })
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.getUserMessage('general'))
      } else {
        toast.error('No se pudo actualizar el perfil. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const inputBase = 'w-full rounded-lg border border-border-light bg-bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-text-tertiary transition-colors'
  const errorClass = 'border-red-400 focus:border-red-400 focus:ring-red-200'

  return (
    <>
      <SEOHead title="Mi Perfil" noindex />
    <div className="px-4 md:px-8 py-8 md:py-12">
      <div className="mx-auto max-w-[600px]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline-primary" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="size-4 mr-1.5" />
              Volver
            </Button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              Mi Perfil
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos personales */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="size-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">Datos personales</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    className={
                      error?.field === 'firstName'
                        ? `${inputBase} ${errorClass}`
                        : inputBase
                    }
                    placeholder="Tu nombre"
                    maxLength={120}
                  />
                  {error?.field === 'firstName' && (
                    <p className="text-xs text-red-500 mt-1">{error.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    className={
                      error?.field === 'lastName'
                        ? `${inputBase} ${errorClass}`
                        : inputBase
                    }
                    placeholder="Tu apellido"
                    maxLength={120}
                  />
                  {error?.field === 'lastName' && (
                    <p className="text-xs text-red-500 mt-1">{error.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary pointer-events-none" />
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    className={`${inputBase} pl-9 bg-bg-muted/50 cursor-not-allowed opacity-60`}
                  />
                </div>
                <p className="text-xs text-text-tertiary mt-1">
                  El correo no puede ser modificado.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary pointer-events-none" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className={
                      error?.field === 'phone'
                        ? `${inputBase} pl-9 ${errorClass}`
                        : `${inputBase} pl-9`
                    }
                    placeholder="56912345678"
                  />
                </div>
                {error?.field === 'phone' && (
                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Cambiar contraseña */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Lock className="size-5 text-secondary" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">Cambiar contraseña</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className={
                      error?.field === 'newPassword'
                        ? `${inputBase} pr-10 ${errorClass}`
                        : `${inputBase} pr-10`
                    }
                    placeholder="Mínimo 9 caracteres"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {error?.field === 'newPassword' && (
                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={password.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className={
                      error?.field === 'confirmPassword'
                        ? `${inputBase} pr-10 ${errorClass}`
                        : `${inputBase} pr-10`
                    }
                    placeholder="Repite la nueva contraseña"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {error?.field === 'confirmPassword' && (
                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                )}
              </div>

              <p className="text-xs text-text-tertiary">
                Deja ambos campos en blanco si no deseas cambiar tu contraseña.
              </p>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline-primary"
              className="w-full sm:w-auto justify-center"
              onClick={() => navigate('/dashboard')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                <>
                  <Save className="size-4 mr-1.5" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}
