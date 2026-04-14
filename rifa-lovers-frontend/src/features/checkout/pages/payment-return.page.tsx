import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CheckCircle, XCircle, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getPurchaseStatus } from '@/api/purchases.api'

type PaymentResult = 'loading' | 'success' | 'failed' | 'pending' | 'cancelled'

const MAX_ATTEMPTS = 8
const POLL_INTERVAL_MS = 2000

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [result, setResult] = useState<PaymentResult>(() => {
    if (!token) return 'cancelled'
    if (!sessionStorage.getItem('pending_purchase_id')) return 'pending'
    return 'loading'
  })
  const attemptsRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!token) return

    const purchaseId = sessionStorage.getItem('pending_purchase_id')
    if (!purchaseId) return

    const poll = async () => {
      try {
        const data = await getPurchaseStatus(purchaseId)
        if (data.status === 'paid') {
          sessionStorage.removeItem('pending_purchase_id')
          setResult('success')
          return
        }
        if (data.status === 'failed') {
          sessionStorage.removeItem('pending_purchase_id')
          setResult('failed')
          return
        }
      } catch {
        // Error de red — contar como intento fallido
      }

      attemptsRef.current += 1
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setResult('pending')
        return
      }

      timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
    }

    timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [token])

  if (result === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner size="lg" />
        <p className="text-text-secondary text-lg">Verificando tu pago...</p>
      </div>
    )
  }

  const config: Record<Exclude<PaymentResult, 'loading'>, {
    icon: React.ElementType
    iconColor: string
    iconBg: string
    title: string
    description: string
    primaryLabel: string
    primaryTo: string
    secondaryLabel?: string
    secondaryTo?: string
  }> = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-success',
      iconBg: 'bg-success/10',
      title: '¡Pago confirmado!',
      description: 'Tu compra fue procesada exitosamente. Tus LuckyPasses ya están disponibles en tu dashboard.',
      primaryLabel: 'Ver mis LuckyPasses',
      primaryTo: '/dashboard',
    },
    failed: {
      icon: XCircle,
      iconColor: 'text-error',
      iconBg: 'bg-error/10',
      title: 'Pago rechazado',
      description: 'El pago no pudo ser procesado. Puedes intentar nuevamente con otro método de pago.',
      primaryLabel: 'Intentar de nuevo',
      primaryTo: '/checkout',
      secondaryLabel: 'Ir al inicio',
      secondaryTo: '/',
    },
    pending: {
      icon: Clock,
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10',
      title: 'Pago en verificación',
      description: 'Tu pago está siendo verificado. Revisa tu dashboard en unos minutos — tus LuckyPasses aparecerán ahí.',
      primaryLabel: 'Ir al Dashboard',
      primaryTo: '/dashboard',
    },
    cancelled: {
      icon: ArrowLeft,
      iconColor: 'text-text-secondary',
      iconBg: 'bg-surface-secondary/40',
      title: 'Pago cancelado',
      description: 'Volviste antes de completar el pago. Tu reserva no fue procesada.',
      primaryLabel: 'Volver al checkout',
      primaryTo: '/checkout',
      secondaryLabel: 'Ir al inicio',
      secondaryTo: '/',
    },
  }

  const { icon: Icon, iconColor, iconBg, title, description, primaryLabel, primaryTo, secondaryLabel, secondaryTo } = config[result]

  return (
    <div className="px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-md text-center">
        <Card variant="soft-purple" className="p-10">
          <div className={`size-16 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-6`}>
            <Icon className={`size-8 ${iconColor}`} />
          </div>

          <h1 className="text-2xl font-extrabold text-text-primary mb-2">
            {title}
          </h1>
          <p className="text-text-secondary mb-8">
            {description}
          </p>

          <div className="flex flex-col gap-3">
            <Link to={primaryTo}>
              <Button variant="primary" size="lg" className="w-full cursor-pointer">
                {primaryLabel}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            {secondaryLabel && secondaryTo && (
              <Link to={secondaryTo}>
                <Button variant="ghost" size="lg" className="w-full cursor-pointer">
                  {secondaryLabel}
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
