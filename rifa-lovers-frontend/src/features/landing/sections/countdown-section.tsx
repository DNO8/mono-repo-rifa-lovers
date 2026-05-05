import { useEffect, useMemo, useRef, useState } from 'react'
import { Timer, Users, ChevronDown } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { Badge } from '@/components/ui/badge'
import { usePublicRaffles } from '@/hooks/use-raffles'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(targetMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="block text-4xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-none">
        {value}
      </span>
      <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">
        {label}
      </span>
    </div>
  )
}

function Dot() {
  return (
    <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-tertiary select-none leading-none">
      ·
    </span>
  )
}

export function CountdownSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { raffles, isLoading } = usePublicRaffles()
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null)
  const [time, setTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isClosed, setIsClosed] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const blocks = el.querySelectorAll<HTMLElement>('.countdown-block')
    gsap.set(blocks, { y: 30, opacity: 0, scale: 0.9 })

    const tween = gsap.to(blocks, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        once: true,
      },
    })

    return () => { tween.kill() }
  }, [])

  const activeRaffles = useMemo(() => raffles.filter(r => r.status === 'active'), [raffles])
  const closedRaffles = useMemo(() => raffles.filter(r => ['sold_out', 'closed', 'drawn'].includes(r.status)), [raffles])

  // Auto-select first active raffle or fallback to first closed; reset if selected no longer exists
  const selectedRaffle = useMemo(() => {
    if (selectedRaffleId) {
      const found = raffles.find(r => r.id === selectedRaffleId)
      if (found) return found
    }
    return activeRaffles[0] ?? closedRaffles[0] ?? null
  }, [raffles, activeRaffles, closedRaffles, selectedRaffleId])

  const targetMs = selectedRaffle?.endDate ? new Date(selectedRaffle.endDate).getTime() : null
  const showClosed = !isLoading && (selectedRaffle ? ['sold_out', 'closed', 'drawn'].includes(selectedRaffle.status) : false)

  useEffect(() => {
    if (targetMs === null) return
    const tick = () => {
      setTime(calcTimeLeft(targetMs))
      setIsClosed(targetMs <= Date.now())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetMs])

  const hasMultiple = activeRaffles.length > 1

  return (
    <section ref={sectionRef} className="py-8 md:py-12 px-4 md:px-8 border-y border-border-light bg-bg-white/60">
      <div className="mx-auto max-w-[900px]">
        {/* Header row: label + selector */}
        <div className="text-center mb-5">
          <p className="text-sm text-text-secondary mb-2">
            <Timer className="size-3.5 inline mr-1 -mt-0.5" />
            {showClosed ? 'El sorteo ha finalizado' : activeRaffles.length === 0 ? 'Próximamente' : 'Faltan para el sorteo en vivo'}
          </p>

          {hasMultiple && (
            <div className="inline-block relative">
              <select
                value={selectedRaffleId ?? activeRaffles[0]?.id ?? ''}
                onChange={e => setSelectedRaffleId(e.target.value)}
                className="appearance-none bg-bg-white border border-border-light rounded-lg px-3 py-1.5 pr-8 text-sm text-text-primary cursor-pointer hover:border-text-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {activeRaffles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title ?? 'Rifa sin título'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-text-tertiary pointer-events-none" />
            </div>
          )}
        </div>

        {/* Countdown / Closed / Upcoming */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-8 mb-5">
            <TimeBlock value="--" label="Días" /><Dot />
            <TimeBlock value="--" label="Horas" /><Dot />
            <TimeBlock value="--" label="Minutos" /><Dot />
            <TimeBlock value="--" label="Segundos" />
          </div>
        ) : showClosed || isClosed ? (
          <div className="flex flex-col items-center justify-center mb-5 countdown-block">
            {selectedRaffle?.title && (
              <span className="text-sm text-text-secondary mb-2">
                {selectedRaffle.title}
              </span>
            )}
            <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
              Rifa Cerrada
            </span>
          </div>
        ) : activeRaffles.length === 0 ? (
          <div className="flex items-center justify-center mb-5 countdown-block">
            <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
              Próximamente
            </span>
          </div>
        ) : targetMs !== null ? (
          <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-8 mb-5">
            <div className="countdown-block"><TimeBlock value={pad(time.days)} label="Días" /></div>
            <div className="countdown-block"><Dot /></div>
            <div className="countdown-block"><TimeBlock value={pad(time.hours)} label="Horas" /></div>
            <div className="countdown-block"><Dot /></div>
            <div className="countdown-block"><TimeBlock value={pad(time.minutes)} label="Minutos" /></div>
            <div className="countdown-block"><Dot /></div>
            <div className="countdown-block"><TimeBlock value={pad(time.seconds)} label="Segundos" /></div>
          </div>
        ) : (
          <div className="flex items-center justify-center mb-5 countdown-block">
            <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
              Próximamente
            </span>
          </div>
        )}

        {/* Bottom row — only shown when an active raffle is running */}
        {!showClosed && activeRaffles.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                <span className="text-base">🧑🏻</span>
                <span className="text-base">👩🏽</span>
                <span className="text-base">🧑🏼</span>
                <span className="text-base">👩🏻</span>
              </div>
              <span className="text-xs text-text-secondary">
                <Users className="size-3 inline mr-0.5" />
                Miles de personas ya participando en tiempo real
              </span>
            </div>
            <Badge variant="gradient" className="text-xs px-3 py-1 gap-1 shrink-0">
              Últimos LuckyPass disponibles
            </Badge>
          </div>
        )}
      </div>
    </section>
  )
}
