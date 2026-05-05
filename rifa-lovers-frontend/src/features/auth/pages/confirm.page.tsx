import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

type ConfirmType = 'recovery' | 'signup' | null

function parseHash() {
  const hash = window.location.hash
  if (!hash || hash.length < 2) {
    return { error: 'Enlace inválido o expirado.', success: null, confirmType: null, recoveryToken: null, recoveryEmail: null }
  }

  const hashParams = new URLSearchParams(hash.substring(1))
  const accessToken = hashParams.get('access_token')
  const type = hashParams.get('type')

  if (!accessToken) {
    return { error: 'Token no encontrado en el enlace.', success: null, confirmType: null, recoveryToken: null, recoveryEmail: null }
  }

  if (type === 'signup') {
    return {
      error: null,
      success: '¡Tu email ha sido verificado exitosamente! Ya puedes iniciar sesión.',
      confirmType: 'signup' as ConfirmType,
      recoveryToken: null,
      recoveryEmail: null,
    }
  }

  if (type === 'recovery') {
    try {
      const parts = accessToken.split('.')
      if (parts.length !== 3) {
        return { error: 'Token inválido.', success: null, confirmType: 'recovery' as ConfirmType, recoveryToken: null, recoveryEmail: null }
      }
      const payload = JSON.parse(atob(parts[1]))
      const email = payload.email
      if (!email) {
        return { error: 'No se pudo obtener el email del token.', success: null, confirmType: 'recovery' as ConfirmType, recoveryToken: null, recoveryEmail: null }
      }
      return { error: null, success: null, confirmType: 'recovery' as ConfirmType, recoveryToken: accessToken, recoveryEmail: email }
    } catch {
      return { error: 'Error al procesar el token. Solicita un nuevo enlace.', success: null, confirmType: 'recovery' as ConfirmType, recoveryToken: null, recoveryEmail: null }
    }
  }

  return { error: 'Tipo de confirmación no válido.', success: null, confirmType: null, recoveryToken: null, recoveryEmail: null }
}

export default function ConfirmPage() {
  const navigate = useNavigate()
  const [error] = useState<string | null>(() => parseHash().error)
  const [success] = useState<string | null>(() => parseHash().success)
  const [confirmType] = useState<ConfirmType>(() => parseHash().confirmType)
  const [recoveryToken] = useState<string | null>(() => parseHash().recoveryToken)
  const [recoveryEmail] = useState<string | null>(() => parseHash().recoveryEmail)

  useEffect(() => {
    if (recoveryToken && recoveryEmail) {
      navigate(`/reset-password?token=${encodeURIComponent(recoveryToken)}&email=${encodeURIComponent(recoveryEmail)}`, {
        replace: true,
      })
    }
  }, [navigate, recoveryToken, recoveryEmail])

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
      <>
        <SEOHead title="Email verificado" noindex />
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
      </>
    )
  }

  return (
    <>
      <SEOHead title="Verificando email..." noindex />
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
    </>
  )
}
