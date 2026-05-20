import { ArrowRight, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSelectedRaffle } from '@/context/use-selected-raffle'
import { scrollToPricing } from '@/lib/utils'

export function HeroContentOverlay() {
  const { raffle, progress } = useSelectedRaffle()

  const remaining = raffle && progress
    ? Math.max(0, raffle.goalPacks - progress.packsSold)
    : 0

  const drawDate = raffle?.endDate
    ? new Date(raffle.endDate).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
    : null
  const drawTime = raffle?.endDate
    ? new Date(raffle.endDate).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="w-full">
      <div className="w-full py-8 lg:py-24">
        <div className="hero-fade-up" style={{ animationDelay: '0.2s' }}>
          <Badge variant="gradient" className="mb-5 pointer-events-auto text-[10px] sm:text-xs px-2 py-1">
            <div className="size-2 rounded-full bg-error animate-pulse" />
            CUPOS LIMITADOS — SORTEO EN VIVO
          </Badge>
        </div>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.5rem] xl:text-6xl leading-[1.1] tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          <span className="block text-white hero-fade-up" style={{ animationDelay: '0.3s' }}>
            Tu MacBook M5 te está esperando
          </span>
          <span
            className="block bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent hero-fade-up"
            style={{ animationDelay: '0.5s', filter: 'drop-shadow(0 0 12px rgba(255,77,166,0.5))' }}
          >
            desde $2.990
          </span>
        </h1>

        <p
          className="text-sm md:text-base text-white/80 max-w-lg mb-2 leading-relaxed hero-fade-up"
          style={{ animationDelay: '0.4s', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
        >
          Solo{' '}
          <span className="font-bold text-white">{remaining.toLocaleString('es-CL')} cupos</span>{' '}
          restantes. Cada LuckyPass te acerca al premio —{' '}
          <span className="font-bold text-secondary">no te quedes fuera</span>.
        </p>

        <p
          className="text-sm md:text-base text-white/80 max-w-lg mb-5 leading-relaxed hero-fade-up"
          style={{ animationDelay: '0.55s', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
        >
          Y ayudas a los niños de la{' '}
          <span className="font-semibold text-white">Fundación Niño y Cáncer</span> 💜
        </p>

        {drawDate && (
          <div className="flex items-center gap-2 mb-5 text-sm hero-fade-up" style={{ animationDelay: '0.65s', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}>
            <CalendarClock className="size-4 text-primary" />
            <span className="text-white font-semibold">
              Sorteo en vivo — {drawDate}{drawTime ? ` a las ${drawTime}` : ''}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-2 hero-fade-up" style={{ animationDelay: '0.8s' }}>
          <Button variant="primary" size="lg" onClick={scrollToPricing} className="pointer-events-auto">
            Asegurar mi lugar
            <ArrowRight className="size-4" />
          </Button>
          <a
            href="https://www.facebook.com/profile.php?id=61572258592880"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex items-center gap-2 px-6 py-2.5 bg-white/15 border border-white/25 rounded-full text-white text-sm font-semibold backdrop-blur-sm hover:bg-white/25 transition-all duration-200 cursor-pointer group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Ver sorteo en vivo
          </a>
        </div>
      </div>
    </div>
  )
}
