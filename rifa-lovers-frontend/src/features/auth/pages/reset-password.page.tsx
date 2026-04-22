import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import { toast } from 'react-toastify'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !email) {
      setError('Enlace inválido o expirado. Solicita un nuevo enlace de recuperación.')
    }
  }, [token, email])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      // Update password via backend API
      const response = await apiClient.post<{ success: boolean; message: string }>(ENDPOINTS.auth.resetPassword, {
        token,
        email,
        password,
      })

      if (!response.data.success) {
        setError(response.data.message)
        return
      }

      setIsSuccess(true)
      toast.success('Contraseña actualizada exitosamente')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login?reset=success')
      }, 3000)
    } catch {
      setError('Error al actualizar la contraseña. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <Card variant="glass" className="w-full max-w-md p-8 md:p-10 text-center">
          <div className="size-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="size-8 text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mb-2">
            ¡Contraseña actualizada!
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Tu contraseña ha sido restablecida exitosamente. 
            Serás redirigido al login en unos segundos...
          </p>
          <Link to="/login">
            <Button variant="primary" size="lg" className="w-full">
              Ir al login ahora
            </Button>
          </Link>
        </Card>
      </section>
    )
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card variant="glass" className="w-full max-w-md p-8 md:p-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/images/logos/logo-v2.webp" alt="RifaLovers" className="h-8 w-auto" />
            <span className="text-xl gradient-text leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <span className="font-bold">Rifa</span><span className="font-semibold"> Lovers</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Nueva contraseña
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Ingresa tu nueva contraseña para {email}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-text-primary mb-1.5">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full h-10 px-4 pl-10 pr-10 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-text-primary mb-1.5">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full h-10 px-4 pl-10 pr-10 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
            </div>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full" 
            loading={isLoading}
            disabled={!token || !email}
          >
            Actualizar contraseña
          </Button>
        </form>

        <p className="text-sm text-text-secondary text-center mt-6">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Volver al login
          </Link>
        </p>
      </Card>
    </section>
  )
}
