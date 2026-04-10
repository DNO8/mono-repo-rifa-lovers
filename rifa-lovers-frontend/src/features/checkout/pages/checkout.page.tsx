import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'react-toastify'
import { ArrowLeft, CreditCard, CheckCircle, Shuffle, Hash } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PRICING_TIERS } from '@/lib/constants'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { Spinner } from '@/components/ui/spinner'
import { OrderSummary } from '../components/order-summary'

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const ticketCount = Math.max(1, Math.min(50, Number(searchParams.get('tickets')) || 1))
  const bonusTickets = 0

  const { raffle, isLoading } = useActiveRaffle()

  const [selectedNumber, setSelectedNumber] = useState<number | ''>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const raffleTitle = raffle?.title ?? 'Premio por confirmar'
  const goalPacks = raffle?.goalPacks ?? 5000
  const tier = PRICING_TIERS.find((t) => t.tickets === ticketCount) ?? PRICING_TIERS[0]
  const unitPrice = tier.price / tier.tickets
  const totalPrice = ticketCount * unitPrice

  const generateRandom = () => {
    const num = Math.floor(Math.random() * goalPacks) + 1
    setSelectedNumber(num)
  }

  const handleNumberChange = (value: string) => {
    if (value === '') { setSelectedNumber(''); return }
    const num = parseInt(value, 10)
    if (isNaN(num)) return
    if (num < 1 || num > goalPacks) {
      toast.error(`Elige un número entre 1 y ${goalPacks.toLocaleString('es-CL')}`)
      return
    }
    setSelectedNumber(num)
  }

  const handleConfirm = async () => {
    if (!raffle) return
    setIsProcessing(true)
    try {
      await apiClient.post(ENDPOINTS.checkout.createOrder, {
        raffleId: raffle.id,
        ticketCount,
        selectedNumber,
      })
      setIsComplete(true)
      toast.success('¡Compra exitosa!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al procesar la compra'
      toast.error(message)
    } finally {
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

  if (isComplete) {
    return (
      <div className="px-4 md:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-md text-center">
          <Card variant="soft-purple" className="p-10">
            <div className="size-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="size-8 text-success" />
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary mb-2">
              ¡Compra exitosa!
            </h1>
            <p className="text-text-secondary mb-2">
              Tus {ticketCount + bonusTickets} LuckyPass para <strong>{raffleTitle}</strong> ya están activos.
            </p>
            {selectedNumber && (
              <p className="text-lg font-bold text-primary mb-2">
                Tu número: #{String(selectedNumber).padStart(5, '0')}
              </p>
            )}
            <p className="text-sm text-text-tertiary mb-8">
              Recibirás un correo de confirmación con los detalles de tu participación.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/dashboard">
                <Button variant="primary" size="lg" className="w-full">
                  Ir al Dashboard
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="lg" className="w-full">
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </Card>
        </div>
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

          {/* Number selector */}
          <Card variant="glass" className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="size-4 text-primary" />
              <span className="text-sm font-bold text-text-primary">Elige tu número de la suerte</span>
              <Badge variant="muted" className="ml-auto text-[10px]">1 — {goalPacks.toLocaleString('es-CL')}</Badge>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={goalPacks}
                value={selectedNumber}
                onChange={(e) => handleNumberChange(e.target.value)}
                placeholder="Ej: 14582"
                className="flex-1 h-12 px-4 rounded-xl border border-border bg-white text-text-primary text-lg font-bold placeholder:text-text-tertiary placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                variant="secondary"
                size="lg"
                onClick={generateRandom}
                className="shrink-0"
              >
                <Shuffle className="size-4" />
                Aleatorio
              </Button>
            </div>

            {selectedNumber && (
              <p className="text-xs text-success font-medium mt-2">
                Número seleccionado: #{String(selectedNumber).padStart(5, '0')}
              </p>
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

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleConfirm}
            loading={isProcessing}
            disabled={!raffle}
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
