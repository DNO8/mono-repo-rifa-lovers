import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { ACTIVE_RAFFLE } from '@/lib/constants'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

const QUICK_PICKS = [1, 3, 5, 10]

function getBonusTickets(count: number): number {
  if (count >= 10) return 3
  if (count >= 5) return 1
  return 0
}

export function TicketSelector() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [count, setCount] = useState(1)
  const bonus = getBonusTickets(count)
  const total = count * ACTIVE_RAFFLE.ticketPrice

  const increment = () => setCount((c) => Math.min(c + 1, 50))
  const decrement = () => setCount((c) => Math.max(c - 1, 1))

  const handleBuy = () => {
    const checkoutUrl = `/checkout?raffle=${ACTIVE_RAFFLE.id}&tickets=${count}`
    if (isAuthenticated) {
      navigate(checkoutUrl)
    } else {
      navigate(`/login?redirect=${encodeURIComponent(checkoutUrl)}`)
    }
  }

  return (
    <Card variant="glass" className="p-5 md:p-6">
      {/* Prize name + price header */}
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg text-text-primary mb-1">{ACTIVE_RAFFLE.prize}</h3>
        <span className="text-sm font-semibold text-primary">${ACTIVE_RAFFLE.ticketPrice.toLocaleString('es-CL')} por ticket</span>
      </div>

      {/* Progress */}
      <ProgressBar value={ACTIVE_RAFFLE.progress} showLabel className="mb-2" />
      <p className="text-xs text-text-tertiary text-center mb-5">
        {ACTIVE_RAFFLE.soldCount.toLocaleString('es-CL')} / {ACTIVE_RAFFLE.totalTickets.toLocaleString('es-CL')} vendidos
      </p>

      {/* Quick picks */}
      <div className="flex gap-2 mb-4">
        {QUICK_PICKS.map((pick) => (
          <button
            key={pick}
            onClick={() => setCount(pick)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-semibold transition-all border',
              count === pick
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white text-text-secondary border-border-light hover:border-primary/30 hover:text-primary'
            )}
          >
            {pick}
          </button>
        ))}
      </div>

      {/* Counter */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={decrement}
          disabled={count <= 1}
          className="size-10 rounded-full border border-border-light flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <Minus className="size-4" />
        </button>

        <div className="text-center min-w-[80px]">
          <span className="text-3xl font-extrabold text-text-primary">{count}</span>
          <span className="block text-xs text-text-tertiary">
            {count === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>

        <button
          onClick={increment}
          disabled={count >= 50}
          className="size-10 rounded-full border border-border-light flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* Bonus indicator */}
      {bonus > 0 && (
        <div className="bg-success/10 text-success rounded-lg px-3 py-2 text-sm font-medium text-center mb-4 animate-fade-in-up">
          🎁 +{bonus} {bonus === 1 ? 'ticket' : 'tickets'} de regalo
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm text-text-secondary">Total</span>
        <span className="text-xl font-extrabold text-text-primary">
          ${total.toLocaleString('es-CL')}
        </span>
      </div>

      {/* CTA */}
      <Button variant="primary" size="lg" className="w-full" onClick={handleBuy}>
        <ShoppingCart className="size-4" />
        Comprar {count + bonus} {count + bonus === 1 ? 'ticket' : 'tickets'}
      </Button>
    </Card>
  )
}
