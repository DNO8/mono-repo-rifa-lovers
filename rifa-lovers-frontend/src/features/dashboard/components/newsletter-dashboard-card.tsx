import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Mail, CheckCircle2, XCircle, Bell, BellOff } from 'lucide-react'
import { subscribeToNewsletter, unsubscribeFromNewsletter, checkSubscriptionStatus } from '@/api/newsletter.api'

interface NewsletterDashboardCardProps {
  email: string
  name?: string
}

export function NewsletterDashboardCard({ email, name }: NewsletterDashboardCardProps) {
  const [status, setStatus] = useState<'idle' | 'subscribing' | 'unsubscribing' | 'subscribed' | 'unsubscribed'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    checkSubscriptionStatus(email)
      .then(({ subscribed }) => {
        if (cancelled) return
        if (subscribed) {
          setStatus('subscribed')
          setMessage('Ya estás suscrito al newsletter.')
        }
      })
      .catch(() => {
        // ignore silently — failed check is not user-facing
      })
    return () => { cancelled = true }
  }, [email])

  const handleSubscribe = async () => {
    if (status === 'subscribing') return
    setStatus('subscribing')
    try {
      await subscribeToNewsletter(email, name)
      setStatus('subscribed')
      setMessage('¡Estás suscrito al newsletter!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('ya está suscrito')) {
        setStatus('subscribed')
        setMessage('Ya estás suscrito al newsletter.')
      } else {
        setStatus('idle')
        setMessage('No se pudo suscribir. Intenta de nuevo.')
      }
    }
  }

  const handleUnsubscribe = async () => {
    if (status === 'unsubscribing') return
    setStatus('unsubscribing')
    try {
      await unsubscribeFromNewsletter(email)
      setStatus('unsubscribed')
      setMessage('Te has dado de baja del newsletter.')
    } catch {
      setStatus('idle')
      setMessage('No se pudo procesar la baja. Intenta de nuevo.')
    }
  }

  const isSubscribed = status === 'subscribed'
  const isUnsubscribed = status === 'unsubscribed'
  const isLoading = status === 'subscribing' || status === 'unsubscribing'

  return (
    <Card className="p-4 glass-light">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${isSubscribed ? 'bg-green-100' : 'bg-primary/10'}`}>
          {isSubscribed ? (
            <Bell className="size-4 text-green-600" />
          ) : (
            <BellOff className="size-4 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">Newsletter</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {isSubscribed
              ? 'Recibes noticias de ganadores y nuevas rifas.'
              : 'Recibe noticias de ganadores, nuevas rifas y avisos importantes.'}
          </p>

          {isSubscribed && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600">
              <CheckCircle2 className="size-3.5" />
              <span className="font-medium">{message || 'Suscrito'}</span>
            </div>
          )}

          {isUnsubscribed && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-text-tertiary">
              <XCircle className="size-3.5" />
              <span>{message}</span>
            </div>
          )}

          {!isSubscribed && !isUnsubscribed && message && (
            <p className="text-xs text-text-tertiary mt-2">{message}</p>
          )}

          <div className="flex gap-2 mt-3">
            {!isSubscribed ? (
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Mail className="size-3.5" />
                )}
                {isLoading ? 'Procesando...' : 'Suscribirme'}
              </button>
            ) : (
              <button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-bg-white px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-text-tertiary disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <span className="size-3.5 border-2 border-text-tertiary/30 border-t-text-tertiary rounded-full animate-spin" />
                ) : (
                  <BellOff className="size-3.5" />
                )}
                {isLoading ? 'Procesando...' : 'Darme de baja'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
