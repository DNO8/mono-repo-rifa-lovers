import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CheckCircle, XCircle, Clock, ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { verifyFlowPaymentStatus } from '@/api/payments.api'

type PaymentResult = 'loading' | 'success' | 'failed' | 'pending' | 'cancelled'

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [result, setResult] = useState<PaymentResult>(() => {
    if (!token) return 'cancelled'
    if (!sessionStorage.getItem('pending_purchase_id')) return 'pending'
    return 'loading'
  })

  useEffect(() => {
    if (!token) return

    const verifyFlowStatus = async () => {
      try {
        const flowData = await verifyFlowPaymentStatus({ token })
        // Flow status: 1=pendiente, 2=pagada, 3=rechazada, 4=anulada
        if (flowData.flowStatus === 2) {
          sessionStorage.removeItem('pending_purchase_id')
          setResult('success')
        } else if (flowData.flowStatus === 3 || flowData.flowStatus === 4) {
          sessionStorage.removeItem('pending_purchase_id')
          setResult('failed')
        } else {
          // Status 1 (pendiente) después de retry agotado en backend
          setResult('pending')
        }
      } catch (error) {
        console.error('Error verificando estado en Flow:', error)
        setResult('pending')
      }
    }

    verifyFlowStatus()
  }, [token])

  if (result === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner size="lg" />
        <p className="text-text-secondary text-lg">Verificando tu pago con Flow...</p>
        <p className="text-text-tertiary text-sm">Esto puede tomar unos segundos</p>
      </div>
    )
  }

  const config: Record<Exclude<PaymentResult, 'loading'>, {
    icon: LucideIcon
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
