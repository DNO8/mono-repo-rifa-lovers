import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

type ConfirmType = 'recovery' | 'signup' | null

export default function ConfirmPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [confirmType, setConfirmType] = useState<ConfirmType>(null)

  useEffect(() => {
    // Parse hash fragment (everything after #)
    const hash = window.location.hash
    if (!hash || hash.length < 2) {
      setError('Enlace inválido o expirado.')
      return
    }

    // Remove the leading # and parse as query params
    const hashParams = new URLSearchParams(hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')

    if (!accessToken) {
      setError('Token no encontrado en el enlace.')
      return
    }

    // Handle signup confirmation
    if (type === 'signup') {
      setConfirmType('signup')
      // Supabase has already verified the email server-side
      // Just show success and redirect to login
      setSuccess('¡Tu email ha sido verificado exitosamente! Ya puedes iniciar sesión.')
      return
    }

    // Handle password recovery
    if (type === 'recovery') {
      setConfirmType('recovery')
      try {
        // Decode JWT payload to extract email
        const parts = accessToken.split('.')
        if (parts.length !== 3) {
          setError('Token inválido.')
          return
        }

        const payload = JSON.parse(atob(parts[1]))
        const email = payload.email

        if (!email) {
          setError('No se pudo obtener el email del token.')
          return
        }

        // Redirect to reset-password page with token and email as query params
        navigate(`/reset-password?token=${encodeURIComponent(accessToken)}&email=${encodeURIComponent(email)}`, {
          replace: true,
        })
      } catch {
        setError('Error al procesar el token. Solicita un nuevo enlace.')
      }
      return
    }

    // Unknown type
    setError('Tipo de confirmación no válido.')
  }, [navigate])

  if (error) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <Card variant="glass" className="w-full max-w-md p-8 md:p-10 text-center">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mb-2">
            Error de confirmación
          </h1>
          <p className="text-sm text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate(confirmType === 'signup' ? '/register' : '/forgot-password')}
            className="text-primary font-semibold hover:underline"
          >
            {confirmType === 'signup' ? 'Volver al registro' : 'Solicitar nuevo enlace'}
          </button>
        </Card>
      </section>
    )
  }

  if (success) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <Card variant="glass" className="w-full max-w-md p-8 md:p-10 text-center">
          <div className="size-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mb-2">
            Email verificado
          </h1>
          <p className="text-sm text-text-secondary mb-6">{success}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-primary font-semibold hover:underline"
          >
            Iniciar sesión
          </button>
        </Card>
      </section>
    )
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card variant="glass" className="w-full max-w-md p-8 md:p-10 text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">Procesando...</h1>
        <p className="text-sm text-text-secondary">
          {confirmType === 'signup' 
            ? 'Verificando tu email...' 
            : 'Estamos verificando tu enlace de recuperación.'}
        </p>
      </Card>
    </section>
  )
}
