import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import { toast } from 'react-toastify'

const COOLDOWN_MINUTES = 5
const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || 'tu correo'
  
  const [isResending, setIsResending] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(() => {
    // Initialize cooldown from localStorage
    const lastSent = localStorage.getItem(`resend-confirmation-${email}`)
    if (lastSent) {
      const elapsed = Date.now() - parseInt(lastSent, 10)
      const remaining = COOLDOWN_MS - elapsed
      if (remaining > 0) {
        return Math.ceil(remaining / 1000)
      }
    }
    return 0
  })

  useEffect(() => {
    // Countdown timer
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownRemaining])

  const handleResendConfirmation = async () => {
    if (cooldownRemaining > 0 || isResending) return

    setIsResending(true)
    try {
      await apiClient.post<{ message: string }>(ENDPOINTS.auth.resendConfirmation, { email })
      toast.success('Email de confirmación reenviado. Revisa tu bandeja de entrada.')
      
      // Set cooldown
      localStorage.setItem(`resend-confirmation-${email}`, Date.now().toString())
      setCooldownRemaining(COOLDOWN_MINUTES * 60)
    } catch {
      toast.error('Error al reenviar el email. Intenta más tarde.')
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card variant="glass" className="w-full max-w-md p-8 md:p-10 text-center">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📧</span>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mb-2">
          Verifica tu correo
        </h1>
        <p className="text-sm text-text-secondary mb-4">
          Hemos enviado un enlace de confirmación a <strong className="text-primary">{email}</strong>
        </p>
        <p className="text-sm text-text-secondary mb-6">
          Haz clic en el enlace del correo para activar tu cuenta. Una vez confirmado, podrás iniciar sesión.
        </p>
        <div className="space-y-3">
          <Button onClick={() => navigate('/login')} className="w-full">
            Ir al login
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
            Volver al inicio
          </Button>
        </div>
        <p className="mt-6 text-xs text-text-secondary">
          ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
          <button
            onClick={handleResendConfirmation}
            disabled={cooldownRemaining > 0 || isResending}
            className="text-primary hover:underline disabled:text-text-tertiary disabled:cursor-not-allowed"
          >
            {isResending ? 'Enviando...' : cooldownRemaining > 0 ? `reenviar en ${formatTime(cooldownRemaining)}` : 'reenviar email'}
          </button>
        </p>
      </Card>
    </section>
  )
}
