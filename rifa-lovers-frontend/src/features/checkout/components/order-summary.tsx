import { Card } from '@/components/ui/card'
import type { Raffle } from '@/types/domain.types'

interface OrderSummaryProps {
  raffle: Raffle
  ticketCount: number
  bonusTickets: number
}

export function OrderSummary({ raffle, ticketCount, bonusTickets }: OrderSummaryProps) {
  const subtotal = ticketCount * raffle.ticketPrice
  const total = subtotal

  return (
    <Card variant="glass" className="p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4">Resumen de orden</h3>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Sorteo</span>
          <span className="font-medium text-text-primary">{raffle.prize}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Tickets</span>
          <span className="font-medium text-text-primary">{ticketCount}</span>
        </div>
        {bonusTickets > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-success">Bonus</span>
            <span className="font-medium text-success">+{bonusTickets} gratis 🎁</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Precio por ticket</span>
          <span className="font-medium text-text-primary">
            ${raffle.ticketPrice.toLocaleString('es-CL')}
          </span>
        </div>
      </div>

      <div className="border-t border-border-light pt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-text-primary">Total</span>
          <span className="text-2xl font-extrabold text-text-primary">
            ${total.toLocaleString('es-CL')}
          </span>
        </div>
        <p className="text-xs text-text-tertiary mt-1">
          Total de tickets: {ticketCount + bonusTickets}
        </p>
      </div>
    </Card>
  )
}
