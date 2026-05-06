import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'react-toastify'
import { ArrowLeft, CreditCard, Hash } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createPurchase } from '@/api/purchases.api'
import { initiatePayment } from '@/api/payments.api'
import { ApiError } from '@/api/client'
import { toastError, getErrorMessage } from '@/lib/errors'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { usePacks } from '@/hooks/use-packs'
import { Spinner } from '@/components/ui/spinner'
import { OrderSummary } from '../components/order-summary'
import { NumberSelectorGrid } from '../components/number-selector-grid'
import { ReservationTimer } from '../components/reservation-timer'

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const packIdParam = searchParams.get('packId') || ''
  const bonusTickets = 0

  const { raffle, isLoading: raffleLoading } = useActiveRaffle()
  const { packs, isLoading: packsLoading } = usePacks()

  const [selectedNumbers, setSelectedNumbers] = useState<(number | '')[]>([])
  const [numbersValid, setNumbersValid] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [reservationExpiresAt, setReservationExpiresAt] = useState<string | null>(null)

  const isLoading = raffleLoading || packsLoading

  const selectedPack = packs.find((p) => p.id === packIdParam) ?? packs[0]

  const raffleTitle = raffle?.title ?? 'Premio por confirmar'
  const maxTicketNumber = raffle?.maxTicketNumber ?? 30000
  const ticketCount = selectedPack?.luckyPassQuantity ?? 1
  const unitPrice = selectedPack ? selectedPack.price / selectedPack.luckyPassQuantity : 0
  const totalPrice = selectedPack ? selectedPack.price : 0

  const handleNumbersChange = (nums: (number | '')[]) => setSelectedNumbers(nums)
  const handleValidityChange = (valid: boolean) => setNumbersValid(valid)

  const handleConfirm = async () => {
    if (!raffle || !selectedPack) return
    if (!numbersValid) {
      toast.error('Uno o más números elegidos no están disponibles. Corrígelos antes de continuar.')
      return
    }
    setIsProcessing(true)
    try {
      // Generar llave de idempotencia para evitar duplicados
      const idempotencyKey = crypto.randomUUID()

      // Filtrar los números no vacíos para enviar al backend
      const filledNumbers = selectedNumbers.filter((n): n is number => n !== '')

      // 1. Crear la compra (quantity=1 pack)
      const purchase = await createPurchase({
        raffleId: raffle.id,
        packId: selectedPack.id,
        quantity: 1,
        selectedNumbers: filledNumbers.length > 0 ? filledNumbers : undefined,
      })

      // 2. Persistir la llave de idempotencia en sessionStorage
      sessionStorage.setItem(`idempotencyKey_${purchase.id}`, idempotencyKey)

      // 3. La reserva ya se hizo atómicamente en el backend dentro de createPurchase
      if (filledNumbers.length > 0) {
        setReservationExpiresAt(new Date(Date.now() + 15 * 60 * 1000).toISOString())
      }

      // 4. Iniciar el pago con Flow
      toast.info('Iniciando pago seguro con Flow...')
      const payment = await initiatePayment({
        purchaseId: purchase.id,
        idempotencyKey,
      })

      // 5. Guardar purchaseId para la página de retorno y redirigir a Flow
      sessionStorage.setItem('pending_purchase_id', purchase.id)
      toast.success('Redirigiendo a plataforma de pago...')
      window.location.href = payment.paymentUrl
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        // Error 409 — puede ser idempotencia o números reservados
        const message = getErrorMessage(err, 'payment')
        toast.error(message)
        // Si es error de números reservados, resetear selección
        if (message.toLowerCase().includes('número') || message.toLowerCase().includes('reserv')) {
          setSelectedNumbers(Array(ticketCount).fill(''))
        }
      } else {
        toastError(err, 'payment', 'No se pudo procesar la compra. Por favor intenta de nuevo.')
      }
      setIsProcessing(false)
    }
  }

  const handleReservationExpired = () => {
    setReservationExpiresAt(null)
    toast.warn('Tu reserva de números expiró. Por favor elige nuevos números.')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-8 md:py-16">
      <div className="mx-auto max-w-[600px]">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-6">
          <ArrowLeft className="size-4" />
          Volver
        </Link>

        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
          Confirmar compra
        </h1>
        <p className="text-text-secondary mb-8">
          Revisa tu orden y confirma tu participación
        </p>

        <div className="space-y-6">
          <OrderSummary
            raffleName={raffleTitle}
            ticketCount={ticketCount}
            bonusTickets={bonusTickets}
            unitPrice={unitPrice}
            totalPrice={totalPrice}
          />

          {/* Number selector grid — one slot per LuckyPass */}
          <Card variant="glass" className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="size-4 text-primary" />
              <span className="text-sm font-bold text-text-primary">Números de la suerte</span>
              <Badge variant="muted" className="ml-auto text-[10px]">1 — {maxTicketNumber.toLocaleString('es-CL')}</Badge>
            </div>

            {raffle && (
              <NumberSelectorGrid
                count={ticketCount}
                maxNumber={maxTicketNumber}
                raffleId={raffle.id}
                onChange={handleNumbersChange}
                onValidityChange={handleValidityChange}
              />
            )}
          </Card>

          <Card variant="glass-light" className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="muted">Método de pago</Badge>
            </div>
            <p className="text-sm text-text-secondary">
              Serás redirigido a la pasarela de pago segura para completar tu compra.
            </p>
          </Card>

          {reservationExpiresAt && (
            <ReservationTimer
              expiresAt={reservationExpiresAt}
              onExpired={handleReservationExpired}
            />
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleConfirm}
            loading={isProcessing}
            disabled={!raffle || !numbersValid}
          >
            <CreditCard className="size-4" />
            Confirmar y pagar ${totalPrice.toLocaleString('es-CL')}
          </Button>

          <p className="text-xs text-text-tertiary text-center">
            Pago 100% seguro. Puedes cancelar antes del sorteo.
          </p>
        </div>
      </div>
    </div>
  )
}
