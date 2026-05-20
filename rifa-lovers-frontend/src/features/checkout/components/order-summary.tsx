import { Card } from '@/components/ui/card'

interface OrderSummaryProps {
  raffleName: string
  ticketCount: number
  bonusTickets: number
  unitPrice: number
  totalPrice: number
}

export function OrderSummary({ raffleName, ticketCount, bonusTickets, unitPrice, totalPrice }: OrderSummaryProps) {
  return (
    <Card variant="glass" className="p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4">Resumen de orden</h3>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Sorteo</span>
          <span className="font-medium text-text-primary">{raffleName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">LuckyPass</span>
          <span className="font-medium text-text-primary">{ticketCount}</span>
        </div>
        {bonusTickets > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-success">Bonus</span>
            <span className="font-medium text-success">+{bonusTickets} gratis 🎁</span>
          </div>
        )}
        <div className="flex justify-between text-sm mb-4">
          <span className="text-text-secondary">Precio por LuckyPass</span>
          <div className="text-right">
            <span className="block text-xs text-gray-400 line-through">
              ${Math.round(unitPrice * 1.25).toLocaleString('es-CL')} CLP
            </span>
            <span className="font-semibold">${unitPrice.toLocaleString('es-CL')} CLP</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border-light pt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-text-primary">Total</span>
          <span className="text-2xl font-extrabold text-text-primary">
            ${totalPrice.toLocaleString('es-CL')}
          </span>
        </div>
        <p className="text-xs text-text-tertiary mt-1">
          Total de LuckyPass: {ticketCount + bonusTickets}
        </p>
      </div>
    </Card>
  )
}
