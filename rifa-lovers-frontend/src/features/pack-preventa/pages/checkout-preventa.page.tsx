import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'react-toastify'
import { ArrowLeft, Gift } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createFreePurchase } from '@/api/purchases.api'
import { ApiError } from '@/api/client'
import { toastError } from '@/lib/errors'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { usePacks } from '@/hooks/use-packs'
import { Spinner } from '@/components/ui/spinner'
import { OrderSummary } from '@/features/checkout/components/order-summary'
import { NumberSelectorGrid } from '@/features/checkout/components/number-selector-grid'

export default function CheckoutPreventaPage() {
  const [searchParams] = useSearchParams()
  const packIdParam = searchParams.get('packId') || ''
  const bonusTickets = 0

  const { raffle, isLoading: raffleLoading } = useActiveRaffle()
  const { packs, isLoading: packsLoading } = usePacks()

  const [selectedNumbers, setSelectedNumbers] = useState<(number | '')[]>([])
  const [numbersValid, setNumbersValid] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const isLoading = raffleLoading || packsLoading

  const tier = packs.find((p) => p.id === packIdParam)

  const raffleTitle = raffle?.title ?? 'Premio por confirmar'
  const maxTicketNumber = raffle?.maxTicketNumber ?? 30000
  const ticketCount = tier?.luckyPassQuantity ?? 1
  const unitPrice = tier?.price ?? 0
  const totalPrice = 0

  const handleNumbersChange = (nums: (number | '')[]) => setSelectedNumbers(nums)
  const handleValidityChange = (valid: boolean) => setNumbersValid(valid)

  const handleConfirm = async () => {
    if (!raffle || !tier) return
    if (!numbersValid) {
      toast.error('Uno o más números elegidos no están disponibles. Corrígelos antes de continuar.')
      return
    }
    setIsProcessing(true)
    try {
      // Filtrar los números no vacíos para enviar al backend
      const filledNumbers = selectedNumbers.filter((n): n is number => n !== '')

      // Crear la compra gratuita
      await createFreePurchase({
        raffleId: raffle.id,
        packId: tier.id,
        quantity: 1,
        selectedNumbers: filledNumbers.length > 0 ? filledNumbers : undefined,
      })

      toast.success('¡Participación confirmada! Tus LuckyPasses han sido generados.')
      
      // Redirigir al dashboard
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error(err.getUserMessage('general') || 'Ya tienes este pack preventa.')
      } else {
        toastError(err, 'payment', 'No se pudo procesar la participación. Por favor intenta de nuevo.')
      }
      setIsProcessing(false)
    }
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
        <Link to="/pack-preventa" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-6">
          <ArrowLeft className="size-4" />
          Volver
        </Link>

        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
          Confirmar participación gratuita
        </h1>
        <p className="text-text-secondary mb-8">
          Revisa tu orden y confirma tu participación en el sorteo exclusivo SYS
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
              <Gift className="size-4 text-primary" />
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
              <Badge variant="muted">Participación</Badge>
            </div>
            <p className="text-sm text-text-secondary">
              Esta participación es gratuita. No se realizará ningún cargo.
            </p>
          </Card>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleConfirm}
            loading={isProcessing}
            disabled={!raffle || !numbersValid}
          >
            <Gift className="size-4" />
            Confirmar participación gratuita
          </Button>

          <p className="text-xs text-text-tertiary text-center">
            Participación 100% gratuita. Tus LuckyPasses serán generados inmediatamente.
          </p>
        </div>
      </div>
    </div>
  )
}
