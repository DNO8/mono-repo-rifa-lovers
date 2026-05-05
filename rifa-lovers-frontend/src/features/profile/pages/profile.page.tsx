import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { ArrowLeft } from 'lucide-react'
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
import { ProfilePersonalCard } from '../components/profile-personal-card'
import { ProfilePasswordCard } from '../components/profile-password-card'
import { ProfileFormActions } from '../components/profile-form-actions'

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const refreshUser = useAuthStore((s) => s.refreshUser)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{ field: string; message: string } | null>(null)

  const [profile, setProfile] = useState<ProfileFormData>(() => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: String(user?.phone ?? '').replace(/[^\d+]/g, ''),
  }))

  const [password, setPassword] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
    setProfile((prev: ProfileFormData) => ({ ...prev, [field]: value }))
    if (error?.field === field) setError(null)
  }

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPassword((prev: PasswordFormData) => ({ ...prev, [field]: value }))
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
      const payload: { firstName: string; lastName: string; phone: string; currentPassword?: string; newPassword?: string } = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      }

      if (password.newPassword.length > 0) {
        payload.currentPassword = password.currentPassword
        payload.newPassword = password.newPassword
      }

      await updateProfile(payload)
      await refreshUser()
      toast.success('Perfil actualizado correctamente')
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' })
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

  return (
    <>
      <SEOHead title="Mi Perfil" noindex />
      <div className="px-4 md:px-8 py-8 md:py-12">
        <div className="mx-auto max-w-[600px]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="self-start"
            >
              <ArrowLeft className="size-4 mr-1" />
              Volver
            </Button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              Mi Perfil
            </h1>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <ProfilePersonalCard
              profile={profile}
              email={user?.email ?? ''}
              error={error}
              onChange={handleProfileChange}
            />

            <ProfilePasswordCard
              password={password}
              error={error}
              onChange={handlePasswordChange}
            />

            <ProfileFormActions
              isLoading={isLoading}
              onCancel={() => navigate('/dashboard')}
            />
          </form>
        </div>
      </div>
    </>
  )
}
