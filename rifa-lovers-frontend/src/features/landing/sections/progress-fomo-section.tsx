import { useRef, useEffect } from 'react'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { gsap } from '@/lib/gsap'

export function ProgressFomoSection() {
  const { raffle, progress, isLoading } = useActiveRaffle()
  const barRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  const packsSold = progress?.packsSold ?? 0
  const goalPacks = raffle?.goalPacks ?? 1
  const remaining = Math.max(0, goalPacks - packsSold)
  const percentage = Math.min((packsSold / goalPacks) * 100, 100)

  useEffect(() => {
    const bar = barRef.current
    const indicator = indicatorRef.current
    const count = countRef.current
    if (!bar || !indicator || !count || isLoading || hasAnimated.current) return
    if (packsSold === 0) return

    hasAnimated.current = true

    gsap.fromTo(
      bar,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.8, ease: 'power2.out', delay: 0.3, transformOrigin: 'left center' }
    )

    gsap.fromTo(
      indicator,
      { left: '0%' },
      { left: `${percentage}%`, duration: 1.8, ease: 'power2.out', delay: 0.3 }
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
        {/* Progress bar */}
        <div className="rounded-2xl p-5 md:p-6 glass-light border border-border-light">
          {/* Stats row */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-0.5">
                Packs vendidos
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-text-primary">
                <span ref={countRef}>{packsSold.toLocaleString('es-CL')}</span>
                <span className="text-base md:text-lg font-medium text-text-secondary ml-1">
                  / {goalPacks.toLocaleString('es-CL')}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-0.5">
                Cupos restantes
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-primary">
                {remaining.toLocaleString('es-CL')}
              </p>
            </div>
          </div>

          {/* Bar */}
          <div className="relative h-4 rounded-full bg-border-light overflow-hidden">
            {/* Gradient fill */}
            <div
              ref={barRef}
              className="absolute inset-y-0 left-0 rounded-full gradient-rl transition-none"
              style={{
                width: '100%',
                transformOrigin: 'left center',
                transform: `scaleX(${percentage / 100})`,
              }}
            />
            {/* Position indicator */}
            <div
              ref={indicatorRef}
              className="absolute top-1/2 -translate-y-1/2 z-10"
              style={{ left: 0 }}
            >
              <div className="relative -translate-x-1/2">
                <div className="size-3.5 rounded-full bg-white shadow-md ring-[2.5px] ring-white/80" />
                <div className="absolute inset-0 size-3.5 rounded-full ring-2 ring-primary/20" />
              </div>
            </div>
          </div>

          {/* Percentage */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-secondary">
              {percentage.toFixed(1)}% completado
            </span>
            <span className="text-xs font-semibold text-primary">
              {remaining <= 500 ? `¡Últimos ${remaining} cupos!` : `${remaining.toLocaleString('es-CL')} disponibles`}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
