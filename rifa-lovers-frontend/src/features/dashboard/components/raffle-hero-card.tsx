import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface RaffleCardData {
  id: string
  prize: string
  ticketCount: number
  uniqueId: string
  drawLabel: string
  drawTime: string
  drawDate: string
}

function useCountdown(targetDate: string) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) {
        setLabel('¡Ahora!')
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours < 24) {
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setLabel(`${hours}h ${mins}m`)
      } else {
        const days = Math.floor(hours / 24)
        setLabel(`${days} ${days === 1 ? 'día' : 'días'}`)
      }
    }

    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [targetDate])

  return label
}

export function RaffleHeroCard({ raffle }: { raffle: RaffleCardData }) {
  useCountdown(raffle.drawDate)

  return (
    <div className="glass-medium rounded-2xl p-6 md:p-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Left: raffle info */}
        <div className="flex-1">
          <Badge variant="gradient" className="mb-4">Premium Entry</Badge>

          <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight leading-tight mb-6">
            {raffle.prize}
          </h2>

          <div className="flex items-center gap-6 mb-6">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                LuckyPass
              </span>
              <span className="text-2xl font-extrabold text-text-primary">
                {String(raffle.ticketCount).padStart(2, '0')}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-secondary mb-0.5">
                ID Unica
              </span>
              <span className="text-2xl font-extrabold text-text-primary">
                {raffle.uniqueId}
              </span>
            </div>
          </div>

          <Link to={`/raffle/${raffle.id}`}>
            <Button variant="primary" size="lg">
              Ver Detalles de Rifa
              <ArrowRight className="size-4" />
            </Button> 
          </Link>
        </div>

        {/* Right: countdown card */}
        <div className="glass-light rounded-xl p-5 text-center shrink-0 min-w-[160px] border border-border-light">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">
            Próximo sorteo
          </span>
          <p className="text-lg font-extrabold text-text-primary">
            {raffle.drawLabel}
          </p>
          <p className="text-sm font-semibold text-primary">
            {raffle.drawTime}
          </p>
        </div>
      </div>
    </div>
  )
}
