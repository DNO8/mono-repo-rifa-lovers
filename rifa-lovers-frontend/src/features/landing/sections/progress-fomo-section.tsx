import { useRef, useEffect } from 'react'
import { Flame, Clock, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { gsap } from '@/lib/gsap'

export function ProgressFomoSection() {
  const { raffle, progress, isLoading } = useActiveRaffle()
  const barRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  const packsSold = progress?.packsSold ?? 0
  const goalPacks = raffle?.goalPacks ?? 1
  const remaining = Math.max(0, goalPacks - packsSold)
  const percentage = Math.min((packsSold / goalPacks) * 100, 100)

  useEffect(() => {
    const bar = barRef.current
    const count = countRef.current
    if (!bar || !count || isLoading || hasAnimated.current) return
    if (packsSold === 0) return

    hasAnimated.current = true

    gsap.fromTo(
      bar,
      { width: '0%' },
      { width: `${percentage}%`, duration: 1.8, ease: 'power2.out', delay: 0.3 }
    )

    gsap.fromTo(
      { val: 0 },
      { val: packsSold },
      {
        duration: 1.8,
        ease: 'power2.out',
        delay: 0.3,
        onUpdate: function () {
          if (count) {
            count.textContent = Math.round(this.targets()[0].val).toLocaleString('es-CL')
          }
        },
      }
    )
  }, [isLoading, packsSold, percentage])

  if (isLoading) return null

  return (
    <section className="py-8 md:py-10 px-4 md:px-8">
      <div className="mx-auto max-w-[800px]">
        {/* Urgency badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <Badge variant="gradient" className="gap-1.5 text-xs">
            <Flame className="size-3" />
            Alta demanda
          </Badge>
          <Badge variant="outline-primary" className="gap-1.5 text-xs">
            <Clock className="size-3" />
            Cierre este viernes
          </Badge>
          <Badge variant="subtle" className="gap-1.5 text-xs">
            <TrendingUp className="size-3" />
            Precio sube pronto
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="rounded-2xl p-5 md:p-6 glass-light border border-border-light">
          {/* Stats row */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-0.5">
                Packs vendidos
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-text-primary">
                <span ref={countRef}>{packsSold.toLocaleString('es-CL')}</span>
                <span className="text-base md:text-lg font-medium text-text-tertiary ml-1">
                  / {goalPacks.toLocaleString('es-CL')}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-0.5">
                Cupos restantes
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-primary">
                {remaining.toLocaleString('es-CL')}
              </p>
            </div>
          </div>

          {/* Bar */}
          <div className="relative h-4 rounded-full bg-bg-muted overflow-hidden">
            <div
              ref={barRef}
              className="absolute inset-y-0 left-0 rounded-full gradient-rl transition-none"
              style={{ width: `${percentage}%` }}
            />
            {/* Shimmer */}
            <div
              className="absolute inset-y-0 left-0 rounded-full animate-pulse opacity-30"
              style={{
                width: `${percentage}%`,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
              }}
            />
          </div>

          {/* Percentage */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-tertiary">
              {percentage.toFixed(1)}% completado
            </span>
            <span className="text-xs font-semibold text-primary">
              {remaining <= 500 ? '⚡ ¡Últimos cupos!' : `${remaining.toLocaleString('es-CL')} disponibles`}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
