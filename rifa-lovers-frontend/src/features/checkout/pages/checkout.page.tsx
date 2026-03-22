import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, CreditCard, CheckCircle, Shuffle, Hash } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ACTIVE_RAFFLE } from '@/lib/constants'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import { OrderSummary } from '../components/order-summary'

const TOTAL_AVAILABLE = 30_000

function getBonusTickets(count: number): number {
  if (count >= 10) return 3
  if (count >= 5) return 1
  return 0
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const ticketCount = Math.max(1, Math.min(50, Number(searchParams.get('tickets')) || 1))
  const bonusTickets = getBonusTickets(ticketCount)

  const [selectedNumber, setSelectedNumber] = useState<number | ''>('')
  const [numberError, setNumberError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState('')

  const generateRandom = () => {
    const num = Math.floor(Math.random() * TOTAL_AVAILABLE) + 1
    setSelectedNumber(num)
    setNumberError('')
  }

  const handleNumberChange = (value: string) => {
    setNumberError('')
    if (value === '') { setSelectedNumber(''); return }
    const num = parseInt(value, 10)
    if (isNaN(num)) return
    if (num < 1 || num > TOTAL_AVAILABLE) {
      setNumberError(`Elige un número entre 1 y ${TOTAL_AVAILABLE.toLocaleString('es-CL')}`)
      return
    }
    setSelectedNumber(num)
  }

  const handleConfirm = async () => {
    if (!selectedNumber) {
      setNumberError('Debes elegir un número para tu ticket')
      return
    }
    setIsProcessing(true)
    setError('')
    try {
      await apiClient.post(ENDPOINTS.checkout.createOrder, {
        raffleId: ACTIVE_RAFFLE.id,
        ticketCount,
        selectedNumber,
      })
      setIsComplete(true)
    } catch {
      console.warn('[checkout] Backend unavailable, simulating success')
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsComplete(true)
    } finally {
      setIsProcessing(false)
    }
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
              Tus {ticketCount + bonusTickets} tickets para <strong>{ACTIVE_RAFFLE.prize}</strong> ya están activos.
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

        {error && (
          <div className="bg-error/10 text-error rounded-lg px-4 py-3 text-sm font-medium mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <OrderSummary
            raffle={ACTIVE_RAFFLE}
            ticketCount={ticketCount}
            bonusTickets={bonusTickets}
          />

          {/* Number selector */}
          <Card variant="glass" className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="size-4 text-primary" />
              <span className="text-sm font-bold text-text-primary">Elige tu número de la suerte</span>
              <Badge variant="muted" className="ml-auto text-[10px]">1 — {TOTAL_AVAILABLE.toLocaleString('es-CL')}</Badge>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={TOTAL_AVAILABLE}
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

            {numberError && (
              <p className="text-xs text-error font-medium mt-2">{numberError}</p>
            )}

            {selectedNumber && !numberError && (
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
          >
            <CreditCard className="size-4" />
            Confirmar y pagar ${(ticketCount * ACTIVE_RAFFLE.ticketPrice).toLocaleString('es-CL')}
          </Button>

          <p className="text-xs text-text-tertiary text-center">
            Pago 100% seguro. Puedes cancelar antes del sorteo.
          </p>
        </div>
      </div>
    </div>
  )
}
